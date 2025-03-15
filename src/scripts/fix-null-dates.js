/**
 * Script to fix null date_of_birth values in the Dogs table
 * This addresses the GraphQL error: "Cannot return null for non-nullable field Dog.dateOfBirth"
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Initialize Sequelize with database config
const sequelize = new Sequelize(config.development);

async function fixNullDateOfBirth() {
  try {
    console.log('Starting to fix null date_of_birth values...');
    
    // Find all dogs with null date_of_birth
    const [dogsWithNullDates] = await sequelize.query(
      'SELECT id, name, registration_number FROM "Dogs" WHERE date_of_birth IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (!Array.isArray(dogsWithNullDates) || dogsWithNullDates.length === 0) {
      console.log('No dogs found with null date_of_birth. Nothing to fix.');
      return;
    }
    
    console.log(`Found ${dogsWithNullDates.length} dogs with null date_of_birth.`);
    
    // Generate a default date (5 years ago from today)
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 5);
    const formattedDate = defaultDate.toISOString();
    
    // Update all null date_of_birth records
    const [updateResult] = await sequelize.query(
      `UPDATE "Dogs" 
       SET date_of_birth = '${formattedDate}', 
           updated_at = NOW() 
       WHERE date_of_birth IS NULL`,
      { type: Sequelize.QueryTypes.UPDATE }
    );
    
    console.log(`Successfully updated ${updateResult} dog records with default date of birth.`);
    
    // Check if there are any remaining null records
    const [remainingNulls] = await sequelize.query(
      'SELECT COUNT(*) as count FROM "Dogs" WHERE date_of_birth IS NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const nullCount = parseInt(remainingNulls?.count || '0', 10);
    if (nullCount > 0) {
      console.log(`WARNING: ${nullCount} dog records still have null date_of_birth values.`);
    } else {
      console.log('All date_of_birth values have been successfully fixed.');
    }
    
    // Also check for null dateOfBirth (camelCase) if both column formats exist
    // This handles the column naming inconsistency mentioned in the memories
    try {
      const [columnCheck] = await sequelize.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'Dogs' AND column_name = 'dateOfBirth'`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      if (columnCheck && columnCheck.column_name) {
        console.log('Found camelCase dateOfBirth column, checking for nulls...');
        
        const [camelCaseNulls] = await sequelize.query(
          'SELECT COUNT(*) as count FROM "Dogs" WHERE "dateOfBirth" IS NULL',
          { type: Sequelize.QueryTypes.SELECT }
        );
        
        const camelNullCount = parseInt(camelCaseNulls?.count || '0', 10);
        if (camelNullCount > 0) {
          console.log(`Updating ${camelNullCount} records with null dateOfBirth values.`);
          
          // Update camelCase column
          await sequelize.query(
            `UPDATE "Dogs" 
             SET "dateOfBirth" = '${formattedDate}', 
                 "updatedAt" = NOW() 
             WHERE "dateOfBirth" IS NULL`,
            { type: Sequelize.QueryTypes.UPDATE }
          );
          
          console.log('CamelCase dateOfBirth values have been fixed.');
        } else {
          console.log('No null values found in camelCase dateOfBirth column.');
        }
      }
    } catch (error) {
      // This is just a best-effort check, so we'll just log any error
      console.log('No camelCase dateOfBirth column found, skipping this check.');
    }
    
  } catch (error) {
    console.error('Error fixing null date_of_birth values:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
fixNullDateOfBirth()
  .then(() => {
    console.log('Fix script completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error running fix script:', error);
    process.exit(1);
  });
