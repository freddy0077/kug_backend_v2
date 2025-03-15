"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initClubEventModel = void 0;
const sequelize_1 = require("sequelize");
class ClubEvent extends sequelize_1.Model {
    // Associations
    static associate(models) {
        ClubEvent.belongsTo(models.Club, { as: 'club', foreignKey: 'clubId' });
        ClubEvent.belongsTo(models.Event, { as: 'event', foreignKey: 'eventId' });
    }
}
const initClubEventModel = (sequelize) => {
    ClubEvent.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        clubId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Clubs',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        eventId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Events',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        membersOnly: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        memberRegistrationFee: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: true,
        },
        nonMemberRegistrationFee: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: true,
        },
        maxParticipants: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
        },
        currentParticipants: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
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
        tableName: 'ClubEvents',
        modelName: 'ClubEvent',
    });
    return ClubEvent;
};
exports.initClubEventModel = initClubEventModel;
exports.default = ClubEvent;
//# sourceMappingURL=ClubEvent.js.map