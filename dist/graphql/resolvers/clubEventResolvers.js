"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clubEventResolvers = void 0;
const models_1 = __importDefault(require("../../db/models"));
const apollo_server_express_1 = require("apollo-server-express");
exports.clubEventResolvers = {
    Query: {
        clubEvents: async (_, { clubId, offset = 0, limit = 20, includeNonMemberEvents = true }) => {
            try {
                // First check if club exists
                const club = await models_1.default.Club.findByPk(clubId);
                if (!club) {
                    throw new apollo_server_express_1.UserInputError(`Club with ID ${clubId} not found`);
                }
                const whereClause = { clubId };
                // If we don't want non-member events, filter them out
                if (!includeNonMemberEvents) {
                    whereClause.membersOnly = true;
                }
                // Find club events with their associated events
                const { count, rows } = await models_1.default.ClubEvent.findAndCountAll({
                    where: whereClause,
                    include: [
                        {
                            model: models_1.default.Event,
                            where: { isPublished: true }, // Only include published events
                            required: true
                        }
                    ],
                    limit,
                    offset,
                    order: [[models_1.default.Event, 'startDate', 'ASC']] // Order by event start date
                });
                return {
                    totalCount: count,
                    hasMore: offset + rows.length < count,
                    items: rows
                };
            }
            catch (error) {
                console.error('Error fetching club events:', error);
                throw error;
            }
        },
        clubs: async () => {
            try {
                return await models_1.default.Club.findAll();
            }
            catch (error) {
                console.error('Error fetching clubs:', error);
                throw new Error('Failed to fetch clubs');
            }
        },
        club: async (_, { id }) => {
            try {
                const club = await models_1.default.Club.findByPk(id);
                if (!club) {
                    throw new apollo_server_express_1.UserInputError(`Club with ID ${id} not found`);
                }
                return club;
            }
            catch (error) {
                console.error('Error fetching club by ID:', error);
                throw error;
            }
        }
    },
    Mutation: {
        createClubEvent: async (_, { input }) => {
            try {
                const { clubId, eventInput, membersOnly, memberRegistrationFee, nonMemberRegistrationFee, maxParticipants } = input;
                // Check if club exists
                const club = await models_1.default.Club.findByPk(clubId);
                if (!club) {
                    throw new apollo_server_express_1.UserInputError(`Club with ID ${clubId} not found`);
                }
                // Validate dates
                const startDate = new Date(eventInput.startDate);
                const endDate = new Date(eventInput.endDate);
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
                    ...eventInput,
                    startDate,
                    endDate,
                    organizer: club.name, // Set club name as organizer
                    organizerId: clubId,
                    registrationDeadline: eventInput.registrationDeadline ? new Date(eventInput.registrationDeadline) : null
                });
                // Create the club event linking the event to the club
                const clubEvent = await models_1.default.ClubEvent.create({
                    clubId,
                    eventId: event.id,
                    membersOnly,
                    memberRegistrationFee,
                    nonMemberRegistrationFee,
                    maxParticipants,
                    currentParticipants: 0
                });
                // Load the complete club event with related event and club
                const fullClubEvent = await models_1.default.ClubEvent.findByPk(clubEvent.id, {
                    include: [
                        { model: models_1.default.Event },
                        { model: models_1.default.Club }
                    ]
                });
                return fullClubEvent;
            }
            catch (error) {
                console.error('Error creating club event:', error);
                throw error;
            }
        }
    },
    ClubEvent: {
        club: async (parent) => {
            try {
                return await models_1.default.Club.findByPk(parent.clubId);
            }
            catch (error) {
                console.error('Error fetching club for club event:', error);
                throw new Error('Failed to fetch club');
            }
        },
        event: async (parent) => {
            try {
                return await models_1.default.Event.findByPk(parent.eventId);
            }
            catch (error) {
                console.error('Error fetching event for club event:', error);
                throw new Error('Failed to fetch event');
            }
        }
    },
    Club: {
        events: async (parent) => {
            try {
                const clubEvents = await models_1.default.ClubEvent.findAll({
                    where: { clubId: parent.id },
                    include: [
                        {
                            model: models_1.default.Event,
                            where: { isPublished: true },
                            required: true
                        }
                    ]
                });
                return clubEvents;
            }
            catch (error) {
                console.error('Error fetching events for club:', error);
                throw new Error('Failed to fetch events for club');
            }
        }
    }
};
//# sourceMappingURL=clubEventResolvers.js.map