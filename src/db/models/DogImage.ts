import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface DogImageAttributes {
  id: string; // Changed from number to string for UUID
  dogId: string; // Changed from number to string for UUID
  url: string;
  imageUrl: string; // Adding alias to match memory about column naming conventions
  caption: string | null;
  isPrimary: boolean;
  isProfileImage: boolean; // Adding alias to match memory about column naming conventions
  createdAt: Date;
}

interface DogImageCreationAttributes extends Optional<DogImageAttributes, 'id' | 'createdAt'> {}

class DogImage extends Model<DogImageAttributes, DogImageCreationAttributes> implements DogImageAttributes {
  public id!: string; // Changed from number to string for UUID
  public dogId!: string; // Changed from number to string for UUID
  public url!: string;
  public imageUrl!: string; // Added alias to match memory about column naming conventions
  public caption!: string | null;
  public isPrimary!: boolean;
  public isProfileImage!: boolean; // Added alias to match memory about column naming conventions
  
  // Timestamp
  public readonly createdAt!: Date;

  // Associations
  public static associate(models: any) {
    DogImage.belongsTo(models.Dog, { as: 'dog', foreignKey: 'dogId' });
  }
}

export const initDogImageModel = (sequelize: Sequelize): typeof DogImage => {
  DogImage.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'url'
    },
    imageUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('url');
      },
      set(value: string) {
        this.setDataValue('url', value);
      }
    },
    caption: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'caption'
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_primary'
    },
    isProfileImage: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('isPrimary');
      },
      set(value: boolean) {
        this.setDataValue('isPrimary', value);
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
  }, {
    sequelize,
    tableName: 'DogImages',
    modelName: 'DogImage',
    timestamps: true,
    updatedAt: false, // No updatedAt field as per the GraphQL schema
    underscored: true,
  });

  return DogImage;
};

export default DogImage;
