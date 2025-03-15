import { Model, Sequelize, Optional } from 'sequelize';
interface ClubAttributes {
    id: number;
    name: string;
    description: string | null;
    logo: string | null;
    website: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    address: string | null;
    createdAt: Date;
    updatedAt: Date;
}
interface ClubCreationAttributes extends Optional<ClubAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Club extends Model<ClubAttributes, ClubCreationAttributes> implements ClubAttributes {
    id: number;
    name: string;
    description: string | null;
    logo: string | null;
    website: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    address: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
}
export declare const initClubModel: (sequelize: Sequelize) => typeof Club;
export default Club;
