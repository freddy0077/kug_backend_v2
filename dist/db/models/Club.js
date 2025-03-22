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
            field: 'name'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        logo: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'logo'
        },
        website: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'website'
        },
        contactEmail: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true,
            },
            field: 'contact_email'
        },
        contactPhone: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'contact_phone'
        },
        address: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'address'
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
        tableName: 'Clubs',
        modelName: 'Club',
    });
    return Club;
};
exports.initClubModel = initClubModel;
exports.default = Club;
//# sourceMappingURL=Club.js.map