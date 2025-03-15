const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const { Dog } = require('../../models');

async function processDogsCsv() {
  const csvFilePath = path.resolve(__dirname, '../../../kennel-union.csv');
  const dogsToInsert = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const dogData = {
            id: row.id || uuidv4(),
            user_id: row.user_id || null,
            breeder_id: row.breeder_id || null,
            name: row.name || '',
            dob: row.dob || null,
            sex: row.sex || '',
            registration_number: row.registration_number || '',
            titles: row.titles || '',
            performance_titles: row.performance_titles || '',
            appraisal_score: row.appraisal_score || null,
            image_name: row.image_name || '',
            colour: row.colour || '',
            height: row.height || null,
            coat: row.coat || '',
            elbow_ed_results: row.elbow_ed_results || '',
            hip_hd_results: row.hip_hd_results || '',
            tattoo_number: row.tattoo_number || '',
            microchip_number: row.microchip_number || '',
            DNA: row.DNA || '',
            other_health_checks: row.other_health_checks || '',
            confirmed: row.confirmed || false,
            transferred: row.transferred || false,
            delete_request: row.delete_request || false,
            dead: row.dead || false,
            viewed: row.viewed || false,
            created_at: row.created_at || new Date(),
            updated_at: row.updated_at || new Date(),
            deleted_at: row.deleted_at || null,
            other_registration_number: row.other_registration_number || '',
            owner: row.owner || '',
            needs_generation: row.needs_generation || false,
            offspring_count: row.offspring_count || 0,
            other_id: row.other_id || null,
            assessed: row.assessed || false,
            added_by_id: row.added_by_id || null
          };

          dogsToInsert.push(dogData);
        } catch (error) {
          console.error('Error processing dog row:', row, error);
        }
      })
      .on('end', async () => {
        try {
          console.log(`Preparing to insert ${dogsToInsert.length} dogs from CSV`);
          
          // Batch insert to avoid overwhelming the database
          const batchSize = 100;
          for (let i = 0; i < dogsToInsert.length; i += batchSize) {
            const batch = dogsToInsert.slice(i, i + batchSize);
            await Dog.bulkCreate(batch, { 
              ignoreDuplicates: true,
              validate: true 
            });
            console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}`);
          }

          console.log('CSV dog migration completed successfully');
          resolve();
        } catch (error) {
          console.error('Error during bulk dog insertion:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });
  });
}

module.exports = {
  processDogsCsv
};
