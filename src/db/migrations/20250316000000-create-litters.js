'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Litters', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      litter_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      registration_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      breeding_record_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'BreedingRecords',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      sire_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Dogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      dam_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Dogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      whelping_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      total_puppies: {
        type: Sequelize.INTEGER,
        allowNull: false
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
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('Litters', ['litter_name'], {
      name: 'litter_name_idx'
    });
    await queryInterface.addIndex('Litters', ['registration_number'], {
      name: 'litter_reg_num_idx',
      unique: true,
      where: {
        registration_number: {
          [Sequelize.Op.ne]: null
        }
      }
    });
    await queryInterface.addIndex('Litters', ['sire_id'], {
      name: 'litter_sire_idx'
    });
    await queryInterface.addIndex('Litters', ['dam_id'], {
      name: 'litter_dam_idx'
    });
    await queryInterface.addIndex('Litters', ['whelping_date'], {
      name: 'litter_date_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Litters');
  }
};
