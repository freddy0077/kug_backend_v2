import { Model, DataTypes, Sequelize, Association } from 'sequelize';
import Dog from './Dog';

export interface BreedAttributes {
  id: string; // Changed from number to string for UUID
  name: string;
  group?: string;
  origin?: string;
  description?: string;
  temperament?: string;
  average_lifespan?: string;
  average_height?: string;
  average_weight?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class Breed extends Model<BreedAttributes> implements BreedAttributes {
  public id!: string; // Changed from number to string for UUID
  public name!: string;
  public group?: string;
  public origin?: string;
  public description?: string;
  public temperament?: string;
  public average_lifespan?: string;
  public average_height?: string;
  public average_weight?: string;
  
  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  
  // Associations
  public readonly dogs?: Dog[];
  
  public static associations: {
    dogs: Association<Breed, Dog>;
  };
  
  public static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: true,
          },
        },
        group: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        origin: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        temperament: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        average_lifespan: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        average_height: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        average_weight: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'Breeds',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );
    
    return this;
  }
  
  public static associate() {
    // Define association with Dog model
    this.hasMany(Dog, {
      foreignKey: 'breed_id',
      as: 'dogs',
    });
  }
}
