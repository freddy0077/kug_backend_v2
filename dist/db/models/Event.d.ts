import { Model, Sequelize, Optional } from 'sequelize';
export declare enum EventType {
    SHOW = "SHOW",
    COMPETITION = "COMPETITION",
    SEMINAR = "SEMINAR",
    TRAINING = "TRAINING",
    MEETING = "MEETING",
    SOCIAL = "SOCIAL",
    OTHER = "OTHER"
}
interface EventAttributes {
    id: number;
    title: string;
    description: string;
    eventType: EventType;
    startDate: Date;
    endDate: Date;
    location: string;
    address: string | null;
    organizer: string;
    organizerId: number | null;
    contactEmail: string | null;
    contactPhone: string | null;
    website: string | null;
    registrationUrl: string | null;
    registrationDeadline: Date | null;
    imageUrl: string | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}
interface EventCreationAttributes extends Optional<EventAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
    id: number;
    title: string;
    description: string;
    eventType: EventType;
    startDate: Date;
    endDate: Date;
    location: string;
    address: string | null;
    organizer: string;
    organizerId: number | null;
    contactEmail: string | null;
    contactPhone: string | null;
    website: string | null;
    registrationUrl: string | null;
    registrationDeadline: Date | null;
    imageUrl: string | null;
    isPublished: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
}
export declare const initEventModel: (sequelize: Sequelize) => typeof Event;
export default Event;
