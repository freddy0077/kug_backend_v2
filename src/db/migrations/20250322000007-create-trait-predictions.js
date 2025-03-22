'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TraitPredictions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      analysisId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'GeneticAnalyses',
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
      possibleGenotypes: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: 'JSON array of possible genotype outcomes with probabilities'
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
    await queryInterface.addIndex('TraitPredictions', ['analysisId']);
    await queryInterface.addIndex('TraitPredictions', ['traitId']);
    await queryInterface.addIndex('TraitPredictions', ['analysisId', 'traitId'], {
      unique: true,
      name: 'analysis_trait_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TraitPredictions');
  }
};
