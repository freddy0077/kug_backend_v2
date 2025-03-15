'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add is_current column to Ownerships table
    await queryInterface.sequelize.query(`
      ALTER TABLE "Ownerships" ADD COLUMN IF NOT EXISTS "is_current" BOOLEAN DEFAULT TRUE;
      UPDATE "Ownerships" SET "is_current" = "is_active" WHERE "is_current" IS NULL;
    `);

    // Add url column to DogImages table
    await queryInterface.sequelize.query(`
      ALTER TABLE "DogImages" ADD COLUMN IF NOT EXISTS "url" VARCHAR(255);
      UPDATE "DogImages" SET "url" = "image_url" WHERE "url" IS NULL;
    `);

    // Add is_primary column to DogImages table
    await queryInterface.sequelize.query(`
      ALTER TABLE "DogImages" ADD COLUMN IF NOT EXISTS "is_primary" BOOLEAN DEFAULT FALSE;
      UPDATE "DogImages" SET "is_primary" = "is_profile_image" WHERE "is_primary" IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove added columns
    await queryInterface.sequelize.query(`
      ALTER TABLE "Ownerships" DROP COLUMN IF EXISTS "is_current";
      ALTER TABLE "DogImages" DROP COLUMN IF EXISTS "url";
      ALTER TABLE "DogImages" DROP COLUMN IF EXISTS "is_primary";
    `);
  }
};
