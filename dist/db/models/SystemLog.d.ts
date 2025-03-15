import { Model, Sequelize, Optional } from 'sequelize';
export declare enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR",
    CRITICAL = "CRITICAL"
}
interface SystemLogAttributes {
    id: number;
    timestamp: Date;
    level: LogLevel;
    message: string;
    source: string;
    details?: string;
    stackTrace?: string;
    ipAddress?: string;
    userId?: number;
    createdAt: Date;
    updatedAt: Date;
}
interface SystemLogCreationAttributes extends Optional<SystemLogAttributes, 'id' | 'createdAt' | 'updatedAt' | 'timestamp'> {
}
declare class SystemLog extends Model<SystemLogAttributes, SystemLogCreationAttributes> implements SystemLogAttributes {
    id: number;
    timestamp: Date;
    level: LogLevel;
    message: string;
    source: string;
    details?: string;
    stackTrace?: string;
    ipAddress?: string;
    userId?: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
}
export declare function initSystemLogModel(sequelize: Sequelize): typeof SystemLog;
export default SystemLog;
