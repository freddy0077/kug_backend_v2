"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.breedingProgramResolvers = void 0;
const sequelize_1 = require("sequelize");
const apollo_server_express_1 = require("apollo-server-express");
const auth_1 = require("../../utils/auth");
const logger_1 = __importDefault(require("../../utils/logger"));
const SystemLog_1 = require("../../db/models/SystemLog");
const AuditLog_1 = require("../../db/models/AuditLog");
const models_1 = __importDefault(require("../../db/models"));
// Type aliases for better readability
const { BreedingProgram, BreedingPair, Dog, Owner, BreedingRecord, BreedingProgramFoundationDog } = models_1.default;
/**
 * Handles all Breeding Program related GraphQL queries and mutations
 */
exports.breedingProgramResolvers = {
    Query: {
        /**
         * Get a paginated list of breeding programs with optional filtering
         */
        breedingPrograms: async (_, { offset = 0, limit = 20, searchTerm, breederId, breed, status, includePrivate = false }, context) => {
            try {
                // Get authenticated user for logging and permission check
                const user = await (0, auth_1.checkAuth)(context);
                // Build where clause based on filters
                const whereClause = {};
                // Only show public programs unless the user is the breeder or admin, or includePrivate is true
                if (!includePrivate || !user?.role || (user?.role !== 'ADMIN' && user?.id !== breederId)) {
                    whereClause.isPublic = true;
                }
                if (searchTerm) {
                    whereClause[sequelize_1.Op.or] = [
                        { name: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                        { description: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } }
                    ];
                }
                if (breederId) {
                    whereClause.breederId = breederId;
                }
                if (breed) {
                    whereClause.breed = { [sequelize_1.Op.iLike]: breed };
                }
                if (status) {
                    whereClause.status = status;
                }
                // Log the query
                await logger_1.default.logSystemEvent(`Breeding programs query requested`, SystemLog_1.LogLevel.INFO, 'breedingProgramResolvers.breedingPrograms', `Filters: ${JSON.stringify({
                    searchTerm,
                    breederId,
                    breed,
                    status,
                    includePrivate,
                    offset,
                    limit
                })}`, undefined, user.id, context.req?.ip);
                // Also log an audit trail for data access
                await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.READ, 'BreedingProgram', 'collection', user.id, undefined, JSON.stringify({ filters: { searchTerm, breederId, breed, status, includePrivate }, pagination: { offset, limit } }), context.req?.ip, `Breeding programs listing accessed by ${user.username || 'Unknown'}`);
                // Query breeding programs
                const { count, rows } = await BreedingProgram.findAndCountAll({
                    where: whereClause,
                    order: [['updatedAt', 'DESC']],
                    limit,
                    offset,
                    include: [
                        {
                            model: Owner,
                            as: 'breeder',
                            attributes: ['id', 'name']
                        }
                    ]
                });
                return {
                    totalCount: count,
                    hasMore: offset + rows.length < count,
                    items: rows
                };
            }
            catch (error) {
                console.error('Error fetching breeding programs:', error);
                throw error;
            }
        },
        /**
         * Get detailed information about a specific breeding program
         */
        breedingProgram: async (_, { id }, context) => {
            try {
                // Get authenticated user for logging
                const user = await (0, auth_1.checkAuth)(context);
                // Log the lookup
                await logger_1.default.logSystemEvent(`Breeding program lookup by ID ${id}`, SystemLog_1.LogLevel.INFO, 'breedingProgramResolvers.breedingProgram', `Program details requested for ID: ${id}`, undefined, user.id, context.req?.ip);
                // Also log an audit trail for single entity access
                await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.READ, 'BreedingProgram', id.toString(), user.id, undefined, undefined, context.req?.ip, `Breeding program details accessed by ${user.username || 'Unknown'}`);
                const program = await BreedingProgram.findByPk(id, {
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
                            as: 'breedingPairs',
                            include: [
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
                        }
                    ]
                });
                if (!program) {
                    throw new apollo_server_express_1.UserInputError(`Breeding program with ID ${id} not found`);
                }
                // Check if the program is private and if the user has permission to view it
                if (!program.isPublic) {
                    // Only the breeder or an admin can view private programs
                    if (!user?.role || (user.role !== 'ADMIN' && user.id !== program.breederId)) {
                        throw new apollo_server_express_1.ForbiddenError('You do not have permission to view this breeding program');
                    }
                }
                return program;
            }
            catch (error) {
                console.error('Error fetching breeding program:', error);
                throw error;
            }
        },
        /**
         * Get detailed information about a specific breeding pair
         */
        breedingPair: async (_, { id }, context) => {
            try {
                // Get authenticated user for logging
                const user = await (0, auth_1.checkAuth)(context);
                // Log the lookup
                await logger_1.default.logSystemEvent(`Breeding pair lookup by ID ${id}`, SystemLog_1.LogLevel.INFO, 'breedingProgramResolvers.breedingPair', `Breeding pair details requested for ID: ${id}`, undefined, user.id, context.req?.ip);
                // Also log an audit trail for single entity access
                await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.READ, 'BreedingPair', id.toString(), user.id, undefined, undefined, context.req?.ip, `Breeding pair details accessed by ${user.username || 'Unknown'}`);
                const pair = await BreedingPair.findByPk(id, {
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
                if (!pair) {
                    throw new apollo_server_express_1.UserInputError(`Breeding pair with ID ${id} not found`);
                }
                // Fetch the associated breeding program for permission checking
                const program = await BreedingProgram.findByPk(pair.programId);
                // Check if the associated program is private and if the user has permission to view it
                if (program && !program.isPublic) {
                    // Only the breeder or an admin can view pairs in private programs
                    if (!user?.role || (user.role !== 'ADMIN' && user.id !== program.breederId)) {
                        throw new apollo_server_express_1.ForbiddenError('You do not have permission to view this breeding pair');
                    }
                }
                return pair;
            }
            catch (error) {
                console.error('Error fetching breeding pair:', error);
                throw error;
            }
        }
    }
};
//# sourceMappingURL=breedingProgramResolvers.js.map