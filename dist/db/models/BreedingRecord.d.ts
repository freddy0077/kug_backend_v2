import { Model, Sequelize, Optional } from 'sequelize';
interface BreedingRecordAttributes {
    id: number;
    sireId: number;
    damId: number;
    breedingDate: Date;
    litterSize: number | null;
    comments: string | null;
    breedingPairId?: number;
    createdAt: Date;
    updatedAt: Date;
}
interface BreedingRecordCreationAttributes extends Optional<BreedingRecordAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class BreedingRecord extends Model<BreedingRecordAttributes, BreedingRecordCreationAttributes> implements BreedingRecordAttributes {
    id: number;
    sireId: number;
    damId: number;
    breedingDate: Date;
    litterSize: number | null;
    comments: string | null;
    breedingPairId: number | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
}
export declare const initBreedingRecordModel: (sequelize: Sequelize) => typeof BreedingRecord;
export default BreedingRecord;
