interface DecodedToken {
    id: number;
    email: string;
    role: string;
    username?: string;
    iat?: number;
    exp?: number;
}
/**
 * Verifies JWT token from authorization header and returns the decoded user
 * @param context GraphQL context containing the HTTP request
 * @returns The decoded user information from the token
 * @throws AuthenticationError if token is missing or invalid
 */
export declare const checkAuth: (context: any) => DecodedToken;
export declare const requireAdminRole: (user: any) => boolean;
/**
 * Express middleware to verify JWT token from authorization header
 */
export declare const authMiddleware: (req: any, res: any, next: any) => void;
/**
 * GraphQL context function to attach user to context
 */
export declare const createContext: ({ req }: {
    req: any;
}) => {
    req: any;
    user: any;
};
export {};
