/* eslint-disable */
/**
 * This file was automatically generated from JSON schema.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run 'npm run generate-types' to regenerate this file.
 */
/**
 * Request payload for retrieving database schema information
 */
export interface ConnectionSchemaRequest {

  /**
   * Unique connection identifier
   */
  connectionId: string;

  connection: DatabaseConnectionConfiguration;
}
