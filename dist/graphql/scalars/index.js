"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scalars = exports.DateTime = exports.Upload = void 0;
const graphql_1 = require("graphql");
// Create a simple scalar for Upload to satisfy schema requirements
// Later, when we fix the version conflicts, we can implement the real file upload handler
exports.Upload = new graphql_1.GraphQLScalarType({
    name: 'Upload',
    description: 'A placeholder for file upload functionality',
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral: (ast) => null
});
// Define DateTime scalar
exports.DateTime = new graphql_1.GraphQLScalarType({
    name: 'DateTime',
    description: 'Date custom scalar type',
    serialize(value) {
        if (value instanceof Date) {
            return value.toISOString();
        }
        return value;
    },
    parseValue(value) {
        if (typeof value === 'string' || typeof value === 'number') {
            return new Date(value);
        }
        throw new Error('DateTime scalar parser expected a string or number');
    },
    parseLiteral(ast) {
        if (ast.kind === 'StringValue') {
            return new Date(ast.value);
        }
        return null;
    }
});
exports.scalars = {
    Upload: exports.Upload,
    DateTime: exports.DateTime
};
//# sourceMappingURL=index.js.map