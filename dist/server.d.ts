import { ApolloServer } from 'apollo-server-express';
declare function startApolloServer(server: ApolloServer, app: any): Promise<{
    server: ApolloServer<import("apollo-server-express").ExpressContext>;
    app: any;
}>;
export default startApolloServer;
