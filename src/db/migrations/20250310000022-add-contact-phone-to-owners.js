'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add contact_phone column to Owners table
    await queryInterface.addColumn('Owners', 'contact_phone', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Populate contact_phone with phone_number values for existing records
    await queryInterface.sequelize.query(`
      UPDATE "Owners" 
      SET contact_phone = phone_number
      WHERE contact_phone IS NULL
    `);

    // Add index for contact_phone
    await queryInterface.addIndex('Owners', ['contact_phone'], {
      name: 'owners_contact_phone_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index and column when rolling back
    await queryInterface.removeIndex('Owners', 'owners_contact_phone_idx');
    await queryInterface.removeColumn('Owners', 'contact_phone');
  }
};
