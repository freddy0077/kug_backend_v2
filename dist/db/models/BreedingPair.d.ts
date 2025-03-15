import { Model, Sequelize } from 'sequelize';
export declare enum BreedingPairStatus {
    PLANNED = "PLANNED",
    APPROVED = "APPROVED",
    PENDING_TESTING = "PENDING_TESTING",
    BREEDING_SCHEDULED = "BREEDING_SCHEDULED",
    BRED = "BRED",
    UNSUCCESSFUL = "UNSUCCESSFUL",
    CANCELLED = "CANCELLED"
}
export interface BreedingPairAttributes {
    id?: number;
    programId: number;
    sireId: number;
    damId: number;
    plannedBreedingDate?: Date;
    compatibilityNotes?: string;
    geneticCompatibilityScore?: number;
    status: BreedingPairStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface BreedingPairCreationAttributes extends BreedingPairAttributes {
}
declare class BreedingPair extends Model<BreedingPairAttributes, BreedingPairCreationAttributes> implements BreedingPairAttributes {
    id: number;
    programId: number;
    sireId: number;
    damId: number;
    plannedBreedingDate?: Date;
    compatibilityNotes?: string;
    geneticCompatibilityScore?: number;
    status: BreedingPairStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
    static initialize(sequelize: Sequelize): void;
}
export default BreedingPair;
