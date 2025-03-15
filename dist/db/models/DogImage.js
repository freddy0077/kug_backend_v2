"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDogImageModel = void 0;
const sequelize_1 = require("sequelize");
class DogImage extends sequelize_1.Model {
    // Associations
    static associate(models) {
        DogImage.belongsTo(models.Dog, { as: 'dog', foreignKey: 'dogId' });
    }
}
const initDogImageModel = (sequelize) => {
    DogImage.init({
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
        url: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        caption: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        isPrimary: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
    }, {
        sequelize,
        tableName: 'DogImages',
        modelName: 'DogImage',
        timestamps: true,
        updatedAt: false, // No updatedAt field as per the GraphQL schema
        underscored: true,
    });
    return DogImage;
};
exports.initDogImageModel = initDogImageModel;
exports.default = DogImage;
//# sourceMappingURL=DogImage.js.map