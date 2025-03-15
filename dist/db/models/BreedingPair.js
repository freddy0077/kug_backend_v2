"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreedingPairStatus = void 0;
const sequelize_1 = require("sequelize");
var BreedingPairStatus;
(function (BreedingPairStatus) {
    BreedingPairStatus["PLANNED"] = "PLANNED";
    BreedingPairStatus["APPROVED"] = "APPROVED";
    BreedingPairStatus["PENDING_TESTING"] = "PENDING_TESTING";
    BreedingPairStatus["BREEDING_SCHEDULED"] = "BREEDING_SCHEDULED";
    BreedingPairStatus["BRED"] = "BRED";
    BreedingPairStatus["UNSUCCESSFUL"] = "UNSUCCESSFUL";
    BreedingPairStatus["CANCELLED"] = "CANCELLED";
})(BreedingPairStatus || (exports.BreedingPairStatus = BreedingPairStatus = {}));
class BreedingPair extends sequelize_1.Model {
    // Associations
    static associate(models) {
        BreedingPair.belongsTo(models.BreedingProgram, { foreignKey: 'programId', as: 'program' });
        BreedingPair.belongsTo(models.Dog, { foreignKey: 'sireId', as: 'sire' });
        BreedingPair.belongsTo(models.Dog, { foreignKey: 'damId', as: 'dam' });
        BreedingPair.hasMany(models.BreedingRecord, {
            foreignKey: 'breedingPairId',
            as: 'breedingRecords'
        });
    }
    // Initialize method
    static initialize(sequelize) {
        BreedingPair.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            programId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'BreedingPrograms',
                    key: 'id',
                },
            },
            sireId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Dogs',
                    key: 'id',
                },
            },
            damId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Dogs',
                    key: 'id',
                },
            },
            plannedBreedingDate: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            compatibilityNotes: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            geneticCompatibilityScore: {
                type: sequelize_1.DataTypes.FLOAT,
                allowNull: true,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM(...Object.values(BreedingPairStatus)),
                allowNull: false,
                defaultValue: BreedingPairStatus.PLANNED,
            },
        }, {
            sequelize,
            modelName: 'BreedingPair',
            tableName: 'BreedingPairs',
            timestamps: true,
            underscored: true,
        });
    }
}
exports.default = BreedingPair;
//# sourceMappingURL=BreedingPair.js.map