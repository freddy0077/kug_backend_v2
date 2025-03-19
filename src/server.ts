import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { altairExpress } from 'altair-express-middleware';
import typeDefs from './graphql/schemas';
import resolvers from './graphql/resolvers';
import db from './db/models';
import { authMiddleware, createContext } from './utils/auth';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { scalars } from './graphql/scalars';
import rateLimit from 'express-rate-limit';
import { createRateLimitRule, createRateLimitDirective } from 'graphql-rate-limit';

// Load environment variables
dotenv.config();

// Initialize express application
const app = express();

// Apply middlewares
app.use(cors());
app.use(json());

// 1. GLOBAL API RATE LIMITING
// Base rate limiter for all API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Default limit for all IPs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests, please try again after 15 minutes',
  // Skip rate limiting for health checks and options requests
  skip: (req, res) => req.path === '/health' || req.method === 'OPTIONS',
  // Store limiter states in memory (consider using Redis store for production)
  // store: new RedisStore({ /* redis connection options */ })
});

// 2. STRICTER MUTATION RATE LIMITING
// Separate stricter limiter for mutations
const mutationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests per hour for mutations
  message: 'Too many mutation operations, please try again after 1 hour',
  standardHeaders: true,
  // Use a key generator that can identify users if authenticated
  keyGenerator: (req) => {
    // Get user from request (set by your auth middleware)
    const user = (req as any).user;
    // Use user ID if available, otherwise fall back to IP
    return user?.id || req.ip;
  },
});

// 3. USER-ROLE BASED RATE LIMITING
// Define rate limits based on user roles - configured from environment or defaults
const userRoleRateLimits = {
  ADMIN: parseInt(process.env.RATE_LIMIT_ADMIN || '1000'),
  OWNER: parseInt(process.env.RATE_LIMIT_OWNER || '300'),
  HANDLER: parseInt(process.env.RATE_LIMIT_HANDLER || '200'),
  CLUB: parseInt(process.env.RATE_LIMIT_CLUB || '250'),
  VIEWER: parseInt(process.env.RATE_LIMIT_VIEWER || '100')
};

// Dynamic rate limiter based on user role
const roleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  // Determine max requests based on user role
  max: (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    if (!user) return 100; // Default for unauthenticated users
    
    // Check if the user.role is a valid key in our role limits object
    const role = user.role as keyof typeof userRoleRateLimits;
    return userRoleRateLimits[role] || 100;
  },
  message: (req: express.Request, res: express.Response) => {
    const user = (req as any).user;
    const role = user?.role || 'VIEWER';
    return `Rate limit exceeded for ${role} role. Please try again later.`;
  },
  standardHeaders: true,
  keyGenerator: (req: express.Request) => {
    const user = (req as any).user;
    return user?.id || req.ip;
  },
});

// Apply rate limiters to the GraphQL endpoint
app.use('/graphql', apiLimiter);

// Log rate limiting events
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const rateLimitRemaining = res.getHeader('RateLimit-Remaining');
  if (rateLimitRemaining === '0') {
    // Log when a user hits their rate limit
    console.warn(`Rate limit exceeded for ${(req as any).user?.id || req.ip} at ${new Date().toISOString()}`);
  }
  next();
});

// TODO: Add file upload middleware back after fixing version conflicts
app.use(authMiddleware);

// 4. GRAPHQL-SPECIFIC RATE LIMITING via Apollo Plugin
// Define interface for GraphQL context
interface GraphQLContext {
  user?: {
    id: string;
    role: string;
  };
  req: express.Request;
}

// Create in-memory stores to track GraphQL operations and dog data access
// In production, you would use Redis or another distributed cache
const rateLimitStore = new Map<string, {count: number, resetAt: number}>();

// Store for tracking dog data access patterns
const dogDataAccessStore = new Map<string, {
  count: number,          // Number of dog-related queries
  totalDogsAccessed: number, // Total number of dogs accessed
  dogIds: Set<string>,    // Set of accessed dog IDs to detect unique vs. repeated access
  accessPattern: number[], // Timestamps of accesses to detect automated patterns
  resetAt: number         // When to reset this record
}>();

// Configuration for dog data protection
const dogProtectionConfig = {
  // Maximum number of dogs a user can access per hour
  maxDogsPerHour: parseInt(process.env.MAX_DOGS_PER_HOUR || '200'),
  // Maximum number of dog-related queries per hour
  maxDogQueriesPerHour: parseInt(process.env.MAX_DOG_QUERIES_PER_HOUR || '100'),
  // Maximum page size for dog queries
  maxPageSize: 50,
  // Minimum time (in ms) between sequential requests to detect bots (50ms)
  minRequestInterval: 50, 
  // Window for tracking (1 hour in ms)
  windowMs: 60 * 60 * 1000,
  // Allow more access for admin users
  roleMultipliers: {
    ADMIN: 2.0,    // Admins get 10x the limits
    OWNER: 1.0,    // Owners get 2x the limits
    HANDLER: 1.0,  // Handlers get 1.5x the limits
    CLUB: 1.0,     // Clubs get 2x the limits
    VIEWER: 1.0    // Standard limit
  }
};

// Helper function to detect if a query is dog-related
const isDogRelatedQuery = (operation: any): boolean => {
  try {
    // Check operation name
    const operationName = operation.name?.value?.toLowerCase() || '';
    if (operationName.includes('dog') || operationName.includes('litter') || 
        operationName.includes('breed') || operationName.includes('pedigree')) {
      return true;
    }
    
    // Check selections in query
    const selections = operation.selectionSet?.selections || [];
    for (const selection of selections) {
      const fieldName = selection.name?.value?.toLowerCase() || '';
      if (fieldName === 'dog' || fieldName === 'dogs' || 
          fieldName === 'litter' || fieldName === 'litters' ||
          fieldName === 'pedigree') {
        return true;
      }
      
      // Check for nested dog fields
      if (selection.selectionSet) {
        const nestedSelections = selection.selectionSet.selections || [];
        for (const nestedSelection of nestedSelections) {
          const nestedFieldName = nestedSelection.name?.value?.toLowerCase() || '';
          if (nestedFieldName === 'dog' || nestedFieldName === 'dogs' || 
              nestedFieldName === 'sire' || nestedFieldName === 'dam') {
            return true;
          }
        }
      }
    }
    
    return false;
  } catch (error) {
    // If we can't parse the operation, err on the side of caution
    console.error('Error checking if query is dog-related:', error);
    return true;
  }
};

// Helper to estimate the number of dogs a query will access
const estimateDogDataAccess = (operation: any, variables: any): number => {
  try {
    // Check if specific dog IDs are being requested
    if (variables && variables.id) {
      return 1; // Single dog access
    }
    
    // Check pagination variables for list queries
    let limit = dogProtectionConfig.maxPageSize; // Default max
    if (variables) {
      // If limit is explicitly set in variables, use it (but cap it)
      if (variables.limit !== undefined) {
        limit = Math.min(parseInt(variables.limit), dogProtectionConfig.maxPageSize);
      }
      // If first is set (for connections/pagination)
      else if (variables.first !== undefined) {
        limit = Math.min(parseInt(variables.first), dogProtectionConfig.maxPageSize);
      }
    }
    
    // Return estimated count (default to max page size if we can't determine)
    return limit;
  } catch (error) {
    console.error('Error estimating dog data access:', error);
    return dogProtectionConfig.maxPageSize; // Assume maximum access
  }
};

// Custom plugin for GraphQL operation rate limiting and dog data protection
const rateLimitPlugin = {
  async requestDidStart() {
    return {
      // Handle general rate limiting
      async didResolveOperation(context: any) {
        const user = context.context.user;
        const ip = context.context.req?.ip || 'anonymous';
        const identifier = user?.id || ip;
        const operationType = context.operation.operation; // 'query', 'mutation', etc.
        const operationName = context.operationName || 'anonymous';
        const now = Date.now();
        
        // 1. GENERAL RATE LIMITING
        // Define limits based on operation type and user role
        let limit = 100; // Default limit
        let window = 60 * 60 * 1000; // Default window: 1 hour
        
        // Stricter limits for mutations
        if (operationType === 'mutation') {
          limit = 30;
        }
        
        // Adjust limit based on user role
        if (user?.role) {
          const role = user.role as keyof typeof userRoleRateLimits;
          if (userRoleRateLimits[role]) {
            limit = userRoleRateLimits[role];
          }
        }
        
        // Create a key that includes the operation type
        const key = `${identifier}:${operationType}`;
        
        // Check the rate limit
        let record = rateLimitStore.get(key);
        
        // Create or reset expired records
        if (!record || record.resetAt < now) {
          record = { count: 1, resetAt: now + window };
          rateLimitStore.set(key, record);
        }
        // Increment existing records if not expired
        else {
          record.count += 1;
          rateLimitStore.set(key, record);
          
          // Check if over limit
          if (record.count > limit) {
            const resetDate = new Date(record.resetAt).toISOString();
            throw new Error(`Rate limit exceeded for ${operationType} operations. Try again after ${resetDate}`);
          }
        }
        
        // 2. DOG DATA PROTECTION
        // Check if this is a dog-related query
        if (operationType === 'query' && isDogRelatedQuery(context.operation)) {
          // Get the multiplier based on user role
          let multiplier = 1.0;
          if (user?.role) {
            const role = user.role as keyof typeof dogProtectionConfig.roleMultipliers;
            multiplier = dogProtectionConfig.roleMultipliers[role] || 1.0;
          }
          
          // Calculate adjusted limits based on role
          const adjustedMaxDogs = Math.floor(dogProtectionConfig.maxDogsPerHour * multiplier);
          const adjustedMaxQueries = Math.floor(dogProtectionConfig.maxDogQueriesPerHour * multiplier);
          
          // Create the dog access tracking key
          const dogAccessKey = `dog-access:${identifier}`;
          
          // Get or create dog access record
          let dogAccess = dogDataAccessStore.get(dogAccessKey);
          if (!dogAccess || dogAccess.resetAt < now) {
            // Initialize new tracking record
            dogAccess = {
              count: 1,
              totalDogsAccessed: 0,
              dogIds: new Set<string>(),
              accessPattern: [now],
              resetAt: now + dogProtectionConfig.windowMs
            };
          } else {
            // Update existing record
            dogAccess.count += 1;
            dogAccess.accessPattern.push(now);
            
            // Enforce maximum queries limit
            if (dogAccess.count > adjustedMaxQueries) {
              const resetDate = new Date(dogAccess.resetAt).toISOString();
              // Log this as a potential data scraping attempt
              console.warn(`POTENTIAL DATA SCRAPING: User ${identifier} exceeded dog query limit`); 
              throw new Error(`You have exceeded the limit for dog-related queries. Try again after ${resetDate}`);
            }
            
            // Detect suspiciously rapid sequential access (potential bot/scraper)
            if (dogAccess.accessPattern.length >= 5) {
              const recentPatterns = dogAccess.accessPattern.slice(-5);
              let suspiciousPattern = true;
              
              // Check for consistent timing between requests (bot behavior)
              for (let i = 1; i < recentPatterns.length; i++) {
                const timeDiff = recentPatterns[i] - recentPatterns[i-1];
                if (timeDiff < dogProtectionConfig.minRequestInterval || timeDiff > 500) {
                  suspiciousPattern = false;
                  break;
                }
              }
              
              if (suspiciousPattern) {
                // Log this as a bot/scraper attempt
                console.warn(`BOT ACTIVITY DETECTED: User ${identifier} showing suspicious request patterns`);
                throw new Error('Suspicious access pattern detected. Please reduce your access rate.');
              }
            }
          }
          
          // Estimate how many dogs this query will access
          const estimatedDogAccess = estimateDogDataAccess(context.operation, context.request.variables);
          dogAccess.totalDogsAccessed += estimatedDogAccess;
          
          // Log for auditing
          console.log(`Dog data access: ${identifier} accessing approximately ${estimatedDogAccess} dogs with query ${operationName}`);
          
          // Check if dog access limit exceeded
          if (dogAccess.totalDogsAccessed > adjustedMaxDogs) {
            const resetDate = new Date(dogAccess.resetAt).toISOString();
            console.warn(`DOG DATA PROTECTION: User ${identifier} exceeded dog access limit`);
            throw new Error(`You have exceeded the limit for accessing dog records. Try again after ${resetDate}`);
          }
          
          // Store updated dog access record
          dogDataAccessStore.set(dogAccessKey, dogAccess);
        }
        
        // Clean up old entries periodically
        if (Math.random() < 0.01) { // 1% chance on each request
          const cleanupTime = now;
          for (const [storeKey, value] of rateLimitStore.entries()) {
            if (value.resetAt < cleanupTime) {
              rateLimitStore.delete(storeKey);
            }
          }
          for (const [storeKey, value] of dogDataAccessStore.entries()) {
            if (value.resetAt < cleanupTime) {
              dogDataAccessStore.delete(storeKey);
            }
          }
        }
      },
      
      // Log dog access after execution completes
      async willSendResponse(context: any) {
        try {
          // Only log for successful dog-related queries
          if (context.operation?.operation === 'query' && 
              isDogRelatedQuery(context.operation) && 
              context.response?.data) {
            
            // Extract user information for the log
            const user = context.context.user;
            const ip = context.context.req?.ip || 'anonymous';
            const identifier = user?.id || ip;
            
            // Extract actual dog IDs accessed if possible
            let accessedDogIds: string[] = [];
            const responseData = context.response.data;
            
            // Try to extract dog IDs from response - this depends on your schema
            // We'll look for some common patterns
            if (responseData.dog?.id) {
              accessedDogIds.push(responseData.dog.id);
            }
            if (responseData.dogs?.items) {
              accessedDogIds = accessedDogIds.concat(
                responseData.dogs.items
                  .filter((item: any) => item?.id)
                  .map((item: any) => item.id)
              );
            }
            
            // Add to audit log - in a real system you might store this in a database
            const auditLog = {
              timestamp: new Date().toISOString(),
              userId: user?.id || null,
              ip: ip,
              operationName: context.operationName || 'anonymous',
              dogCount: accessedDogIds.length,
              dogIds: accessedDogIds,
            };
            
            // For now, just log to console, but in production you'd use a proper logger
            console.log(`DOG DATA ACCESS AUDIT: ${JSON.stringify(auditLog)}`);
            
            // Update the specific dogs accessed in the tracking store
            if (accessedDogIds.length > 0) {
              const dogAccessKey = `dog-access:${identifier}`;
              const dogAccess = dogDataAccessStore.get(dogAccessKey);
              if (dogAccess) {
                // Add the dog IDs to the set of accessed dogs
                accessedDogIds.forEach(id => dogAccess.dogIds.add(id));
                dogDataAccessStore.set(dogAccessKey, dogAccess);
              }
            }
          }
        } catch (error) {
          // Don't let audit logging errors affect the response
          console.error('Error in dog access audit logging:', error);
        }
      }
    };
  }
};

// Create the executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    ...resolvers,
    ...scalars // Add our custom scalars
  }
});

// Initialize Apollo server with rate limiting plugin
const server = new ApolloServer({
  typeDefs,
  resolvers: {
    ...resolvers,
    ...scalars // Add our custom scalars
  },
  plugins: [rateLimitPlugin],
  context: (ctx) => {
    // Enhanced context with rate limiting info
    const baseContext = createContext(ctx);
    return {
      ...baseContext,
      // Pass the request object so our rate limiting can access IPs
      req: ctx.req,
    };
  },
  validationRules: [
    // Add validation rule to enforce max page size on dog queries
    (context) => {
      return {
        // Fix TypeScript error by adding proper type for the node parameter
        Field(node: any) {
          // Check if this is a dog-related query field with pagination arguments
          const fieldName = node.name.value.toLowerCase();
          if ((fieldName === 'dogs' || fieldName === 'litters') && 
              node.arguments && node.arguments.length > 0) {
            
            // Look for limit or first argument
            for (const arg of node.arguments) {
              const argName = arg.name.value;
              if (argName === 'limit' || argName === 'first') {
                // Check if it's a literal value we can evaluate
                if (arg.value.kind === 'IntValue') {
                  const value = parseInt(arg.value.value);
                  if (value > dogProtectionConfig.maxPageSize) {
                    throw new Error(
                      `Maximum page size for ${fieldName} queries is ` + 
                      `${dogProtectionConfig.maxPageSize}. Requested: ${value}`
                    );
                  }
                }
              }
            }
          }
        }
      };
    }
  ],
  introspection: process.env.NODE_ENV !== 'production',
  formatError: (error) => {
    // Log the error for server-side tracking
    console.error('GraphQL Error:', error);
    
    // Enhanced error logging for rate limiting
    if (error.message.includes('Rate limit exceeded')) {
      console.warn(`GraphQL Rate Limit Error: ${error.message}`);
    }
    
    // Remove internal server error details in production
    if (process.env.NODE_ENV === 'production') {
      if (error.extensions?.code === 'INTERNAL_SERVER_ERROR') {
        return {
          message: 'An unexpected error occurred.',
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
          },
        };
      }
    }
    return error;
  },
});

// Start the Apollo server
async function startApolloServer(server: ApolloServer, app: any) {
  await server.start();
  
  // Apply Apollo middleware to Express
  server.applyMiddleware({ app, path: '/graphql' });
  
  // Setup Altair GraphQL Client
  const port = process.env.PORT || 4000;
  
  // Use 0.0.0.0 for Docker compatibility
  const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  
  app.use('/altair', altairExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://${hostname}:${port}/graphql`,
    initialQuery: `# Welcome to Altair GraphQL Client
# Example query:
query {
  me {
    id
    email
    fullName
    role
  }
}`,
  }));
  
  // Log Altair setup for debugging
  console.log(`Altair configured with endpoint: /graphql`);
  console.log(`Altair configured with subscriptions endpoint: ws://localhost:${port}/graphql`);
  
  // Define port
  const PORT = process.env.PORT || 4000;
  
  // Test database connection
  try {
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
  
  // Start Express server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🛠 GraphQL Playground available at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`✨ Altair GraphQL Client available at http://localhost:${PORT}/altair`);
    console.log(`💡 Current environment variables: PORT=${PORT}`);
  });
  
  // Add a simple health check endpoint
  app.get('/health', (req: any, res: any) => {
    // Log health check request
    console.log('Health check request received');
    res.status(200).send('OK');
  });
  
  // Return server and app instances for testing
  return { server, app };
}

// Execute the function
startApolloServer(server, app).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Export for testing
export default startApolloServer;
