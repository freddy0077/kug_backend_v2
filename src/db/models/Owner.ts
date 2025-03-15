import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface OwnerAttributes {
  id: string; // Changed from number to string for UUID
  userId: string | null; // Changed from number to string for UUID
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface OwnerCreationAttributes extends Optional<OwnerAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Owner extends Model<OwnerAttributes, OwnerCreationAttributes> implements OwnerAttributes {
  public id!: string; // Changed from number to string for UUID
  public userId!: string | null; // Changed from number to string for UUID
  public name!: string;
  public contactEmail!: string | null;
  public contactPhone!: string | null;
  public address!: string | null;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    Owner.hasMany(models.Ownership, { as: 'ownerships', foreignKey: 'ownerId' });
  }
}

export const initOwnerModel = (sequelize: Sequelize): typeof Owner => {
  Owner.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'user_id'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name'
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
      field: 'contact_email'
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'contact_phone'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'address'
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
    tableName: 'Owners',
    modelName: 'Owner',
    underscored: false,
  });

  return Owner;
};

export default Owner;
