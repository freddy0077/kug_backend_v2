'use strict';
const competitionTemplates = require('./data/competition-templates');
const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Get all dogs from the database
      const dogs = await queryInterface.sequelize.query(
        `SELECT id, date_of_birth, breed FROM "Dogs";`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );
      
      if (dogs.length === 0) {
        console.log('No dogs found in the database. Please run dog seeders first.');
        return;
      }

      console.log(`Creating competition results for dogs...`);
      
      const competitionResults = [];
      const { events, scoreRanges, placements } = competitionTemplates;
      
      // About 60% of dogs participate in competitions
      const competingDogs = dogs.filter(() => Math.random() > 0.4);
      
      for (const dog of competingDogs) {
        // Each competing dog has 1-5 competition results
        const resultCount = Math.floor(Math.random() * 5) + 1;
        
        // Dog's birth date
        const dogBirthDate = new Date(dog.date_of_birth);
        // Dog must be at least 1 year old to compete
        const competitionEligibleDate = new Date(dogBirthDate);
        competitionEligibleDate.setFullYear(competitionEligibleDate.getFullYear() + 1);
        
        // Only proceed if the dog is old enough
        if (competitionEligibleDate > new Date()) {
          continue;
        }
        
        // Days eligible for competition
        const daysEligible = Math.floor((new Date() - competitionEligibleDate) / (1000 * 60 * 60 * 24));
        
        for (let i = 0; i < resultCount; i++) {
          // Select a random event
          const event = events[Math.floor(Math.random() * events.length)];
          
          // Generate a random competition date after eligibility but before now
          const daysAfterEligible = Math.floor(Math.random() * daysEligible);
          const competitionDate = new Date(competitionEligibleDate);
          competitionDate.setDate(competitionDate.getDate() + daysAfterEligible);
          
          // Select a random category
          const category = event.categories[Math.floor(Math.random() * event.categories.length)];
          
          // Determine if the dog earned a title (30% chance)
          const earnedTitle = Math.random() > 0.7 ? 
            event.possibleTitles[Math.floor(Math.random() * event.possibleTitles.length)] : 
            null;
          
          // Determine the placement (rank)
          // 80% chance of placing, 20% chance of participating without placing
          const placed = Math.random() > 0.2;
          const rank = placed ? 
            placements[Math.floor(Math.random() * placements.length)] : 
            null;
          
          // Determine the score/points based on the event type
          let points = null;
          const eventType = Object.keys(scoreRanges).find(type => 
            event.name.toLowerCase().includes(type.toLowerCase())
          ) || Object.keys(scoreRanges)[0];
          
          if (scoreRanges[eventType]) {
            const { min, max } = scoreRanges[eventType];
            // Only assign points if the dog placed
            if (placed) {
              points = Math.floor(Math.random() * (max - min)) + min;
            }
          }
          
          competitionResults.push({
            dog_id: dog.id,
            event_name: event.name,
            event_date: competitionDate,
            category: category,
            rank: rank, // Using rank instead of place as per memory
            title_earned: earnedTitle, // Using title_earned instead of certificate as per memory
            points: points, // Using points instead of score as per memory
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
      
      // Insert all competition results
      await queryInterface.bulkInsert('CompetitionResults', competitionResults, {});
      
      console.log(`Successfully created ${competitionResults.length} competition results!`);
    } catch (error) {
      console.error('Error seeding competition results:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CompetitionResults', null, {});
  }
};
