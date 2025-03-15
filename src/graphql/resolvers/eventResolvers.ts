import { Op } from 'sequelize';
import db from '../../db/models';
import { EventType } from '../../db/models/Event';
import { SortDirection } from './types';
import { UserInputError } from 'apollo-server-express';

export const eventResolvers = {
  Query: {
    events: async (_: any, {
      offset = 0,
      limit = 20,
      searchTerm,
      eventType,
      startDate,
      endDate,
      location,
      organizerId,
      sortDirection = SortDirection.ASC
    }: {
      offset?: number;
      limit?: number;
      searchTerm?: string;
      eventType?: EventType;
      startDate?: Date;
      endDate?: Date;
      location?: string;
      organizerId?: number;
      sortDirection?: SortDirection;
    }) => {
      try {
        const whereClause: any = {};
        
        if (searchTerm) {
          whereClause[Op.or] = [
            { title: { [Op.like]: `%${searchTerm}%` } },
            { description: { [Op.like]: `%${searchTerm}%` } },
            { location: { [Op.like]: `%${searchTerm}%` } }
          ];
        }
        
        if (eventType) {
          whereClause.eventType = eventType;
        }
        
        if (startDate) {
          whereClause.startDate = { [Op.gte]: startDate };
        }
        
        if (endDate) {
          whereClause.endDate = { [Op.lte]: endDate };
        }
        
        if (location) {
          whereClause.location = { [Op.like]: `%${location}%` };
        }
        
        if (organizerId) {
          whereClause.organizerId = organizerId;
        }
        
        // Add isPublished filter for regular users
        // For admin users, this could be removed or made configurable
        whereClause.isPublished = true;
        
        const { count, rows } = await db.Event.findAndCountAll({
          where: whereClause,
          order: [['startDate', sortDirection]],
          limit,
          offset,
        });
        
        return {
          totalCount: count,
          hasMore: offset + rows.length < count,
          items: rows
        };
      } catch (error) {
        console.error('Error fetching events:', error);
        throw new Error('Failed to fetch events');
      }
    },
    
    event: async (_: any, { id }: { id: number }) => {
      try {
        const event = await db.Event.findByPk(id);
        if (!event) {
          throw new UserInputError(`Event with ID ${id} not found`);
        }
        return event;
      } catch (error) {
        console.error('Error fetching event by ID:', error);
        throw error;
      }
    },
    
    upcomingEvents: async (_: any, {
      days = 30,
      limit = 5,
      eventType
    }: {
      days?: number;
      limit?: number;
      eventType?: EventType;
    }) => {
      try {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        
        const whereClause: any = {
          startDate: { [Op.between]: [today, futureDate] },
          isPublished: true
        };
        
        if (eventType) {
          whereClause.eventType = eventType;
        }
        
        const upcomingEvents = await db.Event.findAll({
          where: whereClause,
          order: [['startDate', 'ASC']],
          limit
        });
        
        return upcomingEvents;
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
        throw new Error('Failed to fetch upcoming events');
      }
    }
  },
  
  Mutation: {
    createEvent: async (_: any, { input }: { input: any }) => {
      try {
        // Validate dates
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        
        if (isNaN(startDate.getTime())) {
          throw new UserInputError('Invalid start date');
        }
        
        if (isNaN(endDate.getTime())) {
          throw new UserInputError('Invalid end date');
        }
        
        if (startDate > endDate) {
          throw new UserInputError('Start date cannot be after end date');
        }
        
        // Create the event
        const event = await db.Event.create({
          ...input,
          startDate,
          endDate,
          registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : null
        });
        
        return event;
      } catch (error) {
        console.error('Error creating event:', error);
        throw error;
      }
    },
    
    updateEvent: async (_: any, { id, input }: { id: number; input: any }) => {
      try {
        const event = await db.Event.findByPk(id);
        
        if (!event) {
          throw new UserInputError(`Event with ID ${id} not found`);
        }
        
        // Validate dates if provided
        if (input.startDate && input.endDate) {
          const startDate = new Date(input.startDate);
          const endDate = new Date(input.endDate);
          
          if (startDate > endDate) {
            throw new UserInputError('Start date cannot be after end date');
          }
        } else if (input.startDate && !input.endDate) {
          const startDate = new Date(input.startDate);
          const currentEndDate = event.endDate;
          
          if (startDate > currentEndDate) {
            throw new UserInputError('Start date cannot be after end date');
          }
        } else if (!input.startDate && input.endDate) {
          const currentStartDate = event.startDate;
          const endDate = new Date(input.endDate);
          
          if (currentStartDate > endDate) {
            throw new UserInputError('Start date cannot be after end date');
          }
        }
        
        // Process date fields
        if (input.startDate) {
          input.startDate = new Date(input.startDate);
        }
        
        if (input.endDate) {
          input.endDate = new Date(input.endDate);
        }
        
        if (input.registrationDeadline) {
          input.registrationDeadline = new Date(input.registrationDeadline);
        }
        
        await event.update(input);
        
        return event;
      } catch (error) {
        console.error('Error updating event:', error);
        throw error;
      }
    },
    
    publishEvent: async (_: any, { id }: { id: number }) => {
      try {
        const event = await db.Event.findByPk(id);
        
        if (!event) {
          throw new UserInputError(`Event with ID ${id} not found`);
        }
        
        await event.update({ isPublished: true });
        
        return event;
      } catch (error) {
        console.error('Error publishing event:', error);
        throw error;
      }
    },
    
    registerDogForEvent: async (_: any, { eventId, dogId }: { eventId: number; dogId: number }) => {
      try {
        // Fetch the event and dog to ensure they exist
        const event = await db.Event.findByPk(eventId);
        const dog = await db.Dog.findByPk(dogId);
        
        if (!event) {
          throw new UserInputError(`Event with ID ${eventId} not found`);
        }
        
        if (!dog) {
          throw new UserInputError(`Dog with ID ${dogId} not found`);
        }
        
        // Check if the event is published
        if (!event.isPublished) {
          throw new UserInputError('Cannot register for an unpublished event');
        }
        
        // Check if the dog is already registered for this event
        const existingRegistration = await db.EventRegistration.findOne({
          where: {
            eventId,
            dogId
          }
        });
        
        if (existingRegistration) {
          throw new UserInputError(`Dog with ID ${dogId} is already registered for this event`);
        }
        
        // Create the registration
        const registration = await db.EventRegistration.create({
          eventId,
          dogId,
          registrationDate: new Date()
        });
        
        // Return the registration with related data
        return {
          event,
          dog,
          registrationDate: registration.registrationDate
        };
      } catch (error) {
        console.error('Error registering dog for event:', error);
        throw error;
      }
    }
  },
  
  Event: {
    registeredDogs: async (parent: any) => {
      try {
        const registrations = await db.EventRegistration.findAll({
          where: { eventId: parent.id },
          include: [{ model: db.Dog }]
        });
        
        return registrations.map((registration: any) => registration.Dog);
      } catch (error) {
        console.error('Error fetching registered dogs:', error);
        throw new Error('Failed to fetch registered dogs');
      }
    }
  }
};
