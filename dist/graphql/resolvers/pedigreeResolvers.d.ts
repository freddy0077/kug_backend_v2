interface PedigreeNode {
    id: number;
    name: string;
    registrationNumber: string;
    breed: string;
    gender: string;
    dateOfBirth: Date;
    color: string | null;
    titles: string[] | null;
    mainImageUrl: string | null;
    coefficient: number | null;
    sire: PedigreeNode | null;
    dam: PedigreeNode | null;
}
interface LinebreedingResult {
    dog: any;
    inbreedingCoefficient: number;
    commonAncestors: {
        dog: PedigreeNode;
        occurrences: number;
        pathways: string[];
        contribution: number;
    }[];
    geneticDiversity: number;
    recommendations: string[];
}
declare const pedigreeResolvers: {
    Query: {
        dogPedigree: (_: any, { dogId, generations }: {
            dogId: string;
            generations: number;
        }, context: any) => Promise<PedigreeNode | null>;
        breedingRecords: (_: any, { dogId, role, offset, limit }: {
            dogId: string;
            role?: "SIRE" | "DAM" | "BOTH";
            offset?: number;
            limit?: number;
        }, context: any) => Promise<{
            totalCount: number;
            hasMore: boolean;
            items: import("../../db/models/BreedingRecord").default[];
        }>;
        linebreedingAnalysis: (_: any, { sireId, damId, generations }: {
            sireId: string;
            damId: string;
            generations?: number;
        }, context: any) => Promise<LinebreedingResult>;
    };
    Mutation: {
        createBreedingRecord: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<import("../../db/models/BreedingRecord").default | null>;
        updateBreedingRecord: (_: any, { id, input }: {
            id: string;
            input: any;
        }, context: any) => Promise<import("../../db/models/BreedingRecord").default | null>;
        linkDogToParents: (_: any, { dogId, sireId, damId }: {
            dogId: string;
            sireId?: string;
            damId?: string;
        }, context: any) => Promise<import("../../db/models/Dog").default | null>;
    };
};
export default pedigreeResolvers;
