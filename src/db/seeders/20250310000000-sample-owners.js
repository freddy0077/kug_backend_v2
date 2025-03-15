'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Owners', [
      {
        name: 'Alice Johnson',
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice@example.com',
        contact_email: 'alice@example.com',
        phone_number: '555-123-4567',
        contact_phone: '555-123-4567',
        address: '123 Dog Breeder Lane, New York, NY 10001',
        address_line1: '123 Dog Breeder Lane',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        is_breeder: true,
        user_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Bob Smith',
        first_name: 'Bob',
        last_name: 'Smith',
        email: 'bob@example.com',
        contact_email: 'bob@example.com',
        phone_number: '555-987-6543',
        contact_phone: '555-987-6543',
        address: '456 Canine Club Road, Los Angeles, CA 90001',
        address_line1: '456 Canine Club Road',
        city: 'Los Angeles',
        state: 'CA',
        postal_code: '90001',
        is_breeder: true,
        user_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Carol Williams',
        first_name: 'Carol',
        last_name: 'Williams',
        email: 'carol@example.com',
        contact_email: 'carol@example.com',
        phone_number: '555-456-7890',
        contact_phone: '555-456-7890',
        address: '789 Dogwood Drive, Chicago, IL 60007',
        address_line1: '789 Dogwood Drive',
        city: 'Chicago',
        state: 'IL',
        postal_code: '60007',
        is_breeder: false,
        user_id: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    console.log('Owners seeded successfully');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Owners', null, {});
  }
};
