"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initClubModel = void 0;
const sequelize_1 = require("sequelize");
class Club extends sequelize_1.Model {
    // Associations
    static associate(models) {
        Club.hasMany(models.ClubEvent, {
            as: 'events',
            foreignKey: 'clubId'
        });
    }
}
const initClubModel = (sequelize) => {
    Club.init({
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
            allowNull: true,
        },
        logo: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        website: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        contactEmail: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        contactPhone: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: sequelize_1.DataTypes.TEXT,
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
        tableName: 'Clubs',
        modelName: 'Club',
    });
    return Club;
};
exports.initClubModel = initClubModel;
exports.default = Club;
//# sourceMappingURL=Club.js.map