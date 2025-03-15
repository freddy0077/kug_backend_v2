'use strict';
const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Get all dogs from the database
      const dogs = await queryInterface.sequelize.query(
        `SELECT id FROM "Dogs";`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      // Get all owners from the database
      const owners = await queryInterface.sequelize.query(
        `SELECT id FROM "Owners";`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (dogs.length === 0 || owners.length === 0) {
        console.log('No dogs or owners found in the database. Please run those seeders first.');
        return;
      }

      console.log(`Creating ownerships between ${dogs.length} dogs and ${owners.length} owners...`);
      
      const ownerships = [];
      
      for (const dog of dogs) {
        // Each dog can have 1-3 owners (including past owners)
        const ownerCount = Math.floor(Math.random() * 3) + 1;
        
        // Get random owners for this dog
        const shuffledOwners = [...owners].sort(() => 0.5 - Math.random());
        const selectedOwners = shuffledOwners.slice(0, ownerCount);
        
        // Current ownership started between 0-3 years ago
        const currentStart = new Date();
        currentStart.setFullYear(currentStart.getFullYear() - Math.floor(Math.random() * 3));
        
        for (let i = 0; i < selectedOwners.length; i++) {
          // Determine if this is the current owner (the last one in the list)
          const isCurrent = i === selectedOwners.length - 1;
          
          let startDate, endDate;
          
          if (isCurrent) {
            // Current owner started recently
            startDate = currentStart;
            endDate = null;
          } else {
            // Past owners had ownership periods before the current owner
            // Each past ownership lasted 1-3 years
            endDate = new Date(currentStart);
            const ownershipDuration = Math.floor(Math.random() * 2) + 1; // 1-3 years
            startDate = new Date(endDate);
            startDate.setFullYear(startDate.getFullYear() - ownershipDuration);
            
            // Move back the reference for next past owner
            currentStart = new Date(startDate);
            currentStart.setMonth(currentStart.getMonth() - 1); // 1 month gap between ownerships
          }
          
          ownerships.push({
            dog_id: dog.id,
            owner_id: selectedOwners[i].id,
            start_date: startDate,
            end_date: endDate,
            is_current: isCurrent, // Using is_current instead of is_active as per memory
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
      
      // Insert all ownerships
      await queryInterface.bulkInsert('Ownerships', ownerships, {});
      
      console.log(`Successfully created ${ownerships.length} ownership records!`);
    } catch (error) {
      console.error('Error seeding ownerships:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Ownerships', null, {});
  }
};
