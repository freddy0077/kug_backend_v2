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
        },
        level: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(LogLevel)),
            allowNull: false,
        },
        message: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        source: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        details: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        stackTrace: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        ipAddress: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
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
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
    }, {
        tableName: 'SystemLogs',
        sequelize,
    });
    return SystemLog;
}
exports.default = SystemLog;
//# sourceMappingURL=SystemLog.js.map