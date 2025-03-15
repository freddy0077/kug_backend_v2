import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export enum HealthRecordType {
  VACCINATION = 'VACCINATION',
  EXAMINATION = 'EXAMINATION',
  TREATMENT = 'TREATMENT',
  SURGERY = 'SURGERY',
  TEST = 'TEST',
  OTHER = 'OTHER'
}

interface HealthRecordAttributes {
  id: string; // Changed from number to string for UUID
  dogId: string; // Changed from number to string for UUID
  date: Date;
  veterinarian: string | null;
  vetName: string | null; // Added alias for veterinarian as per memory
  description: string;  // Note: field is description (not diagnosis) as per requirements
  results: string | null;  // Note: field is results (not test_results) as per requirements
  type: HealthRecordType;
  attachmentUrl: string | null;
  documentUrl: string | null; // Added alias for attachmentUrl as per memory
  createdAt: Date;
  updatedAt: Date;
}

interface HealthRecordCreationAttributes extends Optional<HealthRecordAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class HealthRecord extends Model<HealthRecordAttributes, HealthRecordCreationAttributes> implements HealthRecordAttributes {
  public id!: string; // Changed from number to string for UUID
  public dogId!: string; // Changed from number to string for UUID
  public date!: Date;
  public veterinarian!: string | null;
  public vetName!: string | null; // Added alias for veterinarian as per memory
  public description!: string;  // Using description field name as per requirements
  public results!: string | null;  // Using results field name as per requirements
  public type!: HealthRecordType;
  public attachmentUrl!: string | null;
  public documentUrl!: string | null; // Added alias for attachmentUrl as per memory
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associate(models: any) {
    HealthRecord.belongsTo(models.Dog, { as: 'dog', foreignKey: 'dogId' });
  }
}

export const initHealthRecordModel = (sequelize: Sequelize): typeof HealthRecord => {
  HealthRecord.init({
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
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'date'
    },
    veterinarian: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'veterinarian_name' // Updated field name to match memory
    },
    vetName: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('veterinarian');
      },
      set(value: string | null) {
        this.setDataValue('veterinarian', value);
      }
    },
    description: {  // Using description (not diagnosis) field name
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'description'
    },
    results: {  // Using results (not test_results) field name
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'results'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(HealthRecordType)),
      allowNull: false,
      field: 'type'
    },
    attachmentUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'document_url' // Updated field name to match memory
    },
    documentUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('attachmentUrl');
      },
      set(value: string | null) {
        this.setDataValue('attachmentUrl', value);
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
    tableName: 'HealthRecords',
    modelName: 'HealthRecord',
    underscored: true,
  });

  return HealthRecord;
};

export default HealthRecord;
