import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: Date; output: Date; }
  Upload: { input: File; output: File; }
};

export enum AuditAction {
  Approve = 'APPROVE',
  Create = 'CREATE',
  Delete = 'DELETE',
  Export = 'EXPORT',
  Import = 'IMPORT',
  Login = 'LOGIN',
  Logout = 'LOGOUT',
  Read = 'READ',
  Reject = 'REJECT',
  TransferOwnership = 'TRANSFER_OWNERSHIP',
  Update = 'UPDATE'
}

export type AuditLog = {
  __typename?: 'AuditLog';
  action: AuditAction;
  createdAt: Scalars['DateTime']['output'];
  entityId: Scalars['String']['output'];
  entityType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['String']['output']>;
  newState?: Maybe<Scalars['String']['output']>;
  previousState?: Maybe<Scalars['String']['output']>;
  timestamp: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId?: Maybe<Scalars['ID']['output']>;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  expiresAt: Scalars['DateTime']['output'];
  token: Scalars['String']['output'];
  user: User;
};

export type Breed = {
  __typename?: 'Breed';
  average_height?: Maybe<Scalars['String']['output']>;
  average_lifespan?: Maybe<Scalars['String']['output']>;
  average_weight?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  dogs?: Maybe<Array<Maybe<Dog>>>;
  group?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  origin?: Maybe<Scalars['String']['output']>;
  temperament?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type BreedingPair = {
  __typename?: 'BreedingPair';
  breedingRecords?: Maybe<Array<BreedingRecord>>;
  compatibilityNotes?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dam: Dog;
  damId: Scalars['ID']['output'];
  geneticCompatibilityScore?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  plannedBreedingDate?: Maybe<Scalars['DateTime']['output']>;
  program: BreedingProgram;
  programId: Scalars['ID']['output'];
  sire: Dog;
  sireId: Scalars['ID']['output'];
  status: BreedingPairStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export enum BreedingPairStatus {
  Approved = 'APPROVED',
  Bred = 'BRED',
  BreedingScheduled = 'BREEDING_SCHEDULED',
  Cancelled = 'CANCELLED',
  PendingTesting = 'PENDING_TESTING',
  Planned = 'PLANNED',
  Unsuccessful = 'UNSUCCESSFUL'
}

export type BreedingProgram = {
  __typename?: 'BreedingProgram';
  breed: Scalars['String']['output'];
  breeder: Owner;
  breederId: Scalars['ID']['output'];
  breedingPairs: Array<BreedingPair>;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  endDate?: Maybe<Scalars['DateTime']['output']>;
  foundationDogs: Array<Dog>;
  geneticTestingProtocol?: Maybe<Scalars['String']['output']>;
  goals: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isPublic: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  resultingLitters: Array<BreedingRecord>;
  selectionCriteria?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['DateTime']['output'];
  status: BreedingProgramStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export enum BreedingProgramStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Paused = 'PAUSED',
  Planning = 'PLANNING'
}

export type BreedingRecord = {
  __typename?: 'BreedingRecord';
  breedingDate: Scalars['DateTime']['output'];
  comments?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dam: Dog;
  id: Scalars['ID']['output'];
  litterSize?: Maybe<Scalars['Int']['output']>;
  puppies?: Maybe<Array<Maybe<Dog>>>;
  sire: Dog;
  updatedAt: Scalars['DateTime']['output'];
};

export type BreedingRecordInput = {
  breedingDate: Scalars['DateTime']['input'];
  comments?: InputMaybe<Scalars['String']['input']>;
  damId: Scalars['ID']['input'];
  litterSize?: InputMaybe<Scalars['Int']['input']>;
  puppyIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  sireId: Scalars['ID']['input'];
};

export enum BreedingRole {
  Both = 'BOTH',
  Dam = 'DAM',
  Sire = 'SIRE'
}

export type CategoryCount = {
  __typename?: 'CategoryCount';
  category: Scalars['String']['output'];
  count: Scalars['Int']['output'];
};

export type Club = {
  __typename?: 'Club';
  address?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  events?: Maybe<Array<Maybe<ClubEvent>>>;
  id: Scalars['ID']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

export type ClubEvent = {
  __typename?: 'ClubEvent';
  club: Club;
  clubId: Scalars['ID']['output'];
  currentParticipants?: Maybe<Scalars['Int']['output']>;
  event: Event;
  id: Scalars['ID']['output'];
  maxParticipants?: Maybe<Scalars['Int']['output']>;
  memberRegistrationFee?: Maybe<Scalars['Float']['output']>;
  membersOnly: Scalars['Boolean']['output'];
  nonMemberRegistrationFee?: Maybe<Scalars['Float']['output']>;
};

export type CommonAncestor = {
  __typename?: 'CommonAncestor';
  contribution: Scalars['Float']['output'];
  dog: PedigreeNode;
  occurrences: Scalars['Int']['output'];
  pathways: Array<Scalars['String']['output']>;
};

export enum CompetitionCategory {
  Agility = 'AGILITY',
  Conformation = 'CONFORMATION',
  FieldTrials = 'FIELD_TRIALS',
  Herding = 'HERDING',
  Obedience = 'OBEDIENCE',
  Rally = 'RALLY',
  ScentWork = 'SCENT_WORK',
  Tracking = 'TRACKING'
}

export type CompetitionResult = {
  __typename?: 'CompetitionResult';
  category: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  dog: Dog;
  dogId: Scalars['ID']['output'];
  dogName: Scalars['String']['output'];
  eventDate: Scalars['DateTime']['output'];
  eventName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  judge: Scalars['String']['output'];
  location: Scalars['String']['output'];
  place?: Maybe<Scalars['Int']['output']>;
  points: Scalars['Float']['output'];
  rank: Scalars['Int']['output'];
  score?: Maybe<Scalars['Float']['output']>;
  title_earned?: Maybe<Scalars['String']['output']>;
  totalParticipants?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export enum CompetitionSortField {
  EventDate = 'EVENT_DATE',
  EventName = 'EVENT_NAME',
  Points = 'POINTS',
  Rank = 'RANK'
}

export type CompetitionStats = {
  __typename?: 'CompetitionStats';
  categoryCounts: Array<CategoryCount>;
  pointsByCategory: Array<PointsByCategory>;
  recentResults: Array<CompetitionResult>;
  totalCompetitions: Scalars['Int']['output'];
  totalWins: Scalars['Int']['output'];
};

export type CreateAuditLogInput = {
  action: AuditAction;
  entityId: Scalars['String']['input'];
  entityType: Scalars['String']['input'];
  ipAddress?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  newState?: InputMaybe<Scalars['String']['input']>;
  previousState?: InputMaybe<Scalars['String']['input']>;
};

export type CreateBreedInput = {
  average_height?: InputMaybe<Scalars['String']['input']>;
  average_lifespan?: InputMaybe<Scalars['String']['input']>;
  average_weight?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  group?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  origin?: InputMaybe<Scalars['String']['input']>;
  temperament?: InputMaybe<Scalars['String']['input']>;
};

export type CreateBreedingPairInput = {
  compatibilityNotes?: InputMaybe<Scalars['String']['input']>;
  damId: Scalars['ID']['input'];
  plannedBreedingDate?: InputMaybe<Scalars['DateTime']['input']>;
  programId: Scalars['ID']['input'];
  sireId: Scalars['ID']['input'];
  status: BreedingPairStatus;
};

export type CreateBreedingProgramInput = {
  breed: Scalars['String']['input'];
  breederId: Scalars['ID']['input'];
  description: Scalars['String']['input'];
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  foundationDogIds: Array<Scalars['ID']['input']>;
  geneticTestingProtocol?: InputMaybe<Scalars['String']['input']>;
  goals: Array<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isPublic: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  selectionCriteria?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['DateTime']['input'];
};

export type CreateClubEventInput = {
  clubId: Scalars['ID']['input'];
  eventInput: CreateEventInput;
  maxParticipants?: InputMaybe<Scalars['Int']['input']>;
  memberRegistrationFee?: InputMaybe<Scalars['Float']['input']>;
  membersOnly: Scalars['Boolean']['input'];
  nonMemberRegistrationFee?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateCompetitionInput = {
  category: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  dogId: Scalars['ID']['input'];
  eventDate: Scalars['DateTime']['input'];
  eventName: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  judge: Scalars['String']['input'];
  location: Scalars['String']['input'];
  points: Scalars['Float']['input'];
  rank: Scalars['Int']['input'];
  title_earned?: InputMaybe<Scalars['String']['input']>;
  totalParticipants?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateDogInput = {
  biography?: InputMaybe<Scalars['String']['input']>;
  breed: Scalars['String']['input'];
  breedId?: InputMaybe<Scalars['ID']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  damId?: InputMaybe<Scalars['ID']['input']>;
  dateOfBirth: Scalars['DateTime']['input'];
  dateOfDeath?: InputMaybe<Scalars['DateTime']['input']>;
  gender: Scalars['String']['input'];
  height?: InputMaybe<Scalars['Float']['input']>;
  isNeutered?: InputMaybe<Scalars['Boolean']['input']>;
  mainImageUrl?: InputMaybe<Scalars['String']['input']>;
  microchipNumber?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  ownerId: Scalars['ID']['input'];
  registrationNumber: Scalars['String']['input'];
  sireId?: InputMaybe<Scalars['ID']['input']>;
  titles?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateEventInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  endDate: Scalars['DateTime']['input'];
  eventType: EventType;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  location: Scalars['String']['input'];
  organizer: Scalars['String']['input'];
  organizerId?: InputMaybe<Scalars['ID']['input']>;
  registrationDeadline?: InputMaybe<Scalars['DateTime']['input']>;
  registrationUrl?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['DateTime']['input'];
  title: Scalars['String']['input'];
  website?: InputMaybe<Scalars['String']['input']>;
};

export type CreateHealthRecordInput = {
  attachmentUrl?: InputMaybe<Scalars['String']['input']>;
  date: Scalars['DateTime']['input'];
  description: Scalars['String']['input'];
  dogId: Scalars['ID']['input'];
  results?: InputMaybe<Scalars['String']['input']>;
  type: HealthRecordType;
  veterinarian?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOwnershipInput = {
  dogId: Scalars['ID']['input'];
  is_current: Scalars['Boolean']['input'];
  ownerId: Scalars['ID']['input'];
  startDate: Scalars['DateTime']['input'];
  transferDocumentUrl?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePedigreeInput = {
  coefficient?: InputMaybe<Scalars['Float']['input']>;
  damId?: InputMaybe<Scalars['ID']['input']>;
  dogId: Scalars['ID']['input'];
  generation?: InputMaybe<Scalars['Int']['input']>;
  sireId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateSystemLogInput = {
  details?: InputMaybe<Scalars['String']['input']>;
  ipAddress?: InputMaybe<Scalars['String']['input']>;
  level: LogLevel;
  message: Scalars['String']['input'];
  source: Scalars['String']['input'];
  stackTrace?: InputMaybe<Scalars['String']['input']>;
};

export type DeleteResponse = {
  __typename?: 'DeleteResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type DeletionResult = {
  __typename?: 'DeletionResult';
  count?: Maybe<Scalars['Int']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Dog = {
  __typename?: 'Dog';
  biography?: Maybe<Scalars['String']['output']>;
  breed: Scalars['String']['output'];
  breedObj?: Maybe<Breed>;
  color?: Maybe<Scalars['String']['output']>;
  competitionResults?: Maybe<Array<Maybe<CompetitionResult>>>;
  createdAt: Scalars['DateTime']['output'];
  currentOwner?: Maybe<Owner>;
  dam?: Maybe<Dog>;
  dateOfBirth: Scalars['DateTime']['output'];
  dateOfDeath?: Maybe<Scalars['DateTime']['output']>;
  gender: Scalars['String']['output'];
  healthRecords?: Maybe<Array<Maybe<HealthRecord>>>;
  height?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Maybe<DogImage>>>;
  isNeutered?: Maybe<Scalars['Boolean']['output']>;
  mainImageUrl?: Maybe<Scalars['String']['output']>;
  microchipNumber?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  offspring?: Maybe<Array<Maybe<Dog>>>;
  ownerships?: Maybe<Array<Maybe<Ownership>>>;
  registrationNumber: Scalars['String']['output'];
  sire?: Maybe<Dog>;
  titles?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  updatedAt: Scalars['DateTime']['output'];
  weight?: Maybe<Scalars['Float']['output']>;
};

export type DogImage = {
  __typename?: 'DogImage';
  caption?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dog?: Maybe<Dog>;
  id: Scalars['ID']['output'];
  isPrimary: Scalars['Boolean']['output'];
  url: Scalars['String']['output'];
};

export type DogImageInput = {
  caption?: InputMaybe<Scalars['String']['input']>;
  isPrimary?: InputMaybe<Scalars['Boolean']['input']>;
  url: Scalars['String']['input'];
};

export enum DogSortField {
  Breed = 'BREED',
  DateOfBirth = 'DATE_OF_BIRTH',
  Name = 'NAME',
  RegistrationNumber = 'REGISTRATION_NUMBER'
}

export type Event = {
  __typename?: 'Event';
  address?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  endDate: Scalars['DateTime']['output'];
  eventType: EventType;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isPublished: Scalars['Boolean']['output'];
  location: Scalars['String']['output'];
  organizer: Scalars['String']['output'];
  organizerId?: Maybe<Scalars['ID']['output']>;
  registeredDogs?: Maybe<Array<Maybe<Dog>>>;
  registrationDeadline?: Maybe<Scalars['DateTime']['output']>;
  registrationUrl?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

export type EventRegistration = {
  __typename?: 'EventRegistration';
  dog: Dog;
  event: Event;
  registrationDate: Scalars['DateTime']['output'];
};

export enum EventType {
  Competition = 'COMPETITION',
  Meeting = 'MEETING',
  Other = 'OTHER',
  Seminar = 'SEMINAR',
  Show = 'SHOW',
  Social = 'SOCIAL',
  Training = 'TRAINING'
}

export type GenericResult = {
  __typename?: 'GenericResult';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type HealthRecord = {
  __typename?: 'HealthRecord';
  attachmentUrl?: Maybe<Scalars['String']['output']>;
  attachments?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  date: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  dog: Dog;
  dogId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  results?: Maybe<Scalars['String']['output']>;
  type: HealthRecordType;
  updatedAt: Scalars['DateTime']['output'];
  vetName?: Maybe<Scalars['String']['output']>;
  veterinarian?: Maybe<Scalars['String']['output']>;
};

export enum HealthRecordType {
  Examination = 'EXAMINATION',
  Other = 'OTHER',
  Surgery = 'SURGERY',
  Test = 'TEST',
  Treatment = 'TREATMENT',
  Vaccination = 'VACCINATION'
}

export type HealthSummary = {
  __typename?: 'HealthSummary';
  latestExamDate?: Maybe<Scalars['DateTime']['output']>;
  recentRecords: Array<HealthRecord>;
  recordCount: Scalars['Int']['output'];
  recordsByType: Array<RecordTypeCount>;
  vaccinationStatus?: Maybe<VaccinationStatus>;
};

export type LinebreakingAnalysis = {
  __typename?: 'LinebreakingAnalysis';
  commonAncestors: Array<CommonAncestor>;
  dog: Dog;
  geneticDiversity: Scalars['Float']['output'];
  inbreedingCoefficient: Scalars['Float']['output'];
  recommendations: Array<Scalars['String']['output']>;
};

export enum LogLevel {
  Critical = 'CRITICAL',
  Debug = 'DEBUG',
  Error = 'ERROR',
  Info = 'INFO',
  Warning = 'WARNING'
}

export type Mutation = {
  __typename?: 'Mutation';
  addBreedingPair: BreedingPair;
  addDogImage: DogImage;
  changePassword: GenericResult;
  clearAuditLogs: DeletionResult;
  clearSystemLogs: DeletionResult;
  createAuditLog: AuditLog;
  createBreed: Breed;
  createBreedingProgram: BreedingProgram;
  createBreedingRecord: BreedingRecord;
  createClubEvent: ClubEvent;
  createCompetitionResult: CompetitionResult;
  createDog: Dog;
  createEvent: Event;
  createHealthRecord: HealthRecord;
  createOwnership: Ownership;
  createPedigree: PedigreeCreationResult;
  createSystemLog: SystemLog;
  deactivateUser: User;
  deleteBreed: DeletionResult;
  deleteBreedingProgram: DeleteResponse;
  deleteCompetitionResult: DeleteResponse;
  deleteDog: DeletionResult;
  deleteHealthRecord: DeletionResult;
  deleteOwnership: DeletionResult;
  linkDogToParents: Dog;
  linkLitterToBreedingPair: BreedingPair;
  login: AuthPayload;
  publishEvent: Event;
  register: AuthPayload;
  registerDogForEvent: EventRegistration;
  transferOwnership: OwnershipTransferResult;
  updateBreed: Breed;
  updateBreedingPairStatus: BreedingPair;
  updateBreedingProgram: BreedingProgram;
  updateBreedingRecord: BreedingRecord;
  updateCompetitionResult: CompetitionResult;
  updateDog: Dog;
  updateEvent: Event;
  updateHealthRecord: HealthRecord;
  updateOwnership: Ownership;
  updateUser: User;
  updateUserRole: User;
  uploadHealthRecordAttachment: HealthRecord;
};


export type MutationAddBreedingPairArgs = {
  input: CreateBreedingPairInput;
};


export type MutationAddDogImageArgs = {
  dogId: Scalars['ID']['input'];
  input: DogImageInput;
};


export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};


export type MutationClearAuditLogsArgs = {
  entityType?: InputMaybe<Scalars['String']['input']>;
  olderThan?: InputMaybe<Scalars['DateTime']['input']>;
};


export type MutationClearSystemLogsArgs = {
  level?: InputMaybe<LogLevel>;
  olderThan?: InputMaybe<Scalars['DateTime']['input']>;
};


export type MutationCreateAuditLogArgs = {
  action: AuditAction;
  entityId: Scalars['String']['input'];
  entityType: Scalars['String']['input'];
  ipAddress?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  newState?: InputMaybe<Scalars['String']['input']>;
  previousState?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateBreedArgs = {
  input: CreateBreedInput;
};


export type MutationCreateBreedingProgramArgs = {
  input: CreateBreedingProgramInput;
};


export type MutationCreateBreedingRecordArgs = {
  input: BreedingRecordInput;
};


export type MutationCreateClubEventArgs = {
  input: CreateClubEventInput;
};


export type MutationCreateCompetitionResultArgs = {
  input: CreateCompetitionInput;
};


export type MutationCreateDogArgs = {
  input: CreateDogInput;
};


export type MutationCreateEventArgs = {
  input: CreateEventInput;
};


export type MutationCreateHealthRecordArgs = {
  input: CreateHealthRecordInput;
};


export type MutationCreateOwnershipArgs = {
  input: CreateOwnershipInput;
};


export type MutationCreatePedigreeArgs = {
  input: CreatePedigreeInput;
};


export type MutationCreateSystemLogArgs = {
  details?: InputMaybe<Scalars['String']['input']>;
  ipAddress?: InputMaybe<Scalars['String']['input']>;
  level: LogLevel;
  message: Scalars['String']['input'];
  source: Scalars['String']['input'];
  stackTrace?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeactivateUserArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationDeleteBreedArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBreedingProgramArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCompetitionResultArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteDogArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteHealthRecordArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOwnershipArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLinkDogToParentsArgs = {
  damId?: InputMaybe<Scalars['ID']['input']>;
  dogId: Scalars['ID']['input'];
  sireId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationLinkLitterToBreedingPairArgs = {
  breedingPairId: Scalars['ID']['input'];
  breedingRecordId: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationPublishEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRegisterDogForEventArgs = {
  dogId: Scalars['ID']['input'];
  eventId: Scalars['ID']['input'];
};


export type MutationTransferOwnershipArgs = {
  input: TransferOwnershipInput;
};


export type MutationUpdateBreedArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBreedInput;
};


export type MutationUpdateBreedingPairStatusArgs = {
  id: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  status: BreedingPairStatus;
};


export type MutationUpdateBreedingProgramArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBreedingProgramInput;
};


export type MutationUpdateBreedingRecordArgs = {
  id: Scalars['ID']['input'];
  input: UpdateBreedingRecordInput;
};


export type MutationUpdateCompetitionResultArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCompetitionInput;
};


export type MutationUpdateDogArgs = {
  id: Scalars['ID']['input'];
  input: UpdateDogInput;
};


export type MutationUpdateEventArgs = {
  id: Scalars['ID']['input'];
  input: UpdateEventInput;
};


export type MutationUpdateHealthRecordArgs = {
  id: Scalars['ID']['input'];
  input: UpdateHealthRecordInput;
};


export type MutationUpdateOwnershipArgs = {
  id: Scalars['ID']['input'];
  input: UpdateOwnershipInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserInput;
};


export type MutationUpdateUserRoleArgs = {
  role: UserRole;
  userId: Scalars['ID']['input'];
};


export type MutationUploadHealthRecordAttachmentArgs = {
  fileUrl: Scalars['String']['input'];
  healthRecordId: Scalars['ID']['input'];
};

export type Owner = {
  __typename?: 'Owner';
  address?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentDogs?: Maybe<Array<Maybe<Dog>>>;
  dogs?: Maybe<Array<Maybe<Dog>>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  ownerships?: Maybe<Array<Maybe<Ownership>>>;
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId?: Maybe<Scalars['ID']['output']>;
};

export type OwnerInfoInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type Ownership = {
  __typename?: 'Ownership';
  createdAt: Scalars['DateTime']['output'];
  dog: Dog;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isCurrent: Scalars['Boolean']['output'];
  is_current: Scalars['Boolean']['output'];
  owner: Owner;
  startDate: Scalars['DateTime']['output'];
  transferDocumentUrl?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type OwnershipHistory = {
  __typename?: 'OwnershipHistory';
  dog: Dog;
  ownerships: Array<Ownership>;
};

export type OwnershipTransferResult = {
  __typename?: 'OwnershipTransferResult';
  dog: Dog;
  newOwnership: Ownership;
  previousOwnership: Ownership;
};

export type PaginatedAuditLogs = {
  __typename?: 'PaginatedAuditLogs';
  hasMore: Scalars['Boolean']['output'];
  items: Array<AuditLog>;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedBreedingPrograms = {
  __typename?: 'PaginatedBreedingPrograms';
  hasMore: Scalars['Boolean']['output'];
  items: Array<BreedingProgram>;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedBreedingRecords = {
  __typename?: 'PaginatedBreedingRecords';
  hasMore: Scalars['Boolean']['output'];
  items: Array<BreedingRecord>;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedBreeds = {
  __typename?: 'PaginatedBreeds';
  hasMore: Scalars['Boolean']['output'];
  items: Array<Breed>;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedClubEvents = {
  __typename?: 'PaginatedClubEvents';
  hasMore: Scalars['Boolean']['output'];
  items: Array<ClubEvent>;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedCompetitions = {
  __typename?: 'PaginatedCompetitions';
  hasMore: Scalars['Boolean']['output'];
  items: Array<CompetitionResult>;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedDogs = {
  __typename?: 'PaginatedDogs';
  hasMore: Scalars['Boolean']['output'];
  items: Array<Dog>;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedEvents = {
  __typename?: 'PaginatedEvents';
  hasMore: Scalars['Boolean']['output'];
  items: Array<Event>;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedHealthRecords = {
  __typename?: 'PaginatedHealthRecords';
  hasMore: Scalars['Boolean']['output'];
  items: Array<HealthRecord>;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedOwnerships = {
  __typename?: 'PaginatedOwnerships';
  hasMore: Scalars['Boolean']['output'];
  items: Array<Ownership>;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedSystemLogs = {
  __typename?: 'PaginatedSystemLogs';
  hasMore: Scalars['Boolean']['output'];
  items: Array<SystemLog>;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedUsers = {
  __typename?: 'PaginatedUsers';
  hasMore: Scalars['Boolean']['output'];
  items: Array<User>;
  totalCount: Scalars['Int']['output'];
};

export type PedigreeCreationResult = {
  __typename?: 'PedigreeCreationResult';
  coefficient?: Maybe<Scalars['Float']['output']>;
  dam?: Maybe<PedigreeCreationResult>;
  dog: Dog;
  generation: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  sire?: Maybe<PedigreeCreationResult>;
};

export type PedigreeNode = {
  __typename?: 'PedigreeNode';
  breed: Scalars['String']['output'];
  coefficient?: Maybe<Scalars['Float']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  dam?: Maybe<PedigreeNode>;
  dateOfBirth: Scalars['DateTime']['output'];
  gender: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mainImageUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  registrationNumber: Scalars['String']['output'];
  sire?: Maybe<PedigreeNode>;
  titles?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type PointsByCategory = {
  __typename?: 'PointsByCategory';
  category: Scalars['String']['output'];
  points: Scalars['Float']['output'];
};

export type Query = {
  __typename?: 'Query';
  auditLog?: Maybe<AuditLog>;
  auditLogs: PaginatedAuditLogs;
  breed?: Maybe<Breed>;
  breedByName?: Maybe<Breed>;
  breedingPair?: Maybe<BreedingPair>;
  breedingProgram?: Maybe<BreedingProgram>;
  breedingPrograms: PaginatedBreedingPrograms;
  breedingRecords: PaginatedBreedingRecords;
  breeds: PaginatedBreeds;
  club?: Maybe<Club>;
  clubEvents: PaginatedClubEvents;
  clubs: Array<Club>;
  competition?: Maybe<CompetitionResult>;
  competitions: PaginatedCompetitions;
  dog?: Maybe<Dog>;
  dogCompetitionStats: CompetitionStats;
  dogHealthRecords: PaginatedHealthRecords;
  dogOwnerships: OwnershipHistory;
  dogPedigree?: Maybe<PedigreeNode>;
  dogs: PaginatedDogs;
  event?: Maybe<Event>;
  events: PaginatedEvents;
  healthRecord?: Maybe<HealthRecord>;
  healthSummary: HealthSummary;
  linebreedingAnalysis?: Maybe<LinebreakingAnalysis>;
  me?: Maybe<User>;
  ownerDogs: PaginatedOwnerships;
  ownership?: Maybe<Ownership>;
  relatedCompetitions: Array<CompetitionResult>;
  systemLog?: Maybe<SystemLog>;
  systemLogs: PaginatedSystemLogs;
  upcomingEvents: Array<Event>;
  user?: Maybe<User>;
  users: PaginatedUsers;
};


export type QueryAuditLogArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAuditLogsArgs = {
  action?: InputMaybe<AuditAction>;
  entityType?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryBreedArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBreedByNameArgs = {
  name: Scalars['String']['input'];
};


export type QueryBreedingPairArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBreedingProgramArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBreedingProgramsArgs = {
  breed?: InputMaybe<Scalars['String']['input']>;
  breederId?: InputMaybe<Scalars['ID']['input']>;
  includePrivate?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<BreedingProgramStatus>;
};


export type QueryBreedingRecordsArgs = {
  dogId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<BreedingRole>;
};


export type QueryBreedsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirection>;
};


export type QueryClubArgs = {
  id: Scalars['ID']['input'];
};


export type QueryClubEventsArgs = {
  clubId: Scalars['ID']['input'];
  includeNonMemberEvents?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCompetitionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCompetitionsArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  dogId?: InputMaybe<Scalars['ID']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<CompetitionSortField>;
  sortDirection?: InputMaybe<SortDirection>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryDogArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDogCompetitionStatsArgs = {
  dogId: Scalars['ID']['input'];
};


export type QueryDogHealthRecordsArgs = {
  dogId: Scalars['ID']['input'];
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sortDirection?: InputMaybe<SortDirection>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  type?: InputMaybe<HealthRecordType>;
};


export type QueryDogOwnershipsArgs = {
  dogId: Scalars['ID']['input'];
};


export type QueryDogPedigreeArgs = {
  dogId: Scalars['ID']['input'];
  generations?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDogsArgs = {
  breed?: InputMaybe<Scalars['String']['input']>;
  breedId?: InputMaybe<Scalars['ID']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<DogSortField>;
  sortDirection?: InputMaybe<SortDirection>;
};


export type QueryEventArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEventsArgs = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  eventType?: InputMaybe<EventType>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  organizerId?: InputMaybe<Scalars['ID']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<SortDirection>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryHealthRecordArgs = {
  id: Scalars['ID']['input'];
};


export type QueryHealthSummaryArgs = {
  dogId: Scalars['ID']['input'];
};


export type QueryLinebreedingAnalysisArgs = {
  damId: Scalars['ID']['input'];
  generations?: InputMaybe<Scalars['Int']['input']>;
  sireId: Scalars['ID']['input'];
};


export type QueryOwnerDogsArgs = {
  includeFormer?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  ownerId: Scalars['ID']['input'];
};


export type QueryOwnershipArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRelatedCompetitionsArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  competitionId: Scalars['ID']['input'];
  dogId?: InputMaybe<Scalars['ID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySystemLogArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySystemLogsArgs = {
  level?: InputMaybe<LogLevel>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUpcomingEventsArgs = {
  days?: InputMaybe<Scalars['Int']['input']>;
  eventType?: InputMaybe<EventType>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<UserRole>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};

export type RecordTypeCount = {
  __typename?: 'RecordTypeCount';
  count: Scalars['Int']['output'];
  type: HealthRecordType;
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  ownerInfo?: InputMaybe<OwnerInfoInput>;
  password: Scalars['String']['input'];
  role: UserRole;
};

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type SystemLog = {
  __typename?: 'SystemLog';
  createdAt: Scalars['DateTime']['output'];
  details?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  level: LogLevel;
  message: Scalars['String']['output'];
  source: Scalars['String']['output'];
  stackTrace?: Maybe<Scalars['String']['output']>;
  timestamp: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId?: Maybe<Scalars['ID']['output']>;
};

export type TransferOwnershipInput = {
  dogId: Scalars['ID']['input'];
  newOwnerId: Scalars['ID']['input'];
  transferDate: Scalars['DateTime']['input'];
  transferDocumentUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBreedInput = {
  average_height?: InputMaybe<Scalars['String']['input']>;
  average_lifespan?: InputMaybe<Scalars['String']['input']>;
  average_weight?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  group?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  origin?: InputMaybe<Scalars['String']['input']>;
  temperament?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBreedingProgramInput = {
  breed?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  foundationDogIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  geneticTestingProtocol?: InputMaybe<Scalars['String']['input']>;
  goals?: InputMaybe<Array<Scalars['String']['input']>>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  selectionCriteria?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<BreedingProgramStatus>;
};

export type UpdateBreedingRecordInput = {
  breedingDate?: InputMaybe<Scalars['DateTime']['input']>;
  comments?: InputMaybe<Scalars['String']['input']>;
  litterSize?: InputMaybe<Scalars['Int']['input']>;
  puppyIds?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type UpdateCompetitionInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  eventDate?: InputMaybe<Scalars['DateTime']['input']>;
  eventName?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  judge?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  points?: InputMaybe<Scalars['Float']['input']>;
  rank?: InputMaybe<Scalars['Int']['input']>;
  title_earned?: InputMaybe<Scalars['String']['input']>;
  totalParticipants?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateDogInput = {
  biography?: InputMaybe<Scalars['String']['input']>;
  breed?: InputMaybe<Scalars['String']['input']>;
  breedId?: InputMaybe<Scalars['ID']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  damId?: InputMaybe<Scalars['ID']['input']>;
  dateOfBirth?: InputMaybe<Scalars['DateTime']['input']>;
  dateOfDeath?: InputMaybe<Scalars['DateTime']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  isNeutered?: InputMaybe<Scalars['Boolean']['input']>;
  mainImageUrl?: InputMaybe<Scalars['String']['input']>;
  microchipNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  registrationNumber?: InputMaybe<Scalars['String']['input']>;
  sireId?: InputMaybe<Scalars['ID']['input']>;
  titles?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateEventInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  eventType?: InputMaybe<EventType>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  organizer?: InputMaybe<Scalars['String']['input']>;
  registrationDeadline?: InputMaybe<Scalars['DateTime']['input']>;
  registrationUrl?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateHealthRecordInput = {
  attachmentUrl?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  results?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<HealthRecordType>;
  veterinarian?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOwnershipInput = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  is_current?: InputMaybe<Scalars['Boolean']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  transferDocumentUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  ownerInfo?: InputMaybe<OwnerInfoInput>;
  password?: InputMaybe<Scalars['String']['input']>;
  profileImageUrl?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastLogin?: Maybe<Scalars['DateTime']['output']>;
  lastName: Scalars['String']['output'];
  owner?: Maybe<Owner>;
  profileImageUrl?: Maybe<Scalars['String']['output']>;
  role: UserRole;
  updatedAt: Scalars['DateTime']['output'];
};

export enum UserRole {
  Admin = 'ADMIN',
  Club = 'CLUB',
  Handler = 'HANDLER',
  Owner = 'OWNER',
  Viewer = 'VIEWER'
}

export type VaccinationStatus = {
  __typename?: 'VaccinationStatus';
  isUpToDate: Scalars['Boolean']['output'];
  missingVaccinations?: Maybe<Array<Scalars['String']['output']>>;
  nextDueDate?: Maybe<Scalars['DateTime']['output']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AuditAction: AuditAction;
  AuditLog: ResolverTypeWrapper<AuditLog>;
  AuthPayload: ResolverTypeWrapper<AuthPayload>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Breed: ResolverTypeWrapper<Breed>;
  BreedingPair: ResolverTypeWrapper<BreedingPair>;
  BreedingPairStatus: BreedingPairStatus;
  BreedingProgram: ResolverTypeWrapper<BreedingProgram>;
  BreedingProgramStatus: BreedingProgramStatus;
  BreedingRecord: ResolverTypeWrapper<BreedingRecord>;
  BreedingRecordInput: BreedingRecordInput;
  BreedingRole: BreedingRole;
  CategoryCount: ResolverTypeWrapper<CategoryCount>;
  Club: ResolverTypeWrapper<Club>;
  ClubEvent: ResolverTypeWrapper<ClubEvent>;
  CommonAncestor: ResolverTypeWrapper<CommonAncestor>;
  CompetitionCategory: CompetitionCategory;
  CompetitionResult: ResolverTypeWrapper<CompetitionResult>;
  CompetitionSortField: CompetitionSortField;
  CompetitionStats: ResolverTypeWrapper<CompetitionStats>;
  CreateAuditLogInput: CreateAuditLogInput;
  CreateBreedInput: CreateBreedInput;
  CreateBreedingPairInput: CreateBreedingPairInput;
  CreateBreedingProgramInput: CreateBreedingProgramInput;
  CreateClubEventInput: CreateClubEventInput;
  CreateCompetitionInput: CreateCompetitionInput;
  CreateDogInput: CreateDogInput;
  CreateEventInput: CreateEventInput;
  CreateHealthRecordInput: CreateHealthRecordInput;
  CreateOwnershipInput: CreateOwnershipInput;
  CreatePedigreeInput: CreatePedigreeInput;
  CreateSystemLogInput: CreateSystemLogInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DeleteResponse: ResolverTypeWrapper<DeleteResponse>;
  DeletionResult: ResolverTypeWrapper<DeletionResult>;
  Dog: ResolverTypeWrapper<Dog>;
  DogImage: ResolverTypeWrapper<DogImage>;
  DogImageInput: DogImageInput;
  DogSortField: DogSortField;
  Event: ResolverTypeWrapper<Event>;
  EventRegistration: ResolverTypeWrapper<EventRegistration>;
  EventType: EventType;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  GenericResult: ResolverTypeWrapper<GenericResult>;
  HealthRecord: ResolverTypeWrapper<HealthRecord>;
  HealthRecordType: HealthRecordType;
  HealthSummary: ResolverTypeWrapper<HealthSummary>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LinebreakingAnalysis: ResolverTypeWrapper<LinebreakingAnalysis>;
  LogLevel: LogLevel;
  Mutation: ResolverTypeWrapper<{}>;
  Owner: ResolverTypeWrapper<Owner>;
  OwnerInfoInput: OwnerInfoInput;
  Ownership: ResolverTypeWrapper<Ownership>;
  OwnershipHistory: ResolverTypeWrapper<OwnershipHistory>;
  OwnershipTransferResult: ResolverTypeWrapper<OwnershipTransferResult>;
  PaginatedAuditLogs: ResolverTypeWrapper<PaginatedAuditLogs>;
  PaginatedBreedingPrograms: ResolverTypeWrapper<PaginatedBreedingPrograms>;
  PaginatedBreedingRecords: ResolverTypeWrapper<PaginatedBreedingRecords>;
  PaginatedBreeds: ResolverTypeWrapper<PaginatedBreeds>;
  PaginatedClubEvents: ResolverTypeWrapper<PaginatedClubEvents>;
  PaginatedCompetitions: ResolverTypeWrapper<PaginatedCompetitions>;
  PaginatedDogs: ResolverTypeWrapper<PaginatedDogs>;
  PaginatedEvents: ResolverTypeWrapper<PaginatedEvents>;
  PaginatedHealthRecords: ResolverTypeWrapper<PaginatedHealthRecords>;
  PaginatedOwnerships: ResolverTypeWrapper<PaginatedOwnerships>;
  PaginatedSystemLogs: ResolverTypeWrapper<PaginatedSystemLogs>;
  PaginatedUsers: ResolverTypeWrapper<PaginatedUsers>;
  PedigreeCreationResult: ResolverTypeWrapper<PedigreeCreationResult>;
  PedigreeNode: ResolverTypeWrapper<PedigreeNode>;
  PointsByCategory: ResolverTypeWrapper<PointsByCategory>;
  Query: ResolverTypeWrapper<{}>;
  RecordTypeCount: ResolverTypeWrapper<RecordTypeCount>;
  RegisterInput: RegisterInput;
  SortDirection: SortDirection;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SystemLog: ResolverTypeWrapper<SystemLog>;
  TransferOwnershipInput: TransferOwnershipInput;
  UpdateBreedInput: UpdateBreedInput;
  UpdateBreedingProgramInput: UpdateBreedingProgramInput;
  UpdateBreedingRecordInput: UpdateBreedingRecordInput;
  UpdateCompetitionInput: UpdateCompetitionInput;
  UpdateDogInput: UpdateDogInput;
  UpdateEventInput: UpdateEventInput;
  UpdateHealthRecordInput: UpdateHealthRecordInput;
  UpdateOwnershipInput: UpdateOwnershipInput;
  UpdateUserInput: UpdateUserInput;
  Upload: ResolverTypeWrapper<Scalars['Upload']['output']>;
  User: ResolverTypeWrapper<User>;
  UserRole: UserRole;
  VaccinationStatus: ResolverTypeWrapper<VaccinationStatus>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AuditLog: AuditLog;
  AuthPayload: AuthPayload;
  Boolean: Scalars['Boolean']['output'];
  Breed: Breed;
  BreedingPair: BreedingPair;
  BreedingProgram: BreedingProgram;
  BreedingRecord: BreedingRecord;
  BreedingRecordInput: BreedingRecordInput;
  CategoryCount: CategoryCount;
  Club: Club;
  ClubEvent: ClubEvent;
  CommonAncestor: CommonAncestor;
  CompetitionResult: CompetitionResult;
  CompetitionStats: CompetitionStats;
  CreateAuditLogInput: CreateAuditLogInput;
  CreateBreedInput: CreateBreedInput;
  CreateBreedingPairInput: CreateBreedingPairInput;
  CreateBreedingProgramInput: CreateBreedingProgramInput;
  CreateClubEventInput: CreateClubEventInput;
  CreateCompetitionInput: CreateCompetitionInput;
  CreateDogInput: CreateDogInput;
  CreateEventInput: CreateEventInput;
  CreateHealthRecordInput: CreateHealthRecordInput;
  CreateOwnershipInput: CreateOwnershipInput;
  CreatePedigreeInput: CreatePedigreeInput;
  CreateSystemLogInput: CreateSystemLogInput;
  DateTime: Scalars['DateTime']['output'];
  DeleteResponse: DeleteResponse;
  DeletionResult: DeletionResult;
  Dog: Dog;
  DogImage: DogImage;
  DogImageInput: DogImageInput;
  Event: Event;
  EventRegistration: EventRegistration;
  Float: Scalars['Float']['output'];
  GenericResult: GenericResult;
  HealthRecord: HealthRecord;
  HealthSummary: HealthSummary;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  LinebreakingAnalysis: LinebreakingAnalysis;
  Mutation: {};
  Owner: Owner;
  OwnerInfoInput: OwnerInfoInput;
  Ownership: Ownership;
  OwnershipHistory: OwnershipHistory;
  OwnershipTransferResult: OwnershipTransferResult;
  PaginatedAuditLogs: PaginatedAuditLogs;
  PaginatedBreedingPrograms: PaginatedBreedingPrograms;
  PaginatedBreedingRecords: PaginatedBreedingRecords;
  PaginatedBreeds: PaginatedBreeds;
  PaginatedClubEvents: PaginatedClubEvents;
  PaginatedCompetitions: PaginatedCompetitions;
  PaginatedDogs: PaginatedDogs;
  PaginatedEvents: PaginatedEvents;
  PaginatedHealthRecords: PaginatedHealthRecords;
  PaginatedOwnerships: PaginatedOwnerships;
  PaginatedSystemLogs: PaginatedSystemLogs;
  PaginatedUsers: PaginatedUsers;
  PedigreeCreationResult: PedigreeCreationResult;
  PedigreeNode: PedigreeNode;
  PointsByCategory: PointsByCategory;
  Query: {};
  RecordTypeCount: RecordTypeCount;
  RegisterInput: RegisterInput;
  String: Scalars['String']['output'];
  SystemLog: SystemLog;
  TransferOwnershipInput: TransferOwnershipInput;
  UpdateBreedInput: UpdateBreedInput;
  UpdateBreedingProgramInput: UpdateBreedingProgramInput;
  UpdateBreedingRecordInput: UpdateBreedingRecordInput;
  UpdateCompetitionInput: UpdateCompetitionInput;
  UpdateDogInput: UpdateDogInput;
  UpdateEventInput: UpdateEventInput;
  UpdateHealthRecordInput: UpdateHealthRecordInput;
  UpdateOwnershipInput: UpdateOwnershipInput;
  UpdateUserInput: UpdateUserInput;
  Upload: Scalars['Upload']['output'];
  User: User;
  VaccinationStatus: VaccinationStatus;
};

export type AuditLogResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuditLog'] = ResolversParentTypes['AuditLog']> = {
  action?: Resolver<ResolversTypes['AuditAction'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  entityId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  entityType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ipAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  newState?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  previousState?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuthPayload'] = ResolversParentTypes['AuthPayload']> = {
  expiresAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BreedResolvers<ContextType = any, ParentType extends ResolversParentTypes['Breed'] = ResolversParentTypes['Breed']> = {
  average_height?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  average_lifespan?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  average_weight?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dogs?: Resolver<Maybe<Array<Maybe<ResolversTypes['Dog']>>>, ParentType, ContextType>;
  group?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  origin?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  temperament?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BreedingPairResolvers<ContextType = any, ParentType extends ResolversParentTypes['BreedingPair'] = ResolversParentTypes['BreedingPair']> = {
  breedingRecords?: Resolver<Maybe<Array<ResolversTypes['BreedingRecord']>>, ParentType, ContextType>;
  compatibilityNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  dam?: Resolver<ResolversTypes['Dog'], ParentType, ContextType>;
  damId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  geneticCompatibilityScore?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  plannedBreedingDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  program?: Resolver<ResolversTypes['BreedingProgram'], ParentType, ContextType>;
  programId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sire?: Resolver<ResolversTypes['Dog'], ParentType, ContextType>;
  sireId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['BreedingPairStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BreedingProgramResolvers<ContextType = any, ParentType extends ResolversParentTypes['BreedingProgram'] = ResolversParentTypes['BreedingProgram']> = {
  breed?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  breeder?: Resolver<ResolversTypes['Owner'], ParentType, ContextType>;
  breederId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  breedingPairs?: Resolver<Array<ResolversTypes['BreedingPair']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  foundationDogs?: Resolver<Array<ResolversTypes['Dog']>, ParentType, ContextType>;
  geneticTestingProtocol?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  goals?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isPublic?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  resultingLitters?: Resolver<Array<ResolversTypes['BreedingRecord']>, ParentType, ContextType>;
  selectionCriteria?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['BreedingProgramStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BreedingRecordResolvers<ContextType = any, ParentType extends ResolversParentTypes['BreedingRecord'] = ResolversParentTypes['BreedingRecord']> = {
  breedingDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  comments?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  dam?: Resolver<ResolversTypes['Dog'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  litterSize?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  puppies?: Resolver<Maybe<Array<Maybe<ResolversTypes['Dog']>>>, ParentType, ContextType>;
  sire?: Resolver<ResolversTypes['Dog'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryCountResolvers<ContextType = any, ParentType extends ResolversParentTypes['CategoryCount'] = ResolversParentTypes['CategoryCount']> = {
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClubResolvers<ContextType = any, ParentType extends ResolversParentTypes['Club'] = ResolversParentTypes['Club']> = {
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactPhone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  events?: Resolver<Maybe<Array<Maybe<ResolversTypes['ClubEvent']>>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  logo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClubEventResolvers<ContextType = any, ParentType extends ResolversParentTypes['ClubEvent'] = ResolversParentTypes['ClubEvent']> = {
  club?: Resolver<ResolversTypes['Club'], ParentType, ContextType>;
  clubId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  currentParticipants?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  event?: Resolver<ResolversTypes['Event'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maxParticipants?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  memberRegistrationFee?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  membersOnly?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  nonMemberRegistrationFee?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommonAncestorResolvers<ContextType = any, ParentType extends ResolversParentTypes['CommonAncestor'] = ResolversParentTypes['CommonAncestor']> = {
  contribution?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  dog?: Resolver<ResolversTypes['PedigreeNode'], ParentType, ContextType>;
  occurrences?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pathways?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CompetitionResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompetitionResult'] = ResolversParentTypes['CompetitionResult']> = {
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dog?: Resolver<ResolversTypes['Dog'], ParentType, ContextType>;
  dogId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  dogName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  eventDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  eventName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  judge?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  place?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  score?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  title_earned?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalParticipants?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CompetitionStatsResolvers<ContextType = any, ParentType extends ResolversParentTypes['CompetitionStats'] = ResolversParentTypes['CompetitionStats']> = {
  categoryCounts?: Resolver<Array<ResolversTypes['CategoryCount']>, ParentType, ContextType>;
  pointsByCategory?: Resolver<Array<ResolversTypes['PointsByCategory']>, ParentType, ContextType>;
  recentResults?: Resolver<Array<ResolversTypes['CompetitionResult']>, ParentType, ContextType>;
  totalCompetitions?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalWins?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DeleteResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteResponse'] = ResolversParentTypes['DeleteResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeletionResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeletionResult'] = ResolversParentTypes['DeletionResult']> = {
  count?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DogResolvers<ContextType = any, ParentType extends ResolversParentTypes['Dog'] = ResolversParentTypes['Dog']> = {
  biography?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  breed?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  breedObj?: Resolver<Maybe<ResolversTypes['Breed']>, ParentType, ContextType>;
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  competitionResults?: Resolver<Maybe<Array<Maybe<ResolversTypes['CompetitionResult']>>>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  currentOwner?: Resolver<Maybe<ResolversTypes['Owner']>, ParentType, ContextType>;
  dam?: Resolver<Maybe<ResolversTypes['Dog']>, ParentType, ContextType>;
  dateOfBirth?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  dateOfDeath?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  gender?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  healthRecords?: Resolver<Maybe<Array<Maybe<ResolversTypes['HealthRecord']>>>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<Maybe<ResolversTypes['DogImage']>>>, ParentType, ContextType>;
  isNeutered?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  mainImageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  microchipNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  offspring?: Resolver<Maybe<Array<Maybe<ResolversTypes['Dog']>>>, ParentType, ContextType>;
  ownerships?: Resolver<Maybe<Array<Maybe<ResolversTypes['Ownership']>>>, ParentType, ContextType>;
  registrationNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sire?: Resolver<Maybe<ResolversTypes['Dog']>, ParentType, ContextType>;
  titles?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  weight?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DogImageResolvers<ContextType = any, ParentType extends ResolversParentTypes['DogImage'] = ResolversParentTypes['DogImage']> = {
  caption?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  dog?: Resolver<Maybe<ResolversTypes['Dog']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isPrimary?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EventResolvers<ContextType = any, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = {
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactPhone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  eventType?: Resolver<ResolversTypes['EventType'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isPublished?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organizer?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organizerId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  registeredDogs?: Resolver<Maybe<Array<Maybe<ResolversTypes['Dog']>>>, ParentType, ContextType>;
  registrationDeadline?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  registrationUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EventRegistrationResolvers<ContextType = any, ParentType extends ResolversParentTypes['EventRegistration'] = ResolversParentTypes['EventRegistration']> = {
  dog?: Resolver<ResolversTypes['Dog'], ParentType, ContextType>;
  event?: Resolver<ResolversTypes['Event'], ParentType, ContextType>;
  registrationDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GenericResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['GenericResult'] = ResolversParentTypes['GenericResult']> = {
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HealthRecordResolvers<ContextType = any, ParentType extends ResolversParentTypes['HealthRecord'] = ResolversParentTypes['HealthRecord']> = {
  attachmentUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attachments?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dog?: Resolver<ResolversTypes['Dog'], ParentType, ContextType>;
  dogId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  results?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['HealthRecordType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  vetName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  veterinarian?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HealthSummaryResolvers<ContextType = any, ParentType extends ResolversParentTypes['HealthSummary'] = ResolversParentTypes['HealthSummary']> = {
  latestExamDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  recentRecords?: Resolver<Array<ResolversTypes['HealthRecord']>, ParentType, ContextType>;
  recordCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  recordsByType?: Resolver<Array<ResolversTypes['RecordTypeCount']>, ParentType, ContextType>;
  vaccinationStatus?: Resolver<Maybe<ResolversTypes['VaccinationStatus']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LinebreakingAnalysisResolvers<ContextType = any, ParentType extends ResolversParentTypes['LinebreakingAnalysis'] = ResolversParentTypes['LinebreakingAnalysis']> = {
  commonAncestors?: Resolver<Array<ResolversTypes['CommonAncestor']>, ParentType, ContextType>;
  dog?: Resolver<ResolversTypes['Dog'], ParentType, ContextType>;
  geneticDiversity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  inbreedingCoefficient?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  recommendations?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addBreedingPair?: Resolver<ResolversTypes['BreedingPair'], ParentType, ContextType, RequireFields<MutationAddBreedingPairArgs, 'input'>>;
  addDogImage?: Resolver<ResolversTypes['DogImage'], ParentType, ContextType, RequireFields<MutationAddDogImageArgs, 'dogId' | 'input'>>;
  changePassword?: Resolver<ResolversTypes['GenericResult'], ParentType, ContextType, RequireFields<MutationChangePasswordArgs, 'currentPassword' | 'newPassword'>>;
  clearAuditLogs?: Resolver<ResolversTypes['DeletionResult'], ParentType, ContextType, Partial<MutationClearAuditLogsArgs>>;
  clearSystemLogs?: Resolver<ResolversTypes['DeletionResult'], ParentType, ContextType, Partial<MutationClearSystemLogsArgs>>;
  createAuditLog?: Resolver<ResolversTypes['AuditLog'], ParentType, ContextType, RequireFields<MutationCreateAuditLogArgs, 'action' | 'entityId' | 'entityType'>>;
  createBreed?: Resolver<ResolversTypes['Breed'], ParentType, ContextType, RequireFields<MutationCreateBreedArgs, 'input'>>;
  createBreedingProgram?: Resolver<ResolversTypes['BreedingProgram'], ParentType, ContextType, RequireFields<MutationCreateBreedingProgramArgs, 'input'>>;
  createBreedingRecord?: Resolver<ResolversTypes['BreedingRecord'], ParentType, ContextType, RequireFields<MutationCreateBreedingRecordArgs, 'input'>>;
  createClubEvent?: Resolver<ResolversTypes['ClubEvent'], ParentType, ContextType, RequireFields<MutationCreateClubEventArgs, 'input'>>;
  createCompetitionResult?: Resolver<ResolversTypes['CompetitionResult'], ParentType, ContextType, RequireFields<MutationCreateCompetitionResultArgs, 'input'>>;
  createDog?: Resolver<ResolversTypes['Dog'], ParentType, ContextType, RequireFields<MutationCreateDogArgs, 'input'>>;
  createEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationCreateEventArgs, 'input'>>;
  createHealthRecord?: Resolver<ResolversTypes['HealthRecord'], ParentType, ContextType, RequireFields<MutationCreateHealthRecordArgs, 'input'>>;
  createOwnership?: Resolver<ResolversTypes['Ownership'], ParentType, ContextType, RequireFields<MutationCreateOwnershipArgs, 'input'>>;
  createPedigree?: Resolver<ResolversTypes['PedigreeCreationResult'], ParentType, ContextType, RequireFields<MutationCreatePedigreeArgs, 'input'>>;
  createSystemLog?: Resolver<ResolversTypes['SystemLog'], ParentType, ContextType, RequireFields<MutationCreateSystemLogArgs, 'level' | 'message' | 'source'>>;
  deactivateUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationDeactivateUserArgs, 'userId'>>;
  deleteBreed?: Resolver<ResolversTypes['DeletionResult'], ParentType, ContextType, RequireFields<MutationDeleteBreedArgs, 'id'>>;
  deleteBreedingProgram?: Resolver<ResolversTypes['DeleteResponse'], ParentType, ContextType, RequireFields<MutationDeleteBreedingProgramArgs, 'id'>>;
  deleteCompetitionResult?: Resolver<ResolversTypes['DeleteResponse'], ParentType, ContextType, RequireFields<MutationDeleteCompetitionResultArgs, 'id'>>;
  deleteDog?: Resolver<ResolversTypes['DeletionResult'], ParentType, ContextType, RequireFields<MutationDeleteDogArgs, 'id'>>;
  deleteHealthRecord?: Resolver<ResolversTypes['DeletionResult'], ParentType, ContextType, RequireFields<MutationDeleteHealthRecordArgs, 'id'>>;
  deleteOwnership?: Resolver<ResolversTypes['DeletionResult'], ParentType, ContextType, RequireFields<MutationDeleteOwnershipArgs, 'id'>>;
  linkDogToParents?: Resolver<ResolversTypes['Dog'], ParentType, ContextType, RequireFields<MutationLinkDogToParentsArgs, 'dogId'>>;
  linkLitterToBreedingPair?: Resolver<ResolversTypes['BreedingPair'], ParentType, ContextType, RequireFields<MutationLinkLitterToBreedingPairArgs, 'breedingPairId' | 'breedingRecordId'>>;
  login?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  publishEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationPublishEventArgs, 'id'>>;
  register?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'input'>>;
  registerDogForEvent?: Resolver<ResolversTypes['EventRegistration'], ParentType, ContextType, RequireFields<MutationRegisterDogForEventArgs, 'dogId' | 'eventId'>>;
  transferOwnership?: Resolver<ResolversTypes['OwnershipTransferResult'], ParentType, ContextType, RequireFields<MutationTransferOwnershipArgs, 'input'>>;
  updateBreed?: Resolver<ResolversTypes['Breed'], ParentType, ContextType, RequireFields<MutationUpdateBreedArgs, 'id' | 'input'>>;
  updateBreedingPairStatus?: Resolver<ResolversTypes['BreedingPair'], ParentType, ContextType, RequireFields<MutationUpdateBreedingPairStatusArgs, 'id' | 'status'>>;
  updateBreedingProgram?: Resolver<ResolversTypes['BreedingProgram'], ParentType, ContextType, RequireFields<MutationUpdateBreedingProgramArgs, 'id' | 'input'>>;
  updateBreedingRecord?: Resolver<ResolversTypes['BreedingRecord'], ParentType, ContextType, RequireFields<MutationUpdateBreedingRecordArgs, 'id' | 'input'>>;
  updateCompetitionResult?: Resolver<ResolversTypes['CompetitionResult'], ParentType, ContextType, RequireFields<MutationUpdateCompetitionResultArgs, 'id' | 'input'>>;
  updateDog?: Resolver<ResolversTypes['Dog'], ParentType, ContextType, RequireFields<MutationUpdateDogArgs, 'id' | 'input'>>;
  updateEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationUpdateEventArgs, 'id' | 'input'>>;
  updateHealthRecord?: Resolver<ResolversTypes['HealthRecord'], ParentType, ContextType, RequireFields<MutationUpdateHealthRecordArgs, 'id' | 'input'>>;
  updateOwnership?: Resolver<ResolversTypes['Ownership'], ParentType, ContextType, RequireFields<MutationUpdateOwnershipArgs, 'id' | 'input'>>;
  updateUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'id' | 'input'>>;
  updateUserRole?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateUserRoleArgs, 'role' | 'userId'>>;
  uploadHealthRecordAttachment?: Resolver<ResolversTypes['HealthRecord'], ParentType, ContextType, RequireFields<MutationUploadHealthRecordAttachmentArgs, 'fileUrl' | 'healthRecordId'>>;
};

export type OwnerResolvers<ContextType = any, ParentType extends ResolversParentTypes['Owner'] = ResolversParentTypes['Owner']> = {
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactPhone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  currentDogs?: Resolver<Maybe<Array<Maybe<ResolversTypes['Dog']>>>, ParentType, ContextType>;
  dogs?: Resolver<Maybe<Array<Maybe<ResolversTypes['Dog']>>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ownerships?: Resolver<Maybe<Array<Maybe<ResolversTypes['Ownership']>>>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OwnershipResolvers<ContextType = any, ParentType extends ResolversParentTypes['Ownership'] = ResolversParentTypes['Ownership']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  dog?: Resolver<ResolversTypes['Dog'], ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCurrent?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  is_current?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Owner'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  transferDocumentUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OwnershipHistoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['OwnershipHistory'] = ResolversParentTypes['OwnershipHistory']> = {
  dog?: Resolver<ResolversTypes['Dog'], ParentType, ContextType>;
  ownerships?: Resolver<Array<ResolversTypes['Ownership']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OwnershipTransferResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['OwnershipTransferResult'] = ResolversParentTypes['OwnershipTransferResult']> = {
  dog?: Resolver<ResolversTypes['Dog'], ParentType, ContextType>;
  newOwnership?: Resolver<ResolversTypes['Ownership'], ParentType, ContextType>;
  previousOwnership?: Resolver<ResolversTypes['Ownership'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedAuditLogsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedAuditLogs'] = ResolversParentTypes['PaginatedAuditLogs']> = {
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['AuditLog']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedBreedingProgramsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedBreedingPrograms'] = ResolversParentTypes['PaginatedBreedingPrograms']> = {
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['BreedingProgram']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedBreedingRecordsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedBreedingRecords'] = ResolversParentTypes['PaginatedBreedingRecords']> = {
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['BreedingRecord']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedBreedsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedBreeds'] = ResolversParentTypes['PaginatedBreeds']> = {
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['Breed']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedClubEventsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedClubEvents'] = ResolversParentTypes['PaginatedClubEvents']> = {
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['ClubEvent']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedCompetitionsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedCompetitions'] = ResolversParentTypes['PaginatedCompetitions']> = {
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['CompetitionResult']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedDogsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedDogs'] = ResolversParentTypes['PaginatedDogs']> = {
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['Dog']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedEventsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedEvents'] = ResolversParentTypes['PaginatedEvents']> = {
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedHealthRecordsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedHealthRecords'] = ResolversParentTypes['PaginatedHealthRecords']> = {
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['HealthRecord']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedOwnershipsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedOwnerships'] = ResolversParentTypes['PaginatedOwnerships']> = {
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['Ownership']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedSystemLogsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedSystemLogs'] = ResolversParentTypes['PaginatedSystemLogs']> = {
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['SystemLog']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedUsersResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedUsers'] = ResolversParentTypes['PaginatedUsers']> = {
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PedigreeCreationResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['PedigreeCreationResult'] = ResolversParentTypes['PedigreeCreationResult']> = {
  coefficient?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  dam?: Resolver<Maybe<ResolversTypes['PedigreeCreationResult']>, ParentType, ContextType>;
  dog?: Resolver<ResolversTypes['Dog'], ParentType, ContextType>;
  generation?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sire?: Resolver<Maybe<ResolversTypes['PedigreeCreationResult']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PedigreeNodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PedigreeNode'] = ResolversParentTypes['PedigreeNode']> = {
  breed?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  coefficient?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dam?: Resolver<Maybe<ResolversTypes['PedigreeNode']>, ParentType, ContextType>;
  dateOfBirth?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  gender?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  mainImageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  registrationNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sire?: Resolver<Maybe<ResolversTypes['PedigreeNode']>, ParentType, ContextType>;
  titles?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PointsByCategoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['PointsByCategory'] = ResolversParentTypes['PointsByCategory']> = {
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  auditLog?: Resolver<Maybe<ResolversTypes['AuditLog']>, ParentType, ContextType, RequireFields<QueryAuditLogArgs, 'id'>>;
  auditLogs?: Resolver<ResolversTypes['PaginatedAuditLogs'], ParentType, ContextType, RequireFields<QueryAuditLogsArgs, 'limit' | 'page'>>;
  breed?: Resolver<Maybe<ResolversTypes['Breed']>, ParentType, ContextType, RequireFields<QueryBreedArgs, 'id'>>;
  breedByName?: Resolver<Maybe<ResolversTypes['Breed']>, ParentType, ContextType, RequireFields<QueryBreedByNameArgs, 'name'>>;
  breedingPair?: Resolver<Maybe<ResolversTypes['BreedingPair']>, ParentType, ContextType, RequireFields<QueryBreedingPairArgs, 'id'>>;
  breedingProgram?: Resolver<Maybe<ResolversTypes['BreedingProgram']>, ParentType, ContextType, RequireFields<QueryBreedingProgramArgs, 'id'>>;
  breedingPrograms?: Resolver<ResolversTypes['PaginatedBreedingPrograms'], ParentType, ContextType, RequireFields<QueryBreedingProgramsArgs, 'includePrivate' | 'limit' | 'offset'>>;
  breedingRecords?: Resolver<ResolversTypes['PaginatedBreedingRecords'], ParentType, ContextType, RequireFields<QueryBreedingRecordsArgs, 'dogId' | 'limit' | 'offset' | 'role'>>;
  breeds?: Resolver<ResolversTypes['PaginatedBreeds'], ParentType, ContextType, RequireFields<QueryBreedsArgs, 'limit' | 'offset' | 'sortDirection'>>;
  club?: Resolver<Maybe<ResolversTypes['Club']>, ParentType, ContextType, RequireFields<QueryClubArgs, 'id'>>;
  clubEvents?: Resolver<ResolversTypes['PaginatedClubEvents'], ParentType, ContextType, RequireFields<QueryClubEventsArgs, 'clubId' | 'includeNonMemberEvents' | 'limit' | 'offset'>>;
  clubs?: Resolver<Array<ResolversTypes['Club']>, ParentType, ContextType>;
  competition?: Resolver<Maybe<ResolversTypes['CompetitionResult']>, ParentType, ContextType, RequireFields<QueryCompetitionArgs, 'id'>>;
  competitions?: Resolver<ResolversTypes['PaginatedCompetitions'], ParentType, ContextType, RequireFields<QueryCompetitionsArgs, 'limit' | 'offset' | 'sortBy' | 'sortDirection'>>;
  dog?: Resolver<Maybe<ResolversTypes['Dog']>, ParentType, ContextType, RequireFields<QueryDogArgs, 'id'>>;
  dogCompetitionStats?: Resolver<ResolversTypes['CompetitionStats'], ParentType, ContextType, RequireFields<QueryDogCompetitionStatsArgs, 'dogId'>>;
  dogHealthRecords?: Resolver<ResolversTypes['PaginatedHealthRecords'], ParentType, ContextType, RequireFields<QueryDogHealthRecordsArgs, 'dogId' | 'limit' | 'offset' | 'sortDirection'>>;
  dogOwnerships?: Resolver<ResolversTypes['OwnershipHistory'], ParentType, ContextType, RequireFields<QueryDogOwnershipsArgs, 'dogId'>>;
  dogPedigree?: Resolver<Maybe<ResolversTypes['PedigreeNode']>, ParentType, ContextType, RequireFields<QueryDogPedigreeArgs, 'dogId' | 'generations'>>;
  dogs?: Resolver<ResolversTypes['PaginatedDogs'], ParentType, ContextType, RequireFields<QueryDogsArgs, 'limit' | 'offset' | 'sortBy' | 'sortDirection'>>;
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventArgs, 'id'>>;
  events?: Resolver<ResolversTypes['PaginatedEvents'], ParentType, ContextType, RequireFields<QueryEventsArgs, 'limit' | 'offset' | 'sortDirection'>>;
  healthRecord?: Resolver<Maybe<ResolversTypes['HealthRecord']>, ParentType, ContextType, RequireFields<QueryHealthRecordArgs, 'id'>>;
  healthSummary?: Resolver<ResolversTypes['HealthSummary'], ParentType, ContextType, RequireFields<QueryHealthSummaryArgs, 'dogId'>>;
  linebreedingAnalysis?: Resolver<Maybe<ResolversTypes['LinebreakingAnalysis']>, ParentType, ContextType, RequireFields<QueryLinebreedingAnalysisArgs, 'damId' | 'generations' | 'sireId'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  ownerDogs?: Resolver<ResolversTypes['PaginatedOwnerships'], ParentType, ContextType, RequireFields<QueryOwnerDogsArgs, 'includeFormer' | 'limit' | 'offset' | 'ownerId'>>;
  ownership?: Resolver<Maybe<ResolversTypes['Ownership']>, ParentType, ContextType, RequireFields<QueryOwnershipArgs, 'id'>>;
  relatedCompetitions?: Resolver<Array<ResolversTypes['CompetitionResult']>, ParentType, ContextType, RequireFields<QueryRelatedCompetitionsArgs, 'competitionId' | 'limit'>>;
  systemLog?: Resolver<Maybe<ResolversTypes['SystemLog']>, ParentType, ContextType, RequireFields<QuerySystemLogArgs, 'id'>>;
  systemLogs?: Resolver<ResolversTypes['PaginatedSystemLogs'], ParentType, ContextType, RequireFields<QuerySystemLogsArgs, 'limit' | 'page'>>;
  upcomingEvents?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryUpcomingEventsArgs, 'days' | 'limit'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<ResolversTypes['PaginatedUsers'], ParentType, ContextType, RequireFields<QueryUsersArgs, 'limit' | 'offset'>>;
};

export type RecordTypeCountResolvers<ContextType = any, ParentType extends ResolversParentTypes['RecordTypeCount'] = ResolversParentTypes['RecordTypeCount']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['HealthRecordType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SystemLogResolvers<ContextType = any, ParentType extends ResolversParentTypes['SystemLog'] = ResolversParentTypes['SystemLog']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  details?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ipAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  level?: Resolver<ResolversTypes['LogLevel'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  source?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stackTrace?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fullName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastLogin?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<Maybe<ResolversTypes['Owner']>, ParentType, ContextType>;
  profileImageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['UserRole'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VaccinationStatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['VaccinationStatus'] = ResolversParentTypes['VaccinationStatus']> = {
  isUpToDate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  missingVaccinations?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  nextDueDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AuditLog?: AuditLogResolvers<ContextType>;
  AuthPayload?: AuthPayloadResolvers<ContextType>;
  Breed?: BreedResolvers<ContextType>;
  BreedingPair?: BreedingPairResolvers<ContextType>;
  BreedingProgram?: BreedingProgramResolvers<ContextType>;
  BreedingRecord?: BreedingRecordResolvers<ContextType>;
  CategoryCount?: CategoryCountResolvers<ContextType>;
  Club?: ClubResolvers<ContextType>;
  ClubEvent?: ClubEventResolvers<ContextType>;
  CommonAncestor?: CommonAncestorResolvers<ContextType>;
  CompetitionResult?: CompetitionResultResolvers<ContextType>;
  CompetitionStats?: CompetitionStatsResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteResponse?: DeleteResponseResolvers<ContextType>;
  DeletionResult?: DeletionResultResolvers<ContextType>;
  Dog?: DogResolvers<ContextType>;
  DogImage?: DogImageResolvers<ContextType>;
  Event?: EventResolvers<ContextType>;
  EventRegistration?: EventRegistrationResolvers<ContextType>;
  GenericResult?: GenericResultResolvers<ContextType>;
  HealthRecord?: HealthRecordResolvers<ContextType>;
  HealthSummary?: HealthSummaryResolvers<ContextType>;
  LinebreakingAnalysis?: LinebreakingAnalysisResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Owner?: OwnerResolvers<ContextType>;
  Ownership?: OwnershipResolvers<ContextType>;
  OwnershipHistory?: OwnershipHistoryResolvers<ContextType>;
  OwnershipTransferResult?: OwnershipTransferResultResolvers<ContextType>;
  PaginatedAuditLogs?: PaginatedAuditLogsResolvers<ContextType>;
  PaginatedBreedingPrograms?: PaginatedBreedingProgramsResolvers<ContextType>;
  PaginatedBreedingRecords?: PaginatedBreedingRecordsResolvers<ContextType>;
  PaginatedBreeds?: PaginatedBreedsResolvers<ContextType>;
  PaginatedClubEvents?: PaginatedClubEventsResolvers<ContextType>;
  PaginatedCompetitions?: PaginatedCompetitionsResolvers<ContextType>;
  PaginatedDogs?: PaginatedDogsResolvers<ContextType>;
  PaginatedEvents?: PaginatedEventsResolvers<ContextType>;
  PaginatedHealthRecords?: PaginatedHealthRecordsResolvers<ContextType>;
  PaginatedOwnerships?: PaginatedOwnershipsResolvers<ContextType>;
  PaginatedSystemLogs?: PaginatedSystemLogsResolvers<ContextType>;
  PaginatedUsers?: PaginatedUsersResolvers<ContextType>;
  PedigreeCreationResult?: PedigreeCreationResultResolvers<ContextType>;
  PedigreeNode?: PedigreeNodeResolvers<ContextType>;
  PointsByCategory?: PointsByCategoryResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RecordTypeCount?: RecordTypeCountResolvers<ContextType>;
  SystemLog?: SystemLogResolvers<ContextType>;
  Upload?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  VaccinationStatus?: VaccinationStatusResolvers<ContextType>;
};

