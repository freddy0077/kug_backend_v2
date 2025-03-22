'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Starting to update all dogs to APPROVED status...');
    
    // Count dogs before update for verification
    const countBefore = await queryInterface.sequelize.query(
      `SELECT COUNT(*) FROM "Dogs";`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    console.log(`Found ${countBefore[0].count} dogs to update.`);
    
    // Update all dogs to APPROVED status
    const result = await queryInterface.sequelize.query(
      `UPDATE "Dogs" 
       SET approval_status = 'APPROVED',
           approval_date = NOW(),
           approval_notes = 'Auto-approved by system seeder'
       WHERE approval_status != 'APPROVED';`,
      { type: queryInterface.sequelize.QueryTypes.UPDATE }
    );
    
    // Count dogs with each status after update for verification
    const statusCounts = await queryInterface.sequelize.query(
      `SELECT approval_status, COUNT(*) 
       FROM "Dogs" 
       GROUP BY approval_status;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    console.log('Dog approval status counts after update:');
    statusCounts.forEach(status => {
      console.log(`${status.approval_status}: ${status.count}`);
    });
    
    console.log('All dogs have been updated to APPROVED status successfully.');
    
    return;
  },

  async down(queryInterface, Sequelize) {
    // This is a one-way operation - we're not going to revert approvals
    // But for completeness, we could set them all back to PENDING if needed
    console.log('WARNING: Not reverting dog approval statuses back to their original values.');
    console.log('This would require storing original values, which was not implemented.');
    return;
  }
};
