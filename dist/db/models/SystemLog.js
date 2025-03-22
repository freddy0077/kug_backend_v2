"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = void 0;
exports.initSystemLogModel = initSystemLogModel;
const sequelize_1 = require("sequelize");
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARNING"] = "WARNING";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["CRITICAL"] = "CRITICAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class SystemLog extends sequelize_1.Model {
    // Association method to be called in models/index.ts
    static associate(models) {
        SystemLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
}
function initSystemLogModel(sequelize) {
    SystemLog.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        timestamp: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'timestamp'
        },
        level: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(LogLevel)),
            allowNull: false,
            field: 'level'
        },
        message: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            field: 'message'
        },
        source: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            field: 'source'
        },
        details: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'details'
        },
        stackTrace: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'stack_trace'
        },
        ipAddress: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'ip_address'
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            field: 'user_id'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'created_at'
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'updated_at'
        },
    }, {
        tableName: 'SystemLogs',
        sequelize,
    });
    return SystemLog;
}
exports.default = SystemLog;
//# sourceMappingURL=SystemLog.js.map