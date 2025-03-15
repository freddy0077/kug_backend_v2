/**
 * Script to directly sync dateOfBirth and date_of_birth columns in the Dogs table
 * This specifically addresses the GraphQL error: "Cannot return null for non-nullable field Dog.dateOfBirth"
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Initialize Sequelize with database config
const sequelize = new Sequelize(config.development);

async function repairDogDateColumns() {
  try {
    console.log('Starting to repair Dog date columns...');
    
    // First check which columns actually exist
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Dogs' 
      AND column_name IN ('date_of_birth', 'dateOfBirth')
    `);
    
    const columnNames = Array.isArray(columns) 
      ? columns.map(c => c.column_name) 
      : [columns?.column_name].filter(Boolean);
    
    console.log('Found columns:', columnNames);
    
    const hasDateOfBirth = columnNames.includes('date_of_birth');
    const hasDateOfBirthCamel = columnNames.includes('dateOfBirth');
    
    if (!hasDateOfBirth && !hasDateOfBirthCamel) {
      console.log('Neither date_of_birth nor dateOfBirth column exists in Dogs table.');
      return;
    }
    
    // 1. If one column is missing, add it
    if (hasDateOfBirth && !hasDateOfBirthCamel) {
      console.log('Creating missing dateOfBirth column...');
      await sequelize.query(`
        ALTER TABLE "Dogs" ADD COLUMN "dateOfBirth" timestamp with time zone
      `);
    } else if (!hasDateOfBirth && hasDateOfBirthCamel) {
      console.log('Creating missing date_of_birth column...');
      await sequelize.query(`
        ALTER TABLE "Dogs" ADD COLUMN date_of_birth timestamp with time zone
      `);
    }
    
    // 2. Generate a default date (5 years ago) for records with null date values
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 5);
    const formattedDate = defaultDate.toISOString();
    
    // 3. Find and fix records with null dateOfBirth
    if (hasDateOfBirthCamel) {
      const [nullDateOfBirthCount] = await sequelize.query(`
        SELECT COUNT(*) FROM "Dogs" WHERE "dateOfBirth" IS NULL
      `);
      
      const count = parseInt(nullDateOfBirthCount[0].count, 10);
      
      if (count > 0) {
        console.log(`Found ${count} dogs with null dateOfBirth. Fixing...`);
        
        // If date_of_birth is not null, copy from that
        if (hasDateOfBirth) {
          await sequelize.query(`
            UPDATE "Dogs" 
            SET "dateOfBirth" = date_of_birth 
            WHERE "dateOfBirth" IS NULL AND date_of_birth IS NOT NULL
          `);
        }
        
        // For any remaining nulls, set default date
        await sequelize.query(`
          UPDATE "Dogs" 
          SET "dateOfBirth" = '${formattedDate}' 
          WHERE "dateOfBirth" IS NULL
        `);
      } else {
        console.log('No null dateOfBirth values found.');
      }
    }
    
    // 4. Find and fix records with null date_of_birth
    if (hasDateOfBirth) {
      const [nullDateOfBirthCount] = await sequelize.query(`
        SELECT COUNT(*) FROM "Dogs" WHERE date_of_birth IS NULL
      `);
      
      const count = parseInt(nullDateOfBirthCount[0].count, 10);
      
      if (count > 0) {
        console.log(`Found ${count} dogs with null date_of_birth. Fixing...`);
        
        // If dateOfBirth is not null, copy from that
        if (hasDateOfBirthCamel) {
          await sequelize.query(`
            UPDATE "Dogs" 
            SET date_of_birth = "dateOfBirth" 
            WHERE date_of_birth IS NULL AND "dateOfBirth" IS NOT NULL
          `);
        }
        
        // For any remaining nulls, set default date
        await sequelize.query(`
          UPDATE "Dogs" 
          SET date_of_birth = '${formattedDate}' 
          WHERE date_of_birth IS NULL
        `);
      } else {
        console.log('No null date_of_birth values found.');
      }
    }
    
    // 5. Verify that all records now have non-null dates
    let allFixed = true;
    
    if (hasDateOfBirthCamel) {
      const [remainingNullsCamel] = await sequelize.query(`
        SELECT COUNT(*) as count FROM "Dogs" WHERE "dateOfBirth" IS NULL
      `);
      
      const nullCount = parseInt(remainingNullsCamel[0].count, 10);
      if (nullCount > 0) {
        console.log(`WARNING: ${nullCount} dog records still have null dateOfBirth values.`);
        allFixed = false;
      }
    }
    
    if (hasDateOfBirth) {
      const [remainingNullsSnake] = await sequelize.query(`
        SELECT COUNT(*) as count FROM "Dogs" WHERE date_of_birth IS NULL
      `);
      
      const nullCount = parseInt(remainingNullsSnake[0].count, 10);
      if (nullCount > 0) {
        console.log(`WARNING: ${nullCount} dog records still have null date_of_birth values.`);
        allFixed = false;
      }
    }
    
    // 6. Create trigger to keep columns in sync if both exist
    if (hasDateOfBirth && hasDateOfBirthCamel) {
      console.log('Creating sync trigger to maintain column consistency...');
      
      // Drop existing trigger if any
      try {
        await sequelize.query(`DROP TRIGGER IF EXISTS dogs_date_sync ON "Dogs"`);
        await sequelize.query(`DROP FUNCTION IF EXISTS dogs_date_sync_func()`);
      } catch (e) {
        // Ignore errors here
      }
      
      // Create function and trigger
      await sequelize.query(`
        CREATE OR REPLACE FUNCTION dogs_date_sync_func()
        RETURNS TRIGGER AS $$
        BEGIN
          IF NEW.date_of_birth IS NULL AND NEW."dateOfBirth" IS NOT NULL THEN
            NEW.date_of_birth := NEW."dateOfBirth";
          ELSIF NEW.date_of_birth IS NOT NULL AND NEW."dateOfBirth" IS NULL THEN
            NEW."dateOfBirth" := NEW.date_of_birth;
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);
      
      await sequelize.query(`
        CREATE TRIGGER dogs_date_sync
        BEFORE INSERT OR UPDATE ON "Dogs"
        FOR EACH ROW
        EXECUTE FUNCTION dogs_date_sync_func()
      `);
      
      console.log('Sync trigger created successfully.');
    }
    
    if (allFixed) {
      console.log('All dog date columns successfully repaired!');
    } else {
      console.log('Some issues could not be fixed automatically. Manual inspection may be needed.');
    }
    
  } catch (error) {
    console.error('Error repairing dog date columns:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
repairDogDateColumns()
  .then(() => {
    console.log('Repair script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error running repair script:', error);
    process.exit(1);
  });
