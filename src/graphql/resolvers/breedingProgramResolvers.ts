import { Op } from 'sequelize';
import { UserInputError, ForbiddenError, ApolloError } from 'apollo-server-express';
import { checkAuth } from '../../utils/auth';
import Logger from '../../utils/logger';
import { LogLevel } from '../../db/models/SystemLog';
import { AuditAction } from '../../db/models/AuditLog';
import { BreedingProgramStatus } from '../../db/models/BreedingProgram';
import { BreedingPairStatus } from '../../db/models/BreedingPair';
import db from '../../db/models';

// Type aliases for better readability
const { BreedingProgram, BreedingPair, Dog, Owner, BreedingRecord, BreedingProgramFoundationDog } = db;

/**
 * Handles all Breeding Program related GraphQL queries and mutations
 */
export const breedingProgramResolvers = {
  Query: {
    /**
     * Get a paginated list of breeding programs with optional filtering
     */
    breedingPrograms: async (
      _: any,
      {
        offset = 0,
        limit = 20,
        searchTerm,
        breederId,
        breed,
        status,
        includePrivate = false
      }: {
        offset?: number;
        limit?: number;
        searchTerm?: string;
        breederId?: number;
        breed?: string;
        status?: BreedingProgramStatus;
        includePrivate?: boolean;
      },
      context: any
    ) => {
      try {
        // Get authenticated user for logging and permission check
        const user = await checkAuth(context);

        // Build where clause based on filters
        const whereClause: any = {};

        // Only show public programs unless the user is the breeder or admin, or includePrivate is true
        if (!includePrivate || !user?.role || (user?.role !== 'ADMIN' && user?.id !== breederId)) {
          whereClause.isPublic = true;
        }

        if (searchTerm) {
          whereClause[Op.or] = [
            { name: { [Op.iLike]: `%${searchTerm}%` } },
            { description: { [Op.iLike]: `%${searchTerm}%` } }
          ];
        }

        if (breederId) {
          whereClause.breederId = breederId;
        }

        if (breed) {
          whereClause.breed = { [Op.iLike]: breed };
        }

        if (status) {
          whereClause.status = status;
        }

        // Log the query
        await Logger.logSystemEvent(
          `Breeding programs query requested`,
          LogLevel.INFO,
          'breedingProgramResolvers.breedingPrograms',
          `Filters: ${JSON.stringify({
            searchTerm,
            breederId,
            breed,
            status,
            includePrivate,
            offset,
            limit
          })}`,
          undefined,
          user.id,
          context.req?.ip
        );
        
        // Also log an audit trail for data access
        await Logger.logAuditTrail(
          AuditAction.READ,
          'BreedingProgram',
          'collection',
          user.id,
          undefined,
          JSON.stringify({ filters: { searchTerm, breederId, breed, status, includePrivate }, pagination: { offset, limit } }),
          context.req?.ip,
          `Breeding programs listing accessed by ${user.username || 'Unknown'}`
        );

        // Query breeding programs
        const { count, rows } = await BreedingProgram.findAndCountAll({
          where: whereClause,
          order: [['updatedAt', 'DESC']],
          limit,
          offset,
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
          hasMore: offset + rows.length < count,
          items: rows
        };
      } catch (error) {
        console.error('Error fetching breeding programs:', error);
        throw error;
      }
    },

    /**
     * Get detailed information about a specific breeding program
     */
    breedingProgram: async (_: any, { id }: { id: number }, context: any) => {
      try {
        // Get authenticated user for logging
        const user = await checkAuth(context);

        // Log the lookup
        await Logger.logSystemEvent(
          `Breeding program lookup by ID ${id}`,
          LogLevel.INFO,
          'breedingProgramResolvers.breedingProgram',
          `Program details requested for ID: ${id}`,
          undefined,
          user.id,
          context.req?.ip
        );
        
        // Also log an audit trail for single entity access
        await Logger.logAuditTrail(
          AuditAction.READ,
          'BreedingProgram',
          id.toString(),
          user.id,
          undefined,
          undefined,
          context.req?.ip,
          `Breeding program details accessed by ${user.username || 'Unknown'}`
        );

        const program = await BreedingProgram.findByPk(id, {
          include: [
            {
              model: Owner,
              as: 'breeder'
            },
            {
              model: Dog,
              as: 'foundationDogs'
            },
            {
              model: BreedingPair,
              as: 'breedingPairs',
              include: [
                {
                  model: Dog,
                  as: 'sire'
                },
                {
                  model: Dog,
                  as: 'dam'
                },
                {
                  model: BreedingRecord,
                  as: 'breedingRecords'
                }
              ]
            }
          ]
        });

        if (!program) {
          throw new UserInputError(`Breeding program with ID ${id} not found`);
        }

        // Check if the program is private and if the user has permission to view it
        if (!program.isPublic) {
          // Only the breeder or an admin can view private programs
          if (!user?.role || (user.role !== 'ADMIN' && user.id !== program.breederId)) {
            throw new ForbiddenError('You do not have permission to view this breeding program');
          }
        }

        return program;
      } catch (error) {
        console.error('Error fetching breeding program:', error);
        throw error;
      }
    },

    /**
     * Get detailed information about a specific breeding pair
     */
    breedingPair: async (_: any, { id }: { id: number }, context: any) => {
      try {
        // Get authenticated user for logging
        const user = await checkAuth(context);

        // Log the lookup
        await Logger.logSystemEvent(
          `Breeding pair lookup by ID ${id}`,
          LogLevel.INFO,
          'breedingProgramResolvers.breedingPair',
          `Breeding pair details requested for ID: ${id}`,
          undefined,
          user.id,
          context.req?.ip
        );
        
        // Also log an audit trail for single entity access
        await Logger.logAuditTrail(
          AuditAction.READ,
          'BreedingPair',
          id.toString(),
          user.id,
          undefined,
          undefined,
          context.req?.ip,
          `Breeding pair details accessed by ${user.username || 'Unknown'}`
        );

        const pair = await BreedingPair.findByPk(id, {
          include: [
            {
              model: BreedingProgram,
              as: 'program'
            },
            {
              model: Dog,
              as: 'sire'
            },
            {
              model: Dog,
              as: 'dam'
            },
            {
              model: BreedingRecord,
              as: 'breedingRecords'
            }
          ]
        });

        if (!pair) {
          throw new UserInputError(`Breeding pair with ID ${id} not found`);
        }

        // Fetch the associated breeding program for permission checking
        const program = await BreedingProgram.findByPk(pair.programId);
        
        // Check if the associated program is private and if the user has permission to view it
        if (program && !program.isPublic) {
          // Only the breeder or an admin can view pairs in private programs
          if (!user?.role || (user.role !== 'ADMIN' && user.id !== program.breederId)) {
            throw new ForbiddenError('You do not have permission to view this breeding pair');
          }
        }

        return pair;
      } catch (error) {
        console.error('Error fetching breeding pair:', error);
        throw error;
      }
    }
  }
};
