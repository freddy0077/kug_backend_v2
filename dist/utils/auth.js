"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = exports.authMiddleware = exports.requireAdminRole = exports.checkAuth = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Verifies JWT token from authorization header and returns the decoded user
 * @param context GraphQL context containing the HTTP request
 * @returns The decoded user information from the token
 * @throws AuthenticationError if token is missing or invalid
 */
const checkAuth = (context) => {
    // Get auth header
    const authHeader = context.req.headers.authorization;
    if (!authHeader) {
        throw new apollo_server_express_1.AuthenticationError('Authentication token must be provided');
    }
    try {
        // Extract token (expected format: "Bearer [token]")
        const token = authHeader.split('Bearer ')[1];
        if (!token) {
            throw new apollo_server_express_1.AuthenticationError('Invalid authentication format, expected "Bearer [token]"');
        }
        // Verify token
        const secret = process.env.JWT_SECRET || 'default_secret_replace_in_production';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new apollo_server_express_1.AuthenticationError('Authentication token has expired');
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new apollo_server_express_1.AuthenticationError('Invalid authentication token');
        }
        throw new apollo_server_express_1.AuthenticationError('Authentication failed');
    }
};
exports.checkAuth = checkAuth;
// Add to auth.ts
const requireAdminRole = (user) => {
    if (!user || user.role !== 'ADMIN') {
        throw new apollo_server_express_1.ForbiddenError('Admin role required for this operation');
    }
    return true;
};
exports.requireAdminRole = requireAdminRole;
/**
 * Express middleware to verify JWT token from authorization header
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        try {
            const token = authHeader.split('Bearer ')[1];
            if (token) {
                const secret = process.env.JWT_SECRET || 'default_secret_replace_in_production';
                const decoded = jsonwebtoken_1.default.verify(token, secret);
                // Attach user to request
                req.user = decoded;
            }
        }
        catch (error) {
            // Just don't attach user to request if token is invalid
            console.warn('Invalid auth token:', error.message);
        }
    }
    next();
};
exports.authMiddleware = authMiddleware;
/**
 * GraphQL context function to attach user to context
 */
const createContext = ({ req }) => {
    return {
        req,
        user: req.user || null
    };
};
exports.createContext = createContext;
//# sourceMappingURL=auth.js.map