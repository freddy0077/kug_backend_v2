"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventResolvers = void 0;
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../../db/models"));
const types_1 = require("./types");
const apollo_server_express_1 = require("apollo-server-express");
exports.eventResolvers = {
    Query: {
        events: async (_, { offset = 0, limit = 20, searchTerm, eventType, startDate, endDate, location, organizerId, sortDirection = types_1.SortDirection.ASC }) => {
            try {
                const whereClause = {};
                if (searchTerm) {
                    whereClause[sequelize_1.Op.or] = [
                        { title: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                        { description: { [sequelize_1.Op.like]: `%${searchTerm}%` } },
                        { location: { [sequelize_1.Op.like]: `%${searchTerm}%` } }
                    ];
                }
                if (eventType) {
                    whereClause.eventType = eventType;
                }
                if (startDate) {
                    whereClause.startDate = { [sequelize_1.Op.gte]: startDate };
                }
                if (endDate) {
                    whereClause.endDate = { [sequelize_1.Op.lte]: endDate };
                }
                if (location) {
                    whereClause.location = { [sequelize_1.Op.like]: `%${location}%` };
                }
                if (organizerId) {
                    whereClause.organizerId = organizerId;
                }
                // Add isPublished filter for regular users
                // For admin users, this could be removed or made configurable
                whereClause.isPublished = true;
                const { count, rows } = await models_1.default.Event.findAndCountAll({
                    where: whereClause,
                    order: [['startDate', sortDirection]],
                    limit,
                    offset,
                });
                return {
                    totalCount: count,
                    hasMore: offset + rows.length < count,
                    items: rows
                };
            }
            catch (error) {
                console.error('Error fetching events:', error);
                throw new Error('Failed to fetch events');
            }
        },
        event: async (_, { id }) => {
            try {
                const event = await models_1.default.Event.findByPk(id);
                if (!event) {
                    throw new apollo_server_express_1.UserInputError(`Event with ID ${id} not found`);
                }
                return event;
            }
            catch (error) {
                console.error('Error fetching event by ID:', error);
                throw error;
            }
        },
        upcomingEvents: async (_, { days = 30, limit = 5, eventType }) => {
            try {
                const today = new Date();
                const futureDate = new Date();
                futureDate.setDate(today.getDate() + days);
                const whereClause = {
                    startDate: { [sequelize_1.Op.between]: [today, futureDate] },
                    isPublished: true
                };
                if (eventType) {
                    whereClause.eventType = eventType;
                }
                const upcomingEvents = await models_1.default.Event.findAll({
                    where: whereClause,
                    order: [['startDate', 'ASC']],
                    limit
                });
                return upcomingEvents;
            }
            catch (error) {
                console.error('Error fetching upcoming events:', error);
                throw new Error('Failed to fetch upcoming events');
            }
        }
    },
    Mutation: {
        createEvent: async (_, { input }) => {
            try {
                // Validate dates
                const startDate = new Date(input.startDate);
                const endDate = new Date(input.endDate);
                if (isNaN(startDate.getTime())) {
                    throw new apollo_server_express_1.UserInputError('Invalid start date');
                }
                if (isNaN(endDate.getTime())) {
                    throw new apollo_server_express_1.UserInputError('Invalid end date');
                }
                if (startDate > endDate) {
                    throw new apollo_server_express_1.UserInputError('Start date cannot be after end date');
                }
                // Create the event
                const event = await models_1.default.Event.create({
                    ...input,
                    startDate,
                    endDate,
                    registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : null
                });
                return event;
            }
            catch (error) {
                console.error('Error creating event:', error);
                throw error;
            }
        },
        updateEvent: async (_, { id, input }) => {
            try {
                const event = await models_1.default.Event.findByPk(id);
                if (!event) {
                    throw new apollo_server_express_1.UserInputError(`Event with ID ${id} not found`);
                }
                // Validate dates if provided
                if (input.startDate && input.endDate) {
                    const startDate = new Date(input.startDate);
                    const endDate = new Date(input.endDate);
                    if (startDate > endDate) {
                        throw new apollo_server_express_1.UserInputError('Start date cannot be after end date');
                    }
                }
                else if (input.startDate && !input.endDate) {
                    const startDate = new Date(input.startDate);
                    const currentEndDate = event.endDate;
                    if (startDate > currentEndDate) {
                        throw new apollo_server_express_1.UserInputError('Start date cannot be after end date');
                    }
                }
                else if (!input.startDate && input.endDate) {
                    const currentStartDate = event.startDate;
                    const endDate = new Date(input.endDate);
                    if (currentStartDate > endDate) {
                        throw new apollo_server_express_1.UserInputError('Start date cannot be after end date');
                    }
                }
                // Process date fields
                if (input.startDate) {
                    input.startDate = new Date(input.startDate);
                }
                if (input.endDate) {
                    input.endDate = new Date(input.endDate);
                }
                if (input.registrationDeadline) {
                    input.registrationDeadline = new Date(input.registrationDeadline);
                }
                await event.update(input);
                return event;
            }
            catch (error) {
                console.error('Error updating event:', error);
                throw error;
            }
        },
        publishEvent: async (_, { id }) => {
            try {
                const event = await models_1.default.Event.findByPk(id);
                if (!event) {
                    throw new apollo_server_express_1.UserInputError(`Event with ID ${id} not found`);
                }
                await event.update({ isPublished: true });
                return event;
            }
            catch (error) {
                console.error('Error publishing event:', error);
                throw error;
            }
        },
        registerDogForEvent: async (_, { eventId, dogId }) => {
            try {
                // Fetch the event and dog to ensure they exist
                const event = await models_1.default.Event.findByPk(eventId);
                const dog = await models_1.default.Dog.findByPk(dogId);
                if (!event) {
                    throw new apollo_server_express_1.UserInputError(`Event with ID ${eventId} not found`);
                }
                if (!dog) {
                    throw new apollo_server_express_1.UserInputError(`Dog with ID ${dogId} not found`);
                }
                // Check if the event is published
                if (!event.isPublished) {
                    throw new apollo_server_express_1.UserInputError('Cannot register for an unpublished event');
                }
                // Check if the dog is already registered for this event
                const existingRegistration = await models_1.default.EventRegistration.findOne({
                    where: {
                        eventId,
                        dogId
                    }
                });
                if (existingRegistration) {
                    throw new apollo_server_express_1.UserInputError(`Dog with ID ${dogId} is already registered for this event`);
                }
                // Create the registration
                const registration = await models_1.default.EventRegistration.create({
                    eventId,
                    dogId,
                    registrationDate: new Date()
                });
                // Return the registration with related data
                return {
                    event,
                    dog,
                    registrationDate: registration.registrationDate
                };
            }
            catch (error) {
                console.error('Error registering dog for event:', error);
                throw error;
            }
        }
    },
    Event: {
        registeredDogs: async (parent) => {
            try {
                const registrations = await models_1.default.EventRegistration.findAll({
                    where: { eventId: parent.id },
                    include: [{ model: models_1.default.Dog }]
                });
                return registrations.map((registration) => registration.Dog);
            }
            catch (error) {
                console.error('Error fetching registered dogs:', error);
                throw new Error('Failed to fetch registered dogs');
            }
        }
    }
};
//# sourceMappingURL=eventResolvers.js.map