import { Model, Sequelize, Optional, Association } from 'sequelize';
import { Breed } from './Breed';
export interface DogAttributes {
    id: string;
    name: string;
    breed: string;
    breed_id: string | null;
    breedId: string | null;
    gender: string;
    dateOfBirth: Date;
    dateOfDeath: Date | null;
    color: string | null;
    registrationNumber: string;
    microchipNumber: string | null;
    titles: string[] | null;
    isNeutered: boolean | null;
    height: number | null;
    weight: number | null;
    biography: string | null;
    mainImageUrl: string | null;
    sireId: string | null;
    damId: string | null;
    litterId: string | null;
    approvalStatus: string;
    approvedBy: string | null;
    approvalDate: Date | null;
    approvalNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface DogCreationAttributes extends Optional<DogAttributes, 'id' | 'createdAt' | 'updatedAt' | 'breed_id' | 'breedId'> {
}
declare class Dog extends Model<DogAttributes, DogCreationAttributes> implements DogAttributes {
    id: string;
    name: string;
    breed: string;
    breed_id: string | null;
    breedId: string | null;
    gender: string;
    dateOfBirth: Date;
    dateOfDeath: Date | null;
    color: string | null;
    registrationNumber: string;
    microchipNumber: string | null;
    titles: string[] | null;
    isNeutered: boolean | null;
    height: number | null;
    weight: number | null;
    biography: string | null;
    mainImageUrl: string | null;
    sireId: string | null;
    damId: string | null;
    litterId: string | null;
    approvalStatus: string;
    approvedBy: string | null;
    approvalDate: Date | null;
    approvalNotes: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    breedObj?: Breed;
    static associations: {
        breedObj: Association<Dog, Breed>;
        sire: Association<Dog, Dog>;
        dam: Association<Dog, Dog>;
        litter: Association<Dog, any>;
    };
    static associate(models: any): void;
}
export declare const initDogModel: (sequelize: Sequelize) => typeof Dog;
export default Dog;
