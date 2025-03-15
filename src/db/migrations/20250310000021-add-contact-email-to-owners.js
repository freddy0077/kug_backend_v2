'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add contact_email column to Owners table
    await queryInterface.addColumn('Owners', 'contact_email', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Populate contact_email with email values for existing records
    await queryInterface.sequelize.query(`
      UPDATE "Owners" 
      SET contact_email = email
      WHERE contact_email IS NULL
    `);

    // Add index for contact_email
    await queryInterface.addIndex('Owners', ['contact_email'], {
      name: 'owners_contact_email_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index and column when rolling back
    await queryInterface.removeIndex('Owners', 'owners_contact_email_idx');
    await queryInterface.removeColumn('Owners', 'contact_email');
  }
};
