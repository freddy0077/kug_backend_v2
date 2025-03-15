import { Model, Sequelize, Optional } from 'sequelize';
export declare enum UserRole {
    ADMIN = "ADMIN",
    OWNER = "OWNER",
    HANDLER = "HANDLER",
    CLUB = "CLUB",
    VIEWER = "VIEWER"
}
interface UserAttributes {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    profileImageUrl: string | null;
    isActive: boolean;
    lastLogin: Date | null;
    ownerId: number | null;
    createdAt: Date;
    updatedAt: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'profileImageUrl' | 'isActive' | 'lastLogin' | 'createdAt' | 'updatedAt'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    profileImageUrl: string | null;
    isActive: boolean;
    lastLogin: Date | null;
    ownerId: number | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    get fullName(): string;
    validatePassword(password: string): Promise<boolean>;
    static associate(models: any): void;
}
export declare const initUserModel: (sequelize: Sequelize) => typeof User;
export default User;
