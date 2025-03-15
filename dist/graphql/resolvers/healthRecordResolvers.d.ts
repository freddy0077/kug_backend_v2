import { HealthRecordType } from '../../db/models/HealthRecord';
import { SortDirection } from './types';
export declare const healthRecordResolvers: {
    Query: {
        dogHealthRecords: (_: any, { dogId, offset, limit, type, startDate, endDate, sortDirection }: {
            dogId: number;
            offset?: number;
            limit?: number;
            type?: HealthRecordType;
            startDate?: Date;
            endDate?: Date;
            sortDirection?: SortDirection;
        }, context: any) => Promise<{
            totalCount: number;
            hasMore: boolean;
            items: import("../../db/models/HealthRecord").default[];
        }>;
        healthRecord: (_: any, { id }: {
            id: number;
        }, context: any) => Promise<import("../../db/models/HealthRecord").default>;
        healthSummary: (_: any, { dogId }: {
            dogId: number;
        }, context: any) => Promise<{
            recordCount: number;
            latestExamDate: Date | null;
            recordsByType: {
                type: HealthRecordType;
                count: number;
            }[];
            recentRecords: import("../../db/models/HealthRecord").default[];
            vaccinationStatus: {
                isUpToDate: boolean;
                nextDueDate: Date | null;
                missingVaccinations: string[];
            };
        }>;
    };
    Mutation: {
        createHealthRecord: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<import("../../db/models/HealthRecord").default>;
        updateHealthRecord: (_: any, { id, input }: {
            id: number;
            input: any;
        }, context: any) => Promise<import("../../db/models/HealthRecord").default>;
        deleteHealthRecord: (_: any, { id }: {
            id: number;
        }, context: any) => Promise<{
            success: boolean;
            message: string;
        }>;
        uploadHealthRecordAttachment: (_: any, { healthRecordId, fileUrl }: {
            healthRecordId: number;
            fileUrl: string;
        }, context: any) => Promise<import("../../db/models/HealthRecord").default>;
    };
    HealthRecord: {
        dog: (parent: any) => Promise<import("../../db/models/Dog").default | null>;
    };
};
