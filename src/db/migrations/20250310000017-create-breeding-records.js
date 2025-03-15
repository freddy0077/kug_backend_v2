'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BreedingRecords', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      breeding_pair_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'BreedingPairs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      breeding_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      birth_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'ABORTED'),
        allowNull: false,
        defaultValue: 'PLANNED'
      },
      litter_size: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      male_puppies: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      female_puppies: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.addIndex('BreedingRecords', ['breeding_pair_id'], {
      name: 'breeding_records_pair_idx'
    });
    await queryInterface.addIndex('BreedingRecords', ['status'], {
      name: 'breeding_records_status_idx'
    });
    await queryInterface.addIndex('BreedingRecords', ['breeding_date'], {
      name: 'breeding_records_date_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BreedingRecords');
  }
};
