'use strict';
const dogBreeds = require('./data/dog-breeds');
const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Helper function to generate random dog data
    const createDog = (generation, sireId = null, damId = null) => {
      // Select a random breed
      const breed = dogBreeds[Math.floor(Math.random() * dogBreeds.length)];
      // Generate a random gender
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      // Generate a random date of birth based on generation
      // Older generations have older dogs
      const yearsOld = 2 + generation * 2 + Math.floor(Math.random() * 3);
      const dateOfBirth = new Date();
      dateOfBirth.setFullYear(dateOfBirth.getFullYear() - yearsOld);
      
      // Generate a random color from the breed's possible colors
      const color = breed.colors[Math.floor(Math.random() * breed.colors.length)];
      
      // Generate random height/weight within breed range
      const height = Number((Math.random() * (breed.maxHeight - breed.minHeight) + breed.minHeight).toFixed(1));
      const weight = Math.floor(Math.random() * (breed.maxWeight - breed.minWeight) + breed.minWeight);
      
      // Generate random titles
      const titlesCount = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;
      const titles = [];
      for (let i = 0; i < titlesCount; i++) {
        const title = breed.commonTitles[Math.floor(Math.random() * breed.commonTitles.length)];
        if (!titles.includes(title)) {
          titles.push(title);
        }
      }
      
      // Generate the dog data
      return {
        name: faker.person.firstName(),
        breed: breed.name,
        gender,
        date_of_birth: dateOfBirth,
        date_of_death: null,
        color,
        registration_number: `AKC${faker.string.numeric(6)}`,
        microchip_number: Math.random() > 0.7 ? `900${faker.string.numeric(12)}` : null,
        titles: titles.length ? `{${titles.map(title => `"${title}"`).join(',')}}` : null,
        is_neutered: Math.random() > 0.7,
        height,
        weight,
        biography: Math.random() > 0.5 ? faker.lorem.paragraph() : null,
        main_image_url: Math.random() > 0.3 ? `https://example.com/dogs/${faker.string.uuid()}.jpg` : null,
        sire_id: sireId,
        dam_id: damId,
        created_at: new Date(),
        updated_at: new Date()
      };
    };

    try {
      // Get the owners for our dogs
      const owners = await queryInterface.sequelize.query(
        `SELECT id FROM "Owners";`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (owners.length === 0) {
        console.log('No owners found in the database. Please run owner seeders first.');
        return;
      }

      // Clear existing dogs (if any)
      await queryInterface.bulkDelete('Dogs', null, {});
      
      console.log('Creating generation 4 dogs (great-great-grandparents)...');
      // Create 16 dogs for generation 4 (oldest generation)
      const gen4Dogs = [];
      for (let i = 0; i < 16; i++) {
        gen4Dogs.push(createDog(4));
      }
      await queryInterface.bulkInsert('Dogs', gen4Dogs, {});

      // Fetch the inserted generation 4 dogs
      const fetchedGen4Dogs = await queryInterface.sequelize.query(
        `SELECT id, gender FROM "Dogs" ORDER BY id DESC LIMIT 16;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      console.log('Creating generation 3 dogs (great-grandparents)...');
      // Create 8 dogs for generation 3
      const gen3Dogs = [];
      for (let i = 0; i < 8; i++) {
        // Find a male and female from gen4 for parents
        const sireIndex = i * 2;
        const damIndex = i * 2 + 1;
        
        const sireId = fetchedGen4Dogs[sireIndex].gender === 'male' ? 
          fetchedGen4Dogs[sireIndex].id : fetchedGen4Dogs[damIndex].id;
        
        const damId = fetchedGen4Dogs[sireIndex].gender === 'female' ? 
          fetchedGen4Dogs[sireIndex].id : fetchedGen4Dogs[damIndex].id;
        
        gen3Dogs.push(createDog(3, sireId, damId));
      }
      await queryInterface.bulkInsert('Dogs', gen3Dogs, {});

      // Fetch the inserted generation 3 dogs
      const fetchedGen3Dogs = await queryInterface.sequelize.query(
        `SELECT id, gender FROM "Dogs" ORDER BY id DESC LIMIT 8;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      console.log('Creating generation 2 dogs (grandparents)...');
      // Create 4 dogs for generation 2
      const gen2Dogs = [];
      for (let i = 0; i < 4; i++) {
        // Find a male and female from gen3 for parents
        const sireIndex = i * 2;
        const damIndex = i * 2 + 1;
        
        const sireId = fetchedGen3Dogs[sireIndex].gender === 'male' ? 
          fetchedGen3Dogs[sireIndex].id : fetchedGen3Dogs[damIndex].id;
        
        const damId = fetchedGen3Dogs[sireIndex].gender === 'female' ? 
          fetchedGen3Dogs[sireIndex].id : fetchedGen3Dogs[damIndex].id;
        
        gen2Dogs.push(createDog(2, sireId, damId));
      }
      await queryInterface.bulkInsert('Dogs', gen2Dogs, {});

      // Fetch the inserted generation 2 dogs
      const fetchedGen2Dogs = await queryInterface.sequelize.query(
        `SELECT id, gender FROM "Dogs" ORDER BY id DESC LIMIT 4;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      console.log('Creating generation 1 dogs (parents)...');
      // Create 2 dogs for generation 1
      const gen1Dogs = [];
      for (let i = 0; i < 2; i++) {
        // Find a male and female from gen2 for parents
        const sireIndex = i * 2;
        const damIndex = i * 2 + 1;
        
        const sireId = fetchedGen2Dogs[sireIndex].gender === 'male' ? 
          fetchedGen2Dogs[sireIndex].id : fetchedGen2Dogs[damIndex].id;
        
        const damId = fetchedGen2Dogs[sireIndex].gender === 'female' ? 
          fetchedGen2Dogs[sireIndex].id : fetchedGen2Dogs[damIndex].id;
        
        gen1Dogs.push(createDog(1, sireId, damId));
      }
      await queryInterface.bulkInsert('Dogs', gen1Dogs, {});
      
      // Fetch the inserted generation 1 dogs
      const fetchedGen1Dogs = await queryInterface.sequelize.query(
        `SELECT id, gender FROM "Dogs" ORDER BY id DESC LIMIT 2;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      console.log('Creating generation 0 dogs (current litter)...');
      // Create remaining dogs for generation 0 (current)
      // First create a pair with the gen1 dogs as parents
      const sireId = fetchedGen1Dogs[0].gender === 'male' ? 
        fetchedGen1Dogs[0].id : fetchedGen1Dogs[1].id;
      
      const damId = fetchedGen1Dogs[0].gender === 'female' ? 
        fetchedGen1Dogs[0].id : fetchedGen1Dogs[1].id;
      
      const gen0Dogs = [];
      // Create 5 puppies from the same litter
      for (let i = 0; i < 5; i++) {
        gen0Dogs.push(createDog(0, sireId, damId));
      }
      
      // Create additional dogs (up to 100 total) with various parent combinations or no parents
      const totalDogsCreatedSoFar = 16 + 8 + 4 + 2 + 5; // 35
      const remainingDogsToCreate = 100 - totalDogsCreatedSoFar;
      
      for (let i = 0; i < remainingDogsToCreate; i++) {
        // 70% chance of having parents, 30% chance of no parents
        const hasParents = Math.random() > 0.3;
        
        if (hasParents) {
          // Randomly select from dogs of older generations
          const potentialSires = await queryInterface.sequelize.query(
            `SELECT id FROM "Dogs" WHERE gender = 'male' ORDER BY RANDOM() LIMIT 1;`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
          );
          
          const potentialDams = await queryInterface.sequelize.query(
            `SELECT id FROM "Dogs" WHERE gender = 'female' ORDER BY RANDOM() LIMIT 1;`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
          );
          
          if (potentialSires.length > 0 && potentialDams.length > 0) {
            gen0Dogs.push(createDog(0, potentialSires[0].id, potentialDams[0].id));
          } else {
            gen0Dogs.push(createDog(0));
          }
        } else {
          gen0Dogs.push(createDog(0));
        }
      }
      
      await queryInterface.bulkInsert('Dogs', gen0Dogs, {});
      
      console.log(`Successfully created ${totalDogsCreatedSoFar + remainingDogsToCreate} dogs with pedigree relationships!`);

    } catch (error) {
      console.error('Error seeding dogs:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Dogs', null, {});
  }
};
