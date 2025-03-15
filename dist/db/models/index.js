"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Dog_1 = require("./Dog");
const Owner_1 = require("./Owner");
const Ownership_1 = require("./Ownership");
const DogImage_1 = require("./DogImage");
const HealthRecord_1 = require("./HealthRecord");
const CompetitionResult_1 = require("./CompetitionResult");
const Event_1 = require("./Event");
const Club_1 = require("./Club");
const ClubEvent_1 = require("./ClubEvent");
const EventRegistration_1 = require("./EventRegistration");
const BreedingRecord_1 = require("./BreedingRecord");
const BreedingRecordPuppy_1 = require("./BreedingRecordPuppy");
const User_1 = require("./User");
const SystemLog_1 = require("./SystemLog");
const AuditLog_1 = require("./AuditLog");
const BreedingProgram_1 = __importDefault(require("./BreedingProgram"));
const BreedingPair_1 = __importDefault(require("./BreedingPair"));
const BreedingProgramFoundationDog_1 = __importDefault(require("./BreedingProgramFoundationDog"));
const env = process.env.NODE_ENV || 'development';
// Import the database configuration
const database_1 = __importDefault(require("../../config/database"));
const config = database_1.default[env];
let sequelize;
if (config.use_env_variable) {
    sequelize = new sequelize_1.Sequelize(process.env[config.use_env_variable], config);
}
else {
    sequelize = new sequelize_1.Sequelize(config.database, config.username, config.password, config);
}
const db = {
    sequelize,
    Sequelize: sequelize_1.Sequelize,
    Dog: (0, Dog_1.initDogModel)(sequelize),
    Owner: (0, Owner_1.initOwnerModel)(sequelize),
    Ownership: (0, Ownership_1.initOwnershipModel)(sequelize),
    DogImage: (0, DogImage_1.initDogImageModel)(sequelize),
    HealthRecord: (0, HealthRecord_1.initHealthRecordModel)(sequelize),
    CompetitionResult: (0, CompetitionResult_1.initCompetitionResultModel)(sequelize),
    Event: (0, Event_1.initEventModel)(sequelize),
    Club: (0, Club_1.initClubModel)(sequelize),
    ClubEvent: (0, ClubEvent_1.initClubEventModel)(sequelize),
    EventRegistration: (0, EventRegistration_1.initEventRegistrationModel)(sequelize),
    BreedingRecord: (0, BreedingRecord_1.initBreedingRecordModel)(sequelize),
    BreedingRecordPuppy: (0, BreedingRecordPuppy_1.initBreedingRecordPuppyModel)(sequelize),
    User: (0, User_1.initUserModel)(sequelize),
    SystemLog: (0, SystemLog_1.initSystemLogModel)(sequelize),
    AuditLog: (0, AuditLog_1.initAuditLogModel)(sequelize),
    BreedingProgram: BreedingProgram_1.default,
    BreedingPair: BreedingPair_1.default,
    BreedingProgramFoundationDog: BreedingProgramFoundationDog_1.default
};
// Initialize breeding models
BreedingProgram_1.default.initialize(sequelize);
BreedingPair_1.default.initialize(sequelize);
BreedingProgramFoundationDog_1.default.initialize(sequelize);
// Initialize associations
Object.keys(db).forEach((modelName) => {
    if (db[modelName]?.associate) {
        db[modelName].associate(db);
    }
});
exports.default = db;
//# sourceMappingURL=index.js.map