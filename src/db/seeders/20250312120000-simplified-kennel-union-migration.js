'use strict';
const fs = require('fs');
const path = require('path');

/**
 * Simplified Kennel Union data migration
 * Uses only snake_case column names matching the database schema
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('Starting simplified Kennel Union data migration...');
      
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
      const users = extractDataFromSql(sqlContent, 'users');
      const breeders = extractDataFromSql(sqlContent, 'breeders');
      const dogs = extractDataFromSql(sqlContent, 'dogs');
      const dogRelationships = extractDataFromSql(sqlContent, 'dog_relationships');
      
      // 2. Process the data in sequential steps
      
      // 2.1. First, fetch existing breeds to avoid duplicates
      console.log('Fetching existing breeds...');
      const existingBreeds = await queryInterface.sequelize.query(
        'SELECT id, name FROM "Breeds"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      const breedMap = new Map();
      existingBreeds.forEach(breed => {
        breedMap.set(breed.name.toLowerCase(), breed.id);
      });
      
      console.log(`Found ${existingBreeds.length} existing breeds`);
      
      // 2.2. Create new breeds if needed
      const newBreeds = [];
      for (const breeder of breeders) {
        if (breeder.name && !breedMap.has(breeder.name.toLowerCase())) {
          newBreeds.push({
            name: breeder.name,
            description: 'Imported from Kennel Union data',
            origin: 'Unknown',
            average_lifespan: null,
            average_height: null,
            average_weight: null,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
      
      if (newBreeds.length > 0) {
        console.log(`Creating ${newBreeds.length} new breeds...`);
        await queryInterface.bulkInsert('Breeds', newBreeds, {});
        
        // Refresh the breed map
        const allBreeds = await queryInterface.sequelize.query(
          'SELECT id, name FROM "Breeds"',
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        
        allBreeds.forEach(breed => {
          breedMap.set(breed.name.toLowerCase(), breed.id);
        });
      } else {
        console.log('No new breeds to create');
      }
      
      // 2.3. Fetch existing owners to avoid duplicates
      console.log('Fetching existing owners...');
      const existingOwners = await queryInterface.sequelize.query(
        'SELECT id, email, contact_email FROM "Owners"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      const ownerMap = new Map();
      existingOwners.forEach(owner => {
        const email = owner.email || owner.contact_email;
        if (email) {
          ownerMap.set(email.toLowerCase(), owner.id);
        }
      });
      
      console.log(`Found ${existingOwners.length} existing owners`);
      
      // 2.4. Create new owners if needed
      const newOwners = [];
      for (const user of users) {
        const email = user.email || `user_${user.id}@example.com`;
        if (!ownerMap.has(email.toLowerCase())) {
          newOwners.push({
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: email,
            contact_email: email,
            phone_number: user.phone || '',
            address_line1: '',
            city: '',
            state: '',
            postal_code: '',
            is_breeder: user.kennel_name ? true : false,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
      
      if (newOwners.length > 0) {
        console.log(`Creating ${newOwners.length} new owners...`);
        await queryInterface.bulkInsert('Owners', newOwners, {});
        
        // Refresh the owner map
        const allOwners = await queryInterface.sequelize.query(
          'SELECT id, email, contact_email FROM "Owners"',
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        
        allOwners.forEach(owner => {
          const email = owner.email || owner.contact_email;
          if (email) {
            ownerMap.set(email.toLowerCase(), owner.id);
          }
        });
      } else {
        console.log('No new owners to create');
      }
      
      // 2.5. Fetch existing dogs to avoid duplicates
      console.log('Fetching existing dogs...');
      const existingDogs = await queryInterface.sequelize.query(
        'SELECT id, registration_number FROM "Dogs" WHERE registration_number IS NOT NULL',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      const existingRegNumbers = new Set();
      const registrationToIdMap = new Map();
      
      existingDogs.forEach(dog => {
        if (dog.registration_number) {
          existingRegNumbers.add(dog.registration_number);
          registrationToIdMap.set(dog.registration_number, dog.id);
        }
      });
      
      console.log(`Found ${existingDogs.length} existing dogs with registration numbers`);
      
      // 2.6. Create new dogs
      const newDogs = [];
      const oldIdToNewIdMap = new Map();
      
      // Helper function to safely truncate strings
      const safeString = (str, maxLength = 250) => {
        if (!str) return null;
        return str.substring(0, maxLength);
      };
      
      for (const dog of dogs) {
        // Skip if already exists
        if (dog.registration_number && existingRegNumbers.has(dog.registration_number)) {
          // Record the mapping for existing dogs
          oldIdToNewIdMap.set(dog.id, registrationToIdMap.get(dog.registration_number));
          continue;
        }
        
        // Find breed ID if available
        let breedId = null;
        if (dog.breeder_id) {
          const breeder = breeders.find(b => b.id === dog.breeder_id);
          if (breeder && breeder.name) {
            breedId = breedMap.get(breeder.name.toLowerCase());
          }
        }
        
        // Ensure we have a valid date of birth
        let dob = null;
        try {
          dob = dog.dob ? new Date(dog.dob) : new Date();
          if (isNaN(dob.getTime())) {
            dob = new Date();
          }
        } catch (e) {
          dob = new Date();
        }
        
        // Get the next ID from the sequence
        const nextDogIdResult = await queryInterface.sequelize.query(
          'SELECT nextval(\'"Dogs_id_seq"\')',
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );
        
        const newDogId = nextDogIdResult[0].nextval;
        
        // Map old ID to new ID
        oldIdToNewIdMap.set(dog.id, newDogId);
        
        // Map registration number to ID if available
        if (dog.registration_number) {
          registrationToIdMap.set(dog.registration_number, newDogId);
        }
        
        // Ensure we always have a breed name (required field)
        let breedName = null;
        if (dog.breeder_id) {
          breedName = breeders.find(b => b.id === dog.breeder_id)?.name;
        }
        // If we couldn't find a breed name from breeder_id, use a default
        if (!breedName) {
          breedName = "Unknown Breed";
        }
        
        // Ensure we have valid numeric values
        let height = null;
        if (dog.height) {
          const parsedHeight = parseFloat(dog.height);
          if (!isNaN(parsedHeight)) {
            height = parsedHeight;
          }
        }
        
        // Format titles correctly - ensuring we don't exceed VARCHAR(255) limits
        let titlesValue = null;
        if (dog.titles) {
          // Format as proper PostgreSQL array - titles is defined as string[] in the model
          const titlesList = dog.titles.split(',').map(t => t.trim());
          // Truncate each title to prevent exceeding limits
          const limitedTitles = titlesList.map(t => t.substring(0, 30));
          // Format as proper PostgreSQL array string that Sequelize will recognize
          titlesValue = limitedTitles;
        }
        
        newDogs.push({
          id: newDogId,
          name: safeString(dog.name, 100) || `Dog ${newDogId}`,
          breed: safeString(breedName, 100), // Always provide a breed name (required)
          breed_id: breedId,
          gender: dog.sex?.toLowerCase() === 'male' ? 'male' : (dog.sex?.toLowerCase() === 'female' ? 'female' : 'unknown'),
          date_of_birth: dob,
          date_of_death: dog.dead === '1' ? new Date() : null,
          color: safeString(dog.colour, 50),
          registration_number: safeString(dog.registration_number, 50),
          microchip_number: safeString(dog.microchip_number, 50),
          titles: titlesValue,
          is_neutered: false,
          height: height, // Use the validated height value
          weight: null,
          biography: null,
          main_image_url: safeString(dog.image_name ? `https://example.com/images/${dog.image_name}` : null, 250),
          sire_id: null, // Will be updated later
          dam_id: null, // Will be updated later
          created_at: new Date(),
          updated_at: new Date()
        });
      }
      
      if (newDogs.length > 0) {
        console.log(`Creating ${newDogs.length} new dogs...`);
        await queryInterface.bulkInsert('Dogs', newDogs, {});
      } else {
        console.log('No new dogs to create');
      }
      
      // 2.7. Update dog relationships (parents)
      console.log('Updating dog relationships...');
      const relationshipUpdates = [];
      
      for (const relationship of dogRelationships) {
        const dogId = oldIdToNewIdMap.get(relationship.dog_id);
        
        if (!dogId) {
          continue; // Skip if we don't have this dog
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
          relationshipUpdates.push({
            dogId,
            sireId,
            damId
          });
        }
      }
      
      if (relationshipUpdates.length > 0) {
        console.log(`Updating ${relationshipUpdates.length} parent relationships...`);
        
        for (const update of relationshipUpdates) {
          await queryInterface.sequelize.query(`
            UPDATE "Dogs" 
            SET 
              sire_id = ${update.sireId ? update.sireId : 'NULL'},
              dam_id = ${update.damId ? update.damId : 'NULL'}
            WHERE id = ${update.dogId}
          `);
        }
      } else {
        console.log('No parent relationships to update');
      }
      
      // 2.8. Create ownership records
      console.log('Creating ownership records...');
      const existingOwnerships = await queryInterface.sequelize.query(
        'SELECT dog_id, owner_id FROM "Ownerships"',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      const existingOwnershipKeys = new Set();
      existingOwnerships.forEach(ownership => {
        existingOwnershipKeys.add(`${ownership.dog_id}-${ownership.owner_id}`);
      });
      
      const newOwnerships = [];
      
      for (const dog of dogs) {
        if (!dog.user_id) continue;
        
        const dogId = oldIdToNewIdMap.get(dog.id);
        if (!dogId) continue;
        
        const user = users.find(u => u.id === dog.user_id);
        if (!user || !user.email) continue;
        
        const ownerId = ownerMap.get(user.email.toLowerCase());
        if (!ownerId) continue;
        
        const ownershipKey = `${dogId}-${ownerId}`;
        if (existingOwnershipKeys.has(ownershipKey)) continue;
        
        newOwnerships.push({
          dog_id: dogId,
          owner_id: ownerId,
          is_current: true,
          is_active: true, // Column alias for is_current
          start_date: new Date(),
          end_date: null,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        existingOwnershipKeys.add(ownershipKey);
      }
      
      if (newOwnerships.length > 0) {
        console.log(`Creating ${newOwnerships.length} ownership records...`);
        await queryInterface.bulkInsert('Ownerships', newOwnerships, {});
      } else {
        console.log('No new ownership records to create');
      }
      
      console.log('Kennel Union data migration completed successfully!');
    } catch (error) {
      console.error('Error during kennel union data migration:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // No-op to protect data
    console.log('Note: down migration is a no-op to protect data');
  }
};

/**
 * Helper function to extract data from SQL dump
 */
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
