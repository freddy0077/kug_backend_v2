"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dogResolvers = void 0;
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../../db/models"));
// Define enums to match GraphQL schema
var DogSortField;
(function (DogSortField) {
    DogSortField["NAME"] = "NAME";
    DogSortField["BREED"] = "BREED";
    DogSortField["DATE_OF_BIRTH"] = "DATE_OF_BIRTH";
    DogSortField["REGISTRATION_NUMBER"] = "REGISTRATION_NUMBER";
})(DogSortField || (DogSortField = {}));
var SortDirection;
(function (SortDirection) {
    SortDirection["Asc"] = "ASC";
    SortDirection["Desc"] = "DESC";
})(SortDirection || (SortDirection = {}));
const logger_1 = __importDefault(require("../../utils/logger"));
const AuditLog_1 = require("../../db/models/AuditLog");
const auth_1 = require("../../utils/auth");
// Helper function to get a dog's pedigree recursively
async function fetchDogPedigreeRecursive(dogId, generations, currentGen = 0) {
    if (currentGen >= generations || !dogId)
        return null;
    const dog = await models_1.default.Dog.findByPk(dogId, {
        include: []
    });
    if (!dog)
        return null;
    const result = dog.toJSON();
    if (dog.sireId) {
        result.sire = await fetchDogPedigreeRecursive(dog.sireId, generations, currentGen + 1);
    }
    if (dog.damId) {
        result.dam = await fetchDogPedigreeRecursive(dog.damId, generations, currentGen + 1);
    }
    return result;
}
const dogResolvers = {
    Query: {
        // Get paginated dogs with optional filtering
        dogs: async (_, { offset = 0, limit = 20, searchTerm, breed, gender, ownerId, sortBy = DogSortField.NAME, sortDirection = SortDirection.Asc }) => {
            // Build where clause based on filters
            const whereClause = {};
            if (searchTerm) {
                whereClause['$or'] = [
                    { name: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                    { registrationNumber: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                    { microchipNumber: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } }
                ];
            }
            if (breed) {
                whereClause.breed = { [sequelize_1.Op.iLike]: `%${breed}%` };
            }
            if (gender) {
                whereClause.gender = gender.toLowerCase();
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
                default:
                    order = [['name', sortDirection]];
            }
            // Query with pagination
            const { count, rows } = await models_1.default.Dog.findAndCountAll({
                where: whereClause,
                include: ownerInclude ? [ownerInclude] : [],
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
        dog: async (_, { id }) => {
            const dog = await models_1.default.Dog.findByPk(id);
            if (!dog) {
                throw new Error('DOG_NOT_FOUND');
            }
            return dog;
        },
        // Get a dog's pedigree with specified generations
        dogPedigree: async (_, { dogId, generations = 3 }) => {
            // Safely convert dogId to number if it's passed as a string
            const dogIdNumber = typeof dogId === 'string' ? parseInt(dogId, 10) : dogId;
            const root = await fetchDogPedigreeRecursive(dogIdNumber, generations);
            if (!root) {
                throw new Error('DOG_NOT_FOUND');
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
                if (!input.name || !input.breed || !input.gender || !input.registrationNumber) {
                    throw new Error('INVALID_DOG_DATA');
                }
                // Check if dateOfBirth is a valid Date, never undefined
                if (!input.dateOfBirth) {
                    throw new Error('INVALID_DATE_FORMAT: Date of birth is required');
                }
                // Ensure dateOfBirth is a Date object
                const dateOfBirth = new Date(input.dateOfBirth);
                if (isNaN(dateOfBirth.getTime())) {
                    throw new Error('INVALID_DATE_FORMAT: Invalid date of birth');
                }
                // Convert dateOfDeath to Date if provided
                let dateOfDeath = null;
                if (input.dateOfDeath) {
                    dateOfDeath = new Date(input.dateOfDeath);
                    if (isNaN(dateOfDeath.getTime())) {
                        throw new Error('INVALID_DATE_FORMAT: Invalid date of death');
                    }
                }
                // Validate gender
                if (!['male', 'female'].includes(input.gender.toLowerCase())) {
                    throw new Error('INVALID_DOG_DATA: Gender must be either male or female');
                }
                // Check if registration number already exists
                const existingDog = await models_1.default.Dog.findOne({
                    where: { registrationNumber: input.registrationNumber }
                });
                if (existingDog) {
                    throw new Error('REGISTRATION_NUMBER_EXISTS');
                }
                // Create the dog with explicit type handling for optional fields
                const dogData = {
                    name: input.name,
                    breed: input.breed,
                    gender: input.gender.toLowerCase(),
                    dateOfBirth, // Ensure this is always a valid Date
                    dateOfDeath,
                    registrationNumber: input.registrationNumber,
                    color: input.color || null,
                    microchipNumber: input.microchipNumber || null,
                    titles: input.titles || [],
                    isNeutered: input.isNeutered || null,
                    height: input.height || null,
                    weight: input.weight || null,
                    biography: input.biography || null,
                    mainImageUrl: input.mainImageUrl || null,
                    sireId: input.sireId || null,
                    damId: input.damId || null
                };
                // Type assertion to handle optional fields
                const newDog = await models_1.default.Dog.create(dogData);
                // Create ownership record
                if (input.ownerId) {
                    await models_1.default.Ownership.create({
                        dogId: newDog.id,
                        ownerId: input.ownerId,
                        startDate: new Date(),
                        isCurrent: true
                    });
                }
                // Log dog creation in audit trail
                await logger_1.default.logAuditTrail(AuditLog_1.AuditAction.CREATE, 'Dog', newDog.id.toString(), user.id, undefined, JSON.stringify({
                    name: newDog.name,
                    breed: newDog.breed,
                    registrationNumber: newDog.registrationNumber,
                    gender: newDog.gender,
                    dateOfBirth: newDog.dateOfBirth
                }), context.req?.ip, 'Dog profile created');
                return newDog;
            }
            catch (error) {
                throw new Error(error.message || 'Error creating dog');
            }
        },
        // Update an existing dog
        updateDog: async (_, { id, input }) => {
            try {
                const dog = await models_1.default.Dog.findByPk(id);
                if (!dog) {
                    throw new Error('DOG_NOT_FOUND');
                }
                // Prepare update data
                const updateData = { ...input };
                // Validate and convert dateOfBirth if provided
                if (input.dateOfBirth) {
                    const dateOfBirth = new Date(input.dateOfBirth);
                    if (isNaN(dateOfBirth.getTime())) {
                        throw new Error('INVALID_DATE_FORMAT: Invalid date of birth');
                    }
                    updateData.dateOfBirth = dateOfBirth;
                }
                // Validate and convert dateOfDeath if provided
                if (input.dateOfDeath) {
                    const dateOfDeath = new Date(input.dateOfDeath);
                    if (isNaN(dateOfDeath.getTime())) {
                        throw new Error('INVALID_DATE_FORMAT: Invalid date of death');
                    }
                    updateData.dateOfDeath = dateOfDeath;
                }
                else if (input.dateOfDeath === null) {
                    // Allow setting dateOfDeath to null explicitly
                    updateData.dateOfDeath = null;
                }
                // Validate gender if provided
                if (input.gender && !['male', 'female'].includes(input.gender.toLowerCase())) {
                    throw new Error('INVALID_DOG_DATA: Gender must be either male or female');
                }
                // Check registration number if changing
                if (input.registrationNumber && input.registrationNumber !== dog.registrationNumber) {
                    const existingDog = await models_1.default.Dog.findOne({
                        where: {
                            registrationNumber: input.registrationNumber,
                            id: { [sequelize_1.Op.ne]: id }
                        }
                    });
                    if (existingDog) {
                        throw new Error('REGISTRATION_NUMBER_EXISTS');
                    }
                }
                // Update dog
                await dog.update(updateData);
                // Refresh data
                return await models_1.default.Dog.findByPk(Number(id));
            }
            catch (error) {
                throw new Error(error.message || 'Error updating dog');
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
                // Create the image
                const image = await models_1.default.DogImage.create({
                    dogId: parseInt(dogId, 10), // Convert string to number
                    url: input.imageUrl || input.url || '', // Use imageUrl with fallback to url
                    caption: input.caption || null,
                    isPrimary: input.isPrimary || false
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
        }
    },
    // Field resolvers
    Dog: {
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