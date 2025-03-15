'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const { processSqlFileInBatches } = require('../utils/backgroundMigration');
const config = require('../../config/database');

// Initialize Sequelize
const sequelize = new Sequelize(config.development);

// Maps to keep track of relationships and existing records
const existingDogsMap = new Map();
const registrationToIdMap = new Map();

/**
 * Format a date object for SQL
 */
function formatDate(date) {
  if (!date) return null;
  return date.toISOString();
}

/**
 * Format array for Postgres insertion
 */
function formatPostgresArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return JSON.stringify(arr).replace(/"/g, '\\"');
}

/**
 * Sanitize string to prevent SQL injection and ensure proper length
 */
function sanitizeString(str, maxLength = 255) {
  if (!str) return null;
  let sanitized = String(str)
    .replace(/'/g, "''")
    .substring(0, maxLength);
  return sanitized;
}

/**
 * Process dog records from Kennel Union data
 */
async function processDogs(dogs) {
  if (!dogs || dogs.length === 0) return [];
  
  const newDogs = [];
  
  // Check which columns exist to handle column naming inconsistencies
  const [columnResults] = await sequelize.query(
    `SELECT column_name FROM information_schema.columns 
     WHERE table_name = 'Dogs' 
     AND column_name IN ('date_of_birth', 'dateOfBirth')`,
    { type: Sequelize.QueryTypes.SELECT }
  );
  
  const columnNames = Array.isArray(columnResults) 
    ? columnResults.map(col => col.column_name) 
    : [columnResults?.column_name].filter(Boolean);
  
  console.log('Dog date columns:', columnNames);
  
  // Find all breeds for mapping
  const [breeds] = await sequelize.query(
    `SELECT id, name FROM "Breeds"`,
    { type: Sequelize.QueryTypes.SELECT }
  );
  
  const breedMap = new Map();
  if (Array.isArray(breeds)) {
    breeds.forEach(breed => {
      breedMap.set(breed.name.toLowerCase(), breed.id);
    });
  }
  
  // Process each dog record
  for (const dog of dogs) {
    // Skip if no registration number 
    if (!dog.registration_number) {
      continue;
    }
    
    // Skip if already processed this registration number
    if (existingDogsMap.has(dog.registration_number)) {
      continue;
    }
    
    // Generate a new ID for this dog
    const [nextIdResult] = await sequelize.query(
      `SELECT nextval('"Dogs_id_seq"') as id`
    );
    const newDogId = parseInt(nextIdResult[0].id, 10);
    
    // Find breed ID if available
    let breedId = null;
    let breedName = "Unknown Breed";
    
    if (dog.breeder_id) {
      const breedMatch = dog.breeder_id.match(/([a-z0-9\-]+)$/);
      if (breedMatch) {
        const breedSearch = breedMatch[1].replace(/-/g, ' ');
        
        // Look for breed by similar name
        for (const [key, id] of breedMap.entries()) {
          if (key.includes(breedSearch.toLowerCase())) {
            breedId = id;
            breedName = key;
            break;
          }
        }
      }
    }
    
    // Parse date of birth (dob) - ensure it's never null for GraphQL compatibility
    let dobDate = null;
    try {
      if (dog.dob) {
        dobDate = new Date(dog.dob);
        if (isNaN(dobDate.getTime())) {
          dobDate = null;
        }
      }
    } catch (e) {
      dobDate = null;
    }
    
    // Use a fallback date of birth if it's null (GraphQL requires non-null)
    if (!dobDate) {
      // Use current date minus 5 years as a reasonable default
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() - 5);
      dobDate = defaultDate;
    }
    
    // Format titles as a proper array
    let titlesValue = null;
    if (dog.titles) {
      try {
        let titlesList = [];
        if (typeof dog.titles === 'string') {
          if (dog.titles.startsWith('[') || dog.titles.startsWith('{')) {
            try {
              const parsed = JSON.parse(dog.titles.replace(/\\/g, ''));
              titlesList = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              titlesList = dog.titles.split(',').map(t => t.trim());
            }
          } else {
            titlesList = dog.titles.split(',').map(t => t.trim());
          }
        } else if (Array.isArray(dog.titles)) {
          titlesList = dog.titles;
        }
        
        const limitedTitles = titlesList.map(t => String(t).substring(0, 30));
        titlesValue = formatPostgresArray(limitedTitles);
      } catch (e) {
        console.warn(`Error formatting titles for dog ${dog.registration_number}`);
      }
    }
    
    // Create the dog record with all needed columns (both snake_case and camelCase)
    const dogRecord = {
      id: newDogId,
      name: sanitizeString(dog.name, 100) || `Dog ${newDogId}`,
      breed: sanitizeString(breedName, 100),
      breed_id: breedId,
      breedId: breedId,
      gender: dog.sex?.toLowerCase() === 'male' ? 'male' : (dog.sex?.toLowerCase() === 'female' ? 'female' : 'unknown'),
      date_of_birth: dobDate,
      dateOfBirth: dobDate,
      date_of_death: dog.dead === '1' ? new Date() : null,
      dateOfDeath: dog.dead === '1' ? new Date() : null,
      color: sanitizeString(dog.colour, 50),
      registration_number: sanitizeString(dog.registration_number, 50),
      registrationNumber: sanitizeString(dog.registration_number, 50),
      microchip_number: sanitizeString(dog.microchip_number, 50),
      microchipNumber: sanitizeString(dog.microchip_number, 50),
      titles: titlesValue,
      is_neutered: false,
      isNeutered: false,
      height: parseFloat(dog.height) || null,
      weight: null,
      biography: null,
      main_image_url: dog.image_name ? `https://example.com/images/${sanitizeString(dog.image_name, 250)}` : null,
      mainImageUrl: dog.image_name ? `https://example.com/images/${sanitizeString(dog.image_name, 250)}` : null,
      sire_id: null, // Will be updated later
      sireId: null,
      dam_id: null, // Will be updated later
      damId: null,
      created_at: new Date(),
      createdAt: new Date(),
      updated_at: new Date(),
      updatedAt: new Date()
    };
    
    newDogs.push(dogRecord);
    
    // Update maps for relationships
    existingDogsMap.set(dog.registration_number, newDogId);
    if (dog.id) {
      registrationToIdMap.set(dog.id, newDogId);
    }
  }
  
  // Insert all dogs in batches
  if (newDogs.length > 0) {
    console.log(`Creating ${newDogs.length} new dog records`);
    
    // Get all column names to ensure we only insert valid columns
    const [allColumnResults] = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'Dogs'`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const validColumns = Array.isArray(allColumnResults) 
      ? allColumnResults.map(col => col.column_name) 
      : [];
    
    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < newDogs.length; i += batchSize) {
      const batch = newDogs.slice(i, i + batchSize);
      
      for (const dog of batch) {
        try {
          // Filter out invalid columns
          const validDog = {};
          Object.keys(dog).forEach(key => {
            if (validColumns.includes(key)) {
              validDog[key] = dog[key];
            }
          });
          
          const columnNames = Object.keys(validDog).map(col => `"${col}"`).join(', ');
          const placeholders = Object.keys(validDog).map((_, i) => `$${i + 1}`).join(', ');
          const values = Object.values(validDog);
          
          await sequelize.query(
            `INSERT INTO "Dogs" (${columnNames}) VALUES (${placeholders})`,
            { 
              bind: values,
              type: Sequelize.QueryTypes.INSERT 
            }
          );
        } catch (error) {
          console.error(`Error inserting dog ${dog.registration_number}: ${error.message}`);
        }
      }
      
      console.log(`Processed batch ${i/batchSize + 1} of ${Math.ceil(newDogs.length/batchSize)}`);
    }
  }
  
  return newDogs;
}

/**
 * Process parent-child relationships for dogs
 */
async function processRelationships(dogs) {
  console.log('Processing dog relationships...');
  
  const updates = [];
  
  for (const dog of dogs) {
    // Skip if no registration number
    if (!dog.registration_number) {
      continue;
    }
    
    // Get the new ID for this dog
    const dogId = existingDogsMap.get(dog.registration_number);
    if (!dogId) {
      continue;
    }
    
    // Find parent IDs
    let sireId = null;
    let damId = null;
    
    if (dog.sire_reg) {
      sireId = existingDogsMap.get(dog.sire_reg);
    }
    
    if (dog.dam_reg) {
      damId = existingDogsMap.get(dog.dam_reg);
    }
    
    // Skip if no parent relationships
    if (!sireId && !damId) {
      continue;
    }
    
    // Add update
    updates.push({
      id: dogId,
      sire_id: sireId,
      sireId: sireId,
      dam_id: damId,
      damId: damId
    });
  }
  
  // Execute updates in batches
  if (updates.length > 0) {
    console.log(`Updating ${updates.length} dog relationships`);
    
    for (const update of updates) {
      try {
        // Update both snake_case and camelCase fields
        await sequelize.query(
          `UPDATE "Dogs" 
           SET sire_id = $1, dam_id = $2, "sireId" = $1, "damId" = $2, updated_at = NOW(), "updatedAt" = NOW()
           WHERE id = $3`,
          { 
            bind: [update.sire_id, update.dam_id, update.id],
            type: Sequelize.QueryTypes.UPDATE 
          }
        );
      } catch (error) {
        console.error(`Error updating dog relationships for ID ${update.id}: ${error.message}`);
      }
    }
  }
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('Starting Kennel Union data migration...');
      
      // Ensure some basic breed data exists
      await queryInterface.bulkInsert('Breeds', [
        { name: 'Labrador Retriever', group: 'Sporting', origin: 'Canada', description: 'Friendly, active, outgoing', created_at: new Date(), updated_at: new Date() },
        { name: 'German Shepherd', group: 'Herding', origin: 'Germany', description: 'Confident, courageous, smart', created_at: new Date(), updated_at: new Date() },
        { name: 'Golden Retriever', group: 'Sporting', origin: 'Scotland', description: 'Friendly, intelligent, devoted', created_at: new Date(), updated_at: new Date() },
        { name: 'French Bulldog', group: 'Non-Sporting', origin: 'France', description: 'Playful, adaptable, smart', created_at: new Date(), updated_at: new Date() },
        { name: 'Bulldog', group: 'Non-Sporting', origin: 'England', description: 'Friendly, courageous, calm', created_at: new Date(), updated_at: new Date() },
        { name: 'Unknown Breed', group: 'Mixed', origin: 'Various', description: 'Various characteristics', created_at: new Date(), updated_at: new Date() }
      ]);
      
      // Path to your SQL dump
      const sqlFilePath = path.join(__dirname, '../../../data/kennel_union.sql');
      
      // Process the SQL file in batches
      const { dogsData } = await processSqlFileInBatches(sqlFilePath, 'dogs');
      
      // Process dogs
      const processedDogs = await processDogs(dogsData);
      
      // Process relationships after all dogs are created
      if (processedDogs.length > 0) {
        await processRelationships(dogsData);
      }
      
      console.log('Kennel Union data migration completed successfully.');
    } catch (error) {
      console.error('Error during Kennel Union data migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No downgrade possible for data migrations
  }
};
