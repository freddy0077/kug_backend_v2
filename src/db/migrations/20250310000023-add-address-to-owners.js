'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add address column to Owners table
    await queryInterface.addColumn('Owners', 'address', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Populate address with concatenated address components for existing records
    await queryInterface.sequelize.query(`
      UPDATE "Owners" 
      SET address = CASE
        WHEN address_line2 IS NOT NULL AND address_line2 != '' THEN
          address_line1 || ', ' || address_line2 || ', ' || 
          COALESCE(city, '') || 
          CASE WHEN city IS NOT NULL AND city != '' AND state IS NOT NULL AND state != '' THEN ', ' ELSE '' END || 
          COALESCE(state, '') || 
          CASE WHEN (city IS NOT NULL AND city != '' OR state IS NOT NULL AND state != '') AND country IS NOT NULL AND country != '' THEN ', ' ELSE '' END || 
          COALESCE(country, '') ||
          CASE WHEN postal_code IS NOT NULL AND postal_code != '' THEN ' ' || postal_code ELSE '' END
        ELSE
          address_line1 || ', ' || 
          COALESCE(city, '') || 
          CASE WHEN city IS NOT NULL AND city != '' AND state IS NOT NULL AND state != '' THEN ', ' ELSE '' END || 
          COALESCE(state, '') || 
          CASE WHEN (city IS NOT NULL AND city != '' OR state IS NOT NULL AND state != '') AND country IS NOT NULL AND country != '' THEN ', ' ELSE '' END || 
          COALESCE(country, '') ||
          CASE WHEN postal_code IS NOT NULL AND postal_code != '' THEN ' ' || postal_code ELSE '' END
      END
      WHERE address IS NULL AND address_line1 IS NOT NULL
    `);

    // Add index for address search
    await queryInterface.addIndex('Owners', ['address'], {
      name: 'owners_address_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index and column when rolling back
    await queryInterface.removeIndex('Owners', 'owners_address_idx');
    await queryInterface.removeColumn('Owners', 'address');
  }
};
