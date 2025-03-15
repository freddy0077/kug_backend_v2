import { Op, Sequelize } from 'sequelize';
import db from '../../db/models';
import { UserInputError, ForbiddenError, ApolloError } from 'apollo-server-express';
import { checkAuth } from '../../utils/auth';
import Logger from '../../utils/logger';
import { LogLevel } from '../../db/models/SystemLog';
import { AuditAction } from '../../db/models/AuditLog';

export enum CompetitionCategory {
  CONFORMATION = 'CONFORMATION',
  OBEDIENCE = 'OBEDIENCE',
  AGILITY = 'AGILITY',
  FIELD_TRIALS = 'FIELD_TRIALS',
  HERDING = 'HERDING',
  TRACKING = 'TRACKING',
  RALLY = 'RALLY',
  SCENT_WORK = 'SCENT_WORK'
}

export enum CompetitionSortField {
  EVENT_DATE = 'EVENT_DATE',
  RANK = 'RANK',
  POINTS = 'POINTS',
  EVENT_NAME = 'EVENT_NAME'
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export const competitionResultResolvers = {
  Query: {
    competitions: async (
      _: any,
      {
        offset = 0,
        limit = 20,
        searchTerm,
        category,
        dogId,
        startDate,
        endDate,
        sortBy = CompetitionSortField.EVENT_DATE,
        sortDirection = SortDirection.DESC
      }: {
        offset?: number;
        limit?: number;
        searchTerm?: string;
        category?: string;
        dogId?: number;
        startDate?: Date;
        endDate?: Date;
        sortBy?: CompetitionSortField;
        sortDirection?: SortDirection;
      },
      context: any
    ) => {
      try {
        // Get authenticated user for logging
        const user = await checkAuth(context);

        // Build where clause based on filters
        const whereClause: any = {};

        if (searchTerm) {
          whereClause.eventName = { [Op.iLike]: `%${searchTerm}%` };
        }

        if (category) {
          whereClause.category = category;
        }

        if (dogId) {
          whereClause.dogId = dogId;
        }

        // Date range
        if (startDate || endDate) {
          whereClause.eventDate = {};
          if (startDate) {
            whereClause.eventDate[Op.gte] = startDate;
          }
          if (endDate) {
            whereClause.eventDate[Op.lte] = endDate;
          }
        }

        // Log the query
        await Logger.logSystemEvent(
          `Competition results query requested`,
          LogLevel.INFO,
          'competitionResultResolvers.competitions',
          `Filters: ${JSON.stringify({
            searchTerm,
            category,
            dogId,
            startDate,
            endDate,
            sortBy,
            sortDirection,
            offset,
            limit
          })}`,
          undefined,
          user.id,
          context.req?.ip
        );

        // Determine order parameter based on sortBy field
        let orderField;
        switch (sortBy) {
          case CompetitionSortField.EVENT_DATE:
            orderField = 'eventDate';
            break;
          case CompetitionSortField.RANK:
            orderField = 'rank';
            break;
          case CompetitionSortField.POINTS:
            orderField = 'points';
            break;
          case CompetitionSortField.EVENT_NAME:
            orderField = 'eventName';
            break;
          default:
            orderField = 'eventDate';
        }

        // Query competitions
        const { count, rows } = await db.CompetitionResult.findAndCountAll({
          where: whereClause,
          order: [[orderField, sortDirection]],
          limit,
          offset,
          include: [
            {
              model: db.Dog,
              as: 'dog',
              attributes: ['id', 'name']
            }
          ]
        });

        // Map results and add dogName for convenience
        const items = rows.map((result: any) => {
          const plainResult = result.get({ plain: true });
          return {
            ...plainResult,
            dogName: plainResult.dog?.name || 'Unknown Dog'
          };
        });

        return {
          totalCount: count,
          hasMore: offset + rows.length < count,
          items
        };
      } catch (error) {
        console.error('Error fetching competitions:', error);
        throw error;
      }
    },

    competition: async (_: any, { id }: { id: number }, context: any) => {
      try {
        // Get authenticated user for logging
        const user = await checkAuth(context);

        // Log the lookup
        await Logger.logSystemEvent(
          `Competition result lookup by ID ${id}`,
          LogLevel.INFO,
          'competitionResultResolvers.competition',
          undefined,
          undefined,
          user.id,
          context.req?.ip
        );

        const competition = await db.CompetitionResult.findByPk(id, {
          include: [
            {
              model: db.Dog,
              as: 'dog',
              include: [
                {
                  model: db.Owner,
                  as: 'currentOwner'
                }
              ]
            }
          ]
        });

        if (!competition) {
          throw new UserInputError(`Competition with ID ${id} not found`);
        }

        // Add dogName property for convenience
        const result = competition.get({ plain: true });
        (result as any).dogName = (result as any).dog?.name || 'Unknown Dog';

        return result;
      } catch (error) {
        console.error('Error fetching competition by ID:', error);
        throw error;
      }
    },

    dogCompetitionStats: async (_: any, { dogId }: { dogId: number }, context: any) => {
      try {
        // Get authenticated user for logging
        const user = await checkAuth(context);

        // Log the stats request
        await Logger.logSystemEvent(
          `Competition statistics requested for dog ID ${dogId}`,
          LogLevel.INFO,
          'competitionResultResolvers.dogCompetitionStats',
          undefined,
          undefined,
          user.id,
          context.req?.ip
        );

        // Validate dog exists
        const dog = await db.Dog.findByPk(dogId);
        if (!dog) {
          throw new UserInputError(`Dog with ID ${dogId} not found`);
        }

        // Get total competitions
        const totalCompetitions = await db.CompetitionResult.count({
          where: { dogId }
        });

        // Get total wins (rank = 1)
        const totalWins = await db.CompetitionResult.count({
          where: { dogId, rank: 1 }
        });

        // Get category counts
        const categoryCounts = await db.CompetitionResult.findAll({
          attributes: [
            'category',
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
          ],
          where: { dogId },
          group: ['category']
        });

        // Get points by category
        const pointsByCategory = await db.CompetitionResult.findAll({
          attributes: [
            'category',
            [Sequelize.fn('SUM', Sequelize.col('points')), 'points']
          ],
          where: { dogId },
          group: ['category']
        });

        // Get recent results
        const recentResults = await db.CompetitionResult.findAll({
          where: { dogId },
          order: [['eventDate', 'DESC']],
          limit: 5
        });

        return {
          totalCompetitions,
          totalWins,
          categoryCounts: categoryCounts.map((c: any) => ({
            category: c.getDataValue('category'),
            count: parseInt(c.getDataValue('count') as unknown as string, 10)
          })),
          pointsByCategory: pointsByCategory.map((p: any) => ({
            category: p.getDataValue('category'),
            points: parseFloat(p.getDataValue('points') as unknown as string) || 0
          })),
          recentResults
        };
      } catch (error) {
        console.error('Error fetching dog competition stats:', error);
        throw error;
      }
    },

    relatedCompetitions: async (
      _: any,
      {
        competitionId,
        dogId,
        category,
        limit = 3
      }: {
        competitionId: number;
        dogId?: number;
        category?: string;
        limit?: number;
      },
      context: any
    ) => {
      try {
        // Get authenticated user for logging
        const user = await checkAuth(context);

        // Log the request
        await Logger.logSystemEvent(
          `Related competitions requested for competition ID ${competitionId}`,
          LogLevel.INFO,
          'competitionResultResolvers.relatedCompetitions',
          `Params: dogId=${dogId}, category=${category}, limit=${limit}`,
          undefined,
          user.id,
          context.req?.ip
        );

        // First, get the target competition
        const targetCompetition = await db.CompetitionResult.findByPk(competitionId);
        if (!targetCompetition) {
          throw new UserInputError(`Competition with ID ${competitionId} not found`);
        }

        // Build where clause - exclude the target competition
        const whereClause: any = {
          id: { [Op.ne]: competitionId }
        };

        // If dogId is provided, use it; otherwise, use the target competition's dogId
        if (dogId) {
          whereClause.dogId = dogId;
        } else if (targetCompetition.dogId) {
          whereClause.dogId = targetCompetition.dogId;
        }

        // If category is provided, use it; otherwise, use the target competition's category
        if (category) {
          whereClause.category = category;
        } else if (targetCompetition.category) {
          whereClause.category = targetCompetition.category;
        }

        // Query related competitions
        const relatedCompetitions = await db.CompetitionResult.findAll({
          where: whereClause,
          order: [['eventDate', 'DESC']],
          limit,
          include: [
            {
              model: db.Dog,
              as: 'dog',
              attributes: ['id', 'name']
            }
          ]
        });

        // Map results and add dogName
        return relatedCompetitions.map((competition: any) => {
          const plainResult = competition.get({ plain: true });
          return {
            ...plainResult,
            dogName: plainResult.dog?.name || 'Unknown Dog'
          };
        });
      } catch (error) {
        console.error('Error fetching related competitions:', error);
        throw error;
      }
    }
  },

  Mutation: {
    createCompetitionResult: async (_: any, { input }: { input: any }, context: any) => {
      try {
        // Get authenticated user for logging
        const user = await checkAuth(context);

        // Verify dog exists
        const dog = await db.Dog.findByPk(input.dogId);
        if (!dog) {
          throw new UserInputError(`Dog with ID ${input.dogId} not found`);
        }

        // Log the creation request
        await Logger.logSystemEvent(
          `Competition result creation requested for dog ID ${input.dogId}`,
          LogLevel.INFO,
          'competitionResultResolvers.createCompetitionResult',
          `Event: ${input.eventName}, Date: ${input.eventDate}, Category: ${input.category}`,
          undefined,
          user.id,
          context.req?.ip
        );

        // Create competition result
        const competitionResult = await db.CompetitionResult.create(input);

        // Log in audit trail
        await Logger.logAuditTrail(
          AuditAction.CREATE,
          'CompetitionResult',
          competitionResult.id.toString(),
          user.id,
          undefined,
          JSON.stringify(input),
          context.req?.ip,
          `Created competition result for dog ${input.dogId}: ${input.eventName}`
        );

        // Return created result
        return await db.CompetitionResult.findByPk(competitionResult.id, {
          include: [{ model: db.Dog, as: 'dog' }]
        });
      } catch (error) {
        console.error('Error creating competition result:', error);
        throw error;
      }
    },

    updateCompetitionResult: async (
      _: any,
      { id, input }: { id: number; input: any },
      context: any
    ) => {
      try {
        // Get authenticated user for logging
        const user = await checkAuth(context);

        // Find competition result
        const competitionResult = await db.CompetitionResult.findByPk(id);
        if (!competitionResult) {
          throw new UserInputError(`Competition result with ID ${id} not found`);
        }

        // Log the update request
        await Logger.logSystemEvent(
          `Competition result update requested for ID ${id}`,
          LogLevel.INFO,
          'competitionResultResolvers.updateCompetitionResult',
          `Requested changes: ${JSON.stringify(input)}`,
          undefined,
          user.id,
          context.req?.ip
        );

        // Store previous state for audit log
        const previousState = {
          id: competitionResult.id,
          dogId: competitionResult.dogId,
          eventName: competitionResult.eventName,
          eventDate: competitionResult.eventDate,
          category: competitionResult.category,
          rank: competitionResult.rank,
          titleEarned: competitionResult.titleEarned,
          points: competitionResult.points
        };

        // Update competition result
        await competitionResult.update(input);

        // Log in audit trail
        await Logger.logAuditTrail(
          AuditAction.UPDATE,
          'CompetitionResult',
          id.toString(),
          user.id,
          JSON.stringify(previousState),
          JSON.stringify(input),
          context.req?.ip,
          `Updated competition result ${id} for dog ${competitionResult.dogId}`
        );

        // Return updated result
        return await db.CompetitionResult.findByPk(id, {
          include: [{ model: db.Dog, as: 'dog' }]
        });
      } catch (error) {
        console.error('Error updating competition result:', error);
        throw error;
      }
    },

    deleteCompetitionResult: async (_: any, { id }: { id: number }, context: any) => {
      try {
        // Get authenticated user for logging
        const user = await checkAuth(context);

        // Find competition result
        const competitionResult = await db.CompetitionResult.findByPk(id);
        if (!competitionResult) {
          throw new UserInputError(`Competition result with ID ${id} not found`);
        }

        // Log system event before deletion
        await Logger.logSystemEvent(
          `Competition result deletion requested for ID ${id}`,
          LogLevel.WARNING,
          'competitionResultResolvers.deleteCompetitionResult',
          `Dog ID: ${competitionResult.dogId}, Event: ${competitionResult.eventName}`,
          undefined,
          user.id,
          context.req?.ip
        );

        // Store record details for audit log
        const competitionDetails = {
          id: competitionResult.id,
          dogId: competitionResult.dogId,
          eventName: competitionResult.eventName,
          eventDate: competitionResult.eventDate,
          category: competitionResult.category,
          rank: competitionResult.rank,
          titleEarned: competitionResult.titleEarned,
          points: competitionResult.points
        };

        // Delete competition result
        await competitionResult.destroy();

        // Log deletion in audit trail
        await Logger.logAuditTrail(
          AuditAction.DELETE,
          'CompetitionResult',
          id.toString(),
          user.id,
          JSON.stringify(competitionDetails),
          undefined,
          context.req?.ip,
          `Deleted competition result ${id} for dog ${competitionDetails.dogId}`
        );

        return {
          success: true,
          message: 'Competition result deleted successfully'
        };
      } catch (error) {
        console.error('Error deleting competition result:', error);
        throw error;
      }
    }
  },

  CompetitionResult: {
    dog: async (parent: any) => {
      if (parent.dog) return parent.dog;
      return await db.Dog.findByPk(parent.dogId);
    }
  }
};
