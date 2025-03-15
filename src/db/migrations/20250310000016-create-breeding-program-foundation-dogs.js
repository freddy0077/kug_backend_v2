'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BreedingProgramFoundationDogs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      breeding_program_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'BreedingPrograms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      dog_id: {
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
    await queryInterface.addIndex('BreedingProgramFoundationDogs', ['breeding_program_id'], {
      name: 'foundation_dogs_program_idx'
    });
    await queryInterface.addIndex('BreedingProgramFoundationDogs', ['dog_id'], {
      name: 'foundation_dogs_dog_idx'
    });
    await queryInterface.addIndex('BreedingProgramFoundationDogs', ['breeding_program_id', 'dog_id'], {
      name: 'foundation_dogs_unique_idx',
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BreedingProgramFoundationDogs');
  }
};
