"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBreedingRecordPuppyModel = void 0;
const sequelize_1 = require("sequelize");
class BreedingRecordPuppy extends sequelize_1.Model {
}
const initBreedingRecordPuppyModel = (sequelize) => {
    BreedingRecordPuppy.init({
        breedingRecordId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'BreedingRecords',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        puppyId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'Dogs',
                key: 'id',
            },
            onDelete: 'CASCADE',
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
        tableName: 'BreedingRecordPuppies',
        modelName: 'BreedingRecordPuppy',
    });
    return BreedingRecordPuppy;
};
exports.initBreedingRecordPuppyModel = initBreedingRecordPuppyModel;
exports.default = BreedingRecordPuppy;
//# sourceMappingURL=BreedingRecordPuppy.js.map