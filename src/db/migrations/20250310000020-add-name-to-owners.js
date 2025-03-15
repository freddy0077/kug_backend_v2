'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add name column to Owners table
    await queryInterface.addColumn('Owners', 'name', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Update existing records to populate the name field using PostgreSQL concatenation
    await queryInterface.sequelize.query(`
      UPDATE "Owners" 
      SET name = first_name || ' ' || last_name
      WHERE name IS NULL
    `);

    // Add index for the name column
    await queryInterface.addIndex('Owners', ['name'], {
      name: 'owners_full_name_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index and column when rolling back
    await queryInterface.removeIndex('Owners', 'owners_full_name_idx');
    await queryInterface.removeColumn('Owners', 'name');
  }
};
