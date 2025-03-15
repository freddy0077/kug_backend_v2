'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HealthRecords', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        defaultValue: Sequelize.UUIDV4,
        defaultValue: Sequelize.UUIDV4
      },
      dog_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        defaultValue: Sequelize.UUIDV4,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        references: {
          model: 'Dogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      record_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      results: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      veterinarian_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      clinic_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      document_url: {
        type: Sequelize.STRING,
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
    await queryInterface.addIndex('HealthRecords', ['dog_id'], {
      name: 'health_records_dog_id_idx'
    });
    await queryInterface.addIndex('HealthRecords', ['type'], {
      name: 'health_records_type_idx'
    });
    await queryInterface.addIndex('HealthRecords', ['record_date'], {
      name: 'health_records_date_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('HealthRecords');
  }
};
