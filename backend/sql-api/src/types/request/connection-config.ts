/* eslint-disable */
/**
 * This file was automatically generated from JSON schema.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run 'npm run generate-types' to regenerate this file.
 */
/**
 * Configuration for establishing a database connection
 */
export interface DatabaseConnectionConfiguration {

  /**
   * Database host address
   */
  host: string;

  /**
   * Database port number
   */
  port: number;

  /**
   * Database name
   */
  database: string;

  /**
   * Database username
   */
  username: string;

  /**
   * Database password
   */
  password: string;

  /**
   * Enable SSL connection
   */
  ssl?: boolean;
}
