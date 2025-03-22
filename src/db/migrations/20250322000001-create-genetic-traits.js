'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GeneticTraits', {
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
      description: {
        type: Sequelize.TEXT
      },
      inheritancePattern: {
        type: Sequelize.ENUM(
          'AUTOSOMAL_DOMINANT',
          'AUTOSOMAL_RECESSIVE',
          'X_LINKED_DOMINANT',
          'X_LINKED_RECESSIVE',
          'POLYGENIC',
          'CODOMINANT',
          'INCOMPLETE_DOMINANCE',
          'EPISTASIS',
          'MATERNAL'
        ),
        allowNull: false
      },
      healthImplications: {
        type: Sequelize.TEXT
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
    await queryInterface.addIndex('GeneticTraits', ['name']);
    await queryInterface.addIndex('GeneticTraits', ['inheritancePattern']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GeneticTraits');
  }
};
