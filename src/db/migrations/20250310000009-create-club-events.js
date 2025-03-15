'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ClubEvents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      club_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Clubs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Events',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_main_organizer: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      contribution: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.addIndex('ClubEvents', ['club_id'], {
      name: 'club_events_club_id_idx'
    });
    await queryInterface.addIndex('ClubEvents', ['event_id'], {
      name: 'club_events_event_id_idx'
    });
    await queryInterface.addIndex('ClubEvents', ['is_main_organizer'], {
      name: 'club_events_main_organizer_idx'
    });
    // Unique constraint to prevent duplicate associations
    await queryInterface.addIndex('ClubEvents', ['club_id', 'event_id'], {
      name: 'club_events_unique_idx',
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ClubEvents');
  }
};
