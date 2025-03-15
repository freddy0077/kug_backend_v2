'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add attachment_url column alias to HealthRecords
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        -- For HealthRecords: Add attachment_url as alias for document_url or attachments
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'HealthRecords' 
                   AND column_name = 'document_url') THEN
          -- document_url exists, add attachment_url as alias
          ALTER TABLE "HealthRecords" ADD COLUMN IF NOT EXISTS "attachment_url" VARCHAR(255);
          UPDATE "HealthRecords" SET "attachment_url" = "document_url"
          WHERE "document_url" IS NOT NULL;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'HealthRecords' 
                   AND column_name = 'attachments') THEN
          -- attachments exists, add attachment_url as alias
          ALTER TABLE "HealthRecords" ADD COLUMN IF NOT EXISTS "attachment_url" VARCHAR(255);
          UPDATE "HealthRecords" SET "attachment_url" = "attachments"
          WHERE "attachments" IS NOT NULL;
        ELSE
          -- Neither exists, add the column with NULL values
          ALTER TABLE "HealthRecords" ADD COLUMN IF NOT EXISTS "attachment_url" VARCHAR(255);
        END IF;
      END $$;
    `);

    // Add simple function without using triggers for now
    await queryInterface.sequelize.query(`
      -- Add attachment_url column as alias for attachmentUrl
      ALTER TABLE "HealthRecords" ADD COLUMN IF NOT EXISTS "attachmentUrl" VARCHAR(255);
    `);

    // Try to update any existing records if possible
    await queryInterface.sequelize.query(`
      UPDATE "HealthRecords" 
      SET "attachmentUrl" = "attachment_url" 
      WHERE "attachment_url" IS NOT NULL;
    `);

    console.log('Additional column aliases added successfully');
  },

  async down(queryInterface, Sequelize) {
    // Remove the attachment_url column alias
    await queryInterface.sequelize.query(`
      ALTER TABLE "HealthRecords" 
      DROP COLUMN IF EXISTS "attachment_url",
      DROP COLUMN IF EXISTS "attachmentUrl";
    `);

    console.log('Additional column aliases removed successfully');
  }
};
