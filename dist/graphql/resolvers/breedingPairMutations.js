"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.breedingPairMutations = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const auth_1 = require("../../utils/auth");
const logger_1 = __importDefault(require("../../utils/logger"));
const SystemLog_1 = require("../../db/models/SystemLog");
const AuditLog_1 = require("../../db/models/AuditLog");
const BreedingPair_1 = require("../../db/models/BreedingPair");
const models_1 = __importDefault(require("../../db/models"));
// Type aliases for better readability
const { BreedingProgram, BreedingPair, Dog, Owner, BreedingRecord, sequelize } = models_1.default;
// UUID validation helper function
const isValidUUID = (id) => {
    if (!id)
        return false;
    // UUID regex pattern (v4)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
};
// Utility function to validate breeding pair creation input
const validateBreedingPairInput = (input) => {
    // Validate UUIDs
    if (!isValidUUID(input.programId)) {
        throw new apollo_server_express_1.UserInputError('Invalid breeding program ID');
    }
    if (!isValidUUID(input.sireId)) {
        throw new apollo_server_express_1.UserInputError('Invalid sire ID');
    }
    if (!isValidUUID(input.damId)) {
        throw new apollo_server_express_1.UserInputError('Invalid dam ID');
    }
    return input;
};
// Utility function to validate breeding record input
const validateBreedingRecordInput = (input) => {
    // Validate UUIDs
    if (!isValidUUID(input.breedingPairId)) {
        throw new apollo_server_express_1.UserInputError('Invalid breeding pair ID');
    }
    if (!isValidUUID(input.breedingRecordId)) {
        throw new apollo_server_express_1.UserInputError('Invalid breeding record ID');
    }
    return input;
};
// Utility function to validate breeding pair status update input
const validateBreedingPairStatusUpdateInput = (input) => {
    // Validate UUID
    if (!isValidUUID(input.id)) {
        throw new apollo_server_express_1.UserInputError('Invalid breeding pair ID');
    }
    // Validate status is a valid enum value
    if (!Object.values(BreedingPair_1.BreedingPairStatus).includes(input.status)) {
        throw new apollo_server_express_1.UserInputError('Invalid breeding pair status');
    }
    return input;
};
// Validate breeding record and ensure type safety for ID comparison
const validateBreedingRecordLink = (breedingRecord, breedingPairId) => {
    // Convert breedingPairId to string for consistent comparison
    const currentPairId = breedingRecord.breedingPairId
        ? String(breedingRecord.breedingPairId)
        : null;
    // Verify the breeding record isn't already linked to a different pair
    if (currentPairId && currentPairId !== breedingPairId) {
        throw new apollo_server_express_1.UserInputError('This breeding record is already linked to a different breeding pair');
    }
    return breedingRecord;
};
// Utility function to ensure safe type conversion between number and string IDs
const ensureStringId = (id) => {
    if (id === null || id === undefined) {
        return undefined;
    }
    return String(id);
};
// Function to safely parse and validate date inputs
const parseDateInput = (dateInput) => {
    if (!dateInput) {
        return undefined;
    }
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) {
        throw new apollo_server_express_1.UserInputError('Invalid date format');
    }
    return date;
};
// Utility function to convert a string ID to a number if needed
const toNumericId = (id) => {
    if (typeof id === 'string') {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            throw new apollo_server_express_1.UserInputError('Invalid ID format: must be a valid numeric string or number');
        }
        return numericId;
    }
    return id;
};
/**
 * Breeding Pair Mutations
 */
exports.breedingPairMutations = {
    /**
     * Add a new breeding pair to a program
     */
    addBreedingPair: async (_, { input }, context) => {
        const transaction = await sequelize.transaction();
        try {
            // Authenticate user
            const user = await (0, auth_1.checkAuth)(context);
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
                throw new apollo_server_express_1.UserInputError(`Breeding program with ID ${validatedInput.programId} not found`);
            }
            // Validate that dogs exist
            const [sire, dam] = await Promise.all([
                Dog.findByPk(validatedInput.sireId, { transaction }),
                Dog.findByPk(validatedInput.damId, { transaction }),
            ]);
            if (!sire) {
                throw new apollo_server_express_1.UserInputError(`Sire with ID ${validatedInput.sireId} not found`);
            }
            if (!dam) {
                throw new apollo_server_express_1.UserInputError(`Dam with ID ${validatedInput.damId} not found`);
            }
            // Validate dogs' sex
            if (sire.gender.toUpperCase() !== 'MALE') {
                throw new apollo_server_express_1.UserInputError(`Dog with ID ${validatedInput.sireId} is not a male and cannot be a sire`);
            }
            if (dam.gender.toUpperCase() !== 'FEMALE') {
                throw new apollo_server_express_1.UserInputError(`Dog with ID ${validatedInput.damId} is not a female and cannot be a dam`);
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
                throw new apollo_server_express_1.UserInputError('This breeding pair already exists in the program');
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
                status: input.status || BreedingPair_1.BreedingPairStatus.PLANNED
            }, { transaction });
            // Log the system event
            await logger_1.default.logSystemEvent(`Breeding pair created with ID ${breedingPair.id}`, SystemLog_1.LogLevel.INFO, 'breedingPairMutations.addBreedingPair', `Breeding pair created between sire ${sire.name} and dam ${dam.name} in program ${program.name}`, undefined, user.id, context.req?.ip);
            // Log the audit trail
            await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.CREATE, 'BreedingPair', breedingPair.id.toString(), user.id, undefined, // Previous state is undefined for creation
            JSON.stringify(breedingPair), context.req?.ip, `Breeding pair created successfully`);
            await transaction.commit();
            return breedingPair;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
    /**
     * Update the status of a breeding pair
     */
    updateBreedingPairStatus: async (_, { input }, context) => {
        const transaction = await sequelize.transaction();
        try {
            // Authenticate user
            const user = await (0, auth_1.checkAuth)(context);
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
                throw new apollo_server_express_1.UserInputError(`Breeding pair with ID ${validatedInput.id} not found`);
            }
            // Validate the status transition
            const validTransitions = {
                [BreedingPair_1.BreedingPairStatus.PLANNED]: [
                    BreedingPair_1.BreedingPairStatus.APPROVED,
                    BreedingPair_1.BreedingPairStatus.CANCELLED,
                ],
                [BreedingPair_1.BreedingPairStatus.APPROVED]: [
                    BreedingPair_1.BreedingPairStatus.BREEDING_SCHEDULED,
                    BreedingPair_1.BreedingPairStatus.CANCELLED,
                ],
                [BreedingPair_1.BreedingPairStatus.BREEDING_SCHEDULED]: [
                    BreedingPair_1.BreedingPairStatus.BRED,
                    BreedingPair_1.BreedingPairStatus.CANCELLED,
                ],
                [BreedingPair_1.BreedingPairStatus.PENDING_TESTING]: [
                    BreedingPair_1.BreedingPairStatus.APPROVED,
                    BreedingPair_1.BreedingPairStatus.CANCELLED,
                ],
                [BreedingPair_1.BreedingPairStatus.BRED]: [
                    BreedingPair_1.BreedingPairStatus.UNSUCCESSFUL,
                    BreedingPair_1.BreedingPairStatus.CANCELLED,
                ],
                [BreedingPair_1.BreedingPairStatus.UNSUCCESSFUL]: [],
                [BreedingPair_1.BreedingPairStatus.CANCELLED]: [],
            };
            const { status } = validatedInput;
            if (!validTransitions[pair.status].includes(status) &&
                pair.status !== status) {
                throw new apollo_server_express_1.UserInputError(`Invalid status transition from ${pair.status} to ${status}`);
            }
            // Additional validation for cancelled status
            if (status === BreedingPair_1.BreedingPairStatus.CANCELLED && !validatedInput.notes) {
                throw new apollo_server_express_1.UserInputError('Notes are required when cancelling a breeding pair');
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
            await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.UPDATE, 'BreedingPair', pair.id.toString(), user.id, previousState, JSON.stringify(pair), context.req?.ip, `Breeding pair status updated from ${previousStatus} to ${status}`);
            await transaction.commit();
            return pair;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
    /**
     * Link a breeding record (litter) to a breeding pair
     */
    linkLitterToBreedingPair: async (_, { breedingPairId, breedingRecordId }, context) => {
        const transaction = await sequelize.transaction();
        try {
            // Authenticate user
            const user = await (0, auth_1.checkAuth)(context);
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
                throw new apollo_server_express_1.UserInputError(`Breeding pair with ID ${validatedInput.breedingPairId} not found`);
            }
            // Fetch the breeding record
            const breedingRecord = await BreedingRecord.findByPk(validatedInput.breedingRecordId, {
                transaction
            });
            if (!breedingRecord) {
                throw new apollo_server_express_1.UserInputError(`Breeding record with ID ${validatedInput.breedingRecordId} not found`);
            }
            // Validate that the breeding record has the same sire and dam as the breeding pair
            const breedingRecordAttrs = breedingRecord.get();
            if (!validateBreedingRecordLink(breedingRecordAttrs, validatedInput.breedingPairId)) {
                throw new apollo_server_express_1.UserInputError('The breeding record does not match the sire and/or dam of the breeding pair');
            }
            // Update the breeding record
            // Convert the string ID to a number for compatibility with the model
            const numericId = toNumericId(validatedInput.breedingPairId);
            breedingRecord.set('breedingPairId', numericId);
            await breedingRecord.save({ transaction });
            // Log the audit trail
            await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.UPDATE, 'BreedingRecord', breedingRecord.id.toString(), user.id, JSON.stringify({ breedingPairId: null }), JSON.stringify({ breedingPairId: numericId }), context.req?.ip, `Breeding record linked to breeding pair ${validatedInput.breedingPairId}`);
            await transaction.commit();
            return breedingRecord;
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
};
//# sourceMappingURL=breedingPairMutations.js.map