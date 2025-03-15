'use strict';
const { faker } = require('@faker-js/faker');
const dogBreeds = require('./data/dog-breeds');

/**
 * This seeder creates pedigrees with various levels of inbreeding for testing the
 * linebreeding analysis functionality. It demonstrates:
 * 1. Low inbreeding (5-10%): Common ancestors in 4th-5th generations
 * 2. Moderate inbreeding (10-20%): Common ancestors in 3rd generation
 * 3. High inbreeding (20-30%): Half-sibling, uncle-niece, or grandparent breeding
 * 4. Very high inbreeding (>30%): Full sibling, parent-offspring breeding
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Helper function to generate a dog
    const createDog = (name, gender, breedId = 1, birthYear = 2019, sireId = null, damId = null) => {
      const breed = dogBreeds[Math.min(breedId - 1, dogBreeds.length - 1)];
      const dateOfBirth = new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const color = breed.colors[Math.floor(Math.random() * breed.colors.length)];
      const height = Number((Math.random() * (breed.maxHeight - breed.minHeight) + breed.minHeight).toFixed(1));
      const weight = Math.floor(Math.random() * (breed.maxWeight - breed.minWeight) + breed.minWeight);
      
      return {
        name,
        breed: breed.name,
        breed_id: breedId,
        gender,
        date_of_birth: dateOfBirth,
        date_of_death: null,
        color,
        registration_number: `TEST${faker.string.numeric(6)}`,
        microchip_number: `900${faker.string.numeric(12)}`,
        titles: null,
        is_neutered: false,
        height,
        weight,
        biography: faker.lorem.paragraph(),
        main_image_url: `https://example.com/dogs/${faker.string.uuid()}.jpg`,
        sire_id: sireId,
        dam_id: damId,
        created_at: new Date(),
        updated_at: new Date()
      };
    };

    // Function to get the latest dog IDs
    const getLatestDogIds = async (limit) => {
      return queryInterface.sequelize.query(
        `SELECT id, name, gender FROM "Dogs" ORDER BY id DESC LIMIT ${limit};`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
    };

    try {
      console.log('Creating inbreeding test pedigrees...');
      
      // =============== SCENARIO 1: LOW INBREEDING (5-10%) ===============
      // Common ancestor appears in 4th or 5th generation of both parents
      console.log('Creating Scenario 1: Low Inbreeding (5-10%)');
      
      // Create a common ancestor (generation 5)
      const commonAncestor = createDog('Ancestor Alpha', 'male', 1, 2010);
      await queryInterface.bulkInsert('Dogs', [commonAncestor], {});
      const [fetchedAncestor] = await getLatestDogIds(1);
      
      // Create 2 different mates for common ancestor (generation 5)
      const mate1 = createDog('Mate One', 'female', 1, 2010);
      const mate2 = createDog('Mate Two', 'female', 1, 2010);
      await queryInterface.bulkInsert('Dogs', [mate1, mate2], {});
      const [fetchedMate1, fetchedMate2] = await getLatestDogIds(2);
      
      // Create 2 offspring from common ancestor (generation 4)
      const offspring1 = createDog('Gen4 Dog1', 'male', 1, 2012, fetchedAncestor.id, fetchedMate1.id);
      const offspring2 = createDog('Gen4 Dog2', 'female', 1, 2012, fetchedAncestor.id, fetchedMate2.id);
      await queryInterface.bulkInsert('Dogs', [offspring1, offspring2], {});
      const [fetchedOffspring1, fetchedOffspring2] = await getLatestDogIds(2);
      
      // Create mates for offspring (generation 4)
      const offspringMate1 = createDog('Gen4 Mate1', 'female', 1, 2012);
      const offspringMate2 = createDog('Gen4 Mate2', 'male', 1, 2012);
      await queryInterface.bulkInsert('Dogs', [offspringMate1, offspringMate2], {});
      const [fetchedOffspringMate1, fetchedOffspringMate2] = await getLatestDogIds(2);
      
      // Create generation 3 (grandparents of final dogs)
      const gen3Dog1 = createDog('Gen3 Dog1', 'male', 1, 2014, fetchedOffspring1.id, fetchedOffspringMate1.id);
      const gen3Dog2 = createDog('Gen3 Dog2', 'female', 1, 2014, fetchedOffspringMate2.id, fetchedOffspring2.id);
      await queryInterface.bulkInsert('Dogs', [gen3Dog1, gen3Dog2], {});
      const [fetchedGen3Dog1, fetchedGen3Dog2] = await getLatestDogIds(2);
      
      // Create generation 2 (parents of final mating pair)
      const gen2Dog1 = createDog('Gen2 Dog1', 'male', 1, 2016, fetchedGen3Dog1.id, null);
      const gen2Dog2 = createDog('Gen2 Dog2', 'female', 1, 2016, null, fetchedGen3Dog2.id);
      await queryInterface.bulkInsert('Dogs', [gen2Dog1, gen2Dog2], {});
      const [fetchedGen2Dog1, fetchedGen2Dog2] = await getLatestDogIds(2);
      
      // Create generation 1 (final mating pair)
      const gen1Dog1 = createDog('Low Inbreeding Sire', 'male', 1, 2019, fetchedGen2Dog1.id, null);
      const gen1Dog2 = createDog('Low Inbreeding Dam', 'female', 1, 2019, null, fetchedGen2Dog2.id);
      await queryInterface.bulkInsert('Dogs', [gen1Dog1, gen1Dog2], {});
      const [fetchedLowInbreedingSire, fetchedLowInbreedingDam] = await getLatestDogIds(2);
      
      // Create the offspring with low inbreeding
      const lowInbreedingOffspring = createDog('Low Inbreeding Puppy', 'male', 1, 2022, 
        fetchedLowInbreedingSire.id, fetchedLowInbreedingDam.id);
      await queryInterface.bulkInsert('Dogs', [lowInbreedingOffspring], {});
      
      // =============== SCENARIO 2: MODERATE INBREEDING (10-20%) ===============
      // Common ancestors in 3rd generation or repeated ancestors
      console.log('Creating Scenario 2: Moderate Inbreeding (10-20%)');
      
      // Create common ancestors (generation 4)
      const moderateCommonMale = createDog('Moderate Ancestor M', 'male', 2, 2011);
      const moderateCommonFemale = createDog('Moderate Ancestor F', 'female', 2, 2011);
      await queryInterface.bulkInsert('Dogs', [moderateCommonMale, moderateCommonFemale], {});
      const [fetchedModCommonMale, fetchedModCommonFemale] = await getLatestDogIds(2);
      
      // Create generation 3 dogs that use the common ancestors
      const modGen3Dog1 = createDog('Mod Gen3 Dog1', 'male', 2, 2013, 
        fetchedModCommonMale.id, fetchedModCommonFemale.id);
      const modGen3Dog2 = createDog('Mod Gen3 Dog2', 'female', 2, 2013, 
        fetchedModCommonMale.id, fetchedModCommonFemale.id);
      await queryInterface.bulkInsert('Dogs', [modGen3Dog1, modGen3Dog2], {});
      const [fetchedModGen3Dog1, fetchedModGen3Dog2] = await getLatestDogIds(2);
      
      // Create mates for generation 3 (unrelated)
      const modGen3Mate1 = createDog('Mod Gen3 Mate1', 'female', 2, 2013);
      const modGen3Mate2 = createDog('Mod Gen3 Mate2', 'male', 2, 2013);
      await queryInterface.bulkInsert('Dogs', [modGen3Mate1, modGen3Mate2], {});
      const [fetchedModGen3Mate1, fetchedModGen3Mate2] = await getLatestDogIds(2);
      
      // Create generation 2 (parents of final mating pair)
      const modGen2Dog1 = createDog('Mod Gen2 Dog1', 'male', 2, 2016, 
        fetchedModGen3Dog1.id, fetchedModGen3Mate1.id);
      const modGen2Dog2 = createDog('Mod Gen2 Dog2', 'female', 2, 2016, 
        fetchedModGen3Mate2.id, fetchedModGen3Dog2.id);
      await queryInterface.bulkInsert('Dogs', [modGen2Dog1, modGen2Dog2], {});
      const [fetchedModGen2Dog1, fetchedModGen2Dog2] = await getLatestDogIds(2);
      
      // Create generation 1 (final mating pair)
      const modGen1Dog1 = createDog('Moderate Inbreeding Sire', 'male', 2, 2019, fetchedModGen2Dog1.id, null);
      const modGen1Dog2 = createDog('Moderate Inbreeding Dam', 'female', 2, 2019, null, fetchedModGen2Dog2.id);
      await queryInterface.bulkInsert('Dogs', [modGen1Dog1, modGen1Dog2], {});
      const [fetchedModInbreedingSire, fetchedModInbreedingDam] = await getLatestDogIds(2);
      
      // Create the offspring with moderate inbreeding
      const modInbreedingOffspring = createDog('Moderate Inbreeding Puppy', 'female', 2, 2022, 
        fetchedModInbreedingSire.id, fetchedModInbreedingDam.id);
      await queryInterface.bulkInsert('Dogs', [modInbreedingOffspring], {});

      // =============== SCENARIO 3: HIGH INBREEDING (20-30%) ===============
      // Half-sibling, uncle-niece, or grandparent-grandchild matings
      console.log('Creating Scenario 3: High Inbreeding (20-30%)');
      
      // Create grandparent generation
      const highAncestor1 = createDog('High Ancestor 1', 'male', 3, 2013);
      const highAncestor2 = createDog('High Ancestor 2', 'female', 3, 2013);
      await queryInterface.bulkInsert('Dogs', [highAncestor1, highAncestor2], {});
      const [fetchedHighAncestor1, fetchedHighAncestor2] = await getLatestDogIds(2);
      
      // Create parent generation
      const highGen1Dog1 = createDog('High Parent 1', 'male', 3, 2015, 
        fetchedHighAncestor1.id, fetchedHighAncestor2.id);
      const highGen1Dog2 = createDog('High Parent 2', 'female', 3, 2015, 
        fetchedHighAncestor1.id, fetchedHighAncestor2.id);
      await queryInterface.bulkInsert('Dogs', [highGen1Dog1, highGen1Dog2], {});
      const [fetchedHighGen1Dog1, fetchedHighGen1Dog2] = await getLatestDogIds(2);
      
      // Create the final mating pair (half-siblings)
      const highInbreedingSire = createDog('High Inbreeding Sire', 'male', 3, 2018, 
        fetchedHighGen1Dog1.id, null);
      const highInbreedingDam = createDog('High Inbreeding Dam', 'female', 3, 2018, 
        fetchedHighGen1Dog2.id, null);
      await queryInterface.bulkInsert('Dogs', [highInbreedingSire, highInbreedingDam], {});
      const [fetchedHighInbreedingSire, fetchedHighInbreedingDam] = await getLatestDogIds(2);
      
      // Create the offspring with high inbreeding
      const highInbreedingOffspring = createDog('High Inbreeding Puppy', 'male', 3, 2021, 
        fetchedHighInbreedingSire.id, fetchedHighInbreedingDam.id);
      await queryInterface.bulkInsert('Dogs', [highInbreedingOffspring], {});

      // =============== SCENARIO 4: VERY HIGH INBREEDING (>30%) ===============
      // Full sibling or parent-offspring mating
      console.log('Creating Scenario 4: Very High Inbreeding (>30%)');
      
      // Create parent generation
      const extremeGen1Sire = createDog('Extreme Parent Sire', 'male', 4, 2016);
      const extremeGen1Dam = createDog('Extreme Parent Dam', 'female', 4, 2016);
      await queryInterface.bulkInsert('Dogs', [extremeGen1Sire, extremeGen1Dam], {});
      const [fetchedExtremeGen1Sire, fetchedExtremeGen1Dam] = await getLatestDogIds(2);
      
      // Create siblings
      const extremeSibling1 = createDog('Extreme Sibling 1', 'male', 4, 2019, 
        fetchedExtremeGen1Sire.id, fetchedExtremeGen1Dam.id);
      const extremeSibling2 = createDog('Extreme Sibling 2', 'female', 4, 2019, 
        fetchedExtremeGen1Sire.id, fetchedExtremeGen1Dam.id);
      await queryInterface.bulkInsert('Dogs', [extremeSibling1, extremeSibling2], {});
      const [fetchedExtremeSibling1, fetchedExtremeSibling2] = await getLatestDogIds(2);
      
      // Create the offspring with extreme inbreeding (full siblings mating)
      const extremeInbreedingOffspring = createDog('Extreme Inbreeding Puppy', 'female', 4, 2022, 
        fetchedExtremeSibling1.id, fetchedExtremeSibling2.id);
      await queryInterface.bulkInsert('Dogs', [extremeInbreedingOffspring], {});

      // =============== SCENARIO 5: PARENT-OFFSPRING INBREEDING ===============
      console.log('Creating Scenario 5: Parent-Offspring Inbreeding (>30%)');
      
      // Create parent
      const parentOffspringParent = createDog('Parent-Offspring Base', 'male', 5, 2017);
      await queryInterface.bulkInsert('Dogs', [parentOffspringParent], {});
      const [fetchedParentOffspringParent] = await getLatestDogIds(1);
      
      // Create unrelated mate
      const parentOffspringMate = createDog('Parent-Offspring Mate', 'female', 5, 2017);
      await queryInterface.bulkInsert('Dogs', [parentOffspringMate], {});
      const [fetchedParentOffspringMate] = await getLatestDogIds(1);
      
      // Create first generation offspring
      const parentOffspringChild = createDog('Parent-Offspring Child', 'female', 5, 2020, 
        fetchedParentOffspringParent.id, fetchedParentOffspringMate.id);
      await queryInterface.bulkInsert('Dogs', [parentOffspringChild], {});
      const [fetchedParentOffspringChild] = await getLatestDogIds(1);
      
      // Create parent-offspring inbreeding scenario
      const parentOffspringInbreedingPuppy = createDog('Parent-Offspring Puppy', 'male', 5, 2023, 
        fetchedParentOffspringParent.id, fetchedParentOffspringChild.id);
      await queryInterface.bulkInsert('Dogs', [parentOffspringInbreedingPuppy], {});

      console.log('Finished creating inbreeding test pedigrees.');
      console.log('Low Inbreeding Pair IDs:', fetchedLowInbreedingSire.id, fetchedLowInbreedingDam.id);
      console.log('Moderate Inbreeding Pair IDs:', fetchedModInbreedingSire.id, fetchedModInbreedingDam.id);
      console.log('High Inbreeding Pair IDs:', fetchedHighInbreedingSire.id, fetchedHighInbreedingDam.id);
      console.log('Extreme Inbreeding Pair IDs (Siblings):', fetchedExtremeSibling1.id, fetchedExtremeSibling2.id);
      console.log('Parent-Offspring Inbreeding IDs:', fetchedParentOffspringParent.id, fetchedParentOffspringChild.id);
      
    } catch (error) {
      console.error('Error creating inbreeding test pedigrees:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    // This will only remove dogs created by this seeder if we knew their IDs
    // In practice, it's better to run the master seeder's down method to clean everything
    console.log('Reverting inbreeding test pedigrees is not implemented specifically.');
    // We don't want to delete all dogs as that would affect other seeders
  }
};
