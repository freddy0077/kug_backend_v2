import { Model, DataTypes, Sequelize } from 'sequelize';

export interface BreedingProgramFoundationDogAttributes {
  id?: number;
  breedingProgramId: number;
  dogId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BreedingProgramFoundationDogCreationAttributes extends BreedingProgramFoundationDogAttributes {}

class BreedingProgramFoundationDog extends Model<BreedingProgramFoundationDogAttributes, BreedingProgramFoundationDogCreationAttributes> implements BreedingProgramFoundationDogAttributes {
  public id!: number;
  public breedingProgramId!: number;
  public dogId!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // No associations needed for junction table

  // Initialize method
  static initialize(sequelize: Sequelize): void {
    BreedingProgramFoundationDog.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        breedingProgramId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'BreedingPrograms',
            key: 'id',
          },
          onDelete: 'CASCADE',
          field: 'breeding_program_id'
        },
        dogId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Dogs',
            key: 'id',
          },
          onDelete: 'CASCADE',
          field: 'dog_id'
        },
      },
      {
        sequelize,
        modelName: 'BreedingProgramFoundationDog',
        tableName: 'BreedingProgramFoundationDogs',
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ['breedingProgramId', 'dogId'],
          },
        ],
      }
    );
  }
}

export default BreedingProgramFoundationDog;
