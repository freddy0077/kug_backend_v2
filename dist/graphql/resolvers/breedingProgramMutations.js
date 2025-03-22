"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.breedingProgramMutations = exports.toNumericId = void 0;
const sequelize_1 = require("sequelize");
const apollo_server_express_1 = require("apollo-server-express");
const auth_1 = require("../../utils/auth");
const logger_1 = __importDefault(require("../../utils/logger"));
const SystemLog_1 = require("../../db/models/SystemLog");
const AuditLog_1 = require("../../db/models/AuditLog");
const BreedingProgram_1 = require("../../db/models/BreedingProgram");
const models_1 = __importDefault(require("../../db/models"));
// Utility function to convert a string ID to a number, throwing an error for null or invalid inputs
const toNumericId = (id) => {
    if (id === null) {
        throw new apollo_server_express_1.UserInputError('ID cannot be null');
    }
    if (typeof id === 'string') {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            throw new apollo_server_express_1.UserInputError('Invalid ID format: must be a valid numeric string or number');
        }
        return numericId;
    }
    return id;
};
exports.toNumericId = toNumericId;
// Type aliases for better readability
const { BreedingProgram, BreedingPair, Dog, Owner, BreedingRecord, BreedingProgramFoundationDog, sequelize } = models_1.default;
/**
 * Breeding Program Mutations
 */
exports.breedingProgramMutations = {
    /**
     * Create a new breeding program
     */
    createBreedingProgram: async (_, { input }, context) => {
        const transaction = await sequelize.transaction();
        try {
            // Authenticate user
            const user = await (0, auth_1.checkAuth)(context);
            // Validate input
            if (!input.name.trim()) {
                throw new apollo_server_express_1.UserInputError('Program name cannot be empty');
            }
            if (!input.description.trim()) {
                throw new apollo_server_express_1.UserInputError('Program description cannot be empty');
            }
            // Ensure breeder exists with support for both UUID and legacy numeric IDs
            let breeder;
            const breederNumericId = (0, exports.toNumericId)(input.breederId);
            if (!isNaN(breederNumericId)) {
                // Fallback for legacy numeric IDs
                breeder = await Owner.findByPk(breederNumericId);
            }
            else {
                // Use a proper type-safe comparison with id as a string
                breeder = await Owner.findOne({ where: { id: String(input.breederId) } });
            }
            if (!breeder) {
                throw new apollo_server_express_1.UserInputError(`Breeder with ID ${input.breederId} not found`);
            }
            // Ensure all foundation dogs exist with support for both UUID and legacy numeric IDs
            const foundationDogIds = input.foundationDogIds.map(dogId => (0, exports.toNumericId)(dogId));
            const foundationDogs = await Dog.findAll({
                where: {
                    id: { [sequelize_1.Op.in]: foundationDogIds }
                }
            });
            if (foundationDogs.length !== input.foundationDogIds.length) {
                // Find which specific dogs are missing
                const missingDogs = input.foundationDogIds.filter(dogId => !foundationDogs.some(dog => (0, exports.toNumericId)(dog.id) === (0, exports.toNumericId)(dogId)));
                throw new apollo_server_express_1.UserInputError(`The following foundation dogs do not exist: ${missingDogs.join(', ')}`);
            }
            // Ensure startDate is a valid Date object
            const startDate = input.startDate ? new Date(input.startDate) : new Date();
            if (isNaN(startDate.getTime())) {
                throw new apollo_server_express_1.UserInputError('Invalid start date');
            }
            // Ensure endDate is a valid Date object if provided
            let endDate = null;
            if (input.endDate) {
                endDate = new Date(input.endDate);
                if (isNaN(endDate.getTime())) {
                    throw new apollo_server_express_1.UserInputError('Invalid end date');
                }
                // Ensure endDate is after startDate
                if (endDate < startDate) {
                    throw new apollo_server_express_1.UserInputError('End date must be after start date');
                }
            }
            // Create the breeding program
            const program = await BreedingProgram.create({
                name: input.name,
                description: input.description,
                breederId: (0, exports.toNumericId)(breeder.id), // Convert breeder ID to numeric
                breed: input.breed,
                goals: input.goals,
                startDate: startDate,
                endDate: endDate || undefined,
                status: BreedingProgram_1.BreedingProgramStatus.PLANNING,
                geneticTestingProtocol: input.geneticTestingProtocol,
                selectionCriteria: input.selectionCriteria,
                notes: input.notes,
                isPublic: input.isPublic,
                imageUrl: input.imageUrl
            }, { transaction });
            // Create foundation dog associations
            const foundationDogAssociations = foundationDogIds.map(dogId => ({
                breedingProgramId: (0, exports.toNumericId)(program.id),
                dogId: (0, exports.toNumericId)(dogId)
            }));
            await BreedingProgramFoundationDog.bulkCreate(foundationDogAssociations, { transaction });
            // Log the action - system event
            await logger_1.default.logSystemEvent(`Breeding program created with ID ${program.id}`, SystemLog_1.LogLevel.INFO, 'breedingProgramMutations.createBreedingProgram', `Program: ${program.name} (${program.id}) with ${foundationDogAssociations.length} foundation dogs`, undefined, user.id, context.req?.ip);
            // Log the action - audit trail
            await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.CREATE, 'BreedingProgram', program.id.toString(), user.id, undefined, JSON.stringify({
                name: program.name,
                description: program.description,
                breederId: program.breederId,
                breed: program.breed,
                foundationDogIds: input.foundationDogIds
            }), context.req?.ip, `Breeding program "${program.name}" created with ${foundationDogAssociations.length} foundation dogs`);
            await transaction.commit();
            return program;
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error creating breeding program:', error);
            throw error;
        }
    },
    /**
     * Update an existing breeding program
     */
    updateBreedingProgram: async (_, { id, input }, context) => {
        const transaction = await sequelize.transaction();
        try {
            // Authenticate user
            const user = await (0, auth_1.checkAuth)(context);
            // Fetch the program with support for both UUID and legacy numeric IDs
            let program;
            const numericId = (0, exports.toNumericId)(id);
            if (!isNaN(numericId)) {
                // Fallback for any existing numeric IDs during migration
                program = await BreedingProgram.findByPk(numericId, { transaction });
            }
            else {
                program = await BreedingProgram.findOne({
                    where: { id },
                    transaction
                });
            }
            if (!program) {
                throw new apollo_server_express_1.UserInputError(`Breeding program with ID ${id} not found`);
            }
            // Check permissions - only admins or the breeder themselves can update a program
            const breeder = await Owner.findByPk(program.breederId);
            // Validate date fields if provided
            if (input.startDate) {
                const startDate = new Date(input.startDate);
                if (isNaN(startDate.getTime())) {
                    throw new apollo_server_express_1.UserInputError('Invalid start date');
                }
                program.startDate = startDate;
            }
            if (input.endDate !== undefined) {
                if (input.endDate === null) {
                    program.endDate = undefined;
                }
                else {
                    const endDate = new Date(input.endDate);
                    if (isNaN(endDate.getTime())) {
                        throw new apollo_server_express_1.UserInputError('Invalid end date');
                    }
                    // Ensure endDate is after startDate
                    if (endDate < program.startDate) {
                        throw new apollo_server_express_1.UserInputError('End date must be after start date');
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
                const foundationDogIds = input.foundationDogIds.map(dogId => (0, exports.toNumericId)(dogId));
                const foundationDogs = await Dog.findAll({
                    where: {
                        id: { [sequelize_1.Op.in]: foundationDogIds }
                    }
                });
                if (foundationDogs.length !== input.foundationDogIds.length) {
                    // Find which specific dogs are missing
                    const missingDogs = input.foundationDogIds.filter(dogId => !foundationDogs.some(dog => (0, exports.toNumericId)(dog.id) === (0, exports.toNumericId)(dogId)));
                    throw new apollo_server_express_1.UserInputError(`The following foundation dogs do not exist: ${missingDogs.join(', ')}`);
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
                    breedingProgramId: (0, exports.toNumericId)(program.id),
                    dogId: (0, exports.toNumericId)(dogId)
                }));
                await BreedingProgramFoundationDog.bulkCreate(foundationDogAssociations, { transaction });
            }
            // Track foundation dog changes for logging
            let foundationDogChanges = input.foundationDogIds ?
                `Updated foundation dogs (${input.foundationDogIds.length} dogs)` : "";
            // Log the system event
            await logger_1.default.logSystemEvent(`Breeding program updated with ID ${program.id}`, SystemLog_1.LogLevel.INFO, 'breedingProgramMutations.updateBreedingProgram', `Program: ${program.name} (${program.id}) ${foundationDogChanges}`, undefined, user.id, context.req?.ip);
            // Log the audit trail
            await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.UPDATE, 'BreedingProgram', program.id.toString(), user.id, previousState, JSON.stringify(program), context.req?.ip, `Breeding program "${program.name}" updated ${foundationDogChanges}`);
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
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error updating breeding program:', error);
            throw error;
        }
    },
    /**
     * Delete a breeding program
     */
    deleteBreedingProgram: async (_, { id }, context) => {
        const transaction = await sequelize.transaction();
        try {
            // Authenticate user
            const user = await (0, auth_1.checkAuth)(context);
            // Fetch the program with support for both UUID and legacy numeric IDs
            let program;
            const numericId = (0, exports.toNumericId)(id);
            if (!isNaN(numericId)) {
                // Fallback for any existing numeric IDs during migration
                program = await BreedingProgram.findByPk(numericId, { transaction });
            }
            else {
                program = await BreedingProgram.findOne({
                    where: { id },
                    transaction
                });
            }
            if (!program) {
                throw new apollo_server_express_1.UserInputError(`Breeding program with ID ${id} not found`);
            }
            // Check permissions - only admins or the breeder themselves can delete a program
            const breeder = await Owner.findByPk(program.breederId);
            // Store program details for logging
            const programDetails = JSON.stringify(program);
            const programName = program.name;
            // Delete the program (cascades to foundation dogs and breeding pairs)
            await program.destroy({ transaction });
            // Log system event
            await logger_1.default.logSystemEvent(`Breeding program deleted with ID ${id}`, SystemLog_1.LogLevel.INFO, 'breedingProgramMutations.deleteBreedingProgram', `Program: ${programName} (${id}) has been removed with all related breeding pairs`, undefined, user.id, context.req?.ip);
            // Log audit trail
            await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.DELETE, 'BreedingProgram', id.toString(), user.id, programDetails, undefined, context.req?.ip, `Breeding program "${programName}" permanently deleted with all associated breeding pairs`);
            await transaction.commit();
            return {
                success: true,
                message: `Breeding program "${programName}" successfully deleted`
            };
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error deleting breeding program:', error);
            throw error;
        }
    }
};
//# sourceMappingURL=breedingProgramMutations.js.map