/**
 * Utility for background processing of large SQL migrations
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');

/**
 * Process a large SQL file in chunks/batches with improved multi-value INSERT handling
 * @param {string} sqlFilePath - Path to the SQL file
 * @param {Object} options - Processing options
 * @param {Function} processBatchCallback - Function to process each batch of records
 * @returns {Promise<Object>} - Summary of processing
 */
async function processSqlFileInBatches(sqlFilePath, options = {}, processBatchCallback) {
  const { 
    batchSize = 1000, 
    tableName,
    targetTables = [],
    logProgress = true
  } = options;
  
  console.log(`Starting background processing of SQL file: ${sqlFilePath}`);
  
  if (!fs.existsSync(sqlFilePath)) {
    throw new Error(`SQL file not found: ${sqlFilePath}`);
  }
  
  // Results object to track processing
  const results = {
    totalInsertStatements: 0,
    processedStatements: 0,
    recordsByTable: {},
    errors: []
  };
  
  // Read the entire file
  console.log(`Reading SQL file: ${sqlFilePath}`);
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  console.log(`SQL file loaded, size: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);
  
  // Split the file by semicolons to get individual SQL statements
  console.log('Splitting file into statements...');
  const statements = sqlContent.split(';');
  console.log(`Found ${statements.length} statements in the file`);
  
  // Process each target table
  for (const table of targetTables) {
    console.log(`Processing table: ${table}`);
    
    // Initialize table counter
    if (!results.recordsByTable[table]) {
      results.recordsByTable[table] = 0;
    }
    
    // Find all INSERT statements for this table
    const tableStatements = statements.filter(stmt => 
      stmt.trim().includes(`INSERT INTO \`${table}\``) || 
      stmt.trim().includes(`INSERT INTO ${table}`)
    );
    
    console.log(`Found ${tableStatements.length} INSERT statements for table ${table}`);
    
    if (tableStatements.length === 0) {
      continue;
    }
    
    // Get columns from the first statement
    let columns = [];
    const columnMatch = tableStatements[0].match(/INSERT INTO (?:`[^`]+`|[^\s]+)\s*\(([^)]+)\)/i);
    
    if (columnMatch) {
      columns = columnMatch[1].split(',').map(col => 
        col.replace(/`/g, '').trim()
      );
      console.log(`Found ${columns.length} columns for table ${table}: ${columns.join(', ')}`);
    } else {
      console.log(`Could not extract columns for table ${table}`);
      continue;
    }
    
    let batch = [];
    let totalRecords = 0;
    
    // Process each INSERT statement
    for (let i = 0; i < tableStatements.length; i++) {
      const stmt = tableStatements[i];
      results.totalInsertStatements++;
      
      // Find the VALUES section
      const valuesMatch = stmt.match(/VALUES\s*\n?\r?\s*(\([^;]+)/i);
      
      if (!valuesMatch) {
        console.log(`No values found in statement ${i+1} for table ${table}`);
        continue;
      }
      
      // Extract the values block - this contains all value sets
      let valuesBlock = valuesMatch[1];
      
      // Handle multi-line values with record per line
      // Split by "),(" pattern - this pattern marks different record sets
      const valueLines = valuesBlock.split(/\),\s*\n?\r?\s*\(/g);
      
      for (let j = 0; j < valueLines.length; j++) {
        let line = valueLines[j];
        
        // Clean up the first and last lines
        if (j === 0) {
          line = line.replace(/^\s*\(/g, '');
        }
        if (j === valueLines.length - 1) {
          line = line.replace(/\)\s*$/g, '');
        }
        
        // Parse the values preserving the SQL data format
        const values = parseValueSetWithQuotes(line);
        
        // Skip if we don't have enough values 
        if (values.length < columns.length / 2) {
          continue;
        }
        
        // Create a record object mapping columns to values
        const record = {};
        columns.forEach((col, idx) => {
          let value = idx < values.length ? values[idx] : null;
          record[col] = value;
        });
        
        batch.push({
          table,
          data: record
        });
        
        totalRecords++;
        results.recordsByTable[table]++;
        
        // Process batch if it reaches the batch size
        if (batch.length >= batchSize) {
          try {
            await processBatchCallback(table, batch.map(item => item.data));
            results.processedStatements += batch.length;
          } catch (error) {
            console.error(`Error processing batch for ${table}:`, error);
            results.errors.push({
              table,
              error: error.message,
              batch: batch.length
            });
          }
          
          // Reset batch
          batch = [];
          
          // Log progress
          if (logProgress && totalRecords % (batchSize * 2) === 0) {
            console.log(`Processed ${totalRecords} records for table ${table} so far...`);
          }
        }
      }
    }
    
    // Process any remaining records in the last batch
    if (batch.length > 0) {
      try {
        await processBatchCallback(table, batch.map(item => item.data));
        results.processedStatements += batch.length;
      } catch (error) {
        console.error(`Error processing final batch for ${table}:`, error);
        results.errors.push({
          table,
          error: error.message,
          batch: batch.length
        });
      }
    }
    
    console.log(`Completed table ${table}: processed ${totalRecords} total records`);
  }
  
  console.log('Background processing completed!');
  console.log('Summary:', results);
  
  return results;
}

/**
 * Parse a value set from an SQL INSERT statement with improved quote handling
 * @param {string} valueSet - The value set string
 * @returns {Array<any>} - Parsed values
 */
function parseValueSetWithQuotes(valueSet) {
  const values = [];
  let currentValue = '';
  let inString = false;
  let i = 0;
  
  while (i < valueSet.length) {
    const char = valueSet[i];
    
    // Handle string literals with quotes
    if (char === "'" && (i === 0 || valueSet[i-1] !== '\\')) {
      inString = !inString;
      // Include quotes in the value for proper SQL formatting
      currentValue += char;
    }
    // Handle commas outside strings as value separators
    else if (char === ',' && !inString) {
      values.push(processSqlValue(currentValue.trim()));
      currentValue = '';
    }
    // Handle escaped quotes
    else if (char === '\\' && i + 1 < valueSet.length && valueSet[i+1] === "'") {
      currentValue += '\\\'';
      i++; // Skip the next character (the quote)
    }
    // Handle all other characters
    else {
      currentValue += char;
    }
    
    i++;
  }
  
  // Add the last value
  if (currentValue) {
    values.push(processSqlValue(currentValue.trim()));
  }
  
  return values;
}

/**
 * Process a SQL value to convert it to the appropriate JavaScript type
 * @param {string} value - SQL value as string
 * @returns {any} - Processed value
 */
function processSqlValue(value) {
  // NULL values
  if (value === 'NULL') {
    return null;
  }
  
  // String literals
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.substring(1, value.length - 1).replace(/\\'/g, "'");
  }
  
  // Numbers
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  
  // Dates (simplified handling)
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value;
  }
  
  // Default
  return value;
}

module.exports = {
  processSqlFileInBatches
};
