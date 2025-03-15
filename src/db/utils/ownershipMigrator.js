'use strict';

/**
 * Module for migrating dog ownership data from kennel-union.sql
 */

/**
 * Creates ownership records for dogs and owners
 * @param {Object} queryInterface - Sequelize query interface
 * @param {Array} dogs - Array of dog objects from SQL dump
 * @param {Array} users - Array of user objects from SQL dump
 * @param {Map} oldDogIdMap - Map of old dog IDs to new dog IDs
 * @param {Map} ownerMap - Map of owner emails to IDs
 * @returns {void}
 */
async function migrateOwnerships(queryInterface, dogs, users, oldDogIdMap, ownerMap) {
  console.log('Creating ownership records...');
  
  // Check for existing ownerships to avoid duplicates
  const existingOwnerships = await queryInterface.sequelize.query(
    'SELECT "dog_id", "dogId", "owner_id", "ownerId" FROM "Ownerships"',
    { type: queryInterface.sequelize.QueryTypes.SELECT }
  );
  
  // Create a set of existing dog-owner combinations
  const existingCombinations = new Set();
  
  existingOwnerships.forEach(ownership => {
    // Handle both snake_case and camelCase column variants
    const dogId = ownership.dog_id || ownership.dogId;
    const ownerId = ownership.owner_id || ownership.ownerId;
    if (dogId && ownerId) {
      existingCombinations.add(`${dogId}-${ownerId}`);
    }
  });
  
  const ownershipRecords = [];
  
  for (const dog of dogs) {
    // Skip if the dog doesn't have a user ID
    if (!dog.user_id) continue;
    
    // Find the dog in our new database
    const dogId = oldDogIdMap.get(parseInt(dog.id));
    if (!dogId) continue;
    
    // Find the owner in our new database
    const user = users.find(u => u.id === dog.user_id);
    if (!user || !user.email) continue;
    
    const ownerId = ownerMap.get(user.email.toLowerCase());
    if (!ownerId) continue;
    
    // Check if this combination already exists
    const combinationKey = `${dogId}-${ownerId}`;
    if (existingCombinations.has(combinationKey)) continue;
    
    // Create record with both snake_case and camelCase versions
    ownershipRecords.push({
      dog_id: dogId,
      dogId: dogId, // camelCase version
      owner_id: ownerId,
      ownerId: ownerId, // camelCase version
      is_current: true,
      isCurrent: true, // camelCase version
      is_active: true, // column alias for is_current
      isActive: true, // camelCase version of column alias
      start_date: new Date(),
      startDate: new Date(), // camelCase version
      end_date: null,
      endDate: null, // camelCase version
      created_at: new Date(),
      createdAt: new Date(), // camelCase version
      updated_at: new Date(),
      updatedAt: new Date() // camelCase version
    });
    
    // Add to our existing set to prevent duplicates
    existingCombinations.add(combinationKey);
  }
  
  // Bulk insert all ownerships
  if (ownershipRecords.length > 0) {
    console.log(`Creating ${ownershipRecords.length} new ownership records...`);
    await queryInterface.bulkInsert('Ownerships', ownershipRecords, {});
  } else {
    console.log('No new ownership records to create.');
  }
}

module.exports = {
  migrateOwnerships
};
