import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
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

interface SystemLogCreationAttributes extends Optional<SystemLogAttributes, 'id' | 'createdAt' | 'updatedAt' | 'timestamp'> {}

class SystemLog extends Model<SystemLogAttributes, SystemLogCreationAttributes> implements SystemLogAttributes {
  public id!: number;
  public timestamp!: Date;
  public level!: LogLevel;
  public message!: string;
  public source!: string;
  public details?: string;
  public stackTrace?: string;
  public ipAddress?: string;
  public userId?: number;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association method to be called in models/index.ts
  static associate(models: any) {
    SystemLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

export function initSystemLogModel(sequelize: Sequelize): typeof SystemLog {
  SystemLog.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'timestamp'
    },
    level: {
      type: DataTypes.ENUM(...Object.values(LogLevel)),
      allowNull: false,
      field: 'level'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'message'
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'source'
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'details'
    },
    stackTrace: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'stack_trace'
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ip_address'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      field: 'user_id'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    },
  }, {
    tableName: 'SystemLogs',
    sequelize,
  });

  return SystemLog;
}

export default SystemLog;
