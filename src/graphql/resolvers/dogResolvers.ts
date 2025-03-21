import { Op, WhereOptions } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import db from '../../db/models';
import { Sequelize } from 'sequelize';
import { Breed } from '../../db/models/Breed';

// Define enums to match GraphQL schema
enum DogSortField {
  NAME = 'NAME',
  BREED = 'BREED',
  DATE_OF_BIRTH = 'DATE_OF_BIRTH',
  REGISTRATION_NUMBER = 'REGISTRATION_NUMBER',
  CREATED_AT = 'CREATED_AT'
}

enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

// Define input types to match GraphQL schema
interface CreateDogInput {
  name: string;
  breed: string;
  breedId?: string;  // Changed from number to string for UUID
  gender: string;
  color: string;
  dateOfBirth: Date;
  dateOfDeath?: Date;
  height?: number;
  weight?: number;
  // registrationNumber is now auto-generated
  microchipNumber?: string;
  isNeutered?: boolean;
  ownerId?: string;  // Changed from number to string for UUID
  sireId?: string;   // Changed from number to string for UUID
  damId?: string;    // Changed from number to string for UUID
  titles?: string[];
  biography?: string;
  mainImageUrl?: string;
}

interface UpdateDogInput extends Partial<CreateDogInput> {
  id: string;  // Changed from number to string for UUID
}

interface DogImageInput {
  dogId: string;  // Changed from number to string for UUID
  imageUrl: string; // This is the correct field name
  url?: string;     // Added url field for backward compatibility
  caption?: string;
  isPrimary?: boolean;
}
import Logger from '../../utils/logger';
import { LogLevel } from '../../db/models/SystemLog';
import { AuditAction } from '../../db/models/AuditLog';
import { checkAuth } from '../../utils/auth';
import { UserInputError, ForbiddenError } from 'apollo-server-express';

// Helper function to get a dog's pedigree recursively
async function fetchDogPedigreeRecursive(dogId: string, generations: number, currentGen = 0, isAdmin = false): Promise<any> {
  if (currentGen >= generations || !dogId) return null;
  
  const dog = await db.Dog.findByPk(dogId, {
    include: []
  });
  
  if (!dog) return null;
  
  // For ancestors in the pedigree, we still need to check approval status
  // but this check is only applied for non-root nodes (currentGen > 0)
  // since root node has already been checked for permission in the resolver
  if (currentGen > 0 && dog.approvalStatus !== 'APPROVED' && !isAdmin) {
    return null; // Skip non-approved dogs in pedigree for non-admin users
  }
  
  const result: any = dog.toJSON();
  
  if (dog.sireId) {
    result.sire = await fetchDogPedigreeRecursive(dog.sireId, generations, currentGen + 1, isAdmin);
  }
  
  if (dog.damId) {
    result.dam = await fetchDogPedigreeRecursive(dog.damId, generations, currentGen + 1, isAdmin);
  }
  
  return result;
}

// Helper function to generate a unique registration number in KUG format
async function generateRegistrationNumber(): Promise<string> {
  // Get the highest current number
  const maxDog = await db.Dog.findOne({
    order: [['registrationNumber', 'DESC']], // Use the model's attribute name (TypeScript friendly)
    where: {
      registrationNumber: { // Use the model's attribute name (TypeScript friendly)
        [Op.like]: 'KUG %'
      }
    }
  });
  
  let nextNumber = 1; // Default starting number
  
  if (maxDog && maxDog.registrationNumber) {
    // Extract the numeric part and increment
    const matches = maxDog.registrationNumber.match(/KUG (\d+)/);
    if (matches && matches[1]) {
      const currentNumber = parseInt(matches[1], 10);
      nextNumber = isNaN(currentNumber) ? 1 : currentNumber + 1;
    }
  }
  
  // Format with leading zeros to 7 digits
  return `KUG ${nextNumber.toString().padStart(7, '0')}`;
}

const dogResolvers = {
  Query: {
    // Get paginated dogs with optional filtering
    dogs: async (_: any, { 
      offset = 0, 
      limit = 20, 
      searchTerm, 
      breed, 
      breedId,
      gender, 
      ownerId, 
      approvalStatus,
      sortBy = DogSortField.NAME,
      sortDirection = SortDirection.Asc 
    }: {
      offset?: number;
      limit?: number;
      searchTerm?: string;
      breed?: string;
      breedId?: string;  // Changed from number to string for UUID
      gender?: string;
      ownerId?: string;  // Changed from number to string for UUID
      approvalStatus?: string; // 'PENDING', 'APPROVED', 'DECLINED'
      sortBy?: DogSortField;
      sortDirection?: SortDirection;
    }, context: any) => {
      // Build where clause based on filters
      const whereClause: any = {};
      
      if (searchTerm) {
        // Use a more direct Sequelize syntax that's compatible with PostgreSQL
        whereClause[Op.or] = [
          Sequelize.literal(`LOWER("Dog"."name") LIKE LOWER('%${searchTerm}%')`),
          Sequelize.literal(`LOWER("Dog"."registration_number") LIKE LOWER('%${searchTerm}%')`),
          Sequelize.literal(`LOWER("Dog"."microchip_number") LIKE LOWER('%${searchTerm}%')`)
        ];
      }
      
      if (breed) {
        whereClause.breed = Sequelize.literal(`LOWER("Dog"."breed") LIKE LOWER('%${breed}%')`);
      }

      if (breedId) {
        whereClause.breed_id = breedId;
      }
      
      if (gender) {
        whereClause.gender = gender.toLowerCase();
      }
      
      // Handle approval status filtering
      let user = null;
      try {
        user = await checkAuth(context);
      } catch {
        // User is not authenticated, only show approved dogs
        whereClause.approval_status = 'APPROVED';
      }
      
      // If user is not an admin, they can only see approved dogs
      if (user && user.role !== 'ADMIN') {
        whereClause.approval_status = 'APPROVED';
      } else if (user && user.role === 'ADMIN') {
        // Admin can filter by approval status
        if (approvalStatus) {
          whereClause.approval_status = approvalStatus;
        }
      } else {
        // Non-authenticated users can only see approved dogs
        whereClause.approval_status = 'APPROVED';
      }
      
      let ownerInclude = undefined;
      if (ownerId) {
        ownerInclude = {
          model: db.Ownership,
          as: 'ownerships',
          where: {
            ownerId,
            isCurrent: true
          },
          required: true
        };
      }

      // Include Breed model for relationship
      const includes = [];
      includes.push({
        model: db.Breed,
        as: 'breedObj',
        required: false
      });

      if (ownerInclude) {
        includes.push(ownerInclude);
      }
      
      // Determine sort ordering with proper typing for Sequelize
      let order: [string, string][];
      switch (sortBy) {
        case DogSortField.NAME:
          order = [['name', sortDirection]];
          break;
        case DogSortField.BREED:
          order = [['breed', sortDirection]];
          break;
        case DogSortField.DATE_OF_BIRTH:
          order = [['dateOfBirth', sortDirection]];
          break;
        case DogSortField.REGISTRATION_NUMBER:
          order = [['registrationNumber', sortDirection]];
          break;
        case DogSortField.CREATED_AT:
          order = [['createdAt', sortDirection]];
          break;
        default:
          order = [['name', sortDirection]];
      }
      
      // Query with pagination
      const { count, rows } = await db.Dog.findAndCountAll({
        where: whereClause,
        include: includes,
        offset,
        limit,
        order,
        distinct: true
      });
      
      return {
        totalCount: count,
        hasMore: offset + rows.length < count,
        items: rows
      };
    },
    
    // Get a single dog by ID
    dog: async (_: any, { id }: { id: string }, context: any) => {
      try {
        const dog = await db.Dog.findByPk(id);
        if (!dog) {
          throw new UserInputError('DOG_NOT_FOUND');
        }
        
        // Check if user is allowed to view this dog based on approval status
        let user = null;
        try {
          user = await checkAuth(context);
        } catch {
          // User is not authenticated
        }
        
        // Only admin users can see non-approved dogs
        if (dog.approvalStatus !== 'APPROVED' && (!user || user.role !== 'ADMIN')) {
          throw new ForbiddenError('This dog record is not available');
        }
        
        return dog;
      } catch (error) {
        console.error(`Error fetching dog with ID ${id}:`, error);
        throw error;
      }
    },
    
    // Get a dog's pedigree with specified generations
    dogPedigree: async (_: any, { dogId, generations = 3 }: { dogId: string; generations?: number }, context: any) => {
      // First check if the dog exists and has proper approval status
      const dog = await db.Dog.findByPk(dogId);
      if (!dog) {
        throw new UserInputError('DOG_NOT_FOUND');
      }
      
      // Check if user is allowed to view this dog based on approval status
      let user = null;
      try {
        user = await checkAuth(context);
      } catch {
        // User is not authenticated
      }
      
      // Only admin users can see non-approved dogs
      if (dog.approvalStatus !== 'APPROVED' && (!user || user.role !== 'ADMIN')) {
        throw new ForbiddenError('This dog pedigree is not available');
      }
      
      // Fetch the pedigree data once we've confirmed access is allowed
      const isAdmin = !!(user && user.role === 'ADMIN'); // Ensure it's a boolean
      const root = await fetchDogPedigreeRecursive(dogId, generations, 0, isAdmin);
      if (!root) {
        throw new Error('Error fetching pedigree data');
      }
      return root;
    }
  },
  
  Mutation: {
    // Create a new dog
    createDog: async (_: any, { input }: { input: CreateDogInput }, context: any) => {
      // Get authenticated user for logging
      const user = await checkAuth(context);
      try {
        // Validate required fields
        if (!input.name || !input.breed || !input.gender) {
          throw new Error('INVALID_DOG_DATA');
        }
        
        // Generate a unique registration number
        const registrationNumber = await generateRegistrationNumber();

        // If breedId is provided, verify it exists
        if (input.breedId) {
          const breed = await db.Breed.findByPk(input.breedId);
          if (!breed) {
            throw new Error(`Breed with ID ${input.breedId} not found`);
          }
          // Set the breed_id field for the database
          (input as any).breed_id = input.breedId;
        } else {
          // If breedId is not provided, try to find or create a breed by name
          try {
            const [breed] = await db.Breed.findOrCreate({
              where: { name: input.breed },
              defaults: { 
                name: input.breed,
                created_at: new Date(),
                updated_at: new Date()
              } as any
            });
            (input as any).breed_id = breed.id;
          } catch (error) {
            console.error('Error finding or creating breed:', error);
            // Continue without setting breed_id
          }
        }
        
        // Generate UUID for the dog
        const dogId = uuidv4();
        
        // Create the dog with the generated UUID, registration number, and pending approval status
        const newDog = await db.Dog.create({
          ...input as any,
          id: dogId,
          registrationNumber: registrationNumber,
          approvalStatus: 'PENDING' // Set initial status to pending
        });

        // Add ownership association if ownerId is provided
        if (input.ownerId) {
          // Generate UUID for the ownership
          const ownershipId = uuidv4();
          
          // Create the ownership with UUID
          // Use only isCurrent property which will map to is_current in database due to underscored: true setting
          await db.Ownership.create({
            id: ownershipId,
            dogId: newDog.id,
            ownerId: input.ownerId,
            startDate: new Date(),
            isCurrent: true  // This will be mapped to is_current in the database
          });
        }

        // Log the creation in the audit trail
        await db.AuditLog.create({
          timestamp: new Date(),
          action: AuditAction.CREATE,
          entityType: 'Dog',
          entityId: newDog.id, // No need to convert UUID to string
          userId: context.user?.id,
          newState: JSON.stringify(newDog)
        });
        
        // Log to system logs
        await db.SystemLog.create({
          timestamp: new Date(),
          level: LogLevel.INFO,
          message: 'Dog created',
          source: 'DogResolver',
          details: JSON.stringify({
            dogId: newDog.id,
            name: newDog.name,
            userId: context.user?.id
          }),
          userId: context.user?.id
        });
        
        return newDog;
      } catch (error) {
        console.error('Error creating dog:', error);
        throw error;
      }
    },

    // Update an existing dog
    updateDog: async (_: any, { id, input }: { id: string, input: UpdateDogInput }, context: any) => {
      // Get authenticated user for logging
      const user = await checkAuth(context);
      
      try {
        // Find the dog to update
        const dog = await db.Dog.findByPk(id);
        if (!dog) {
          throw new Error('DOG_NOT_FOUND');
        }
        
        // Store previous state for audit logging
        const originalDog = JSON.stringify(dog);
        
        // Update the breed_id if breedId is provided
        if (input.breedId !== undefined) {
          // Verify the breed exists
          const breed = await db.Breed.findByPk(input.breedId);
          if (!breed && input.breedId !== null) {
            throw new Error(`Breed with ID ${input.breedId} not found`);
          }
          
          (input as any).breed_id = input.breedId;
          
          // If breed name is not provided but breedId is, update the breed name
          if (!input.breed && breed) {
            input.breed = breed.name;
          }
        } else if (input.breed && input.breed !== dog.breed) {
          // If only breed name is provided (and changed), try to find or create a breed
          try {
            const [breed] = await db.Breed.findOrCreate({
              where: { name: input.breed },
              defaults: { 
                name: input.breed,
                created_at: new Date(),
                updated_at: new Date()
              } as any
            });
            (input as any).breed_id = breed.id;
          } catch (error) {
            console.error('Error finding or creating breed:', error);
            // Continue without setting breed_id
          }
        }
        
        // Update the dog
        // Cast input to any to avoid type checking issues with ID field types
        await dog.update(input as any);
        
        // Log the update in the audit trail
        await db.AuditLog.create({
          timestamp: new Date(),
          action: AuditAction.UPDATE,
          entityType: 'Dog',
          entityId: dog.id, // No need to convert UUID to string
          userId: context.user?.id,
          previousState: originalDog,
          newState: JSON.stringify(dog)
        });
        
        // Log to system logs
        await db.SystemLog.create({
          timestamp: new Date(),
          level: LogLevel.INFO,
          message: 'Dog updated',
          source: 'DogResolver',
          details: JSON.stringify({
            dogId: dog.id,
            name: dog.name,
            userId: context.user?.id
          }),
          userId: context.user?.id
        });
        
        return dog;
      } catch (error) {
        console.error('Error updating dog:', error);
        throw error;
      }
    },
    
    // Add an image to a dog
    addDogImage: async (_: any, { dogId, input }: { dogId: string, input: DogImageInput }, context: any) => {
      // Get authenticated user for logging
      const user = await checkAuth(context);
      try {
        const dog = await db.Dog.findByPk(dogId);
        if (!dog) {
          throw new Error('DOG_NOT_FOUND');
        }
        
        // If this image is set as primary, set all other images to non-primary
        if (input.isPrimary) {
          await db.DogImage.update(
            { isPrimary: false },
            { where: { dogId } }
          );
          
          // Also update the mainImageUrl in the dog record
          await dog.update({ mainImageUrl: input.imageUrl || input.url || '' });
        }
        
        // Create the image with generated UUID
        const imageId = uuidv4();
        const image = await db.DogImage.create({
          id: imageId,
          dogId: dogId,  // Using UUID string
          url: input.imageUrl || input.url || '',  // Use imageUrl with fallback to url
          imageUrl: input.imageUrl || input.url || '', // Set both URL versions for consistency
          caption: input.caption || null,
          isPrimary: input.isPrimary || false,
          isProfileImage: input.isPrimary || false // Use same value as isPrimary to maintain consistency
        });
        
        return image;
      } catch (error: any) {
        throw new Error(error.message || 'Error adding dog image');
      }
    },
    
    // Delete a dog
    deleteDog: async (_: any, { id }: { id: string }, context: any) => {
      // Get authenticated user for logging
      const user = await checkAuth(context);
      try {
        const dog = await db.Dog.findByPk(id);
        if (!dog) {
          throw new Error('DOG_NOT_FOUND');
        }
        
        // Delete the dog (related records will be cascade deleted due to FK constraints)
        await dog.destroy();
        
        return {
          success: true,
          message: 'Dog deleted successfully'
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || 'Error deleting dog'
        };
      }
    },
    
    // Approve a dog
    approveDog: async (_: any, { id, notes }: { id: string, notes?: string }, context: any) => {
      // Get authenticated user for authorization check
      const user = await checkAuth(context);
      
      // Check if user has admin role
      if (user.role !== 'ADMIN') {
        throw new ForbiddenError('Only administrators can approve dogs');
      }
      
      try {
        // Find the dog to approve
        const dog = await db.Dog.findByPk(id);
        if (!dog) {
          throw new UserInputError('DOG_NOT_FOUND');
        }
        
        // Check if the dog is already approved
        if (dog.approvalStatus === 'APPROVED') {
          throw new UserInputError('Dog is already approved');
        }
        
        // Store previous state for audit logging
        const originalDog = JSON.stringify(dog);
        
        // Update the dog with approval information
        await dog.update({
          approvalStatus: 'APPROVED',
          approvedBy: user.id.toString(), // Convert to string to match the model's type
          approvalDate: new Date(),
          approvalNotes: notes || null
        });
        
        // Log the approval in the audit trail
        await db.AuditLog.create({
          timestamp: new Date(),
          action: AuditAction.APPROVE,
          entityType: 'Dog',
          entityId: id,
          userId: user.id,
          previousState: originalDog,
          newState: JSON.stringify(dog)
        });
        
        // Log to system logs
        await db.SystemLog.create({
          timestamp: new Date(),
          level: LogLevel.INFO,
          message: 'Dog approved',
          source: 'DogResolver',
          details: JSON.stringify({
            dogId: dog.id,
            name: dog.name,
            userId: user.id
          }),
          userId: user.id
        });
        
        return dog;
      } catch (error) {
        console.error('Error approving dog:', error);
        throw error;
      }
    },
    
    // Decline a dog
    declineDog: async (_: any, { id, notes }: { id: string, notes?: string }, context: any) => {
      // Get authenticated user for authorization check
      const user = await checkAuth(context);
      
      // Check if user has admin role
      if (user.role !== 'ADMIN') {
        throw new ForbiddenError('Only administrators can decline dogs');
      }
      
      try {
        // Find the dog to decline
        const dog = await db.Dog.findByPk(id);
        if (!dog) {
          throw new UserInputError('DOG_NOT_FOUND');
        }
        
        // Check if the dog is already declined
        if (dog.approvalStatus === 'DECLINED') {
          throw new UserInputError('Dog is already declined');
        }
        
        // Store previous state for audit logging
        const originalDog = JSON.stringify(dog);
        
        // Update the dog with decline information
        await dog.update({
          approvalStatus: 'DECLINED',
          approvedBy: user.id.toString(), // Convert to string to match the model's type
          approvalDate: new Date(),
          approvalNotes: notes || null
        });
        
        // Log the decline in the audit trail
        await db.AuditLog.create({
          timestamp: new Date(),
          action: AuditAction.REJECT,
          entityType: 'Dog',
          entityId: id,
          userId: user.id,
          previousState: originalDog,
          newState: JSON.stringify(dog)
        });
        
        // Log to system logs
        await db.SystemLog.create({
          timestamp: new Date(),
          level: LogLevel.INFO,
          message: 'Dog declined',
          source: 'DogResolver',
          details: JSON.stringify({
            dogId: dog.id,
            name: dog.name,
            userId: user.id
          }),
          userId: user.id
        });
        
        return dog;
      } catch (error) {
        console.error('Error declining dog:', error);
        throw error;
      }
    }
  },
  
  // Field resolvers
  Dog: {
    // Resolve the breedObj field
    breedObj: async (parent: any) => {
      if (!parent.breed_id) return null;
      
      try {
        return await db.Breed.findByPk(parent.breed_id);
      } catch (error) {
        console.error(`Error fetching breed for dog ${parent.id}:`, error);
        return null;
      }
    },
    
    // Resolve the sire field
    sire: async (parent: any) => {
      if (!parent.sireId) return null;
      return await db.Dog.findByPk(parent.sireId);
    },
    
    // Resolve the dam field
    dam: async (parent: any) => {
      if (!parent.damId) return null;
      return await db.Dog.findByPk(parent.damId);
    },
    
    // Resolve the approvedBy field
    approvedBy: async (parent: any) => {
      if (!parent.approvedBy) return null;
      try {
        return await db.User.findByPk(parent.approvedBy);
      } catch (error) {
        console.error(`Error fetching approver for dog ${parent.id}:`, error);
        return null;
      }
    },
    
    // Resolve offspring
    offspring: async (parent: any) => {
      return await db.Dog.findAll({
        where: {
          [Op.or]: [
            { sireId: parent.id },
            { damId: parent.id }
          ]
        }
      });
    },
    
    // Resolve images
    images: async (parent: any) => {
      return await db.DogImage.findAll({
        where: { dogId: parent.id },
        order: [['isPrimary', 'DESC'], ['createdAt', 'DESC']]
      });
    },
    
    // Resolve ownerships
    ownerships: async (parent: any) => {
      return await db.Ownership.findAll({
        where: { dogId: parent.id },
        order: [['startDate', 'DESC']]
      });
    },
    
    // Resolve current owner
    currentOwner: async (parent: any) => {
      const currentOwnership = await db.Ownership.findOne({
        where: { 
          dogId: parent.id,
          isCurrent: true
        },
        include: [{
          model: db.Owner,
          as: 'owner'
        }]
      });
      
      // Use type assertion since TypeScript doesn't recognize the association property
      return currentOwnership ? (currentOwnership as any).owner || null : null;
    },
    
    // Resolve health records
    healthRecords: async (parent: any) => {
      return await db.HealthRecord.findAll({
        where: { dogId: parent.id },
        order: [['date', 'DESC']]
      });
    },
    
    // Resolve competition results
    competitionResults: async (parent: any) => {
      return await db.CompetitionResult.findAll({
        where: { dogId: parent.id },
        order: [['eventDate', 'DESC']]
      });
    }
  },
  
  // Field resolvers for Ownership
  Ownership: {
    owner: async (parent: any) => {
      return await db.Owner.findByPk(parent.ownerId);
    },
    
    dog: async (parent: any) => {
      return await db.Dog.findByPk(parent.dogId);
    }
  },
  
  // Field resolvers for Owner
  Owner: {
    dogs: async (parent: any) => {
      const ownerships = await db.Ownership.findAll({
        where: { 
          ownerId: parent.id,
          isCurrent: true
        }
      });
      
      const dogIds = ownerships.map(ownership => ownership.dogId);
      
      return await db.Dog.findAll({
        where: { id: dogIds }
      });
    }
  },
  
  // Field resolvers for HealthRecord
  HealthRecord: {
    dog: async (parent: any) => {
      return await db.Dog.findByPk(parent.dogId);
    }
  },
  
  // Field resolvers for CompetitionResult
  CompetitionResult: {
    dog: async (parent: any) => {
      return await db.Dog.findByPk(parent.dogId);
    }
  }
};

export { dogResolvers };
