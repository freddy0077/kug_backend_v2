import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface CompetitionResultAttributes {
  id: string; // Changed from number to string for UUID
  dogId: string; // Changed from number to string for UUID
  eventName: string;
  eventDate: Date;
  category: string | null;
  rank: number | null;
  place: number | null; // Added alias for rank as per memory
  titleEarned: string | null;  // Note: field is title_earned in database (not certificate) as per requirements
  points: number | null;
  score: number | null; // Added alias for points as per memory
  createdAt: Date;
  updatedAt: Date;
}

interface CompetitionResultCreationAttributes extends Optional<CompetitionResultAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class CompetitionResult extends Model<CompetitionResultAttributes, CompetitionResultCreationAttributes> implements CompetitionResultAttributes {
  public id!: string; // Changed from number to string for UUID
  public dogId!: string; // Changed from number to string for UUID
  public eventName!: string;
  public eventDate!: Date;
  public category!: string | null;
  public rank!: number | null;
  public place!: number | null; // Added alias for rank as per memory
  public titleEarned!: string | null;  // Maps to title_earned in database as per requirements
  public points!: number | null;
  public score!: number | null; // Added alias for points as per memory
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    CompetitionResult.belongsTo(models.Dog, { as: 'dog', foreignKey: 'dogId' });
  }
}

export const initCompetitionResultModel = (sequelize: Sequelize): typeof CompetitionResult => {
  CompetitionResult.init({
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
    eventName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'event_name'
    },
    eventDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'event_date'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'category'
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'rank'
    },
    place: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('rank');
      },
      set(value: number | null) {
        this.setDataValue('rank', value);
      }
    },
    titleEarned: {  // Maps to title_earned in database (not certificate) as per requirements
      type: DataTypes.STRING,
      allowNull: true,
      field: 'title_earned'
    },
    points: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'points'
    },
    score: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('points');
      },
      set(value: number | null) {
        this.setDataValue('points', value);
      }
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
    tableName: 'CompetitionResults',
    modelName: 'CompetitionResult',
    underscored: true,
  });

  return CompetitionResult;
};

export default CompetitionResult;
