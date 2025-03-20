'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update all existing dogs with lowercase approval_status to uppercase
    await queryInterface.sequelize.query(`
      UPDATE dogs 
      SET approval_status = 'PENDING' 
      WHERE approval_status = 'pending'
    `);
    
    await queryInterface.sequelize.query(`
      UPDATE dogs 
      SET approval_status = 'APPROVED' 
      WHERE approval_status = 'approved'
    `);
    
    await queryInterface.sequelize.query(`
      UPDATE dogs 
      SET approval_status = 'DECLINED' 
      WHERE approval_status = 'declined'
    `);
  },

  async down(queryInterface, Sequelize) {
    // Revert to lowercase (if needed)
    await queryInterface.sequelize.query(`
      UPDATE dogs 
      SET approval_status = 'pending' 
      WHERE approval_status = 'PENDING'
    `);
    
    await queryInterface.sequelize.query(`
      UPDATE dogs 
      SET approval_status = 'approved' 
      WHERE approval_status = 'APPROVED'
    `);
    
    await queryInterface.sequelize.query(`
      UPDATE dogs 
      SET approval_status = 'declined' 
      WHERE approval_status = 'DECLINED'
    `);
  }
};
