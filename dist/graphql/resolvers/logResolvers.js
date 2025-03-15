"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logResolvers = void 0;
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../../db/models"));
const SystemLog_1 = require("../../db/models/SystemLog");
const AuditLog_1 = require("../../db/models/AuditLog");
const auth_1 = require("../../utils/auth");
exports.logResolvers = {
    Query: {
        // System Log Queries
        systemLogs: async (_, { page = 1, limit = 20, level }, context) => {
            // Ensure user is authenticated and has admin role
            const user = await (0, auth_1.checkAuth)(context);
            (0, auth_1.requireAdminRole)(user);
            const offset = (page - 1) * limit;
            const where = {};
            if (level) {
                where.level = level;
            }
            const { count, rows } = await models_1.default.SystemLog.findAndCountAll({
                where,
                limit,
                offset,
                order: [['timestamp', 'DESC']],
                include: [
                    {
                        model: models_1.default.User,
                        as: 'user',
                        attributes: ['id', 'email', 'firstName', 'lastName']
                    }
                ]
            });
            return {
                totalCount: count,
                hasMore: count > offset + rows.length,
                items: rows
            };
        },
        systemLog: async (_, { id }, context) => {
            // Ensure user is authenticated and has admin role
            const user = await (0, auth_1.checkAuth)(context);
            (0, auth_1.requireAdminRole)(user);
            return models_1.default.SystemLog.findByPk(id, {
                include: [
                    {
                        model: models_1.default.User,
                        as: 'user',
                        attributes: ['id', 'email', 'firstName', 'lastName']
                    }
                ]
            });
        },
        // Audit Log Queries
        auditLogs: async (_, { page = 1, limit = 20, entityType, action }, context) => {
            // Ensure user is authenticated and has admin role
            const user = await (0, auth_1.checkAuth)(context);
            (0, auth_1.requireAdminRole)(user);
            const offset = (page - 1) * limit;
            const where = {};
            if (entityType) {
                where.entityType = entityType;
            }
            if (action) {
                where.action = action;
            }
            const { count, rows } = await models_1.default.AuditLog.findAndCountAll({
                where,
                limit,
                offset,
                order: [['timestamp', 'DESC']],
                include: [
                    {
                        model: models_1.default.User,
                        as: 'user',
                        attributes: ['id', 'email', 'firstName', 'lastName']
                    }
                ]
            });
            return {
                totalCount: count,
                hasMore: count > offset + rows.length,
                items: rows
            };
        },
        auditLog: async (_, { id }, context) => {
            // Ensure user is authenticated and has admin role
            const user = await (0, auth_1.checkAuth)(context);
            (0, auth_1.requireAdminRole)(user);
            return models_1.default.AuditLog.findByPk(id, {
                include: [
                    {
                        model: models_1.default.User,
                        as: 'user',
                        attributes: ['id', 'email', 'firstName', 'lastName']
                    }
                ]
            });
        }
    },
    Mutation: {
        createSystemLog: async (_, { message, level, source, details, stackTrace, ipAddress }, context) => {
            const user = await (0, auth_1.checkAuth)(context);
            (0, auth_1.requireAdminRole)(user);
            return models_1.default.SystemLog.create({
                timestamp: new Date(),
                message,
                level,
                source,
                details,
                stackTrace,
                ipAddress,
                userId: user.id
            });
        },
        createAuditLog: async (_, { action, entityType, entityId, previousState, newState, ipAddress, metadata }, context) => {
            const user = await (0, auth_1.checkAuth)(context);
            return models_1.default.AuditLog.create({
                timestamp: new Date(),
                action,
                entityType,
                entityId,
                previousState,
                newState,
                ipAddress,
                metadata,
                userId: user.id
            });
        },
        clearSystemLogs: async (_, { olderThan, level }, context) => {
            const user = await (0, auth_1.checkAuth)(context);
            (0, auth_1.requireAdminRole)(user);
            const where = {};
            if (olderThan) {
                where.timestamp = {
                    [sequelize_1.Op.lt]: olderThan
                };
            }
            if (level) {
                where.level = level;
            }
            // Log this action before performing it
            await models_1.default.AuditLog.create({
                timestamp: new Date(),
                action: AuditLog_1.AuditAction.DELETE,
                entityType: 'SystemLog',
                entityId: 'BULK',
                metadata: JSON.stringify({ olderThan, level }),
                userId: user.id,
                ipAddress: context.req?.ip
            });
            const deletedCount = await models_1.default.SystemLog.destroy({ where });
            return {
                success: true,
                message: `Successfully deleted ${deletedCount} system logs.`
            };
        },
        clearAuditLogs: async (_, { olderThan, entityType }, context) => {
            const user = await (0, auth_1.checkAuth)(context);
            (0, auth_1.requireAdminRole)(user);
            const where = {};
            if (olderThan) {
                where.timestamp = {
                    [sequelize_1.Op.lt]: olderThan
                };
            }
            if (entityType) {
                where.entityType = entityType;
            }
            // Log this action before performing it (in SystemLog since we're deleting AuditLogs)
            await models_1.default.SystemLog.create({
                timestamp: new Date(),
                level: SystemLog_1.LogLevel.WARNING,
                message: 'Audit logs cleared',
                source: 'GraphQL.Mutation.clearAuditLogs',
                details: JSON.stringify({ olderThan, entityType, userId: user.id }),
                userId: user.id,
                ipAddress: context.req?.ip
            });
            const deletedCount = await models_1.default.AuditLog.destroy({ where });
            return {
                success: true,
                message: `Successfully deleted ${deletedCount} audit logs.`
            };
        }
    },
    // Type resolvers
    SystemLog: {
        user: async (parent) => {
            if (!parent.userId)
                return null;
            return models_1.default.User.findByPk(parent.userId);
        }
    },
    AuditLog: {
        user: async (parent) => {
            return models_1.default.User.findByPk(parent.userId);
        }
    }
};
exports.default = exports.logResolvers;
//# sourceMappingURL=logResolvers.js.map