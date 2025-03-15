'use strict';

/**
 * Health record templates for different types of health events
 */
module.exports = {
  VACCINATION: [
    {
      description: 'Annual vaccination',
      possibleResults: [
        'All vaccines administered successfully',
        'Mild reaction observed, follow-up recommended',
        'No adverse reactions observed'
      ],
      veterinarians: [
        'Dr. Sarah Johnson',
        'Dr. Michael Chen',
        'Dr. Emily Rodriguez',
        'Dr. James Wilson'
      ]
    },
    {
      description: 'Rabies vaccination',
      possibleResults: [
        'Vaccination completed, valid for 3 years',
        'Vaccination completed, valid for 1 year',
        'Mild swelling at injection site, resolved in 24 hours'
      ]
    },
    {
      description: 'Distemper, Hepatitis, Parvovirus vaccine',
      possibleResults: [
        'Complete series administered',
        'Booster shot administered',
        'No adverse reactions'
      ]
    }
  ],
  EXAMINATION: [
    {
      description: 'Annual wellness exam',
      possibleResults: [
        'All systems normal',
        'Minor dental concerns noted',
        'Slight weight gain recommended',
        'Weight management plan initiated',
        'Mild joint stiffness observed'
      ]
    },
    {
      description: 'Pre-breeding health assessment',
      possibleResults: [
        'Clear for breeding',
        'Recommended to delay breeding by 3 months',
        'Additional testing recommended',
        'Excellent health, cleared for breeding program'
      ]
    },
    {
      description: 'Senior wellness check',
      possibleResults: [
        'Age-appropriate health status',
        'Minor age-related changes noted',
        'Arthritis management plan initiated',
        'Dental cleaning recommended'
      ]
    }
  ],
  TREATMENT: [
    {
      description: 'Ear infection treatment',
      possibleResults: [
        'Cleared with antibiotics',
        'Follow-up needed in 2 weeks',
        'Chronic condition, maintenance plan established'
      ]
    },
    {
      description: 'Skin allergy management',
      possibleResults: [
        'Responded well to treatment',
        'Allergen identified: food sensitivity',
        'Allergen identified: environmental',
        'Maintenance dose established'
      ]
    },
    {
      description: 'Gastrointestinal upset',
      possibleResults: [
        'Resolved with diet change',
        'Resolved with medication',
        'Dietary sensitivity identified'
      ]
    }
  ],
  SURGERY: [
    {
      description: 'Spay/Neuter procedure',
      possibleResults: [
        'Procedure completed successfully',
        'Excellent recovery',
        'Normal healing progress'
      ]
    },
    {
      description: 'Dental extraction',
      possibleResults: [
        'Successful removal of affected teeth',
        'Recovery as expected',
        'Follow-up in 2 weeks'
      ]
    },
    {
      description: 'Cruciate ligament repair',
      possibleResults: [
        'Successful surgical repair',
        'Physical therapy recommended',
        'Expected full recovery in 3 months'
      ]
    }
  ],
  TEST: [
    {
      description: 'Hip and elbow radiographs',
      possibleResults: [
        'OFA Good hips, Normal elbows',
        'OFA Fair hips, Normal elbows',
        'OFA Excellent hips, Normal elbows',
        'OFA Good hips, Grade I elbows'
      ]
    },
    {
      description: 'Genetic disease panel',
      possibleResults: [
        'Clear for all tested conditions',
        'Carrier for progressive retinal atrophy',
        'Carrier for von Willebrand disease',
        'Clear for all breed-specific conditions'
      ]
    },
    {
      description: 'Cardiac evaluation',
      possibleResults: [
        'Normal cardiac function',
        'Mild murmur detected, monitoring recommended',
        'No evidence of structural heart disease'
      ]
    }
  ],
  OTHER: [
    {
      description: 'Microchip implantation',
      possibleResults: [
        'Microchip successfully implanted and registered',
        'Microchip verified and registration updated'
      ]
    },
    {
      description: 'Nutritional consultation',
      possibleResults: [
        'Diet plan established',
        'Weight management program initiated',
        'Specialized diet recommended for allergies'
      ]
    },
    {
      description: 'Behavioral consultation',
      possibleResults: [
        'Training plan established',
        'Referred to behavioral specialist',
        'Anxiety management protocol initiated'
      ]
    }
  ]
};
