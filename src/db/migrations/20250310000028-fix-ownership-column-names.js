'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if the column exists first
      const columns = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'Ownerships' AND column_name = 'is_current'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (columns.length === 0) {
        // Add is_current column to Ownerships
        await queryInterface.addColumn('Ownerships', 'is_current', {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        });
        
        // Update is_current values to match is_active values
        await queryInterface.sequelize.query(
          `UPDATE "Ownerships" SET "is_current" = "is_active"`
        );
        
        console.log('Added is_current column to Ownerships table');
      } else {
        console.log('Column is_current already exists in Ownerships table');
      }
    } catch (error) {
      console.error('Error updating Ownerships table:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Check if the column exists before removing
      const columns = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'Ownerships' AND column_name = 'is_current'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (columns.length > 0) {
        // Remove is_current column
        await queryInterface.removeColumn('Ownerships', 'is_current');
        console.log('Removed is_current column from Ownerships table');
      }
    } catch (error) {
      console.error('Error removing is_current column:', error);
    }
  }
};
