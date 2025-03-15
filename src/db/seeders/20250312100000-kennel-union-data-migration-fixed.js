'use strict';

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

/**
 * This seeder migrates data from the kennel-union.sql dump to our current database structure
 */

// Helper function to extract data from SQL dump
function extractDataFromSql(sqlContent, tableName) {
  console.log(`Extracting data for table: ${tableName}`);
  
  // Find the INSERT statements for this table
  const tableInsertRegex = new RegExp(`INSERT INTO \`${tableName}\` \\(([^)]+)\\) VALUES\\s*\\(([\\s\\S]*?)\\);`, 'g');
  
  let result = [];
  let match;
  
  // Get column names from the first match
  let columnMatch = new RegExp(`INSERT INTO \`${tableName}\` \\(([^)]+)\\)`, 'g').exec(sqlContent);
  
  if (!columnMatch) {
    console.log(`No INSERT statement found for table ${tableName}`);
    return [];
  }
  
  const columns = columnMatch[1].split(',').map(col => col.replace(/`/g, '').trim());
  console.log(`Found columns for ${tableName}:`, columns);
  
  // Find all value sets
  const valuePattern = new RegExp(`INSERT INTO \`${tableName}\` [^)]+\\) VALUES\\s*([\\s\\S]*?)(?:;|$)`, 'g');
  
  while ((match = valuePattern.exec(sqlContent)) !== null) {
    // The entire VALUES block which may contain multiple value sets
    const valuesBlock = match[1];
    
    // Split the value block by '),(' to get individual value sets
    const valueSets = valuesBlock.split('),(');
    
    for (let i = 0; i < valueSets.length; i++) {
      let valueSet = valueSets[i];
      
      // Clean up first and last value sets
      if (i === 0) valueSet = valueSet.replace(/^\(/, '');
      if (i === valueSets.length - 1) valueSet = valueSet.replace(/\);$/, '');
      
      // Now we have a clean set of values like: 'value1','value2',...
      const values = [];
      let currentValue = '';
      let inString = false;
      
      for (let j = 0; j < valueSet.length; j++) {
        const char = valueSet[j];
        
        if (char === "'" && (j === 0 || valueSet[j-1] !== '\\')) {
          inString = !inString;
          currentValue += char;
        } else if (char === ',' && !inString) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      if (currentValue) {
        values.push(currentValue.trim());
      }
      
      // Create object
      const obj = {};
      columns.forEach((col, idx) => {
        let value = values[idx] || null;
        
        // Clean up strings
        if (value && value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1).replace(/\\'/g, "'");
        }
        
        // Convert NULL string to null value
        if (value === 'NULL') {
          value = null;
        }
        
        obj[col] = value;
      });
      
      result.push(obj);
    }
  }
  
  console.log(`Extracted ${result.length} records from ${tableName}`);
  
  // Debug: show a sample record
  if (result.length > 0) {
    console.log(`Sample record for ${tableName}:`, JSON.stringify(result[0]));
  }
  
  return result;
}

// Function to validate and clean a date string
function parseDate(dateStr) {
  if (!dateStr) return new Date();
  
  // Check if the date string has a trailing closing parenthesis and remove it
  if (dateStr.endsWith("')")) {
    dateStr = dateStr.slice(0, -2);
  }
  
  try {
    const date = new Date(dateStr);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return new Date();
    }
    return date;
  } catch (e) {
    return new Date();
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Read the SQL file
      const sqlPath = path.resolve(__dirname, '../../../kennel-union.sql');
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      
      // Extract data from the SQL dump
      console.log('Extracting users data...');
      const users = extractDataFromSql(sqlContent, 'users');
      
      console.log('Extracting breeders data...');
      const breeders = extractDataFromSql(sqlContent, 'breeders');
      
      console.log('Extracting dogs data...');
      const dogs = extractDataFromSql(sqlContent, 'dogs');
      
      console.log('Extracting dog relationships data...');
      const dogRelationships = extractDataFromSql(sqlContent, 'dog_relationships');
      
      // Step 1: Create or fetch Breeds
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
      
      // Step 2: Create Users/Owners based on users data
      console.log('Creating owners...');
      
      // First, check for existing owners to avoid duplicates
      const existingOwners = await queryInterface.sequelize.query(
        'SELECT id, email FROM "Owners"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      // Create a map of existing owner emails
      const existingOwnerEmails = new Set();
      const ownerMap = new Map();
      
      existingOwners.forEach(owner => {
        if (owner.email) {
          existingOwnerEmails.add(owner.email.toLowerCase());
          ownerMap.set(owner.email.toLowerCase(), owner.id);
        }
      });
      
      // Filter out owners that already exist
      const newOwnerRecords = [];
      if (users.length > 0) {
        for (const user of users) {
          const email = user.email || `user_${user.id}@example.com`;
          if (!existingOwnerEmails.has(email.toLowerCase())) {
            newOwnerRecords.push({
              name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
              first_name: user.first_name || '',
              last_name: user.last_name || '',
              email: email,
              contact_email: email,
              phone_number: user.phone || '',
              contact_phone: user.phone || '',
              address: user.address || '',
              address_line1: user.address || '',
              city: user.city || '',
              state: user.state || '',
              postal_code: user.postal_code || '',
              is_breeder: user.kennel_name ? true : false,
              user_id: null, // We're not creating user accounts in this migration
              created_at: parseDate(user.created_at),
              updated_at: parseDate(user.updated_at)
            });
            
            // Add to our existing set to prevent duplicates
            existingOwnerEmails.add(email.toLowerCase());
          }
        }
      }
      
      // Insert new owners
      if (newOwnerRecords.length > 0) {
        console.log(`Inserting ${newOwnerRecords.length} new owners...`);
        await queryInterface.bulkInsert('Owners', newOwnerRecords, {});
      } else {
        console.log('No new owners to insert.');
      }
      
      // Fetch all owners again to get fresh IDs
      const allOwners = await queryInterface.sequelize.query(
        'SELECT id, email FROM "Owners"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      // Update the owner map with all owners
      allOwners.forEach(owner => {
        if (owner.email) {
          ownerMap.set(owner.email.toLowerCase(), owner.id);
        }
      });
      
      // Step 3: Create Dogs based on dogs data
      console.log('Creating dogs...');
      
      // Check for existing dogs to avoid duplicates
      const existingDogs = await queryInterface.sequelize.query(
        'SELECT id, registration_number FROM "Dogs" WHERE registration_number IS NOT NULL',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      // Create maps for existing dogs
      const existingRegNumbers = new Set();
      const registrationToUuidMap = new Map();
      
      existingDogs.forEach(dog => {
        if (dog.registration_number) {
          existingRegNumbers.add(dog.registration_number);
          registrationToUuidMap.set(dog.registration_number, dog.id);
        }
      });
      
      const dogRecords = [];
      const dogIdMap = new Map(); // Map old dog IDs to new dog IDs
      
      for (const dog of dogs) {
        // Skip dogs that already exist (by registration number)
        if (dog.registration_number && existingRegNumbers.has(dog.registration_number)) {
          console.log(`Skipping dog with registration number ${dog.registration_number} as it already exists`);
          const existingUuid = registrationToUuidMap.get(dog.registration_number);
          if (existingUuid) {
            dogIdMap.set(parseInt(dog.id), existingUuid);
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
        
        const newDogId = uuidv4(); // Generate a new UUID for the dog
        
        dogIdMap.set(parseInt(dog.id), newDogId); // Map old ID to new ID
        
        // If the dog has a registration number, map it to the UUID
        if (dog.registration_number) {
          registrationToUuidMap.set(dog.registration_number, newDogId);
          existingRegNumbers.add(dog.registration_number);
        }
        
        dogRecords.push({
          id: newDogId,
          name: dog.name || `Dog_${dog.id}`,
          breed: dog.breeder_id ? (breeders.find(b => b.id === dog.breeder_id)?.name || null) : null,
          breed_id: breedId,
          gender: (dog.sex && (dog.sex.toLowerCase() === 'male' || dog.sex.toLowerCase() === 'female')) 
            ? dog.sex.toLowerCase() 
            : (Math.random() > 0.5 ? 'male' : 'female'), // Default to random gender if invalid
          date_of_birth: parseDate(dog.dob),
          date_of_death: dog.dead ? new Date() : null,
          color: dog.colour || '',
          registration_number: dog.registration_number || '',
          microchip_number: dog.microchip_number || '',
          titles: dog.titles || '',
          is_neutered: false, // Default value
          height: dog.height ? parseFloat(dog.height) : null,
          weight: null, // Not mapped
          biography: '',
          main_image_url: dog.image_name ? `https://legacy-kennel-union.example.com/images/${dog.image_name}` : null,
          sire_id: null, // Will be updated after all dogs are inserted
          dam_id: null, // Will be updated after all dogs are inserted
          created_at: parseDate(dog.created_at),
          updated_at: parseDate(dog.updated_at)
        });
      }
      
      // Bulk insert all dogs
      if (dogRecords.length > 0) {
        console.log(`Inserting ${dogRecords.length} new dogs...`);
        await queryInterface.bulkInsert('Dogs', dogRecords, {});
      } else {
        console.log('No new dogs to insert.');
      }
      
      // Step 4: Update parent-child relationships based on registration numbers
      console.log('Updating parent-child relationships based on registration numbers...');
      
      // Create a map of dogs that need their parents updated
      const dogParentUpdates = [];
      
      for (const relationship of dogRelationships) {
        const dogId = dogIdMap.get(parseInt(relationship.dog_id));
        if (!dogId) continue;
        
        // Get father and mother registration numbers
        const fatherRegNum = relationship.father;
        const motherRegNum = relationship.mother;
        
        let sireId = null;
        let damId = null;
        
        // Find sire by registration number
        if (fatherRegNum && fatherRegNum.trim() !== '') {
          // Check if we have a dog with this registration number
          sireId = registrationToUuidMap.get(fatherRegNum);
          
          if (!sireId) {
            // We need to create a new dog as the sire
            sireId = uuidv4();
            await queryInterface.bulkInsert('Dogs', [{
              id: sireId,
              name: fatherRegNum, // Use registration number as name if no better name available
              registration_number: fatherRegNum,
              gender: 'male', // Sires are male
              created_at: new Date(),
              updated_at: new Date()
            }], {});
            
            // Add to our map
            registrationToUuidMap.set(fatherRegNum, sireId);
          }
        }
        
        // Find dam by registration number
        if (motherRegNum && motherRegNum.trim() !== '') {
          // Check if we have a dog with this registration number
          damId = registrationToUuidMap.get(motherRegNum);
          
          if (!damId) {
            // We need to create a new dog as the dam
            damId = uuidv4();
            await queryInterface.bulkInsert('Dogs', [{
              id: damId,
              name: motherRegNum, // Use registration number as name if no better name available
              registration_number: motherRegNum,
              gender: 'female', // Dams are female
              created_at: new Date(),
              updated_at: new Date()
            }], {});
            
            // Add to our map
            registrationToUuidMap.set(motherRegNum, damId);
          }
        }
        
        // Update the dog with parents if we found or created any
        if (sireId || damId) {
          const updateValues = {};
          if (sireId) updateValues.sire_id = sireId;
          if (damId) updateValues.dam_id = damId;
          
          dogParentUpdates.push({
            id: dogId,
            ...updateValues
          });
        }
      }
      
      // Update all dogs with their parents in batch
      if (dogParentUpdates.length > 0) {
        console.log(`Updating ${dogParentUpdates.length} dogs with parent information...`);
        
        for (const update of dogParentUpdates) {
          await queryInterface.bulkUpdate('Dogs', 
            { sire_id: update.sire_id, dam_id: update.dam_id }, 
            { id: update.id }
          );
        }
      }
      
      // Step 5: Create ownerships records
      console.log('Creating ownerships...');
      
      // Check for existing ownerships to avoid duplicates
      const existingOwnerships = await queryInterface.sequelize.query(
        'SELECT dog_id, owner_id FROM "Ownerships"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      // Create a set to track existing ownerships
      const existingOwnershipKeys = new Set();
      existingOwnerships.forEach(ownership => {
        existingOwnershipKeys.add(`${ownership.dog_id}-${ownership.owner_id}`);
      });
      
      const ownershipRecords = [];
      
      for (const dog of dogs) {
        if (dog.user_id) {
          const user = users.find(u => u.id === dog.user_id);
          if (user && user.email) {
            const ownerId = ownerMap.get(user.email.toLowerCase());
            const dogId = dogIdMap.get(parseInt(dog.id));
            
            if (ownerId && dogId) {
              // Skip if this ownership already exists
              const ownershipKey = `${dogId}-${ownerId}`;
              if (!existingOwnershipKeys.has(ownershipKey)) {
                ownershipRecords.push({
                  dog_id: dogId,
                  owner_id: ownerId,
                  start_date: parseDate(dog.created_at),
                  end_date: null,
                  is_active: true,
                  is_current: true, // Column alias for GraphQL compatibility
                  notes: 'Imported from legacy Kennel Union system',
                  created_at: new Date(),
                  updated_at: new Date()
                });
                
                // Add to our set to prevent duplicates
                existingOwnershipKeys.add(ownershipKey);
              }
            }
          }
        }
      }
      
      if (ownershipRecords.length > 0) {
        console.log(`Inserting ${ownershipRecords.length} new ownership records...`);
        await queryInterface.bulkInsert('Ownerships', ownershipRecords, {});
      } else {
        console.log('No new ownership records to insert.');
      }
      
      // Step 6: Create health records based on available health data
      console.log('Creating health records...');
      
      // Check for existing health records to avoid duplicates (simplified check)
      const existingHealthRecords = await queryInterface.sequelize.query(
        'SELECT dog_id, record_type FROM "HealthRecords"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      // Create a set to track existing health records (by dog_id and record_type)
      const existingHealthRecordKeys = new Set();
      existingHealthRecords.forEach(record => {
        existingHealthRecordKeys.add(`${record.dog_id}-${record.record_type}`);
      });
      
      const healthRecords = [];
      
      for (const dog of dogs) {
        const dogId = dogIdMap.get(parseInt(dog.id));
        if (!dogId) continue;
        
        // Hip results
        if (dog.hip_hd_results) {
          const recordKey = `${dogId}-Hip Dysplasia Test`;
          if (!existingHealthRecordKeys.has(recordKey)) {
            healthRecords.push({
              dog_id: dogId,
              record_type: 'Hip Dysplasia Test',
              record_date: parseDate(dog.updated_at),
              date: parseDate(dog.updated_at), // Column alias
              description: `Hip Test Results: ${dog.hip_hd_results}`,
              veterinarian_name: 'Unknown',
              vet_name: 'Unknown', // Column alias
              document_url: null,
              attachments: null, // Column alias
              cost: null,
              results: dog.hip_hd_results,
              notes: 'Imported from legacy system',
              created_at: new Date(),
              updated_at: new Date()
            });
            // Add to our set to prevent duplicates
            existingHealthRecordKeys.add(recordKey);
          }
        }
        
        // Elbow results
        if (dog.elbow_ed_results) {
          const recordKey = `${dogId}-Elbow Dysplasia Test`;
          if (!existingHealthRecordKeys.has(recordKey)) {
            healthRecords.push({
              dog_id: dogId,
              record_type: 'Elbow Dysplasia Test',
              record_date: parseDate(dog.updated_at),
              date: parseDate(dog.updated_at), // Column alias
              description: `Elbow Test Results: ${dog.elbow_ed_results}`,
              veterinarian_name: 'Unknown',
              vet_name: 'Unknown', // Column alias
              document_url: null,
              attachments: null, // Column alias
              cost: null,
              results: dog.elbow_ed_results,
              notes: 'Imported from legacy system',
              created_at: new Date(),
              updated_at: new Date()
            });
            // Add to our set to prevent duplicates
            existingHealthRecordKeys.add(recordKey);
          }
        }
        
        // Other health checks
        if (dog.other_health_checks) {
          const recordKey = `${dogId}-General Health Check`;
          if (!existingHealthRecordKeys.has(recordKey)) {
            healthRecords.push({
              dog_id: dogId,
              record_type: 'General Health Check',
              record_date: parseDate(dog.updated_at),
              date: parseDate(dog.updated_at), // Column alias
              description: dog.other_health_checks,
              veterinarian_name: 'Unknown',
              vet_name: 'Unknown', // Column alias
              document_url: null,
              attachments: null, // Column alias
              cost: null,
              results: 'See description',
              notes: 'Imported from legacy system',
              created_at: new Date(),
              updated_at: new Date()
            });
            // Add to our set to prevent duplicates
            existingHealthRecordKeys.add(recordKey);
          }
        }
      }
      
      if (healthRecords.length > 0) {
        console.log(`Inserting ${healthRecords.length} new health records...`);
        await queryInterface.bulkInsert('HealthRecords', healthRecords, {});
      } else {
        console.log('No new health records to insert.');
      }
      
      console.log('Data migration from Kennel Union SQL dump completed successfully!');
    } catch (error) {
      console.error('Error in Kennel Union data migration:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Since this is a data migration, we might want to be cautious about undoing it
    try {
      console.log('Rolling back Kennel Union data migration...');
      
      // The implementation here would remove all imported data
      // For safety, we're just logging a message
      console.log('Warning: Down migration not fully implemented for data migration');
    } catch (error) {
      console.error('Error in down migration for Kennel Union data:', error);
      throw error;
    }
  }
};
