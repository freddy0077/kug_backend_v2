/**
 * Script to sync column values between snake_case and camelCase variants
 * This addresses potential inconsistencies that could cause GraphQL errors
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Initialize Sequelize with database config
const sequelize = new Sequelize(config.development);

/**
 * Check if both snake_case and camelCase columns exist
 */
async function checkColumnExists(table, snakeCaseColumn, camelCaseColumn) {
  const [columns] = await sequelize.query(
    `SELECT column_name 
     FROM information_schema.columns 
     WHERE table_name = '${table}' 
     AND column_name IN ('${snakeCaseColumn}', '${camelCaseColumn}')`,
    { type: Sequelize.QueryTypes.SELECT }
  );

  const columnNames = Array.isArray(columns) 
    ? columns.map(c => c.column_name) 
    : [columns?.column_name].filter(Boolean);
  
  return {
    hasSnakeCase: columnNames.includes(snakeCaseColumn),
    hasCamelCase: columnNames.includes(camelCaseColumn),
    bothExist: columnNames.includes(snakeCaseColumn) && columnNames.includes(camelCaseColumn)
  };
}

/**
 * Create a trigger to keep snake_case and camelCase columns in sync
 */
async function createSyncTrigger(table, snakeCaseColumn, camelCaseColumn) {
  const triggerName = `${table}_${snakeCaseColumn}_sync`;
  
  // First drop the trigger if it exists
  try {
    await sequelize.query(`DROP TRIGGER IF EXISTS ${triggerName} ON "${table}"`);
    console.log(`Dropped existing trigger ${triggerName}`);
  } catch (error) {
    console.log(`No existing trigger ${triggerName} to drop`);
  }
  
  // Create the new trigger
  await sequelize.query(`
    CREATE OR REPLACE FUNCTION ${table}_${snakeCaseColumn}_sync_func()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.${snakeCaseColumn} IS NULL AND NEW."${camelCaseColumn}" IS NOT NULL THEN
        NEW.${snakeCaseColumn} := NEW."${camelCaseColumn}";
      ELSIF NEW.${snakeCaseColumn} IS NOT NULL AND NEW."${camelCaseColumn}" IS NULL THEN
        NEW."${camelCaseColumn}" := NEW.${snakeCaseColumn};
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  
  await sequelize.query(`
    CREATE TRIGGER ${triggerName}
    BEFORE INSERT OR UPDATE ON "${table}"
    FOR EACH ROW
    EXECUTE FUNCTION ${table}_${snakeCaseColumn}_sync_func()
  `);
  
  console.log(`Created sync trigger ${triggerName}`);
}

/**
 * Sync existing data between snake_case and camelCase columns
 */
async function syncExistingData(table, snakeCaseColumn, camelCaseColumn) {
  // Fill nulls in snake_case column first
  await sequelize.query(`
    UPDATE "${table}" 
    SET ${snakeCaseColumn} = 
      CASE 
        WHEN ${snakeCaseColumn} IS NULL AND (${snakeCaseColumn} = 'boolean' OR ${snakeCaseColumn} = 'bool') THEN FALSE
        ELSE ${snakeCaseColumn}
      END
    WHERE ${snakeCaseColumn} IS NULL
  `);
  
  // Sync from snake_case to camelCase
  const [syncedFromSnake] = await sequelize.query(`
    UPDATE "${table}" 
    SET "${camelCaseColumn}" = ${snakeCaseColumn}
    WHERE "${camelCaseColumn}" IS NULL OR "${camelCaseColumn}" != ${snakeCaseColumn}
  `);
  
  console.log(`Synced ${syncedFromSnake} records from snake_case to camelCase`);
  
  // For date columns, ensure none are null
  if (snakeCaseColumn.includes('date')) {
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 5);
    
    const [fixedNulls] = await sequelize.query(`
      UPDATE "${table}"
      SET ${snakeCaseColumn} = '${defaultDate.toISOString()}',
          "${camelCaseColumn}" = '${defaultDate.toISOString()}'
      WHERE ${snakeCaseColumn} IS NULL OR "${camelCaseColumn}" IS NULL
    `);
    
    if (fixedNulls > 0) {
      console.log(`Set default dates for ${fixedNulls} records with null values`);
    }
  }
}

/**
 * Main function to fix column naming inconsistencies
 */
async function fixColumnInconsistencies() {
  try {
    console.log('Starting to fix column naming inconsistencies...');
    
    // Define the column pairs to check and sync
    const columnPairs = [
      { table: 'Dogs', snakeCase: 'date_of_birth', camelCase: 'dateOfBirth' },
      { table: 'Dogs', snakeCase: 'date_of_death', camelCase: 'dateOfDeath' },
      { table: 'Dogs', snakeCase: 'main_image_url', camelCase: 'mainImageUrl' },
      { table: 'Dogs', snakeCase: 'registration_number', camelCase: 'registrationNumber' },
      { table: 'Dogs', snakeCase: 'microchip_number', camelCase: 'microchipNumber' },
      { table: 'Dogs', snakeCase: 'is_neutered', camelCase: 'isNeutered' },
      { table: 'Dogs', snakeCase: 'breed_id', camelCase: 'breedId' },
      { table: 'DogImages', snakeCase: 'is_profile_image', camelCase: 'isPrimary' },
      { table: 'DogImages', snakeCase: 'image_url', camelCase: 'url' },
      { table: 'Ownerships', snakeCase: 'is_active', camelCase: 'isCurrent' },
    ];
    
    for (const { table, snakeCase, camelCase } of columnPairs) {
      console.log(`\nChecking ${table} table for ${snakeCase} and ${camelCase} columns...`);
      
      // Check if both columns exist
      const { hasSnakeCase, hasCamelCase, bothExist } = await checkColumnExists(table, snakeCase, camelCase);
      
      if (!hasSnakeCase && !hasCamelCase) {
        console.log(`Neither ${snakeCase} nor ${camelCase} column exists in ${table}.`);
        continue;
      }
      
      if (!bothExist) {
        if (hasSnakeCase) {
          console.log(`Only ${snakeCase} exists in ${table}. Adding ${camelCase}...`);
          
          // Get column type from the existing column
          const [columnInfo] = await sequelize.query(
            `SELECT data_type, character_maximum_length, is_nullable
             FROM information_schema.columns
             WHERE table_name = '${table}' AND column_name = '${snakeCase}'`,
            { type: Sequelize.QueryTypes.SELECT }
          );
          
          if (!columnInfo) {
            console.log(`Could not get column info for ${snakeCase}.`);
            continue;
          }
          
          // Create the missing camelCase column
          let dataType = columnInfo.data_type;
          if (dataType === 'character varying' && columnInfo.character_maximum_length) {
            dataType += `(${columnInfo.character_maximum_length})`;
          }
          
          // Important: Make camelCase column nullable even if snake_case is not
          // We'll make sure the data is properly synced afterward
          
          // First, update any NULL values in the snake_case column if it's a boolean
          if (dataType === 'boolean') {
            await sequelize.query(
              `UPDATE "${table}" SET ${snakeCase} = FALSE WHERE ${snakeCase} IS NULL`
            );
            console.log(`Updated NULL values in ${snakeCase} to FALSE`);
          }
          
          await sequelize.query(
            `ALTER TABLE "${table}" ADD COLUMN "${camelCase}" ${dataType}`
          );
          
          // Copy data from snake_case to camelCase
          await sequelize.query(
            `UPDATE "${table}" SET "${camelCase}" = ${snakeCase}`
          );
          
          console.log(`Added ${camelCase} column and synced data.`);
        } else {
          console.log(`Only ${camelCase} exists in ${table}. Adding ${snakeCase}...`);
          
          // Similar logic for adding snake_case column
          const [columnInfo] = await sequelize.query(
            `SELECT data_type, character_maximum_length, is_nullable
             FROM information_schema.columns
             WHERE table_name = '${table}' AND column_name = '${camelCase}'`,
            { type: Sequelize.QueryTypes.SELECT }
          );
          
          if (!columnInfo) {
            console.log(`Could not get column info for ${camelCase}.`);
            continue;
          }
          
          let dataType = columnInfo.data_type;
          if (dataType === 'character varying' && columnInfo.character_maximum_length) {
            dataType += `(${columnInfo.character_maximum_length})`;
          }
          
          // Make snake_case column nullable initially
          await sequelize.query(
            `ALTER TABLE "${table}" ADD COLUMN ${snakeCase} ${dataType}`
          );
          
          // Copy data from camelCase to snake_case
          await sequelize.query(
            `UPDATE "${table}" SET ${snakeCase} = "${camelCase}"`
          );
          
          console.log(`Added ${snakeCase} column and synced data.`);
        }
      } else {
        console.log(`Both ${snakeCase} and ${camelCase} columns exist in ${table}.`);
        
        // Sync existing data
        await syncExistingData(table, snakeCase, camelCase);
      }
      
      // Create trigger to keep columns in sync regardless of whether we just created one or both existed
      try {
        await createSyncTrigger(table, snakeCase, camelCase);
      } catch (error) {
        console.error(`Error creating trigger for ${table}.${snakeCase}: ${error.message}`);
      }
    }
    
    console.log('\nColumn consistency check and fix completed successfully.');
    
  } catch (error) {
    console.error('Error fixing column inconsistencies:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
fixColumnInconsistencies()
  .then(() => {
    console.log('Fix script completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error running fix script:', error);
    process.exit(1);
  });
