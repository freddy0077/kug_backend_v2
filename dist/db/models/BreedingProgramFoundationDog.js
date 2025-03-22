"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
class BreedingProgramFoundationDog extends sequelize_1.Model {
    // No associations needed for junction table
    // Initialize method
    static initialize(sequelize) {
        BreedingProgramFoundationDog.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            breedingProgramId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'BreedingPrograms',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                field: 'breeding_program_id'
            },
            dogId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Dogs',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                field: 'dog_id'
            },
        }, {
            sequelize,
            modelName: 'BreedingProgramFoundationDog',
            tableName: 'BreedingProgramFoundationDogs',
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['breedingProgramId', 'dogId'],
                },
            ],
        });
    }
}
exports.default = BreedingProgramFoundationDog;
//# sourceMappingURL=BreedingProgramFoundationDog.js.map