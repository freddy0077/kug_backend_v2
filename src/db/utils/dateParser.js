'use strict';

/**
 * Utility for parsing and validating dates from various formats
 */

/**
 * Parse and validate date string
 * @param {string} dateStr - Date string to parse
 * @returns {Date} - Valid Date object or current date if invalid
 */
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
      console.log(`Invalid date: ${dateStr}, using current date instead`);
      return new Date();
    }
    return date;
  } catch (e) {
    console.log(`Error parsing date: ${dateStr}, using current date instead`);
    return new Date();
  }
}

module.exports = {
  parseDate
};
