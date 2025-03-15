"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initUserModel = exports.UserRole = void 0;
const sequelize_1 = require("sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["OWNER"] = "OWNER";
    UserRole["HANDLER"] = "HANDLER";
    UserRole["CLUB"] = "CLUB";
    UserRole["VIEWER"] = "VIEWER";
})(UserRole || (exports.UserRole = UserRole = {}));
class User extends sequelize_1.Model {
    // Virtual fields
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    // Methods
    async validatePassword(password) {
        return bcryptjs_1.default.compare(password, this.password);
    }
    // Associations
    static associate(models) {
        User.belongsTo(models.Owner, { foreignKey: 'ownerId', as: 'owner' });
    }
}
const initUserModel = (sequelize) => {
    User.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        firstName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: UserRole.VIEWER,
            validate: {
                isIn: [Object.values(UserRole)]
            }
        },
        profileImageUrl: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        lastLogin: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: true,
        },
        ownerId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Owners',
                key: 'id',
            },
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
        tableName: 'Users',
        modelName: 'User',
        underscored: false, // Explicitly tell Sequelize to use camelCase column names
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcryptjs_1.default.genSalt(10);
                    user.password = await bcryptjs_1.default.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password') && user.password) {
                    const salt = await bcryptjs_1.default.genSalt(10);
                    user.password = await bcryptjs_1.default.hash(user.password, salt);
                }
            },
        },
        defaultScope: {
            attributes: { exclude: ['password'] },
        },
        scopes: {
            withPassword: {
                attributes: { include: ['password'] },
            },
        },
    });
    return User;
};
exports.initUserModel = initUserModel;
exports.default = User;
//# sourceMappingURL=User.js.map