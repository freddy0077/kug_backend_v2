"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.competitionResultResolvers = exports.SortDirection = exports.CompetitionSortField = exports.CompetitionCategory = void 0;
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../../db/models"));
const apollo_server_express_1 = require("apollo-server-express");
const auth_1 = require("../../utils/auth");
const logger_1 = __importDefault(require("../../utils/logger"));
const SystemLog_1 = require("../../db/models/SystemLog");
const AuditLog_1 = require("../../db/models/AuditLog");
var CompetitionCategory;
(function (CompetitionCategory) {
    CompetitionCategory["CONFORMATION"] = "CONFORMATION";
    CompetitionCategory["OBEDIENCE"] = "OBEDIENCE";
    CompetitionCategory["AGILITY"] = "AGILITY";
    CompetitionCategory["FIELD_TRIALS"] = "FIELD_TRIALS";
    CompetitionCategory["HERDING"] = "HERDING";
    CompetitionCategory["TRACKING"] = "TRACKING";
    CompetitionCategory["RALLY"] = "RALLY";
    CompetitionCategory["SCENT_WORK"] = "SCENT_WORK";
})(CompetitionCategory || (exports.CompetitionCategory = CompetitionCategory = {}));
var CompetitionSortField;
(function (CompetitionSortField) {
    CompetitionSortField["EVENT_DATE"] = "EVENT_DATE";
    CompetitionSortField["RANK"] = "RANK";
    CompetitionSortField["POINTS"] = "POINTS";
    CompetitionSortField["EVENT_NAME"] = "EVENT_NAME";
})(CompetitionSortField || (exports.CompetitionSortField = CompetitionSortField = {}));
var SortDirection;
(function (SortDirection) {
    SortDirection["ASC"] = "ASC";
    SortDirection["DESC"] = "DESC";
})(SortDirection || (exports.SortDirection = SortDirection = {}));
exports.competitionResultResolvers = {
    Query: {
        competitions: async (_, { offset = 0, limit = 20, searchTerm, category, dogId, startDate, endDate, sortBy = CompetitionSortField.EVENT_DATE, sortDirection = SortDirection.DESC }, context) => {
            try {
                // Get authenticated user for logging
                const user = await (0, auth_1.checkAuth)(context);
                // Build where clause based on filters
                const whereClause = {};
                if (searchTerm) {
                    whereClause.eventName = { [sequelize_1.Op.iLike]: `%${searchTerm}%` };
                }
                if (category) {
                    whereClause.category = category;
                }
                if (dogId) {
                    whereClause.dogId = dogId;
                }
                // Date range
                if (startDate || endDate) {
                    whereClause.eventDate = {};
                    if (startDate) {
                        whereClause.eventDate[sequelize_1.Op.gte] = startDate;
                    }
                    if (endDate) {
                        whereClause.eventDate[sequelize_1.Op.lte] = endDate;
                    }
                }
                // Log the query
                await logger_1.default.logSystemEvent(`Competition results query requested`, SystemLog_1.LogLevel.INFO, 'competitionResultResolvers.competitions', `Filters: ${JSON.stringify({
                    searchTerm,
                    category,
                    dogId,
                    startDate,
                    endDate,
                    sortBy,
                    sortDirection,
                    offset,
                    limit
                })}`, undefined, user.id, context.req?.ip);
                // Determine order parameter based on sortBy field
                let orderField;
                switch (sortBy) {
                    case CompetitionSortField.EVENT_DATE:
                        orderField = 'eventDate';
                        break;
                    case CompetitionSortField.RANK:
                        orderField = 'rank';
                        break;
                    case CompetitionSortField.POINTS:
                        orderField = 'points';
                        break;
                    case CompetitionSortField.EVENT_NAME:
                        orderField = 'eventName';
                        break;
                    default:
                        orderField = 'eventDate';
                }
                // Query competitions
                const { count, rows } = await models_1.default.CompetitionResult.findAndCountAll({
                    where: whereClause,
                    order: [[orderField, sortDirection]],
                    limit,
                    offset,
                    include: [
                        {
                            model: models_1.default.Dog,
                            as: 'dog',
                            attributes: ['id', 'name']
                        }
                    ]
                });
                // Map results and add dogName for convenience
                const items = rows.map((result) => {
                    const plainResult = result.get({ plain: true });
                    return {
                        ...plainResult,
                        dogName: plainResult.dog?.name || 'Unknown Dog'
                    };
                });
                return {
                    totalCount: count,
                    hasMore: offset + rows.length < count,
                    items
                };
            }
            catch (error) {
                console.error('Error fetching competitions:', error);
                throw error;
            }
        },
        competition: async (_, { id }, context) => {
            try {
                // Get authenticated user for logging
                const user = await (0, auth_1.checkAuth)(context);
                // Log the lookup
                await logger_1.default.logSystemEvent(`Competition result lookup by ID ${id}`, SystemLog_1.LogLevel.INFO, 'competitionResultResolvers.competition', undefined, undefined, user.id, context.req?.ip);
                const competition = await models_1.default.CompetitionResult.findByPk(id, {
                    include: [
                        {
                            model: models_1.default.Dog,
                            as: 'dog',
                            include: [
                                {
                                    model: models_1.default.Owner,
                                    as: 'currentOwner'
                                }
                            ]
                        }
                    ]
                });
                if (!competition) {
                    throw new apollo_server_express_1.UserInputError(`Competition with ID ${id} not found`);
                }
                // Add dogName property for convenience
                const result = competition.get({ plain: true });
                result.dogName = result.dog?.name || 'Unknown Dog';
                return result;
            }
            catch (error) {
                console.error('Error fetching competition by ID:', error);
                throw error;
            }
        },
        dogCompetitionStats: async (_, { dogId }, context) => {
            try {
                // Get authenticated user for logging
                const user = await (0, auth_1.checkAuth)(context);
                // Log the stats request
                await logger_1.default.logSystemEvent(`Competition statistics requested for dog ID ${dogId}`, SystemLog_1.LogLevel.INFO, 'competitionResultResolvers.dogCompetitionStats', undefined, undefined, user.id, context.req?.ip);
                // Validate dog exists
                const dog = await models_1.default.Dog.findByPk(dogId);
                if (!dog) {
                    throw new apollo_server_express_1.UserInputError(`Dog with ID ${dogId} not found`);
                }
                // Get total competitions
                const totalCompetitions = await models_1.default.CompetitionResult.count({
                    where: { dogId }
                });
                // Get total wins (rank = 1)
                const totalWins = await models_1.default.CompetitionResult.count({
                    where: { dogId, rank: 1 }
                });
                // Get category counts
                const categoryCounts = await models_1.default.CompetitionResult.findAll({
                    attributes: [
                        'category',
                        [sequelize_1.Sequelize.fn('COUNT', sequelize_1.Sequelize.col('id')), 'count']
                    ],
                    where: { dogId },
                    group: ['category']
                });
                // Get points by category
                const pointsByCategory = await models_1.default.CompetitionResult.findAll({
                    attributes: [
                        'category',
                        [sequelize_1.Sequelize.fn('SUM', sequelize_1.Sequelize.col('points')), 'points']
                    ],
                    where: { dogId },
                    group: ['category']
                });
                // Get recent results
                const recentResults = await models_1.default.CompetitionResult.findAll({
                    where: { dogId },
                    order: [['eventDate', 'DESC']],
                    limit: 5
                });
                return {
                    totalCompetitions,
                    totalWins,
                    categoryCounts: categoryCounts.map((c) => ({
                        category: c.getDataValue('category'),
                        count: parseInt(c.getDataValue('count'), 10)
                    })),
                    pointsByCategory: pointsByCategory.map((p) => ({
                        category: p.getDataValue('category'),
                        points: parseFloat(p.getDataValue('points')) || 0
                    })),
                    recentResults
                };
            }
            catch (error) {
                console.error('Error fetching dog competition stats:', error);
                throw error;
            }
        },
        relatedCompetitions: async (_, { competitionId, dogId, category, limit = 3 }, context) => {
            try {
                // Get authenticated user for logging
                const user = await (0, auth_1.checkAuth)(context);
                // Log the request
                await logger_1.default.logSystemEvent(`Related competitions requested for competition ID ${competitionId}`, SystemLog_1.LogLevel.INFO, 'competitionResultResolvers.relatedCompetitions', `Params: dogId=${dogId}, category=${category}, limit=${limit}`, undefined, user.id, context.req?.ip);
                // First, get the target competition
                const targetCompetition = await models_1.default.CompetitionResult.findByPk(competitionId);
                if (!targetCompetition) {
                    throw new apollo_server_express_1.UserInputError(`Competition with ID ${competitionId} not found`);
                }
                // Build where clause - exclude the target competition
                const whereClause = {
                    id: { [sequelize_1.Op.ne]: competitionId }
                };
                // If dogId is provided, use it; otherwise, use the target competition's dogId
                if (dogId) {
                    whereClause.dogId = dogId;
                }
                else if (targetCompetition.dogId) {
                    whereClause.dogId = targetCompetition.dogId;
                }
                // If category is provided, use it; otherwise, use the target competition's category
                if (category) {
                    whereClause.category = category;
                }
                else if (targetCompetition.category) {
                    whereClause.category = targetCompetition.category;
                }
                // Query related competitions
                const relatedCompetitions = await models_1.default.CompetitionResult.findAll({
                    where: whereClause,
                    order: [['eventDate', 'DESC']],
                    limit,
                    include: [
                        {
                            model: models_1.default.Dog,
                            as: 'dog',
                            attributes: ['id', 'name']
                        }
                    ]
                });
                // Map results and add dogName
                return relatedCompetitions.map((competition) => {
                    const plainResult = competition.get({ plain: true });
                    return {
                        ...plainResult,
                        dogName: plainResult.dog?.name || 'Unknown Dog'
                    };
                });
            }
            catch (error) {
                console.error('Error fetching related competitions:', error);
                throw error;
            }
        }
    },
    Mutation: {
        createCompetitionResult: async (_, { input }, context) => {
            try {
                // Get authenticated user for logging
                const user = await (0, auth_1.checkAuth)(context);
                // Verify dog exists
                const dog = await models_1.default.Dog.findByPk(input.dogId);
                if (!dog) {
                    throw new apollo_server_express_1.UserInputError(`Dog with ID ${input.dogId} not found`);
                }
                // Log the creation request
                await logger_1.default.logSystemEvent(`Competition result creation requested for dog ID ${input.dogId}`, SystemLog_1.LogLevel.INFO, 'competitionResultResolvers.createCompetitionResult', `Event: ${input.eventName}, Date: ${input.eventDate}, Category: ${input.category}`, undefined, user.id, context.req?.ip);
                // Create competition result
                const competitionResult = await models_1.default.CompetitionResult.create(input);
                // Log in audit trail
                await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.CREATE, 'CompetitionResult', competitionResult.id.toString(), user.id, undefined, JSON.stringify(input), context.req?.ip, `Created competition result for dog ${input.dogId}: ${input.eventName}`);
                // Return created result
                return await models_1.default.CompetitionResult.findByPk(competitionResult.id, {
                    include: [{ model: models_1.default.Dog, as: 'dog' }]
                });
            }
            catch (error) {
                console.error('Error creating competition result:', error);
                throw error;
            }
        },
        updateCompetitionResult: async (_, { id, input }, context) => {
            try {
                // Get authenticated user for logging
                const user = await (0, auth_1.checkAuth)(context);
                // Find competition result
                const competitionResult = await models_1.default.CompetitionResult.findByPk(id);
                if (!competitionResult) {
                    throw new apollo_server_express_1.UserInputError(`Competition result with ID ${id} not found`);
                }
                // Log the update request
                await logger_1.default.logSystemEvent(`Competition result update requested for ID ${id}`, SystemLog_1.LogLevel.INFO, 'competitionResultResolvers.updateCompetitionResult', `Requested changes: ${JSON.stringify(input)}`, undefined, user.id, context.req?.ip);
                // Store previous state for audit log
                const previousState = {
                    id: competitionResult.id,
                    dogId: competitionResult.dogId,
                    eventName: competitionResult.eventName,
                    eventDate: competitionResult.eventDate,
                    category: competitionResult.category,
                    rank: competitionResult.rank,
                    titleEarned: competitionResult.titleEarned,
                    points: competitionResult.points
                };
                // Update competition result
                await competitionResult.update(input);
                // Log in audit trail
                await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.UPDATE, 'CompetitionResult', id.toString(), user.id, JSON.stringify(previousState), JSON.stringify(input), context.req?.ip, `Updated competition result ${id} for dog ${competitionResult.dogId}`);
                // Return updated result
                return await models_1.default.CompetitionResult.findByPk(id, {
                    include: [{ model: models_1.default.Dog, as: 'dog' }]
                });
            }
            catch (error) {
                console.error('Error updating competition result:', error);
                throw error;
            }
        },
        deleteCompetitionResult: async (_, { id }, context) => {
            try {
                // Get authenticated user for logging
                const user = await (0, auth_1.checkAuth)(context);
                // Find competition result
                const competitionResult = await models_1.default.CompetitionResult.findByPk(id);
                if (!competitionResult) {
                    throw new apollo_server_express_1.UserInputError(`Competition result with ID ${id} not found`);
                }
                // Log system event before deletion
                await logger_1.default.logSystemEvent(`Competition result deletion requested for ID ${id}`, SystemLog_1.LogLevel.WARNING, 'competitionResultResolvers.deleteCompetitionResult', `Dog ID: ${competitionResult.dogId}, Event: ${competitionResult.eventName}`, undefined, user.id, context.req?.ip);
                // Store record details for audit log
                const competitionDetails = {
                    id: competitionResult.id,
                    dogId: competitionResult.dogId,
                    eventName: competitionResult.eventName,
                    eventDate: competitionResult.eventDate,
                    category: competitionResult.category,
                    rank: competitionResult.rank,
                    titleEarned: competitionResult.titleEarned,
                    points: competitionResult.points
                };
                // Delete competition result
                await competitionResult.destroy();
                // Log deletion in audit trail
                await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.DELETE, 'CompetitionResult', id.toString(), user.id, JSON.stringify(competitionDetails), undefined, context.req?.ip, `Deleted competition result ${id} for dog ${competitionDetails.dogId}`);
                return {
                    success: true,
                    message: 'Competition result deleted successfully'
                };
            }
            catch (error) {
                console.error('Error deleting competition result:', error);
                throw error;
            }
        }
    },
    CompetitionResult: {
        dog: async (parent) => {
            if (parent.dog)
                return parent.dog;
            return await models_1.default.Dog.findByPk(parent.dogId);
        }
    }
};
//# sourceMappingURL=competitionResultResolvers.js.map