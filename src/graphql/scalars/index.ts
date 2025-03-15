import { GraphQLScalarType } from 'graphql';

// Create a simple scalar for Upload to satisfy schema requirements
// Later, when we fix the version conflicts, we can implement the real file upload handler
export const Upload = new GraphQLScalarType({
  name: 'Upload',
  description: 'A placeholder for file upload functionality',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => null
});

// Define DateTime scalar
export const DateTime = new GraphQLScalarType({
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

export const scalars = {
  Upload,
  DateTime
};
