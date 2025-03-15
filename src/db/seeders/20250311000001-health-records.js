'use strict';
const healthRecordTemplates = require('./data/health-record-templates');
const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Get all dogs from the database
      const dogs = await queryInterface.sequelize.query(
        `SELECT id, date_of_birth FROM "Dogs";`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (dogs.length === 0) {
        console.log('No dogs found in the database. Please run dog seeders first.');
        return;
      }

      console.log(`Creating health records for ${dogs.length} dogs...`);
      
      const healthRecords = [];
      const recordTypes = Object.keys(healthRecordTemplates);
      
      // For each dog, create 2-6 health records
      for (const dog of dogs) {
        const recordCount = Math.floor(Math.random() * 5) + 2; // 2-6 records per dog
        
        // Calculate the dog's age in days
        const dogBirthDate = new Date(dog.date_of_birth);
        const ageInDays = Math.floor((new Date() - dogBirthDate) / (1000 * 60 * 60 * 24));
        
        for (let i = 0; i < recordCount; i++) {
          // Select a random record type
          const recordType = recordTypes[Math.floor(Math.random() * recordTypes.length)];
          const templates = healthRecordTemplates[recordType];
          
          // Select a random template for this type
          const template = templates[Math.floor(Math.random() * templates.length)];
          
          // Generate a random date after the dog's birth but before now
          const daysAfterBirth = Math.floor(Math.random() * ageInDays);
          const recordDate = new Date(dogBirthDate);
          recordDate.setDate(recordDate.getDate() + daysAfterBirth);
          
          // Select a random result
          const result = template.possibleResults ? 
            template.possibleResults[Math.floor(Math.random() * template.possibleResults.length)] : null;
          
          // Select a random veterinarian
          const vets = template.veterinarians || [
            'Dr. Sarah Johnson',
            'Dr. Michael Chen',
            'Dr. Emily Rodriguez',
            'Dr. James Wilson',
            'Dr. Maria Garcia',
            'Dr. David Kim'
          ];
          const veterinarian = vets[Math.floor(Math.random() * vets.length)];
          
          // Add attachment URL for some records
          const attachmentUrl = Math.random() > 0.7 ? 
            `https://example.com/health_docs/${faker.string.uuid()}.pdf` : null;
          
          healthRecords.push({
            dog_id: dog.id,
            date: recordDate,
            veterinarian_name: veterinarian,
            description: template.description, // Using description instead of diagnosis as per memory
            results: result, // Using results instead of test_results as per memory
            type: recordType,
            document_url: attachmentUrl,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
      
      // Insert all health records
      await queryInterface.bulkInsert('HealthRecords', healthRecords, {});
      
      console.log(`Successfully created ${healthRecords.length} health records!`);
    } catch (error) {
      console.error('Error seeding health records:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('HealthRecords', null, {});
  }
};
