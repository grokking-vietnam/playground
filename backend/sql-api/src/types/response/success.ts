/* eslint-disable */
/**
 * This file was automatically generated from JSON schema.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run 'npm run generate-types' to regenerate this file.
 */
/**
 * Standard success response format
 */
export interface SuccessResponse {

  success: boolean;

  /**
   * Response data payload
   */
  data?: Record<string, any>;

  /**
   * Response timestamp in ISO format
   */
  timestamp: string;
}
