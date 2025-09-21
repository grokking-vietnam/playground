/**
 * JSON Schemas for API Request/Response Validation
 *
 * Centralized exports for all JSON schemas used in the API.
 * Each schema is defined in its own JSON file for better maintainability.
 */

import { loadJson } from './utils/load-json.js'

// Request schemas
export const connectionConfigSchema = loadJson('request/connection-config.json')
export const queryExecuteRequestSchema = loadJson('request/query-execute.json')
export const queryValidateRequestSchema = loadJson('request/query-validate.json')
export const queryCancelRequestSchema = loadJson('request/query-cancel.json')
export const connectionTestRequestSchema = loadJson('request/connection-test.json')
export const connectionSchemaRequestSchema = loadJson('request/connection-schema.json')

// Response schemas
export const successResponseSchema = loadJson('response/success.json')
export const errorResponseSchema = loadJson('response/error.json')
export const validationErrorResponseSchema = loadJson('response/validation-error.json')
export const queryResultDataSchema = loadJson('response/query-result.json')