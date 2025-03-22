import { BreedingProgramStatus } from '../../db/models/BreedingProgram';
import { BreedingPairStatus } from '../../db/models/BreedingPair';
/**
 * Resolvers for the BreedingProgram and BreedingPair types
 */
export declare const breedingResolvers: {
    Query: {
        breedingPrograms: (_: any, { offset, limit, searchTerm, breederId, breed, status, includePrivate }: {
            offset?: number;
            limit?: number;
            searchTerm?: string;
            breederId?: string;
            breed?: string;
            status?: BreedingProgramStatus;
            includePrivate?: boolean;
        }) => Promise<{
            totalCount: number;
            programs: import("../../db/models/BreedingProgram").default[];
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
                programId: string;
                sireId: string;
                damId: string;
                plannedBreedingDate?: Date | string | null;
                compatibilityNotes?: string | null;
                status?: BreedingPairStatus;
                geneticCompatibilityScore?: number | string;
            };
        }, context: any) => Promise<any>;
        updateBreedingPairStatus: (_: any, { input }: {
            input: {
                id: string;
                status: BreedingPairStatus;
                notes?: string;
            };
        }, context: any) => Promise<any>;
        linkLitterToBreedingPair: (_: any, { breedingPairId, breedingRecordId }: {
            breedingPairId: string;
            breedingRecordId: string;
        }, context: any) => Promise<any>;
        createBreedingProgram: (_: any, { input }: {
            input: {
                name: string;
                description: string;
                breederId: string;
                breed: string;
                goals: string[];
                startDate: Date;
                endDate?: Date;
                geneticTestingProtocol?: string;
                selectionCriteria?: string;
                notes?: string;
                isPublic: boolean;
                imageUrl?: string;
                foundationDogIds: string[];
            };
        }, context: any) => Promise<import("../../db/models/BreedingProgram").default>;
        updateBreedingProgram: (_: any, { id, input }: {
            id: string;
            input: {
                name?: string;
                description?: string;
                breed?: string;
                goals?: string[];
                startDate?: Date;
                endDate?: Date;
                status?: BreedingProgramStatus;
                geneticTestingProtocol?: string;
                selectionCriteria?: string;
                notes?: string;
                isPublic?: boolean;
                imageUrl?: string;
                foundationDogIds?: string[];
            };
        }, context: any) => Promise<import("../../db/models/BreedingProgram").default | null>;
        deleteBreedingProgram: (_: any, { id }: {
            id: string;
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
