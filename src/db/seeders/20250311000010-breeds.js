'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const commonBreeds = [
      {
        name: 'Labrador Retriever',
        group: 'Sporting Group',
        origin: 'Canada',
        description: 'The Labrador Retriever is one of the most popular dog breeds in the world. Known for their friendly temperament, intelligence, and versatility.',
        temperament: 'Friendly, Active, Outgoing',
        average_lifespan: '10-12 years',
        average_height: '21.5-24.5 inches',
        average_weight: '55-80 pounds',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'German Shepherd',
        group: 'Herding Group',
        origin: 'Germany',
        description: 'German Shepherds are working dogs developed originally for herding sheep. They are known for their intelligence, loyalty, and versatility.',
        temperament: 'Confident, Courageous, Smart',
        average_lifespan: '9-13 years',
        average_height: '22-26 inches',
        average_weight: '50-90 pounds',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Golden Retriever',
        group: 'Sporting Group',
        origin: 'Scotland',
        description: 'The Golden Retriever is a medium-large gun dog that was bred to retrieve shot waterfowl. They are known for their friendly and tolerant attitude.',
        temperament: 'Friendly, Intelligent, Devoted',
        average_lifespan: '10-12 years',
        average_height: '21.5-24 inches',
        average_weight: '55-75 pounds',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Beagle',
        group: 'Hound Group',
        origin: 'England',
        description: 'The Beagle is a breed of small hound, similar in appearance to the much larger foxhound. They are scent hounds, developed primarily for hunting hare.',
        temperament: 'Friendly, Curious, Merry',
        average_lifespan: '12-15 years',
        average_height: '13-15 inches',
        average_weight: '20-30 pounds',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Bulldog',
        group: 'Non-Sporting Group',
        origin: 'England',
        description: 'The Bulldog is a medium-sized breed of dog commonly referred to as the English Bulldog or British Bulldog.',
        temperament: 'Friendly, Courageous, Calm',
        average_lifespan: '8-10 years',
        average_height: '12-16 inches',
        average_weight: '40-50 pounds',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Poodle',
        group: 'Non-Sporting Group',
        origin: 'Germany/France',
        description: 'The Poodle is a dog breed that comes in three varieties: Standard, Miniature, and Toy. They are known for their intelligence and curly, non-shedding coats.',
        temperament: 'Intelligent, Active, Alert',
        average_lifespan: '12-15 years',
        average_height: '10-22 inches (varies by variety)',
        average_weight: '6-70 pounds (varies by variety)',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Border Collie',
        group: 'Herding Group',
        origin: 'Scotland/England Border',
        description: 'The Border Collie is a working and herding dog breed developed in the Anglo-Scottish border region for herding livestock, especially sheep.',
        temperament: 'Intelligent, Energetic, Alert',
        average_lifespan: '12-15 years',
        average_height: '18-22 inches',
        average_weight: '30-45 pounds',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Siberian Husky',
        group: 'Working Group',
        origin: 'Siberia',
        description: 'The Siberian Husky is a medium-sized working dog breed that originated in north-eastern Siberia, Russia.',
        temperament: 'Friendly, Outgoing, Mischievous',
        average_lifespan: '12-14 years',
        average_height: '20-23.5 inches',
        average_weight: '35-60 pounds',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Boxer',
        group: 'Working Group',
        origin: 'Germany',
        description: 'The Boxer is a medium to large, short-haired breed of dog, developed in Germany.',
        temperament: 'Playful, Energetic, Intelligent',
        average_lifespan: '10-12 years',
        average_height: '21.5-25 inches',
        average_weight: '50-70 pounds',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Dachshund',
        group: 'Hound Group',
        origin: 'Germany',
        description: 'The Dachshund is a short-legged, long-bodied, hound-type dog breed.',
        temperament: 'Clever, Stubborn, Devoted',
        average_lifespan: '12-16 years',
        average_height: '8-9 inches (standard), 5-6 inches (miniature)',
        average_weight: '16-32 pounds (standard), 11 pounds and under (miniature)',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    try {
      // Check which breeds already exist to avoid duplicates
      const existingBreeds = await queryInterface.sequelize.query(
        `SELECT name FROM "Breeds"`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      const existingBreedNames = existingBreeds.map(breed => breed.name);
      
      // Filter out breeds that already exist in the database
      const breedsToInsert = commonBreeds.filter(
        breed => !existingBreedNames.includes(breed.name)
      );
      
      if (breedsToInsert.length > 0) {
        await queryInterface.bulkInsert('Breeds', breedsToInsert);
        console.log(`${breedsToInsert.length} breeds inserted successfully`);
      } else {
        console.log('No new breeds to insert');
      }
    } catch (error) {
      console.error('Breed seeding error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Breeds', null, {});
  }
};
