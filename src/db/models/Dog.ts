import { Model, DataTypes, Sequelize, Optional, Association } from 'sequelize';
import { Breed } from './Breed';

// These attributes define the Dog entity in the database
interface DogAttributes {
  id: string;  // Changed from number to string for UUID
  name: string;
  breed: string;  // Keep for backward compatibility
  breed_id: string | null; // Changed from number to string for UUID
  breedId: string | null;  // Changed from number to string for UUID
  gender: string;
  dateOfBirth: Date;  // Always required as Date, never undefined
  dateOfDeath: Date | null;
  color: string | null;
  registrationNumber: string;
  microchipNumber: string | null;
  titles: string[] | null;
  isNeutered: boolean | null;
  height: number | null;
  weight: number | null;
  biography: string | null;
  mainImageUrl: string | null;
  sireId: string | null;  // Changed from number to string for UUID
  damId: string | null;   // Changed from number to string for UUID
  litterId: string | null; // Reference to the litter this dog belongs to as a puppy
  createdAt: Date;
  updatedAt: Date;
}

// These attributes are for creating a new Dog (some can be optional during creation)
interface DogCreationAttributes extends Optional<DogAttributes, 'id' | 'createdAt' | 'updatedAt' | 'breed_id' | 'breedId'> {}

class Dog extends Model<DogAttributes, DogCreationAttributes> implements DogAttributes {
  public id!: string;  // Changed from number to string for UUID
  public name!: string;
  public breed!: string;
  public breed_id!: string | null;  // Changed from number to string for UUID
  public breedId!: string | null;   // Changed from number to string for UUID
  public gender!: string;
  public dateOfBirth!: Date;  // Required Date, never undefined
  public dateOfDeath!: Date | null;
  public color!: string | null;
  public registrationNumber!: string;
  public microchipNumber!: string | null;
  public titles!: string[] | null;
  public isNeutered!: boolean | null;
  public height!: number | null;
  public weight!: number | null;
  public biography!: string | null;
  public mainImageUrl!: string | null;
  public sireId!: string | null;  // Changed from number to string for UUID
  public damId!: string | null;   // Changed from number to string for UUID
  public litterId!: string | null; // Reference to the litter this dog belongs to as a puppy
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define the Breed relationship
  public breedObj?: Breed;

  // Define associations
  public static associations: {
    breedObj: Association<Dog, Breed>;
    sire: Association<Dog, Dog>;
    dam: Association<Dog, Dog>;
    litter: Association<Dog, any>; // Will be associated with Litter model
  };

  // Associations
  public static associate(models: any) {
    // Self-references for family relationships
    Dog.belongsTo(models.Dog, { as: 'sire', foreignKey: 'sireId' });
    Dog.belongsTo(models.Dog, { as: 'dam', foreignKey: 'damId' });
    Dog.hasMany(models.Dog, { as: 'offspring', foreignKey: 'sireId' });
    Dog.hasMany(models.Dog, { as: 'maternalOffspring', foreignKey: 'damId' });
    
    // Breed relationship
    Dog.belongsTo(models.Breed, { 
      as: 'breedObj',
      foreignKey: 'breed_id'
    });
    
    // Litter relationship
    Dog.belongsTo(models.Litter, {
      as: 'litter',
      foreignKey: 'litterId'
    });
    
    // Other associations
    Dog.hasMany(models.DogImage, { as: 'images', foreignKey: 'dogId' });
    Dog.hasMany(models.HealthRecord, { as: 'healthRecords', foreignKey: 'dogId' });
    Dog.hasMany(models.CompetitionResult, { as: 'competitionResults', foreignKey: 'dogId' });
    Dog.hasMany(models.Ownership, { as: 'ownerships', foreignKey: 'dogId' });
  }
}

export const initDogModel = (sequelize: Sequelize): typeof Dog => {
  Dog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name'
    },
    breed: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'breed'
    },
    breed_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Breeds',
        key: 'id',
      },
      field: 'breed_id'
    },
    breedId: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('breed_id');
      },
      set(value: string | null) {
        // Properly handle null values for Sequelize
        // Do not use undefined to avoid TypeScript errors
        this.setDataValue('breed_id', value);
      }
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['male', 'female']],
      },
      field: 'gender'
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'date_of_birth'
    },
    dateOfDeath: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'date_of_death'
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'color'
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'registration_number'
    },
    microchipNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      field: 'microchip_number'
    },
    titles: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      field: 'titles'
    },
    isNeutered: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'is_neutered'
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'height'
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'weight'
    },
    biography: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'biography'
    },
    mainImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'main_image_url'
    },
    sireId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Dogs',
        key: 'id',
      },
      field: 'sire_id'
    },
    damId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Dogs',
        key: 'id',
      },
      field: 'dam_id'
    },
    litterId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Litters',
        key: 'id',
      },
      field: 'litter_id'
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
    modelName: 'Dog',
    tableName: 'Dogs',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'dogs_registration_number_idx',
        fields: ['registration_number']
      },
      {
        name: 'dogs_microchip_number_idx',
        fields: ['microchip_number']
      },
      {
        name: 'dogs_breed_idx',
        fields: ['breed']
      },
      {
        name: 'dogs_breed_id_idx',
        fields: ['breed_id']
      }
    ],
    hooks: {
      // Add hooks to sync the breed string with the breed_id
      beforeCreate: async (dog: Dog) => {
        try {
          if (dog.breed && !dog.breed_id) {
            // Try to find a matching breed if breed_id is not set but breed name is
            const breed = await (sequelize.models.Breed as typeof Breed).findOne({
              where: { name: dog.breed }
            }) as Breed | null;
            
            if (breed) {
              // Now that Breed uses UUID, we can safely get the ID as a string
              const breedId = breed.get('id');
              dog.breed_id = breedId;
              dog.breedId = breedId;
            }
          } else if (dog.breed_id && !dog.breed) {
            // Try to set breed name if breed_id is set but breed name is not
            // Check that breed_id is not null before passing to findByPk
            if (dog.breed_id !== null) {
              const breed = await (sequelize.models.Breed as typeof Breed).findByPk(dog.breed_id) as Breed | null;
              
              if (breed) {
                dog.breed = breed.get('name') as string;
              }
            }
          }
        } catch (error) {
          console.error('Error in beforeCreate hook for Dog model:', error);
        }
      },
      beforeUpdate: async (dog: Dog) => {
        try {
          if (dog.changed('breed') && !dog.changed('breed_id')) {
            // If breed name changed but breed_id didn't, update breed_id
            const breed = await (sequelize.models.Breed as typeof Breed).findOne({
              where: { name: dog.breed }
            }) as Breed | null;
            
            if (breed) {
              // Now that Breed uses UUID, we can safely get the ID as a string
              const breedId = breed.get('id');
              dog.breed_id = breedId;
              dog.breedId = breedId;
            }
          } else if (dog.changed('breed_id') && !dog.changed('breed')) {
            // If breed_id changed but breed name didn't, update breed name
            // Check that breed_id is not null before passing to findByPk
            if (dog.breed_id !== null) {
              const breed = await (sequelize.models.Breed as typeof Breed).findByPk(dog.breed_id) as Breed | null;
              
              if (breed) {
                dog.breed = breed.get('name') as string;
              }
            }
          }
        } catch (error) {
          console.error('Error in beforeUpdate hook for Dog model:', error);
        }
      }
    }
  });
  
  return Dog;
}

export default Dog;
