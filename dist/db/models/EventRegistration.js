"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initEventRegistrationModel = void 0;
const sequelize_1 = require("sequelize");
class EventRegistration extends sequelize_1.Model {
    // Associations
    static associate(models) {
        EventRegistration.belongsTo(models.Event, { as: 'event', foreignKey: 'eventId' });
        EventRegistration.belongsTo(models.Dog, { as: 'dog', foreignKey: 'dogId' });
    }
}
const initEventRegistrationModel = (sequelize) => {
    EventRegistration.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        dogId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Dogs',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        registrationDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
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
        tableName: 'EventRegistrations',
        modelName: 'EventRegistration',
        indexes: [
            {
                unique: true,
                fields: ['eventId', 'dogId'],
            },
        ],
    });
    return EventRegistration;
};
exports.initEventRegistrationModel = initEventRegistrationModel;
exports.default = EventRegistration;
//# sourceMappingURL=EventRegistration.js.map