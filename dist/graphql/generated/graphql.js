"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.SortDirection = exports.LogLevel = exports.HealthRecordType = exports.EventType = exports.DogSortField = exports.CompetitionSortField = exports.CompetitionCategory = exports.BreedingRole = exports.BreedingProgramStatus = exports.BreedingPairStatus = exports.AuditAction = void 0;
var AuditAction;
(function (AuditAction) {
    AuditAction["Approve"] = "APPROVE";
    AuditAction["Create"] = "CREATE";
    AuditAction["Delete"] = "DELETE";
    AuditAction["Export"] = "EXPORT";
    AuditAction["Import"] = "IMPORT";
    AuditAction["Login"] = "LOGIN";
    AuditAction["Logout"] = "LOGOUT";
    AuditAction["Read"] = "READ";
    AuditAction["Reject"] = "REJECT";
    AuditAction["TransferOwnership"] = "TRANSFER_OWNERSHIP";
    AuditAction["Update"] = "UPDATE";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
var BreedingPairStatus;
(function (BreedingPairStatus) {
    BreedingPairStatus["Approved"] = "APPROVED";
    BreedingPairStatus["Bred"] = "BRED";
    BreedingPairStatus["BreedingScheduled"] = "BREEDING_SCHEDULED";
    BreedingPairStatus["Cancelled"] = "CANCELLED";
    BreedingPairStatus["PendingTesting"] = "PENDING_TESTING";
    BreedingPairStatus["Planned"] = "PLANNED";
    BreedingPairStatus["Unsuccessful"] = "UNSUCCESSFUL";
})(BreedingPairStatus || (exports.BreedingPairStatus = BreedingPairStatus = {}));
var BreedingProgramStatus;
(function (BreedingProgramStatus) {
    BreedingProgramStatus["Active"] = "ACTIVE";
    BreedingProgramStatus["Cancelled"] = "CANCELLED";
    BreedingProgramStatus["Completed"] = "COMPLETED";
    BreedingProgramStatus["Paused"] = "PAUSED";
    BreedingProgramStatus["Planning"] = "PLANNING";
})(BreedingProgramStatus || (exports.BreedingProgramStatus = BreedingProgramStatus = {}));
var BreedingRole;
(function (BreedingRole) {
    BreedingRole["Both"] = "BOTH";
    BreedingRole["Dam"] = "DAM";
    BreedingRole["Sire"] = "SIRE";
})(BreedingRole || (exports.BreedingRole = BreedingRole = {}));
var CompetitionCategory;
(function (CompetitionCategory) {
    CompetitionCategory["Agility"] = "AGILITY";
    CompetitionCategory["Conformation"] = "CONFORMATION";
    CompetitionCategory["FieldTrials"] = "FIELD_TRIALS";
    CompetitionCategory["Herding"] = "HERDING";
    CompetitionCategory["Obedience"] = "OBEDIENCE";
    CompetitionCategory["Rally"] = "RALLY";
    CompetitionCategory["ScentWork"] = "SCENT_WORK";
    CompetitionCategory["Tracking"] = "TRACKING";
})(CompetitionCategory || (exports.CompetitionCategory = CompetitionCategory = {}));
var CompetitionSortField;
(function (CompetitionSortField) {
    CompetitionSortField["EventDate"] = "EVENT_DATE";
    CompetitionSortField["EventName"] = "EVENT_NAME";
    CompetitionSortField["Points"] = "POINTS";
    CompetitionSortField["Rank"] = "RANK";
})(CompetitionSortField || (exports.CompetitionSortField = CompetitionSortField = {}));
var DogSortField;
(function (DogSortField) {
    DogSortField["Breed"] = "BREED";
    DogSortField["DateOfBirth"] = "DATE_OF_BIRTH";
    DogSortField["Name"] = "NAME";
    DogSortField["RegistrationNumber"] = "REGISTRATION_NUMBER";
})(DogSortField || (exports.DogSortField = DogSortField = {}));
var EventType;
(function (EventType) {
    EventType["Competition"] = "COMPETITION";
    EventType["Meeting"] = "MEETING";
    EventType["Other"] = "OTHER";
    EventType["Seminar"] = "SEMINAR";
    EventType["Show"] = "SHOW";
    EventType["Social"] = "SOCIAL";
    EventType["Training"] = "TRAINING";
})(EventType || (exports.EventType = EventType = {}));
var HealthRecordType;
(function (HealthRecordType) {
    HealthRecordType["Examination"] = "EXAMINATION";
    HealthRecordType["Other"] = "OTHER";
    HealthRecordType["Surgery"] = "SURGERY";
    HealthRecordType["Test"] = "TEST";
    HealthRecordType["Treatment"] = "TREATMENT";
    HealthRecordType["Vaccination"] = "VACCINATION";
})(HealthRecordType || (exports.HealthRecordType = HealthRecordType = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel["Critical"] = "CRITICAL";
    LogLevel["Debug"] = "DEBUG";
    LogLevel["Error"] = "ERROR";
    LogLevel["Info"] = "INFO";
    LogLevel["Warning"] = "WARNING";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var SortDirection;
(function (SortDirection) {
    SortDirection["Asc"] = "ASC";
    SortDirection["Desc"] = "DESC";
})(SortDirection || (exports.SortDirection = SortDirection = {}));
var UserRole;
(function (UserRole) {
    UserRole["Admin"] = "ADMIN";
    UserRole["Club"] = "CLUB";
    UserRole["Handler"] = "HANDLER";
    UserRole["Owner"] = "OWNER";
    UserRole["Viewer"] = "VIEWER";
})(UserRole || (exports.UserRole = UserRole = {}));
//# sourceMappingURL=graphql.js.map