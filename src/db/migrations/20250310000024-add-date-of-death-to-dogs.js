'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add date_of_death column to Dogs table
    await queryInterface.addColumn('Dogs', 'date_of_death', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add index for date_of_death
    await queryInterface.addIndex('Dogs', ['date_of_death'], {
      name: 'dogs_date_of_death_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index and column when rolling back
    await queryInterface.removeIndex('Dogs', 'dogs_date_of_death_idx');
    await queryInterface.removeColumn('Dogs', 'date_of_death');
  }
};
