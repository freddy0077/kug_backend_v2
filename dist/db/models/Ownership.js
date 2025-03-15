"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOwnershipModel = void 0;
const sequelize_1 = require("sequelize");
class Ownership extends sequelize_1.Model {
    // Associations
    static associate(models) {
        Ownership.belongsTo(models.Owner, { as: 'owner', foreignKey: 'ownerId' });
        Ownership.belongsTo(models.Dog, { as: 'dog', foreignKey: 'dogId' });
    }
}
const initOwnershipModel = (sequelize) => {
    Ownership.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ownerId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Owners',
                key: 'id',
            },
        },
        dogId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Dogs',
                key: 'id',
            },
        },
        startDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        isCurrent: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
        },
        transferDocumentUrl: {
            type: sequelize_1.DataTypes.STRING,
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
        tableName: 'Ownerships',
        modelName: 'Ownership',
        underscored: true,
    });
    return Ownership;
};
exports.initOwnershipModel = initOwnershipModel;
exports.default = Ownership;
//# sourceMappingURL=Ownership.js.map