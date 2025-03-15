import { Model, Sequelize, Optional } from 'sequelize';
interface DogAttributes {
    id: number;
    name: string;
    breed: string;
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
    sireId: number | null;
    damId: number | null;
    createdAt: Date;
    updatedAt: Date;
}
interface DogCreationAttributes extends Optional<DogAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class Dog extends Model<DogAttributes, DogCreationAttributes> implements DogAttributes {
    id: number;
    name: string;
    breed: string;
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
    sireId: number | null;
    damId: number | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
}
export declare const initDogModel: (sequelize: Sequelize) => typeof Dog;
export default Dog;
