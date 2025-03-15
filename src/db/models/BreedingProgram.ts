import { Model, DataTypes, Sequelize } from 'sequelize';

export enum BreedingProgramStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface BreedingProgramAttributes {
  id?: number;
  name: string;
  description: string;
  breederId: number;
  breed: string;
  goals: string[]; // Stored as JSON
  startDate: Date;
  endDate?: Date;
  status: BreedingProgramStatus;
  geneticTestingProtocol?: string;
  selectionCriteria?: string;
  notes?: string;
  isPublic: boolean;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BreedingProgramCreationAttributes extends BreedingProgramAttributes {}

class BreedingProgram extends Model<BreedingProgramAttributes, BreedingProgramCreationAttributes> implements BreedingProgramAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public breederId!: number;
  public breed!: string;
  public goals!: string[];
  public startDate!: Date;
  public endDate?: Date;
  public status!: BreedingProgramStatus;
  public geneticTestingProtocol?: string;
  public selectionCriteria?: string;
  public notes?: string;
  public isPublic!: boolean;
  public imageUrl?: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  // These will be defined in the index.ts file
  static associate(models: any) {
    BreedingProgram.belongsTo(models.Owner, { foreignKey: 'breederId', as: 'breeder' });
    BreedingProgram.belongsToMany(models.Dog, { 
      through: 'BreedingProgramFoundationDogs',
      foreignKey: 'breedingProgramId',
      as: 'foundationDogs'
    });
    BreedingProgram.hasMany(models.BreedingPair, { 
      foreignKey: 'programId', 
      as: 'breedingPairs' 
    });
  }

  // Initialize method
  static initialize(sequelize: Sequelize): void {
    BreedingProgram.init(
      {
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
          allowNull: false,
          field: 'description'
        },
        breederId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Owners',
            key: 'id',
          },
          field: 'breeder_id'
        },
        breed: {
          type: DataTypes.STRING,
          allowNull: false,
          field: 'breed'
        },
        goals: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
          field: 'goals'
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
        status: {
          type: DataTypes.ENUM(...Object.values(BreedingProgramStatus)),
          allowNull: false,
          defaultValue: BreedingProgramStatus.PLANNING,
          field: 'status'
        },
        geneticTestingProtocol: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'genetic_testing_protocol'
        },
        selectionCriteria: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'selection_criteria'
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'notes'
        },
        isPublic: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'is_public'
        },
        imageUrl: {
          type: DataTypes.STRING,
          allowNull: true,
          field: 'image_url'
        },
      },
      {
        sequelize,
        modelName: 'BreedingProgram',
        tableName: 'BreedingPrograms',
        timestamps: true,
        underscored: true,
      }
    );
  }
}

export default BreedingProgram;
