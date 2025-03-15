'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ownerships', {
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
      owner_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        defaultValue: Sequelize.UUIDV4,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        references: {
          model: 'Owners',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ownership_type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'FULL'
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
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      registration_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      transfer_document_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.addIndex('Ownerships', ['dog_id'], {
      name: 'ownerships_dog_id_idx'
    });
    await queryInterface.addIndex('Ownerships', ['owner_id'], {
      name: 'ownerships_owner_id_idx'
    });
    await queryInterface.addIndex('Ownerships', ['is_active'], {
      name: 'ownerships_is_active_idx'
    });
    await queryInterface.addIndex('Ownerships', ['is_primary'], {
      name: 'ownerships_is_primary_idx'
    });
    // Composite index for the common query of finding current ownerships
    await queryInterface.addIndex('Ownerships', ['dog_id', 'is_active'], {
      name: 'ownerships_dog_active_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Ownerships');
  }
};
