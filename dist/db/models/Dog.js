"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDogModel = void 0;
const sequelize_1 = require("sequelize");
class Dog extends sequelize_1.Model {
    // Associations
    static associate(models) {
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
const initDogModel = (sequelize) => {
    Dog.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            field: 'name'
        },
        breed: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            field: 'breed'
        },
        breed_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Breeds',
                key: 'id',
            },
            field: 'breed_id'
        },
        breedId: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('breed_id');
            },
            set(value) {
                // Properly handle null values for Sequelize
                // Do not use undefined to avoid TypeScript errors
                this.setDataValue('breed_id', value);
            }
        },
        gender: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['male', 'female']],
            },
            field: 'gender'
        },
        dateOfBirth: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'date_of_birth'
        },
        dateOfDeath: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'date_of_death'
        },
        color: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'color'
        },
        registrationNumber: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'registration_number'
        },
        microchipNumber: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            unique: true,
            field: 'microchip_number'
        },
        titles: {
            type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.STRING),
            allowNull: true,
            field: 'titles'
        },
        isNeutered: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: true,
            field: 'is_neutered'
        },
        height: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: true,
            field: 'height'
        },
        weight: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: true,
            field: 'weight'
        },
        biography: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'biography'
        },
        mainImageUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'main_image_url'
        },
        sireId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Dogs',
                key: 'id',
            },
            field: 'sire_id'
        },
        damId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Dogs',
                key: 'id',
            },
            field: 'dam_id'
        },
        litterId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Litters',
                key: 'id',
            },
            field: 'litter_id'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'created_at'
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'updated_at'
        },
        approvalStatus: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: 'PENDING',
            validate: {
                isIn: [['PENDING', 'APPROVED', 'DECLINED']],
            },
            field: 'approval_status'
        },
        approvedBy: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id',
            },
            field: 'approved_by'
        },
        approvalDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
            field: 'approval_date'
        },
        approvalNotes: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'approval_notes'
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
            beforeCreate: async (dog) => {
                try {
                    if (dog.breed && !dog.breed_id) {
                        // Try to find a matching breed if breed_id is not set but breed name is
                        const breed = await sequelize.models.Breed.findOne({
                            where: { name: dog.breed }
                        });
                        if (breed) {
                            // Now that Breed uses UUID, we can safely get the ID as a string
                            const breedId = breed.get('id');
                            dog.breed_id = breedId;
                            dog.breedId = breedId;
                        }
                    }
                    else if (dog.breed_id && !dog.breed) {
                        // Try to set breed name if breed_id is set but breed name is not
                        // Check that breed_id is not null before passing to findByPk
                        if (dog.breed_id !== null) {
                            const breed = await sequelize.models.Breed.findByPk(dog.breed_id);
                            if (breed) {
                                dog.breed = breed.get('name');
                            }
                        }
                    }
                }
                catch (error) {
                    console.error('Error in beforeCreate hook for Dog model:', error);
                }
            },
            beforeUpdate: async (dog) => {
                try {
                    if (dog.changed('breed') && !dog.changed('breed_id')) {
                        // If breed name changed but breed_id didn't, update breed_id
                        const breed = await sequelize.models.Breed.findOne({
                            where: { name: dog.breed }
                        });
                        if (breed) {
                            // Now that Breed uses UUID, we can safely get the ID as a string
                            const breedId = breed.get('id');
                            dog.breed_id = breedId;
                            dog.breedId = breedId;
                        }
                    }
                    else if (dog.changed('breed_id') && !dog.changed('breed')) {
                        // If breed_id changed but breed name didn't, update breed name
                        // Check that breed_id is not null before passing to findByPk
                        if (dog.breed_id !== null) {
                            const breed = await sequelize.models.Breed.findByPk(dog.breed_id);
                            if (breed) {
                                dog.breed = breed.get('name');
                            }
                        }
                    }
                }
                catch (error) {
                    console.error('Error in beforeUpdate hook for Dog model:', error);
                }
            }
        }
    });
    return Dog;
};
exports.initDogModel = initDogModel;
exports.default = Dog;
//# sourceMappingURL=Dog.js.map