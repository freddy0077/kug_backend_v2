"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateTimeScalar = void 0;
const graphql_1 = require("graphql");
exports.dateTimeScalar = new graphql_1.GraphQLScalarType({
    name: 'DateTime',
    description: 'Date custom scalar type',
    // Convert outgoing Date to ISO string
    serialize(value) {
        if (value instanceof Date) {
            return value.toISOString();
        }
        throw new Error('DateTime cannot represent non-Date type');
    },
    // Convert incoming ISO string to Date
    parseValue(value) {
        if (typeof value === 'string') {
            return new Date(value);
        }
        throw new Error('DateTime cannot represent non-string type');
    },
    // Parse literal AST value to Date
    parseLiteral(ast) {
        if (ast.kind === graphql_1.Kind.STRING) {
            return new Date(ast.value);
        }
        return null;
    }
});
//# sourceMappingURL=scalarResolvers.js.map