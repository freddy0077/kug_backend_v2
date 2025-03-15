import { breedingProgramResolvers } from './breedingProgramResolvers';
import { breedingProgramMutations } from './breedingProgramMutations';
import { breedingPairMutations } from './breedingPairMutations';
import db from '../../db/models';
import { BreedingProgramStatus } from '../../db/models/BreedingProgram';
import { BreedingPairStatus } from '../../db/models/BreedingPair';
import { Op } from 'sequelize';
import { toNumericId } from './breedingProgramMutations';

const { BreedingProgram, Dog, Owner, BreedingPair, BreedingRecord } = db;

/**
 * Resolvers for the BreedingProgram and BreedingPair types
 */
export const breedingResolvers = {
  Query: {
    ...breedingProgramResolvers.Query,
    breedingPrograms: async (_: any, { 
      offset = 0, 
      limit = 20, 
      searchTerm, 
      breederId, 
      breed, 
      status, 
      includePrivate 
    }: {
      offset?: number;
      limit?: number;
      searchTerm?: string;
      breederId?: string;
      breed?: string;
      status?: BreedingProgramStatus;
      includePrivate?: boolean;
    }) => {
      const where: any = {};

      // Filter by search term
      if (searchTerm) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }

      // Filter by breederId
      if (breederId) {
        where.breederId = toNumericId(breederId);
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
    ...breedingProgramMutations,
    ...breedingPairMutations
  },
  BreedingProgram: {
    // Resolver for the breeder field
    breeder: async (parent: any) => {
      return Owner.findByPk(parent.breederId);
    },
    // Resolver for the foundationDogs field
    foundationDogs: async (parent: any) => {
      const program = await BreedingProgram.findByPk(parent.id, {
        include: [
          {
            model: Dog,
            as: 'foundationDogs'
          }
        ]
      });
      
      // Safely access foundationDogs using type assertion or optional chaining
      const dogs = program ? (program as any).foundationDogs || [] : [];
      return dogs;
    },
    // Resolver for the breedingPairs field
    breedingPairs: async (parent: any) => {
      return BreedingPair.findAll({
        where: { programId: parent.id },
        order: [['createdAt', 'DESC']]
      });
    },
    // Resolver for the resultingLitters field
    resultingLitters: async (parent: any) => {
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
    program: async (parent: any) => {
      return BreedingProgram.findByPk(parent.programId);
    },
    // Resolver for the sire field
    sire: async (parent: any) => {
      return Dog.findByPk(parent.sireId);
    },
    // Resolver for the dam field
    dam: async (parent: any) => {
      return Dog.findByPk(parent.damId);
    },
    // Resolver for the breedingRecords field
    breedingRecords: async (parent: any) => {
      return BreedingRecord.findAll({
        where: { breedingPairId: parent.id },
        order: [['breedingDate', 'DESC']]
      });
    }
  }
};
