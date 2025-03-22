"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.breedingResolvers = void 0;
const breedingProgramResolvers_1 = require("./breedingProgramResolvers");
const breedingProgramMutations_1 = require("./breedingProgramMutations");
const breedingPairMutations_1 = require("./breedingPairMutations");
const models_1 = __importDefault(require("../../db/models"));
const sequelize_1 = require("sequelize");
const breedingProgramMutations_2 = require("./breedingProgramMutations");
const { BreedingProgram, Dog, Owner, BreedingPair, BreedingRecord } = models_1.default;
/**
 * Resolvers for the BreedingProgram and BreedingPair types
 */
exports.breedingResolvers = {
    Query: {
        ...breedingProgramResolvers_1.breedingProgramResolvers.Query,
        breedingPrograms: async (_, { offset = 0, limit = 20, searchTerm, breederId, breed, status, includePrivate }) => {
            const where = {};
            // Filter by search term
            if (searchTerm) {
                where[sequelize_1.Op.or] = [
                    { name: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                    { description: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } }
                ];
            }
            // Filter by breederId
            if (breederId) {
                where.breederId = (0, breedingProgramMutations_2.toNumericId)(breederId);
            }
            // Filter by breed
            if (breed) {
                where.breed = breed;
            }
            // Filter by status
            if (status) {
                where.status = status;
            }
            // Handle privacy
            if (!includePrivate) {
                where.isPublic = true;
            }
            // Fetch breeding programs
            const { count, rows } = await BreedingProgram.findAndCountAll({
                where,
                offset,
                limit,
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: Owner,
                        as: 'breeder',
                        attributes: ['id', 'name']
                    }
                ]
            });
            return {
                totalCount: count,
                programs: rows
            };
        }
    },
    Mutation: {
        ...breedingProgramMutations_1.breedingProgramMutations,
        ...breedingPairMutations_1.breedingPairMutations
    },
    BreedingProgram: {
        // Resolver for the breeder field
        breeder: async (parent) => {
            return Owner.findByPk(parent.breederId);
        },
        // Resolver for the foundationDogs field
        foundationDogs: async (parent) => {
            const program = await BreedingProgram.findByPk(parent.id, {
                include: [
                    {
                        model: Dog,
                        as: 'foundationDogs'
                    }
                ]
            });
            // Safely access foundationDogs using type assertion or optional chaining
            const dogs = program ? program.foundationDogs || [] : [];
            return dogs;
        },
        // Resolver for the breedingPairs field
        breedingPairs: async (parent) => {
            return BreedingPair.findAll({
                where: { programId: parent.id },
                order: [['createdAt', 'DESC']]
            });
        },
        // Resolver for the resultingLitters field
        resultingLitters: async (parent) => {
            const pairs = await BreedingPair.findAll({
                where: { programId: parent.id }
            });
            const pairIds = pairs.map(pair => pair.id);
            return BreedingRecord.findAll({
                where: { breedingPairId: pairIds }
            });
        }
    },
    BreedingPair: {
        // Resolver for the program field
        program: async (parent) => {
            return BreedingProgram.findByPk(parent.programId);
        },
        // Resolver for the sire field
        sire: async (parent) => {
            return Dog.findByPk(parent.sireId);
        },
        // Resolver for the dam field
        dam: async (parent) => {
            return Dog.findByPk(parent.damId);
        },
        // Resolver for the breedingRecords field
        breedingRecords: async (parent) => {
            return BreedingRecord.findAll({
                where: { breedingPairId: parent.id },
                order: [['breedingDate', 'DESC']]
            });
        }
    }
};
//# sourceMappingURL=breedingResolvers.js.map