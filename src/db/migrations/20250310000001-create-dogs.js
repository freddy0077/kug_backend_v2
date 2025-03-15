'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Dogs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      breed: {
        type: Sequelize.STRING,
        allowNull: false
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: false
      },
      breed_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Breeds',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      date_of_birth: {
        type: Sequelize.DATE,
        allowNull: true
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true
      },
      registration_number: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      microchip_number: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      titles: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
      is_neutered: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      height: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      weight: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      biography: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sire_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: true,
        references: {
          model: 'Dogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      dam_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: true,
        references: {
          model: 'Dogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    await queryInterface.addIndex('Dogs', ['registration_number'], {
      name: 'dogs_registration_number_idx',
      unique: true
    });
    await queryInterface.addIndex('Dogs', ['microchip_number'], {
      name: 'dogs_microchip_number_idx',
      unique: true
    });
    await queryInterface.addIndex('Dogs', ['breed_id'], {
      name: 'dogs_breed_idx'
    });
    await queryInterface.addIndex('Dogs', ['sire_id'], {
      name: 'dogs_sire_id_idx'
    });
    await queryInterface.addIndex('Dogs', ['dam_id'], {
      name: 'dogs_dam_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Dogs');
  }
};
