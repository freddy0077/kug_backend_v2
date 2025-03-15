"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const altair_express_middleware_1 = require("altair-express-middleware");
const schemas_1 = __importDefault(require("./graphql/schemas"));
const resolvers_1 = __importDefault(require("./graphql/resolvers"));
const models_1 = __importDefault(require("./db/models"));
const auth_1 = require("./utils/auth");
const apollo_server_express_1 = require("apollo-server-express");
const scalars_1 = require("./graphql/scalars");
// Load environment variables
dotenv_1.default.config();
// Initialize express application
const app = (0, express_1.default)();
// Apply middlewares
app.use((0, cors_1.default)());
app.use((0, body_parser_1.json)());
// TODO: Add file upload middleware back after fixing version conflicts
app.use(auth_1.authMiddleware);
// Initialize Apollo server
const server = new apollo_server_express_1.ApolloServer({
    typeDefs: schemas_1.default,
    resolvers: {
        ...resolvers_1.default,
        ...scalars_1.scalars // Add our custom scalars
    },
    context: auth_1.createContext,
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
async function startApolloServer(server, app) {
    await server.start();
    // Apply Apollo middleware to Express
    server.applyMiddleware({ app, path: '/graphql' });
    // Setup Altair GraphQL Client
    const port = process.env.PORT || 4000;
    // Use 0.0.0.0 for Docker compatibility
    const hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    app.use('/altair', (0, altair_express_middleware_1.altairExpress)({
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
        await models_1.default.sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    }
    catch (error) {
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
    app.get('/health', (req, res) => {
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
exports.default = startApolloServer;
//# sourceMappingURL=server.js.map