/**
 * Resolvers for the BreedingProgram and BreedingPair types
 */
export declare const breedingResolvers: {
    Query: {
        breedingPrograms: (_: any, { offset, limit, searchTerm, breederId, breed, status, includePrivate }: {
            offset?: number;
            limit?: number;
            searchTerm?: string;
            breederId?: number;
            breed?: string;
            status?: import("../../db/models/BreedingProgram").BreedingProgramStatus;
            includePrivate?: boolean;
        }, context: any) => Promise<{
            totalCount: number;
            hasMore: boolean;
            items: import("../../db/models/BreedingProgram").default[];
        }>;
        breedingProgram: (_: any, { id }: {
            id: number;
        }, context: any) => Promise<import("../../db/models/BreedingProgram").default>;
        breedingPair: (_: any, { id }: {
            id: number;
        }, context: any) => Promise<import("../../db/models/BreedingPair").default>;
    };
    Mutation: {
        addBreedingPair: (_: any, { input }: {
            input: {
                programId: number;
                sireId: number;
                damId: number;
                plannedBreedingDate?: Date;
                compatibilityNotes?: string;
                status: import("../../db/models/BreedingPair").BreedingPairStatus;
            };
        }, context: any) => Promise<import("../../db/models/BreedingPair").default | null>;
        updateBreedingPairStatus: (_: any, { id, status, notes }: {
            id: number;
            status: import("../../db/models/BreedingPair").BreedingPairStatus;
            notes?: string;
        }, context: any) => Promise<import("../../db/models/BreedingPair").default | null>;
        linkLitterToBreedingPair: (_: any, { breedingPairId, breedingRecordId }: {
            breedingPairId: number;
            breedingRecordId: number;
        }, context: any) => Promise<import("../../db/models/BreedingPair").default | null>;
        createBreedingProgram: (_: any, { input }: {
            input: {
                name: string;
                description: string;
                breederId: number;
                breed: string;
                goals: string[];
                startDate: Date;
                endDate?: Date;
                geneticTestingProtocol?: string;
                selectionCriteria?: string;
                notes?: string;
                isPublic: boolean;
                imageUrl?: string;
                foundationDogIds: number[];
            };
        }, context: any) => Promise<import("../../db/models/BreedingProgram").default>;
        updateBreedingProgram: (_: any, { id, input }: {
            id: number;
            input: {
                name?: string;
                description?: string;
                breed?: string;
                goals?: string[];
                startDate?: Date;
                endDate?: Date;
                status?: import("../../db/models/BreedingProgram").BreedingProgramStatus;
                geneticTestingProtocol?: string;
                selectionCriteria?: string;
                notes?: string;
                isPublic?: boolean;
                imageUrl?: string;
                foundationDogIds?: number[];
            };
        }, context: any) => Promise<import("../../db/models/BreedingProgram").default | null>;
        deleteBreedingProgram: (_: any, { id }: {
            id: number;
        }, context: any) => Promise<{
            success: boolean;
            message: string;
        }>;
    };
    BreedingProgram: {
        breeder: (parent: any) => Promise<import("../../db/models/Owner").default | null>;
        foundationDogs: (parent: any) => Promise<any>;
        breedingPairs: (parent: any) => Promise<import("../../db/models/BreedingPair").default[]>;
        resultingLitters: (parent: any) => Promise<import("../../db/models/BreedingRecord").default[]>;
    };
    BreedingPair: {
        program: (parent: any) => Promise<import("../../db/models/BreedingProgram").default | null>;
        sire: (parent: any) => Promise<import("../../db/models/Dog").default | null>;
        dam: (parent: any) => Promise<import("../../db/models/Dog").default | null>;
        breedingRecords: (parent: any) => Promise<import("../../db/models/BreedingRecord").default[]>;
    };
};
