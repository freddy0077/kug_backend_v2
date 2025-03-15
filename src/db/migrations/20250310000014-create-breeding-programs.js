'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BreedingPrograms', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      program_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      goals: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      breed: {
        type: Sequelize.STRING,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      criteria: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      breeder_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Owners',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.addIndex('BreedingPrograms', ['program_name'], {
      name: 'breeding_programs_name_idx'
    });
    await queryInterface.addIndex('BreedingPrograms', ['breed'], {
      name: 'breeding_programs_breed_idx'
    });
    await queryInterface.addIndex('BreedingPrograms', ['breeder_id'], {
      name: 'breeding_programs_breeder_idx'
    });
    await queryInterface.addIndex('BreedingPrograms', ['is_active'], {
      name: 'breeding_programs_active_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BreedingPrograms');
  }
};
