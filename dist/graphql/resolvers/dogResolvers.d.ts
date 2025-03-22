import { Breed } from '../../db/models/Breed';
import type { DogAttributes } from '../../db/models/Dog';
declare enum DogSortField {
    NAME = "NAME",
    BREED = "BREED",
    DATE_OF_BIRTH = "DATE_OF_BIRTH",
    REGISTRATION_NUMBER = "REGISTRATION_NUMBER",
    CREATED_AT = "CREATED_AT"
}
declare enum SortDirection {
    Asc = "ASC",
    Desc = "DESC"
}
interface CreateDogInput {
    name: string;
    breed: string;
    breedId?: string;
    gender: string;
    color: string;
    dateOfBirth: Date;
    dateOfDeath?: Date;
    height?: number;
    weight?: number;
    microchipNumber?: string;
    isNeutered?: boolean;
    ownerId?: string;
    sireId?: string;
    damId?: string;
    titles?: string[];
    biography?: string;
    mainImageUrl?: string;
}
interface UpdateDogInput extends Partial<CreateDogInput> {
    id: string;
}
interface DogImageInput {
    dogId: string;
    imageUrl: string;
    url?: string;
    caption?: string;
    isPrimary?: boolean;
}
declare const dogResolvers: {
    Query: {
        dogs: (_: any, { offset, limit, searchTerm, breed, breedId, gender, ownerId, approvalStatus, sortBy, sortDirection }: {
            offset?: number;
            limit?: number;
            searchTerm?: string;
            breed?: string;
            breedId?: string;
            gender?: string;
            ownerId?: string;
            approvalStatus?: string;
            sortBy?: DogSortField;
            sortDirection?: SortDirection;
        }, context: any) => Promise<{
            totalCount: number;
            hasMore: boolean;
            items: DogAttributes[];
        }>;
        dog: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<DogAttributes>;
        dogPedigree: (_: any, { dogId, generations }: {
            dogId: string;
            generations?: number;
        }, context: any) => Promise<any>;
    };
    Mutation: {
        createDog: (_: any, { input }: {
            input: CreateDogInput;
        }, context: any) => Promise<import("../../db/models/Dog").default>;
        updateDog: (_: any, { id, input }: {
            id: string;
            input: UpdateDogInput;
        }, context: any) => Promise<import("../../db/models/Dog").default>;
        addDogImage: (_: any, { dogId, input }: {
            dogId: string;
            input: DogImageInput;
        }, context: any) => Promise<import("../../db/models/DogImage").default>;
        deleteDog: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<{
            success: boolean;
            message: any;
        }>;
        approveDog: (_: any, { id, notes }: {
            id: string;
            notes?: string;
        }, context: any) => Promise<import("../../db/models/Dog").default>;
        declineDog: (_: any, { id, notes }: {
            id: string;
            notes?: string;
        }, context: any) => Promise<import("../../db/models/Dog").default>;
    };
    Dog: {
        breedObj: (parent: any) => Promise<Breed | null>;
        sire: (parent: any) => Promise<import("../../db/models/Dog").default | null>;
        dam: (parent: any) => Promise<import("../../db/models/Dog").default | null>;
        approvedBy: (parent: any) => Promise<import("../../db/models/User").default | null>;
        offspring: (parent: any) => Promise<import("../../db/models/Dog").default[]>;
        images: (parent: any) => Promise<import("../../db/models/DogImage").default[]>;
        ownerships: (parent: any) => Promise<import("../../db/models/Ownership").default[]>;
        currentOwner: (parent: any) => Promise<any>;
        healthRecords: (parent: any) => Promise<import("../../db/models/HealthRecord").default[]>;
        competitionResults: (parent: any) => Promise<import("../../db/models/CompetitionResult").default[]>;
    };
    Ownership: {
        owner: (parent: any) => Promise<import("../../db/models/Owner").default | null>;
        dog: (parent: any) => Promise<import("../../db/models/Dog").default | null>;
    };
    Owner: {
        dogs: (parent: any) => Promise<import("../../db/models/Dog").default[]>;
    };
    HealthRecord: {
        dog: (parent: any) => Promise<import("../../db/models/Dog").default | null>;
    };
    CompetitionResult: {
        dog: (parent: any) => Promise<import("../../db/models/Dog").default | null>;
    };
};
export { dogResolvers };
