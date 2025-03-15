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
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
            },
            breederId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Owners',
                    key: 'id',
                },
            },
            breed: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            goals: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
            },
            startDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            endDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM(...Object.values(BreedingProgramStatus)),
                allowNull: false,
                defaultValue: BreedingProgramStatus.PLANNING,
            },
            geneticTestingProtocol: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            selectionCriteria: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            notes: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            isPublic: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            imageUrl: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
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