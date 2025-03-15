// Type definitions for graphql-upload
declare module 'graphql-upload' {
  import { Request, Response, NextFunction } from 'express';
  import { GraphQLScalarType } from 'graphql';

  export interface FileUpload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => NodeJS.ReadableStream;
  }

  export const GraphQLUpload: GraphQLScalarType;
  
  export interface ProcessRequestOptions {
    maxFieldSize?: number;
    maxFileSize?: number;
    maxFiles?: number;
  }
  
  export function graphqlUploadExpress(options?: ProcessRequestOptions): (req: Request, res: Response, next: NextFunction) => void;
}
