'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Owners', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address_line1: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address_line2: {
        type: Sequelize.STRING,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true
      },
      postal_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      kennel_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      kennel_website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_breeder: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('Owners', ['email'], {
      name: 'owners_email_idx',
      unique: true
    });
    await queryInterface.addIndex('Owners', ['last_name', 'first_name'], {
      name: 'owners_name_idx'
    });
    await queryInterface.addIndex('Owners', ['kennel_name'], {
      name: 'owners_kennel_name_idx'
    });
    await queryInterface.addIndex('Owners', ['is_breeder'], {
      name: 'owners_is_breeder_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Owners');
  }
};
