import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  TRANSFER_OWNERSHIP = 'TRANSFER_OWNERSHIP',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT'
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

interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'createdAt' | 'updatedAt' | 'timestamp'> {}

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: number;
  public timestamp!: Date;
  public action!: AuditAction;
  public entityType!: string;
  public entityId!: string;
  public userId!: number;
  public previousState?: string;
  public newState?: string;
  public ipAddress?: string;
  public metadata?: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association method to be called in models/index.ts
  static associate(models: any) {
    AuditLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

export function initAuditLogModel(sequelize: Sequelize): typeof AuditLog {
  AuditLog.init({
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
    action: {
      type: DataTypes.ENUM(...Object.values(AuditAction)),
      allowNull: false,
      field: 'action'
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'entity_type'
    },
    entityId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'entity_id'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      field: 'user_id',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    previousState: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'previous_state'
    },
    newState: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'new_state'
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ip_address'
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'metadata'
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
    tableName: 'AuditLogs',
    sequelize,
  });

  return AuditLog;
}

export default AuditLog;
