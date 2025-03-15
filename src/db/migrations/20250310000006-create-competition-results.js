'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CompetitionResults', {
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
      competition_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      competition_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      rank: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      score: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      title_earned: {
        type: Sequelize.STRING,
        allowNull: true
      },
      judge: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      certificate_url: {
        type: Sequelize.STRING,
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
    await queryInterface.addIndex('CompetitionResults', ['dog_id'], {
      name: 'competition_results_dog_id_idx'
    });
    await queryInterface.addIndex('CompetitionResults', ['competition_date'], {
      name: 'competition_results_date_idx'
    });
    await queryInterface.addIndex('CompetitionResults', ['title_earned'], {
      name: 'competition_results_title_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CompetitionResults');
  }
};
