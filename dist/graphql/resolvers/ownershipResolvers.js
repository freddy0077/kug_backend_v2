"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ownershipResolvers = void 0;
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../../db/models"));
const apollo_server_express_1 = require("apollo-server-express");
const logger_1 = __importDefault(require("../../utils/logger"));
const SystemLog_1 = require("../../db/models/SystemLog");
const AuditLog_1 = require("../../db/models/AuditLog");
const auth_1 = require("../../utils/auth");
exports.ownershipResolvers = {
    Query: {
        dogOwnerships: async (_, { dogId }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                // Log the request
                await logger_1.default.logSystemEvent(`Ownership records requested for dog ID ${dogId}`, SystemLog_1.LogLevel.INFO, 'ownershipResolvers.dogOwnerships', undefined, undefined, user.id, context.req?.ip);
                // First check if dog exists
                const dog = await models_1.default.Dog.findByPk(dogId);
                if (!dog) {
                    throw new apollo_server_express_1.UserInputError(`Dog with ID ${dogId} not found`);
                }
                // Get all ownerships for this dog, ordered by startDate
                const ownerships = await models_1.default.Ownership.findAll({
                    where: { dogId },
                    order: [['startDate', 'DESC']],
                    include: [{ model: models_1.default.Owner, as: 'owner' }]
                });
                return {
                    dog,
                    ownerships
                };
            }
            catch (error) {
                console.error('Error fetching dog ownerships:', error);
                throw error;
            }
        },
        ownerDogs: async (_, { ownerId, includeFormer = false, offset = 0, limit = 20 }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                // Log the request
                await logger_1.default.logSystemEvent(`Dogs requested for owner ID ${ownerId}`, SystemLog_1.LogLevel.INFO, 'ownershipResolvers.ownerDogs', `Include former: ${includeFormer ? 'Yes' : 'No'}, Pagination: offset=${offset}, limit=${limit}`, undefined, user.id, context.req?.ip);
                // First check if owner exists
                const owner = await models_1.default.Owner.findByPk(ownerId);
                if (!owner) {
                    throw new apollo_server_express_1.UserInputError(`Owner with ID ${ownerId} not found`);
                }
                // Define where clause based on includeFormer parameter
                const whereClause = { ownerId };
                if (!includeFormer) {
                    whereClause.is_current = true;
                }
                // Query ownerships with pagination
                const { count, rows } = await models_1.default.Ownership.findAndCountAll({
                    where: whereClause,
                    order: [['startDate', 'DESC']],
                    limit,
                    offset,
                    include: [{ model: models_1.default.Dog, as: 'dog' }]
                });
                return {
                    totalCount: count,
                    hasMore: offset + rows.length < count,
                    items: rows
                };
            }
            catch (error) {
                console.error('Error fetching owner dogs:', error);
                throw error;
            }
        },
        ownership: async (_, { id }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                // Log the ownership lookup
                await logger_1.default.logSystemEvent(`Ownership record lookup by ID ${id}`, SystemLog_1.LogLevel.INFO, 'ownershipResolvers.ownership', undefined, undefined, user.id, context.req?.ip);
                const ownership = await models_1.default.Ownership.findByPk(id, {
                    include: [
                        { model: models_1.default.Dog, as: 'dog' },
                        { model: models_1.default.Owner, as: 'owner' }
                    ]
                });
                if (!ownership) {
                    throw new apollo_server_express_1.UserInputError(`Ownership with ID ${id} not found`);
                }
                return ownership;
            }
            catch (error) {
                console.error('Error fetching ownership by ID:', error);
                throw error;
            }
        }
    },
    Mutation: {
        createOwnership: async (_, { input }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                // Validate that the dog exists
                const dog = await models_1.default.Dog.findByPk(input.dogId);
                if (!dog) {
                    throw new apollo_server_express_1.UserInputError(`Dog with ID ${input.dogId} not found`);
                }
                // Validate that the owner exists
                const owner = await models_1.default.Owner.findByPk(input.ownerId);
                if (!owner) {
                    throw new apollo_server_express_1.UserInputError(`Owner with ID ${input.ownerId} not found`);
                }
                // Check for current ownership conflicts
                if (input.is_current) {
                    const currentOwnership = await models_1.default.Ownership.findOne({
                        where: {
                            dogId: input.dogId,
                            isCurrent: true
                        }
                    });
                    if (currentOwnership) {
                        throw new apollo_server_express_1.UserInputError('This dog already has a current owner. Use transferOwnership to change ownership.');
                    }
                }
                // Create ownership record
                const ownership = await models_1.default.Ownership.create(input);
                // Log ownership creation in audit trail
                await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.CREATE, 'Ownership', ownership.id.toString(), user.id, undefined, JSON.stringify({
                    dogId: ownership.dogId,
                    ownerId: ownership.ownerId,
                    startDate: ownership.startDate,
                    isCurrent: ownership.isCurrent
                }), context.req?.ip, `Ownership created for dog ${input.dogId} and owner ${input.ownerId}`);
                // Log system event
                await logger_1.default.logSystemEvent(`New ownership created for dog ${input.dogId}`, SystemLog_1.LogLevel.INFO, 'ownershipResolvers.createOwnership', `Owner ID: ${input.ownerId}, Current: ${input.is_current ? 'Yes' : 'No'}`, undefined, user.id, context.req?.ip);
                // Fetch with associations to return
                return await models_1.default.Ownership.findByPk(ownership.id, {
                    include: [
                        { model: models_1.default.Dog, as: 'dog' },
                        { model: models_1.default.Owner, as: 'owner' }
                    ]
                });
            }
            catch (error) {
                console.error('Error creating ownership:', error);
                throw error;
            }
        },
        transferOwnership: async (_, { input }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            const transaction = await models_1.default.Ownership.sequelize.transaction();
            try {
                const { dogId, newOwnerId, transferDate, transferDocumentUrl } = input;
                // Validate that the dog exists
                const dog = await models_1.default.Dog.findByPk(dogId);
                if (!dog) {
                    throw new apollo_server_express_1.UserInputError(`Dog with ID ${dogId} not found`);
                }
                // Validate that the new owner exists
                const newOwner = await models_1.default.Owner.findByPk(newOwnerId);
                if (!newOwner) {
                    throw new apollo_server_express_1.UserInputError(`Owner with ID ${newOwnerId} not found`);
                }
                // Find current ownership
                const currentOwnership = await models_1.default.Ownership.findOne({
                    where: {
                        dogId,
                        isCurrent: true
                    }
                });
                if (!currentOwnership) {
                    throw new apollo_server_express_1.UserInputError(`Dog with ID ${dogId} does not have a current ownership record`);
                }
                // End current ownership
                await currentOwnership.update({
                    endDate: transferDate,
                    isCurrent: false
                }, { transaction });
                // Create new ownership
                const newOwnership = await models_1.default.Ownership.create({
                    dogId,
                    ownerId: newOwnerId,
                    startDate: transferDate,
                    isCurrent: true,
                    transferDocumentUrl
                }, { transaction });
                await transaction.commit();
                // Log the ownership transfer in audit trail
                await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.UPDATE, 'Dog', dogId.toString(), user.id, JSON.stringify({
                    previousOwnerId: currentOwnership.ownerId,
                    endDate: transferDate,
                }), JSON.stringify({
                    newOwnerId,
                    transferDate,
                }), context.req?.ip, `Ownership transferred for dog ${dogId} from owner ${currentOwnership.ownerId} to owner ${newOwnerId}`);
                // Log system event
                await logger_1.default.logSystemEvent(`Dog ownership transferred from owner ${currentOwnership.ownerId} to owner ${newOwnerId}`, SystemLog_1.LogLevel.INFO, 'ownershipResolvers.transferOwnership', `Dog ID: ${dogId}, Transfer Date: ${transferDate}`, undefined, user.id, context.req?.ip);
                // Fetch full data with associations
                const [previousOwnershipData, newOwnershipData] = await Promise.all([
                    models_1.default.Ownership.findByPk(currentOwnership.id, {
                        include: [{ model: models_1.default.Owner, as: 'owner' }]
                    }),
                    models_1.default.Ownership.findByPk(newOwnership.id, {
                        include: [{ model: models_1.default.Owner, as: 'owner' }]
                    })
                ]);
                return {
                    previousOwnership: previousOwnershipData,
                    newOwnership: newOwnershipData,
                    dog
                };
            }
            catch (error) {
                await transaction.rollback();
                console.error('Error transferring ownership:', error);
                throw error;
            }
        },
        updateOwnership: async (_, { id, input }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                const ownership = await models_1.default.Ownership.findByPk(id);
                if (!ownership) {
                    throw new apollo_server_express_1.UserInputError(`Ownership with ID ${id} not found`);
                }
                // If setting is_current to true, check for conflicts
                if (input.is_current === true) {
                    const currentOwnership = await models_1.default.Ownership.findOne({
                        where: {
                            dogId: ownership.dogId,
                            isCurrent: true,
                            id: { [sequelize_1.Op.ne]: id } // Exclude the current record
                        }
                    });
                    if (currentOwnership) {
                        throw new apollo_server_express_1.UserInputError('This dog already has a different current owner. Use transferOwnership instead.');
                    }
                }
                await ownership.update(input);
                // Return with associations
                return await models_1.default.Ownership.findByPk(id, {
                    include: [
                        { model: models_1.default.Dog, as: 'dog' },
                        { model: models_1.default.Owner, as: 'owner' }
                    ]
                });
            }
            catch (error) {
                console.error('Error updating ownership:', error);
                throw error;
            }
        },
        deleteOwnership: async (_, { id }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                const ownership = await models_1.default.Ownership.findByPk(id);
                if (!ownership) {
                    throw new apollo_server_express_1.UserInputError(`Ownership with ID ${id} not found`);
                }
                // Check if this is a current ownership, which would leave the dog without an owner
                if (ownership.isCurrent) {
                    // This might be allowed with proper authorization, but we should warn about it
                    console.warn(`Deleting current ownership record for dog ID ${ownership.dogId}`);
                }
                // Here we would implement authorization checks
                // For example: check if the current user is an admin or has proper permissions
                await ownership.destroy();
                return {
                    success: true,
                    message: `Ownership record with ID ${id} has been deleted`
                };
            }
            catch (error) {
                console.error('Error deleting ownership record:', error);
                return {
                    success: false,
                    message: error instanceof Error
                        ? `Failed to delete ownership: ${error.message}`
                        : 'Failed to delete ownership: Unknown error'
                };
            }
        }
    },
    Ownership: {
        dog: async (parent) => {
            if (parent.dog)
                return parent.dog;
            return await models_1.default.Dog.findByPk(parent.dogId);
        },
        owner: async (parent) => {
            if (parent.owner)
                return parent.owner;
            return await models_1.default.Owner.findByPk(parent.ownerId);
        }
    },
    Owner: {
        ownerships: async (parent) => {
            return await models_1.default.Ownership.findAll({
                where: { ownerId: parent.id },
                order: [['startDate', 'DESC']]
            });
        },
        currentDogs: async (parent) => {
            const ownerships = await models_1.default.Ownership.findAll({
                where: {
                    ownerId: parent.id,
                    isCurrent: true
                },
                include: [{ model: models_1.default.Dog, as: 'dog' }]
            });
            return ownerships.map(ownership => ownership.dog);
        },
        user: async (parent) => {
            // This would be implemented if there's a User model
            if (!parent.userId)
                return null;
            // Assuming there's a User model, would fetch it like:
            // return await User.findByPk(parent.userId);
            // For now, return a placeholder:
            return parent.userId ? { id: parent.userId, email: 'user@example.com' } : null;
        }
    }
};
//# sourceMappingURL=ownershipResolvers.js.map