'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get current date for timestamps
    const now = new Date();
    
    // 1. Insert sample breeding programs
    const breedingPrograms = await queryInterface.bulkInsert(
      'BreedingPrograms',
      [
        {
          program_name: 'Golden Champion Lineage',
          description: 'A specialized breeding program focused on developing champion Golden Retrievers with excellent temperament and conformation.',
          breeder_id: 1, // Assuming owner with ID 1 exists
          breed: 'Golden Retriever',
          goals: JSON.stringify(['Improve hip health', 'Maintain friendly temperament', 'Enhance show qualities']),
          start_date: new Date('2024-01-01'),
          end_date: null,
          is_active: true,
          criteria: 'Only dogs with OFA Good or Excellent hip ratings, clear CERF eye exams',
          created_at: now,
          updated_at: now
        },
        {
          program_name: 'Border Collie Working Line',
          description: 'Developing Border Collies with exceptional herding abilities and intelligence.',
          breeder_id: 2, // Assuming owner with ID 2 exists
          breed: 'Border Collie',
          goals: JSON.stringify(['Improve herding instinct', 'Maintain trainability', 'Enhance agility']),
          start_date: new Date('2023-08-15'),
          end_date: null,
          is_active: true,
          criteria: 'Only dogs with proven herding ability and clear genetic tests',
          created_at: now,
          updated_at: now
        },
        {
          program_name: 'Labrador Health Initiative',
          description: 'Breeding program focused on improving health outcomes in Labrador Retrievers.',
          breeder_id: 1, // Assuming owner with ID 1 exists
          breed: 'Labrador Retriever',
          goals: JSON.stringify(['Reduce hip dysplasia', 'Eliminate PRA', 'Improve longevity']),
          start_date: new Date('2024-02-15'),
          end_date: null,
          is_active: false,
          criteria: 'Only dogs with multi-generational health clearances',
          created_at: now,
          updated_at: now
        }
      ],
      { returning: true }
    );
    
    // 2. Get the inserted program IDs
    const programIds = await queryInterface.sequelize.query(
      `SELECT id FROM "BreedingPrograms";`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (programIds.length === 0) {
      console.log('No breeding programs found after insertion. Skipping foundation dogs.');
      return;
    }
    
    // 3. Get some dogs to add as foundation dogs
    const dogs = await queryInterface.sequelize.query(
      `SELECT id FROM "Dogs" LIMIT 10;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (dogs.length === 0) {
      console.log('No dogs found in the database. Skipping foundation dogs.');
      return;
    }
    
    // 4. Create foundation dogs for each program
    const foundationDogs = [];
    
    // For first program (Golden Retrievers)
    if (programIds.length > 0 && dogs.length >= 3) {
      foundationDogs.push(
        {
          breeding_program_id: programIds[0].id,
          dog_id: dogs[0].id,
          notes: 'Champion show dog with excellent lineage',
          created_at: now,
          updated_at: now
        },
        {
          breeding_program_id: programIds[0].id,
          dog_id: dogs[1].id,
          notes: 'Strong maternal traits and excellent hip scores',
          created_at: now,
          updated_at: now
        },
        {
          breeding_program_id: programIds[0].id,
          dog_id: dogs[2].id,
          notes: 'International champion with notable coat quality',
          created_at: now,
          updated_at: now
        }
      );
    }
    
    // For second program (Border Collies)
    if (programIds.length > 1 && dogs.length >= 6) {
      foundationDogs.push(
        {
          breeding_program_id: programIds[1].id,
          dog_id: dogs[3].id,
          notes: 'Working farm dog with excellent herding instinct',
          created_at: now,
          updated_at: now
        },
        {
          breeding_program_id: programIds[1].id,
          dog_id: dogs[4].id,
          notes: 'Agility champion with trainable temperament',
          created_at: now,
          updated_at: now
        },
        {
          breeding_program_id: programIds[1].id,
          dog_id: dogs[5].id,
          notes: 'Working trial champion from imported UK lines',
          created_at: now,
          updated_at: now
        }
      );
    }
    
    // For third program (Labradors)
    if (programIds.length > 2 && dogs.length >= 9) {
      foundationDogs.push(
        {
          breeding_program_id: programIds[2].id,
          dog_id: dogs[6].id,
          notes: 'Multiple-generation clear genetic testing for all common Lab issues',
          created_at: now,
          updated_at: now
        },
        {
          breeding_program_id: programIds[2].id,
          dog_id: dogs[7].id,
          notes: 'Excellent hip and elbow scores',
          created_at: now,
          updated_at: now
        },
        {
          breeding_program_id: programIds[2].id,
          dog_id: dogs[8].id,
          notes: 'Field trial champion with proven working ability',
          created_at: now,
          updated_at: now
        }
      );
    }
    
    // Insert foundation dogs if any were created
    if (foundationDogs.length > 0) {
      await queryInterface.bulkInsert('BreedingProgramFoundationDogs', foundationDogs, {});
      console.log(`${foundationDogs.length} foundation dogs seeded successfully`);
    }
    
    console.log(`${programIds.length} breeding programs seeded successfully`);
  },

  down: async (queryInterface, Sequelize) => {
    // First remove the foundation dogs (due to foreign key constraints)
    await queryInterface.bulkDelete('BreedingProgramFoundationDogs', null, {});
    
    // Then remove the breeding programs
    await queryInterface.bulkDelete('BreedingPrograms', null, {});
  }
};
