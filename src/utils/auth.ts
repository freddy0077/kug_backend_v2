import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';

// Interface for decoded token payload
interface DecodedToken {
  id: number;
  email: string;
  role: string;
  username?: string;
  iat?: number;
  exp?: number;
}

/**
 * Verifies JWT token from authorization header and returns the decoded user
 * @param context GraphQL context containing the HTTP request
 * @returns The decoded user information from the token
 * @throws AuthenticationError if token is missing or invalid
 */
export const checkAuth = (context: any): DecodedToken => {
  // Get auth header
  const authHeader = context.req.headers.authorization;
  
  if (!authHeader) {
    throw new AuthenticationError('Authentication token must be provided');
  }
  
  try {
    // Extract token (expected format: "Bearer [token]")
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      throw new AuthenticationError('Invalid authentication format, expected "Bearer [token]"');
    }
    
    // Verify token
    const secret = process.env.JWT_SECRET || 'default_secret_replace_in_production';
    const decoded = jwt.verify(token, secret) as DecodedToken;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Authentication token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid authentication token');
    }
    
    throw new AuthenticationError('Authentication failed');
  }
};

// Add to auth.ts
export const requireAdminRole = (user: any) => {
  if (!user || user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin role required for this operation');
  }
  return true;
};

/**
 * Express middleware to verify JWT token from authorization header
 */
export const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    try {
      const token = authHeader.split('Bearer ')[1];
      if (token) {
        const secret = process.env.JWT_SECRET || 'default_secret_replace_in_production';
        const decoded = jwt.verify(token, secret) as DecodedToken;
        
        // Attach user to request
        req.user = decoded;
      }
    } catch (error) {
      // Just don't attach user to request if token is invalid
      console.warn('Invalid auth token:', (error as Error).message);
    }
  }
  
  next();
};

/**
 * GraphQL context function to attach user to context
 */
export const createContext = ({ req }: { req: any }) => {
  return {
    req,
    user: req.user || null
  };
};
