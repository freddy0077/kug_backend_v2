'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      event_type: {
        type: Sequelize.ENUM('SHOW', 'COMPETITION', 'SEMINAR', 'TRAINING', 'MEETING', 'SOCIAL', 'OTHER'),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      organizer: {
        type: Sequelize.STRING,
        allowNull: false
      },
      organizer_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      contact_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contact_phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      registration_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      registration_deadline: {
        type: Sequelize.DATE,
        allowNull: true
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_published: {
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
    await queryInterface.addIndex('Events', ['start_date'], {
      name: 'events_start_date_idx'
    });
    await queryInterface.addIndex('Events', ['event_type'], {
      name: 'events_type_idx'
    });
    await queryInterface.addIndex('Events', ['is_published'], {
      name: 'events_published_idx'
    });
    await queryInterface.addIndex('Events', ['organizer_id'], {
      name: 'events_organizer_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Events');
  }
};
