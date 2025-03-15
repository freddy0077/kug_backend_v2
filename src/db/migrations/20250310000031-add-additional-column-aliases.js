'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Fix HealthRecord column naming issues
    await queryInterface.sequelize.query(`
      -- Add "vetName" as an alias for "veterinarian_name"
      ALTER TABLE "HealthRecords" ADD COLUMN IF NOT EXISTS "vetName" VARCHAR(255);
      UPDATE "HealthRecords" SET "vetName" = "veterinarian_name" WHERE "vetName" IS NULL AND "veterinarian_name" IS NOT NULL;

      -- Add "attachments" as an alias for "document_url"
      ALTER TABLE "HealthRecords" ADD COLUMN IF NOT EXISTS "attachments" VARCHAR(255);
      UPDATE "HealthRecords" SET "attachments" = "document_url" WHERE "attachments" IS NULL AND "document_url" IS NOT NULL;
    `);

    // Fix CompetitionResult column naming issues
    await queryInterface.sequelize.query(`
      -- Add "place" as an alias for "rank"
      ALTER TABLE "CompetitionResults" ADD COLUMN IF NOT EXISTS "place" INTEGER;
      UPDATE "CompetitionResults" SET "place" = "rank" WHERE "place" IS NULL AND "rank" IS NOT NULL;
    `);

    // Fix Ownership column naming issues (camelCase vs snake_case)
    await queryInterface.sequelize.query(`
      -- Add "isCurrent" as a camelCase alias for "is_current"
      ALTER TABLE "Ownerships" ADD COLUMN IF NOT EXISTS "isCurrent" BOOLEAN DEFAULT TRUE;
      UPDATE "Ownerships" SET "isCurrent" = "is_current" WHERE "isCurrent" IS NULL AND "is_current" IS NOT NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove all added columns
    await queryInterface.sequelize.query(`
      -- Remove HealthRecord columns
      ALTER TABLE "HealthRecords" DROP COLUMN IF EXISTS "vetName";
      ALTER TABLE "HealthRecords" DROP COLUMN IF EXISTS "attachments";

      -- Remove CompetitionResult columns
      ALTER TABLE "CompetitionResults" DROP COLUMN IF EXISTS "place";

      -- Remove Ownership columns
      ALTER TABLE "Ownerships" DROP COLUMN IF EXISTS "isCurrent";
    `);
  }
};
