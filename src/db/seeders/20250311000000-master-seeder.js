'use strict';

/**
 * Master seeder that executes all other seeders in the correct order
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // 1. Run breeds seeder
      console.log('Running breeds seeder...');
      const breedsSeeder = require('./20250310000000-sample-breeds');
      await breedsSeeder.up(queryInterface, Sequelize);
      
      // 2. Run owners seeder
      console.log('Running owners seeder...');
      const ownersSeeder = require('./20250310000000-sample-owners');
      await ownersSeeder.up(queryInterface, Sequelize);
      
      // 3. Run dogs seeder
      console.log('Running dogs seeder...');
      const dogsSeeder = require('./20250311000001-dogs');
      await dogsSeeder.up(queryInterface, Sequelize);
      
      // 4. Run dog pedigrees seeder
      console.log('Running dog pedigrees seeder...');
      const pedigreesSeeder = require('./20250311000002-dogs-pedigree');
      await pedigreesSeeder.up(queryInterface, Sequelize);
      
      // 5. Run ownerships seeder
      console.log('Running ownerships seeder...');
      const ownershipsSeeder = require('./20250311000003-ownerships');
      await ownershipsSeeder.up(queryInterface, Sequelize);
      
      // 6. Run inbreeding test pedigrees seeder
      console.log('Running inbreeding test pedigrees seeder...');
      const inbreedingTestSeeder = require('./20250312000000-inbreeding-test-pedigrees');
      await inbreedingTestSeeder.up(queryInterface, Sequelize);
      
      // 7. Run Kennel Union data migration seeder
      console.log('Running Kennel Union data migration seeder...');
      const kennelUnionDataSeeder = require('./20250312100000-kennel-union-data-migration');
      await kennelUnionDataSeeder.up(queryInterface, Sequelize);
      
      console.log('Master seeder completed successfully!');
    } catch (error) {
      console.error('Error in master seeder:', error);
      throw error;
    }
  },
  
  async down(queryInterface, Sequelize) {
    // Down migrations in reverse order
    try {
      // Undo Kennel Union data migration seeder
      const kennelUnionDataSeeder = require('./20250312100000-kennel-union-data-migration');
      await kennelUnionDataSeeder.down(queryInterface, Sequelize);
      
      const inbreedingTestSeeder = require('./20250312000000-inbreeding-test-pedigrees');
      await inbreedingTestSeeder.down(queryInterface, Sequelize);
      
      const ownershipsSeeder = require('./20250311000003-ownerships');
      await ownershipsSeeder.down(queryInterface, Sequelize);
      
      const pedigreesSeeder = require('./20250311000002-dogs-pedigree');
      await pedigreesSeeder.down(queryInterface, Sequelize);
      
      const dogsSeeder = require('./20250311000001-dogs');
      await dogsSeeder.down(queryInterface, Sequelize);
      
      const ownersSeeder = require('./20250310000000-sample-owners');
      await ownersSeeder.down(queryInterface, Sequelize);
      
      const breedsSeeder = require('./20250310000000-sample-breeds');
      await breedsSeeder.down(queryInterface, Sequelize);
      
      console.log('Master seeder reversal completed successfully!');
    } catch (error) {
      console.error('Error in master seeder down migration:', error);
      throw error;
    }
  }
};
