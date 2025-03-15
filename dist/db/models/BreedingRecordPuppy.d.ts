import { Model, Sequelize } from 'sequelize';
interface BreedingRecordPuppyAttributes {
    breedingRecordId: number;
    puppyId: number;
    createdAt: Date;
    updatedAt: Date;
}
declare class BreedingRecordPuppy extends Model<BreedingRecordPuppyAttributes> implements BreedingRecordPuppyAttributes {
    breedingRecordId: number;
    puppyId: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export declare const initBreedingRecordPuppyModel: (sequelize: Sequelize) => typeof BreedingRecordPuppy;
export default BreedingRecordPuppy;
