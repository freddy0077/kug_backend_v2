'use strict';

const { parseDate } = require('./dateParser');

/**
 * Module for migrating dog data from kennel-union.sql
 */

/**
 * Creates or fetches dogs from the database
 * @param {Object} queryInterface - Sequelize query interface
 * @param {Array} dogs - Array of dog objects from SQL dump
 * @param {Array} breeders - Array of breeder objects from SQL dump 
 * @param {Array} users - Array of user objects from SQL dump
 * @param {Map} breedMap - Map of breed names to IDs
 * @param {Map} ownerMap - Map of owner emails to IDs
 * @returns {Object} - Maps for dogIds and registration numbers
 */
async function migrateDogs(queryInterface, dogs, breeders, users, breedMap, ownerMap) {
  console.log('Creating dogs...');
  
  // Check for existing dogs to avoid duplicates
  const existingDogs = await queryInterface.sequelize.query(
    'SELECT id, "registration_number", "registrationNumber" FROM "Dogs" WHERE "registration_number" IS NOT NULL OR "registrationNumber" IS NOT NULL',
    { type: queryInterface.sequelize.QueryTypes.SELECT }
  );
  
  // Create maps for existing dogs
  const existingRegNumbers = new Set();
  const registrationToIdMap = new Map();
  
  existingDogs.forEach(dog => {
    // Handle both snake_case and camelCase column variants
    const regNumber = dog.registration_number || dog.registrationNumber;
    if (regNumber) {
      existingRegNumbers.add(regNumber);
      registrationToIdMap.set(regNumber, dog.id);
    }
  });
  
  const dogRecords = [];
  const oldDogIdMap = new Map(); // Map old dog IDs to new dog IDs
  
  for (const dog of dogs) {
    // Skip dogs that already exist (by registration number)
    if (dog.registration_number && existingRegNumbers.has(dog.registration_number)) {
      console.log(`Skipping dog with registration number ${dog.registration_number} as it already exists`);
      const existingId = registrationToIdMap.get(dog.registration_number);
      if (existingId) {
        oldDogIdMap.set(parseInt(dog.id), existingId);
      }
      continue;
    }
    
    // Find the breed ID based on breeder data or use default
    let breedId = null;
    if (dog.breeder_id) {
      const breeder = breeders.find(b => b.id === dog.breeder_id);
      if (breeder && breeder.name) {
        breedId = breedMap.get(breeder.name.toLowerCase());
      }
    }
    
    // Find the owner ID
    let ownerId = null;
    if (dog.user_id) {
      const user = users.find(u => u.id === dog.user_id);
      if (user && user.email) {
        ownerId = ownerMap.get(user.email.toLowerCase());
      }
    }
    
    // Generate sequence number for the dog ID
    const newDogId = await getNextDogId(queryInterface);
    
    oldDogIdMap.set(parseInt(dog.id), newDogId); // Map old ID to new ID
    
    // If the dog has a registration number, map it to the ID
    if (dog.registration_number) {
      registrationToIdMap.set(dog.registration_number, newDogId);
      existingRegNumbers.add(dog.registration_number);
    }
    
    // Create record with both snake_case and camelCase versions
    // to support the database schema which has both
    dogRecords.push({
      id: newDogId,
      name: dog.name || `Dog_${dog.id}`,
      breed: dog.breeder_id ? (breeders.find(b => b.id === dog.breeder_id)?.name || null) : null,
      breed_id: breedId,
      breedId: breedId, // camelCase version
      gender: (dog.sex && (dog.sex.toLowerCase() === 'male' || dog.sex.toLowerCase() === 'female')) 
        ? dog.sex.toLowerCase() 
        : (Math.random() > 0.5 ? 'male' : 'female'), // Default to random gender if invalid
      date_of_birth: parseDate(dog.dob),
      dateOfBirth: parseDate(dog.dob), // camelCase version
      date_of_death: dog.dead ? new Date() : null,
      dateOfDeath: dog.dead ? new Date() : null, // camelCase version
      color: dog.colour || '',
      registration_number: dog.registration_number || '',
      registrationNumber: dog.registration_number || '', // camelCase version
      microchip_number: dog.microchip_number || '',
      microchipNumber: dog.microchip_number || '', // camelCase version
      titles: dog.titles || '',
      is_neutered: false, // Default value
      isNeutered: false, // camelCase version
      height: dog.height ? parseFloat(dog.height) : null,
      weight: null, // Not mapped
      biography: '',
      main_image_url: dog.image_name ? `https://legacy-kennel-union.example.com/images/${dog.image_name}` : null,
      mainImageUrl: dog.image_name ? `https://legacy-kennel-union.example.com/images/${dog.image_name}` : null, // camelCase version
      sire_id: null, // Will be updated after all dogs are inserted
      sireId: null, // camelCase version
      dam_id: null, // Will be updated after all dogs are inserted
      damId: null, // camelCase version
      created_at: parseDate(dog.created_at),
      createdAt: parseDate(dog.created_at), // camelCase version
      updated_at: parseDate(dog.updated_at),
      updatedAt: parseDate(dog.updated_at) // camelCase version
    });
  }
  
  // Bulk insert all dogs
  if (dogRecords.length > 0) {
    console.log(`Inserting ${dogRecords.length} new dogs...`);
    await queryInterface.bulkInsert('Dogs', dogRecords, {});
  } else {
    console.log('No new dogs to insert.');
  }
  
  return {
    oldDogIdMap,
    registrationToIdMap
  };
}

/**
 * Gets the next available dog ID from the sequence
 */
async function getNextDogId(queryInterface) {
  try {
    const result = await queryInterface.sequelize.query(
      'SELECT nextval(\'"Dogs_id_seq"\')',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    return result[0].nextval;
  } catch (error) {
    console.error('Error getting next Dog ID:', error);
    // Fallback to a random ID if sequence doesn't exist
    return Math.floor(Math.random() * 1000000) + 1;
  }
}

module.exports = {
  migrateDogs
};
