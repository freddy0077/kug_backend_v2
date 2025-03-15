'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Fix Health Records columns
      // 1. Add veterinarian column as alias for veterinarian_name if it exists
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'HealthRecords' 
                    AND column_name = 'veterinarian_name') THEN
            ALTER TABLE "HealthRecords" ADD COLUMN IF NOT EXISTS "veterinarian" VARCHAR(255);
            UPDATE "HealthRecords" SET "veterinarian" = "veterinarian_name"
            WHERE "veterinarian_name" IS NOT NULL;
          END IF;
        END $$;
      `);
      
      // 2. Add date column as alias for record_date if it exists
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'HealthRecords' 
                    AND column_name = 'record_date') THEN
            ALTER TABLE "HealthRecords" ADD COLUMN IF NOT EXISTS "date" TIMESTAMP WITH TIME ZONE;
            UPDATE "HealthRecords" SET "date" = "record_date"
            WHERE "record_date" IS NOT NULL;
          END IF;
        END $$;
      `);
      
      // 3. Add attachments column as alias for document_url if it exists
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'HealthRecords' 
                    AND column_name = 'document_url') THEN
            ALTER TABLE "HealthRecords" ADD COLUMN IF NOT EXISTS "attachments" VARCHAR(255);
            UPDATE "HealthRecords" SET "attachments" = "document_url"
            WHERE "document_url" IS NOT NULL;
          END IF;
        END $$;
      `);

      // Fix Competition Results columns
      // 1. Add event_name column as alias for competition_name if it exists
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'CompetitionResults' 
                    AND column_name = 'competition_name') THEN
            ALTER TABLE "CompetitionResults" ADD COLUMN IF NOT EXISTS "event_name" VARCHAR(255);
            UPDATE "CompetitionResults" SET "event_name" = "competition_name"
            WHERE "competition_name" IS NOT NULL;
          END IF;
        END $$;
      `);
      
      // 2. Add event_date column as alias for competition_date if it exists
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'CompetitionResults' 
                    AND column_name = 'competition_date') THEN
            ALTER TABLE "CompetitionResults" ADD COLUMN IF NOT EXISTS "event_date" TIMESTAMP WITH TIME ZONE;
            UPDATE "CompetitionResults" SET "event_date" = "competition_date"
            WHERE "competition_date" IS NOT NULL;
          END IF;
        END $$;
      `);
      
      // 3. Add category column (missing from original schema)
      await queryInterface.sequelize.query(`
        ALTER TABLE "CompetitionResults" ADD COLUMN IF NOT EXISTS "category" VARCHAR(255);
      `);
      
      // 4. Add place column as alias for rank if it exists
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'CompetitionResults' 
                    AND column_name = 'rank') THEN
            ALTER TABLE "CompetitionResults" ADD COLUMN IF NOT EXISTS "place" INTEGER;
            UPDATE "CompetitionResults" SET "place" = "rank"
            WHERE "rank" IS NOT NULL;
          END IF;
        END $$;
      `);
      
      // 5. Add score column alias or points column as needed
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          -- First check if points exists
          IF EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'CompetitionResults' 
                    AND column_name = 'points') THEN
            -- Points exists, add score as alias
            ALTER TABLE "CompetitionResults" ADD COLUMN IF NOT EXISTS "score" FLOAT;
            UPDATE "CompetitionResults" SET "score" = "points"
            WHERE "points" IS NOT NULL;
          ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'CompetitionResults' 
                       AND column_name = 'score') THEN
            -- Score exists, add points as alias
            ALTER TABLE "CompetitionResults" ADD COLUMN IF NOT EXISTS "points" FLOAT;
            UPDATE "CompetitionResults" SET "points" = "score"
            WHERE "score" IS NOT NULL;
          ELSE
            -- Neither exists, add both with default null values
            ALTER TABLE "CompetitionResults" ADD COLUMN IF NOT EXISTS "points" FLOAT;
            ALTER TABLE "CompetitionResults" ADD COLUMN IF NOT EXISTS "score" FLOAT;
          END IF;
        END $$;
      `);

      console.log('Column aliases added successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Remove Health Records aliases
      await queryInterface.sequelize.query(`
        ALTER TABLE "HealthRecords" 
        DROP COLUMN IF EXISTS "veterinarian",
        DROP COLUMN IF EXISTS "date",
        DROP COLUMN IF EXISTS "attachments";
      `);

      // Remove Competition Results aliases
      await queryInterface.sequelize.query(`
        ALTER TABLE "CompetitionResults" 
        DROP COLUMN IF EXISTS "event_name",
        DROP COLUMN IF EXISTS "event_date",
        DROP COLUMN IF EXISTS "category",
        DROP COLUMN IF EXISTS "place";
      `);
      
      // Only drop points or score if they're not the original column
      await queryInterface.sequelize.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'CompetitionResults' 
                    AND column_name = 'points') 
             AND EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'CompetitionResults' 
                        AND column_name = 'score') THEN
            -- Both exist, check which one is the alias based on data presence
            IF (SELECT COUNT(*) FROM "CompetitionResults" WHERE "points" IS NOT NULL) >
               (SELECT COUNT(*) FROM "CompetitionResults" WHERE "score" IS NOT NULL) THEN
              -- points has more data, it's likely the original
              ALTER TABLE "CompetitionResults" DROP COLUMN IF EXISTS "score";
            ELSE
              -- score has more data, it's likely the original
              ALTER TABLE "CompetitionResults" DROP COLUMN IF EXISTS "points";
            END IF;
          END IF;
        END $$;
      `);
    } catch (error) {
      console.error('Migration reversal failed:', error);
      throw error;
    }
  }
};
