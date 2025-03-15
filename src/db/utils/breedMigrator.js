'use strict';

/**
 * Module for migrating breed data from kennel-union.sql
 */

/**
 * Creates or fetches breeds from the database
 * @param {Object} queryInterface - Sequelize query interface
 * @param {Array} breeders - Array of breeder objects from SQL dump
 * @returns {Map} - Map of breed names to IDs
 */
async function migrateBreeds(queryInterface, breeders) {
  console.log('Creating or fetching breeds...');
  
  // First, fetch existing breeds to avoid duplicates
  const existingBreeds = await queryInterface.sequelize.query(
    'SELECT id, name FROM "Breeds"',
    { type: queryInterface.sequelize.QueryTypes.SELECT }
  );
  
  // Create a map of existing breed names (lowercase for case-insensitive comparison)
  const existingBreedNames = new Set();
  const breedMap = new Map();
  
  existingBreeds.forEach(breed => {
    existingBreedNames.add(breed.name.toLowerCase());
    breedMap.set(breed.name.toLowerCase(), breed.id);
  });
  
  // Filter out breeds that already exist
  const newBreedRecords = [];
  if (breeders.length > 0) {
    for (const breeder of breeders) {
      if (breeder.name && !existingBreedNames.has(breeder.name.toLowerCase())) {
        newBreedRecords.push({
          name: breeder.name,
          description: `Breed imported from Kennel Union data`,
          origin: 'Unknown',
          average_lifespan: null,
          average_height: null,
          average_weight: null,
          group: null,
          temperament: null,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        // Add to our existing set to prevent duplicates within the new data
        existingBreedNames.add(breeder.name.toLowerCase());
      }
    }
  }
  
  if (newBreedRecords.length > 0) {
    console.log(`Inserting ${newBreedRecords.length} new breeds...`);
    await queryInterface.bulkInsert('Breeds', newBreedRecords, {});
  } else {
    console.log('No new breeds to insert.');
  }
  
  // Fetch all breeds again to get fresh IDs for newly inserted breeds
  const allBreeds = await queryInterface.sequelize.query(
    'SELECT id, name FROM "Breeds"',
    { type: queryInterface.sequelize.QueryTypes.SELECT }
  );
  
  // Update the breed map with all breeds
  allBreeds.forEach(breed => {
    breedMap.set(breed.name.toLowerCase(), breed.id);
  });
  
  return breedMap;
}

module.exports = {
  migrateBreeds
};
