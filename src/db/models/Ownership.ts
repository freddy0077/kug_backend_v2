import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface OwnershipAttributes {
  id: string; // Changed from number to string for UUID
  ownerId: string; // Changed from number to string for UUID
  dogId: string; // Changed from number to string for UUID
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;  // Note: field name is is_current in database (not is_active) as per requirements
  transferDocumentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface OwnershipCreationAttributes extends Optional<OwnershipAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Ownership extends Model<OwnershipAttributes, OwnershipCreationAttributes> implements OwnershipAttributes {
  public id!: string; // Changed from number to string for UUID
  public ownerId!: string; // Changed from number to string for UUID
  public dogId!: string; // Changed from number to string for UUID
  public startDate!: Date;
  public endDate!: Date | null;
  public isCurrent!: boolean;  // Maps to is_current in database as per the specification
  public transferDocumentUrl!: string | null;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    Ownership.belongsTo(models.Owner, { as: 'owner', foreignKey: 'ownerId' });
    Ownership.belongsTo(models.Dog, { as: 'dog', foreignKey: 'dogId' });
  }
}

export const initOwnershipModel = (sequelize: Sequelize): typeof Ownership => {
  Ownership.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Owners',
        key: 'id',
      },
      field: 'owner_id'
    },
    dogId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Dogs',
        key: 'id',
      },
      field: 'dog_id'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'end_date'
    },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'is_current'
    },
    transferDocumentUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'transfer_document_url'
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
    sequelize,
    tableName: 'Ownerships',
    modelName: 'Ownership',
    underscored: true,
  });

  return Ownership;
};

export default Ownership;
