import { BreedingPairStatus } from '../../db/models/BreedingPair';
type BreedingPairStatusUpdateInput = {
    id: string;
    status: BreedingPairStatus;
    notes?: string;
};
/**
 * Breeding Pair Mutations
 */
export declare const breedingPairMutations: {
    /**
     * Add a new breeding pair to a program
     */
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
    /**
     * Update the status of a breeding pair
     */
    updateBreedingPairStatus: (_: any, { input }: {
        input: BreedingPairStatusUpdateInput;
    }, context: any) => Promise<any>;
    /**
     * Link a breeding record (litter) to a breeding pair
     */
    linkLitterToBreedingPair: (_: any, { breedingPairId, breedingRecordId }: {
        breedingPairId: string;
        breedingRecordId: string;
    }, context: any) => Promise<any>;
};
export {};
