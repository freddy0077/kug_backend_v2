import { Model, Sequelize, Optional } from 'sequelize';
export interface CompetitionResultAttributes {
    id: number;
    dogId: number;
    eventName: string;
    eventDate: Date;
    category: string | null;
    rank: number | null;
    titleEarned: string | null;
    points: number | null;
    createdAt: Date;
    updatedAt: Date;
}
interface CompetitionResultCreationAttributes extends Optional<CompetitionResultAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class CompetitionResult extends Model<CompetitionResultAttributes, CompetitionResultCreationAttributes> implements CompetitionResultAttributes {
    id: number;
    dogId: number;
    eventName: string;
    eventDate: Date;
    category: string | null;
    rank: number | null;
    titleEarned: string | null;
    points: number | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
}
export declare const initCompetitionResultModel: (sequelize: Sequelize) => typeof CompetitionResult;
export default CompetitionResult;
