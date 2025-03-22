"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreedingProgramStatus = void 0;
const sequelize_1 = require("sequelize");
var BreedingProgramStatus;
(function (BreedingProgramStatus) {
    BreedingProgramStatus["PLANNING"] = "PLANNING";
    BreedingProgramStatus["ACTIVE"] = "ACTIVE";
    BreedingProgramStatus["PAUSED"] = "PAUSED";
    BreedingProgramStatus["COMPLETED"] = "COMPLETED";
    BreedingProgramStatus["CANCELLED"] = "CANCELLED";
})(BreedingProgramStatus || (exports.BreedingProgramStatus = BreedingProgramStatus = {}));
class BreedingProgram extends sequelize_1.Model {
    // Associations
    // These will be defined in the index.ts file
    static associate(models) {
        BreedingProgram.belongsTo(models.Owner, { foreignKey: 'breederId', as: 'breeder' });
        BreedingProgram.belongsToMany(models.Dog, {
            through: 'BreedingProgramFoundationDogs',
            foreignKey: 'breedingProgramId',
            as: 'foundationDogs'
        });
        BreedingProgram.hasMany(models.BreedingPair, {
            foreignKey: 'programId',
            as: 'breedingPairs'
        });
    }
    // Initialize method
    static initialize(sequelize) {
        BreedingProgram.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                field: 'name'
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
                field: 'description'
            },
            breederId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Owners',
                    key: 'id',
                },
                field: 'breeder_id'
            },
            breed: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                field: 'breed'
            },
            goals: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
                field: 'goals'
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
            status: {
                type: sequelize_1.DataTypes.ENUM(...Object.values(BreedingProgramStatus)),
                allowNull: false,
                defaultValue: BreedingProgramStatus.PLANNING,
                field: 'status'
            },
            geneticTestingProtocol: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                field: 'genetic_testing_protocol'
            },
            selectionCriteria: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                field: 'selection_criteria'
            },
            notes: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                field: 'notes'
            },
            isPublic: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_public'
            },
            imageUrl: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
                field: 'image_url'
            },
        }, {
            sequelize,
            modelName: 'BreedingProgram',
            tableName: 'BreedingPrograms',
            timestamps: true,
            underscored: true,
        });
    }
}
exports.default = BreedingProgram;
//# sourceMappingURL=BreedingProgram.js.map