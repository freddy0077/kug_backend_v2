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
        url: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            field: 'url'
        },
        imageUrl: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('url');
            },
            set(value) {
                this.setDataValue('url', value);
            }
        },
        caption: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
            field: 'caption'
        },
        isPrimary: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_primary'
        },
        isProfileImage: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get() {
                return this.getDataValue('isPrimary');
            },
            set(value) {
                this.setDataValue('isPrimary', value);
            }
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            field: 'created_at'
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