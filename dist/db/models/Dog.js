"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDogModel = void 0;
const sequelize_1 = require("sequelize");
class Dog extends sequelize_1.Model {
    // Associations
    static associate(models) {
        // Self-references for family relationships
        Dog.belongsTo(models.Dog, { as: 'sire', foreignKey: 'sireId' });
        Dog.belongsTo(models.Dog, { as: 'dam', foreignKey: 'damId' });
        Dog.hasMany(models.Dog, { as: 'offspring', foreignKey: 'sireId' });
        Dog.hasMany(models.Dog, { as: 'maternalOffspring', foreignKey: 'damId' });
        // Other associations
        Dog.hasMany(models.DogImage, { as: 'images', foreignKey: 'dogId' });
        Dog.hasMany(models.HealthRecord, { as: 'healthRecords', foreignKey: 'dogId' });
        Dog.hasMany(models.CompetitionResult, { as: 'competitionResults', foreignKey: 'dogId' });
        Dog.hasMany(models.Ownership, { as: 'ownerships', foreignKey: 'dogId' });
    }
}
const initDogModel = (sequelize) => {
    Dog.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        breed: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        gender: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['male', 'female']],
            },
        },
        dateOfBirth: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        dateOfDeath: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        color: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        registrationNumber: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        microchipNumber: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        titles: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
            allowNull: true,
        },
        isNeutered: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: true,
        },
        height: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: true,
        },
        weight: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: true,
        },
        biography: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        mainImageUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        sireId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Dogs',
                key: 'id',
            },
        },
        damId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Dogs',
                key: 'id',
            },
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
        tableName: 'Dogs',
        modelName: 'Dog',
        underscored: true,
    });
    return Dog;
};
exports.initDogModel = initDogModel;
exports.default = Dog;
//# sourceMappingURL=Dog.js.map