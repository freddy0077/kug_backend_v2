'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GeneticAnalyses', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      breedingPairId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'BreedingPairs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      sireId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Dogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      damId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Dogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      overallCompatibility: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          min: 0,
          max: 1
        },
        comment: 'Overall genetic compatibility score from 0.0 to 1.0'
      },
      recommendations: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Recommendations based on analysis'
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
    await queryInterface.addIndex('GeneticAnalyses', ['breedingPairId']);
    await queryInterface.addIndex('GeneticAnalyses', ['sireId']);
    await queryInterface.addIndex('GeneticAnalyses', ['damId']);
    await queryInterface.addIndex('GeneticAnalyses', ['sireId', 'damId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GeneticAnalyses');
  }
};
