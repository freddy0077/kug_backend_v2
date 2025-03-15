import { Model, Sequelize } from 'sequelize';
export declare enum BreedingProgramStatus {
    PLANNING = "PLANNING",
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export interface BreedingProgramAttributes {
    id?: number;
    name: string;
    description: string;
    breederId: number;
    breed: string;
    goals: string[];
    startDate: Date;
    endDate?: Date;
    status: BreedingProgramStatus;
    geneticTestingProtocol?: string;
    selectionCriteria?: string;
    notes?: string;
    isPublic: boolean;
    imageUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface BreedingProgramCreationAttributes extends BreedingProgramAttributes {
}
declare class BreedingProgram extends Model<BreedingProgramAttributes, BreedingProgramCreationAttributes> implements BreedingProgramAttributes {
    id: number;
    name: string;
    description: string;
    breederId: number;
    breed: string;
    goals: string[];
    startDate: Date;
    endDate?: Date;
    status: BreedingProgramStatus;
    geneticTestingProtocol?: string;
    selectionCriteria?: string;
    notes?: string;
    isPublic: boolean;
    imageUrl?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
    static initialize(sequelize: Sequelize): void;
}
export default BreedingProgram;
