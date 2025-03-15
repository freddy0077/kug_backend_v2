'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SystemLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      level: {
        type: Sequelize.ENUM('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      source: {
        type: Sequelize.STRING,
        allowNull: false
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      stack_trace: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('SystemLogs', ['timestamp'], {
      name: 'system_logs_timestamp_idx'
    });
    await queryInterface.addIndex('SystemLogs', ['level'], {
      name: 'system_logs_level_idx'
    });
    await queryInterface.addIndex('SystemLogs', ['user_id'], {
      name: 'system_logs_user_id_idx'
    });
    await queryInterface.addIndex('SystemLogs', ['source'], {
      name: 'system_logs_source_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SystemLogs');
  }
};
