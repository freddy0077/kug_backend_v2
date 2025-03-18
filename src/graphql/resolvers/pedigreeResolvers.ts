import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Op } from 'sequelize';
import db from '../../db/models';
import { checkAuth } from '../../utils/auth';

interface PedigreeNode {
  id: string;
  name: string;
  registrationNumber: string;
  breed: string;
  breedObj: any | null; // Add breedObj to match Dog type in GraphQL schema
  gender: string;
  dateOfBirth: Date;
  color: string | null;
  titles: string[] | null;
  mainImageUrl: string | null;
  coefficient: number;
  sire: PedigreeNode | null;
  dam: PedigreeNode | null;
}

interface PedigreeCreationResult {
  id: string;
  dog: any;
  generation: number;
  coefficient: number;
  sire: PedigreeCreationResult | null;
  dam: PedigreeCreationResult | null;
}

interface LinebreedingResult {
  dog: any;
  inbreedingCoefficient: number;
  commonAncestors: {
    dog: any;
    occurrences: number;
    pathways: string[];
    contribution: number;
  }[];
  geneticDiversity: number;
  recommendations: string[];
}

interface CreatePedigreeInput {
  dogId: string;
  sireId?: string;
  damId?: string;
  generation?: number;
  coefficient?: number;
}

// Utility function to standardize ID format - supports both numeric IDs and UUID format
const standardizeId = (id: string | number): string => {
  // Always convert to string for consistent comparison
  return String(id);
};

// Check if an ID is in UUID format
const isUuidFormat = (id: string | number): boolean => {
  const idStr = String(id);
  return /-/.test(idStr) || /^[0-9a-f]{8,}$/i.test(idStr);
};

const pedigreeResolvers = {
  Query: {
    // Get a dog's pedigree up to specified number of generations
    dogPedigree: async (_: any, { dogId, generations = 3 }: { dogId: string, generations: number }, context: any) => {
      const user = await checkAuth(context);
      
      // Support both UUID and legacy numeric IDs
      let id: number | string = dogId;
      const numericId = Number(dogId);
      if (!isNaN(numericId)) {
        // Fallback for legacy numeric IDs
        id = numericId;
      }

      // Helper function to build pedigree tree recursively
      const buildPedigreeTree = async (dogId: number | string | null, currentGen: number): Promise<PedigreeNode | null> => {
        if (!dogId || currentGen > generations) return null;

        const dog = await db.Dog.findByPk(dogId, {
          include: [
            { model: db.Breed, as: 'breedObj' } // Include the breed object
          ]
        });
        if (!dog) return null;

        const node: PedigreeNode = {
          id: `${dog.id}`,
          name: dog.name,
          registrationNumber: dog.registrationNumber,
          breed: dog.breed,
          breedObj: dog.breedObj || null, // Add breedObj to the node
          gender: dog.gender,
          dateOfBirth: dog.dateOfBirth,
          color: dog.color,
          titles: dog.titles,
          mainImageUrl: dog.mainImageUrl,
          coefficient: 0, // Default value
          sire: null,
          dam: null
        };

        // Process parent relationships if we haven't reached the generation limit
        if (currentGen < generations) {
          const [sire, dam] = await Promise.all([
            dog.sireId ? buildPedigreeTree(dog.sireId, currentGen + 1) : Promise.resolve(null),
            dog.damId ? buildPedigreeTree(dog.damId, currentGen + 1) : Promise.resolve(null)
          ]);

          node.sire = sire;
          node.dam = dam;
        }

        return node;
      };

      // Build and return the pedigree tree
      const pedigree = await buildPedigreeTree(id, 1);
      if (!pedigree) {
        throw new UserInputError(`Dog with ID ${dogId} not found`);
      }

      return pedigree;
    },

    // Get breeding records for a dog (as sire, dam, or both)
    breedingRecords: async (_: any, { 
      dogId, 
      role = 'BOTH', 
      offset = 0, 
      limit = 20 
    }: { 
      dogId: string, 
      role?: 'SIRE' | 'DAM' | 'BOTH', 
      offset?: number, 
      limit?: number 
    }, context: any) => {
      await checkAuth(context);
      
      // Support both UUID and legacy numeric IDs
      let id: number | string = dogId;
      const numericId = Number(dogId);
      if (!isNaN(numericId)) {
        // Fallback for legacy numeric IDs
        id = numericId;
      }

      // Build query based on the role
      const whereClause: any = {};
      if (role === 'SIRE') {
        whereClause.sireId = id;
      } else if (role === 'DAM') {
        whereClause.damId = id;
      } else {
        // BOTH
        whereClause[Op.or] = [{ sireId: id }, { damId: id }];
      }

      const { count, rows } = await db.BreedingRecord.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['breedingDate', 'DESC']],
        include: [
          { model: db.Dog, as: 'sire' },
          { model: db.Dog, as: 'dam' },
          { model: db.Dog, as: 'puppies' }
        ]
      });

      return {
        totalCount: count,
        hasMore: offset + rows.length < count,
        items: rows
      };
    },

    // Analyze linebreeding for a potential breeding pair
    linebreedingAnalysis: async (_: any, { 
      sireId, 
      damId, 
      generations = 6 
    }: { 
      sireId: string, 
      damId: string, 
      generations?: number 
    }, context: any) => {
      await checkAuth(context);
      
      // Support both UUID and legacy numeric IDs
      let sireIdParsed: number | string = sireId;
      let damIdParsed: number | string = damId;
      const sireIdInt = Number(sireId);
      const damIdInt = Number(damId);
      
      if (!isNaN(sireIdInt)) sireIdParsed = sireIdInt;
      if (!isNaN(damIdInt)) damIdParsed = damIdInt;

      // Get the dog objects
      const [sire, dam] = await Promise.all([
        db.Dog.findByPk(sireIdParsed),
        db.Dog.findByPk(damIdParsed)
      ]);

      if (!sire || !dam) {
        throw new UserInputError('One or both dogs not found');
      }

      if (sire.gender !== 'male' || dam.gender !== 'female') {
        throw new UserInputError('Invalid breeding pair: sire must be male and dam must be female');
      }

      // Helper function to get all ancestors up to a certain generation
      // Returns a map of dog IDs to their info and path details
      const getAllAncestors = async (dogId: number | string, gen: number, path: string = ''): Promise<Map<string, { dog: any, paths: string[] }>> => {
        const result = new Map<string, { dog: any, paths: string[] }>();
        
        if (gen <= 0 || !dogId) return result;
        
        const dog = await db.Dog.findByPk(dogId);
        if (!dog) return result;
        
        const currentPath = path ? `${path} > ${dog.name}` : dog.name;
        
        // Add this dog to the result - using string ID for consistency
        const dogStandardId = standardizeId(dog.id);
        if (result.has(dogStandardId)) {
          result.get(dogStandardId)?.paths.push(currentPath);
        } else {
          result.set(dogStandardId, { dog, paths: [currentPath] });
        }
        
        // Recursively get ancestors
        if (dog.sireId) {
          const sireAncestors = await getAllAncestors(dog.sireId, gen - 1, currentPath);
          sireAncestors.forEach((value, key) => {
            const keyStandardId = standardizeId(key);
            if (result.has(keyStandardId)) {
              result.get(keyStandardId)?.paths.push(...value.paths);
            } else {
              result.set(keyStandardId, value);
            }
          });
        }
        
        if (dog.damId) {
          const damAncestors = await getAllAncestors(dog.damId, gen - 1, currentPath);
          damAncestors.forEach((value, key) => {
            const keyStandardId = standardizeId(key);
            if (result.has(keyStandardId)) {
              result.get(keyStandardId)?.paths.push(...value.paths);
            } else {
              result.set(keyStandardId, value);
            }
          });
        }
        
        return result;
      };
      
      // Get ancestors for both sire and dam
      const [sireAncestors, damAncestors] = await Promise.all([
        getAllAncestors(sireIdParsed, generations),
        getAllAncestors(damIdParsed, generations)
      ]);
      
      // Find common ancestors
      const commonAncestors: {
        dog: any;
        occurrences: number;
        pathways: string[];
        contribution: number;
      }[] = [];
      
      // Simple inbreeding calculation (this is a simplified approach)
      // For a more accurate calculation, the Wright's coefficient should be implemented
      let inbreedingCoefficient = 0;
      
      sireAncestors.forEach((sireAncestor, id) => {
        // Convert ID to consistent format for comparison
        const idStandardized = standardizeId(id);
        
        // Check if this ancestor exists in dam's ancestors using string comparison
        if (damAncestors.has(idStandardized)) {
          const damAncestor = damAncestors.get(idStandardized)!;
          const dog = sireAncestor.dog;
          
          // Convert to PedigreeNode format
          const ancestorNode: PedigreeNode = {
            id: `${dog.id}`,
            name: dog.name,
            registrationNumber: dog.registrationNumber,
            breed: dog.breed,
            breedObj: dog.breedObj || null, // Add breedObj property to match updated interface
            gender: dog.gender,
            dateOfBirth: dog.dateOfBirth,
            color: dog.color,
            titles: dog.titles,
            mainImageUrl: dog.mainImageUrl,
            coefficient: 0, // Default value
            sire: null,
            dam: null
          };
          
          // Calculate contribution (simplified)
          // In a proper implementation, this would be based on the path length
          const pathways = [...sireAncestor.paths, ...damAncestor.paths];
          const contribution = 0.5 ** (pathways[0].split('>').length - 1);
          
          commonAncestors.push({
            dog: ancestorNode,
            occurrences: sireAncestor.paths.length + damAncestor.paths.length,
            pathways,
            contribution
          });
          
          // Add to inbreeding coefficient
          inbreedingCoefficient += contribution;
        }
      });
      
      // Sort by contribution, highest first
      commonAncestors.sort((a, b) => b.contribution - a.contribution);
      
      // Calculate genetic diversity (simplified)
      const geneticDiversity = Math.max(0, 1 - inbreedingCoefficient);
      
      // Generate recommendations
      const recommendations: string[] = [];
      
      if (inbreedingCoefficient > 0.25) {
        recommendations.push('High inbreeding coefficient detected. Consider a different breeding pair.');
      } else if (inbreedingCoefficient > 0.125) {
        recommendations.push('Moderate inbreeding coefficient. Proceed with caution and monitor for health issues.');
      } else {
        recommendations.push('Acceptable inbreeding coefficient. This breeding pair appears genetically diverse.');
      }
      
      if (commonAncestors.length > 0) {
        recommendations.push(`Found ${commonAncestors.length} common ancestors in the pedigree.`);
        
        if (commonAncestors[0].contribution > 0.2) {
          recommendations.push(`${commonAncestors[0].dog.name} has a high genetic contribution (${(commonAncestors[0].contribution * 100).toFixed(1)}%). Consider potential impact on offspring.`);
        }
      } else {
        recommendations.push('No common ancestors found within the specified generations.');
      }
      
      const result: LinebreedingResult = {
        dog: sire, // Representing the main dog of focus
        inbreedingCoefficient,
        commonAncestors,
        geneticDiversity,
        recommendations
      };
      
      return result;
    }
  },

  Mutation: {
    // Create a new breeding record
    createBreedingRecord: async (_: any, { input }: { input: any }, context: any) => {
      await checkAuth(context);
      
      const { sireId, damId, breedingDate, litterSize, comments, puppyIds } = input;
      
      const sireIdInt = parseInt(sireId, 10);
      const damIdInt = parseInt(damId, 10);
      
      if (isNaN(sireIdInt) || isNaN(damIdInt)) {
        throw new UserInputError('Invalid dog IDs');
      }
      
      // Verify both dogs exist and are of the correct gender
      const [sire, dam] = await Promise.all([
        db.Dog.findByPk(sireIdInt),
        db.Dog.findByPk(damIdInt)
      ]);
      
      if (!sire || !dam) {
        throw new UserInputError('One or both dogs not found');
      }
      
      if (sire.gender !== 'Male') {
        throw new UserInputError('Sire must be a male dog');
      }
      
      if (dam.gender !== 'Female') {
        throw new UserInputError('Dam must be a female dog');
      }
      
      // Create the breeding record
      const breedingRecord = await db.BreedingRecord.create({
        sireId: sireIdInt,
        damId: damIdInt,
        breedingDate: new Date(breedingDate),
        litterSize: litterSize || null,
        comments: comments || null
      });
      
      // Link puppies if provided
      if (puppyIds && puppyIds.length > 0) {
        const validPuppyIds = puppyIds
          .map((id: string) => parseInt(id, 10))
          .filter((id: number) => !isNaN(id));
        
        if (validPuppyIds.length > 0) {
          // Verify all puppies exist
          const puppies = await db.Dog.findAll({
            where: { id: { [Op.in]: validPuppyIds } }
          });
          
          if (puppies.length !== validPuppyIds.length) {
            throw new UserInputError('One or more puppies not found');
          }
          
          // Link puppies to breeding record
          await Promise.all(
            validPuppyIds.map((puppyId: number) => 
              db.BreedingRecordPuppy.create({
                breedingRecordId: breedingRecord.id,
                puppyId
              } as any)
            )
          );
          
          // Also update the puppies' sire and dam if not already set
          await Promise.all(
            puppies.map(async (puppy: any) => {
              const updates: any = {};
              if (!puppy.sireId) updates.sireId = sireIdInt;
              if (!puppy.damId) updates.damId = damIdInt;
              
              if (Object.keys(updates).length > 0) {
                await puppy.update(updates);
              }
            })
          );
        }
      }
      
      // Return the breeding record with associations
      return db.BreedingRecord.findByPk(breedingRecord.id, {
        include: [
          { model: db.Dog, as: 'sire' },
          { model: db.Dog, as: 'dam' },
          { model: db.Dog, as: 'puppies' }
        ]
      });
    },
    
    // Update an existing breeding record
    updateBreedingRecord: async (_: any, { id, input }: { id: string, input: any }, context: any) => {
      checkAuth(context);
      
      const breedingRecordId = parseInt(id, 10);
      if (isNaN(breedingRecordId)) {
        throw new UserInputError('Invalid breeding record ID');
      }
      
      const breedingRecord = await db.BreedingRecord.findByPk(breedingRecordId);
      if (!breedingRecord) {
        throw new UserInputError('Breeding record not found');
      }
      
      const { breedingDate, litterSize, comments, puppyIds } = input;
      
      // Update breeding record fields
      const updateData: any = {};
      if (breedingDate) updateData.breedingDate = new Date(breedingDate);
      if (litterSize !== undefined) updateData.litterSize = litterSize;
      if (comments !== undefined) updateData.comments = comments;
      
      await breedingRecord.update(updateData);
      
      // Handle puppies update if provided
      if (puppyIds !== undefined) {
        // Delete existing puppy associations
        await db.BreedingRecordPuppy.destroy({
          where: { breedingRecordId }
        });
        
        // Add new puppy associations
        if (puppyIds && puppyIds.length > 0) {
          const validPuppyIds = puppyIds
            .map((id: string) => parseInt(id, 10))
            .filter((id: number) => !isNaN(id));
          
          if (validPuppyIds.length > 0) {
            // Verify all puppies exist
            const puppies = await db.Dog.findAll({
              where: { id: { [Op.in]: validPuppyIds } }
            });
            
            if (puppies.length !== validPuppyIds.length) {
              throw new UserInputError('One or more puppies not found');
            }
            
            // Link puppies to breeding record
            await Promise.all(
              validPuppyIds.map((puppyId: number) => 
                db.BreedingRecordPuppy.create({
                  breedingRecordId,
                  puppyId
                } as any)
              )
            );
            
            // Also update the puppies' sire and dam if not already set
            await Promise.all(
              puppies.map(async (puppy: any) => {
                const updates: any = {};
                if (!puppy.sireId) updates.sireId = breedingRecord.sireId;
                if (!puppy.damId) updates.damId = breedingRecord.damId;
                
                if (Object.keys(updates).length > 0) {
                  await puppy.update(updates);
                }
              })
            );
          }
        }
      }
      
      // Return the updated breeding record with associations
      return db.BreedingRecord.findByPk(breedingRecordId, {
        include: [
          { model: db.Dog, as: 'sire' },
          { model: db.Dog, as: 'dam' },
          { model: db.Dog, as: 'puppies' }
        ]
      });
    },
    
    // Link a dog to its parents
    linkDogToParents: async (_: any, { dogId, sireId, damId }: { dogId: string, sireId?: string, damId?: string }, context: any) => {
      await checkAuth(context);
      
      // Support both UUID and legacy numeric IDs
      let parsedDogId: string | number = dogId;
      let parsedSireId: string | number | null = sireId || null;
      let parsedDamId: string | number | null = damId || null;
      
      // Try to convert to numeric ID if it's a numeric string (for backward compatibility)
      const dogIdNum = Number(dogId);
      if (!isNaN(dogIdNum) && dogId.match(/^\d+$/)) {
        parsedDogId = dogIdNum;
      }
      
      if (sireId) {
        const sireIdNum = Number(sireId);
        if (!isNaN(sireIdNum) && sireId.match(/^\d+$/)) {
          parsedSireId = sireIdNum;
        }
      }
      
      if (damId) {
        const damIdNum = Number(damId);
        if (!isNaN(damIdNum) && damId.match(/^\d+$/)) {
          parsedDamId = damIdNum;
        }
      }
      
      // Find the dog
      const dog = await db.Dog.findByPk(parsedDogId);
      if (!dog) {
        throw new UserInputError('Dog not found');
      }
      
      // Verify sire and dam exist and are of the correct gender
      if (parsedSireId) {
        const sire = await db.Dog.findByPk(parsedSireId);
        if (!sire) {
          throw new UserInputError('Sire not found');
        }
        if (sire.gender !== 'male') {
          throw new UserInputError('Sire must be a male dog');
        }
      }
      
      if (parsedDamId) {
        const dam = await db.Dog.findByPk(parsedDamId);
        if (!dam) {
          throw new UserInputError('Dam not found');
        }
        if (dam.gender !== 'female') {
          throw new UserInputError('Dam must be a female dog');
        }
      }
      
      // Update the dog
      const updates: any = {};
      if (parsedSireId !== null) updates.sireId = parsedSireId;
      if (parsedDamId !== null) updates.damId = parsedDamId;
      
      await dog.update(updates);
      
      // Return the updated dog
      return db.Dog.findByPk(parsedDogId, {
        include: [
          { model: db.Dog, as: 'sire' },
          { model: db.Dog, as: 'dam' }
        ]
      });
    },

    // Create a pedigree for a dog
    createPedigree: async (_: any, { input }: { input: CreatePedigreeInput }, context: any): Promise<PedigreeCreationResult> => {
      // Authenticate the user
      const user = await checkAuth(context);
      
      const { dogId, sireId, damId, generation = 2, coefficient = 0 } = input;
      
      // Validate input
      const dogIdInt = parseInt(dogId, 10);
      if (isNaN(dogIdInt)) {
        throw new UserInputError('Invalid dog ID');
      }

      // Find the dog
      const dog = await db.Dog.findByPk(dogIdInt);
      if (!dog) {
        throw new UserInputError(`Dog with ID ${dogId} not found`);
      }

      // Create the pedigree node
      const pedigreeNode: PedigreeCreationResult = {
        id: `pedigree-${dogId}`, // Creating a unique ID for the pedigree node
        dog: dog,
        generation: generation,
        coefficient: coefficient,
        sire: null,
        dam: null
      };

      // Add sire if provided
      if (sireId) {
        const sireIdInt = parseInt(sireId, 10);
        if (!isNaN(sireIdInt)) {
          const sire = await db.Dog.findByPk(sireIdInt);
          if (sire) {
            pedigreeNode.sire = {
              id: `pedigree-${sireId}`,
              dog: sire,
              generation: generation + 1,
              coefficient: coefficient,
              sire: null,
              dam: null
            } as PedigreeCreationResult;
          }
        }
      }

      // Add dam if provided
      if (damId) {
        const damIdInt = parseInt(damId, 10);
        if (!isNaN(damIdInt)) {
          const dam = await db.Dog.findByPk(damIdInt);
          if (dam) {
            pedigreeNode.dam = {
              id: `pedigree-${damId}`,
              dog: dam,
              generation: generation + 1,
              coefficient: coefficient,
              sire: null,
              dam: null
            } as PedigreeCreationResult;
          }
        }
      }

      return pedigreeNode;
    }
  }
};

export default pedigreeResolvers;
