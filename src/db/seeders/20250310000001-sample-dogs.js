'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, get the owner IDs to use for the dogs
    const owners = await queryInterface.sequelize.query(
      `SELECT id FROM "Owners";`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (owners.length === 0) {
      console.log('No owners found in the database. Please run owner seeders first.');
      return;
    }

    // Create sample dogs with the retrieved owner IDs
    await queryInterface.bulkInsert('Dogs', [
      {
        name: 'Max',
        breed: 'Golden Retriever',
        gender: 'male',
        date_of_birth: new Date('2020-05-15'),
        date_of_death: null,
        color: 'Golden',
        registration_number: 'AKC123456',
        microchip_number: '900182000123456',
        titles: '{"CH","GCH"}',
        is_neutered: false,
        height: 24,
        weight: 70,
        biography: 'Max is a champion Golden Retriever with an excellent temperament.',
        main_image_url: 'https://example.com/max.jpg',
        sire_id: null,
        dam_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Bella',
        breed: 'Border Collie',
        gender: 'female',
        date_of_birth: new Date('2021-02-10'),
        date_of_death: null,
        color: 'Black and White',
        registration_number: 'AKC789123',
        microchip_number: '900182000654321',
        titles: '{"MACH"}',
        is_neutered: false,
        height: 20,
        weight: 45,
        biography: 'Bella is an agility champion with incredible intelligence and drive.',
        main_image_url: 'https://example.com/bella.jpg',
        sire_id: null,
        dam_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Charlie',
        breed: 'Labrador Retriever',
        gender: 'male',
        date_of_birth: new Date('2019-11-20'),
        date_of_death: null,
        color: 'Yellow',
        registration_number: 'AKC456789',
        microchip_number: '900182000789456',
        titles: '{"CD","CDX"}',
        is_neutered: true,
        height: 23,
        weight: 75,
        biography: 'Charlie is a well-trained obedience dog with a gentle disposition.',
        main_image_url: 'https://example.com/charlie.jpg',
        sire_id: null,
        dam_id: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    console.log('Dogs seeded successfully');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Dogs', null, {});
  }
};
