import { Op } from 'sequelize';
import db from '../../db/models';
import { UserInputError } from 'apollo-server-express';

export const clubEventResolvers = {
  Query: {
    clubEvents: async (_: any, {
      clubId,
      offset = 0,
      limit = 20,
      includeNonMemberEvents = true
    }: {
      clubId: number;
      offset?: number;
      limit?: number;
      includeNonMemberEvents?: boolean;
    }) => {
      try {
        // First check if club exists
        const club = await db.Club.findByPk(clubId);
        if (!club) {
          throw new UserInputError(`Club with ID ${clubId} not found`);
        }
        
        const whereClause: any = { clubId };
        
        // If we don't want non-member events, filter them out
        if (!includeNonMemberEvents) {
          whereClause.membersOnly = true;
        }
        
        // Find club events with their associated events
        const { count, rows } = await db.ClubEvent.findAndCountAll({
          where: whereClause,
          include: [
            {
              model: db.Event,
              where: { isPublished: true }, // Only include published events
              required: true
            }
          ],
          limit,
          offset,
          order: [[db.Event, 'startDate', 'ASC']] // Order by event start date
        });
        
        return {
          totalCount: count,
          hasMore: offset + rows.length < count,
          items: rows
        };
      } catch (error) {
        console.error('Error fetching club events:', error);
        throw error;
      }
    },
    
    clubs: async () => {
      try {
        return await db.Club.findAll();
      } catch (error) {
        console.error('Error fetching clubs:', error);
        throw new Error('Failed to fetch clubs');
      }
    },
    
    club: async (_: any, { id }: { id: number }) => {
      try {
        const club = await db.Club.findByPk(id);
        if (!club) {
          throw new UserInputError(`Club with ID ${id} not found`);
        }
        return club;
      } catch (error) {
        console.error('Error fetching club by ID:', error);
        throw error;
      }
    }
  },
  
  Mutation: {
    createClubEvent: async (_: any, { input }: { input: any }) => {
      try {
        const { clubId, eventInput, membersOnly, memberRegistrationFee, nonMemberRegistrationFee, maxParticipants } = input;
        
        // Check if club exists
        const club = await db.Club.findByPk(clubId);
        if (!club) {
          throw new UserInputError(`Club with ID ${clubId} not found`);
        }
        
        // Validate dates
        const startDate = new Date(eventInput.startDate);
        const endDate = new Date(eventInput.endDate);
        
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
          ...eventInput,
          startDate,
          endDate,
          organizer: club.name, // Set club name as organizer
          organizerId: clubId,
          registrationDeadline: eventInput.registrationDeadline ? new Date(eventInput.registrationDeadline) : null
        });
        
        // Create the club event linking the event to the club
        const clubEvent = await db.ClubEvent.create({
          clubId,
          eventId: event.id,
          membersOnly,
          memberRegistrationFee,
          nonMemberRegistrationFee,
          maxParticipants,
          currentParticipants: 0
        });
        
        // Load the complete club event with related event and club
        const fullClubEvent = await db.ClubEvent.findByPk(clubEvent.id, {
          include: [
            { model: db.Event },
            { model: db.Club }
          ]
        });
        
        return fullClubEvent;
      } catch (error) {
        console.error('Error creating club event:', error);
        throw error;
      }
    }
  },
  
  ClubEvent: {
    club: async (parent: any) => {
      try {
        return await db.Club.findByPk(parent.clubId);
      } catch (error) {
        console.error('Error fetching club for club event:', error);
        throw new Error('Failed to fetch club');
      }
    },
    
    event: async (parent: any) => {
      try {
        return await db.Event.findByPk(parent.eventId);
      } catch (error) {
        console.error('Error fetching event for club event:', error);
        throw new Error('Failed to fetch event');
      }
    }
  },
  
  Club: {
    events: async (parent: any) => {
      try {
        const clubEvents = await db.ClubEvent.findAll({
          where: { clubId: parent.id },
          include: [
            {
              model: db.Event,
              where: { isPublished: true },
              required: true
            }
          ]
        });
        
        return clubEvents;
      } catch (error) {
        console.error('Error fetching events for club:', error);
        throw new Error('Failed to fetch events for club');
      }
    }
  }
};
