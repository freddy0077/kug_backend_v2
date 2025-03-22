'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BreedTraitPrevalences', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      breedId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Breeds',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      traitId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'GeneticTraits',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      frequency: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0,
          max: 1
        },
        comment: 'Frequency of this trait in the breed (0.0 to 1.0)'
      },
      studyReference: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Reference to scientific study or publication'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    // Add indexes
    await queryInterface.addIndex('BreedTraitPrevalences', ['breedId']);
    await queryInterface.addIndex('BreedTraitPrevalences', ['traitId']);
    await queryInterface.addIndex('BreedTraitPrevalences', ['breedId', 'traitId'], {
      unique: true,
      name: 'breed_trait_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BreedTraitPrevalences');
  }
};
