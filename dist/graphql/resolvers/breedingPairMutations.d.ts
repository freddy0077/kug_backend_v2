import { BreedingPairStatus } from '../../db/models/BreedingPair';
/**
 * Breeding Pair Mutations
 */
export declare const breedingPairMutations: {
    /**
     * Add a new breeding pair to a program
     */
    addBreedingPair: (_: any, { input }: {
        input: {
            programId: number;
            sireId: number;
            damId: number;
            plannedBreedingDate?: Date;
            compatibilityNotes?: string;
            status: BreedingPairStatus;
        };
    }, context: any) => Promise<import("../../db/models/BreedingPair").default | null>;
    /**
     * Update the status of a breeding pair
     */
    updateBreedingPairStatus: (_: any, { id, status, notes }: {
        id: number;
        status: BreedingPairStatus;
        notes?: string;
    }, context: any) => Promise<import("../../db/models/BreedingPair").default | null>;
    /**
     * Link a breeding record (litter) to a breeding pair
     */
    linkLitterToBreedingPair: (_: any, { breedingPairId, breedingRecordId }: {
        breedingPairId: number;
        breedingRecordId: number;
    }, context: any) => Promise<import("../../db/models/BreedingPair").default | null>;
};
