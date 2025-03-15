import { Model, DataTypes, Sequelize } from 'sequelize';

export enum BreedingPairStatus {
  PLANNED = 'PLANNED',
  APPROVED = 'APPROVED',
  PENDING_TESTING = 'PENDING_TESTING',
  BREEDING_SCHEDULED = 'BREEDING_SCHEDULED',
  BRED = 'BRED',
  UNSUCCESSFUL = 'UNSUCCESSFUL',
  CANCELLED = 'CANCELLED'
}

export interface BreedingPairAttributes {
  id?: number;
  programId: number;
  sireId: number;
  damId: number;
  plannedBreedingDate?: Date;
  compatibilityNotes?: string;
  geneticCompatibilityScore?: string;
  status: BreedingPairStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BreedingPairCreationAttributes extends BreedingPairAttributes {}

class BreedingPair extends Model<BreedingPairAttributes, BreedingPairCreationAttributes> implements BreedingPairAttributes {
  public id!: number;
  public programId!: number;
  public sireId!: number;
  public damId!: number;
  public plannedBreedingDate?: Date;
  public compatibilityNotes?: string;
  public geneticCompatibilityScore?: string;
  public status!: BreedingPairStatus;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  static associate(models: any) {
    BreedingPair.belongsTo(models.BreedingProgram, { foreignKey: 'programId', as: 'program' });
    BreedingPair.belongsTo(models.Dog, { foreignKey: 'sireId', as: 'sire' });
    BreedingPair.belongsTo(models.Dog, { foreignKey: 'damId', as: 'dam' });
    BreedingPair.hasMany(models.BreedingRecord, { 
      foreignKey: 'breedingPairId', 
      as: 'breedingRecords' 
    });
  }

  // Initialize method
  static initialize(sequelize: Sequelize): void {
    BreedingPair.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        programId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'BreedingPrograms',
            key: 'id',
          },
          field: 'program_id'
        },
        sireId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Dogs',
            key: 'id',
          },
          field: 'sire_id'
        },
        damId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Dogs',
            key: 'id',
          },
          field: 'dam_id'
        },
        plannedBreedingDate: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'planned_breeding_date'
        },
        compatibilityNotes: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'compatibility_notes'
        },
        geneticCompatibilityScore: {
          type: DataTypes.FLOAT,
          allowNull: true,
          field: 'genetic_compatibility_score'
        },
        status: {
          type: DataTypes.ENUM(...Object.values(BreedingPairStatus)),
          allowNull: false,
          defaultValue: BreedingPairStatus.PLANNED,
          field: 'status'
        },
      },
      {
        sequelize,
        modelName: 'BreedingPair',
        tableName: 'BreedingPairs',
        timestamps: true,
        underscored: true,
      }
    );
  }
}

export default BreedingPair;
