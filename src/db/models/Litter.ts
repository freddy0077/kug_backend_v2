import { Model, DataTypes, Optional, Association, Sequelize } from 'sequelize';
import Dog from './Dog';

// Litter attributes interface
export interface LitterAttributes {
  id: string;
  litterName: string;
  registrationNumber?: string;
  breedingRecordId?: string;
  sireId: string;
  damId: string;
  whelpingDate: Date;
  totalPuppies: number;
  malePuppies?: number;
  femalePuppies?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Litter creation attributes
export interface LitterCreationAttributes extends Optional<LitterAttributes, 'id' | 'registrationNumber' | 'malePuppies' | 'femalePuppies' | 'notes' | 'createdAt' | 'updatedAt'> {}

// Litter model class
export class Litter extends Model<LitterAttributes, LitterCreationAttributes> implements LitterAttributes {
  public id!: string;
  public litterName!: string;
  public registrationNumber!: string | undefined;
  public breedingRecordId!: string | undefined;
  public sireId!: string;
  public damId!: string;
  public whelpingDate!: Date;
  public totalPuppies!: number;
  public malePuppies!: number | undefined;
  public femalePuppies!: number | undefined;
  public notes!: string | undefined;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public static associations: {
    sire: Association<Litter, Dog>;
    dam: Association<Litter, Dog>;
    puppies: Association<Litter, Dog>;
  };

  // Define associations
  public static associate(models: any) {
    Litter.belongsTo(models.Dog, { 
      foreignKey: 'sireId', 
      as: 'sire' 
    });
    
    Litter.belongsTo(models.Dog, { 
      foreignKey: 'damId', 
      as: 'dam' 
    });
    
    Litter.hasMany(models.Dog, { 
      foreignKey: 'litterId', 
      as: 'puppies' 
    });
    
    Litter.belongsTo(models.BreedingRecord, {
      foreignKey: 'breedingRecordId',
      as: 'breedingRecord'
    });
  }
}

// Initialize Litter model with sequelize instance passed as parameter
export const initLitterModel = (sequelize: Sequelize): typeof Litter => {
  Litter.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
  },
  litterName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'litter_name'
  },
  registrationNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'registration_number'
  },
  breedingRecordId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'breeding_record_id',
    references: {
      model: 'BreedingRecords',
      key: 'id'
    }
  },
  sireId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'sire_id',
    references: {
      model: 'Dogs',
      key: 'id'
    }
  },
  damId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'dam_id',
    references: {
      model: 'Dogs',
      key: 'id'
    }
  },
  whelpingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'whelping_date'
  },
  totalPuppies: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_puppies'
  },
  malePuppies: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'male_puppies'
  },
  femalePuppies: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'female_puppies'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  }
}, {
  sequelize,
  modelName: 'Litter',
  tableName: 'Litters',
  underscored: true,
  timestamps: true
});

  return Litter;
};

export default Litter;
