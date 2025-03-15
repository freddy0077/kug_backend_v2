"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initEventModel = exports.EventType = void 0;
const sequelize_1 = require("sequelize");
// Define the event types
var EventType;
(function (EventType) {
    EventType["SHOW"] = "SHOW";
    EventType["COMPETITION"] = "COMPETITION";
    EventType["SEMINAR"] = "SEMINAR";
    EventType["TRAINING"] = "TRAINING";
    EventType["MEETING"] = "MEETING";
    EventType["SOCIAL"] = "SOCIAL";
    EventType["OTHER"] = "OTHER";
})(EventType || (exports.EventType = EventType = {}));
class Event extends sequelize_1.Model {
    // Associations
    static associate(models) {
        Event.belongsToMany(models.Dog, {
            through: 'EventRegistrations',
            as: 'registeredDogs',
            foreignKey: 'eventId'
        });
        Event.hasMany(models.ClubEvent, {
            as: 'clubEvents',
            foreignKey: 'eventId'
        });
    }
}
const initEventModel = (sequelize) => {
    Event.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        eventType: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(EventType)),
            allowNull: false,
        },
        startDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        location: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        organizer: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        organizerId: {
            type: sequelize_1.DataTypes.INTEGER,
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
        website: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        registrationUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        registrationDeadline: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        imageUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        isPublished: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
        tableName: 'Events',
        modelName: 'Event',
    });
    return Event;
};
exports.initEventModel = initEventModel;
exports.default = Event;
//# sourceMappingURL=Event.js.map