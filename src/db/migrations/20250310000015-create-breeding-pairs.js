'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BreedingPairs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      male_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Dogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      female_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Dogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      breeding_program_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'BreedingPrograms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      pairing_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      inbreeding_coefficient: {
        type: Sequelize.FLOAT,
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
    await queryInterface.addIndex('BreedingPairs', ['male_id'], {
      name: 'breeding_pairs_male_idx'
    });
    await queryInterface.addIndex('BreedingPairs', ['female_id'], {
      name: 'breeding_pairs_female_idx'
    });
    await queryInterface.addIndex('BreedingPairs', ['breeding_program_id'], {
      name: 'breeding_pairs_program_idx'
    });
    await queryInterface.addIndex('BreedingPairs', ['is_active'], {
      name: 'breeding_pairs_active_idx'
    });
    // Unique constraint to prevent duplicate pairings
    await queryInterface.addIndex('BreedingPairs', ['male_id', 'female_id', 'breeding_program_id'], {
      name: 'breeding_pairs_unique_idx',
      unique: true,
      where: {
        is_active: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BreedingPairs');
  }
};
