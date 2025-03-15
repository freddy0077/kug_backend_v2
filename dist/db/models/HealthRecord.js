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
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        dogId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Dogs',
                key: 'id',
            },
        },
        date: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        veterinarian: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        results: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        type: {
            type: sequelize_1.DataTypes.ENUM(...Object.values(HealthRecordType)),
            allowNull: false,
        },
        attachmentUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
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