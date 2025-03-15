"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRecordResolvers = void 0;
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../../db/models"));
const HealthRecord_1 = require("../../db/models/HealthRecord");
const types_1 = require("./types");
const apollo_server_express_1 = require("apollo-server-express");
const logger_1 = __importDefault(require("../../utils/logger"));
const SystemLog_1 = require("../../db/models/SystemLog");
const AuditLog_1 = require("../../db/models/AuditLog");
const auth_1 = require("../../utils/auth");
exports.healthRecordResolvers = {
    Query: {
        dogHealthRecords: async (_, { dogId, offset = 0, limit = 20, type, startDate, endDate, sortDirection = types_1.SortDirection.DESC }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                // First check if dog exists
                const dog = await models_1.default.Dog.findByPk(dogId);
                if (!dog) {
                    throw new apollo_server_express_1.UserInputError(`Dog with ID ${dogId} not found`);
                }
                const whereClause = { dogId };
                if (type) {
                    whereClause.type = type;
                }
                if (startDate) {
                    whereClause.date = whereClause.date || {};
                    whereClause.date[sequelize_1.Op.gte] = startDate;
                }
                if (endDate) {
                    whereClause.date = whereClause.date || {};
                    whereClause.date[sequelize_1.Op.lte] = endDate;
                }
                const { count, rows } = await models_1.default.HealthRecord.findAndCountAll({
                    where: whereClause,
                    order: [['date', sortDirection]],
                    limit,
                    offset,
                });
                return {
                    totalCount: count,
                    hasMore: offset + rows.length < count,
                    items: rows
                };
            }
            catch (error) {
                console.error('Error fetching dog health records:', error);
                throw error;
            }
        },
        healthRecord: async (_, { id }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                // Add system logging for record access
                await logger_1.default.logSystemEvent(`Health record lookup by ID ${id}`, SystemLog_1.LogLevel.INFO, 'healthRecordResolvers.healthRecord', undefined, undefined, user.id, context.req?.ip);
                const healthRecord = await models_1.default.HealthRecord.findByPk(id, {
                    include: [{ model: models_1.default.Dog, as: 'dog' }]
                });
                if (!healthRecord) {
                    throw new apollo_server_express_1.UserInputError(`Health record with ID ${id} not found`);
                }
                return healthRecord;
            }
            catch (error) {
                console.error('Error fetching health record by ID:', error);
                throw error;
            }
        },
        healthSummary: async (_, { dogId }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                // First check if dog exists
                const dog = await models_1.default.Dog.findByPk(dogId);
                if (!dog) {
                    throw new apollo_server_express_1.UserInputError(`Dog with ID ${dogId} not found`);
                }
                // Count total records
                const recordCount = await models_1.default.HealthRecord.count({
                    where: { dogId }
                });
                // Find latest examination date
                const latestExam = await models_1.default.HealthRecord.findOne({
                    where: {
                        dogId,
                        type: HealthRecord_1.HealthRecordType.EXAMINATION
                    },
                    order: [['date', 'DESC']]
                });
                // Get count by record type
                const recordsByType = await Promise.all(Object.values(HealthRecord_1.HealthRecordType).map(async (type) => {
                    const count = await models_1.default.HealthRecord.count({
                        where: { dogId, type }
                    });
                    return { type, count };
                }));
                // Get recent records (last 5)
                const recentRecords = await models_1.default.HealthRecord.findAll({
                    where: { dogId },
                    order: [['date', 'DESC']],
                    limit: 5
                });
                // Calculate vaccination status
                // Assumptions: 
                // 1. Vaccinations are valid for 1 year
                // 2. Core vaccinations should include: Rabies, Distemper, Parvovirus
                const vaccinations = await models_1.default.HealthRecord.findAll({
                    where: {
                        dogId,
                        type: HealthRecord_1.HealthRecordType.VACCINATION
                    },
                    order: [['date', 'DESC']]
                });
                // Simple algorithm to check if vaccinations are up to date
                // In a real application, this would be more sophisticated
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                const isUpToDate = vaccinations.some(v => v.date > oneYearAgo);
                // Calculate next due date (1 year after the most recent vaccination)
                let nextDueDate = null;
                if (vaccinations.length > 0) {
                    const mostRecentVaccination = vaccinations[0]; // Already sorted by DESC date
                    nextDueDate = new Date(mostRecentVaccination.date);
                    nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                }
                // Check for missing core vaccinations (simplified example)
                const missingVaccinations = [];
                const coreVaccinations = ['Rabies', 'Distemper', 'Parvovirus'];
                // Basic check for missing vaccinations based on description field
                // In a real system, this would be more structured
                coreVaccinations.forEach(vax => {
                    const hasVax = vaccinations.some(v => v.description.toLowerCase().includes(vax.toLowerCase()));
                    if (!hasVax) {
                        missingVaccinations.push(vax);
                    }
                });
                return {
                    recordCount,
                    latestExamDate: latestExam?.date || null,
                    recordsByType,
                    recentRecords,
                    vaccinationStatus: {
                        isUpToDate,
                        nextDueDate,
                        missingVaccinations
                    }
                };
            }
            catch (error) {
                console.error('Error generating health summary:', error);
                throw error;
            }
        }
    },
    Mutation: {
        createHealthRecord: async (_, { input }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                // Validate that the dog exists
                const dog = await models_1.default.Dog.findByPk(input.dogId);
                if (!dog) {
                    throw new apollo_server_express_1.UserInputError(`Dog with ID ${input.dogId} not found`);
                }
                // Validate date
                const date = new Date(input.date);
                if (isNaN(date.getTime())) {
                    throw new apollo_server_express_1.UserInputError('Invalid date format');
                }
                // Create health record
                const healthRecord = await models_1.default.HealthRecord.create({
                    ...input,
                    date
                });
                // Log creation in audit trail
                await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.CREATE, 'HealthRecord', healthRecord.id.toString(), user.id, undefined, JSON.stringify({
                    dogId: healthRecord.dogId,
                    type: healthRecord.type,
                    date: healthRecord.date,
                    description: healthRecord.description,
                    results: healthRecord.results,
                    performedBy: healthRecord.veterinarian
                }), context.req?.ip, `Health record created for dog ${input.dogId}`);
                return healthRecord;
            }
            catch (error) {
                console.error('Error creating health record:', error);
                throw error;
            }
        },
        updateHealthRecord: async (_, { id, input }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                const healthRecord = await models_1.default.HealthRecord.findByPk(id);
                if (!healthRecord) {
                    throw new apollo_server_express_1.UserInputError(`Health record with ID ${id} not found`);
                }
                // Validate date if provided
                if (input.date) {
                    const date = new Date(input.date);
                    if (isNaN(date.getTime())) {
                        throw new apollo_server_express_1.UserInputError('Invalid date format');
                    }
                    input.date = date;
                }
                // Get previous state for audit log
                const previousState = JSON.stringify({
                    type: healthRecord.type,
                    date: healthRecord.date,
                    description: healthRecord.description,
                    results: healthRecord.results,
                    performedBy: healthRecord.veterinarian
                });
                // Update the record
                await healthRecord.update(input);
                // Log update in audit trail
                await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.UPDATE, 'HealthRecord', healthRecord.id.toString(), user.id, previousState, JSON.stringify(input), context.req?.ip, `Health record updated for dog ${healthRecord.dogId}`);
                return healthRecord;
            }
            catch (error) {
                console.error('Error updating health record:', error);
                throw error;
            }
        },
        deleteHealthRecord: async (_, { id }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                const healthRecord = await models_1.default.HealthRecord.findByPk(id);
                if (!healthRecord) {
                    throw new apollo_server_express_1.UserInputError(`Health record with ID ${id} not found`);
                }
                // Here we would implement authorization checks
                // For example: check if the current user is the owner or has admin rights
                // For now, we'll just proceed with deletion
                // Log system event for record deletion request
                await logger_1.default.logSystemEvent(`Health record deletion requested for ID ${id}`, SystemLog_1.LogLevel.WARNING, 'healthRecordResolvers.deleteHealthRecord', `Dog ID: ${healthRecord.dogId}`, undefined, user.id, context.req?.ip);
                // Get record details for audit log
                const recordDetails = JSON.stringify({
                    id: healthRecord.id,
                    dogId: healthRecord.dogId,
                    type: healthRecord.type,
                    date: healthRecord.date,
                    description: healthRecord.description
                });
                // Delete the record
                await healthRecord.destroy();
                // Log deletion in audit trail
                await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.DELETE, 'HealthRecord', id.toString(), user.id, recordDetails, undefined, context.req?.ip, `Health record deleted for dog ${healthRecord.dogId}`);
                return {
                    success: true,
                    message: `Health record with ID ${id} has been deleted`
                };
            }
            catch (error) {
                console.error('Error deleting health record:', error);
                return {
                    success: false,
                    message: `Failed to delete health record`
                };
            }
        },
        uploadHealthRecordAttachment: async (_, { healthRecordId, fileUrl }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                const healthRecord = await models_1.default.HealthRecord.findByPk(healthRecordId);
                if (!healthRecord) {
                    throw new apollo_server_express_1.UserInputError(`Health record with ID ${healthRecordId} not found`);
                }
                // Simply use the provided URL string directly instead of processing a file upload
                await healthRecord.update({
                    attachmentUrl: fileUrl
                });
                // Log attachment upload in audit trail
                await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.UPDATE, 'HealthRecord', healthRecord.id.toString(), user.id, undefined, JSON.stringify({
                    attachmentAdded: true,
                    url: fileUrl
                }), context.req?.ip, `File attachment added to health record ${healthRecord.id}`);
                return healthRecord;
            }
            catch (error) {
                console.error('Error uploading health record attachment:', error);
                // Add this type check or cast
                if (error instanceof Error) {
                    throw new apollo_server_express_1.UserInputError('File upload error: ' + error.message);
                }
                else {
                    throw new apollo_server_express_1.UserInputError('File upload error: Unknown error');
                }
            }
        }
    },
    HealthRecord: {
        dog: async (parent) => {
            try {
                return await models_1.default.Dog.findByPk(parent.dogId);
            }
            catch (error) {
                console.error('Error fetching dog for health record:', error);
                throw new Error('Failed to fetch dog for health record');
            }
        }
    }
};
//# sourceMappingURL=healthRecordResolvers.js.map