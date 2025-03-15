export declare const userResolvers: {
    Query: {
        me: (_: any, __: any, { user }: any) => Promise<import("../../db/models/User").default | null>;
        users: (_: any, { offset, limit, searchTerm, role, isActive }: any, context: any) => Promise<{
            totalCount: any;
            hasMore: boolean;
            items: any;
        }>;
        user: (_: any, { id }: any, context: any) => Promise<import("../../db/models/User").default>;
    };
    Mutation: {
        login: (_: any, { email, password }: any, context: any) => Promise<{
            token: string;
            user: any;
            expiresAt: Date;
        }>;
        register: (_: any, { input }: any, context: any) => Promise<{
            token: string;
            user: any;
            expiresAt: Date;
        }>;
        updateUser: (_: any, { id, input }: any, context: any) => Promise<import("../../db/models/User").default | null>;
        changePassword: (_: any, { currentPassword, newPassword }: any, context: any) => Promise<{
            success: boolean;
            message: string;
        }>;
        updateUserRole: (_: any, { userId, role }: any, context: any) => Promise<import("../../db/models/User").default>;
        deactivateUser: (_: any, { userId }: any, context: any) => Promise<import("../../db/models/User").default>;
    };
    User: {
        fullName: (parent: any) => string;
    };
};
export default userResolvers;
