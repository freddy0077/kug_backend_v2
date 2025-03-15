import { Model, Sequelize, Optional } from 'sequelize';
interface OwnershipAttributes {
    id: number;
    ownerId: number;
    dogId: number;
    startDate: Date;
    endDate: Date | null;
    isCurrent: boolean;
    transferDocumentUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}
interface OwnershipCreationAttributes extends Optional<OwnershipAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Ownership extends Model<OwnershipAttributes, OwnershipCreationAttributes> implements OwnershipAttributes {
    id: number;
    ownerId: number;
    dogId: number;
    startDate: Date;
    endDate: Date | null;
    isCurrent: boolean;
    transferDocumentUrl: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
}
export declare const initOwnershipModel: (sequelize: Sequelize) => typeof Ownership;
export default Ownership;
