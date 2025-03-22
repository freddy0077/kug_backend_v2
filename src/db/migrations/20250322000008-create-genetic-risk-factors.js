'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First create the risk level enum
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'SEVERE');`
    ).catch(error => {
      // If enum already exists, continue
      if (error.message.indexOf('already exists') === -1) {
        throw error;
      }
    });

    await queryInterface.createTable('GeneticRiskFactors', {
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
      riskLevel: {
        type: Sequelize.ENUM('LOW', 'MODERATE', 'HIGH', 'SEVERE'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      recommendations: {
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
    await queryInterface.addIndex('GeneticRiskFactors', ['analysisId']);
    await queryInterface.addIndex('GeneticRiskFactors', ['traitId']);
    await queryInterface.addIndex('GeneticRiskFactors', ['riskLevel']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GeneticRiskFactors');
    // Drop the enum as well
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_RiskLevel";`);
  }
};
