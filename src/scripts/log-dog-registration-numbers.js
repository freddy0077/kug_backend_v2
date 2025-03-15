/**
 * Script to log registration numbers of all dogs in the database
 */
const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Initialize sequelize connection
const sequelize = new Sequelize(config.development);

async function logDogRegistrationNumbers() {
  console.log('Fetching all dog registration numbers...');
  
  try {
    // Query both registration_number and registrationNumber to handle column naming inconsistency
    const [dogs] = await sequelize.query(
      `SELECT id, name, registration_number, registrationNumber FROM "Dogs" ORDER BY id`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    console.log(`Found ${dogs.length} dogs in total\n`);
    
    // Count dogs with registration numbers
    const dogsWithRegistration = dogs.filter(dog => dog.registration_number || dog.registrationNumber);
    console.log(`Dogs with registration numbers: ${dogsWithRegistration.length} (${Math.round(dogsWithRegistration.length / dogs.length * 100)}%)\n`);
    
    // Log each dog's details
    dogsWithRegistration.forEach(dog => {
      const regNum = dog.registration_number || dog.registrationNumber;
      console.log(`ID: ${dog.id}, Name: ${dog.name || 'N/A'}, Registration: ${regNum}`);
    });
    
    // Log dogs without registration numbers
    const dogsWithoutRegistration = dogs.filter(dog => !dog.registration_number && !dog.registrationNumber);
    console.log(`\nNumber of dogs without registration numbers: ${dogsWithoutRegistration.length}`);
    
    // Sample the first 10 dogs without registration numbers
    if (dogsWithoutRegistration.length > 0) {
      console.log('\nSample of dogs without registration numbers:');
      dogsWithoutRegistration.slice(0, 10).forEach(dog => {
        console.log(`ID: ${dog.id}, Name: ${dog.name || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('Error fetching dog registration numbers:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the function if this module is executed directly
if (require.main === module) {
  logDogRegistrationNumbers()
    .then(() => {
      console.log('\nScript completed successfully');
    })
    .catch(err => {
      console.error('Script failed:', err);
      process.exit(1);
    });
}