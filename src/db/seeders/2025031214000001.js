'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const breedsData = [
      {
        id: "05e33ec0-014b-11ee-b7ff-c595e2066483",
        group: "Non-Sporting",
        origin: "China",
        description: "An ancient breed known for its lion-like mane and dignified expression.",
        temperament: "Reserved, independent",
        average_lifespan: "9-15 years",
        average_height: "17-20 inches",
        average_weight: "45-70 lbs"
      },
      {
        id: "183fb490-90b8-11ec-bd1a-836e2d3f45cf",
        group: "Sporting",
        origin: "Scotland",
        description: "Friendly, intelligent, and devoted; one of the most popular family dogs.",
        temperament: "Friendly, reliable, trustworthy",
        average_lifespan: "10-12 years",
        average_height: "21.5-24 inches",
        average_weight: "55-75 lbs"
      },
      {
        id: "3b1ea140-0aa5-11ec-9aed-8be9659d76a8",
        group: "Working",
        origin: "France",
        description: "A powerful and loyal breed with a distinctive massive head.",
        temperament: "Loyal, affectionate, and protective",
        average_lifespan: "8-10 years",
        average_height: "23-27 inches",
        average_weight: "99-110 lbs"
      },
      {
        id: "3b92fdc0-3aa2-11ed-97e6-712984225c36",
        group: "Toy",
        origin: "England",
        description: "Small in size with a big personality and a fine, silky coat.",
        temperament: "Bold, independent, and spirited",
        average_lifespan: "11-15 years",
        average_height: "7-8 inches",
        average_weight: "4-7 lbs"
      },
      {
        id: "400cee10-31b1-11ec-aa1d-613d8b8563d2",
        group: "Sporting",
        origin: "Canada",
        description: "Outgoing, gentle, and highly trainable, making it a top family pet.",
        temperament: "Gentle, intelligent, and friendly",
        average_lifespan: "10-12 years",
        average_height: "21.5-24.5 inches",
        average_weight: "55-80 lbs"
      },
      {
        id: "419a2040-0d66-11ee-82ea-ed6a72e3c1f0",
        group: "Non-Sporting",
        origin: "Italy",
        description: "Known as a truffle hunting dog, it is cheerful and eager to please.",
        temperament: "Cheerful, devoted, and energetic",
        average_lifespan: "14-15 years",
        average_height: "16-19 inches",
        average_weight: "24-35 lbs"
      },
      {
        id: "4235ba00-b746-11ea-baa5-b5ccf6df0123",
        group: "Working",
        origin: "Central Asia",
        description: "A large, powerful guard dog with a strong protective instinct.",
        temperament: "Confident, aloof, and independent",
        average_lifespan: "10-15 years",
        average_height: "28-35 inches",
        average_weight: "100-220 lbs"
      },
      {
        id: "4235ba00-b746-11ea-baa5-b5ccf6df0843",
        group: "Sporting",
        origin: "United States",
        description: "A lively and affectionate companion with a silky coat and expressive eyes.",
        temperament: "Gentle, friendly, and smart",
        average_lifespan: "12-15 years",
        average_height: "13-15 inches",
        average_weight: "20-30 lbs"
      },
      {
        id: "4bc29a00-f41d-11e5-88db-63910ca4cc68",
        group: "Working",
        origin: "Italy",
        description: "A rare and ancient breed from the Abruzzo region with a strong guarding instinct.",
        temperament: "Loyal, independent, and protective",
        average_lifespan: "10-13 years",
        average_height: "20-25 inches",
        average_weight: "50-70 lbs"
      },
      {
        id: "4db07470-e077-11e5-8a95-c336206736d5",
        group: "Herding",
        origin: "Switzerland",
        description: "A white variant of the German Shepherd known for its striking appearance and agility.",
        temperament: "Confident, protective, and alert",
        average_lifespan: "10-13 years",
        average_height: "22-26 inches",
        average_weight: "50-90 lbs"
      },
      {
        id: "53df6da0-f41d-11e5-a472-1d2136bcf5ed",
        group: "Toy",
        origin: "Germany",
        description: "A small, spirited breed with a monkey-like expression.",
        temperament: "Lively, curious, and playful",
        average_lifespan: "12-14 years",
        average_height: "9-11 inches",
        average_weight: "7-10 lbs"
      },
      {
        id: "58135ca0-45c7-11eb-8a07-39f65cc0268e",
        group: "Working",
        origin: "Caucasus",
        description: "A large and imposing guard dog bred to protect livestock.",
        temperament: "Brave, protective, and calm",
        average_lifespan: "10-12 years",
        average_height: "28-35 inches",
        average_weight: "110-220 lbs"
      },
      {
        id: "5c255b20-91ba-11ed-9502-b398d04efe61",
        group: "Herding",
        origin: "Germany",
        description: "A variant of the classic German Shepherd featuring a longer coat.",
        temperament: "Confident, courageous, and loyal",
        average_lifespan: "9-13 years",
        average_height: "22-26 inches",
        average_weight: "50-90 lbs"
      },
      {
        id: "5e3ce5c0-c8a5-11eb-ae6c-8b58504d1e97",
        group: "Non-Sporting",
        origin: "Germany/France",
        description: "Intelligent, elegant, and highly trainable; originally bred as a water retriever.",
        temperament: "Intelligent, active, and alert",
        average_lifespan: "12-15 years",
        average_height: "15 inches",
        average_weight: "45-70 lbs"
      },
      {
        id: "5e697600-f41d-11e5-be9a-b9f4560a7ade",
        group: "Hound",
        origin: "Afghanistan",
        description: "An elegant breed with long, flowing hair and a dignified demeanor.",
        temperament: "Aloof, dignified, and independent",
        average_lifespan: "10-13 years",
        average_height: "25-29 inches",
        average_weight: "50-60 lbs"
      },
      {
        id: "5ee21650-98da-11ec-903d-bb965db38c8a",
        group: "Working",
        origin: "Switzerland",
        description: "A large, tri-colored mountain dog known for its calm demeanor and strength.",
        temperament: "Good-natured, calm, and affectionate",
        average_lifespan: "7-10 years",
        average_height: "23-27 inches",
        average_weight: "70-115 lbs"
      },
      {
        id: "639e4910-8eb2-11e6-847a-a73e9ea50860",
        group: "Non-Sporting",
        origin: "France",
        description: "Adaptable, playful, and known for its distinctive bat ears.",
        temperament: "Friendly, patient, and affectionate",
        average_lifespan: "10-12 years",
        average_height: "11-12 inches",
        average_weight: "16-28 lbs"
      },
      {
        id: "6805f0b0-a85a-11e6-b241-8f3c26f2bd92",
        group: "Toy",
        origin: "China",
        description: "Distinctive for its wrinkled face and curled tail, the pug is charming and loving.",
        temperament: "Even-tempered, playful, and charming",
        average_lifespan: "12-15 years",
        average_height: "10-12 inches",
        average_weight: "14-18 lbs"
      },
      {
        id: "688f9e80-f41d-11e5-a9a5-219555e9c6b5",
        group: "Primitive",
        origin: "Africa",
        description: "An ancient and rare breed known for its natural hunting and guarding instincts.",
        temperament: "Independent, alert, and resourceful",
        average_lifespan: "12-14 years",
        average_height: "Varies",
        average_weight: "Varies"
      },
      {
        id: "6cd74be0-a8c8-11e6-a298-7dc60f6b10d3",
        group: "Working",
        origin: "England",
        description: "A powerful and imposing dog bred for guarding and protection.",
        temperament: "Courageous, calm, and protective",
        average_lifespan: "8-10 years",
        average_height: "24-27 inches",
        average_weight: "110-130 lbs"
      },
      {
        id: "704e5800-11e4-11e6-be9d-152cfbf5784a",
        group: "Herding",
        origin: "Germany",
        description: "Intelligent, versatile, and one of the most widely used working dogs.",
        temperament: "Confident, courageous, and loyal",
        average_lifespan: "9-13 years",
        average_height: "22-26 inches",
        average_weight: "50-90 lbs"
      },
      {
        id: "71e01600-f41d-11e5-9736-8da1e5c97c5c",
        group: "Herding",
        origin: "Morocco",
        description: "A rare and energetic guard dog from North Africa.",
        temperament: "Loyal, energetic, and alert",
        average_lifespan: "10-12 years",
        average_height: "20-25 inches",
        average_weight: "40-55 lbs"
      },
      {
        id: "73f32f90-e172-11ea-914d-e5b93f4387a3",
        group: "Working",
        origin: "Germany",
        description: "Sleek and powerful, the Dobermann is known for its loyalty and guarding ability.",
        temperament: "Loyal, fearless, and alert",
        average_lifespan: "10-13 years",
        average_height: "26-28 inches",
        average_weight: "75-100 lbs"
      },
      {
        id: "77fb1970-f41d-11e5-a162-0f90ef11cbeb",
        group: "Working",
        origin: "Japan",
        description: "An ancient breed native to Japan with strong guarding instincts.",
        temperament: "Loyal, reserved, and dignified",
        average_lifespan: "12-15 years",
        average_height: "20-25 inches",
        average_weight: "40-60 lbs"
      },
      {
        id: "7c76a610-b1a1-11ee-b5f4-398b22382b47",
        group: "Non-Sporting",
        origin: "France",
        description: "Small, elegant, and smart; an excellent companion and show dog.",
        temperament: "Intelligent, alert, and active",
        average_lifespan: "14-18 years",
        average_height: "10-11 inches",
        average_weight: "6-9 lbs"
      },
      {
        id: "808b84e0-f41d-11e5-bfe1-cfb1c6d8cd76",
        group: "Terrier",
        origin: "England",
        description: "The largest of the terriers, known for its versatility and bold nature.",
        temperament: "Spirited, intelligent, and courageous",
        average_lifespan: "10-13 years",
        average_height: "21-23 inches",
        average_weight: "40-65 lbs"
      },
      {
        id: "808b84e0-f41d-11e5-bfe1-cfb246262640",
        group: "Sporting",
        origin: "Germany",
        description: "A versatile hunting dog that is energetic and friendly.",
        temperament: "Friendly, smart, and energetic",
        average_lifespan: "12-14 years",
        average_height: "21-25 inches",
        average_weight: "45-70 lbs"
      },
      {
        id: "81bff560-9668-11ec-945a-07ea08ed7b75",
        group: "Toy",
        origin: "Germany",
        description: "A small, fluffy companion known for its lively and playful nature.",
        temperament: "Lively, playful, and alert",
        average_lifespan: "12-16 years",
        average_height: "8-11 inches",
        average_weight: "3-7 lbs"
      },
      {
        id: "838a9bd0-2989-11e6-a83e-0540ae6a36dd",
        group: "Working",
        origin: "Italy",
        description: "A large and powerful guard dog with a noble and commanding presence.",
        temperament: "Loyal, confident, and protective",
        average_lifespan: "10-13 years",
        average_height: "23.5-27.5 inches",
        average_weight: "88-110 lbs"
      },
      {
        id: "8443f8c0-0e6e-11eb-9021-6b52892f0522",
        group: "Unknown",
        origin: "Unknown",
        description: "A test breed for development purposes.",
        temperament: "Unknown",
        average_lifespan: "Unknown",
        average_height: "Unknown",
        average_weight: "Unknown"
      },
      {
        id: "84ce2300-e172-11ea-89af-85111b0e995f",
        group: "Working",
        origin: "Argentina",
        description: "A strong, athletic dog bred for big game hunting and guarding.",
        temperament: "Brave, determined, and loyal",
        average_lifespan: "10-12 years",
        average_height: "24-26 inches",
        average_weight: "80-100 lbs"
      },
      {
        id: "8f421a10-f41d-11e5-96b1-c720d2e38982",
        group: "Working",
        origin: "United States",
        description: "A sled dog known for its exceptional endurance and speed.",
        temperament: "Energetic, friendly, and determined",
        average_lifespan: "10-14 years",
        average_height: "20-26 inches",
        average_weight: "38-60 lbs"
      },
      {
        id: "93268600-caf0-11eb-94f8-43e0e2b15179",
        group: "Non-Sporting",
        origin: "England",
        description: "A heavy, muscular breed known for its distinctive wrinkled face and gentle disposition.",
        temperament: "Docile, willful, and friendly",
        average_lifespan: "8-10 years",
        average_height: "12-16 inches",
        average_weight: "40-50 lbs"
      },
      {
        id: "992fb630-b1a1-11ee-8189-8388b6acdc1f",
        group: "Non-Sporting",
        origin: "France",
        description: "A smaller version of the standard poodle known for its intelligence and elegance.",
        temperament: "Intelligent, alert, and active",
        average_lifespan: "14-18 years",
        average_height: "10-11 inches",
        average_weight: "12-18 lbs"
      },
      {
        id: "9b16eff0-f41d-11e5-9a23-6fc0ce3014bb",
        group: "Working",
        origin: "United States",
        description: "Stocky, muscular, and loyal, originally bred for farm work and protection.",
        temperament: "Friendly, confident, and determined",
        average_lifespan: "10-16 years",
        average_height: "20-28 inches",
        average_weight: "60-120 lbs"
      },
      {
        id: "a0fa4ad0-0d66-11ee-bc66-110eaf8006c4",
        group: "Hound",
        origin: "Egypt",
        description: "An ancient sighthound with a sleek appearance and refined features.",
        temperament: "Reserved, dignified, and agile",
        average_lifespan: "12-14 years",
        average_height: "24-30 inches",
        average_weight: "44-55 lbs"
      },
      {
        id: "a3d68270-5116-11e6-b530-4fa7425521cd",
        group: "Hound",
        origin: "Southern Africa",
        description: "Famous for the ridge of hair along its back, it is strong and independent.",
        temperament: "Loyal, dignified, and reserved",
        average_lifespan: "10-12 years",
        average_height: "24-27 inches",
        average_weight: "70-85 lbs"
      },
      {
        id: "a4c45ce0-f41d-11e5-be48-6b79500a2159",
        group: "Working",
        origin: "United States",
        description: "A powerful and athletic breed known for its guarding instincts.",
        temperament: "Protective, confident, and strong-willed",
        average_lifespan: "8-12 years",
        average_height: "24-30 inches",
        average_weight: "110-150 lbs"
      },
      {
        id: "af5f3190-90bc-11ec-8172-b9aff8cb0b9e",
        group: "Toy",
        origin: "United Kingdom",
        description: "Elegant and affectionate, this breed is a popular companion dog.",
        temperament: "Gentle, graceful, and friendly",
        average_lifespan: "9-14 years",
        average_height: "10-12 inches",
        average_weight: "13-18 lbs"
      },
      {
        id: "b0203900-f41d-11e5-9d1c-bdef5470d661",
        group: "Working",
        origin: "England",
        description: "A massive, powerful breed known for its protective nature.",
        temperament: "Protective, courageous, and calm",
        average_lifespan: "8-10 years",
        average_height: "27-30 inches",
        average_weight: "120-230 lbs"
      },
      {
        id: "b80f9390-bbd4-11ee-aeeb-932a53cc2248",
        group: "Sporting",
        origin: "England",
        description: "A versatile hunting dog with high energy and a keen sense of smell.",
        temperament: "Energetic, friendly, and intelligent",
        average_lifespan: "10-12 years",
        average_height: "21-24 inches",
        average_weight: "45-70 lbs"
      },
      {
        id: "b9c644e0-1a5a-11ee-9f49-c5fe059ba4dc",
        group: "Sporting",
        origin: "Germany",
        description: "Similar to the Shorthaired Pointer, this breed is energetic and versatile for hunting.",
        temperament: "Intelligent, energetic, and alert",
        average_lifespan: "12-14 years",
        average_height: "21-25 inches",
        average_weight: "45-70 lbs"
      },
      {
        id: "baeb07e0-2b29-11e6-9c5a-89f90bf4a042",
        group: "Working",
        origin: "Germany",
        description: "A confident, powerful breed with a natural guarding instinct.",
        temperament: "Loyal, confident, and protective",
        average_lifespan: "8-10 years",
        average_height: "23-27 inches",
        average_weight: "80-135 lbs"
      },
      {
        id: "bbdad550-0d67-11ee-ad39-c767f39e6f74",
        group: "Working",
        origin: "Czechoslovakia",
        description: "A unique hybrid of German Shepherd and wolf, developed for versatility.",
        temperament: "Alert, reserved, and independent",
        average_lifespan: "10-12 years",
        average_height: "22-26 inches",
        average_weight: "60-90 lbs"
      },
      {
        id: "cbfa5a60-f41d-11e5-8ff4-e10182f0a68a",
        group: "Working",
        origin: "Russia",
        description: "A breed adapted to cold climates with a calm and loyal nature.",
        temperament: "Loyal, calm, and alert",
        average_lifespan: "10-14 years",
        average_height: "22-26 inches",
        average_weight: "50-90 lbs"
      },
      {
        id: "dca4c480-f41d-11e5-9fa3-79c490e5a5b7",
        group: "Working",
        origin: "Spain",
        description: "A strong, muscular guard dog with a confident demeanor.",
        temperament: "Confident, protective, and determined",
        average_lifespan: "9-11 years",
        average_height: "23-27 inches",
        average_weight: "88-110 lbs"
      },
      {
        id: "ea0cf000-e054-11e5-b95c-71db87b16b29",
        group: "Herding",
        origin: "Switzerland",
        description: "A variant of the Swiss Shepherd, known for its loyalty and alertness.",
        temperament: "Loyal, alert, and dependable",
        average_lifespan: "10-13 years",
        average_height: "22-26 inches",
        average_weight: "50-90 lbs"
      },
      {
        id: "eb72f950-e3b2-11e6-9fbb-9ff4f9010def",
        group: "Working",
        origin: "England",
        description: "A massive, powerful breed known for its gentle nature despite its size.",
        temperament: "Gentle, protective, and dignified",
        average_lifespan: "6-10 years",
        average_height: "27-30 inches",
        average_weight: "120-230 lbs"
      },
      {
        id: "efb17b60-b745-11ea-8529-dd1f47e26170",
        group: "Non-Sporting",
        origin: "Tibet/China",
        description: "Small, sturdy, and affectionate with a long, flowing coat.",
        temperament: "Outgoing, friendly, and playful",
        average_lifespan: "10-16 years",
        average_height: "9-10 inches",
        average_weight: "9-16 lbs"
      }
    ];

    // Update each breed record using its id as identifier
    for (const breed of breedsData) {
      await queryInterface.bulkUpdate(
        'Breeds',
        {
          group: breed.group,
          origin: breed.origin,
          description: breed.description,
          temperament: breed.temperament,
          average_lifespan: breed.average_lifespan,
          average_height: breed.average_height,
          average_weight: breed.average_weight,
          updated_at: new Date()
        },
        { id: breed.id }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // In the down migration, you might want to revert to default or null values.
    // This example sets the additional fields back to null.
    const fieldsToReset = {
      group: null,
      origin: null,
      description: null,
      temperament: null,
      average_lifespan: null,
      average_height: null,
      average_weight: null,
      updated_at: new Date()
    };

    const breedIds = [
      "05e33ec0-014b-11ee-b7ff-c595e2066483",
      "183fb490-90b8-11ec-bd1a-836e2d3f45cf",
      "3b1ea140-0aa5-11ec-9aed-8be9659d76a8",
      "3b92fdc0-3aa2-11ed-97e6-712984225c36",
      "400cee10-31b1-11ec-aa1d-613d8b8563d2",
      "419a2040-0d66-11ee-82ea-ed6a72e3c1f0",
      "4235ba00-b746-11ea-baa5-b5ccf6df0123",
      "4235ba00-b746-11ea-baa5-b5ccf6df0843",
      "4bc29a00-f41d-11e5-88db-63910ca4cc68",
      "4db07470-e077-11e5-8a95-c336206736d5",
      "53df6da0-f41d-11e5-a472-1d2136bcf5ed",
      "58135ca0-45c7-11eb-8a07-39f65cc0268e",
      "5c255b20-91ba-11ed-9502-b398d04efe61",
      "5e3ce5c0-c8a5-11eb-ae6c-8b58504d1e97",
      "5e697600-f41d-11e5-be9a-b9f4560a7ade",
      "5ee21650-98da-11ec-903d-bb965db38c8a",
      "639e4910-8eb2-11e6-847a-a73e9ea50860",
      "6805f0b0-a85a-11e6-b241-8f3c26f2bd92",
      "688f9e80-f41d-11e5-a9a5-219555e9c6b5",
      "6cd74be0-a8c8-11e6-a298-7dc60f6b10d3",
      "704e5800-11e4-11e6-be9d-152cfbf5784a",
      "71e01600-f41d-11e5-9736-8da1e5c97c5c",
      "73f32f90-e172-11ea-914d-e5b93f4387a3",
      "77fb1970-f41d-11e5-a162-0f90ef11cbeb",
      "7c76a610-b1a1-11ee-b5f4-398b22382b47",
      "808b84e0-f41d-11e5-bfe1-cfb1c6d8cd76",
      "808b84e0-f41d-11e5-bfe1-cfb246262640",
      "81bff560-9668-11ec-945a-07ea08ed7b75",
      "838a9bd0-2989-11e6-a83e-0540ae6a36dd",
      "8443f8c0-0e6e-11eb-9021-6b52892f0522",
      "84ce2300-e172-11ea-89af-85111b0e995f",
      "8f421a10-f41d-11e5-96b1-c720d2e38982",
      "93268600-caf0-11eb-94f8-43e0e2b15179",
      "992fb630-b1a1-11ee-8189-8388b6acdc1f",
      "9b16eff0-f41d-11e5-9a23-6fc0ce3014bb",
      "a0fa4ad0-0d66-11ee-bc66-110eaf8006c4",
      "a3d68270-5116-11e6-b530-4fa7425521cd",
      "a4c45ce0-f41d-11e5-be48-6b79500a2159",
      "af5f3190-90bc-11ec-8172-b9aff8cb0b9e",
      "b0203900-f41d-11e5-9d1c-bdef5470d661",
      "b80f9390-bbd4-11ee-aeeb-932a53cc2248",
      "b9c644e0-1a5a-11ee-9f49-c5fe059ba4dc",
      "baeb07e0-2b29-11e6-9c5a-89f90bf4a042",
      "bbdad550-0d67-11ee-ad39-c767f39e6f74",
      "cbfa5a60-f41d-11e5-8ff4-e10182f0a68a",
      "dca4c480-f41d-11e5-9fa3-79c490e5a5b7",
      "ea0cf000-e054-11e5-b95c-71db87b16b29",
      "eb72f950-e3b2-11e6-9fbb-9ff4f9010def",
      "efb17b60-b745-11ea-8529-dd1f47e26170"
    ];

    for (const id of breedIds) {
      await queryInterface.bulkUpdate(
        'Breeds',
        fieldsToReset,
        { id }
      );
    }
  }
};
