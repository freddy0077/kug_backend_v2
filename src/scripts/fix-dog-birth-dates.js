/**
 * Script to fix date_of_birth and dateOfBirth columns in the Dogs table
 * Ensures all dogs have valid birth dates in both column formats
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Initialize Sequelize with database config
const sequelize = new Sequelize(config.development);

async function fixDogBirthDates() {
  try {
    console.log('Starting to fix dog birth dates...');
    
    // Check which columns exist
    const [columns] = await sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'Dogs' AND column_name IN ('date_of_birth', 'dateOfBirth')`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const columnNames = Array.isArray(columns) 
      ? columns.map(col => col.column_name)
      : [columns?.column_name].filter(Boolean);
    
    console.log('Found date columns:', columnNames);
    
    const hasDateOfBirth = columnNames.includes('date_of_birth');
    const hasDateOfBirthCamel = columnNames.includes('dateOfBirth');
    
    if (!hasDateOfBirth && !hasDateOfBirthCamel) {
      console.log('Neither date_of_birth nor dateOfBirth column exists in Dogs table.');
      return;
    }
    
    // 1. Add missing column if needed
    if (hasDateOfBirth && !hasDateOfBirthCamel) {
      console.log('Adding dateOfBirth column...');
      await sequelize.query(`
        ALTER TABLE "Dogs" ADD COLUMN "dateOfBirth" timestamp with time zone
      `);
      hasDateOfBirthCamel = true;
    } else if (!hasDateOfBirth && hasDateOfBirthCamel) {
      console.log('Adding date_of_birth column...');
      await sequelize.query(`
        ALTER TABLE "Dogs" ADD COLUMN date_of_birth timestamp with time zone
      `);
      hasDateOfBirth = true;
    }
    
    // 2. Ensure no null birth dates in either column
    const defaultBirthDate = new Date();
    defaultBirthDate.setFullYear(defaultBirthDate.getFullYear() - 5);
    
    // Fix snake_case column nulls
    if (hasDateOfBirth) {
      const [snakeNullCount] = await sequelize.query(
        `SELECT COUNT(*) FROM "Dogs" WHERE date_of_birth IS NULL`
      );
      
      if (parseInt(snakeNullCount[0].count, 10) > 0) {
        console.log(`Fixing ${snakeNullCount[0].count} null date_of_birth values...`);
        
        // Use dateOfBirth value if available, otherwise default
        if (hasDateOfBirthCamel) {
          await sequelize.query(`
            UPDATE "Dogs" 
            SET date_of_birth = CASE 
              WHEN "dateOfBirth" IS NOT NULL THEN "dateOfBirth"
              ELSE '${defaultBirthDate.toISOString()}'
            END
            WHERE date_of_birth IS NULL
          `);
        } else {
          await sequelize.query(`
            UPDATE "Dogs" 
            SET date_of_birth = '${defaultBirthDate.toISOString()}'
            WHERE date_of_birth IS NULL
          `);
        }
      }
    }
    
    // Fix camelCase column nulls
    if (hasDateOfBirthCamel) {
      const [camelNullCount] = await sequelize.query(
        `SELECT COUNT(*) FROM "Dogs" WHERE "dateOfBirth" IS NULL`
      );
      
      if (parseInt(camelNullCount[0].count, 10) > 0) {
        console.log(`Fixing ${camelNullCount[0].count} null dateOfBirth values...`);
        
        // Use date_of_birth value if available, otherwise default
        if (hasDateOfBirth) {
          await sequelize.query(`
            UPDATE "Dogs" 
            SET "dateOfBirth" = CASE 
              WHEN date_of_birth IS NOT NULL THEN date_of_birth
              ELSE '${defaultBirthDate.toISOString()}'
            END
            WHERE "dateOfBirth" IS NULL
          `);
        } else {
          await sequelize.query(`
            UPDATE "Dogs" 
            SET "dateOfBirth" = '${defaultBirthDate.toISOString()}'
            WHERE "dateOfBirth" IS NULL
          `);
        }
      }
    }
    
    // 3. Ensure both columns have the same value
    if (hasDateOfBirth && hasDateOfBirthCamel) {
      const [mismatchCount] = await sequelize.query(
        `SELECT COUNT(*) FROM "Dogs" WHERE date_of_birth IS NOT NULL AND "dateOfBirth" IS NOT NULL AND date_of_birth != "dateOfBirth"`
      );
      
      if (parseInt(mismatchCount[0].count, 10) > 0) {
        console.log(`Syncing ${mismatchCount[0].count} mismatched date values...`);
        
        // Prioritize date_of_birth (snake_case)
        await sequelize.query(`
          UPDATE "Dogs" SET "dateOfBirth" = date_of_birth
          WHERE date_of_birth IS NOT NULL AND "dateOfBirth" IS NOT NULL AND date_of_birth != "dateOfBirth"
        `);
      }
    }
    
    // 4. Create trigger to keep them in sync
    if (hasDateOfBirth && hasDateOfBirthCamel) {
      console.log('Creating sync trigger...');
      
      // Drop existing trigger if any
      try {
        await sequelize.query(`DROP TRIGGER IF EXISTS dog_birth_date_sync ON "Dogs"`);
        await sequelize.query(`DROP FUNCTION IF EXISTS dog_birth_date_sync_func()`);
      } catch (e) {
        // Ignore errors
      }
      
      // Create function and trigger
      await sequelize.query(`
        CREATE OR REPLACE FUNCTION dog_birth_date_sync_func()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.date_of_birth IS DISTINCT FROM NEW."dateOfBirth" THEN
            IF NEW.date_of_birth IS NULL THEN
              NEW.date_of_birth := NEW."dateOfBirth";
            ELSE
              NEW."dateOfBirth" := NEW.date_of_birth;
            END IF;
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);
      
      await sequelize.query(`
        CREATE TRIGGER dog_birth_date_sync
        BEFORE INSERT OR UPDATE ON "Dogs"
        FOR EACH ROW
        EXECUTE FUNCTION dog_birth_date_sync_func()
      `);
    }
    
    // 5. Verify final state
    const [finalNullCheck] = await sequelize.query(`
      SELECT 
        SUM(CASE WHEN ${hasDateOfBirth ? 'date_of_birth IS NULL' : 'false'} THEN 1 ELSE 0 END) as snake_null_count,
        SUM(CASE WHEN ${hasDateOfBirthCamel ? '"dateOfBirth" IS NULL' : 'false'} THEN 1 ELSE 0 END) as camel_null_count
      FROM "Dogs"
    `);
    
    const snakeNullCount = parseInt(finalNullCheck[0].snake_null_count, 10);
    const camelNullCount = parseInt(finalNullCheck[0].camel_null_count, 10);
    
    if (snakeNullCount > 0 || camelNullCount > 0) {
      console.log(`WARNING: After fixes, found ${snakeNullCount} null date_of_birth values and ${camelNullCount} null dateOfBirth values.`);
    } else {
      console.log('All dog birth dates are properly set in both column formats.');
    }
    
    console.log('Fix completed successfully.');
    
  } catch (error) {
    console.error('Error fixing dog birth dates:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
fixDogBirthDates()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error running script:', error);
    process.exit(1);
  });
