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
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        ownerId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Owners',
                key: 'id',
            },
            field: 'owner_id'
        },
        dogId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Dogs',
                key: 'id',
            },
            field: 'dog_id'
        },
        startDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'start_date'
        },
        endDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'end_date'
        },
        isCurrent: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            field: 'is_current'
        },
        transferDocumentUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'transfer_document_url'
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
        tableName: 'Ownerships',
        modelName: 'Ownership',
        underscored: true,
    });
    return Ownership;
};
exports.initOwnershipModel = initOwnershipModel;
exports.default = Ownership;
//# sourceMappingURL=Ownership.js.map