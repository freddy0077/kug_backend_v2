import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  HANDLER = 'HANDLER',
  CLUB = 'CLUB',
  VIEWER = 'VIEWER'
}

interface UserAttributes {
  id: string; // Changed from number to string for UUID
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImageUrl: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  ownerId: string | null; // Changed from number to string for UUID
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'profileImageUrl' | 'isActive' | 'lastLogin' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string; // Changed from number to string for UUID
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public role!: UserRole;
  public profileImageUrl!: string | null;
  public isActive!: boolean;
  public lastLogin!: Date | null;
  public ownerId!: string | null; // Changed from number to string for UUID
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual fields
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Methods
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Associations
  public static associate(models: any) {
    User.belongsTo(models.Owner, { foreignKey: 'ownerId', as: 'owner' });
  }
}

export const initUserModel = (sequelize: Sequelize): typeof User => {
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      field: 'email'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password'
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'last_name'
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: UserRole.VIEWER,
      validate: {
        isIn: [Object.values(UserRole)]
      },
      field: 'role'
    },
    profileImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'profile_image_url'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login'
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Owners',
        key: 'id',
      },
      field: 'owner_id'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    },
  }, {
    sequelize,
    tableName: 'Users',
    modelName: 'User',
    underscored: false, // Explicitly tell Sequelize to use camelCase column names
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
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

export default User;
