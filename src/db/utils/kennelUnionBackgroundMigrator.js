/**
 * Background migrator for Kennel Union data
 * 
 * This script migrates data from the source MySQL database
 * (using the same data source as before) to the current PostgreSQL database.
 * 
 * Changes:
 *  - Uses Sequelize’s queryInterface.bulkInsert() to perform batch inserts.
 *  - Reads from the MySQL source via mysql2/promise.
 *  - Maintains a global map for deferred sire/dam relationship updates.
 *  - Uses helper functions for UUID validation and string sanitation.
 * 
 * Note:
 *  The father and mother are stored as registration numbers in the source.
 *  The migration queries the MySQL dogs table using these registration numbers
 *  to fetch the dog id. Then, the PostgreSQL record is updated by setting
 *  the corresponding Dogs.sire_id or Dogs.dam_id fields with the target dog id.
 */

const mysql = require('mysql2/promise');
const { Sequelize, DataTypes } = require('sequelize');
const BreedModel = require('../../models/Breed'); // Import Breed model factory
const { v4: uuidv4 } = require('uuid');
const config = require('../../config/database'); // Target database config (e.g., PostgreSQL)
const fs = require('fs');
const path = require('path');

// Initialize Sequelize for the target database
const sequelize = new Sequelize(config.development);
const queryInterface = sequelize.getQueryInterface();

// Initialize the Breed model
const Breed = BreedModel(sequelize, DataTypes);

// MySQL source connection configuration
const dbConfig = {
  host: 'ls-a4266277ff1714b0362e0dc8655ff2e072bbfc43.crnprgncwu1w.eu-west-1.rds.amazonaws.com',
  user: 'dbmasteruser',
  password: "NK&8oQ]=mMy:-+tH^Hz.%`6E+5)Fo!nr",
  database: 'kennel_db',
};

// Global maps/arrays for deferred relationship processing
const registrationToIdMap = new Map(); // Maps registration number → new PostgreSQL dog id
const relationships = []; // Deferred sire/dam info

/**
 * Main migration function
 */
async function runMigration() {
  try {
    // Establish connections
    const sourceConnection = await createMySQLConnection();
    const transaction = await sequelize.transaction();

    try {
      // Debug: Log connection details
      console.log('MySQL Connection Details:', {
        host: dbConfig.host,
        user: dbConfig.user,
        database: dbConfig.database
      });

      // Migrate dogs first to populate registrationToIdMap
      const [dogColumns] = await sourceConnection.execute(`
        SHOW COLUMNS FROM dogs
      `);
      console.log('Available dog table columns:', dogColumns.map(col => col.Field).join(', '));

      const selectColumns = dogColumns
        .map(col => col.Field)
        .filter(column => [
          'id', 'name', 'dob', 'sex', 'registration_number', 
          'breeder_id', 'user_id', 'confirmed', 'colour', 
          'coat', 'microchip_number', 'created_at', 'sire', 'dam'
        ].includes(column))
        .join(', ');

      const [dogRows] = await sourceConnection.execute(`
        SELECT ${selectColumns}
        FROM dogs
      `);

      // Process dogs to populate registrationToIdMap and store any deferred relationships
      console.log(`Fetched ${dogRows.length} dog records for processing`);
      await processDogs(dogRows);

      // Fetch dog relationships with detailed logging from the source.
      console.log('Attempting to fetch dog relationships...');
      const [relRows] = await sourceConnection.query(`
        SELECT dog_id, father, mother 
        FROM dog_relationships 
        WHERE dog_id IS NOT NULL 
          AND (father IS NOT NULL OR mother IS NOT NULL)
        LIMIT 10000
      `);

      console.log('Dog Relationships Query Results:', {
        totalRows: relRows.length,
        firstRow: relRows[0] || 'No rows'
      });

      // Process relationships if any exist
      if (relRows.length > 0) {
        await processDogRelationships(relRows, sourceConnection);
      } else {
        console.warn('No dog relationships found in the source database.');
      }

      // Process deferred sire/dam relationships using the global map
      await processDeferredRelationships();

      // Commit transaction
      await transaction.commit();
      console.log('Migration completed successfully');
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      console.error('Migration failed:', error);
      throw error;
    } finally {
      // Close MySQL connection
      await sourceConnection.close();
    }
  } catch (error) {
    console.error('Migration process error:', error);
    process.exit(1);
  }
}

/**
 * Process dog records from the dogs table in MySQL.
 * Populates the registrationToIdMap with a new PostgreSQL ID for each dog,
 * and defers processing of sire/dam info.
 * @param {Array} dogs - Rows of dog records from source database
 */
async function processDogs(dogs) {
  if (!dogs || dogs.length === 0) {
    console.log('No dog records found.');
    return;
  }
  console.log(`Processing ${dogs.length} dog records...`);

  // Clear the global registrationToIdMap before processing
  registrationToIdMap.clear();

  for (const dog of dogs) {
    try {
      // Validate or generate a UUID for the dog record.
      const newDogId = validateAndSanitizeUUID(dog.id);
      
      // Generate a registration number if missing.
      const registrationNumber = dog.registration_number || 
        `${dog.sex && dog.sex.toLowerCase() === 'male' ? 'M' : 'F'}-${newDogId}`.toUpperCase();

      // Map the dog's registration number to its new PostgreSQL ID for later relationship updates.
      registrationToIdMap.set(registrationNumber, newDogId);

      // If the dog record includes sire/dam info, store it for deferred update.
      if (dog.sire) {
        relationships.push({
          dogRegNum: registrationNumber,
          relation: 'sire',
          relatedRegNum: dog.sire,  // Using registration number from MySQL
        });
      }
      if (dog.dam) {
        relationships.push({
          dogRegNum: registrationNumber,
          relation: 'dam',
          relatedRegNum: dog.dam,  // Using registration number from MySQL
        });
      }
    } catch (error) {
      console.error(`Error processing dog record ${dog.registration_number}: ${error.message}`);
    }
  }

  // Log the final state of registrationToIdMap
  console.log('Registration to ID Map after processing dogs:', {
    size: registrationToIdMap.size,
    firstFewEntries: Array.from(registrationToIdMap.entries()).slice(0, 5)
  });
}

/**
 * Process dog relationships from the dog_relationships table.
 * For each relationship record, the father (sire) and mother (dam) are handled by:
 *  - Querying the MySQL dogs table for the parent's id using the registration number.
 *  - Then querying the PostgreSQL Dogs table (using Sequelize) to obtain the target id.
 *  - Finally, updating the child dog record in PostgreSQL with the parent's id.
 * @param {Array} rels - Rows of dog relationships from source database
 * @param {Object} sourceConnection - MySQL database connection
 */
async function processDogRelationships(rels, sourceConnection) {
  // Ensure log directory exists
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const relationshipResults = {
    total: rels.length,
    processed: 0,
    skipped: 0,
    errors: [],
    details: []
  };

  console.log(`Processing ${rels.length} dog relationship records...`);

  // Ensure registrationToIdMap is populated
  console.log('Registration to ID Map size:', registrationToIdMap.size);
  if (registrationToIdMap.size === 0) {
    console.warn('Registration to ID Map is empty. This may cause issues with relationship processing.');
  }

  for (const rel of rels) {
    try {
      // Validate input
      if (!rel.dog_id || (!rel.father && !rel.mother)) {
        console.warn(`Skipping invalid relationship record: ${JSON.stringify(rel)}`);
        relationshipResults.skipped++;
        continue;
      }

      // Fetch source dog details to get registration number
      const [sourceDogRows] = await sourceConnection.query(
        'SELECT registration_number FROM dogs WHERE id = ?', 
        [rel.dog_id]
      );

      if (sourceDogRows.length === 0) {
        console.warn(`No source dog found for ID: ${rel.dog_id}`);
        relationshipResults.skipped++;
        continue;
      }

      const sourceRegistrationNumber = sourceDogRows[0].registration_number;
      console.log('Source Registration Number:', sourceRegistrationNumber);

      // Fetch the target dog record in PostgreSQL using the registration number.
      const [targetDog] = await sequelize.query(
        'SELECT id FROM "Dogs" WHERE registration_number = :regNum',
        {
          replacements: { regNum: sourceRegistrationNumber },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!targetDog) {
        console.warn(`No target dog found for registration number: ${sourceRegistrationNumber}`);
        relationshipResults.skipped++;
        continue;
      }

      // For each relationship record, process the sire (father) and dam (mother) by querying the parent's registration number.
      let sireId = null;
      let damId = null;

      // Process sire (father) if provided.
      if (rel.father) {
        // Query MySQL dogs to get the parent's id using the registration number.
        const [sireRows] = await sourceConnection.query(
          'SELECT id FROM dogs WHERE registration_number = ?', 
          [rel.father]
        );

        if (sireRows.length > 0) {
          // Query PostgreSQL to obtain the target parent's id.
          const [targetSire] = await sequelize.query(
            'SELECT id FROM "Dogs" WHERE registration_number = :regNum',
            {
              replacements: { regNum: rel.father },
              type: sequelize.QueryTypes.SELECT
            }
          );

          if (targetSire) {
            sireId = targetSire.id;
          }
        }
      }

      // Process dam (mother) if provided.
      if (rel.mother) {
        const [damRows] = await sourceConnection.query(
          'SELECT id FROM dogs WHERE registration_number = ?', 
          [rel.mother]
        );

        if (damRows.length > 0) {
          const [targetDam] = await sequelize.query(
            'SELECT id FROM "Dogs" WHERE registration_number = :regNum',
            {
              replacements: { regNum: rel.mother },
              type: sequelize.QueryTypes.SELECT
            }
          );

          if (targetDam) {
            damId = targetDam.id;
          }
        }
      }

      // Update the target dog record with parent's IDs if either is found.
      if (sireId || damId) {
        const updateQuery = `
          UPDATE "Dogs"
          SET 
            ${sireId ? 'sire_id = :sireId,' : ''}
            ${damId ? 'dam_id = :damId,' : ''}
            updated_at = :updatedAt
          WHERE id = :dogId
        `;
        const replacements = {
          dogId: targetDog.id,
          updatedAt: new Date().toISOString()
        };

        if (sireId) replacements.sireId = sireId;
        if (damId) replacements.damId = damId;

        await sequelize.query(updateQuery, {
          replacements,
          type: sequelize.QueryTypes.UPDATE
        });

        relationshipResults.processed++;
        relationshipResults.details.push({
          dogId: targetDog.id,
          registrationNumber: sourceRegistrationNumber,
          sireId,
          damId,
          sourceFather: rel.father,
          sourceMother: rel.mother
        });
      } else {
        relationshipResults.skipped++;
      }
    } catch (error) {
      console.error(`Error processing dog relationship for dog ${rel.dog_id}:`, error);
      relationshipResults.errors.push({
        dogId: rel.dog_id,
        error: error.message,
        stack: error.stack,
        fullRelationship: rel
      });
      relationshipResults.skipped++;
    }
  }

  // Log the relationship migration results to a file.
  const logPath = path.join(logDir, `dog_relationships_migration_log_${Date.now()}.json`);
  try {
    fs.writeFileSync(logPath, JSON.stringify(relationshipResults, null, 2));
    console.log(`Migration log written to ${logPath}`);
  } catch (logError) {
    console.error('Failed to write migration log:', logError);
  }

  // Print summary.
  console.log('Dog Relationships Migration Summary:');
  console.log(`Total Relationships: ${relationshipResults.total}`);
  console.log(`Processed Dogs: ${relationshipResults.processed}`);
  console.log(`Skipped Relationships: ${relationshipResults.skipped}`);
  console.log(`Errors: ${relationshipResults.errors.length}`);
}

/**
 * Process deferred sire/dam relationships stored in the global "relationships" array.
 * This uses the registrationToIdMap to update any remaining relationship info in PostgreSQL.
 */
async function processDeferredRelationships() {
  if (relationships.length === 0) {
    console.log('No deferred relationships to process.');
    return;
  }
  console.log(`Processing ${relationships.length} deferred relationships...`);
  let updatedCount = 0;
  for (const rel of relationships) {
    const dogId = registrationToIdMap.get(rel.dogRegNum);
    // Here, "relatedRegNum" is the registration number for the parent.
    // We need to look up the parent's target id using the registration number.
    const parentId = registrationToIdMap.get(rel.relatedRegNum);
    if (!dogId) {
      console.warn(`Dog record not found for registration: ${rel.dogRegNum}`);
      continue;
    }
    if (!parentId) {
      console.warn(`Parent record not found for registration: ${rel.relatedRegNum}`);
      continue;
    }
    const updateColumn = rel.relation === 'sire' ? 'sire_id' : 'dam_id';
    const updateQuery = `
      UPDATE "Dogs"
      SET "${updateColumn}" = :parentId,
          "updated_at" = :updatedAt
      WHERE "id" = :dogId
        AND ("${updateColumn}" IS NULL)
    `;
    try {
      await sequelize.query(updateQuery, {
        replacements: {
          parentId,
          updatedAt: new Date().toISOString(),
          dogId,
        },
        type: Sequelize.QueryTypes.UPDATE,
      });
      updatedCount++;
    } catch (error) {
      console.error(`Error updating deferred relationship for dog ${dogId}:`, error);
    }
  }
  console.log(`Updated ${updatedCount} deferred dog relationships.`);
}

/**
 * Utility: Sanitize a string to a maximum length.
 */
function sanitizeString(str, maxLength) {
  if (!str) return '';
  return str.substring(0, maxLength).trim();
}

/**
 * Utility: Sanitize an array for PostgreSQL array literal.
 */
function sanitizePostgresArray(arr) {
  if (!arr || arr.length === 0) return null;
  const sanitizedItems = arr.map(item => {
    let cleanItem = String(item).trim();
    cleanItem = cleanItem.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return cleanItem;
  });
  return `{${sanitizedItems.map(item => `"${item}"`).join(',')}}`;
}

/**
 * Utility: Validate and sanitize a UUID.
 * Returns the UUID if valid, or generates a new one.
 */
function validateAndSanitizeUUID(uuid) {
  if (!uuid) return uuidv4();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(uuid)) {
    return uuid.toLowerCase();
  }
  console.warn(`Invalid UUID detected. Replaced: ${uuid} -> ${uuidv4()}`);
  return uuidv4();
}

/**
 * Utility function to validate and sanitize UUID.
 */
function sanitizeUUID(uuid) {
  // Remove any non-standard characters and ensure it matches UUID v4 format.
  const cleanUUID = uuid.replace(/[^0-9a-f-]/gi, '').toLowerCase();
  
  // UUID v4 regex pattern.
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  
  return uuidV4Regex.test(cleanUUID) ? cleanUUID : null;
}

/**
 * Dynamically query and log table columns from the MySQL source database.
 */
async function getTableColumns(connection, tableName) {
  try {
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM ${tableName}
    `);
    
    console.log(`Columns for table ${tableName}:`);
    columns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type}`);
    });

    return columns;
  } catch (error) {
    console.error(`Error fetching columns for table ${tableName}:`, error);
    return [];
  }
}

/**
 * Add a function to log table columns.
 */
async function logTableColumns(connection, tableName) {
  try {
    const [columns] = await connection.query(`DESCRIBE ${tableName}`);
    console.log(`Columns for table ${tableName}:`);
    columns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type}`);
    });
    return columns;
  } catch (error) {
    console.error(`Error fetching columns for table ${tableName}:`, error);
    throw error;
  }
}

// Create a MySQL connection.
async function createMySQLConnection() {
  return await mysql.createConnection(dbConfig);
}

// Execute migration if run directly.
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration completed successfully.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { runMigration };
