'use strict';

const { parseDate } = require('./dateParser');

/**
 * Module for migrating owner data from kennel-union.sql
 */

/**
 * Creates or fetches owners from the database
 * @param {Object} queryInterface - Sequelize query interface
 * @param {Array} users - Array of user objects from SQL dump
 * @returns {Map} - Map of owner emails to IDs
 */
async function migrateOwners(queryInterface, users) {
  console.log('Creating owners...');
  
  // First, check for existing owners to avoid duplicates
  const existingOwners = await queryInterface.sequelize.query(
    'SELECT id, email, "contact_email" FROM "Owners"',
    { type: queryInterface.sequelize.QueryTypes.SELECT }
  );
  
  // Create a map of existing owner emails
  const existingOwnerEmails = new Set();
  const ownerMap = new Map();
  
  existingOwners.forEach(owner => {
    // Handle both snake_case and camelCase column variants
    const email = owner.email || owner.contact_email;
    if (email) {
      existingOwnerEmails.add(email.toLowerCase());
      ownerMap.set(email.toLowerCase(), owner.id);
    }
  });
  
  // Filter out owners that already exist
  const newOwnerRecords = [];
  if (users.length > 0) {
    for (const user of users) {
      const email = user.email || `user_${user.id}@example.com`;
      if (!existingOwnerEmails.has(email.toLowerCase())) {
        // Create record with both snake_case and camelCase versions of columns
        // to support the database schema which has both
        newOwnerRecords.push({
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          first_name: user.first_name || '',
          firstName: user.first_name || '', // camelCase version
          last_name: user.last_name || '',
          lastName: user.last_name || '', // camelCase version
          email: email,
          contact_email: email, // snake_case version
          contactEmail: email, // camelCase version  
          phone_number: user.phone || '',
          phoneNumber: user.phone || '', // camelCase version
          contact_phone: user.phone || '', // snake_case version
          contactPhone: user.phone || '', // camelCase version
          address: user.address || '',
          address_line1: user.address || '',
          addressLine1: user.address || '', // camelCase version
          city: user.city || '',
          state: user.state || '',
          postal_code: user.postal_code || '',
          postalCode: user.postal_code || '', // camelCase version
          is_breeder: user.kennel_name ? true : false,
          isBreeder: user.kennel_name ? true : false, // camelCase version
          user_id: null, // We're not creating user accounts in this migration
          userId: null, // camelCase version
          created_at: parseDate(user.created_at),
          createdAt: parseDate(user.created_at), // camelCase version
          updated_at: parseDate(user.updated_at),
          updatedAt: parseDate(user.updated_at) // camelCase version
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
    'SELECT id, email, "contact_email" FROM "Owners"',
    { type: queryInterface.sequelize.QueryTypes.SELECT }
  );
  
  // Update the owner map with all owners
  allOwners.forEach(owner => {
    // Handle both snake_case and camelCase column variants
    const email = owner.email || owner.contact_email;
    if (email) {
      ownerMap.set(email.toLowerCase(), owner.id);
    }
  });
  
  return ownerMap;
}

module.exports = {
  migrateOwners
};
