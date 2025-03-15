'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BreedingRecordPuppies', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      breeding_record_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'BreedingRecords',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      puppy_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Dogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.addIndex('BreedingRecordPuppies', ['breeding_record_id'], {
      name: 'record_puppies_record_idx'
    });
    await queryInterface.addIndex('BreedingRecordPuppies', ['puppy_id'], {
      name: 'record_puppies_dog_idx'
    });
    await queryInterface.addIndex('BreedingRecordPuppies', ['breeding_record_id', 'puppy_id'], {
      name: 'record_puppies_unique_idx',
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BreedingRecordPuppies');
  }
};
