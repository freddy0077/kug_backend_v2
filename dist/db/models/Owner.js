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
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        contactEmail: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        contactPhone: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
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
        sequelize,
        tableName: 'Owners',
        modelName: 'Owner',
        underscored: true,
    });
    return Owner;
};
exports.initOwnerModel = initOwnerModel;
exports.default = Owner;
//# sourceMappingURL=Owner.js.map