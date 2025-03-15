'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      -- HealthRecords aliases
      ALTER TABLE "HealthRecords" ADD COLUMN IF NOT EXISTS "date" TIMESTAMP;
      UPDATE "HealthRecords" SET "date" = "record_date" WHERE "date" IS NULL;
      -- Create trigger to sync record_date and date
      CREATE OR REPLACE FUNCTION sync_health_records_dates()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'UPDATE' THEN
          IF NEW."record_date" IS DISTINCT FROM OLD."record_date" THEN
            NEW."date" := NEW."record_date";
          ELSIF NEW."date" IS DISTINCT FROM OLD."date" THEN
            NEW."record_date" := NEW."date";
          END IF;
        ELSIF TG_OP = 'INSERT' THEN
          IF NEW."record_date" IS NULL AND NEW."date" IS NOT NULL THEN
            NEW."record_date" := NEW."date";
          ELSIF NEW."date" IS NULL AND NEW."record_date" IS NOT NULL THEN
            NEW."date" := NEW."record_date";
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS sync_health_records_dates_trigger ON "HealthRecords";
      CREATE TRIGGER sync_health_records_dates_trigger
      BEFORE INSERT OR UPDATE ON "HealthRecords"
      FOR EACH ROW
      EXECUTE FUNCTION sync_health_records_dates();

      -- CompetitionResults aliases
      ALTER TABLE "CompetitionResults" ADD COLUMN IF NOT EXISTS "event_name" VARCHAR(255);
      UPDATE "CompetitionResults" SET "event_name" = "competition_name" WHERE "event_name" IS NULL;

      ALTER TABLE "CompetitionResults" ADD COLUMN IF NOT EXISTS "event_date" TIMESTAMP;
      UPDATE "CompetitionResults" SET "event_date" = "competition_date" WHERE "event_date" IS NULL;

      -- Create trigger to sync competition_name and event_name
      CREATE OR REPLACE FUNCTION sync_competition_names()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'UPDATE' THEN
          IF NEW."competition_name" IS DISTINCT FROM OLD."competition_name" THEN
            NEW."event_name" := NEW."competition_name";
          ELSIF NEW."event_name" IS DISTINCT FROM OLD."event_name" THEN
            NEW."competition_name" := NEW."event_name";
          END IF;
        ELSIF TG_OP = 'INSERT' THEN
          IF NEW."competition_name" IS NULL AND NEW."event_name" IS NOT NULL THEN
            NEW."competition_name" := NEW."event_name";
          ELSIF NEW."event_name" IS NULL AND NEW."competition_name" IS NOT NULL THEN
            NEW."event_name" := NEW."competition_name";
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS sync_competition_names_trigger ON "CompetitionResults";
      CREATE TRIGGER sync_competition_names_trigger
      BEFORE INSERT OR UPDATE ON "CompetitionResults"
      FOR EACH ROW
      EXECUTE FUNCTION sync_competition_names();

      -- Create trigger to sync competition_date and event_date
      CREATE OR REPLACE FUNCTION sync_competition_dates()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'UPDATE' THEN
          IF NEW."competition_date" IS DISTINCT FROM OLD."competition_date" THEN
            NEW."event_date" := NEW."competition_date";
          ELSIF NEW."event_date" IS DISTINCT FROM OLD."event_date" THEN
            NEW."competition_date" := NEW."event_date";
          END IF;
        ELSIF TG_OP = 'INSERT' THEN
          IF NEW."competition_date" IS NULL AND NEW."event_date" IS NOT NULL THEN
            NEW."competition_date" := NEW."event_date";
          ELSIF NEW."event_date" IS NULL AND NEW."competition_date" IS NOT NULL THEN
            NEW."event_date" := NEW."competition_date";
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS sync_competition_dates_trigger ON "CompetitionResults";
      CREATE TRIGGER sync_competition_dates_trigger
      BEFORE INSERT OR UPDATE ON "CompetitionResults"
      FOR EACH ROW
      EXECUTE FUNCTION sync_competition_dates();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      -- Drop triggers first
      DROP TRIGGER IF EXISTS sync_health_records_dates_trigger ON "HealthRecords";
      DROP FUNCTION IF EXISTS sync_health_records_dates();
      
      DROP TRIGGER IF EXISTS sync_competition_names_trigger ON "CompetitionResults";
      DROP FUNCTION IF EXISTS sync_competition_names();
      
      DROP TRIGGER IF EXISTS sync_competition_dates_trigger ON "CompetitionResults";
      DROP FUNCTION IF EXISTS sync_competition_dates();
      
      -- Remove added columns
      ALTER TABLE "HealthRecords" DROP COLUMN IF EXISTS "date";
      ALTER TABLE "CompetitionResults" DROP COLUMN IF EXISTS "event_name";
      ALTER TABLE "CompetitionResults" DROP COLUMN IF EXISTS "event_date";
    `);
  }
};
