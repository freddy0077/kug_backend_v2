import { Op } from 'sequelize';
import db from '../../db/models';
import { LogLevel } from '../../db/models/SystemLog';
import { AuditAction } from '../../db/models/AuditLog';
import { checkAuth, requireAdminRole } from '../../utils/auth';

export const logResolvers = {
  Query: {
    // System Log Queries
    systemLogs: async (_: any, { page = 1, limit = 20, level }: { page: number; limit: number; level?: LogLevel }, context: any) => {
      // Ensure user is authenticated and has admin role
      const user = await checkAuth(context);
      requireAdminRole(user);

      const offset = (page - 1) * limit;
      const where: any = {};
      
      if (level) {
        where.level = level;
      }

      const { count, rows } = await db.SystemLog.findAndCountAll({
        where,
        limit,
        offset,
        order: [['timestamp', 'DESC']],
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ]
      });

      return {
        totalCount: count,
        hasMore: count > offset + rows.length,
        items: rows
      };
    },

    systemLog: async (_: any, { id }: { id: number }, context: any) => {
      // Ensure user is authenticated and has admin role
      const user = await checkAuth(context);
      requireAdminRole(user);

      return db.SystemLog.findByPk(id, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ]
      });
    },

    // Audit Log Queries
    auditLogs: async (_: any, { 
      page = 1, 
      limit = 20, 
      entityType, 
      action 
    }: { 
      page: number; 
      limit: number; 
      entityType?: string; 
      action?: AuditAction 
    }, context: any) => {
      // Ensure user is authenticated and has admin role
      const user = await checkAuth(context);
      requireAdminRole(user);

      const offset = (page - 1) * limit;
      const where: any = {};
      
      if (entityType) {
        where.entityType = entityType;
      }
      
      if (action) {
        where.action = action;
      }

      const { count, rows } = await db.AuditLog.findAndCountAll({
        where,
        limit,
        offset,
        order: [['timestamp', 'DESC']],
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ]
      });

      return {
        totalCount: count,
        hasMore: count > offset + rows.length,
        items: rows
      };
    },

    auditLog: async (_: any, { id }: { id: number }, context: any) => {
      // Ensure user is authenticated and has admin role
      const user = await checkAuth(context);
      requireAdminRole(user);

      return db.AuditLog.findByPk(id, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName']
          }
        ]
      });
    }
  },

  Mutation: {
    createSystemLog: async (_: any, { 
      message, 
      level, 
      source, 
      details, 
      stackTrace, 
      ipAddress 
    }: { 
      message: string; 
      level: LogLevel; 
      source: string; 
      details?: string; 
      stackTrace?: string; 
      ipAddress?: string 
    }, context: any) => {
      const user = await checkAuth(context);
      requireAdminRole(user);

      return db.SystemLog.create({
        timestamp: new Date(),
        message,
        level,
        source,
        details,
        stackTrace,
        ipAddress,
        userId: user.id
      });
    },

    createAuditLog: async (_: any, { 
      action, 
      entityType, 
      entityId, 
      previousState, 
      newState, 
      ipAddress, 
      metadata 
    }: { 
      action: AuditAction; 
      entityType: string; 
      entityId: string; 
      previousState?: string; 
      newState?: string; 
      ipAddress?: string; 
      metadata?: string 
    }, context: any) => {
      const user = await checkAuth(context);

      return db.AuditLog.create({
        timestamp: new Date(),
        action,
        entityType,
        entityId,
        previousState,
        newState,
        ipAddress,
        metadata,
        userId: user.id
      });
    },

    clearSystemLogs: async (_: any, { 
      olderThan, 
      level 
    }: { 
      olderThan?: Date; 
      level?: LogLevel 
    }, context: any) => {
      const user = await checkAuth(context);
      requireAdminRole(user);

      const where: any = {};

      if (olderThan) {
        where.timestamp = {
          [Op.lt]: olderThan
        };
      }

      if (level) {
        where.level = level;
      }

      // Log this action before performing it
      await db.AuditLog.create({
        timestamp: new Date(),
        action: AuditAction.DELETE,
        entityType: 'SystemLog',
        entityId: 'BULK',
        metadata: JSON.stringify({ olderThan, level }),
        userId: user.id,
        ipAddress: context.req?.ip
      });

      const deletedCount = await db.SystemLog.destroy({ where });

      return {
        success: true,
        message: `Successfully deleted ${deletedCount} system logs.`
      };
    },

    clearAuditLogs: async (_: any, { 
      olderThan, 
      entityType 
    }: { 
      olderThan?: Date; 
      entityType?: string 
    }, context: any) => {
      const user = await checkAuth(context);
      requireAdminRole(user);

      const where: any = {};

      if (olderThan) {
        where.timestamp = {
          [Op.lt]: olderThan
        };
      }

      if (entityType) {
        where.entityType = entityType;
      }

      // Log this action before performing it (in SystemLog since we're deleting AuditLogs)
      await db.SystemLog.create({
        timestamp: new Date(),
        level: LogLevel.WARNING,
        message: 'Audit logs cleared',
        source: 'GraphQL.Mutation.clearAuditLogs',
        details: JSON.stringify({ olderThan, entityType, userId: user.id }),
        userId: user.id,
        ipAddress: context.req?.ip
      });

      const deletedCount = await db.AuditLog.destroy({ where });

      return {
        success: true,
        message: `Successfully deleted ${deletedCount} audit logs.`
      };
    }
  },

  // Type resolvers
  SystemLog: {
    user: async (parent: any) => {
      if (!parent.userId) return null;
      return db.User.findByPk(parent.userId);
    }
  },

  AuditLog: {
    user: async (parent: any) => {
      return db.User.findByPk(parent.userId);
    }
  }
};

export default logResolvers;
