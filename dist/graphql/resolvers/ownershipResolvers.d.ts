export declare const ownershipResolvers: {
    Query: {
        dogOwnerships: (_: any, { dogId }: {
            dogId: number;
        }, context: any) => Promise<{
            dog: import("../../db/models/Dog").default;
            ownerships: import("../../db/models/Ownership").default[];
        }>;
        ownerDogs: (_: any, { ownerId, includeFormer, offset, limit }: {
            ownerId: number;
            includeFormer?: boolean;
            offset?: number;
            limit?: number;
        }, context: any) => Promise<{
            totalCount: number;
            hasMore: boolean;
            items: import("../../db/models/Ownership").default[];
        }>;
        ownership: (_: any, { id }: {
            id: number;
        }, context: any) => Promise<import("../../db/models/Ownership").default>;
    };
    Mutation: {
        createOwnership: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<import("../../db/models/Ownership").default | null>;
        transferOwnership: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            previousOwnership: import("../../db/models/Ownership").default | null;
            newOwnership: import("../../db/models/Ownership").default | null;
            dog: import("../../db/models/Dog").default;
        }>;
        updateOwnership: (_: any, { id, input }: {
            id: number;
            input: any;
        }, context: any) => Promise<import("../../db/models/Ownership").default | null>;
        deleteOwnership: (_: any, { id }: {
            id: number;
        }, context: any) => Promise<{
            success: boolean;
            message: string;
        }>;
    };
    Ownership: {
        dog: (parent: any) => Promise<any>;
        owner: (parent: any) => Promise<any>;
    };
    Owner: {
        ownerships: (parent: any) => Promise<import("../../db/models/Ownership").default[]>;
        currentDogs: (parent: any) => Promise<any[]>;
        user: (parent: any) => Promise<{
            id: any;
            email: string;
        } | null>;
    };
};
