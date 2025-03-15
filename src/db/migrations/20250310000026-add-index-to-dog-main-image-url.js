'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Check if index exists before adding it
      const indexes = await queryInterface.sequelize.query(
        `SELECT indexname FROM pg_indexes WHERE tablename = 'Dogs' AND indexname = 'dogs_main_image_url_idx'`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (indexes.length === 0) {
        // Add index for main_image_url for better performance on searches and joins
        await queryInterface.addIndex('Dogs', ['main_image_url'], {
          name: 'dogs_main_image_url_idx'
        });
        console.log('Index dogs_main_image_url_idx created');
      } else {
        console.log('Index dogs_main_image_url_idx already exists, skipping creation');
      }
    } catch (error) {
      console.error('Error checking or creating index:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove index when rolling back
    try {
      await queryInterface.removeIndex('Dogs', 'dogs_main_image_url_idx');
    } catch (error) {
      console.error('Error removing index:', error);
    }
  }
};
