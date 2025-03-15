/**
 * Script to run the Kennel Union migration in the background
 * 
 * This script can be run from the command line with:
 * node src/scripts/run-kennel-migration.js
 */

const { runBackgroundMigration } = require('../db/utils/kennelUnionBackgroundMigrator');

console.log('Starting Kennel Union background migration process...');
console.log('This will run in the background and may take several minutes to complete.');
console.log('Check the logs for progress updates.');

runBackgroundMigration()
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
