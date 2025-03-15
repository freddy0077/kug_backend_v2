import { BreedingProgramStatus } from '../../db/models/BreedingProgram';
/**
 * Breeding Program Mutations
 */
export declare const breedingProgramMutations: {
    /**
     * Create a new breeding program
     */
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
    /**
     * Update an existing breeding program
     */
    updateBreedingProgram: (_: any, { id, input }: {
        id: number;
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
            foundationDogIds?: number[];
        };
    }, context: any) => Promise<import("../../db/models/BreedingProgram").default | null>;
    /**
     * Delete a breeding program
     */
    deleteBreedingProgram: (_: any, { id }: {
        id: number;
    }, context: any) => Promise<{
        success: boolean;
        message: string;
    }>;
};
