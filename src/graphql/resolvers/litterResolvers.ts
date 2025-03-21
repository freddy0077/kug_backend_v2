import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Sequelize, Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import db from '../../db/models';
import { LitterAttributes } from '../../db/models/Litter';
import { Context } from './types';

// Define gender validation function locally since it doesn't exist in utils yet
const validateDogGender = (gender: string): string => {
  // Normalize to lowercase to match database convention
  const normalizedGender = gender.trim().toLowerCase();
  
  if (normalizedGender !== 'male' && normalizedGender !== 'female') {
    throw new Error(`Invalid gender: ${gender}. Must be either 'male' or 'female'`);
  }
  
  return normalizedGender;
};

// Helper function to generate a unique registration number for litters in KUG-L format
async function generateLitterRegistrationNumber(): Promise<string> {
  // Get the highest current number
  const maxLitter = await db.Litter.findOne({
    order: [['registrationNumber', 'DESC']],
    where: {
      registrationNumber: {
        [Op.like]: 'KUG-L %'
      }
    }
  });
  
  let nextNumber = 1; // Default starting number
  
  if (maxLitter && maxLitter.registrationNumber) {
    // Extract the numeric part and increment
    const matches = maxLitter.registrationNumber.match(/KUG-L (\d+)/);
    if (matches && matches[1]) {
      const currentNumber = parseInt(matches[1], 10);
      nextNumber = isNaN(currentNumber) ? 1 : currentNumber + 1;
    }
  }
  
  // Format with leading zeros to 5 digits
  return `KUG-L ${nextNumber.toString().padStart(5, '0')}`;
};

// Extended interface for LitterInput that includes puppyDetails
interface LitterInput extends LitterAttributes {
  puppyDetails?: Array<{
    name: string;
    gender: string;
    color?: string;
    markings?: string;
    microchipNumber?: string;
    isCollapsed?: boolean;
  }>;
}

// Litter Query Resolvers
const litterQueries = {
  litters: async (
    _: any,
    {
      offset = 0,
      limit = 20,
      ownerId,
      breedId,
      fromDate,
      toDate,
      searchTerm,
    }: {
      offset?: number;
      limit?: number;
      ownerId?: string;
      breedId?: string;
      fromDate?: Date;
      toDate?: Date;
      searchTerm?: string;
    },
    context: Context
  ) => {
    try {
      // Optional: Check authentication if required
      // if (!context.user) throw new AuthenticationError('You must be logged in to view litters');

      const where: any = {};

      // Apply ownerId filter if specified - this would require a join with dogs via ownerships
      // This is a more complex query that would require custom SQL or join logic
      // The implementation details would depend on how you want to filter by owner

      // Filter by breed through sire/dam
      if (breedId) {
        // This would require joining with the Dogs table
        // Simplified approach - in a real implementation, you'd use more efficient joins
        const dogsOfBreed = await db.Dog.findAll({
          where: {
            breedId,
          },
          attributes: ['id'],
        });
        
        const dogIds = dogsOfBreed.map((dog: any) => dog.id);
        
        if (dogIds.length === 0) {
          // Return empty result if no dogs of this breed exist
          return {
            totalCount: 0,
            hasMore: false,
            items: [],
          };
        }
        
        where[Op.or] = [
          { sireId: { [Op.in]: dogIds } },
          { damId: { [Op.in]: dogIds } },
        ];
      }

      // Filter by date range
      if (fromDate) {
        where.whelpingDate = {
          ...where.whelpingDate,
          [Op.gte]: fromDate,
        };
      }

      if (toDate) {
        where.whelpingDate = {
          ...where.whelpingDate,
          [Op.lte]: toDate,
        };
      }

      // Search by litter name or registration number
      if (searchTerm) {
        where[Op.or] = [
          { litterName: { [Op.iLike]: `%${searchTerm}%` } },
          { registrationNumber: { [Op.iLike]: `%${searchTerm}%` } },
        ];
      }

      // Count total matching records
      const totalCount = await db.Litter.count({ where });

      // Fetch paginated results
      const litters = await db.Litter.findAll({
        where,
        limit,
        offset,
        order: [['whelpingDate', 'DESC']],
      });

      return {
        totalCount,
        hasMore: offset + limit < totalCount,
        items: litters,
      };
    } catch (error) {
      console.error('Error in litters query:', error);
      throw error;
    }
  },

  litter: async (_: any, { id }: { id: string }) => {
    try {
      const litter = await db.Litter.findByPk(id);
      if (!litter) {
        throw new UserInputError(`Litter with ID ${id} not found`);
      }
      return litter;
    } catch (error) {
      console.error('Error in litter query:', error);
      throw error;
    }
  },

  dogLitters: async (
    _: any,
    {
      dogId,
      role = 'BOTH',
      offset = 0,
      limit = 20,
    }: {
      dogId: string;
      role?: 'SIRE' | 'DAM' | 'BOTH';
      offset?: number;
      limit?: number;
    }
  ) => {
    try {
      const where: any = {};

      // Apply role filter
      if (role === 'SIRE') {
        where.sireId = dogId;
      } else if (role === 'DAM') {
        where.damId = dogId;
      } else {
        // BOTH
        where[Op.or] = [{ sireId: dogId }, { damId: dogId }];
      }

      // Count total matching records
      const totalCount = await db.Litter.count({ where });

      // Fetch paginated results
      const litters = await db.Litter.findAll({
        where,
        limit,
        offset,
        order: [['whelpingDate', 'DESC']],
      });

      return {
        totalCount,
        hasMore: offset + limit < totalCount,
        items: litters,
      };
    } catch (error) {
      console.error('Error in dogLitters query:', error);
      throw error;
    }
  },
};

// Litter Mutation Resolvers
const litterMutations = {
  createLitter: async (
    _: any,
    { input }: { input: LitterInput },
    context: Context
  ) => {
    try {
      // Optional: Check authentication if required
      // if (!context.user) throw new AuthenticationError('You must be logged in to create a litter');

      // Validate required fields
      const { 
        sireId, 
        damId, 
        litterName, 
        whelpingDate, 
        totalPuppies 
      } = input;

      if (!sireId || !damId) {
        throw new UserInputError('Sire and dam must be specified');
      }

      // Verify sire and dam exist
      const sire = await db.Dog.findByPk(sireId);
      if (!sire) {
        throw new UserInputError(`Sire with ID ${sireId} not found`);
      }

      const dam = await db.Dog.findByPk(damId);
      if (!dam) {
        throw new UserInputError(`Dam with ID ${damId} not found`);
      }

      // Verify genders (sire must be male, dam must be female)
      if (sire.gender !== 'male') {
        throw new UserInputError('Sire must be a male dog');
      }

      if (dam.gender !== 'female') {
        throw new UserInputError('Dam must be a female dog');
      }

      // Generate a registration number if not provided
      let registrationNumber = input.registrationNumber && input.registrationNumber.trim() !== '' 
        ? input.registrationNumber 
        : await generateLitterRegistrationNumber();

      // Create the litter record
      const newLitter = await db.Litter.create({
        id: uuidv4(),
        sireId,
        damId,
        litterName,
        registrationNumber,
        breedingRecordId: input.breedingRecordId && input.breedingRecordId.trim() !== '' ? input.breedingRecordId : undefined, // Convert empty string to undefined
        whelpingDate,
        totalPuppies,
        malePuppies: input.malePuppies || 0,
        femalePuppies: input.femalePuppies || 0,
        notes: input.notes,
      });

      // If puppy details are provided, create them right away
      console.log(`Creating litter ${litterName} with puppy details:`, input.puppyDetails || 'No puppy details provided');
      
      if (input.puppyDetails && input.puppyDetails.length > 0) {
        // Prepare puppies for creation
        const puppies = await Promise.all(input.puppyDetails.map(async (puppy: any, index: number) => {
          // Generate a unique registration number for each puppy
          const puppyNumber = (index + 1).toString().padStart(2, '0');
          const puppyRegistrationNumber = `${newLitter.registrationNumber}-P${puppyNumber}`;
          
          return {
            id: uuidv4(),
            name: puppy.name,
            breed: sire.breed, // Inherit breed from parents
            breedId: sire.breedId,
            gender: validateDogGender(puppy.gender), 
            dateOfBirth: new Date(whelpingDate), // Use the litter's whelping date
            color: puppy.color || null,
            microchipNumber: puppy.microchipNumber || null,
            registrationNumber: puppyRegistrationNumber,
            litterId: newLitter.id,
            sireId,
            damId,
            approvalStatus: 'PENDING', // Add default approval status
          };
        }));

        console.log(`Creating ${puppies.length} puppies for litter ${newLitter.id}`);
        await db.Dog.bulkCreate(puppies);
        console.log('Puppies created successfully');
      } else {
        console.log(`No puppies were created for litter ${newLitter.id} because no puppy details were provided`);
      }

      return newLitter;
    } catch (error) {
      console.error('Error in createLitter mutation:', error);
      throw error;
    }
  },

  updateLitter: async (
    _: any,
    { id, input }: { id: string; input: Partial<LitterInput> },
    context: Context
  ) => {
    try {
      // Optional: Check authentication if required
      // if (!context.user) throw new AuthenticationError('You must be logged in to update a litter');

      // Check if litter exists
      const litter = await db.Litter.findByPk(id);
      if (!litter) {
        throw new UserInputError(`Litter with ID ${id} not found`);
      }

      // Update litter fields
      await litter.update(input);

      return litter;
    } catch (error) {
      console.error('Error in updateLitter mutation:', error);
      throw error;
    }
  },

  registerLitterPuppies: async (
    _: any,
    { input }: { input: { litterId: string; puppies: any[] } },
    context: Context
  ) => {
    try {
      // Optional: Check authentication if required
      // if (!context.user) throw new AuthenticationError('You must be logged in to register litter puppies');

      const { litterId, puppies } = input;

      // Verify litter exists
      const litter = await db.Litter.findByPk(litterId);
      if (!litter) {
        throw new UserInputError(`Litter with ID ${litterId} not found`);
      }

      // Fetch sire and dam for breed information
      const sire = await db.Dog.findByPk(litter.sireId);
      const dam = await db.Dog.findByPk(litter.damId);

      if (!sire || !dam) {
        throw new Error('Cannot find litter parents');
      }

      // First, get current number of puppies in this litter to calculate proper sequence numbers
      const existingPuppiesCount = await db.Dog.count({
        where: { litterId: litter.id }
      });

      // Create puppy records with sequential registration numbers
      const puppyRecords = await Promise.all(puppies.map(async (puppy, index) => {
        // Generate a unique registration number for each puppy that continues the sequence
        const puppyNumber = (existingPuppiesCount + index + 1).toString().padStart(2, '0');
        const puppyRegistrationNumber = `${litter.registrationNumber}-P${puppyNumber}`;

        return {
          id: uuidv4(),
          name: puppy.name,
          breed: sire.breed, // Inherit breed from parents
          breedId: sire.breedId,
          gender: validateDogGender(puppy.gender),
          dateOfBirth: new Date(litter.whelpingDate), // Use the litter's whelping date
          color: puppy.color || null,
          microchipNumber: puppy.microchipNumber || null,
          registrationNumber: puppyRegistrationNumber,
          isNeutered: puppy.isNeutered || false,
          litterId: litter.id,
          sireId: litter.sireId,
          damId: litter.damId,
          approvalStatus: 'PENDING', // Add default approval status
        };
      }));

      const createdPuppies = await db.Dog.bulkCreate(puppyRecords);

      // If owner is specified for puppies, create ownership records
      const ownershipPromises = puppies
        .filter((puppy) => puppy.ownerId)
        .map((puppy, index) => {
          return db.Ownership.create({
            id: uuidv4(),
            dogId: createdPuppies[index].id,
            ownerId: puppy.ownerId,
            startDate: new Date(),
            isCurrent: true, // Using isCurrent as per the model definition, but noting that in the DB it's stored as is_current
          });
        });

      if (ownershipPromises.length > 0) {
        await Promise.all(ownershipPromises);
      }

      return {
        success: true,
        message: `Successfully registered ${createdPuppies.length} puppies from litter ${litter.litterName}`,
        puppies: createdPuppies,
      };
    } catch (error) {
      console.error('Error in registerLitterPuppies mutation:', error);
      throw error;
    }
  },
};

// Litter Field Resolvers
const Litter = {
  sire: async (parent: LitterAttributes) => {
    if (!parent.sireId) {
      console.warn(`Litter ${parent.id} has no sireId`);
      // Now that sire is nullable in the schema, we can return null
      return null;
    }
    
    const sire = await db.Dog.findByPk(parent.sireId);
    if (!sire) {
      console.warn(`Sire dog with ID ${parent.sireId} not found for litter ${parent.id}`);
      // Now that sire is nullable in schema, we can return null for not found dogs
      return null;
    }
    return sire;
  },
  dam: async (parent: LitterAttributes) => {
    if (!parent.damId) {
      console.warn(`Litter ${parent.id} has no damId`);
      // Now that dam is nullable in the schema, we can return null
      return null;
    }
    
    const dam = await db.Dog.findByPk(parent.damId);
    if (!dam) {
      console.warn(`Dam dog with ID ${parent.damId} not found for litter ${parent.id}`);
      // Now that dam is nullable in schema, we can return null for not found dogs
      return null;
    }
    return dam;
  },
  puppies: async (parent: LitterAttributes) => {
    console.log(`Finding puppies for litter ${parent.id}`);
    const puppies = await db.Dog.findAll({
      where: {
        litterId: parent.id,
      },
    });
    console.log(`Found ${puppies.length} puppies for litter ${parent.id}`);
    if (puppies.length === 0) {
      console.log(`Litter ${parent.id} (${parent.litterName}) has no puppies in the database`);
    } else {
      console.log(`Puppies:`, puppies.map(p => ({ id: p.id, name: p.name })));
    }
    return puppies;
  },
};

export default {
  Query: litterQueries,
  Mutation: litterMutations,
  Litter,
};
