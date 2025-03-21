import { Model, Sequelize, Optional } from 'sequelize';
export declare enum HealthRecordType {
    VACCINATION = "VACCINATION",
    EXAMINATION = "EXAMINATION",
    TREATMENT = "TREATMENT",
    SURGERY = "SURGERY",
    TEST = "TEST",
    OTHER = "OTHER"
}
interface HealthRecordAttributes {
    id: string;
    dogId: string;
    date: Date;
    veterinarian: string | null;
    vetName: string | null;
    description: string;
    results: string | null;
    type: HealthRecordType;
    attachmentUrl: string | null;
    documentUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}
interface HealthRecordCreationAttributes extends Optional<HealthRecordAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}
declare class HealthRecord extends Model<HealthRecordAttributes, HealthRecordCreationAttributes> implements HealthRecordAttributes {
    id: string;
    dogId: string;
    date: Date;
    veterinarian: string | null;
    vetName: string | null;
    description: string;
    results: string | null;
    type: HealthRecordType;
    attachmentUrl: string | null;
    documentUrl: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static associate(models: any): void;
}
export declare const initHealthRecordModel: (sequelize: Sequelize) => typeof HealthRecord;
export default HealthRecord;
