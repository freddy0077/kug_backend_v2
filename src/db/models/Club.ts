import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface ClubAttributes {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ClubCreationAttributes extends Optional<ClubAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Club extends Model<ClubAttributes, ClubCreationAttributes> implements ClubAttributes {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public logo!: string | null;
  public website!: string | null;
  public contactEmail!: string | null;
  public contactPhone!: string | null;
  public address!: string | null;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    Club.hasMany(models.ClubEvent, {
      as: 'events',
      foreignKey: 'clubId'
    });
  }
}

export const initClubModel = (sequelize: Sequelize): typeof Club => {
  Club.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description'
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'logo'
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'website'
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
    tableName: 'Clubs',
    modelName: 'Club',
  });

  return Club;
};

export default Club;
