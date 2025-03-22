"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOwnerModel = void 0;
const sequelize_1 = require("sequelize");
class Owner extends sequelize_1.Model {
    // Associations
    static associate(models) {
        Owner.hasMany(models.Ownership, { as: 'ownerships', foreignKey: 'ownerId' });
    }
}
const initOwnerModel = (sequelize) => {
    Owner.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
            field: 'user_id'
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            field: 'name'
        },
        contactEmail: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true,
            },
            field: 'contact_email'
        },
        contactPhone: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'contact_phone'
        },
        address: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'address'
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
        sequelize,
        tableName: 'Owners',
        modelName: 'Owner',
        underscored: false,
    });
    return Owner;
};
exports.initOwnerModel = initOwnerModel;
exports.default = Owner;
//# sourceMappingURL=Owner.js.map