"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = void 0;
exports.initAuditLogModel = initAuditLogModel;
const sequelize_1 = require("sequelize");
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "CREATE";
    AuditAction["READ"] = "READ";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
    AuditAction["EXPORT"] = "EXPORT";
    AuditAction["IMPORT"] = "IMPORT";
    AuditAction["TRANSFER_OWNERSHIP"] = "TRANSFER_OWNERSHIP";
    AuditAction["APPROVE"] = "APPROVE";
    AuditAction["REJECT"] = "REJECT";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
class AuditLog extends sequelize_1.Model {
    // Association method to be called in models/index.ts
    static associate(models) {
        AuditLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
}
function initAuditLogModel(sequelize) {
    AuditLog.init({
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
        action: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(AuditAction)),
            allowNull: false,
            field: 'action'
        },
        entityType: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            field: 'entity_type'
        },
        entityId: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            field: 'entity_id'
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
            field: 'user_id',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        previousState: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'previous_state'
        },
        newState: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'new_state'
        },
        ipAddress: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'ip_address'
        },
        metadata: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'metadata'
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
        tableName: 'AuditLogs',
        sequelize,
    });
    return AuditLog;
}
exports.default = AuditLog;
//# sourceMappingURL=AuditLog.js.map