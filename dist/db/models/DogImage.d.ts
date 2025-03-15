import { Model, Sequelize, Optional } from 'sequelize';
interface DogImageAttributes {
    id: number;
    dogId: number;
    url: string;
    caption: string | null;
    isPrimary: boolean;
    createdAt: Date;
}
interface DogImageCreationAttributes extends Optional<DogImageAttributes, 'id' | 'createdAt'> {
}
declare class DogImage extends Model<DogImageAttributes, DogImageCreationAttributes> implements DogImageAttributes {
    id: number;
    dogId: number;
    url: string;
    caption: string | null;
    isPrimary: boolean;
    readonly createdAt: Date;
    static associate(models: any): void;
}
export declare const initDogImageModel: (sequelize: Sequelize) => typeof DogImage;
export default DogImage;
