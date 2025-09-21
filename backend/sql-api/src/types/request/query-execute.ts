/* eslint-disable */
/**
 * This file was automatically generated from JSON schema.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run 'npm run generate-types' to regenerate this file.
 */
/**
 * Request payload for executing SQL queries
 */
export interface QueryExecuteRequest {

  /**
   * SQL query to execute
   */
  query: string;

  /**
   * Unique connection identifier
   */
  connectionId: string;

  connection: DatabaseConnectionConfiguration;

  options?: {

  /**
   * Query timeout in milliseconds
   */
  timeout?: number;

  /**
   * Maximum rows to return
   */
  maxRows?: number;
};
}
