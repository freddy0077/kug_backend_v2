import { Model, Sequelize, Optional } from 'sequelize';
export declare enum AuditAction {
    CREATE = "CREATE",
    READ = "READ",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    EXPORT = "EXPORT",
    IMPORT = "IMPORT",
    TRANSFER_OWNERSHIP = "TRANSFER_OWNERSHIP",
    APPROVE = "APPROVE",
    REJECT = "REJECT"
}
interface AuditLogAttributes {
    id: number;
    timestamp: Date;
    action: AuditAction;
    entityType: string;
    entityId: string;
    userId: number;
    previousState?: string;
    newState?: string;
    ipAddress?: string;
    metadata?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'createdAt' | 'updatedAt' | 'timestamp'> {
}
declare class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
    id: number;
    timestamp: Date;
    action: AuditAction;
    entityType: string;
    entityId: string;
    userId: number;
    previousState?: string;
    newState?: string;
    ipAddress?: string;
    metadata?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
}
export declare function initAuditLogModel(sequelize: Sequelize): typeof AuditLog;
export default AuditLog;
