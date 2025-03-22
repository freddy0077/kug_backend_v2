"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const sequelize_1 = require("sequelize");
const models_1 = __importDefault(require("../../db/models"));
const auth_1 = require("../../utils/auth");
// Utility function to standardize ID format - supports both numeric IDs and UUID format
const standardizeId = (id) => {
    // Always convert to string for consistent comparison
    return String(id);
};
// Check if an ID is in UUID format
const isUuidFormat = (id) => {
    const idStr = String(id);
    return /-/.test(idStr) || /^[0-9a-f]{8,}$/i.test(idStr);
};
const pedigreeResolvers = {
    Query: {
        // Get a dog's pedigree up to specified number of generations
        dogPedigree: async (_, { dogId, generations = 3 }, context) => {
            const user = await (0, auth_1.checkAuth)(context);
            // Support both UUID and legacy numeric IDs
            let id = dogId;
            const numericId = Number(dogId);
            if (!isNaN(numericId)) {
                // Fallback for legacy numeric IDs
                id = numericId;
            }
            // Helper function to build pedigree tree recursively
            const buildPedigreeTree = async (dogId, currentGen) => {
                if (!dogId || currentGen > generations)
                    return null;
                const dog = await models_1.default.Dog.findByPk(dogId, {
                    include: [
                        { model: models_1.default.Breed, as: 'breedObj' } // Include the breed object
                    ]
                });
                if (!dog)
                    return null;
                const node = {
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
                throw new apollo_server_express_1.UserInputError(`Dog with ID ${dogId} not found`);
            }
            return pedigree;
        },
        // Get breeding records for a dog (as sire, dam, or both)
        breedingRecords: async (_, { dogId, role = 'BOTH', offset = 0, limit = 20 }, context) => {
            await (0, auth_1.checkAuth)(context);
            // Support both UUID and legacy numeric IDs
            let id = dogId;
            const numericId = Number(dogId);
            if (!isNaN(numericId)) {
                // Fallback for legacy numeric IDs
                id = numericId;
            }
            // Build query based on the role
            const whereClause = {};
            if (role === 'SIRE') {
                whereClause.sireId = id;
            }
            else if (role === 'DAM') {
                whereClause.damId = id;
            }
            else {
                // BOTH
                whereClause[sequelize_1.Op.or] = [{ sireId: id }, { damId: id }];
            }
            const { count, rows } = await models_1.default.BreedingRecord.findAndCountAll({
                where: whereClause,
                limit,
                offset,
                order: [['breedingDate', 'DESC']],
                include: [
                    { model: models_1.default.Dog, as: 'sire' },
                    { model: models_1.default.Dog, as: 'dam' },
                    { model: models_1.default.Dog, as: 'puppies' }
                ]
            });
            return {
                totalCount: count,
                hasMore: offset + rows.length < count,
                items: rows
            };
        },
        // Analyze linebreeding for a potential breeding pair
        linebreedingAnalysis: async (_, { sireId, damId, generations = 6 }, context) => {
            await (0, auth_1.checkAuth)(context);
            // Support both UUID and legacy numeric IDs
            let sireIdParsed = sireId;
            let damIdParsed = damId;
            const sireIdInt = Number(sireId);
            const damIdInt = Number(damId);
            if (!isNaN(sireIdInt))
                sireIdParsed = sireIdInt;
            if (!isNaN(damIdInt))
                damIdParsed = damIdInt;
            // Get the dog objects
            const [sire, dam] = await Promise.all([
                models_1.default.Dog.findByPk(sireIdParsed),
                models_1.default.Dog.findByPk(damIdParsed)
            ]);
            if (!sire || !dam) {
                throw new apollo_server_express_1.UserInputError('One or both dogs not found');
            }
            if (sire.gender !== 'male' || dam.gender !== 'female') {
                throw new apollo_server_express_1.UserInputError('Invalid breeding pair: sire must be male and dam must be female');
            }
            // Helper function to get all ancestors up to a certain generation
            // Returns a map of dog IDs to their info and path details
            const getAllAncestors = async (dogId, gen, path = '') => {
                const result = new Map();
                if (gen <= 0 || !dogId)
                    return result;
                const dog = await models_1.default.Dog.findByPk(dogId);
                if (!dog)
                    return result;
                const currentPath = path ? `${path} > ${dog.name}` : dog.name;
                // Add this dog to the result - using string ID for consistency
                const dogStandardId = standardizeId(dog.id);
                if (result.has(dogStandardId)) {
                    result.get(dogStandardId)?.paths.push(currentPath);
                }
                else {
                    result.set(dogStandardId, { dog, paths: [currentPath] });
                }
                // Recursively get ancestors
                if (dog.sireId) {
                    const sireAncestors = await getAllAncestors(dog.sireId, gen - 1, currentPath);
                    sireAncestors.forEach((value, key) => {
                        const keyStandardId = standardizeId(key);
                        if (result.has(keyStandardId)) {
                            result.get(keyStandardId)?.paths.push(...value.paths);
                        }
                        else {
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
                        }
                        else {
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
            const commonAncestors = [];
            // Simple inbreeding calculation (this is a simplified approach)
            // For a more accurate calculation, the Wright's coefficient should be implemented
            let inbreedingCoefficient = 0;
            sireAncestors.forEach((sireAncestor, id) => {
                // Convert ID to consistent format for comparison
                const idStandardized = standardizeId(id);
                // Check if this ancestor exists in dam's ancestors using string comparison
                if (damAncestors.has(idStandardized)) {
                    const damAncestor = damAncestors.get(idStandardized);
                    const dog = sireAncestor.dog;
                    // Convert to PedigreeNode format
                    const ancestorNode = {
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
            const recommendations = [];
            if (inbreedingCoefficient > 0.25) {
                recommendations.push('High inbreeding coefficient detected. Consider a different breeding pair.');
            }
            else if (inbreedingCoefficient > 0.125) {
                recommendations.push('Moderate inbreeding coefficient. Proceed with caution and monitor for health issues.');
            }
            else {
                recommendations.push('Acceptable inbreeding coefficient. This breeding pair appears genetically diverse.');
            }
            if (commonAncestors.length > 0) {
                recommendations.push(`Found ${commonAncestors.length} common ancestors in the pedigree.`);
                if (commonAncestors[0].contribution > 0.2) {
                    recommendations.push(`${commonAncestors[0].dog.name} has a high genetic contribution (${(commonAncestors[0].contribution * 100).toFixed(1)}%). Consider potential impact on offspring.`);
                }
            }
            else {
                recommendations.push('No common ancestors found within the specified generations.');
            }
            const result = {
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
        createBreedingRecord: async (_, { input }, context) => {
            await (0, auth_1.checkAuth)(context);
            const { sireId, damId, breedingDate, litterSize, comments, puppyIds } = input;
            const sireIdInt = parseInt(sireId, 10);
            const damIdInt = parseInt(damId, 10);
            if (isNaN(sireIdInt) || isNaN(damIdInt)) {
                throw new apollo_server_express_1.UserInputError('Invalid dog IDs');
            }
            // Verify both dogs exist and are of the correct gender
            const [sire, dam] = await Promise.all([
                models_1.default.Dog.findByPk(sireIdInt),
                models_1.default.Dog.findByPk(damIdInt)
            ]);
            if (!sire || !dam) {
                throw new apollo_server_express_1.UserInputError('One or both dogs not found');
            }
            if (sire.gender !== 'Male') {
                throw new apollo_server_express_1.UserInputError('Sire must be a male dog');
            }
            if (dam.gender !== 'Female') {
                throw new apollo_server_express_1.UserInputError('Dam must be a female dog');
            }
            // Create the breeding record
            const breedingRecord = await models_1.default.BreedingRecord.create({
                sireId: sireIdInt,
                damId: damIdInt,
                breedingDate: new Date(breedingDate),
                litterSize: litterSize || null,
                comments: comments || null
            });
            // Link puppies if provided
            if (puppyIds && puppyIds.length > 0) {
                const validPuppyIds = puppyIds
                    .map((id) => parseInt(id, 10))
                    .filter((id) => !isNaN(id));
                if (validPuppyIds.length > 0) {
                    // Verify all puppies exist
                    const puppies = await models_1.default.Dog.findAll({
                        where: { id: { [sequelize_1.Op.in]: validPuppyIds } }
                    });
                    if (puppies.length !== validPuppyIds.length) {
                        throw new apollo_server_express_1.UserInputError('One or more puppies not found');
                    }
                    // Link puppies to breeding record
                    await Promise.all(validPuppyIds.map((puppyId) => models_1.default.BreedingRecordPuppy.create({
                        breedingRecordId: breedingRecord.id,
                        puppyId
                    })));
                    // Also update the puppies' sire and dam if not already set
                    await Promise.all(puppies.map(async (puppy) => {
                        const updates = {};
                        if (!puppy.sireId)
                            updates.sireId = sireIdInt;
                        if (!puppy.damId)
                            updates.damId = damIdInt;
                        if (Object.keys(updates).length > 0) {
                            await puppy.update(updates);
                        }
                    }));
                }
            }
            // Return the breeding record with associations
            return models_1.default.BreedingRecord.findByPk(breedingRecord.id, {
                include: [
                    { model: models_1.default.Dog, as: 'sire' },
                    { model: models_1.default.Dog, as: 'dam' },
                    { model: models_1.default.Dog, as: 'puppies' }
                ]
            });
        },
        // Update an existing breeding record
        updateBreedingRecord: async (_, { id, input }, context) => {
            (0, auth_1.checkAuth)(context);
            const breedingRecordId = parseInt(id, 10);
            if (isNaN(breedingRecordId)) {
                throw new apollo_server_express_1.UserInputError('Invalid breeding record ID');
            }
            const breedingRecord = await models_1.default.BreedingRecord.findByPk(breedingRecordId);
            if (!breedingRecord) {
                throw new apollo_server_express_1.UserInputError('Breeding record not found');
            }
            const { breedingDate, litterSize, comments, puppyIds } = input;
            // Update breeding record fields
            const updateData = {};
            if (breedingDate)
                updateData.breedingDate = new Date(breedingDate);
            if (litterSize !== undefined)
                updateData.litterSize = litterSize;
            if (comments !== undefined)
                updateData.comments = comments;
            await breedingRecord.update(updateData);
            // Handle puppies update if provided
            if (puppyIds !== undefined) {
                // Delete existing puppy associations
                await models_1.default.BreedingRecordPuppy.destroy({
                    where: { breedingRecordId }
                });
                // Add new puppy associations
                if (puppyIds && puppyIds.length > 0) {
                    const validPuppyIds = puppyIds
                        .map((id) => parseInt(id, 10))
                        .filter((id) => !isNaN(id));
                    if (validPuppyIds.length > 0) {
                        // Verify all puppies exist
                        const puppies = await models_1.default.Dog.findAll({
                            where: { id: { [sequelize_1.Op.in]: validPuppyIds } }
                        });
                        if (puppies.length !== validPuppyIds.length) {
                            throw new apollo_server_express_1.UserInputError('One or more puppies not found');
                        }
                        // Link puppies to breeding record
                        await Promise.all(validPuppyIds.map((puppyId) => models_1.default.BreedingRecordPuppy.create({
                            breedingRecordId,
                            puppyId
                        })));
                        // Also update the puppies' sire and dam if not already set
                        await Promise.all(puppies.map(async (puppy) => {
                            const updates = {};
                            if (!puppy.sireId)
                                updates.sireId = breedingRecord.sireId;
                            if (!puppy.damId)
                                updates.damId = breedingRecord.damId;
                            if (Object.keys(updates).length > 0) {
                                await puppy.update(updates);
                            }
                        }));
                    }
                }
            }
            // Return the updated breeding record with associations
            return models_1.default.BreedingRecord.findByPk(breedingRecordId, {
                include: [
                    { model: models_1.default.Dog, as: 'sire' },
                    { model: models_1.default.Dog, as: 'dam' },
                    { model: models_1.default.Dog, as: 'puppies' }
                ]
            });
        },
        // Link a dog to its parents
        linkDogToParents: async (_, { dogId, sireId, damId }, context) => {
            await (0, auth_1.checkAuth)(context);
            // Support both UUID and legacy numeric IDs
            let parsedDogId = dogId;
            let parsedSireId = sireId || null;
            let parsedDamId = damId || null;
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
            const dog = await models_1.default.Dog.findByPk(parsedDogId);
            if (!dog) {
                throw new apollo_server_express_1.UserInputError('Dog not found');
            }
            // Verify sire and dam exist and are of the correct gender
            if (parsedSireId) {
                const sire = await models_1.default.Dog.findByPk(parsedSireId);
                if (!sire) {
                    throw new apollo_server_express_1.UserInputError('Sire not found');
                }
                if (sire.gender !== 'male') {
                    throw new apollo_server_express_1.UserInputError('Sire must be a male dog');
                }
            }
            if (parsedDamId) {
                const dam = await models_1.default.Dog.findByPk(parsedDamId);
                if (!dam) {
                    throw new apollo_server_express_1.UserInputError('Dam not found');
                }
                if (dam.gender !== 'female') {
                    throw new apollo_server_express_1.UserInputError('Dam must be a female dog');
                }
            }
            // Update the dog
            const updates = {};
            if (parsedSireId !== null)
                updates.sireId = parsedSireId;
            if (parsedDamId !== null)
                updates.damId = parsedDamId;
            await dog.update(updates);
            // Return the updated dog
            return models_1.default.Dog.findByPk(parsedDogId, {
                include: [
                    { model: models_1.default.Dog, as: 'sire' },
                    { model: models_1.default.Dog, as: 'dam' }
                ]
            });
        },
        // Create a pedigree for a dog
        createPedigree: async (_, { input }, context) => {
            // Authenticate the user
            const user = await (0, auth_1.checkAuth)(context);
            const { dogId, sireId, damId, generation = 2, coefficient = 0 } = input;
            // Validate input
            const dogIdInt = parseInt(dogId, 10);
            if (isNaN(dogIdInt)) {
                throw new apollo_server_express_1.UserInputError('Invalid dog ID');
            }
            // Find the dog
            const dog = await models_1.default.Dog.findByPk(dogIdInt);
            if (!dog) {
                throw new apollo_server_express_1.UserInputError(`Dog with ID ${dogId} not found`);
            }
            // Create the pedigree node
            const pedigreeNode = {
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
                    const sire = await models_1.default.Dog.findByPk(sireIdInt);
                    if (sire) {
                        pedigreeNode.sire = {
                            id: `pedigree-${sireId}`,
                            dog: sire,
                            generation: generation + 1,
                            coefficient: coefficient,
                            sire: null,
                            dam: null
                        };
                    }
                }
            }
            // Add dam if provided
            if (damId) {
                const damIdInt = parseInt(damId, 10);
                if (!isNaN(damIdInt)) {
                    const dam = await models_1.default.Dog.findByPk(damIdInt);
                    if (dam) {
                        pedigreeNode.dam = {
                            id: `pedigree-${damId}`,
                            dog: dam,
                            generation: generation + 1,
                            coefficient: coefficient,
                            sire: null,
                            dam: null
                        };
                    }
                }
            }
            return pedigreeNode;
        }
    }
};
exports.default = pedigreeResolvers;
//# sourceMappingURL=pedigreeResolvers.js.map