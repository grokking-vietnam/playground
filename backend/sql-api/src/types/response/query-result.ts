/* eslint-disable */
/**
 * This file was automatically generated from JSON schema.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run 'npm run generate-types' to regenerate this file.
 */
/**
 * Data structure for SQL query execution results
 */
export interface QueryResultData {

  /**
   * Unique identifier for the query execution
   */
  queryId: string;

  /**
   * Column metadata for the result set
   */
  columns: {

  /**
   * Column name
   */
  name: string;

  /**
   * Column data type
   */
  type: string;

  /**
   * Whether the column allows null values
   */
  nullable: boolean;
}[];

  /**
   * Query result rows
   */
  rows: Record<string, any>[];

  /**
   * Query execution metadata
   */
  metadata: {

  /**
   * Total number of rows in the result set
   */
  totalRows: number;

  /**
   * Number of rows affected by the query
   */
  affectedRows?: number;

  /**
   * Query execution time in milliseconds
   */
  executionTime: number;

  /**
   * SQL command type (SELECT, INSERT, UPDATE, etc.)
   */
  command: string;

  /**
   * Whether there are more rows available
   */
  hasMore: boolean;

  /**
   * Actual number of rows returned
   */
  actualRowCount?: number;
};
}
