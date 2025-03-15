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
            // Fetch the breeding program to confirm it exists
            const program = await BreedingProgram.findByPk(input.programId, { transaction });
            if (!program) {
                throw new apollo_server_express_1.UserInputError(`Breeding program with ID ${input.programId} not found`);
            }
            // Check permissions - only admins or the breeder themselves can add a breeding pair
            const breeder = await Owner.findByPk(program.breederId, { transaction });
            if (user.role !== 'ADMIN' && (!breeder || user.id !== breeder.userId)) {
                throw new apollo_server_express_1.ForbiddenError('You do not have permission to add breeding pairs to this program');
            }
            // Fetch the sire to confirm it exists and is male
            const sire = await Dog.findByPk(input.sireId, { transaction });
            if (!sire) {
                throw new apollo_server_express_1.UserInputError(`Sire with ID ${input.sireId} not found`);
            }
            if (sire.gender.toUpperCase() !== 'MALE') {
                throw new apollo_server_express_1.UserInputError('Sire must be a male dog');
            }
            // Fetch the dam to confirm it exists and is female
            const dam = await Dog.findByPk(input.damId, { transaction });
            if (!dam) {
                throw new apollo_server_express_1.UserInputError(`Dam with ID ${input.damId} not found`);
            }
            if (dam.gender.toUpperCase() !== 'FEMALE') {
                throw new apollo_server_express_1.UserInputError('Dam must be a female dog');
            }
            // Check if the breeding pair already exists
            const existingPair = await BreedingPair.findOne({
                where: {
                    programId: input.programId,
                    sireId: input.sireId,
                    damId: input.damId
                },
                transaction
            });
            if (existingPair) {
                throw new apollo_server_express_1.UserInputError('This breeding pair already exists in the program');
            }
            // Handle planned breeding date if provided
            let plannedBreedingDate = null;
            if (input.plannedBreedingDate) {
                plannedBreedingDate = new Date(input.plannedBreedingDate);
                if (isNaN(plannedBreedingDate.getTime())) {
                    throw new apollo_server_express_1.UserInputError('Invalid planned breeding date');
                }
            }
            // Calculate a basic genetic compatibility score (simplified for example)
            // In a real implementation, this would involve more complex calculations
            let geneticCompatibilityScore = null;
            if (sire.breed === dam.breed) {
                geneticCompatibilityScore = 0.8; // Same breed, assumed compatibility
            }
            else {
                geneticCompatibilityScore = 0.4; // Different breeds, lower compatibility
            }
            // Create the breeding pair
            const breedingPair = await BreedingPair.create({
                programId: input.programId,
                sireId: input.sireId,
                damId: input.damId,
                plannedBreedingDate: plannedBreedingDate || undefined,
                compatibilityNotes: input.compatibilityNotes || undefined,
                geneticCompatibilityScore,
                status: input.status || BreedingPair_1.BreedingPairStatus.PLANNED
            }, { transaction });
            // Log the system event
            await logger_1.default.logSystemEvent(`Breeding pair created with ID ${breedingPair.id}`, SystemLog_1.LogLevel.INFO, 'breedingPairMutations.addBreedingPair', `New breeding pair added: Sire ${input.sireId}, Dam ${input.damId} in Program ${program.name} (${program.id})`, undefined, user.id, context.req?.ip);
            // Log the audit trail
            await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.CREATE, 'BreedingPair', breedingPair.id.toString(), user.id, undefined, JSON.stringify({
                programId: breedingPair.programId,
                sireId: breedingPair.sireId,
                damId: breedingPair.damId,
                status: breedingPair.status,
                geneticCompatibilityScore: breedingPair.geneticCompatibilityScore
            }), context.req?.ip, `Breeding pair added to program "${program.name}" with compatibility score: ${breedingPair.geneticCompatibilityScore || 'N/A'}`);
            await transaction.commit();
            // Return the complete breeding pair with associations
            return BreedingPair.findByPk(breedingPair.id, {
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
                ]
            });
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error adding breeding pair:', error);
            throw error;
        }
    },
    /**
     * Update the status of a breeding pair
     */
    updateBreedingPairStatus: async (_, { id, status, notes }, context) => {
        const transaction = await sequelize.transaction();
        try {
            // Authenticate user
            const user = await (0, auth_1.checkAuth)(context);
            // Fetch the breeding pair
            const pair = await BreedingPair.findByPk(id, {
                include: [
                    {
                        model: BreedingProgram,
                        as: 'program'
                    }
                ],
                transaction
            });
            if (!pair) {
                throw new apollo_server_express_1.UserInputError(`Breeding pair with ID ${id} not found`);
            }
            // Check permissions - only admins or the breeder themselves can update a breeding pair
            const program = await BreedingProgram.findByPk(pair.programId, { transaction });
            if (!program) {
                throw new apollo_server_express_1.ApolloError(`Program not found for breeding pair ${id}`);
            }
            const breeder = await Owner.findByPk(program.breederId, { transaction });
            if (user.role !== 'ADMIN' && (!breeder || user.id !== breeder.userId)) {
                throw new apollo_server_express_1.ForbiddenError('You do not have permission to update this breeding pair');
            }
            // Validate the status transition
            const validTransitions = {
                [BreedingPair_1.BreedingPairStatus.PLANNED]: [
                    BreedingPair_1.BreedingPairStatus.APPROVED,
                    BreedingPair_1.BreedingPairStatus.PENDING_TESTING,
                    BreedingPair_1.BreedingPairStatus.CANCELLED
                ],
                [BreedingPair_1.BreedingPairStatus.APPROVED]: [
                    BreedingPair_1.BreedingPairStatus.BREEDING_SCHEDULED,
                    BreedingPair_1.BreedingPairStatus.CANCELLED
                ],
                [BreedingPair_1.BreedingPairStatus.PENDING_TESTING]: [
                    BreedingPair_1.BreedingPairStatus.APPROVED,
                    BreedingPair_1.BreedingPairStatus.CANCELLED
                ],
                [BreedingPair_1.BreedingPairStatus.BREEDING_SCHEDULED]: [
                    BreedingPair_1.BreedingPairStatus.BRED,
                    BreedingPair_1.BreedingPairStatus.CANCELLED
                ],
                [BreedingPair_1.BreedingPairStatus.BRED]: [
                    BreedingPair_1.BreedingPairStatus.UNSUCCESSFUL
                ],
                [BreedingPair_1.BreedingPairStatus.UNSUCCESSFUL]: [],
                [BreedingPair_1.BreedingPairStatus.CANCELLED]: []
            };
            if (!validTransitions[pair.status].includes(status)) {
                throw new apollo_server_express_1.UserInputError(`Invalid status transition from ${pair.status} to ${status}`);
            }
            // Update the breeding pair's status and notes
            const previousState = JSON.stringify(pair);
            pair.status = status;
            if (notes !== undefined) {
                pair.compatibilityNotes = notes;
            }
            await pair.save({ transaction });
            // Store previous status for logging
            const previousStatus = JSON.parse(previousState).status;
            // Log system event
            await logger_1.default.logSystemEvent(`Breeding pair status updated with ID ${pair.id}`, SystemLog_1.LogLevel.INFO, 'breedingPairMutations.updateBreedingPairStatus', `Breeding pair status changed from ${previousStatus} to ${status} in program ${program.name} (${program.id})`, undefined, user.id, context.req?.ip);
            // Log the audit trail
            await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.UPDATE, 'BreedingPair', pair.id.toString(), user.id, previousState, JSON.stringify({
                status,
                notes: notes || 'No notes provided'
            }), context.req?.ip, `Breeding pair status updated from ${previousStatus} to ${status}`);
            await transaction.commit();
            // Return the updated breeding pair with associations
            return BreedingPair.findByPk(id, {
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
                    },
                    {
                        model: BreedingRecord,
                        as: 'breedingRecords'
                    }
                ]
            });
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error updating breeding pair status:', error);
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
            // Fetch the breeding pair
            const pair = await BreedingPair.findByPk(breedingPairId, {
                include: [
                    {
                        model: BreedingProgram,
                        as: 'program'
                    }
                ],
                transaction
            });
            if (!pair) {
                throw new apollo_server_express_1.UserInputError(`Breeding pair with ID ${breedingPairId} not found`);
            }
            // Check permissions - only admins or the breeder themselves can link a litter
            const program = await BreedingProgram.findByPk(pair.programId, { transaction });
            if (!program) {
                throw new apollo_server_express_1.ApolloError(`Program not found for breeding pair ${breedingPairId}`);
            }
            const breeder = await Owner.findByPk(program.breederId, { transaction });
            if (user.role !== 'ADMIN' && (!breeder || user.id !== breeder.userId)) {
                throw new apollo_server_express_1.ForbiddenError('You do not have permission to link litters to this breeding pair');
            }
            // Fetch the breeding record
            const breedingRecord = await BreedingRecord.findByPk(breedingRecordId, { transaction });
            if (!breedingRecord) {
                throw new apollo_server_express_1.UserInputError(`Breeding record with ID ${breedingRecordId} not found`);
            }
            // Verify the breeding record isn't already linked to a different pair
            if (breedingRecord.breedingPairId && breedingRecord.breedingPairId !== breedingPairId) {
                throw new apollo_server_express_1.UserInputError('This breeding record is already linked to a different breeding pair');
            }
            // Ensure the parents match
            if (breedingRecord.sireId !== pair.sireId || breedingRecord.damId !== pair.damId) {
                throw new apollo_server_express_1.UserInputError('The parents in the breeding record do not match this breeding pair');
            }
            // Link the breeding record to the pair
            const previousState = JSON.stringify(breedingRecord);
            breedingRecord.breedingPairId = breedingPairId;
            await breedingRecord.save({ transaction });
            // If the pair status is not already BRED, update it
            if (pair.status !== BreedingPair_1.BreedingPairStatus.BRED) {
                pair.status = BreedingPair_1.BreedingPairStatus.BRED;
                await pair.save({ transaction });
            }
            // Log system event
            await logger_1.default.logSystemEvent(`Litter record linked to breeding pair with ID ${breedingPairId}`, SystemLog_1.LogLevel.INFO, 'breedingPairMutations.linkLitterToBreedingPair', `Breeding record ${breedingRecordId} linked to breeding pair ${breedingPairId} in program ${program.name} (${program.id})`, undefined, user.id, context.req?.ip);
            // Log the audit trail
            await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.UPDATE, 'BreedingRecord', breedingRecord.id.toString(), user.id, previousState, JSON.stringify(breedingRecord), context.req?.ip, `Breeding record ${breedingRecordId} successfully linked to breeding pair ${breedingPairId}`);
            await transaction.commit();
            // Return the updated breeding pair with associations
            return BreedingPair.findByPk(breedingPairId, {
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
                    },
                    {
                        model: BreedingRecord,
                        as: 'breedingRecords'
                    }
                ]
            });
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error linking litter to breeding pair:', error);
            throw error;
        }
    }
};
//# sourceMappingURL=breedingPairMutations.js.map