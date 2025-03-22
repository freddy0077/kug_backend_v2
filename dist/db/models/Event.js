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
            field: 'title'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            field: 'description'
        },
        eventType: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(EventType)),
            allowNull: false,
            field: 'event_type'
        },
        startDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'start_date'
        },
        endDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'end_date'
        },
        location: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            field: 'location'
        },
        address: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'address'
        },
        organizer: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            field: 'organizer'
        },
        organizerId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            field: 'organizer_id'
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
        website: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'website'
        },
        registrationUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'registration_url'
        },
        registrationDeadline: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'registration_deadline'
        },
        imageUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'image_url'
        },
        isPublished: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_published'
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
        tableName: 'Events',
        modelName: 'Event',
    });
    return Event;
};
exports.initEventModel = initEventModel;
exports.default = Event;
//# sourceMappingURL=Event.js.map