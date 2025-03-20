'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Dogs', 'approval_status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'approved', 'declined']]
      }
    });
    
    await queryInterface.addColumn('Dogs', 'approved_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    
    await queryInterface.addColumn('Dogs', 'approval_date', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('Dogs', 'approval_notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Dogs', 'approval_status');
    await queryInterface.removeColumn('Dogs', 'approved_by');
    await queryInterface.removeColumn('Dogs', 'approval_date');
    await queryInterface.removeColumn('Dogs', 'approval_notes');
  }
};
