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
const { BreedingProgram, Dog, Owner, BreedingPair, BreedingRecord } = models_1.default;
/**
 * Resolvers for the BreedingProgram and BreedingPair types
 */
exports.breedingResolvers = {
    Query: {
        ...breedingProgramResolvers_1.breedingProgramResolvers.Query
    },
    Mutation: {
        ...breedingProgramMutations_1.breedingProgramMutations,
        ...breedingPairMutations_1.breedingPairMutations
    },
    // Type resolvers to handle nested fields
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