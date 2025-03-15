'use strict';

/**
 * Utility for extracting data from SQL dump files
 */

/**
 * Extract table data from SQL dump
 * @param {string} sqlContent - Content of SQL dump file
 * @param {string} tableName - Name of table to extract data from
 * @returns {Array} - Array of objects representing rows from the table
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

module.exports = {
  extractDataFromSql
};
