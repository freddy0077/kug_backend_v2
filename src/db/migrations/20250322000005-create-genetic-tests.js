'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GeneticTests', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      accuracy: {
        type: Sequelize.FLOAT,
        validate: {
          min: 0,
          max: 1
        },
        comment: 'Accuracy rate from 0.0 to 1.0'
      },
      cost: {
        type: Sequelize.FLOAT,
        comment: 'Test cost'
      },
      turnaroundTime: {
        type: Sequelize.INTEGER,
        comment: 'Typical turnaround time in days'
      },
      sampleType: {
        type: Sequelize.STRING,
        comment: 'Type of sample required (blood, saliva, etc.)'
      },
      url: {
        type: Sequelize.STRING,
        comment: 'URL to the test provider website'
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
    await queryInterface.addIndex('GeneticTests', ['name']);
    await queryInterface.addIndex('GeneticTests', ['provider']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GeneticTests');
  }
};
