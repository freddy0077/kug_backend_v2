export declare const clubEventResolvers: {
    Query: {
        clubEvents: (_: any, { clubId, offset, limit, includeNonMemberEvents }: {
            clubId: number;
            offset?: number;
            limit?: number;
            includeNonMemberEvents?: boolean;
        }) => Promise<{
            totalCount: number;
            hasMore: boolean;
            items: import("../../db/models/ClubEvent").default[];
        }>;
        clubs: () => Promise<import("../../db/models/Club").default[]>;
        club: (_: any, { id }: {
            id: number;
        }) => Promise<import("../../db/models/Club").default>;
    };
    Mutation: {
        createClubEvent: (_: any, { input }: {
            input: any;
        }) => Promise<import("../../db/models/ClubEvent").default | null>;
    };
    ClubEvent: {
        club: (parent: any) => Promise<import("../../db/models/Club").default | null>;
        event: (parent: any) => Promise<import("../../db/models/Event").default | null>;
    };
    Club: {
        events: (parent: any) => Promise<import("../../db/models/ClubEvent").default[]>;
    };
};
