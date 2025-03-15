declare enum DogSortField {
    NAME = "NAME",
    BREED = "BREED",
    DATE_OF_BIRTH = "DATE_OF_BIRTH",
    REGISTRATION_NUMBER = "REGISTRATION_NUMBER"
}
declare enum SortDirection {
    Asc = "ASC",
    Desc = "DESC"
}
interface CreateDogInput {
    name: string;
    breed: string;
    gender: string;
    color: string;
    dateOfBirth: Date;
    dateOfDeath?: Date;
    height?: number;
    weight?: number;
    registrationNumber?: string;
    microchipNumber?: string;
    isNeutered?: boolean;
    ownerId?: number;
    sireId?: number;
    damId?: number;
    titles?: string[];
    biography?: string;
    mainImageUrl?: string;
}
interface UpdateDogInput extends Partial<CreateDogInput> {
    id: number;
}
interface DogImageInput {
    dogId: number;
    imageUrl: string;
    url?: string;
    caption?: string;
    isPrimary?: boolean;
}
declare const dogResolvers: {
    Query: {
        dogs: (_: any, { offset, limit, searchTerm, breed, gender, ownerId, sortBy, sortDirection }: {
            offset?: number;
            limit?: number;
            searchTerm?: string;
            breed?: string;
            gender?: string;
            ownerId?: number;
            sortBy?: DogSortField;
            sortDirection?: SortDirection;
        }) => Promise<{
            totalCount: number;
            hasMore: boolean;
            items: import("../../db/models/Dog").default[];
        }>;
        dog: (_: any, { id }: {
            id: number;
        }) => Promise<import("../../db/models/Dog").default>;
        dogPedigree: (_: any, { dogId, generations }: {
            dogId: number | string;
            generations?: number;
        }) => Promise<any>;
    };
    Mutation: {
        createDog: (_: any, { input }: {
            input: CreateDogInput;
        }, context: any) => Promise<import("../../db/models/Dog").default>;
        updateDog: (_: any, { id, input }: {
            id: string;
            input: UpdateDogInput;
        }) => Promise<import("../../db/models/Dog").default | null>;
        addDogImage: (_: any, { dogId, input }: {
            dogId: string;
            input: DogImageInput;
        }, context: any) => Promise<import("../../db/models/DogImage").default>;
        deleteDog: (_: any, { id }: {
            id: number;
        }, context: any) => Promise<{
            success: boolean;
            message: any;
        }>;
    };
    Dog: {
        sire: (parent: any) => Promise<import("../../db/models/Dog").default | null>;
        dam: (parent: any) => Promise<import("../../db/models/Dog").default | null>;
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
