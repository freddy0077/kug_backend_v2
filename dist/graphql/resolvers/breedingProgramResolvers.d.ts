import { BreedingProgramStatus } from '../../db/models/BreedingProgram';
/**
 * Handles all Breeding Program related GraphQL queries and mutations
 */
export declare const breedingProgramResolvers: {
    Query: {
        /**
         * Get a paginated list of breeding programs with optional filtering
         */
        breedingPrograms: (_: any, { offset, limit, searchTerm, breederId, breed, status, includePrivate }: {
            offset?: number;
            limit?: number;
            searchTerm?: string;
            breederId?: number;
            breed?: string;
            status?: BreedingProgramStatus;
            includePrivate?: boolean;
        }, context: any) => Promise<{
            totalCount: number;
            hasMore: boolean;
            items: import("../../db/models/BreedingProgram").default[];
        }>;
        /**
         * Get detailed information about a specific breeding program
         */
        breedingProgram: (_: any, { id }: {
            id: number;
        }, context: any) => Promise<import("../../db/models/BreedingProgram").default>;
        /**
         * Get detailed information about a specific breeding pair
         */
        breedingPair: (_: any, { id }: {
            id: number;
        }, context: any) => Promise<import("../../db/models/BreedingPair").default>;
    };
};
