import { Sequelize } from 'sequelize';
import { initDogModel } from './Dog';
import { initOwnerModel } from './Owner';
import { initOwnershipModel } from './Ownership';
import { initDogImageModel } from './DogImage';
import { initHealthRecordModel } from './HealthRecord';
import { initCompetitionResultModel } from './CompetitionResult';
import { initEventModel } from './Event';
import { initClubModel } from './Club';
import { initClubEventModel } from './ClubEvent';
import { initEventRegistrationModel } from './EventRegistration';
import { initBreedingRecordModel } from './BreedingRecord';
import { initBreedingRecordPuppyModel } from './BreedingRecordPuppy';
import { initUserModel } from './User';
import { initSystemLogModel } from './SystemLog';
import { initAuditLogModel } from './AuditLog';
import BreedingProgram from './BreedingProgram';
import BreedingPair from './BreedingPair';
import BreedingProgramFoundationDog from './BreedingProgramFoundationDog';
import { Breed } from './Breed';

interface DB {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  Dog: ReturnType<typeof initDogModel>;
  Owner: ReturnType<typeof initOwnerModel>;
  Ownership: ReturnType<typeof initOwnershipModel>;
  DogImage: ReturnType<typeof initDogImageModel>;
  HealthRecord: ReturnType<typeof initHealthRecordModel>;
  CompetitionResult: ReturnType<typeof initCompetitionResultModel>;
  Event: ReturnType<typeof initEventModel>;
  Club: ReturnType<typeof initClubModel>;
  ClubEvent: ReturnType<typeof initClubEventModel>;
  EventRegistration: ReturnType<typeof initEventRegistrationModel>;
  BreedingRecord: ReturnType<typeof initBreedingRecordModel>;
  BreedingRecordPuppy: ReturnType<typeof initBreedingRecordPuppyModel>;
  User: ReturnType<typeof initUserModel>;
  SystemLog: ReturnType<typeof initSystemLogModel>;
  AuditLog: ReturnType<typeof initAuditLogModel>;
  BreedingProgram: typeof BreedingProgram;
  BreedingPair: typeof BreedingPair;
  BreedingProgramFoundationDog: typeof BreedingProgramFoundationDog;
  Breed: typeof Breed;
  [key: string]: any;
}

const env = process.env.NODE_ENV || 'development';
// Import the database configuration
import dbConfig from '../../config/database';
const config = dbConfig[env];

let sequelize: Sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable] as string, config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

const db: DB = {
  sequelize,
  Sequelize,
  Dog: initDogModel(sequelize),
  Owner: initOwnerModel(sequelize),
  Ownership: initOwnershipModel(sequelize),
  DogImage: initDogImageModel(sequelize),
  HealthRecord: initHealthRecordModel(sequelize),
  CompetitionResult: initCompetitionResultModel(sequelize),
  Event: initEventModel(sequelize),
  Club: initClubModel(sequelize),
  ClubEvent: initClubEventModel(sequelize),
  EventRegistration: initEventRegistrationModel(sequelize),
  BreedingRecord: initBreedingRecordModel(sequelize),
  BreedingRecordPuppy: initBreedingRecordPuppyModel(sequelize),
  User: initUserModel(sequelize),
  SystemLog: initSystemLogModel(sequelize),
  AuditLog: initAuditLogModel(sequelize),
  BreedingProgram,
  BreedingPair,
  BreedingProgramFoundationDog,
  Breed
};

// Initialize breeding models
BreedingProgram.initialize(sequelize);
BreedingPair.initialize(sequelize);
BreedingProgramFoundationDog.initialize(sequelize);

// Initialize the Breed model
Breed.initialize(sequelize);

// Initialize associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName]?.associate) {
    db[modelName].associate(db);
  }
});

export default db;
