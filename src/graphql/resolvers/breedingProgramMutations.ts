import { Transaction } from 'sequelize';
import { Op } from 'sequelize';
import { UserInputError, ForbiddenError, ApolloError } from 'apollo-server-express';
import { checkAuth } from '../../utils/auth';
import Logger from '../../utils/logger';
import { LogLevel } from '../../db/models/SystemLog';
import { AuditAction } from '../../db/models/AuditLog';
import { BreedingProgramStatus } from '../../db/models/BreedingProgram';
import { BreedingPairStatus } from '../../db/models/BreedingPair';
import db from '../../db/models';

// Utility function to convert a string ID to a number, throwing an error for null or invalid inputs
export const toNumericId = (id: string | number | null): number => {
  if (id === null) {
    throw new UserInputError('ID cannot be null');
  }
  
  if (typeof id === 'string') {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new UserInputError('Invalid ID format: must be a valid numeric string or number');
    }
    return numericId;
  }
  
  return id;
};

// Type aliases for better readability
const { BreedingProgram, BreedingPair, Dog, Owner, BreedingRecord, BreedingProgramFoundationDog, sequelize } = db;

/**
 * Breeding Program Mutations
 */
export const breedingProgramMutations = {
  /**
   * Create a new breeding program
   */
  createBreedingProgram: async (
    _: any,
    { input }: { 
      input: {
        name: string;
        description: string;
        breederId: string;
        breed: string;
        goals: string[];
        startDate: Date;
        endDate?: Date;
        geneticTestingProtocol?: string;
        selectionCriteria?: string;
        notes?: string;
        isPublic: boolean;
        imageUrl?: string;
        foundationDogIds: string[];
      }
    },
    context: any
  ) => {
    const transaction = await sequelize.transaction();
    try {
      // Authenticate user
      const user = await checkAuth(context);

      // Validate input
      if (!input.name.trim()) {
        throw new UserInputError('Program name cannot be empty');
      }

      if (!input.description.trim()) {
        throw new UserInputError('Program description cannot be empty');
      }

      // Ensure breeder exists with support for both UUID and legacy numeric IDs
      let breeder;
      const breederNumericId = toNumericId(input.breederId);
      if (!isNaN(breederNumericId)) {
        // Fallback for legacy numeric IDs
        breeder = await Owner.findByPk(breederNumericId);
      } else {
        // Use a proper type-safe comparison with id as a string
        breeder = await Owner.findOne({ where: { id: String(input.breederId) } });
      }

      if (!breeder) {
        throw new UserInputError(`Breeder with ID ${input.breederId} not found`);
      }


      // Ensure all foundation dogs exist with support for both UUID and legacy numeric IDs
      const foundationDogIds = input.foundationDogIds.map(dogId => toNumericId(dogId));

      const foundationDogs = await Dog.findAll({
        where: {
          id: { [Op.in]: foundationDogIds }
        }
      });

      if (foundationDogs.length !== input.foundationDogIds.length) {
        // Find which specific dogs are missing
        const missingDogs = input.foundationDogIds.filter(
          dogId => !foundationDogs.some(dog => 
            toNumericId(dog.id) === toNumericId(dogId)
          )
        );
        throw new UserInputError(`The following foundation dogs do not exist: ${missingDogs.join(', ')}`);
      }

      // Ensure startDate is a valid Date object
      const startDate = input.startDate ? new Date(input.startDate) : new Date();
      if (isNaN(startDate.getTime())) {
        throw new UserInputError('Invalid start date');
      }

      // Ensure endDate is a valid Date object if provided
      let endDate = null;
      if (input.endDate) {
        endDate = new Date(input.endDate);
        if (isNaN(endDate.getTime())) {
          throw new UserInputError('Invalid end date');
        }
        
        // Ensure endDate is after startDate
        if (endDate < startDate) {
          throw new UserInputError('End date must be after start date');
        }
      }

      // Create the breeding program
      const program = await BreedingProgram.create(
        {
          name: input.name,
          description: input.description,
          breederId: toNumericId(breeder.id),  // Convert breeder ID to numeric
          breed: input.breed,
          goals: input.goals,
          startDate: startDate,
          endDate: endDate || undefined,
          status: BreedingProgramStatus.PLANNING,
          geneticTestingProtocol: input.geneticTestingProtocol,
          selectionCriteria: input.selectionCriteria,
          notes: input.notes,
          isPublic: input.isPublic,
          imageUrl: input.imageUrl
        },
        { transaction }
      );

      // Create foundation dog associations
      const foundationDogAssociations = foundationDogIds.map(dogId => ({
        breedingProgramId: toNumericId(program.id),
        dogId: toNumericId(dogId)
      }));

      await BreedingProgramFoundationDog.bulkCreate(foundationDogAssociations, { transaction });

      // Log the action - system event
      await Logger.logSystemEvent(
        `Breeding program created with ID ${program.id}`,
        LogLevel.INFO,
        'breedingProgramMutations.createBreedingProgram',
        `Program: ${program.name} (${program.id}) with ${foundationDogAssociations.length} foundation dogs`,
        undefined,
        user.id,
        context.req?.ip
      );
      
      // Log the action - audit trail
      await Logger.logAuditTrail(
        AuditAction.CREATE,
        'BreedingProgram',
        program.id.toString(),
        user.id,
        undefined,
        JSON.stringify({
          name: program.name,
          description: program.description,
          breederId: program.breederId,
          breed: program.breed,
          foundationDogIds: input.foundationDogIds
        }),
        context.req?.ip,
        `Breeding program "${program.name}" created with ${foundationDogAssociations.length} foundation dogs`
      );

      await transaction.commit();
      return program;
    } catch (error) {
      await transaction.rollback();
      console.error('Error creating breeding program:', error);
      throw error;
    }
  },

  /**
   * Update an existing breeding program
   */
  updateBreedingProgram: async (
    _: any,
    { 
      id, 
      input 
    }: { 
      id: string;
      input: {
        name?: string;
        description?: string;
        breed?: string;
        goals?: string[];
        startDate?: Date;
        endDate?: Date;
        status?: BreedingProgramStatus;
        geneticTestingProtocol?: string;
        selectionCriteria?: string;
        notes?: string;
        isPublic?: boolean;
        imageUrl?: string;
        foundationDogIds?: string[];
      }
    },
    context: any
  ) => {
    const transaction = await sequelize.transaction();
    try {
      // Authenticate user
      const user = await checkAuth(context);

      // Fetch the program with support for both UUID and legacy numeric IDs
      let program;
      const numericId = toNumericId(id);
      if (!isNaN(numericId)) {
        // Fallback for any existing numeric IDs during migration
        program = await BreedingProgram.findByPk(numericId, { transaction });
      } else {
        program = await BreedingProgram.findOne({ 
          where: { id }, 
          transaction 
        });
      }

      if (!program) {
        throw new UserInputError(`Breeding program with ID ${id} not found`);
      }

      // Check permissions - only admins or the breeder themselves can update a program
      const breeder = await Owner.findByPk(program.breederId);

      // Validate date fields if provided
      if (input.startDate) {
        const startDate = new Date(input.startDate);
        if (isNaN(startDate.getTime())) {
          throw new UserInputError('Invalid start date');
        }
        program.startDate = startDate;
      }

      if (input.endDate !== undefined) {
        if (input.endDate === null) {
          program.endDate = undefined;
        } else {
          const endDate = new Date(input.endDate);
          if (isNaN(endDate.getTime())) {
            throw new UserInputError('Invalid end date');
          }
          
          // Ensure endDate is after startDate
          if (endDate < program.startDate) {
            throw new UserInputError('End date must be after start date');
          }
          program.endDate = endDate;
        }
      }

      // Update text fields if provided
      if (input.name !== undefined && input.name.trim()) {
        program.name = input.name;
      }
      
      if (input.description !== undefined && input.description.trim()) {
        program.description = input.description;
      }
      
      if (input.breed !== undefined) {
        program.breed = input.breed;
      }
      
      if (input.goals !== undefined) {
        program.goals = input.goals;
      }
      
      if (input.status !== undefined) {
        program.status = input.status;
      }
      
      if (input.geneticTestingProtocol !== undefined) {
        program.geneticTestingProtocol = input.geneticTestingProtocol;
      }
      
      if (input.selectionCriteria !== undefined) {
        program.selectionCriteria = input.selectionCriteria;
      }
      
      if (input.notes !== undefined) {
        program.notes = input.notes;
      }
      
      if (input.isPublic !== undefined) {
        program.isPublic = input.isPublic;
      }
      
      if (input.imageUrl !== undefined) {
        program.imageUrl = input.imageUrl;
      }

      // Save the updated program
      const previousState = JSON.stringify(program.get());
      await program.save({ transaction });

      // Update foundation dogs if provided
      if (input.foundationDogIds !== undefined) {
        // Ensure all foundation dogs exist with support for both UUID and legacy numeric IDs
        const foundationDogIds = input.foundationDogIds.map(dogId => toNumericId(dogId));

        const foundationDogs = await Dog.findAll({
          where: {
            id: { [Op.in]: foundationDogIds }
          }
        });

        if (foundationDogs.length !== input.foundationDogIds.length) {
          // Find which specific dogs are missing
          const missingDogs = input.foundationDogIds.filter(
            dogId => !foundationDogs.some(dog => 
              toNumericId(dog.id) === toNumericId(dogId)
            )
          );
          throw new UserInputError(`The following foundation dogs do not exist: ${missingDogs.join(', ')}`);
        }

        // Remove existing associations
        await BreedingProgramFoundationDog.destroy({
          where: {
            breedingProgramId: program.id
          },
          transaction
        });

        // Create new associations
        const foundationDogAssociations = foundationDogIds.map(dogId => ({
          breedingProgramId: toNumericId(program.id),
          dogId: toNumericId(dogId)
        }));

        await BreedingProgramFoundationDog.bulkCreate(foundationDogAssociations, { transaction });
      }

      // Track foundation dog changes for logging
      let foundationDogChanges = input.foundationDogIds ? 
        `Updated foundation dogs (${input.foundationDogIds.length} dogs)` : "";

      // Log the system event
      await Logger.logSystemEvent(
        `Breeding program updated with ID ${program.id}`,
        LogLevel.INFO,
        'breedingProgramMutations.updateBreedingProgram',
        `Program: ${program.name} (${program.id}) ${foundationDogChanges}`,
        undefined,
        user.id,
        context.req?.ip
      );
      
      // Log the audit trail
      await Logger.logAuditTrail(
        AuditAction.UPDATE,
        'BreedingProgram',
        program.id.toString(),
        user.id,
        previousState,
        JSON.stringify(program),
        context.req?.ip,
        `Breeding program "${program.name}" updated ${foundationDogChanges}`
      );

      await transaction.commit();

      // Return the updated program with associations
      return BreedingProgram.findByPk(id, {
        include: [
          {
            model: Owner,
            as: 'breeder'
          },
          {
            model: Dog,
            as: 'foundationDogs'
          },
          {
            model: BreedingPair,
            as: 'breedingPairs'
          }
        ]
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error updating breeding program:', error);
      throw error;
    }
  },

  /**
   * Delete a breeding program
   */
  deleteBreedingProgram: async (
    _: any,
    { id }: { id: string },
    context: any
  ) => {
    const transaction = await sequelize.transaction();
    try {
      // Authenticate user
      const user = await checkAuth(context);

      // Fetch the program with support for both UUID and legacy numeric IDs
      let program;
      const numericId = toNumericId(id);
      if (!isNaN(numericId)) {
        // Fallback for any existing numeric IDs during migration
        program = await BreedingProgram.findByPk(numericId, { transaction });
      } else {
        program = await BreedingProgram.findOne({ 
          where: { id }, 
          transaction 
        });
      }

      if (!program) {
        throw new UserInputError(`Breeding program with ID ${id} not found`);
      }

      // Check permissions - only admins or the breeder themselves can delete a program
      const breeder = await Owner.findByPk(program.breederId);

      // Store program details for logging
      const programDetails = JSON.stringify(program);
      const programName = program.name;

      // Delete the program (cascades to foundation dogs and breeding pairs)
      await program.destroy({ transaction });

      // Log system event
      await Logger.logSystemEvent(
        `Breeding program deleted with ID ${id}`,
        LogLevel.INFO,
        'breedingProgramMutations.deleteBreedingProgram',
        `Program: ${programName} (${id}) has been removed with all related breeding pairs`,
        undefined,
        user.id,
        context.req?.ip
      );
      
      // Log audit trail
      await Logger.logAuditTrail(
        AuditAction.DELETE,
        'BreedingProgram',
        id.toString(),
        user.id,
        programDetails,
        undefined,
        context.req?.ip,
        `Breeding program "${programName}" permanently deleted with all associated breeding pairs`
      );

      await transaction.commit();

      return {
        success: true,
        message: `Breeding program "${programName}" successfully deleted`
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error deleting breeding program:', error);
      throw error;
    }
  }
};
