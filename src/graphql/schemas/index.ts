import { gql } from 'graphql-tag';
import { scalarTypeDefs } from './scalars';

const typeDefs = gql`
  # Scalars imported from scalars.ts
  scalar DateTime
  scalar Upload

  # Event Types
  enum EventType {
    SHOW
    COMPETITION
    SEMINAR
    TRAINING
    MEETING
    SOCIAL
    OTHER
  }
  
  # Health Record Types
  enum HealthRecordType {
    VACCINATION
    EXAMINATION
    TREATMENT
    SURGERY
    TEST
    OTHER
  }

  # Custom Enums
  enum DogSortField {
    NAME
    BREED
    DATE_OF_BIRTH
    REGISTRATION_NUMBER
    CREATED_AT
  }
  
  enum CompetitionSortField {
    EVENT_DATE
    RANK
    POINTS
    EVENT_NAME
  }
  
  enum DogRole {
    SIRE
    DAM
    BOTH
  }

  enum SortDirection {
    ASC
    DESC
  }
  
  enum ApprovalStatus {
    PENDING
    APPROVED
    DECLINED
  }
  
  enum DogRole {
    SIRE
    DAM
    BOTH
  }
  
  enum LogLevel {
    DEBUG
    INFO
    WARNING
    ERROR
    CRITICAL
  }
  
  enum AuditAction {
    CREATE
    READ
    UPDATE
    DELETE
    LOGIN
    LOGOUT
    EXPORT
    IMPORT
    TRANSFER_OWNERSHIP
    APPROVE
    REJECT
  }
  
  enum CompetitionCategory {
    CONFORMATION
    OBEDIENCE
    AGILITY
    FIELD_TRIALS
    HERDING
    TRACKING
    RALLY
    SCENT_WORK
  }
  
  # Breeding Program Enums
  enum BreedingProgramStatus {
    PLANNING
    ACTIVE
    PAUSED
    COMPLETED
    CANCELLED
  }

  enum BreedingPairStatus {
    PLANNED
    APPROVED
    PENDING_TESTING
    BREEDING_SCHEDULED
    BRED
    UNSUCCESSFUL
    CANCELLED
  }
  
  # User Types
  enum UserRole {
    ADMIN
    OWNER
    HANDLER
    CLUB
    VIEWER
  }
  
  # Log Types
  enum LogLevel {
    DEBUG
    INFO
    WARNING
    ERROR
    CRITICAL
  }
  
  enum AuditAction {
    CREATE
    READ
    UPDATE
    DELETE
    LOGIN
    LOGOUT
    EXPORT
    IMPORT
    TRANSFER_OWNERSHIP
    APPROVE
    REJECT
  }
  
  type SystemLog {
    id: ID!
    timestamp: DateTime!
    level: LogLevel!
    message: String!
    source: String!
    details: String
    stackTrace: String
    ipAddress: String
    user: User
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type AuditLog {
    id: ID!
    timestamp: DateTime!
    action: AuditAction!
    entityType: String!
    entityId: String!
    user: User!
    previousState: String
    newState: String
    ipAddress: String
    metadata: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type PaginatedSystemLogs {
    totalCount: Int!
    hasMore: Boolean!
    items: [SystemLog!]!
  }
  
  type PaginatedAuditLogs {
    totalCount: Int!
    hasMore: Boolean!
    items: [AuditLog!]!
  }
  
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    fullName: String!
    role: UserRole!
    profileImageUrl: String
    isActive: Boolean!
    lastLogin: DateTime
    owner: Owner
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type AuthPayload {
    token: String!
    user: User!
    expiresAt: DateTime!
  }
  
  type PaginatedUsers {
    totalCount: Int!
    hasMore: Boolean!
    items: [User!]!
  }
  
  type GenericResult {
    success: Boolean!
    message: String
  }
  
  # Pedigree API Types
  enum BreedingRole {
    SIRE
    DAM
    BOTH
  }
  
  type PedigreeNode {
    id: ID!
    name: String!
    registrationNumber: String!
    breed: String!
    breedObj: Breed
    gender: String!
    dateOfBirth: DateTime!
    color: String
    titles: [String]
    mainImageUrl: String
    coefficient: Float
    sire: PedigreeNode
    dam: PedigreeNode
  }
  
  type PedigreeCreationResult {
    id: ID!
    dog: Dog!
    sire: PedigreeCreationResult
    dam: PedigreeCreationResult
    generation: Int!
    coefficient: Float
  }
  
  type BreedingRecord {
    id: ID!
    sire: Dog!
    dam: Dog!
    breedingDate: DateTime!
    litterSize: Int
    comments: String
    puppies: [Dog]
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type PaginatedBreedingRecords {
    totalCount: Int!
    hasMore: Boolean!
    items: [BreedingRecord!]!
  }
  
  type LinebreakingAnalysis {
    dog: Dog!
    inbreedingCoefficient: Float!
    commonAncestors: [CommonAncestor!]!
    geneticDiversity: Float!
    recommendations: [String!]!
  }
  
  type CommonAncestor {
    dog: PedigreeNode!
    occurrences: Int!
    pathways: [String!]!
    contribution: Float!
  }

  # Event and Club Event Types
  type Event {
    id: ID!
    title: String!
    description: String!
    eventType: EventType!
    startDate: DateTime!  # Always a valid Date object
    endDate: DateTime!
    location: String!
    address: String
    organizer: String!
    organizerId: ID
    contactEmail: String
    contactPhone: String
    website: String
    registrationUrl: String
    registrationDeadline: DateTime
    imageUrl: String
    registeredDogs: [Dog]
    isPublished: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ClubEvent {
    id: ID!
    clubId: ID!
    club: Club!
    event: Event!
    membersOnly: Boolean!
    memberRegistrationFee: Float
    nonMemberRegistrationFee: Float
    maxParticipants: Int
    currentParticipants: Int
  }

  type Club {
    id: ID!
    name: String!
    description: String
    logo: String
    website: String
    contactEmail: String
    contactPhone: String
    address: String
    events: [ClubEvent]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type EventRegistration {
    event: Event!
    dog: Dog!
    registrationDate: DateTime!
  }

  type PaginatedEvents {
    totalCount: Int!
    hasMore: Boolean!
    items: [Event!]!
  }
  
  type PaginatedHealthRecords {
    totalCount: Int!
    hasMore: Boolean!
    items: [HealthRecord!]!
  }
  
  type HealthRecord {
    id: ID!
    dog: Dog!
    dogId: ID!
    date: DateTime!
    veterinarian: String
    vetName: String  # Alias for veterinarian_name
    description: String!
    results: String
    type: HealthRecordType!
    attachmentUrl: String
    attachments: String  # Alias for document_url
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type RecordTypeCount {
    type: HealthRecordType!
    count: Int!
  }
  
  type VaccinationStatus {
    isUpToDate: Boolean!
    nextDueDate: DateTime
    missingVaccinations: [String!]
  }
  
  # System and Audit Log Types
  type SystemLog {
    id: ID!
    timestamp: DateTime!
    level: LogLevel!
    message: String!
    source: String!
    details: String
    stackTrace: String
    ipAddress: String
    userId: ID
    user: User
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type AuditLog {
    id: ID!
    timestamp: DateTime!
    action: AuditAction!
    entityType: String!
    entityId: String!
    previousState: String
    newState: String
    ipAddress: String
    metadata: String
    userId: ID
    user: User
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type PaginatedSystemLogs {
    totalCount: Int!
    hasMore: Boolean!
    items: [SystemLog!]!
  }
  
  type PaginatedAuditLogs {
    totalCount: Int!
    hasMore: Boolean!
    items: [AuditLog!]!
  }
  
  type HealthSummary {
    recordCount: Int!
    latestExamDate: DateTime
    recordsByType: [RecordTypeCount!]!
    recentRecords: [HealthRecord!]!
    vaccinationStatus: VaccinationStatus
  }

  # Competition Types
  type CompetitionResult {
    id: ID!
    dog: Dog!
    dogId: ID!
    dogName: String!
    eventName: String!
    eventDate: DateTime!
    location: String!
    rank: Int!
    place: Int  # Alias for rank
    score: Float  # Alias for points
    title_earned: String
    judge: String!
    points: Float!
    category: String!
    description: String
    totalParticipants: Int
    imageUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type CategoryCount {
    category: String!
    count: Int!
  }
  
  type PointsByCategory {
    category: String!
    points: Float!
  }
  
  type CompetitionStats {
    totalCompetitions: Int!
    totalWins: Int!
    categoryCounts: [CategoryCount!]!
    pointsByCategory: [PointsByCategory!]!
    recentResults: [CompetitionResult!]!
  }
  
  type PaginatedCompetitions {
    totalCount: Int!
    hasMore: Boolean!
    items: [CompetitionResult!]!
  }
  
  type DeleteResponse {
    success: Boolean!
    message: String!
  }

  # Breeding Program Types
  type BreedingProgram {
    id: ID!
    name: String!
    description: String!
    breeder: Owner!
    breederId: ID!
    breed: String!
    goals: [String!]!
    startDate: DateTime!
    endDate: DateTime
    status: BreedingProgramStatus!
    foundationDogs: [Dog!]!
    breedingPairs: [BreedingPair!]!
    resultingLitters: [BreedingRecord!]!
    geneticTestingProtocol: String
    selectionCriteria: String
    notes: String
    isPublic: Boolean!
    imageUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type BreedingPair {
    id: ID!
    program: BreedingProgram!
    programId: ID!
    sire: Dog!
    sireId: ID!
    dam: Dog!
    damId: ID!
    plannedBreedingDate: DateTime
    compatibilityNotes: String
    geneticCompatibilityScore: Float
    breedingRecords: [BreedingRecord!]
    status: BreedingPairStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    geneticAnalysis: GeneticAnalysis
  }

  type PaginatedBreedingPrograms {
    totalCount: Int!
    hasMore: Boolean!
    items: [BreedingProgram!]!
  }

  type PaginatedClubEvents {
    totalCount: Int!
    hasMore: Boolean!
    items: [ClubEvent!]!
  }

  # Types
  type Breed {
    id: ID!
    name: String!
    group: String
    origin: String
    description: String
    temperament: String
    average_lifespan: String
    average_height: String
    average_weight: String
    dogs: [Dog]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type PaginatedBreeds {
    totalCount: Int!
    hasMore: Boolean!
    items: [Breed!]!
  }
  
  type Dog {
    id: ID!
    name: String!
    breed: String!
    breedObj: Breed
    gender: String!
    dateOfBirth: DateTime!  # Always required as Date, never undefined
    dateOfDeath: DateTime
    color: String
    registrationNumber: String!
    microchipNumber: String
    titles: [String]
    isNeutered: Boolean
    height: Float
    weight: Float
    biography: String
    mainImageUrl: String
    images: [DogImage]
    ownerships: [Ownership]
    currentOwner: Owner
    healthRecords: [HealthRecord]
    competitionResults: [CompetitionResult]
    sire: Dog
    dam: Dog
    offspring: [Dog]
    litter: Litter
    approvalStatus: ApprovalStatus!
    approvedBy: User
    approvalDate: DateTime
    approvalNotes: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type DogImage {
    id: ID!
    url: String!
    caption: String
    isPrimary: Boolean!
    createdAt: DateTime!
    dog: Dog
  }

  type Ownership {
    id: ID!
    owner: Owner!
    dog: Dog!
    startDate: DateTime!
    endDate: DateTime
    is_current: Boolean!  # Note field name is_current (not is_active)
    isCurrent: Boolean!  # Alias for is_current in camelCase
    transferDocumentUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Owner {
    id: ID!
    userId: ID
    name: String!
    contactEmail: String
    contactPhone: String
    address: String
    dogs: [Dog]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type HealthRecord {
    id: ID!
    dog: Dog!
    date: DateTime!
    veterinarian: String
    vetName: String  # Alias for veterinarian_name
    description: String!  # Note: field is description (not diagnosis)
    results: String  # Note: field is results (not test_results)
    attachmentUrl: String
    attachments: String  # Alias for document_url
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CompetitionResult {
    id: ID!
    dog: Dog!
    eventName: String!
    eventDate: DateTime!
    category: String
    rank: Int
    place: Int  # Alias for rank
    score: Float  # Alias for points
    title_earned: String  # Note: field is title_earned (not certificate)
    points: Float
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type PaginatedDogs {
    totalCount: Int!
    hasMore: Boolean!
    items: [Dog!]!
  }

  type DeletionResult {
    success: Boolean!
    message: String
  }
  
  type RegisterLitterPuppiesResponse {
    success: Boolean!
    message: String!
    puppies: [Dog]
  }
  
  # Ownership types
  type Ownership {
    id: ID!
    dog: Dog!
    owner: Owner!
    startDate: DateTime!
    endDate: DateTime
    is_current: Boolean!  # Note field name is_current (not is_active)
    isCurrent: Boolean!  # Alias for is_current in camelCase
    transferDocumentUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type Owner {
    id: ID!
    user: User
    name: String!
    contactEmail: String
    contactPhone: String
    address: String
    ownerships: [Ownership]
    currentDogs: [Dog]
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  type OwnershipHistory {
    dog: Dog!
    ownerships: [Ownership!]!
  }
  
  type PaginatedOwnerships {
    totalCount: Int!
    hasMore: Boolean!
    items: [Ownership!]!
  }
  
  type OwnershipTransferResult {
    previousOwnership: Ownership!
    newOwnership: Ownership!
    dog: Dog!
  }
  
  # Litter type definition
  type Litter {
    id: ID!
    litterName: String!
    registrationNumber: String
    breedingRecordId: String
    whelpingDate: DateTime!
    totalPuppies: Int!
    malePuppies: Int
    femalePuppies: Int
    notes: String
    sire: Dog
    dam: Dog
    puppies: [Dog]
    createdAt: DateTime!
    updatedAt: DateTime!
  }
  
  # Litter connection for pagination
  type LitterConnection {
    totalCount: Int!
    hasMore: Boolean!
    items: [Litter!]!
  }

  # Inputs
  input CreateBreedInput {
    name: String!
    group: String
    origin: String
    description: String
    temperament: String
    average_lifespan: String
    average_height: String
    average_weight: String
  }
  
  input UpdateBreedInput {
    name: String
    group: String
    origin: String
    description: String
    temperament: String
    average_lifespan: String
    average_height: String
    average_weight: String
  }

  input CreateDogInput {
    name: String!
    breed: String!
    breedId: ID
    gender: String!
    dateOfBirth: DateTime!  # Must be a valid Date, never undefined
    dateOfDeath: DateTime
    color: String
    microchipNumber: String
    titles: [String]
    isNeutered: Boolean
    height: Float
    weight: Float
    biography: String
    mainImageUrl: String
    sireId: ID
    damId: ID
    ownerId: ID!
  }

  input UpdateDogInput {
    name: String
    breed: String
    breedId: ID
    gender: String
    dateOfBirth: DateTime
    dateOfDeath: DateTime
    color: String
    registrationNumber: String
    microchipNumber: String
    titles: [String]
    isNeutered: Boolean
    height: Float
    weight: Float
    biography: String
    mainImageUrl: String
    sireId: ID
    damId: ID
  }

  input DogImageInput {
    url: String!
    caption: String
    isPrimary: Boolean
  }
  
  # Litter Input Types
  input LitterInput {
    breedingRecordId: ID
    sireId: ID!
    damId: ID!
    litterName: String!
    registrationNumber: String
    whelpingDate: DateTime!
    totalPuppies: Int!
    malePuppies: Int
    femalePuppies: Int
    notes: String
    puppyDetails: [PuppyDetailInput]
  }
  
  input UpdateLitterInput {
    litterName: String
    registrationNumber: String
    whelpingDate: DateTime
    totalPuppies: Int
    malePuppies: Int
    femalePuppies: Int
    notes: String
  }
  
  input PuppyDetailInput {
    name: String!
    gender: String!
    color: String
    markings: String
    microchipNumber: String
    isCollapsed: Boolean
  }
  
  input RegisterLitterPuppiesInput {
    litterId: ID!
    puppies: [PuppyRegistrationInput!]!
  }
  
  input PuppyRegistrationInput {
    name: String!
    gender: String!
    color: String!
    microchipNumber: String
    isNeutered: Boolean
    ownerId: ID
  }

  # Event Inputs
  input CreateEventInput {
    title: String!
    description: String!
    eventType: EventType!
    startDate: DateTime!  # Must be valid Date object
    endDate: DateTime!
    location: String!
    address: String
    organizer: String!
    organizerId: ID
    contactEmail: String
    contactPhone: String
    website: String
    registrationUrl: String
    registrationDeadline: DateTime
    imageUrl: String
    isPublished: Boolean = false
  }

  input UpdateEventInput {
    title: String
    description: String
    eventType: EventType
    startDate: DateTime
    endDate: DateTime
    location: String
    address: String
    organizer: String
    contactEmail: String
    contactPhone: String
    website: String
    registrationUrl: String
    registrationDeadline: DateTime
    imageUrl: String
    isPublished: Boolean
  }

  input CreateClubEventInput {
    clubId: ID!
    eventInput: CreateEventInput!
    membersOnly: Boolean!
    memberRegistrationFee: Float
    nonMemberRegistrationFee: Float
    maxParticipants: Int
  }
  
  # Health Record Inputs
  input CreateHealthRecordInput {
    dogId: ID!
    date: DateTime!
    veterinarian: String
    description: String!
    results: String
    type: HealthRecordType!
    attachmentUrl: String
  }
  
  input UpdateHealthRecordInput {
    date: DateTime
    veterinarian: String
    description: String
    results: String
    type: HealthRecordType
    attachmentUrl: String
  }
  
  # Ownership Inputs
  input CreateOwnershipInput {
    dogId: ID!
    ownerId: ID!
    startDate: DateTime!
    is_current: Boolean!
    transferDocumentUrl: String
  }
  
  input TransferOwnershipInput {
    dogId: ID!
    newOwnerId: ID!
    transferDate: DateTime!
    transferDocumentUrl: String
  }
  
  input UpdateOwnershipInput {
    startDate: DateTime
    endDate: DateTime
    is_current: Boolean
    transferDocumentUrl: String
  }
  
  # Breeding Record Inputs
  input BreedingRecordInput {
    sireId: ID!
    damId: ID!
    breedingDate: DateTime!
    litterSize: Int
    comments: String
    puppyIds: [ID]
  }
  
  input UpdateBreedingRecordInput {
    breedingDate: DateTime
    litterSize: Int
    comments: String
    puppyIds: [ID]
  }
  
  # Pedigree Inputs
  input CreatePedigreeInput {
    dogId: ID!
    sireId: ID
    damId: ID
    generation: Int = 2
    coefficient: Float = 0
  }
  
  # Breeding Program Inputs
  input CreateBreedingProgramInput {
    name: String!
    description: String!
    breederId: ID!
    breed: String!
    goals: [String!]!
    startDate: DateTime!
    endDate: DateTime
    geneticTestingProtocol: String
    selectionCriteria: String
    notes: String
    isPublic: Boolean!
    imageUrl: String
    foundationDogIds: [ID!]!
  }
  
  input UpdateBreedingProgramInput {
    name: String
    description: String
    breed: String
    goals: [String!]
    startDate: DateTime
    endDate: DateTime
    status: BreedingProgramStatus
    geneticTestingProtocol: String
    selectionCriteria: String
    notes: String
    isPublic: Boolean
    imageUrl: String
    foundationDogIds: [ID!]
  }
  
  input CreateBreedingPairInput {
    programId: ID!
    sireId: ID!
    damId: ID!
    plannedBreedingDate: DateTime
    compatibilityNotes: String
    status: BreedingPairStatus!
  }

  # Competition Inputs
  input CreateCompetitionInput {
    dogId: ID!
    eventName: String!
    eventDate: DateTime!
    location: String!
    rank: Int!
    title_earned: String
    judge: String!
    points: Float!
    category: String!
    description: String
    totalParticipants: Int
    imageUrl: String
  }
  
  input UpdateCompetitionInput {
    eventName: String
    eventDate: DateTime
    location: String
    rank: Int
    title_earned: String
    judge: String
    points: Float
    category: String
    description: String
    totalParticipants: Int
    imageUrl: String
  }
  
  # User Inputs
  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    ownerInfo: OwnerInfoInput
  }
  
  input OwnerInfoInput {
    name: String!
    contactEmail: String
    contactPhone: String
    address: String
  }
  
  input UpdateUserInput {
    email: String
    firstName: String
    lastName: String
    password: String
    profileImageUrl: String
    ownerInfo: OwnerInfoInput
  }
  
  # Queries
  # Dog genetic relationship extension
  extend type Dog {
    genotypes: [DogGenotype!]
  }

  # Genetic trait inheritance types
  type GeneticTrait {
    id: ID!
    name: String!
    description: String
    inheritancePattern: InheritancePattern!
    alleles: [Allele!]!
    breedPrevalence: [BreedTraitPrevalence!]
    healthImplications: String
    testingOptions: [GeneticTest!]
    createdAt: DateTime!
    updatedAt: DateTime
  }

  type Allele {
    id: ID!
    symbol: String!
    name: String!
    description: String
    dominant: Boolean!
    traitId: ID!
    trait: GeneticTrait!
  }

  type DogGenotype {
    id: ID!
    dogId: ID!
    dog: Dog
    traitId: ID!
    trait: GeneticTrait!
    genotype: String!
    testMethod: GeneticTestMethod
    testDate: DateTime
    confidence: Float
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime
  }

  type BreedTraitPrevalence {
    id: ID!
    breedId: ID!
    breed: Breed!
    traitId: ID!
    trait: GeneticTrait!
    frequency: Float!
    studyReference: String
    notes: String
  }

  type GeneticTest {
    id: ID!
    name: String!
    provider: String!
    description: String
    traits: [GeneticTrait!]!
    accuracy: Float
    cost: Float
    turnaroundTime: Int
    sampleType: String
    url: String
  }

  type GeneticAnalysis {
    id: ID!
    breedingPairId: ID
    sireId: ID!
    sire: Dog!
    damId: ID!
    dam: Dog!
    traitPredictions: [TraitPrediction!]!
    overallCompatibility: Float!
    riskFactors: [GeneticRiskFactor!]
    recommendations: String
    createdAt: DateTime!
    updatedAt: DateTime
  }

  type TraitPrediction {
    id: ID!
    analysisId: ID!
    traitId: ID!
    trait: GeneticTrait!
    possibleGenotypes: [GenotypeOutcome!]!
    notes: String
  }

  type GenotypeOutcome {
    genotype: String!
    probability: Float!
    phenotype: String!
    isCarrier: Boolean!
    healthImplications: String
  }

  type GeneticRiskFactor {
    traitId: ID!
    trait: GeneticTrait!
    riskLevel: RiskLevel!
    description: String!
    recommendations: String
  }

  enum InheritancePattern {
    AUTOSOMAL_DOMINANT
    AUTOSOMAL_RECESSIVE
    X_LINKED_DOMINANT
    X_LINKED_RECESSIVE
    POLYGENIC
    CODOMINANT
    INCOMPLETE_DOMINANCE
    EPISTASIS
    MATERNAL
  }

  enum GeneticTestMethod {
    DNA_TEST
    PEDIGREE_ANALYSIS
    PHENOTYPE_EXAMINATION
    CARRIER_TESTING
    LINKAGE_TESTING
  }

  enum RiskLevel {
    NONE
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  type Query {
    breeds(
      offset: Int = 0
      limit: Int = 20
      searchTerm: String
      sortDirection: SortDirection = ASC
    ): PaginatedBreeds!
    
    breed(id: ID!): Breed
    
    breedByName(name: String!): Breed
    
    dogs(
      offset: Int = 0
      limit: Int = 20
      searchTerm: String
      breed: String
      breedId: ID
      gender: String
      ownerId: ID
      approvalStatus: ApprovalStatus
      sortBy: DogSortField = NAME
      sortDirection: SortDirection = ASC
    ): PaginatedDogs!

    dog(id: ID!): Dog

    # Pedigree data with full dog information
    dogPedigree(dogId: ID!, generations: Int = 3): PedigreeNode

    # Health Record Queries
    dogHealthRecords(
      dogId: ID!
      offset: Int = 0
      limit: Int = 20
      type: HealthRecordType
      startDate: DateTime
      endDate: DateTime
      sortDirection: SortDirection = DESC
    ): PaginatedHealthRecords!
    
    # Ownership Queries
    dogOwnerships(dogId: ID!): OwnershipHistory!
    
    ownerDogs(
      ownerId: ID!
      includeFormer: Boolean = false
      offset: Int = 0
      limit: Int = 20
    ): PaginatedOwnerships!
    
    ownership(id: ID!): Ownership
    
    # Litter Queries
    litters(
      offset: Int = 0
      limit: Int = 20
      ownerId: ID
      breedId: ID
      fromDate: DateTime
      toDate: DateTime
      searchTerm: String
    ): LitterConnection!
    
    litter(id: ID!): Litter
    
    dogLitters(
      dogId: ID!
      role: DogRole = BOTH
      offset: Int = 0
      limit: Int = 20
    ): LitterConnection!
    
    # Pedigree Queries
    # Note: dogPedigree query is defined above
    
    # Breeding Program Queries
    breedingPrograms(
      offset: Int = 0
      limit: Int = 20
      searchTerm: String
      breederId: ID
      breed: String
      status: BreedingProgramStatus
      includePrivate: Boolean = false
    ): PaginatedBreedingPrograms!
    
    breedingProgram(id: ID!): BreedingProgram
    
    breedingPair(id: ID!): BreedingPair
    
    breedingRecords(
      dogId: ID!
      role: BreedingRole = BOTH
      offset: Int = 0
      limit: Int = 20
    ): PaginatedBreedingRecords!
    
    linebreedingAnalysis(sireId: ID!, damId: ID!, generations: Int = 6): LinebreakingAnalysis
    
    healthRecord(id: ID!): HealthRecord
    
    # System & Audit Log Queries
    systemLogs(
      page: Int = 1
      limit: Int = 20
      level: LogLevel
    ): PaginatedSystemLogs!
    
    systemLog(id: ID!): SystemLog
    
    auditLogs(
      page: Int = 1
      limit: Int = 20
      entityType: String
      action: AuditAction
    ): PaginatedAuditLogs!
    
    auditLog(id: ID!): AuditLog
    
    healthSummary(dogId: ID!): HealthSummary!
    
    # Competition Queries
    competitions(
      offset: Int = 0
      limit: Int = 20
      searchTerm: String
      category: String
      dogId: ID
      startDate: DateTime
      endDate: DateTime
      sortBy: CompetitionSortField = EVENT_DATE
      sortDirection: SortDirection = DESC
    ): PaginatedCompetitions!
    
    competition(id: ID!): CompetitionResult
    
    dogCompetitionStats(dogId: ID!): CompetitionStats!
    
    relatedCompetitions(
      competitionId: ID!
      dogId: ID
      category: String
      limit: Int = 3
    ): [CompetitionResult!]!
    
    # Event Queries
    events(
      offset: Int = 0
      limit: Int = 20
      searchTerm: String
      eventType: EventType
      startDate: DateTime
      endDate: DateTime
      location: String
      organizerId: ID
      sortDirection: SortDirection = ASC
    ): PaginatedEvents!

    event(id: ID!): Event

    upcomingEvents(
      days: Int = 30
      limit: Int = 5
      eventType: EventType
    ): [Event!]!

    # Club Event Queries
    clubEvents(
      clubId: ID!
      offset: Int = 0
      limit: Int = 20
      includeNonMemberEvents: Boolean = true
    ): PaginatedClubEvents!
    
    clubs: [Club!]!
    club(id: ID!): Club
    
    # User Queries
    me: User
    
    users(
      offset: Int = 0
      limit: Int = 20
      searchTerm: String
      role: UserRole
      isActive: Boolean
    ): PaginatedUsers!
    
    user(id: ID!): User

    # Genetic calculator queries
    geneticTraits(breedId: ID): [GeneticTrait!]!
    geneticTrait(id: ID!): GeneticTrait
    dogGenotypes(dogId: ID!): [DogGenotype!]!
    breedGeneticProfile(breedId: ID!): [BreedTraitPrevalence!]!
    geneticTests: [GeneticTest!]!
    
    # Primary calculator functions
    calculateGeneticCompatibility(sireId: ID!, damId: ID!): GeneticAnalysis!
    predictOffspringTraits(sireId: ID!, damId: ID!, traitIds: [ID!]): [TraitPrediction!]!
    recommendBreedingPairs(dogId: ID!, count: Int = 5): [BreedingPair!]!
  }

  # Mutations
  # Input types for log mutations
  input CreateSystemLogInput {
    message: String!
    level: LogLevel!
    source: String!
    details: String
    stackTrace: String
    ipAddress: String
  }
  
  input CreateAuditLogInput {
    action: AuditAction!
    entityType: String!
    entityId: String!
    previousState: String
    newState: String
    ipAddress: String
    metadata: String
  }
  
  # Delete result type
  type DeletionResult {
    success: Boolean!
    message: String
    count: Int
  }
  
  type Mutation {
    # Breed Mutations
    createBreed(input: CreateBreedInput!): Breed!
    
    updateBreed(id: ID!, input: UpdateBreedInput!): Breed!
    
    deleteBreed(id: ID!): DeletionResult!
    
    # Competition Mutations
    createCompetitionResult(input: CreateCompetitionInput!): CompetitionResult!
    
    updateCompetitionResult(id: ID!, input: UpdateCompetitionInput!): CompetitionResult!
    
    deleteCompetitionResult(id: ID!): DeleteResponse!
    
    # Breeding Program Mutations
    createBreedingProgram(input: CreateBreedingProgramInput!): BreedingProgram!
    
    updateBreedingProgram(id: ID!, input: UpdateBreedingProgramInput!): BreedingProgram!
    
    deleteBreedingProgram(id: ID!): DeleteResponse!
    
    addBreedingPair(input: CreateBreedingPairInput!): BreedingPair!
    
    updateBreedingPairStatus(id: ID!, status: BreedingPairStatus!, notes: String): BreedingPair!
    
    linkLitterToBreedingPair(breedingPairId: ID!, breedingRecordId: ID!): BreedingPair!
    
    # Dog Mutations
    # Creates a dog with 'pending' approval status by default
    createDog(input: CreateDogInput!): Dog!

    updateDog(id: ID!, input: UpdateDogInput!): Dog!

    addDogImage(dogId: ID!, input: DogImageInput!): DogImage!

    deleteDog(id: ID!): DeletionResult!
    
    approveDog(id: ID!, notes: String): Dog!
    
    declineDog(id: ID!, notes: String): Dog!

    # Health Record Mutations
    createHealthRecord(input: CreateHealthRecordInput!): HealthRecord!
    
    updateHealthRecord(id: ID!, input: UpdateHealthRecordInput!): HealthRecord!
    
    deleteHealthRecord(id: ID!): DeletionResult!
    
    # Temporarily modified to accept a URL instead of file upload
    uploadHealthRecordAttachment(healthRecordId: ID!, fileUrl: String!): HealthRecord!
    
    # Litter Mutations
    createLitter(input: LitterInput!): Litter!
    
    updateLitter(id: ID!, input: UpdateLitterInput!): Litter!
    
    registerLitterPuppies(input: RegisterLitterPuppiesInput!): RegisterLitterPuppiesResponse!
    
    # System & Audit Log Mutations
    createSystemLog(message: String!, level: LogLevel!, source: String!, details: String, stackTrace: String, ipAddress: String): SystemLog!
    
    createAuditLog(action: AuditAction!, entityType: String!, entityId: String!, previousState: String, newState: String, ipAddress: String, metadata: String): AuditLog!
    
    clearSystemLogs(olderThan: DateTime, level: LogLevel): DeletionResult!
    
    clearAuditLogs(olderThan: DateTime, entityType: String): DeletionResult!
    
    # Ownership Mutations
    createOwnership(input: CreateOwnershipInput!): Ownership!
    
    transferOwnership(input: TransferOwnershipInput!): OwnershipTransferResult!
    
    updateOwnership(id: ID!, input: UpdateOwnershipInput!): Ownership!
    
    deleteOwnership(id: ID!): DeletionResult!
    
    # Pedigree Mutations
    createBreedingRecord(input: BreedingRecordInput!): BreedingRecord!
    
    updateBreedingRecord(id: ID!, input: UpdateBreedingRecordInput!): BreedingRecord!
    
    createPedigree(input: CreatePedigreeInput!): PedigreeCreationResult!
    
    linkDogToParents(dogId: ID!, sireId: ID, damId: ID): Dog!
    
    # Event Mutations
    createEvent(input: CreateEventInput!): Event!
    
    # User Mutations
    login(email: String!, password: String!): AuthPayload!
    
    register(input: RegisterInput!): AuthPayload!
    
    updateUser(id: ID!, input: UpdateUserInput!): User!
    
    changePassword(currentPassword: String!, newPassword: String!): GenericResult!
    
    updateUserRole(userId: ID!, role: UserRole!): User!
    
    deactivateUser(userId: ID!): User!

    updateEvent(id: ID!, input: UpdateEventInput!): Event!

    createClubEvent(input: CreateClubEventInput!): ClubEvent!

    registerDogForEvent(eventId: ID!, dogId: ID!): EventRegistration!

    publishEvent(id: ID!): Event!

    # Genetic calculator mutations
    createGeneticTrait(name: String!, description: String, inheritancePattern: InheritancePattern!, healthImplications: String): GeneticTrait!
    updateGeneticTrait(id: ID!, name: String, description: String, inheritancePattern: InheritancePattern, healthImplications: String): GeneticTrait!
    deleteGeneticTrait(id: ID!): Boolean!
    
    createAllele(traitId: ID!, symbol: String!, name: String!, description: String, dominant: Boolean!): Allele!
    updateAllele(id: ID!, symbol: String, name: String, description: String, dominant: Boolean): Allele!
    deleteAllele(id: ID!): Boolean!
    
    recordDogGenotype(dogId: ID!, traitId: ID!, genotype: String!, testMethod: GeneticTestMethod, testDate: DateTime, confidence: Float, notes: String): DogGenotype!
    updateDogGenotype(id: ID!, genotype: String, testMethod: GeneticTestMethod, testDate: DateTime, confidence: Float, notes: String): DogGenotype!
    deleteDogGenotype(id: ID!): Boolean!
    
    createBreedTraitPrevalence(breedId: ID!, traitId: ID!, frequency: Float!, studyReference: String, notes: String): BreedTraitPrevalence!
    updateBreedTraitPrevalence(id: ID!, frequency: Float, studyReference: String, notes: String): BreedTraitPrevalence!
    deleteBreedTraitPrevalence(id: ID!): Boolean!
    
    saveGeneticAnalysis(sireId: ID!, damId: ID!, breedingPairId: ID, recommendations: String): GeneticAnalysis!
  }
`;

export default typeDefs;
