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
import { scalars } from './graphql/scalars';

// Load environment variables
dotenv.config();

// Initialize express application
const app = express();

// Apply middlewares
app.use(cors());
app.use(json());
// TODO: Add file upload middleware back after fixing version conflicts
app.use(authMiddleware);

// Initialize Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers: {
    ...resolvers,
    ...scalars // Add our custom scalars
  },
  context: createContext,
  introspection: process.env.NODE_ENV !== 'production',
  formatError: (error) => {
    // Log the error for server-side tracking
    console.error('GraphQL Error:', error);
    
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
