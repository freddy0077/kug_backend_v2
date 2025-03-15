'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Owners', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add an index for performance
    await queryInterface.addIndex('Owners', ['user_id'], {
      name: 'owners_user_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Owners', 'owners_user_id_idx');
    await queryInterface.removeColumn('Owners', 'user_id');
  }
};
