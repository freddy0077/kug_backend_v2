"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dogResolvers = void 0;
const sequelize_1 = require("sequelize");
const uuid_1 = require("uuid");
const models_1 = __importDefault(require("../../db/models"));
const sequelize_2 = require("sequelize");
// Define enums to match GraphQL schema
var DogSortField;
(function (DogSortField) {
    DogSortField["NAME"] = "NAME";
    DogSortField["BREED"] = "BREED";
    DogSortField["DATE_OF_BIRTH"] = "DATE_OF_BIRTH";
    DogSortField["REGISTRATION_NUMBER"] = "REGISTRATION_NUMBER";
    DogSortField["CREATED_AT"] = "CREATED_AT";
})(DogSortField || (DogSortField = {}));
var SortDirection;
(function (SortDirection) {
    SortDirection["Asc"] = "ASC";
    SortDirection["Desc"] = "DESC";
})(SortDirection || (SortDirection = {}));
const SystemLog_1 = require("../../db/models/SystemLog");
const AuditLog_1 = require("../../db/models/AuditLog");
const auth_1 = require("../../utils/auth");
const apollo_server_express_1 = require("apollo-server-express");
// Helper function to get a dog's pedigree recursively
async function fetchDogPedigreeRecursive(dogId, generations, currentGen = 0, isAdmin = false) {
    if (currentGen >= generations || !dogId)
        return null;
    const dog = await models_1.default.Dog.findByPk(dogId, {
        include: []
    });
    if (!dog)
        return null;
    // For ancestors in the pedigree, we still need to check approval status
    // but this check is only applied for non-root nodes (currentGen > 0)
    // since root node has already been checked for permission in the resolver
    if (currentGen > 0 && dog.approvalStatus !== 'APPROVED' && !isAdmin) {
        return null; // Skip non-approved dogs in pedigree for non-admin users
    }
    const result = dog.toJSON();
    // Convert approval status to uppercase if it's lowercase
    if (result.approvalStatus && typeof result.approvalStatus === 'string') {
        result.approvalStatus = result.approvalStatus.toUpperCase();
    }
    if (dog.sireId) {
        result.sire = await fetchDogPedigreeRecursive(dog.sireId, generations, currentGen + 1, isAdmin);
    }
    if (dog.damId) {
        result.dam = await fetchDogPedigreeRecursive(dog.damId, generations, currentGen + 1, isAdmin);
    }
    return result;
}
// Helper function to generate a unique registration number in KUG format
async function generateRegistrationNumber() {
    // Get the highest current number
    const maxDog = await models_1.default.Dog.findOne({
        order: [['registrationNumber', 'DESC']], // Use the model's attribute name (TypeScript friendly)
        where: {
            registrationNumber: {
                [sequelize_1.Op.like]: 'KUG %'
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
        dogs: async (_, { offset = 0, limit = 20, searchTerm, breed, breedId, gender, ownerId, approvalStatus, sortBy = DogSortField.NAME, sortDirection = SortDirection.Asc }, context) => {
            // Build where clause based on filters
            const whereClause = {};
            if (searchTerm) {
                // Use a more direct Sequelize syntax that's compatible with PostgreSQL
                whereClause[sequelize_1.Op.or] = [
                    sequelize_2.Sequelize.literal(`LOWER("Dog"."name") LIKE LOWER('%${searchTerm}%')`),
                    sequelize_2.Sequelize.literal(`LOWER("Dog"."registration_number") LIKE LOWER('%${searchTerm}%')`),
                    sequelize_2.Sequelize.literal(`LOWER("Dog"."microchip_number") LIKE LOWER('%${searchTerm}%')`)
                ];
            }
            if (breed) {
                whereClause.breed = sequelize_2.Sequelize.literal(`LOWER("Dog"."breed") LIKE LOWER('%${breed}%')`);
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
                user = await (0, auth_1.checkAuth)(context);
            }
            catch {
                // User is not authenticated, only show approved dogs
                whereClause.approval_status = 'APPROVED';
            }
            // If user is not an admin, they can only see approved dogs
            if (user && user.role !== 'ADMIN') {
                whereClause.approval_status = 'APPROVED';
            }
            else if (user && user.role === 'ADMIN') {
                // Admin can filter by approval status
                if (approvalStatus) {
                    whereClause.approval_status = approvalStatus;
                }
            }
            else {
                // Non-authenticated users can only see approved dogs
                whereClause.approval_status = 'APPROVED';
            }
            let ownerInclude = undefined;
            if (ownerId) {
                ownerInclude = {
                    model: models_1.default.Ownership,
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
                model: models_1.default.Breed,
                as: 'breedObj',
                required: false
            });
            if (ownerInclude) {
                includes.push(ownerInclude);
            }
            // Determine sort ordering with proper typing for Sequelize
            let order;
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
            const { count, rows } = await models_1.default.Dog.findAndCountAll({
                where: whereClause,
                include: includes,
                offset,
                limit,
                order,
                distinct: true
            });
            // Convert any lowercase approval status values to uppercase to match the GraphQL enum
            const normalizedRows = rows.map(dog => {
                // Create a new object to avoid modifying the Sequelize model directly
                const dogJson = dog.toJSON();
                // Convert approval status to uppercase if it's lowercase
                if (dogJson.approvalStatus && typeof dogJson.approvalStatus === 'string') {
                    dogJson.approvalStatus = dogJson.approvalStatus.toUpperCase();
                }
                return dogJson;
            });
            return {
                totalCount: count,
                hasMore: offset + rows.length < count,
                items: normalizedRows
            };
        },
        // Get a single dog by ID
        dog: async (_, { id }, context) => {
            try {
                const dog = await models_1.default.Dog.findByPk(id);
                if (!dog) {
                    throw new apollo_server_express_1.UserInputError('DOG_NOT_FOUND');
                }
                // Check if user is allowed to view this dog based on approval status
                let user = null;
                try {
                    user = await (0, auth_1.checkAuth)(context);
                }
                catch {
                    // User is not authenticated
                }
                // Only admin users can see non-approved dogs
                if (dog.approvalStatus !== 'APPROVED' && (!user || user.role !== 'ADMIN')) {
                    throw new apollo_server_express_1.ForbiddenError('This dog record is not available');
                }
                // Create a new object to avoid modifying the Sequelize model directly
                const dogJson = dog.toJSON();
                // Convert approval status to uppercase if it's lowercase
                if (dogJson.approvalStatus && typeof dogJson.approvalStatus === 'string') {
                    dogJson.approvalStatus = dogJson.approvalStatus.toUpperCase();
                }
                return dogJson;
            }
            catch (error) {
                console.error(`Error fetching dog with ID ${id}:`, error);
                throw error;
            }
        },
        // Get a dog's pedigree with specified generations
        dogPedigree: async (_, { dogId, generations = 3 }, context) => {
            // First check if the dog exists and has proper approval status
            const dog = await models_1.default.Dog.findByPk(dogId);
            if (!dog) {
                throw new apollo_server_express_1.UserInputError('DOG_NOT_FOUND');
            }
            // Check if user is allowed to view this dog based on approval status
            let user = null;
            try {
                user = await (0, auth_1.checkAuth)(context);
            }
            catch {
                // User is not authenticated
            }
            // Only admin users can see non-approved dogs
            if (dog.approvalStatus !== 'APPROVED' && (!user || user.role !== 'ADMIN')) {
                throw new apollo_server_express_1.ForbiddenError('This dog pedigree is not available');
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
        createDog: async (_, { input }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                // Validate required fields
                if (!input.name || !input.breed || !input.gender) {
                    throw new Error('INVALID_DOG_DATA');
                }
                // Generate a unique registration number
                const registrationNumber = await generateRegistrationNumber();
                // If breedId is provided, verify it exists
                if (input.breedId) {
                    const breed = await models_1.default.Breed.findByPk(input.breedId);
                    if (!breed) {
                        throw new Error(`Breed with ID ${input.breedId} not found`);
                    }
                    // Set the breed_id field for the database
                    input.breed_id = input.breedId;
                }
                else {
                    // If breedId is not provided, try to find or create a breed by name
                    try {
                        const [breed] = await models_1.default.Breed.findOrCreate({
                            where: { name: input.breed },
                            defaults: {
                                name: input.breed,
                                created_at: new Date(),
                                updated_at: new Date()
                            }
                        });
                        input.breed_id = breed.id;
                    }
                    catch (error) {
                        console.error('Error finding or creating breed:', error);
                        // Continue without setting breed_id
                    }
                }
                // Generate UUID for the dog
                const dogId = (0, uuid_1.v4)();
                // Create the dog with the generated UUID, registration number, and pending approval status
                const newDog = await models_1.default.Dog.create({
                    ...input,
                    id: dogId,
                    registrationNumber: registrationNumber,
                    approvalStatus: 'PENDING' // Set initial status to pending
                });
                // Add ownership association if ownerId is provided
                if (input.ownerId) {
                    // Generate UUID for the ownership
                    const ownershipId = (0, uuid_1.v4)();
                    // Create the ownership with UUID
                    // Use only isCurrent property which will map to is_current in database due to underscored: true setting
                    await models_1.default.Ownership.create({
                        id: ownershipId,
                        dogId: newDog.id,
                        ownerId: input.ownerId,
                        startDate: new Date(),
                        isCurrent: true // This will be mapped to is_current in the database
                    });
                }
                // Log the creation in the audit trail
                await models_1.default.AuditLog.create({
                    timestamp: new Date(),
                    action: AuditLog_1.AuditAction.CREATE,
                    entityType: 'Dog',
                    entityId: newDog.id, // No need to convert UUID to string
                    userId: context.user?.id,
                    newState: JSON.stringify(newDog)
                });
                // Log to system logs
                await models_1.default.SystemLog.create({
                    timestamp: new Date(),
                    level: SystemLog_1.LogLevel.INFO,
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
            }
            catch (error) {
                console.error('Error creating dog:', error);
                throw error;
            }
        },
        // Update an existing dog
        updateDog: async (_, { id, input }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                // Find the dog to update
                const dog = await models_1.default.Dog.findByPk(id);
                if (!dog) {
                    throw new Error('DOG_NOT_FOUND');
                }
                // Store previous state for audit logging
                const originalDog = JSON.stringify(dog);
                // Update the breed_id if breedId is provided
                if (input.breedId !== undefined) {
                    // Verify the breed exists
                    const breed = await models_1.default.Breed.findByPk(input.breedId);
                    if (!breed && input.breedId !== null) {
                        throw new Error(`Breed with ID ${input.breedId} not found`);
                    }
                    input.breed_id = input.breedId;
                    // If breed name is not provided but breedId is, update the breed name
                    if (!input.breed && breed) {
                        input.breed = breed.name;
                    }
                }
                else if (input.breed && input.breed !== dog.breed) {
                    // If only breed name is provided (and changed), try to find or create a breed
                    try {
                        const [breed] = await models_1.default.Breed.findOrCreate({
                            where: { name: input.breed },
                            defaults: {
                                name: input.breed,
                                created_at: new Date(),
                                updated_at: new Date()
                            }
                        });
                        input.breed_id = breed.id;
                    }
                    catch (error) {
                        console.error('Error finding or creating breed:', error);
                        // Continue without setting breed_id
                    }
                }
                // Update the dog
                // Cast input to any to avoid type checking issues with ID field types
                await dog.update(input);
                // Log the update in the audit trail
                await models_1.default.AuditLog.create({
                    timestamp: new Date(),
                    action: AuditLog_1.AuditAction.UPDATE,
                    entityType: 'Dog',
                    entityId: dog.id, // No need to convert UUID to string
                    userId: context.user?.id,
                    previousState: originalDog,
                    newState: JSON.stringify(dog)
                });
                // Log to system logs
                await models_1.default.SystemLog.create({
                    timestamp: new Date(),
                    level: SystemLog_1.LogLevel.INFO,
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
            }
            catch (error) {
                console.error('Error updating dog:', error);
                throw error;
            }
        },
        // Add an image to a dog
        addDogImage: async (_, { dogId, input }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                const dog = await models_1.default.Dog.findByPk(dogId);
                if (!dog) {
                    throw new Error('DOG_NOT_FOUND');
                }
                // If this image is set as primary, set all other images to non-primary
                if (input.isPrimary) {
                    await models_1.default.DogImage.update({ isPrimary: false }, { where: { dogId } });
                    // Also update the mainImageUrl in the dog record
                    await dog.update({ mainImageUrl: input.imageUrl || input.url || '' });
                }
                // Create the image with generated UUID
                const imageId = (0, uuid_1.v4)();
                const image = await models_1.default.DogImage.create({
                    id: imageId,
                    dogId: dogId, // Using UUID string
                    url: input.imageUrl || input.url || '', // Use imageUrl with fallback to url
                    imageUrl: input.imageUrl || input.url || '', // Set both URL versions for consistency
                    caption: input.caption || null,
                    isPrimary: input.isPrimary || false,
                    isProfileImage: input.isPrimary || false // Use same value as isPrimary to maintain consistency
                });
                return image;
            }
            catch (error) {
                throw new Error(error.message || 'Error adding dog image');
            }
        },
        // Delete a dog
        deleteDog: async (_, { id }, context) => {
            // Get authenticated user for logging
            const user = await (0, auth_1.checkAuth)(context);
            try {
                const dog = await models_1.default.Dog.findByPk(id);
                if (!dog) {
                    throw new Error('DOG_NOT_FOUND');
                }
                // Delete the dog (related records will be cascade deleted due to FK constraints)
                await dog.destroy();
                return {
                    success: true,
                    message: 'Dog deleted successfully'
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: error.message || 'Error deleting dog'
                };
            }
        },
        // Approve a dog
        approveDog: async (_, { id, notes }, context) => {
            // Get authenticated user for authorization check
            const user = await (0, auth_1.checkAuth)(context);
            // Check if user has admin role
            if (user.role !== 'ADMIN') {
                throw new apollo_server_express_1.ForbiddenError('Only administrators can approve dogs');
            }
            try {
                // Find the dog to approve
                const dog = await models_1.default.Dog.findByPk(id);
                if (!dog) {
                    throw new apollo_server_express_1.UserInputError('DOG_NOT_FOUND');
                }
                // Check if the dog is already approved
                if (dog.approvalStatus === 'APPROVED') {
                    throw new apollo_server_express_1.UserInputError('Dog is already approved');
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
                await models_1.default.AuditLog.create({
                    timestamp: new Date(),
                    action: AuditLog_1.AuditAction.APPROVE,
                    entityType: 'Dog',
                    entityId: id,
                    userId: user.id,
                    previousState: originalDog,
                    newState: JSON.stringify(dog)
                });
                // Log to system logs
                await models_1.default.SystemLog.create({
                    timestamp: new Date(),
                    level: SystemLog_1.LogLevel.INFO,
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
            }
            catch (error) {
                console.error('Error approving dog:', error);
                throw error;
            }
        },
        // Decline a dog
        declineDog: async (_, { id, notes }, context) => {
            // Get authenticated user for authorization check
            const user = await (0, auth_1.checkAuth)(context);
            // Check if user has admin role
            if (user.role !== 'ADMIN') {
                throw new apollo_server_express_1.ForbiddenError('Only administrators can decline dogs');
            }
            try {
                // Find the dog to decline
                const dog = await models_1.default.Dog.findByPk(id);
                if (!dog) {
                    throw new apollo_server_express_1.UserInputError('DOG_NOT_FOUND');
                }
                // Check if the dog is already declined
                if (dog.approvalStatus === 'DECLINED') {
                    throw new apollo_server_express_1.UserInputError('Dog is already declined');
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
                await models_1.default.AuditLog.create({
                    timestamp: new Date(),
                    action: AuditLog_1.AuditAction.REJECT,
                    entityType: 'Dog',
                    entityId: id,
                    userId: user.id,
                    previousState: originalDog,
                    newState: JSON.stringify(dog)
                });
                // Log to system logs
                await models_1.default.SystemLog.create({
                    timestamp: new Date(),
                    level: SystemLog_1.LogLevel.INFO,
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
            }
            catch (error) {
                console.error('Error declining dog:', error);
                throw error;
            }
        }
    },
    // Field resolvers
    Dog: {
        // Resolve the breedObj field
        breedObj: async (parent) => {
            if (!parent.breed_id)
                return null;
            try {
                return await models_1.default.Breed.findByPk(parent.breed_id);
            }
            catch (error) {
                console.error(`Error fetching breed for dog ${parent.id}:`, error);
                return null;
            }
        },
        // Resolve the sire field
        sire: async (parent) => {
            if (!parent.sireId)
                return null;
            return await models_1.default.Dog.findByPk(parent.sireId);
        },
        // Resolve the dam field
        dam: async (parent) => {
            if (!parent.damId)
                return null;
            return await models_1.default.Dog.findByPk(parent.damId);
        },
        // Resolve the approvedBy field
        approvedBy: async (parent) => {
            if (!parent.approvedBy)
                return null;
            try {
                return await models_1.default.User.findByPk(parent.approvedBy);
            }
            catch (error) {
                console.error(`Error fetching approver for dog ${parent.id}:`, error);
                return null;
            }
        },
        // Resolve offspring
        offspring: async (parent) => {
            return await models_1.default.Dog.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { sireId: parent.id },
                        { damId: parent.id }
                    ]
                }
            });
        },
        // Resolve images
        images: async (parent) => {
            return await models_1.default.DogImage.findAll({
                where: { dogId: parent.id },
                order: [['isPrimary', 'DESC'], ['createdAt', 'DESC']]
            });
        },
        // Resolve ownerships
        ownerships: async (parent) => {
            return await models_1.default.Ownership.findAll({
                where: { dogId: parent.id },
                order: [['startDate', 'DESC']]
            });
        },
        // Resolve current owner
        currentOwner: async (parent) => {
            const currentOwnership = await models_1.default.Ownership.findOne({
                where: {
                    dogId: parent.id,
                    isCurrent: true
                },
                include: [{
                        model: models_1.default.Owner,
                        as: 'owner'
                    }]
            });
            // Use type assertion since TypeScript doesn't recognize the association property
            return currentOwnership ? currentOwnership.owner || null : null;
        },
        // Resolve health records
        healthRecords: async (parent) => {
            return await models_1.default.HealthRecord.findAll({
                where: { dogId: parent.id },
                order: [['date', 'DESC']]
            });
        },
        // Resolve competition results
        competitionResults: async (parent) => {
            return await models_1.default.CompetitionResult.findAll({
                where: { dogId: parent.id },
                order: [['eventDate', 'DESC']]
            });
        }
    },
    // Field resolvers for Ownership
    Ownership: {
        owner: async (parent) => {
            return await models_1.default.Owner.findByPk(parent.ownerId);
        },
        dog: async (parent) => {
            return await models_1.default.Dog.findByPk(parent.dogId);
        }
    },
    // Field resolvers for Owner
    Owner: {
        dogs: async (parent) => {
            const ownerships = await models_1.default.Ownership.findAll({
                where: {
                    ownerId: parent.id,
                    isCurrent: true
                }
            });
            const dogIds = ownerships.map(ownership => ownership.dogId);
            return await models_1.default.Dog.findAll({
                where: { id: dogIds }
            });
        }
    },
    // Field resolvers for HealthRecord
    HealthRecord: {
        dog: async (parent) => {
            return await models_1.default.Dog.findByPk(parent.dogId);
        }
    },
    // Field resolvers for CompetitionResult
    CompetitionResult: {
        dog: async (parent) => {
            return await models_1.default.Dog.findByPk(parent.dogId);
        }
    }
};
exports.dogResolvers = dogResolvers;
//# sourceMappingURL=dogResolvers.js.map