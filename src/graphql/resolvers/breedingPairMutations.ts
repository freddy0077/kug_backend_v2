import { Transaction } from 'sequelize';
import { UserInputError, ForbiddenError, ApolloError } from 'apollo-server-express';
import { checkAuth } from '../../utils/auth';
import Logger from '../../utils/logger';
import { LogLevel } from '../../db/models/SystemLog';
import { AuditAction } from '../../db/models/AuditLog';
import { BreedingProgramStatus } from '../../db/models/BreedingProgram';
import { BreedingPairStatus } from '../../db/models/BreedingPair';
import db from '../../db/models';
import { Model } from 'sequelize';
import transaction from 'sequelize/types/transaction';

// Type aliases for better readability
const { BreedingProgram, BreedingPair, Dog, Owner, BreedingRecord, sequelize } = db;

// UUID validation helper function
const isValidUUID = (id: string | null | undefined): boolean => {
  if (!id) return false;
  
  // UUID regex pattern (v4)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Utility function to validate breeding pair creation input
const validateBreedingPairInput = (input: {
  programId: string;
  sireId: string;
  damId: string;
  plannedBreedingDate?: Date;
  compatibilityNotes?: string;
  status?: BreedingPairStatus;
}) => {
  // Validate UUIDs
  if (!isValidUUID(input.programId)) {
    throw new UserInputError('Invalid breeding program ID');
  }
  if (!isValidUUID(input.sireId)) {
    throw new UserInputError('Invalid sire ID');
  }
  if (!isValidUUID(input.damId)) {
    throw new UserInputError('Invalid dam ID');
  }

  return input;
};

// Utility function to validate breeding record input
const validateBreedingRecordInput = (input: {
  breedingPairId: string;
  breedingRecordId: string;
}) => {
  // Validate UUIDs
  if (!isValidUUID(input.breedingPairId)) {
    throw new UserInputError('Invalid breeding pair ID');
  }
  if (!isValidUUID(input.breedingRecordId)) {
    throw new UserInputError('Invalid breeding record ID');
  }

  return input;
};

// Interface for status update input
type BreedingPairStatusUpdateInput = {
  id: string;
  status: BreedingPairStatus;
  notes?: string;
}

// Utility function to validate breeding pair status update input
const validateBreedingPairStatusUpdateInput = (input: BreedingPairStatusUpdateInput) => {
  // Validate UUID
  if (!isValidUUID(input.id)) {
    throw new UserInputError('Invalid breeding pair ID');
  }

  // Validate status is a valid enum value
  if (!Object.values(BreedingPairStatus).includes(input.status)) {
    throw new UserInputError('Invalid breeding pair status');
  }

  return input;
};

// Improve type safety for breeding record validation
interface BreedingRecordAttributes {
  id: string | number;
  sireId: string | number;
  damId: string | number;
  breedingPairId?: string | number | null;
}

// Validate breeding record and ensure type safety for ID comparison
const validateBreedingRecordLink = (
  breedingRecord: any, 
  breedingPairId: string
): any => {
  // Convert breedingPairId to string for consistent comparison
  const currentPairId = breedingRecord.breedingPairId 
    ? String(breedingRecord.breedingPairId) 
    : null;

  // Verify the breeding record isn't already linked to a different pair
  if (currentPairId && currentPairId !== breedingPairId) {
    throw new UserInputError('This breeding record is already linked to a different breeding pair');
  }

  return breedingRecord;
};

// Utility function to ensure safe type conversion between number and string IDs
const ensureStringId = (id: string | number | null | undefined): string | undefined => {
  if (id === null || id === undefined) {
    return undefined;
  }
  return String(id);
};

// Function to safely parse and validate date inputs
const parseDateInput = (dateInput: string | Date | null | undefined): Date | undefined => {
  if (!dateInput) {
    return undefined;
  }
  
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  
  if (isNaN(date.getTime())) {
    throw new UserInputError('Invalid date format');
  }
  
  return date;
};

// Utility function to convert a string ID to a number if needed
const toNumericId = (id: string | number): number => {
  if (typeof id === 'string') {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new UserInputError('Invalid ID format: must be a valid numeric string or number');
    }
    return numericId;
  }
  return id;
};

/**
 * Breeding Pair Mutations
 */
export const breedingPairMutations = {
  /**
   * Add a new breeding pair to a program
   */
  addBreedingPair: async (
    _: any,
    { input }: { input: {
      programId: string;
      sireId: string;
      damId: string;
      plannedBreedingDate?: Date | string | null;
      compatibilityNotes?: string | null;
      status?: BreedingPairStatus;
      geneticCompatibilityScore?: number | string;
    } },
    context: any
  ): Promise<any> => {
    const transaction = await sequelize.transaction();

    try {
      // Authenticate user
      const user = await checkAuth(context);

      // Validate input
      const validatedInput = {
        ...input,
        programId: String(input.programId),
        sireId: String(input.sireId),
        damId: String(input.damId),
      };

      // Verify the program exists
      const program = await BreedingProgram.findByPk(validatedInput.programId, { transaction });
      if (!program) {
        throw new UserInputError(`Breeding program with ID ${validatedInput.programId} not found`);
      }

      // Validate that dogs exist
      const [sire, dam] = await Promise.all([
        Dog.findByPk(validatedInput.sireId, { transaction }),
        Dog.findByPk(validatedInput.damId, { transaction }),
      ]);

      if (!sire) {
        throw new UserInputError(`Sire with ID ${validatedInput.sireId} not found`);
      }
      if (!dam) {
        throw new UserInputError(`Dam with ID ${validatedInput.damId} not found`);
      }

      // Validate dogs' sex
      if (sire.gender.toUpperCase() !== 'MALE') {
        throw new UserInputError(`Dog with ID ${validatedInput.sireId} is not a male and cannot be a sire`);
      }
      if (dam.gender.toUpperCase() !== 'FEMALE') {
        throw new UserInputError(`Dog with ID ${validatedInput.damId} is not a female and cannot be a dam`);
      }

      // Check if breeding pair already exists
      const existingPair = await BreedingPair.findOne({
        where: {
          programId: toNumericId(validatedInput.programId),
          sireId: toNumericId(validatedInput.sireId),
          damId: toNumericId(validatedInput.damId),
        },
        transaction
      });

      if (existingPair) {
        throw new UserInputError('This breeding pair already exists in the program');
      }

      // Handle planned breeding date if provided
      const plannedBreedingDate = parseDateInput(input.plannedBreedingDate);

      // Create the breeding pair
      const breedingPair = await BreedingPair.create({
        programId: toNumericId(validatedInput.programId),
        sireId: toNumericId(validatedInput.sireId),
        damId: toNumericId(validatedInput.damId),
        plannedBreedingDate,
        compatibilityNotes: input.compatibilityNotes || undefined,
        geneticCompatibilityScore: input.geneticCompatibilityScore !== undefined 
          ? input.geneticCompatibilityScore.toString() 
          : undefined,
        status: input.status || BreedingPairStatus.PLANNED
      },
      { transaction });

      // Log the system event
      await Logger.logSystemEvent(
        `Breeding pair created with ID ${breedingPair.id}`,
        LogLevel.INFO,
        'breedingPairMutations.addBreedingPair',
        `Breeding pair created between sire ${sire.name} and dam ${dam.name} in program ${program.name}`,
        undefined,
        user.id,
        context.req?.ip
      );

      // Log the audit trail
      await Logger.logAuditTrail(
        AuditAction.CREATE,
        'BreedingPair',
        breedingPair.id.toString(),
        user.id,
        undefined, // Previous state is undefined for creation
        JSON.stringify(breedingPair),
        context.req?.ip,
        `Breeding pair created successfully`
      );

      await transaction.commit();
      return breedingPair;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  /**
   * Update the status of a breeding pair
   */
  updateBreedingPairStatus: async (
    _: any,
    { input }: { input: BreedingPairStatusUpdateInput },
    context: any
  ): Promise<any> => {
    const transaction = await sequelize.transaction();

    try {
      // Authenticate user
      const user = await checkAuth(context);

      // Validate input
      const validatedInput = validateBreedingPairStatusUpdateInput(input);

      // Fetch the breeding pair
      const pair = await BreedingPair.findByPk(validatedInput.id, {
        include: [
          {
            model: BreedingProgram,
            as: 'program'
          }
        ],
        transaction
      });

      if (!pair) {
        throw new UserInputError(`Breeding pair with ID ${validatedInput.id} not found`);
      }

      // Validate the status transition
      const validTransitions: Record<BreedingPairStatus, BreedingPairStatus[]> = {
        [BreedingPairStatus.PLANNED]: [
          BreedingPairStatus.APPROVED,
          BreedingPairStatus.CANCELLED,
        ],
        [BreedingPairStatus.APPROVED]: [
          BreedingPairStatus.BREEDING_SCHEDULED,
          BreedingPairStatus.CANCELLED,
        ],
        [BreedingPairStatus.BREEDING_SCHEDULED]: [
          BreedingPairStatus.BRED,
          BreedingPairStatus.CANCELLED,
        ],
        [BreedingPairStatus.PENDING_TESTING]: [
          BreedingPairStatus.APPROVED,
          BreedingPairStatus.CANCELLED,
        ],
        [BreedingPairStatus.BRED]: [
          BreedingPairStatus.UNSUCCESSFUL,
          BreedingPairStatus.CANCELLED,
        ],
        [BreedingPairStatus.UNSUCCESSFUL]: [],
        [BreedingPairStatus.CANCELLED]: [],
      };

      const { status } = validatedInput;
      if (
        !validTransitions[pair.status].includes(status) && 
        pair.status !== status
      ) {
        throw new UserInputError(
          `Invalid status transition from ${pair.status} to ${status}`
        );
      }

      // Additional validation for cancelled status
      if (status === BreedingPairStatus.CANCELLED && !validatedInput.notes) {
        throw new UserInputError('Notes are required when cancelling a breeding pair');
      }

      // Store previous state for audit trail
      const previousState = JSON.stringify(pair);

      // Update the breeding pair status
      pair.status = status;
      if (validatedInput.notes) {
        pair.compatibilityNotes = validatedInput.notes;
      }

      await pair.save({ transaction });

      // Store previous status for logging
      const previousStatus = JSON.parse(previousState).status;
      
      // Log the audit trail
      await Logger.logAuditTrail(
        AuditAction.UPDATE,
        'BreedingPair',
        pair.id.toString(),
        user.id,
        previousState,
        JSON.stringify(pair),
        context.req?.ip,
        `Breeding pair status updated from ${previousStatus} to ${status}`
      );

      await transaction.commit();
      return pair;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  /**
   * Link a breeding record (litter) to a breeding pair
   */
  linkLitterToBreedingPair: async (
    _: any,
    { 
      breedingPairId, 
      breedingRecordId 
    }: { 
      breedingPairId: string;
      breedingRecordId: string;
    },
    context: any
  ): Promise<any> => {
    const transaction = await sequelize.transaction();

    try {
      // Authenticate user
      const user = await checkAuth(context);

      // Validate input - ensure we're working with string IDs
      const validatedInput = {
        breedingPairId: String(breedingPairId),
        breedingRecordId: String(breedingRecordId)
      };

      // Fetch the breeding pair
      const breedingPair = await BreedingPair.findByPk(validatedInput.breedingPairId, {
        include: [
          {
            model: BreedingProgram,
            as: 'program'
          },
          {
            model: Dog,
            as: 'sire'
          },
          {
            model: Dog,
            as: 'dam'
          }
        ],
        transaction
      });

      if (!breedingPair) {
        throw new UserInputError(`Breeding pair with ID ${validatedInput.breedingPairId} not found`);
      }

      // Fetch the breeding record
      const breedingRecord = await BreedingRecord.findByPk(validatedInput.breedingRecordId, {
        transaction
      });

      if (!breedingRecord) {
        throw new UserInputError(`Breeding record with ID ${validatedInput.breedingRecordId} not found`);
      }

      // Validate that the breeding record has the same sire and dam as the breeding pair
      const breedingRecordAttrs = breedingRecord.get() as BreedingRecordAttributes;
      
      if (!validateBreedingRecordLink(breedingRecordAttrs, validatedInput.breedingPairId)) {
        throw new UserInputError('The breeding record does not match the sire and/or dam of the breeding pair');
      }

      // Update the breeding record
      // Convert the string ID to a number for compatibility with the model
      const numericId = toNumericId(validatedInput.breedingPairId);
      breedingRecord.set('breedingPairId', numericId);
      await breedingRecord.save({ transaction });

      // Log the audit trail
      await Logger.logAuditTrail(
        AuditAction.UPDATE,
        'BreedingRecord',
        breedingRecord.id.toString(),
        user.id,
        JSON.stringify({ breedingPairId: null }),
        JSON.stringify({ breedingPairId: numericId }),
        context.req?.ip,
        `Breeding record linked to breeding pair ${validatedInput.breedingPairId}`
      );

      await transaction.commit();
      return breedingRecord;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
