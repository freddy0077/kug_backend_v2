import { Model, Sequelize, Optional } from 'sequelize';
interface OwnerAttributes {
    id: number;
    userId: number | null;
    name: string;
    contactEmail: string | null;
    contactPhone: string | null;
    address: string | null;
    createdAt: Date;
    updatedAt: Date;
}
interface OwnerCreationAttributes extends Optional<OwnerAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Owner extends Model<OwnerAttributes, OwnerCreationAttributes> implements OwnerAttributes {
    id: number;
    userId: number | null;
    name: string;
    contactEmail: string | null;
    contactPhone: string | null;
    address: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
}
export declare const initOwnerModel: (sequelize: Sequelize) => typeof Owner;
export default Owner;
