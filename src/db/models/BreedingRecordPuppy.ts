import { Model, DataTypes, Sequelize } from 'sequelize';

interface BreedingRecordPuppyAttributes {
  breedingRecordId: number;
  puppyId: number;
  createdAt: Date;
  updatedAt: Date;
}

class BreedingRecordPuppy extends Model<BreedingRecordPuppyAttributes> implements BreedingRecordPuppyAttributes {
  public breedingRecordId!: number;
  public puppyId!: number;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // No need for explicit associations as this is a junction table
}

export const initBreedingRecordPuppyModel = (sequelize: Sequelize): typeof BreedingRecordPuppy => {
  BreedingRecordPuppy.init({
    breedingRecordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'BreedingRecords',
        key: 'id',
      },
      onDelete: 'CASCADE',
      field: 'breeding_record_id'
    },
    puppyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Dogs',
        key: 'id',
      },
      onDelete: 'CASCADE',
      field: 'puppy_id'
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
    tableName: 'BreedingRecordPuppies',
    modelName: 'BreedingRecordPuppy',
  });

  return BreedingRecordPuppy;
};

export default BreedingRecordPuppy;
