"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const models_1 = __importDefault(require("../db/models"));
/**
 * Utility class for logging activities in the application
 */
class Logger {
    /**
     * Log a system event
     *
     * @param message - Log message
     * @param level - Severity level
     * @param source - Source of the log entry
     * @param details - Additional details
     * @param stackTrace - Stack trace for errors
     * @param userId - ID of the user who triggered the event
     * @param ipAddress - IP address of the request
     * @returns Promise that resolves to the created log entry
     */
    static async logSystemEvent(message, level, source, details, stackTrace, userId, ipAddress) {
        try {
            return await models_1.default.SystemLog.create({
                timestamp: new Date(),
                message,
                level,
                source,
                details,
                stackTrace,
                userId,
                ipAddress
            });
        }
        catch (error) {
            console.error('Failed to create system log entry:', error);
            return null;
        }
    }
    /**
     * Log an audit trail entry
     *
     * @param action - Type of action performed
     * @param entityType - Type of entity affected (Dog, Owner, etc.)
     * @param entityId - ID of the affected entity
     * @param userId - ID of the user who performed the action
     * @param previousState - JSON string of entity state before change
     * @param newState - JSON string of entity state after change
     * @param ipAddress - IP address of the request
     * @param metadata - Any additional information
     * @returns Promise that resolves to the created audit entry
     */
    static async logAuditTrail(action, entityType, entityId, userId, previousState, newState, ipAddress, metadata) {
        try {
            return await models_1.default.AuditLog.create({
                timestamp: new Date(),
                action,
                entityType,
                entityId,
                userId,
                previousState,
                newState,
                ipAddress,
                metadata
            });
        }
        catch (error) {
            console.error('Failed to create audit log entry:', error);
            return null;
        }
    }
}
exports.Logger = Logger;
exports.default = Logger;
//# sourceMappingURL=logger.js.map