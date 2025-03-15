'use strict';

/**
 * Competition event templates and related information
 */
module.exports = {
  events: [
    {
      name: 'National Dog Show',
      categories: ['Conformation', 'Best of Breed', 'Group', 'Best in Show'],
      possibleTitles: ['BOB', 'BOS', 'Group 1', 'Group 2', 'Group 3', 'BIS']
    },
    {
      name: 'AKC Agility Championship',
      categories: ['Novice', 'Open', 'Excellent', 'Master'],
      possibleTitles: ['NA', 'OA', 'AX', 'MX', 'MACH']
    },
    {
      name: 'Obedience Trial',
      categories: ['Novice', 'Open', 'Utility'],
      possibleTitles: ['CD', 'CDX', 'UD', 'UDX', 'OTCH']
    },
    {
      name: 'Rally Obedience Competition',
      categories: ['Novice', 'Intermediate', 'Advanced', 'Excellent', 'Master'],
      possibleTitles: ['RN', 'RI', 'RA', 'RE', 'RM', 'RAE']
    },
    {
      name: 'Herding Trial',
      categories: ['Started', 'Intermediate', 'Advanced'],
      possibleTitles: ['HS', 'HI', 'HX', 'HC']
    },
    {
      name: 'Field Trial',
      categories: ['Derby', 'Qualifying', 'Open', 'Amateur'],
      possibleTitles: ['FC', 'AFC', 'QAA']
    },
    {
      name: 'Tracking Test',
      categories: ['Tracking Dog', 'Tracking Dog Excellent', 'Variable Surface Tracking'],
      possibleTitles: ['TD', 'TDX', 'VST', 'CT']
    },
    {
      name: 'Scent Work Trial',
      categories: ['Novice', 'Advanced', 'Excellent', 'Master'],
      possibleTitles: ['SWN', 'SWA', 'SWE', 'SWM']
    },
    {
      name: 'Dock Diving',
      categories: ['Novice', 'Junior', 'Senior', 'Master', 'Elite'],
      possibleTitles: ['DN', 'DJ', 'DS', 'DM', 'DE']
    },
    {
      name: 'Regional Specialty Show',
      categories: ['Puppy', 'Bred-by-Exhibitor', 'Open', 'Best of Breed'],
      possibleTitles: ['WD', 'WB', 'BOW', 'BOB', 'BOS']
    }
  ],
  
  // Random score/point ranges based on event type
  scoreRanges: {
    Conformation: { min: 80, max: 100 },
    Agility: { min: 70, max: 100 },
    Obedience: { min: 170, max: 200 },
    Rally: { min: 70, max: 100 },
    Herding: { min: 60, max: 100 },
    Field: { min: 7, max: 10 },
    Tracking: { min: 0, max: 0 }, // Pass/Fail, no scores
    Scent: { min: 75, max: 100 },
    Dock: { min: 5, max: 30 } // Distance in feet
  },
  
  // Placement possibilities
  placements: [1, 2, 3, 4, 5]
};
