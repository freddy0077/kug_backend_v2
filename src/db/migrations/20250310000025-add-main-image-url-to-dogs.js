'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add main_image_url column to Dogs table
    await queryInterface.addColumn('Dogs', 'main_image_url', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Try to populate main_image_url from DogImages if possible
    await queryInterface.sequelize.query(`
      UPDATE "Dogs" d
      SET main_image_url = di.image_url
      FROM "DogImages" di
      WHERE di.dog_id = d.id AND di.is_profile_image = true
      AND d.main_image_url IS NULL
    `);

    // Add index for main_image_url for better performance on searches and joins
    await queryInterface.addIndex('Dogs', ['main_image_url'], {
      name: 'dogs_main_image_url_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index and column when rolling back
    await queryInterface.removeIndex('Dogs', 'dogs_main_image_url_idx');
    await queryInterface.removeColumn('Dogs', 'main_image_url');
  }
};
