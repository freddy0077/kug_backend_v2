import { EventType } from '../../db/models/Event';
import { SortDirection } from './types';
export declare const eventResolvers: {
    Query: {
        events: (_: any, { offset, limit, searchTerm, eventType, startDate, endDate, location, organizerId, sortDirection }: {
            offset?: number;
            limit?: number;
            searchTerm?: string;
            eventType?: EventType;
            startDate?: Date;
            endDate?: Date;
            location?: string;
            organizerId?: number;
            sortDirection?: SortDirection;
        }) => Promise<{
            totalCount: number;
            hasMore: boolean;
            items: import("../../db/models/Event").default[];
        }>;
        event: (_: any, { id }: {
            id: number;
        }) => Promise<import("../../db/models/Event").default>;
        upcomingEvents: (_: any, { days, limit, eventType }: {
            days?: number;
            limit?: number;
            eventType?: EventType;
        }) => Promise<import("../../db/models/Event").default[]>;
    };
    Mutation: {
        createEvent: (_: any, { input }: {
            input: any;
        }) => Promise<import("../../db/models/Event").default>;
        updateEvent: (_: any, { id, input }: {
            id: number;
            input: any;
        }) => Promise<import("../../db/models/Event").default>;
        publishEvent: (_: any, { id }: {
            id: number;
        }) => Promise<import("../../db/models/Event").default>;
        registerDogForEvent: (_: any, { eventId, dogId }: {
            eventId: number;
            dogId: number;
        }) => Promise<{
            event: import("../../db/models/Event").default;
            dog: import("../../db/models/Dog").default;
            registrationDate: Date;
        }>;
    };
    Event: {
        registeredDogs: (parent: any) => Promise<any[]>;
    };
};
