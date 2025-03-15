"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCompetitionResultModel = void 0;
const sequelize_1 = require("sequelize");
class CompetitionResult extends sequelize_1.Model {
    // Associations
    static associate(models) {
        CompetitionResult.belongsTo(models.Dog, { as: 'dog', foreignKey: 'dogId' });
    }
}
const initCompetitionResultModel = (sequelize) => {
    CompetitionResult.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        dogId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Dogs',
                key: 'id',
            },
        },
        eventName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        eventDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        category: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        rank: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
        },
        titleEarned: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        points: {
            type: sequelize_1.DataTypes.FLOAT,
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
        tableName: 'CompetitionResults',
        modelName: 'CompetitionResult',
        underscored: true,
    });
    return CompetitionResult;
};
exports.initCompetitionResultModel = initCompetitionResultModel;
exports.default = CompetitionResult;
//# sourceMappingURL=CompetitionResult.js.map