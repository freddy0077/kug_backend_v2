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
            field: 'club_id'
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
            field: 'event_id'
        },
        membersOnly: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'members_only'
        },
        memberRegistrationFee: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: true,
            field: 'member_registration_fee'
        },
        nonMemberRegistrationFee: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: true,
            field: 'non_member_registration_fee'
        },
        maxParticipants: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'max_participants'
        },
        currentParticipants: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'current_participants'
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
        tableName: 'ClubEvents',
        modelName: 'ClubEvent',
    });
    return ClubEvent;
};
exports.initClubEventModel = initClubEventModel;
exports.default = ClubEvent;
//# sourceMappingURL=ClubEvent.js.map