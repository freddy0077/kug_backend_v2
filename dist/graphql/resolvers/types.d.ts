export declare enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}
/**
 * Context for GraphQL resolvers
 */
export interface Context {
    user?: {
        id: string;
        role: string;
        email: string;
    };
    req: any;
    res: any;
}
