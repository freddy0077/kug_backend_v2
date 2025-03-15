import { Model, Sequelize, Optional } from 'sequelize';
interface EventRegistrationAttributes {
    id: number;
    eventId: number;
    dogId: number;
    registrationDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
interface EventRegistrationCreationAttributes extends Optional<EventRegistrationAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class EventRegistration extends Model<EventRegistrationAttributes, EventRegistrationCreationAttributes> implements EventRegistrationAttributes {
    id: number;
    eventId: number;
    dogId: number;
    registrationDate: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
}
export declare const initEventRegistrationModel: (sequelize: Sequelize) => typeof EventRegistration;
export default EventRegistration;
