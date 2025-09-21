/* eslint-disable */
/**
 * This file was automatically generated from JSON schema.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run 'npm run generate-types' to regenerate this file.
 */
/**
 * Standard error response format
 */
export interface ErrorResponse {

  success: boolean;

  /**
   * Error type or category
   */
  error: string;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Additional error details
   */
  details?: Record<string, any>;

  /**
   * Error timestamp in ISO format
   */
  timestamp: string;
}
