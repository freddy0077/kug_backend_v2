'use strict';

/**
 * Module for migrating dog relationship data from kennel-union.sql
 */

/**
 * Updates dog relationships based on registration numbers
 * @param {Object} queryInterface - Sequelize query interface
 * @param {Array} dogRelationships - Array of dog relationship objects from SQL dump
 * @param {Map} oldDogIdMap - Map of old dog IDs to new dog IDs
 * @param {Map} registrationToIdMap - Map of registration numbers to dog IDs
 * @returns {void}
 */
async function migrateRelationships(queryInterface, dogRelationships, oldDogIdMap, registrationToIdMap) {
  console.log('Updating dog relationships...');
  
  // Collect updates for parent-child relationships
  const updates = [];
  
  for (const relationship of dogRelationships) {
    const dogId = oldDogIdMap.get(parseInt(relationship.dog_id));
    
    if (!dogId) {
      console.log(`Skipping relationship for dog ID ${relationship.dog_id} as it was not imported`);
      continue;
    }
    
    let sireId = null;
    let damId = null;
    
    // Get sire ID from registration number
    if (relationship.father && registrationToIdMap.has(relationship.father)) {
      sireId = registrationToIdMap.get(relationship.father);
    }
    
    // Get dam ID from registration number
    if (relationship.mother && registrationToIdMap.has(relationship.mother)) {
      damId = registrationToIdMap.get(relationship.mother);
    }
    
    // Only update if we found either parent
    if (sireId || damId) {
      updates.push({
        dogId,
        sireId,
        damId
      });
    }
  }
  
  // Apply updates in batches to avoid excessive database operations
  if (updates.length > 0) {
    console.log(`Updating ${updates.length} dog relationships...`);
    
    for (const update of updates) {
      // Update both snake_case and camelCase columns
      await queryInterface.sequelize.query(`
        UPDATE "Dogs" 
        SET 
          "sire_id" = ${update.sireId ? update.sireId : 'NULL'},
          "sireId" = ${update.sireId ? update.sireId : 'NULL'},
          "dam_id" = ${update.damId ? update.damId : 'NULL'},
          "damId" = ${update.damId ? update.damId : 'NULL'}
        WHERE "id" = ${update.dogId}
      `);
    }
  } else {
    console.log('No dog relationships to update.');
  }
}

module.exports = {
  migrateRelationships
};
