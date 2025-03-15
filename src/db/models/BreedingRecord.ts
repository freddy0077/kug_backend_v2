import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface BreedingRecordAttributes {
  id: number;
  sireId: number;
  damId: number;
  breedingDate: Date;
  litterSize: number | null;
  comments: string | null;
  breedingPairId?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BreedingRecordCreationAttributes extends Optional<BreedingRecordAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class BreedingRecord extends Model<BreedingRecordAttributes, BreedingRecordCreationAttributes> implements BreedingRecordAttributes {
  public id!: number;
  public sireId!: number;
  public damId!: number;
  public breedingDate!: Date;
  public litterSize!: number | null;
  public comments!: string | null;
  public breedingPairId!: number | undefined;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    BreedingRecord.belongsTo(models.Dog, { as: 'sire', foreignKey: 'sireId' });
    BreedingRecord.belongsTo(models.Dog, { as: 'dam', foreignKey: 'damId' });
    BreedingRecord.belongsToMany(models.Dog, { 
      through: 'BreedingRecordPuppies',
      as: 'puppies',
      foreignKey: 'breedingRecordId',
      otherKey: 'puppyId'
    });
  }
}

export const initBreedingRecordModel = (sequelize: Sequelize): typeof BreedingRecord => {
  BreedingRecord.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    breedingDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'breeding_date'
    },
    litterSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'litter_size'
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'comments'
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
    tableName: 'BreedingRecords',
    modelName: 'BreedingRecord',
    underscored: true,
  });

  return BreedingRecord;
};

export default BreedingRecord;
