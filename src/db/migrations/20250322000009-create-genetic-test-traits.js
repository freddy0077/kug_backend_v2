'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GeneticTestTraits', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      testId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'GeneticTests',
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
    await queryInterface.addIndex('GeneticTestTraits', ['testId']);
    await queryInterface.addIndex('GeneticTestTraits', ['traitId']);
    await queryInterface.addIndex('GeneticTestTraits', ['testId', 'traitId'], {
      unique: true,
      name: 'test_trait_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GeneticTestTraits');
  }
};
