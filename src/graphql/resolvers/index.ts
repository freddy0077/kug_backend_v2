import { IResolvers } from '@graphql-tools/utils';
import { dogResolvers } from './dogResolvers';
import { eventResolvers } from './eventResolvers';
import { clubEventResolvers } from './clubEventResolvers';
import { healthRecordResolvers } from './healthRecordResolvers';
import { ownershipResolvers } from './ownershipResolvers';
import pedigreeResolvers from './pedigreeResolvers';
import { userResolvers } from './userResolvers';
import { logResolvers } from './logResolvers';
import { competitionResultResolvers } from './competitionResultResolvers';
import { breedingResolvers } from './breedingResolvers';
import breedResolvers from './breedResolvers';
import { dateTimeScalar } from './scalarResolvers';
import db from '../../db/models';

// Combine all resolvers
const resolvers: IResolvers = {
  // Scalar types
  DateTime: dateTimeScalar,
  
  // Merge Query resolvers
  Query: {
    ...dogResolvers.Query,
    ...eventResolvers.Query,
    ...clubEventResolvers.Query,
    ...healthRecordResolvers.Query,
    ...ownershipResolvers.Query,
    ...pedigreeResolvers.Query,
    ...userResolvers.Query,
    ...logResolvers.Query,
    ...competitionResultResolvers.Query,
    ...breedingResolvers.Query,
    ...breedResolvers.Query,
  },
  
  // Merge Mutation resolvers
  Mutation: {
    ...dogResolvers.Mutation,
    ...eventResolvers.Mutation,
    ...clubEventResolvers.Mutation,
    ...healthRecordResolvers.Mutation,
    ...ownershipResolvers.Mutation,
    ...pedigreeResolvers.Mutation,
    ...userResolvers.Mutation,
    ...logResolvers.Mutation,
    ...competitionResultResolvers.Mutation,
    ...breedingResolvers.Mutation,
    ...breedResolvers.Mutation,
  },
  
  // Type resolvers
  Dog: dogResolvers.Dog,
  DogImage: {
    dog: async (parent: any) => {
      return await db.Dog.findByPk(parent.dogId);
    }
  },
  CompetitionResult: competitionResultResolvers.CompetitionResult,
  
  // Breed type resolvers
  Breed: breedResolvers.Breed,
  
  // Event type resolvers
  Event: eventResolvers.Event,
  ClubEvent: clubEventResolvers.ClubEvent,
  Club: clubEventResolvers.Club,
  
  // Health record type resolvers
  HealthRecord: healthRecordResolvers.HealthRecord,
  
  // Log type resolvers
  SystemLog: logResolvers.SystemLog,
  AuditLog: logResolvers.AuditLog,
  
  // Ownership type resolvers
  Ownership: ownershipResolvers.Ownership,
  Owner: ownershipResolvers.Owner,
  
  // Pedigree type resolvers
  BreedingRecord: {},
  PedigreeNode: {},
  LinebreakingAnalysis: {},
  CommonAncestor: {},
  
  // Breeding program type resolvers
  BreedingProgram: breedingResolvers.BreedingProgram,
  BreedingPair: breedingResolvers.BreedingPair,
  
  // User type resolvers
  User: userResolvers.User,
};

export default resolvers;
