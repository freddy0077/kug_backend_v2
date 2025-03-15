"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = void 0;
const sequelize_1 = require("sequelize");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apollo_server_express_1 = require("apollo-server-express");
const User_1 = require("../../db/models/User");
const models_1 = __importDefault(require("../../db/models"));
const auth_1 = require("../../utils/auth");
// Helper to generate JWT token
const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || 'default_secret_replace_in_production';
    const expiresIn = '7d';
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role
    }, secret, { expiresIn });
    return { token, user, expiresAt };
};
// Format pagination results
const formatPaginationResults = (results, limit) => {
    return {
        totalCount: results.count,
        hasMore: results.count > (results.rows.length + results.offset),
        items: results.rows
    };
};
exports.userResolvers = {
    Query: {
        // Get the current logged-in user
        me: async (_, __, { user }) => {
            if (!user) {
                return null; // Not authenticated, but don't throw error
            }
            try {
                const userRecord = await models_1.default.User.findByPk(user.id, {
                    include: [{ model: models_1.default.Owner, as: 'owner' }]
                });
                if (!userRecord) {
                    return null;
                }
                return userRecord;
            }
            catch (error) {
                console.error('Error fetching current user:', error);
                throw new Error('Failed to fetch current user');
            }
        },
        // Get a list of users (paginated with filters)
        users: async (_, { offset = 0, limit = 20, searchTerm, role, isActive }, context) => {
            // Check authentication and admin permissions
            const authUser = (0, auth_1.checkAuth)(context);
            if (authUser.role !== User_1.UserRole.ADMIN) {
                throw new apollo_server_express_1.ForbiddenError('Not authorized to view users list');
            }
            try {
                const where = {};
                // Apply filters
                if (searchTerm) {
                    where[sequelize_1.Op.or] = [
                        { email: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                        { firstName: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                        { lastName: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } }
                    ];
                }
                if (role) {
                    where.role = role;
                }
                if (isActive !== undefined) {
                    where.isActive = isActive;
                }
                const users = await models_1.default.User.findAndCountAll({
                    where,
                    limit,
                    offset,
                    order: [['createdAt', 'DESC']],
                    include: [{ model: models_1.default.Owner, as: 'owner' }]
                });
                return formatPaginationResults(users, limit);
            }
            catch (error) {
                console.error('Error fetching users:', error);
                throw new Error('Failed to fetch users');
            }
        },
        // Get a specific user by ID
        user: async (_, { id }, context) => {
            const authUser = (0, auth_1.checkAuth)(context);
            // Only admins or the user themselves can view detailed user info
            if (authUser.role !== User_1.UserRole.ADMIN && authUser.id !== parseInt(id, 10)) {
                throw new apollo_server_express_1.ForbiddenError('Not authorized to view this user');
            }
            try {
                const user = await models_1.default.User.findByPk(id, {
                    include: [{ model: models_1.default.Owner, as: 'owner' }]
                });
                if (!user) {
                    throw new apollo_server_express_1.UserInputError('User not found');
                }
                return user;
            }
            catch (error) {
                console.error('Error fetching user:', error);
                throw new Error('Failed to fetch user');
            }
        }
    },
    Mutation: {
        // User login
        login: async (_, { email, password }, context) => {
            try {
                // Find user with password (need to use scope to include password)
                const user = await models_1.default.User.scope('withPassword').findOne({
                    where: { email: email.toLowerCase() }
                });
                if (!user) {
                    throw new apollo_server_express_1.AuthenticationError('Invalid email or password');
                }
                if (!user.isActive) {
                    throw new apollo_server_express_1.AuthenticationError('Account is deactivated. Please contact an administrator.');
                }
                // Validate password
                const isValid = await user.validatePassword(password);
                if (!isValid) {
                    throw new apollo_server_express_1.AuthenticationError('Invalid email or password');
                }
                // Update last login time
                await user.update({ lastLogin: new Date() });
                // Remove password from response
                const userWithoutPassword = await models_1.default.User.findByPk(user.id, {
                    include: [{ model: models_1.default.Owner, as: 'owner' }]
                });
                // Generate JWT token
                return generateToken(userWithoutPassword);
            }
            catch (error) {
                if (error instanceof apollo_server_express_1.AuthenticationError) {
                    throw error;
                }
                console.error('Login error:', error);
                throw new Error('Failed to login');
            }
        },
        // User registration
        register: async (_, { input }, context) => {
            const { email, password, firstName, lastName, role, ownerInfo } = input;
            // Check if registering as ADMIN (only existing ADMIN can create another ADMIN)
            if (role === User_1.UserRole.ADMIN) {
                try {
                    const authUser = (0, auth_1.checkAuth)(context);
                    if (authUser.role !== User_1.UserRole.ADMIN) {
                        throw new apollo_server_express_1.ForbiddenError('Only administrators can create admin accounts');
                    }
                }
                catch (error) {
                    throw new apollo_server_express_1.ForbiddenError('Not authorized to create admin accounts');
                }
            }
            try {
                // Check if email already exists
                const existingUser = await models_1.default.User.findOne({
                    where: { email: email.toLowerCase() }
                });
                if (existingUser) {
                    throw new apollo_server_express_1.UserInputError('Email already in use');
                }
                // Transaction to ensure both user and owner are created together if needed
                const result = await models_1.default.sequelize.transaction(async (transaction) => {
                    let ownerId = null;
                    // Create owner record if ownerInfo is provided and role is OWNER
                    if (role === User_1.UserRole.OWNER && ownerInfo) {
                        const owner = await models_1.default.Owner.create({
                            name: ownerInfo.name,
                            contactEmail: ownerInfo.contactEmail || email,
                            contactPhone: ownerInfo.contactPhone,
                            address: ownerInfo.address,
                        }, { transaction });
                        ownerId = owner.id;
                    }
                    // Create user
                    const user = await models_1.default.User.create({
                        email: email.toLowerCase(),
                        password,
                        firstName,
                        lastName,
                        role,
                        ownerId,
                        isActive: true,
                        lastLogin: new Date()
                    }, { transaction });
                    // Get the complete user with owner information
                    const completeUser = await models_1.default.User.findByPk(user.id, {
                        include: [{ model: models_1.default.Owner, as: 'owner' }],
                        transaction
                    });
                    return completeUser;
                });
                // Generate JWT token
                return generateToken(result);
            }
            catch (error) {
                if (error instanceof apollo_server_express_1.UserInputError || error instanceof apollo_server_express_1.ForbiddenError) {
                    throw error;
                }
                console.error('Registration error:', error);
                throw new Error('Failed to register user');
            }
        },
        // Update user information
        updateUser: async (_, { id, input }, context) => {
            const authUser = (0, auth_1.checkAuth)(context);
            // Only admins or the user themselves can update user info
            if (authUser.role !== User_1.UserRole.ADMIN && authUser.id !== parseInt(id, 10)) {
                throw new apollo_server_express_1.ForbiddenError('Not authorized to update this user');
            }
            try {
                const user = await models_1.default.User.findByPk(id);
                if (!user) {
                    throw new apollo_server_express_1.UserInputError('User not found');
                }
                const { email, firstName, lastName, password, profileImageUrl, ownerInfo } = input;
                // Update user and owner info in a transaction
                const result = await models_1.default.sequelize.transaction(async (transaction) => {
                    // Update user fields
                    const updateData = {};
                    if (email)
                        updateData.email = email.toLowerCase();
                    if (firstName)
                        updateData.firstName = firstName;
                    if (lastName)
                        updateData.lastName = lastName;
                    if (password)
                        updateData.password = password;
                    if (profileImageUrl !== undefined)
                        updateData.profileImageUrl = profileImageUrl;
                    await user.update(updateData, { transaction });
                    // Update owner information if provided and user has an owner record
                    if (ownerInfo && user.ownerId) {
                        const owner = await models_1.default.Owner.findByPk(user.ownerId);
                        if (owner) {
                            const ownerUpdateData = {};
                            if (ownerInfo.name)
                                ownerUpdateData.name = ownerInfo.name;
                            if (ownerInfo.contactEmail)
                                ownerUpdateData.contactEmail = ownerInfo.contactEmail;
                            if (ownerInfo.contactPhone !== undefined)
                                ownerUpdateData.contactPhone = ownerInfo.contactPhone;
                            if (ownerInfo.address !== undefined)
                                ownerUpdateData.address = ownerInfo.address;
                            await owner.update(ownerUpdateData, { transaction });
                        }
                    }
                    // Return updated user with owner info
                    return models_1.default.User.findByPk(id, {
                        include: [{ model: models_1.default.Owner, as: 'owner' }],
                        transaction
                    });
                });
                return result;
            }
            catch (error) {
                console.error('Update user error:', error);
                throw new Error('Failed to update user');
            }
        },
        // Change password
        changePassword: async (_, { currentPassword, newPassword }, context) => {
            const authUser = (0, auth_1.checkAuth)(context);
            try {
                // Get user with password
                const user = await models_1.default.User.scope('withPassword').findByPk(authUser.id);
                if (!user) {
                    throw new apollo_server_express_1.AuthenticationError('User not found');
                }
                // Validate current password
                const isValid = await user.validatePassword(currentPassword);
                if (!isValid) {
                    throw new apollo_server_express_1.UserInputError('Current password is incorrect');
                }
                // Update password
                await user.update({ password: newPassword });
                return {
                    success: true,
                    message: 'Password changed successfully'
                };
            }
            catch (error) {
                if (error instanceof apollo_server_express_1.UserInputError || error instanceof apollo_server_express_1.AuthenticationError) {
                    throw error;
                }
                console.error('Change password error:', error);
                throw new Error('Failed to change password');
            }
        },
        // Update user role (admin only)
        updateUserRole: async (_, { userId, role }, context) => {
            const authUser = (0, auth_1.checkAuth)(context);
            // Only admins can update roles
            if (authUser.role !== User_1.UserRole.ADMIN) {
                throw new apollo_server_express_1.ForbiddenError('Not authorized to update user roles');
            }
            try {
                const user = await models_1.default.User.findByPk(userId);
                if (!user) {
                    throw new apollo_server_express_1.UserInputError('User not found');
                }
                // Update role
                await user.update({ role });
                return user;
            }
            catch (error) {
                console.error('Update user role error:', error);
                throw new Error('Failed to update user role');
            }
        },
        // Deactivate user (admin only)
        deactivateUser: async (_, { userId }, context) => {
            const authUser = (0, auth_1.checkAuth)(context);
            // Only admins can deactivate users
            if (authUser.role !== User_1.UserRole.ADMIN) {
                throw new apollo_server_express_1.ForbiddenError('Not authorized to deactivate users');
            }
            try {
                const user = await models_1.default.User.findByPk(userId);
                if (!user) {
                    throw new apollo_server_express_1.UserInputError('User not found');
                }
                // Prevent deactivating the last admin
                if (user.role === User_1.UserRole.ADMIN) {
                    const adminCount = await models_1.default.User.count({
                        where: {
                            role: User_1.UserRole.ADMIN,
                            isActive: true
                        }
                    });
                    if (adminCount <= 1) {
                        throw new apollo_server_express_1.UserInputError('Cannot deactivate the last administrator account');
                    }
                }
                // Deactivate user
                await user.update({ isActive: false });
                return user;
            }
            catch (error) {
                if (error instanceof apollo_server_express_1.UserInputError) {
                    throw error;
                }
                console.error('Deactivate user error:', error);
                throw new Error('Failed to deactivate user');
            }
        }
    },
    User: {
        // Resolver for the virtual fullName field
        fullName: (parent) => {
            return `${parent.firstName} ${parent.lastName}`;
        }
    }
};
exports.default = exports.userResolvers;
//# sourceMappingURL=userResolvers.js.map