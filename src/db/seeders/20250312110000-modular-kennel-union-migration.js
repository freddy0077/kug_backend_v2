'use strict';
const fs = require('fs');
const path = require('path');

// Import our utility modules
const { extractDataFromSql } = require('../utils/sqlExtractor');
const { migrateBreeds } = require('../utils/breedMigrator');
const { migrateOwners } = require('../utils/ownerMigrator');
const { migrateDogs } = require('../utils/dogMigrator');
const { migrateRelationships } = require('../utils/relationshipMigrator');
const { migrateOwnerships } = require('../utils/ownershipMigrator');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('Starting Kennel Union data migration...');
      
      // Read the SQL dump file
      const sqlFilePath = path.resolve(__dirname, '..', '..', '..', 'kennel-union.sql');
      console.log(`Reading SQL file from: ${sqlFilePath}`);
      
      if (!fs.existsSync(sqlFilePath)) {
        console.error('SQL file not found! Please ensure kennel-union.sql is in the project root directory.');
        return;
      }
      
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      console.log(`SQL file read successfully. Size: ${sqlContent.length} bytes`);
      
      // 1. Extract data from SQL dump
      console.log('Extracting users data...');
      const users = extractDataFromSql(sqlContent, 'users');
      
      console.log('Extracting breeders data...');
      const breeders = extractDataFromSql(sqlContent, 'breeders');
      
      console.log('Extracting dogs data...');
      const dogs = extractDataFromSql(sqlContent, 'dogs');
      
      console.log('Extracting dog relationships data...');
      const dogRelationships = extractDataFromSql(sqlContent, 'dog_relationships');
      
      // 2. Create records in sequential manner
      
      // 2.1 First migrate breeds
      const breedMap = await migrateBreeds(queryInterface, breeders);
      
      // 2.2 Then migrate owners
      const ownerMap = await migrateOwners(queryInterface, users);
      
      // 2.3 Then migrate dogs
      const { oldDogIdMap, registrationToIdMap } = await migrateDogs(
        queryInterface, 
        dogs, 
        breeders, 
        users, 
        breedMap, 
        ownerMap
      );
      
      // 2.4 Then update dog relationships
      await migrateRelationships(
        queryInterface,
        dogRelationships,
        oldDogIdMap,
        registrationToIdMap
      );
      
      // 2.5 Finally create ownership records
      await migrateOwnerships(
        queryInterface,
        dogs,
        users,
        oldDogIdMap,
        ownerMap
      );
      
      console.log('Kennel Union data migration completed successfully!');
    } catch (error) {
      console.error('Error during kennel union data migration:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // This is intentionally a no-op since we don't want to delete 
    // production data if this seeder is reverted
    console.log('Note: down migration is a no-op to protect data');
  }
};
