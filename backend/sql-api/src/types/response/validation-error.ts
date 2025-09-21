/* eslint-disable */
/**
 * This file was automatically generated from JSON schema.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run 'npm run generate-types' to regenerate this file.
 */
/**
 * Response format for validation errors
 */
export interface ValidationErrorResponse {

  error: string;

  /**
   * Validation error message
   */
  message: string;

  details: {

  /**
   * Path to the invalid property
   */
  instancePath: string;

  /**
   * Path in schema where validation failed
   */
  schemaPath: string;

  /**
   * Validation keyword that failed
   */
  keyword: string;

  /**
   * Validation parameters
   */
  params?: Record<string, any>;

  /**
   * Validation error message
   */
  message: string;
}[];

  timestamp: string;
}
