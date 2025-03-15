'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get dog IDs to reference
    const dogs = await queryInterface.sequelize.query(
      `SELECT id FROM "Dogs" LIMIT 5;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (dogs.length === 0) {
      console.log('No dogs found in the database. Please run dog seeders first.');
      return;
    }
    
    const healthRecords = [];
    const types = ['VACCINATION', 'EXAMINATION', 'TREATMENT', 'SURGERY', 'TEST', 'OTHER'];
    const now = new Date();
    
    // For each dog, create multiple health records of different types
    for (let i = 0; i < dogs.length; i++) {
      const dogId = dogs[i].id;
      
      // Add vaccinations
      healthRecords.push({
        dog_id: dogId,
        record_date: new Date(now.getFullYear(), now.getMonth() - 2, 15), // 2 months ago
        veterinarian_name: 'Dr. Sarah Johnson',
        description: 'Annual Rabies vaccination',
        results: 'Completed successfully',
        type: 'VACCINATION',
        created_at: now,
        updated_at: now
      });
      
      healthRecords.push({
        dog_id: dogId,
        record_date: new Date(now.getFullYear(), now.getMonth() - 3, 10), // 3 months ago
        veterinarian_name: 'Dr. Sarah Johnson',
        description: 'Distemper and Parvovirus booster',
        results: 'Completed successfully',
        type: 'VACCINATION',
        created_at: now,
        updated_at: now
      });
      
      // Add examination
      healthRecords.push({
        dog_id: dogId,
        record_date: new Date(now.getFullYear(), now.getMonth() - 1, 5), // 1 month ago
        veterinarian_name: 'Dr. Michael Chen',
        description: 'Annual wellness checkup',
        results: 'Good overall health, slight tartar buildup on teeth',
        type: 'EXAMINATION',
        created_at: now,
        updated_at: now
      });
      
      // Add treatment (if applicable)
      if (i % 2 === 0) { // Only for some dogs
        healthRecords.push({
          dog_id: dogId,
          record_date: new Date(now.getFullYear(), now.getMonth() - 1, 12), // 1 month ago
          veterinarian_name: 'Dr. Michael Chen',
          description: 'Dental cleaning',
          results: 'Removed tartar buildup, teeth in good condition',
          type: 'TREATMENT',
          created_at: now,
          updated_at: now
        });
      }
      
      // Add test
      healthRecords.push({
        dog_id: dogId,
        record_date: new Date(now.getFullYear(), now.getMonth() - 1, 5), // 1 month ago
        veterinarian_name: 'Dr. Emily Wilson',
        description: 'Heartworm test',
        results: 'Negative',
        type: 'TEST',
        created_at: now,
        updated_at: now
      });
      
      // Add surgery (for one dog)
      if (i === 2) {
        healthRecords.push({
          dog_id: dogId,
          record_date: new Date(now.getFullYear() - 1, 6, 15), // Last year
          veterinarian_name: 'Dr. Robert Alvarez',
          description: 'ACL repair surgery',
          results: 'Surgery successful, 8 weeks recovery recommended',
          type: 'SURGERY',
          created_at: now,
          updated_at: now
        });
      }
    }
    
    // Bulk insert all health records
    await queryInterface.bulkInsert('HealthRecords', healthRecords, {});
    
    console.log(`${healthRecords.length} health records seeded successfully`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('HealthRecords', null, {});
  }
};
