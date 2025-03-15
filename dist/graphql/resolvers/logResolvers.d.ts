import { LogLevel } from '../../db/models/SystemLog';
import { AuditAction } from '../../db/models/AuditLog';
export declare const logResolvers: {
    Query: {
        systemLogs: (_: any, { page, limit, level }: {
            page: number;
            limit: number;
            level?: LogLevel;
        }, context: any) => Promise<{
            totalCount: number;
            hasMore: boolean;
            items: import("../../db/models/SystemLog").default[];
        }>;
        systemLog: (_: any, { id }: {
            id: number;
        }, context: any) => Promise<import("../../db/models/SystemLog").default | null>;
        auditLogs: (_: any, { page, limit, entityType, action }: {
            page: number;
            limit: number;
            entityType?: string;
            action?: AuditAction;
        }, context: any) => Promise<{
            totalCount: number;
            hasMore: boolean;
            items: import("../../db/models/AuditLog").default[];
        }>;
        auditLog: (_: any, { id }: {
            id: number;
        }, context: any) => Promise<import("../../db/models/AuditLog").default | null>;
    };
    Mutation: {
        createSystemLog: (_: any, { message, level, source, details, stackTrace, ipAddress }: {
            message: string;
            level: LogLevel;
            source: string;
            details?: string;
            stackTrace?: string;
            ipAddress?: string;
        }, context: any) => Promise<import("../../db/models/SystemLog").default>;
        createAuditLog: (_: any, { action, entityType, entityId, previousState, newState, ipAddress, metadata }: {
            action: AuditAction;
            entityType: string;
            entityId: string;
            previousState?: string;
            newState?: string;
            ipAddress?: string;
            metadata?: string;
        }, context: any) => Promise<import("../../db/models/AuditLog").default>;
        clearSystemLogs: (_: any, { olderThan, level }: {
            olderThan?: Date;
            level?: LogLevel;
        }, context: any) => Promise<{
            success: boolean;
            message: string;
        }>;
        clearAuditLogs: (_: any, { olderThan, entityType }: {
            olderThan?: Date;
            entityType?: string;
        }, context: any) => Promise<{
            success: boolean;
            message: string;
        }>;
    };
    SystemLog: {
        user: (parent: any) => Promise<import("../../db/models/User").default | null>;
    };
    AuditLog: {
        user: (parent: any) => Promise<import("../../db/models/User").default | null>;
    };
};
export default logResolvers;
