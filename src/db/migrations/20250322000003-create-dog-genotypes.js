'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DogGenotypes', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      dogId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Dogs',
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
      genotype: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'The genetic code, such as "Aa" or "BB"'
      },
      testMethod: {
        type: Sequelize.ENUM(
          'DNA_TEST',
          'PEDIGREE_ANALYSIS',
          'PHENOTYPE_EXAMINATION',
          'CARRIER_TESTING',
          'LINKAGE_TESTING'
        ),
        allowNull: true
      },
      testDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      confidence: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Confidence level from 0.0 to 1.0'
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
    await queryInterface.addIndex('DogGenotypes', ['dogId']);
    await queryInterface.addIndex('DogGenotypes', ['traitId']);
    await queryInterface.addIndex('DogGenotypes', ['dogId', 'traitId'], {
      unique: true,
      name: 'dog_trait_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DogGenotypes');
  }
};
