"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initHealthRecordModel = exports.HealthRecordType = void 0;
const sequelize_1 = require("sequelize");
var HealthRecordType;
(function (HealthRecordType) {
    HealthRecordType["VACCINATION"] = "VACCINATION";
    HealthRecordType["EXAMINATION"] = "EXAMINATION";
    HealthRecordType["TREATMENT"] = "TREATMENT";
    HealthRecordType["SURGERY"] = "SURGERY";
    HealthRecordType["TEST"] = "TEST";
    HealthRecordType["OTHER"] = "OTHER";
})(HealthRecordType || (exports.HealthRecordType = HealthRecordType = {}));
class HealthRecord extends sequelize_1.Model {
    // Associations
    static associate(models) {
        HealthRecord.belongsTo(models.Dog, { as: 'dog', foreignKey: 'dogId' });
    }
}
const initHealthRecordModel = (sequelize) => {
    HealthRecord.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        dogId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Dogs',
                key: 'id',
            },
            field: 'dog_id'
        },
        date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'date'
        },
        veterinarian: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'veterinarian_name' // Updated field name to match memory
        },
        vetName: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('veterinarian');
            },
            set(value) {
                this.setDataValue('veterinarian', value);
            }
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            field: 'description'
        },
        results: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
            field: 'results'
        },
        type: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(HealthRecordType)),
            allowNull: false,
            field: 'type'
        },
        attachmentUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'document_url' // Updated field name to match memory
        },
        documentUrl: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('attachmentUrl');
            },
            set(value) {
                this.setDataValue('attachmentUrl', value);
            }
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'created_at'
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'updated_at'
        },
    }, {
        sequelize,
        tableName: 'HealthRecords',
        modelName: 'HealthRecord',
        underscored: true,
    });
    return HealthRecord;
};
exports.initHealthRecordModel = initHealthRecordModel;
exports.default = HealthRecord;
//# sourceMappingURL=HealthRecord.js.map