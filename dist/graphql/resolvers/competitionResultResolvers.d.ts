export declare enum CompetitionCategory {
    CONFORMATION = "CONFORMATION",
    OBEDIENCE = "OBEDIENCE",
    AGILITY = "AGILITY",
    FIELD_TRIALS = "FIELD_TRIALS",
    HERDING = "HERDING",
    TRACKING = "TRACKING",
    RALLY = "RALLY",
    SCENT_WORK = "SCENT_WORK"
}
export declare enum CompetitionSortField {
    EVENT_DATE = "EVENT_DATE",
    RANK = "RANK",
    POINTS = "POINTS",
    EVENT_NAME = "EVENT_NAME"
}
export declare enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}
export declare const competitionResultResolvers: {
    Query: {
        competitions: (_: any, { offset, limit, searchTerm, category, dogId, startDate, endDate, sortBy, sortDirection }: {
            offset?: number;
            limit?: number;
            searchTerm?: string;
            category?: string;
            dogId?: number;
            startDate?: Date;
            endDate?: Date;
            sortBy?: CompetitionSortField;
            sortDirection?: SortDirection;
        }, context: any) => Promise<{
            totalCount: number;
            hasMore: boolean;
            items: any[];
        }>;
        competition: (_: any, { id }: {
            id: number;
        }, context: any) => Promise<import("../../db/models/CompetitionResult").CompetitionResultAttributes>;
        dogCompetitionStats: (_: any, { dogId }: {
            dogId: number;
        }, context: any) => Promise<{
            totalCompetitions: number;
            totalWins: number;
            categoryCounts: {
                category: any;
                count: number;
            }[];
            pointsByCategory: {
                category: any;
                points: number;
            }[];
            recentResults: import("../../db/models/CompetitionResult").default[];
        }>;
        relatedCompetitions: (_: any, { competitionId, dogId, category, limit }: {
            competitionId: number;
            dogId?: number;
            category?: string;
            limit?: number;
        }, context: any) => Promise<any[]>;
    };
    Mutation: {
        createCompetitionResult: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<import("../../db/models/CompetitionResult").default | null>;
        updateCompetitionResult: (_: any, { id, input }: {
            id: number;
            input: any;
        }, context: any) => Promise<import("../../db/models/CompetitionResult").default | null>;
        deleteCompetitionResult: (_: any, { id }: {
            id: number;
        }, context: any) => Promise<{
            success: boolean;
            message: string;
        }>;
    };
    CompetitionResult: {
        dog: (parent: any) => Promise<any>;
    };
};
