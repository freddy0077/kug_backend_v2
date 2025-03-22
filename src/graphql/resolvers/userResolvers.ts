import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { UserRole } from '../../db/models/User';
import db from '../../db/models';
import { checkAuth } from '../../utils/auth';
import Logger from '../../utils/logger';
import { LogLevel } from '../../db/models/SystemLog';
import { AuditAction } from '../../db/models/AuditLog';

// Helper to generate JWT token
const generateToken = (user: any) => {
  const secret = process.env.JWT_SECRET || 'default_secret_replace_in_production';
  const expiresIn = '7d';
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
  
  const token = jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role
    }, 
    secret, 
    { expiresIn }
  );

  return { token, user, expiresAt };
};

// Format pagination results
const formatPaginationResults = (results: any, limit: number) => {
  return {
    totalCount: results.count,
    hasMore: results.count > (results.rows.length + results.offset),
    items: results.rows
  };
};

export const userResolvers = {
  Query: {
    // Get the current logged-in user
    me: async (_: any, __: any, { user }: any) => {
      if (!user) {
        return null; // Not authenticated, but don't throw error
      }
      
      try {
        const userRecord = await db.User.findByPk(user.id, {
          include: [{ model: db.Owner, as: 'owner' }]
        });
        
        if (!userRecord) {
          return null;
        }
        
        return userRecord;
      } catch (error) {
        console.error('Error fetching current user:', error);
        throw new Error('Failed to fetch current user');
      }
    },
    
    // Get a list of users (paginated with filters)
    users: async (_: any, { offset = 0, limit = 20, searchTerm, role, isActive }: any, context: any) => {
      // Check authentication and admin permissions
      const authUser = checkAuth(context);
      if (authUser.role !== UserRole.ADMIN) {
        throw new ForbiddenError('Not authorized to view users list');
      }
      
      try {
        const where: any = {};
        
        // Apply filters
        if (searchTerm) {
          where[Op.or] = [
            { email: { [Op.iLike]: `%${searchTerm}%` } },
            { firstName: { [Op.iLike]: `%${searchTerm}%` } },
            { lastName: { [Op.iLike]: `%${searchTerm}%` } }
          ];
        }
        
        if (role) {
          where.role = role;
        }
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        const users = await db.User.findAndCountAll({
          where,
          limit,
          offset,
          order: [['createdAt', 'DESC']],
          include: [{ model: db.Owner, as: 'owner' }]
        });
        
        return formatPaginationResults(users, limit);
      } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
      }
    },
    
    // Get a specific user by ID
    user: async (_: any, { id }: any, context: any) => {
      const authUser = checkAuth(context);
      
      // Only admins or the user themselves can view detailed user info
      if (authUser.role !== UserRole.ADMIN && authUser.id !== parseInt(id, 10)) {
        throw new ForbiddenError('Not authorized to view this user');
      }
      
      try {
        const user = await db.User.findByPk(id, {
          include: [{ model: db.Owner, as: 'owner' }]
        });
        
        if (!user) {
          throw new UserInputError('User not found');
        }
        
        return user;
      } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Failed to fetch user');
      }
    }
  },
  
  Mutation: {
    // User login
    login: async (_: any, { email, password }: any, context: any) => {
      try {
        // Find user with password (need to use scope to include password)
        const user = await db.User.scope('withPassword').findOne({
          where: { email: email.toLowerCase() }
        });
        
        if (!user) {
          throw new AuthenticationError('Invalid email or password');
        }
        
        if (!user.isActive) {
          throw new AuthenticationError('Account is deactivated. Please contact an administrator.');
        }
        
        // Validate password
        const isValid = await user.validatePassword(password);
        if (!isValid) {
          throw new AuthenticationError('Invalid email or password');
        }
        
        // Update last login time
        await user.update({ lastLogin: new Date() });
        
        // Remove password from response
        const userWithoutPassword = await db.User.findByPk(user.id, {
          include: [{ model: db.Owner, as: 'owner' }]
        });
        
        // Generate JWT token
        return generateToken(userWithoutPassword);
      } catch (error) {
        if (error instanceof AuthenticationError) {
          throw error;
        }
        console.error('Login error:', error);
        throw new Error('Failed to login');
      }
    },
    
    // User registration
    register: async (_: any, { input }: any, context: any) => {
      const { email, password, firstName, lastName, role, ownerInfo } = input;
      
      // Check if registering as ADMIN (only existing ADMIN can create another ADMIN)
      if (role === UserRole.ADMIN) {
        try {
          const authUser = checkAuth(context);
          if (authUser.role !== UserRole.ADMIN) {
            throw new ForbiddenError('Only administrators can create admin accounts');
          }
        } catch (error) {
          throw new ForbiddenError('Not authorized to create admin accounts');
        }
      }
      
      try {
        // Check if email already exists
        const existingUser = await db.User.findOne({
          where: { email: email.toLowerCase() }
        });
        
        if (existingUser) {
          throw new UserInputError('Email already in use');
        }
        
        // Transaction to ensure both user and owner are created together if needed
        const result = await db.sequelize.transaction(async (transaction: any) => {
          let ownerId = null;
          
          // Create owner record if ownerInfo is provided and role is OWNER
          if (role === UserRole.OWNER && ownerInfo) {
            const owner = await db.Owner.create({
              name: ownerInfo.name,
              contactEmail: ownerInfo.contactEmail || email,
              contactPhone: ownerInfo.contactPhone,
              address: ownerInfo.address,
            }, { transaction });
            
            ownerId = owner.id;
          }
          
          // Create user
          const user = await db.User.create({
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            role,
            ownerId,
            isActive: false,
            lastLogin: new Date()
          }, { transaction });
          
          // Get the complete user with owner information
          const completeUser = await db.User.findByPk(user.id, {
            include: [{ model: db.Owner, as: 'owner' }],
            transaction
          });
          
          return completeUser;
        });
        
        // Generate JWT token
        return generateToken(result);
      } catch (error) {
        if (error instanceof UserInputError || error instanceof ForbiddenError) {
          throw error;
        }
        console.error('Registration error:', error);
        throw new Error('Failed to register user');
      }
    },
    
    // Update user information
    updateUser: async (_: any, { id, input }: any, context: any) => {
      const authUser = checkAuth(context);
      
      // Only admins or the user themselves can update user info
      if (authUser.role !== UserRole.ADMIN && authUser.id !== parseInt(id, 10)) {
        throw new ForbiddenError('Not authorized to update this user');
      }
      
      try {
        const user = await db.User.findByPk(id);
        
        if (!user) {
          throw new UserInputError('User not found');
        }
        
        const { email, firstName, lastName, password, profileImageUrl, ownerInfo } = input;
        
        // Update user and owner info in a transaction
        const result = await db.sequelize.transaction(async (transaction: any) => {
          // Update user fields
          const updateData: any = {};
          if (email) updateData.email = email.toLowerCase();
          if (firstName) updateData.firstName = firstName;
          if (lastName) updateData.lastName = lastName;
          if (password) updateData.password = password;
          if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
          
          await user.update(updateData, { transaction });
          
          // Update owner information if provided and user has an owner record
          if (ownerInfo && user.ownerId) {
            const owner = await db.Owner.findByPk(user.ownerId);
            
            if (owner) {
              const ownerUpdateData: any = {};
              if (ownerInfo.name) ownerUpdateData.name = ownerInfo.name;
              if (ownerInfo.contactEmail) ownerUpdateData.contactEmail = ownerInfo.contactEmail;
              if (ownerInfo.contactPhone !== undefined) ownerUpdateData.contactPhone = ownerInfo.contactPhone;
              if (ownerInfo.address !== undefined) ownerUpdateData.address = ownerInfo.address;
              
              await owner.update(ownerUpdateData, { transaction });
            }
          }
          
          // Return updated user with owner info
          return db.User.findByPk(id, {
            include: [{ model: db.Owner, as: 'owner' }],
            transaction
          });
        });
        
        return result;
      } catch (error) {
        console.error('Update user error:', error);
        throw new Error('Failed to update user');
      }
    },
    
    // Change password
    changePassword: async (_: any, { currentPassword, newPassword }: any, context: any) => {
      const authUser = checkAuth(context);
      
      try {
        // Get user with password
        const user = await db.User.scope('withPassword').findByPk(authUser.id);
        
        if (!user) {
          throw new AuthenticationError('User not found');
        }
        
        // Validate current password
        const isValid = await user.validatePassword(currentPassword);
        if (!isValid) {
          throw new UserInputError('Current password is incorrect');
        }
        
        // Update password
        await user.update({ password: newPassword });
        
        return {
          success: true,
          message: 'Password changed successfully'
        };
      } catch (error) {
        if (error instanceof UserInputError || error instanceof AuthenticationError) {
          throw error;
        }
        console.error('Change password error:', error);
        throw new Error('Failed to change password');
      }
    },
    
    // Update user role (admin only)
    updateUserRole: async (_: any, { userId, role }: any, context: any) => {
      const authUser = checkAuth(context);
      
      // Only admins can update roles
      if (authUser.role !== UserRole.ADMIN) {
        throw new ForbiddenError('Not authorized to update user roles');
      }
      
      try {
        const user = await db.User.findByPk(userId);
        
        if (!user) {
          throw new UserInputError('User not found');
        }
        
        // Update role
        await user.update({ role });
        
        return user;
      } catch (error) {
        console.error('Update user role error:', error);
        throw new Error('Failed to update user role');
      }
    },
    
    // Deactivate user (admin only)
    deactivateUser: async (_: any, { userId }: any, context: any) => {
      const authUser = checkAuth(context);
      
      // Only admins can deactivate users
      if (authUser.role !== UserRole.ADMIN) {
        throw new ForbiddenError('Not authorized to deactivate users');
      }
      
      try {
        const user = await db.User.findByPk(userId);
        
        if (!user) {
          throw new UserInputError('User not found');
        }
        
        // Prevent deactivating the last admin
        if (user.role === UserRole.ADMIN) {
          const adminCount = await db.User.count({
            where: {
              role: UserRole.ADMIN,
              isActive: true
            }
          });
          
          if (adminCount <= 1) {
            throw new UserInputError('Cannot deactivate the last administrator account');
          }
        }
        
        // Deactivate user
        await user.update({ isActive: false });
        
        return user;
      } catch (error) {
        if (error instanceof UserInputError) {
          throw error;
        }
        console.error('Deactivate user error:', error);
        throw new Error('Failed to deactivate user');
      }
    }
  },
  
  User: {
    // Resolver for the virtual fullName field
    fullName: (parent: any) => {
      return `${parent.firstName} ${parent.lastName}`;
    }
  }
};

export default userResolvers;
