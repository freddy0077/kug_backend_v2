'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Dogs', 'litter_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Litters',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add index
    await queryInterface.addIndex('Dogs', ['litter_id'], {
      name: 'dogs_litter_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Dogs', 'dogs_litter_idx');
    await queryInterface.removeColumn('Dogs', 'litter_id');
  }
};
