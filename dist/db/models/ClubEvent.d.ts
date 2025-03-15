import { Model, Sequelize, Optional } from 'sequelize';
interface ClubEventAttributes {
    id: number;
    clubId: number;
    eventId: number;
    membersOnly: boolean;
    memberRegistrationFee: number | null;
    nonMemberRegistrationFee: number | null;
    maxParticipants: number | null;
    currentParticipants: number;
    createdAt: Date;
    updatedAt: Date;
}
interface ClubEventCreationAttributes extends Optional<ClubEventAttributes, 'id' | 'createdAt' | 'updatedAt' | 'currentParticipants'> {
}
declare class ClubEvent extends Model<ClubEventAttributes, ClubEventCreationAttributes> implements ClubEventAttributes {
    id: number;
    clubId: number;
    eventId: number;
    membersOnly: boolean;
    memberRegistrationFee: number | null;
    nonMemberRegistrationFee: number | null;
    maxParticipants: number | null;
    currentParticipants: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
}
export declare const initClubEventModel: (sequelize: Sequelize) => typeof ClubEvent;
export default ClubEvent;
