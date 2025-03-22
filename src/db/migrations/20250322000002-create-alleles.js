'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Alleles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      symbol: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      dominant: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.addIndex('Alleles', ['traitId']);
    await queryInterface.addIndex('Alleles', ['symbol']);
    await queryInterface.addIndex('Alleles', ['traitId', 'symbol'], {
      unique: true,
      name: 'alleles_trait_symbol_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Alleles');
  }
};
