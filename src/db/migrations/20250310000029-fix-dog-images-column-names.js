'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // 1. Check if url column exists in DogImages
      const urlColumns = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'DogImages' AND column_name = 'url'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (urlColumns.length === 0) {
        // Add url column to DogImages
        await queryInterface.addColumn('DogImages', 'url', {
          type: Sequelize.STRING(255)
        });
        
        // Update url values to match image_url values
        await queryInterface.sequelize.query(
          `UPDATE "DogImages" SET "url" = "image_url"`
        );
        console.log('Added url column to DogImages table');
      } else {
        console.log('Column url already exists in DogImages table');
      }
      
      // 2. Check if is_primary column exists in DogImages
      const primaryColumns = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'DogImages' AND column_name = 'is_primary'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (primaryColumns.length === 0) {
        // Add is_primary column to DogImages
        await queryInterface.addColumn('DogImages', 'is_primary', {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        });
        
        // Update is_primary values to match is_profile_image values
        await queryInterface.sequelize.query(
          `UPDATE "DogImages" SET "is_primary" = "is_profile_image"`
        );
        console.log('Added is_primary column to DogImages table');
      } else {
        console.log('Column is_primary already exists in DogImages table');
      }
    } catch (error) {
      console.error('Error updating DogImages table:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Check if the columns exist before removing
      const urlColumns = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'DogImages' AND column_name = 'url'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (urlColumns.length > 0) {
        // Remove url column
        await queryInterface.removeColumn('DogImages', 'url');
        console.log('Removed url column from DogImages table');
      }
      
      const primaryColumns = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name = 'DogImages' AND column_name = 'is_primary'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (primaryColumns.length > 0) {
        // Remove is_primary column
        await queryInterface.removeColumn('DogImages', 'is_primary');
        console.log('Removed is_primary column from DogImages table');
      }
    } catch (error) {
      console.error('Error removing columns from DogImages:', error);
    }
  }
};
