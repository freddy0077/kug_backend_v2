import { Model, Sequelize } from 'sequelize';
export interface BreedingProgramFoundationDogAttributes {
    id?: number;
    breedingProgramId: number;
    dogId: number;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface BreedingProgramFoundationDogCreationAttributes extends BreedingProgramFoundationDogAttributes {
}
declare class BreedingProgramFoundationDog extends Model<BreedingProgramFoundationDogAttributes, BreedingProgramFoundationDogCreationAttributes> implements BreedingProgramFoundationDogAttributes {
    id: number;
    breedingProgramId: number;
    dogId: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static initialize(sequelize: Sequelize): void;
}
export default BreedingProgramFoundationDog;
