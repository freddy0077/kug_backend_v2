"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBreedingRecordModel = void 0;
const sequelize_1 = require("sequelize");
class BreedingRecord extends sequelize_1.Model {
    // Associations
    static associate(models) {
        BreedingRecord.belongsTo(models.Dog, { as: 'sire', foreignKey: 'sireId' });
        BreedingRecord.belongsTo(models.Dog, { as: 'dam', foreignKey: 'damId' });
        BreedingRecord.belongsToMany(models.Dog, {
            through: 'BreedingRecordPuppies',
            as: 'puppies',
            foreignKey: 'breedingRecordId',
            otherKey: 'puppyId'
        });
    }
}
const initBreedingRecordModel = (sequelize) => {
    BreedingRecord.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        sireId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Dogs',
                key: 'id',
            },
            field: 'sire_id'
        },
        damId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Dogs',
                key: 'id',
            },
            field: 'dam_id'
        },
        breedingDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'breeding_date'
        },
        litterSize: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'litter_size'
        },
        comments: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'comments'
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
        tableName: 'BreedingRecords',
        modelName: 'BreedingRecord',
        underscored: true,
    });
    return BreedingRecord;
};
exports.initBreedingRecordModel = initBreedingRecordModel;
exports.default = BreedingRecord;
//# sourceMappingURL=BreedingRecord.js.map