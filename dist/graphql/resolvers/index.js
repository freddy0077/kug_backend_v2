"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dogResolvers_1 = require("./dogResolvers");
const eventResolvers_1 = require("./eventResolvers");
const clubEventResolvers_1 = require("./clubEventResolvers");
const healthRecordResolvers_1 = require("./healthRecordResolvers");
const ownershipResolvers_1 = require("./ownershipResolvers");
const pedigreeResolvers_1 = __importDefault(require("./pedigreeResolvers"));
const userResolvers_1 = require("./userResolvers");
const logResolvers_1 = require("./logResolvers");
const competitionResultResolvers_1 = require("./competitionResultResolvers");
const breedingResolvers_1 = require("./breedingResolvers");
const scalarResolvers_1 = require("./scalarResolvers");
const models_1 = __importDefault(require("../../db/models"));
// Combine all resolvers
const resolvers = {
    // Scalar types
    DateTime: scalarResolvers_1.dateTimeScalar,
    // Merge Query resolvers
    Query: {
        ...dogResolvers_1.dogResolvers.Query,
        ...eventResolvers_1.eventResolvers.Query,
        ...clubEventResolvers_1.clubEventResolvers.Query,
        ...healthRecordResolvers_1.healthRecordResolvers.Query,
        ...ownershipResolvers_1.ownershipResolvers.Query,
        ...pedigreeResolvers_1.default.Query,
        ...userResolvers_1.userResolvers.Query,
        ...logResolvers_1.logResolvers.Query,
        ...competitionResultResolvers_1.competitionResultResolvers.Query,
        ...breedingResolvers_1.breedingResolvers.Query,
    },
    // Merge Mutation resolvers
    Mutation: {
        ...dogResolvers_1.dogResolvers.Mutation,
        ...eventResolvers_1.eventResolvers.Mutation,
        ...clubEventResolvers_1.clubEventResolvers.Mutation,
        ...healthRecordResolvers_1.healthRecordResolvers.Mutation,
        ...ownershipResolvers_1.ownershipResolvers.Mutation,
        ...pedigreeResolvers_1.default.Mutation,
        ...userResolvers_1.userResolvers.Mutation,
        ...logResolvers_1.logResolvers.Mutation,
        ...competitionResultResolvers_1.competitionResultResolvers.Mutation,
        ...breedingResolvers_1.breedingResolvers.Mutation,
    },
    // Type resolvers
    Dog: dogResolvers_1.dogResolvers.Dog,
    DogImage: {
        dog: async (parent) => {
            return await models_1.default.Dog.findByPk(parent.dogId);
        }
    },
    CompetitionResult: competitionResultResolvers_1.competitionResultResolvers.CompetitionResult,
    // Event type resolvers
    Event: eventResolvers_1.eventResolvers.Event,
    ClubEvent: clubEventResolvers_1.clubEventResolvers.ClubEvent,
    Club: clubEventResolvers_1.clubEventResolvers.Club,
    // Health record type resolvers
    HealthRecord: healthRecordResolvers_1.healthRecordResolvers.HealthRecord,
    // Log type resolvers
    SystemLog: logResolvers_1.logResolvers.SystemLog,
    AuditLog: logResolvers_1.logResolvers.AuditLog,
    // Ownership type resolvers
    Ownership: ownershipResolvers_1.ownershipResolvers.Ownership,
    Owner: ownershipResolvers_1.ownershipResolvers.Owner,
    // Pedigree type resolvers
    BreedingRecord: {},
    PedigreeNode: {},
    LinebreakingAnalysis: {},
    CommonAncestor: {},
    // Breeding program type resolvers
    BreedingProgram: breedingResolvers_1.breedingResolvers.BreedingProgram,
    BreedingPair: breedingResolvers_1.breedingResolvers.BreedingPair,
    // User type resolvers
    User: userResolvers_1.userResolvers.User,
};
exports.default = resolvers;
//# sourceMappingURL=index.js.map