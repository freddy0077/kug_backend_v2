import { Op } from 'sequelize';
import db from '../../db/models';
import { HealthRecordType } from '../../db/models/HealthRecord';
import { SortDirection } from './types';
import { UserInputError, ForbiddenError } from 'apollo-server-express';
import Logger from '../../utils/logger';
import { LogLevel } from '../../db/models/SystemLog';
import { AuditAction } from '../../db/models/AuditLog';
import { checkAuth } from '../../utils/auth';

export const healthRecordResolvers = {
  Query: {
    dogHealthRecords: async (_: any, {
      dogId,
      offset = 0,
      limit = 20,
      type,
      startDate,
      endDate,
      sortDirection = SortDirection.DESC
    }: {
      dogId: number;
      offset?: number;
      limit?: number;
      type?: HealthRecordType;
      startDate?: Date;
      endDate?: Date;
      sortDirection?: SortDirection;
    }, context: any) => {
      // Get authenticated user for logging
      const user = await checkAuth(context);
      try {
        // First check if dog exists
        const dog = await db.Dog.findByPk(dogId);
        if (!dog) {
          throw new UserInputError(`Dog with ID ${dogId} not found`);
        }
        
        const whereClause: any = { dogId };
        
        if (type) {
          whereClause.type = type;
        }
        
        if (startDate) {
          whereClause.date = whereClause.date || {};
          whereClause.date[Op.gte] = startDate;
        }
        
        if (endDate) {
          whereClause.date = whereClause.date || {};
          whereClause.date[Op.lte] = endDate;
        }
        
        const { count, rows } = await db.HealthRecord.findAndCountAll({
          where: whereClause,
          order: [['date', sortDirection]],
          limit,
          offset,
        });
        
        return {
          totalCount: count,
          hasMore: offset + rows.length < count,
          items: rows
        };
      } catch (error) {
        console.error('Error fetching dog health records:', error);
        throw error;
      }
    },
    
    healthRecord: async (_: any, { id }: { id: number }, context: any) => {
      // Get authenticated user for logging
      const user = await checkAuth(context);
      try {
        // Add system logging for record access
        await Logger.logSystemEvent(
          `Health record lookup by ID ${id}`,
          LogLevel.INFO,
          'healthRecordResolvers.healthRecord',
          undefined,
          undefined,
          user.id,
          context.req?.ip
        );
        
        const healthRecord = await db.HealthRecord.findByPk(id, {
          include: [{ model: db.Dog, as: 'dog' }]
        });
        
        if (!healthRecord) {
          throw new UserInputError(`Health record with ID ${id} not found`);
        }
        
        return healthRecord;
      } catch (error) {
        console.error('Error fetching health record by ID:', error);
        throw error;
      }
    },
    
    healthSummary: async (_: any, { dogId }: { dogId: number }, context: any) => {
      // Get authenticated user for logging
      const user = await checkAuth(context);
      try {
        // First check if dog exists
        const dog = await db.Dog.findByPk(dogId);
        if (!dog) {
          throw new UserInputError(`Dog with ID ${dogId} not found`);
        }
        
        // Count total records
        const recordCount = await db.HealthRecord.count({
          where: { dogId }
        });
        
        // Find latest examination date
        const latestExam = await db.HealthRecord.findOne({
          where: {
            dogId,
            type: HealthRecordType.EXAMINATION
          },
          order: [['date', 'DESC']]
        });
        
        // Get count by record type
        const recordsByType = await Promise.all(
          Object.values(HealthRecordType).map(async (type) => {
            const count = await db.HealthRecord.count({
              where: { dogId, type }
            });
            return { type, count };
          })
        );
        
        // Get recent records (last 5)
        const recentRecords = await db.HealthRecord.findAll({
          where: { dogId },
          order: [['date', 'DESC']],
          limit: 5
        });
        
        // Calculate vaccination status
        // Assumptions: 
        // 1. Vaccinations are valid for 1 year
        // 2. Core vaccinations should include: Rabies, Distemper, Parvovirus
        const vaccinations = await db.HealthRecord.findAll({
          where: {
            dogId,
            type: HealthRecordType.VACCINATION
          },
          order: [['date', 'DESC']]
        });
        
        // Simple algorithm to check if vaccinations are up to date
        // In a real application, this would be more sophisticated
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const isUpToDate = vaccinations.some(v => v.date > oneYearAgo);
        
        // Calculate next due date (1 year after the most recent vaccination)
        let nextDueDate = null;
        if (vaccinations.length > 0) {
          const mostRecentVaccination = vaccinations[0]; // Already sorted by DESC date
          nextDueDate = new Date(mostRecentVaccination.date);
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        }
        
        // Check for missing core vaccinations (simplified example)
        const missingVaccinations: string[] = [];
        const coreVaccinations = ['Rabies', 'Distemper', 'Parvovirus'];
        
        // Basic check for missing vaccinations based on description field
        // In a real system, this would be more structured
        coreVaccinations.forEach(vax => {
          const hasVax = vaccinations.some(v => 
            v.description.toLowerCase().includes(vax.toLowerCase())
          );
          if (!hasVax) {
            missingVaccinations.push(vax);
          }
        });
        
        return {
          recordCount,
          latestExamDate: latestExam?.date || null,
          recordsByType,
          recentRecords,
          vaccinationStatus: {
            isUpToDate,
            nextDueDate,
            missingVaccinations
          }
        };
      } catch (error) {
        console.error('Error generating health summary:', error);
        throw error;
      }
    }
  },
  
  Mutation: {
    createHealthRecord: async (_: any, { input }: { input: any }, context: any) => {
      // Get authenticated user for logging
      const user = await checkAuth(context);
      try {
        // Validate that the dog exists
        const dog = await db.Dog.findByPk(input.dogId);
        if (!dog) {
          throw new UserInputError(`Dog with ID ${input.dogId} not found`);
        }
        
        // Validate date
        const date = new Date(input.date);
        if (isNaN(date.getTime())) {
          throw new UserInputError('Invalid date format');
        }
        
        // Create health record
        const healthRecord = await db.HealthRecord.create({
          ...input,
          date
        });
        
        // Log creation in audit trail
        await Logger.logAuditTrail(
          AuditAction.CREATE,
          'HealthRecord',
          healthRecord.id.toString(),
          user.id,
          undefined,
          JSON.stringify({
            dogId: healthRecord.dogId,
            type: healthRecord.type,
            date: healthRecord.date,
            description: healthRecord.description,
            results: healthRecord.results,
            performedBy: healthRecord.veterinarian
          }),
          context.req?.ip,
          `Health record created for dog ${input.dogId}`
        );
        
        return healthRecord;
      } catch (error) {
        console.error('Error creating health record:', error);
        throw error;
      }
    },
    
    updateHealthRecord: async (_: any, { id, input }: { id: number; input: any }, context: any) => {
      // Get authenticated user for logging
      const user = await checkAuth(context);
      try {
        const healthRecord = await db.HealthRecord.findByPk(id);
        
        if (!healthRecord) {
          throw new UserInputError(`Health record with ID ${id} not found`);
        }
        
        // Validate date if provided
        if (input.date) {
          const date = new Date(input.date);
          if (isNaN(date.getTime())) {
            throw new UserInputError('Invalid date format');
          }
          input.date = date;
        }
        
        // Get previous state for audit log
        const previousState = JSON.stringify({
          type: healthRecord.type,
          date: healthRecord.date,
          description: healthRecord.description, 
          results: healthRecord.results,
          performedBy: healthRecord.veterinarian
        });
        
        // Update the record
        await healthRecord.update(input);
        
        // Log update in audit trail
        await Logger.logAuditTrail(
          AuditAction.UPDATE,
          'HealthRecord',
          healthRecord.id.toString(),
          user.id,
          previousState,
          JSON.stringify(input),
          context.req?.ip,
          `Health record updated for dog ${healthRecord.dogId}`
        );
        
        return healthRecord;
      } catch (error) {
        console.error('Error updating health record:', error);
        throw error;
      }
    },
    
    deleteHealthRecord: async (_: any, { id }: { id: number }, context: any) => {
      // Get authenticated user for logging
      const user = await checkAuth(context);
      try {
        const healthRecord = await db.HealthRecord.findByPk(id);
        
        if (!healthRecord) {
          throw new UserInputError(`Health record with ID ${id} not found`);
        }
        
        // Here we would implement authorization checks
        // For example: check if the current user is the owner or has admin rights
        // For now, we'll just proceed with deletion
        
        // Log system event for record deletion request
        await Logger.logSystemEvent(
          `Health record deletion requested for ID ${id}`,
          LogLevel.WARNING,
          'healthRecordResolvers.deleteHealthRecord',
          `Dog ID: ${healthRecord.dogId}`,
          undefined,
          user.id,
          context.req?.ip
        );
        
        // Get record details for audit log
        const recordDetails = JSON.stringify({
          id: healthRecord.id,
          dogId: healthRecord.dogId,
          type: healthRecord.type,
          date: healthRecord.date,
          description: healthRecord.description
        });
        
        // Delete the record
        await healthRecord.destroy();
        
        // Log deletion in audit trail
        await Logger.logAuditTrail(
          AuditAction.DELETE,
          'HealthRecord',
          id.toString(),
          user.id,
          recordDetails,
          undefined,
          context.req?.ip,
          `Health record deleted for dog ${healthRecord.dogId}`
        );
        
        return {
          success: true,
          message: `Health record with ID ${id} has been deleted`
        };
      } catch (error) {
        console.error('Error deleting health record:', error);
        return {
          success: false,
          message: `Failed to delete health record`
        };
      }
    },
    
    uploadHealthRecordAttachment: async (_: any, { 
      healthRecordId, 
      fileUrl 
    }: { 
      healthRecordId: number; 
      fileUrl: string 
    }, context: any) => {
      // Get authenticated user for logging
      const user = await checkAuth(context);
      try {
        const healthRecord = await db.HealthRecord.findByPk(healthRecordId);
        
        if (!healthRecord) {
          throw new UserInputError(`Health record with ID ${healthRecordId} not found`);
        }
        
        // Simply use the provided URL string directly instead of processing a file upload
        await healthRecord.update({
          attachmentUrl: fileUrl
        });
        
        // Log attachment upload in audit trail
        await Logger.logAuditTrail(
          AuditAction.UPDATE,
          'HealthRecord',
          healthRecord.id.toString(),
          user.id,
          undefined,
          JSON.stringify({
            attachmentAdded: true,
            url: fileUrl
          }),
          context.req?.ip,
          `File attachment added to health record ${healthRecord.id}`
        );
        
        return healthRecord;
      } catch (error) {
        console.error('Error uploading health record attachment:', error);
        
        // Add this type check or cast
        if (error instanceof Error) {
          throw new UserInputError('File upload error: ' + error.message);
        } else {
          throw new UserInputError('File upload error: Unknown error');
        }
      }
    }
  },
  
  HealthRecord: {
    dog: async (parent: any) => {
      try {
        return await db.Dog.findByPk(parent.dogId);
      } catch (error) {
        console.error('Error fetching dog for health record:', error);
        throw new Error('Failed to fetch dog for health record');
      }
    }
  }
};
