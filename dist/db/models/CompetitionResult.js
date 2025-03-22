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
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
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
        eventName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            field: 'event_name'
        },
        eventDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'event_date'
        },
        category: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'category'
        },
        rank: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'rank'
        },
        place: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('rank');
            },
            set(value) {
                this.setDataValue('rank', value);
            }
        },
        titleEarned: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'title_earned'
        },
        points: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: true,
            field: 'points'
        },
        score: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('points');
            },
            set(value) {
                this.setDataValue('points', value);
            }
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
        tableName: 'CompetitionResults',
        modelName: 'CompetitionResult',
        underscored: true,
    });
    return CompetitionResult;
};
exports.initCompetitionResultModel = initCompetitionResultModel;
exports.default = CompetitionResult;
//# sourceMappingURL=CompetitionResult.js.map