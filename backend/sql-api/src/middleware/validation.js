/**
 * JSON Schema Validation Middleware
 * 
 * Replaces express-validator with AJV-based JSON Schema validation
 */

import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { 
  connectionConfigSchema,
  queryExecuteRequestSchema,
  queryValidateRequestSchema,
  queryCancelRequestSchema,
  connectionTestRequestSchema,
  connectionSchemaRequestSchema,
  successResponseSchema,
  errorResponseSchema,
  validationErrorResponseSchema,
  queryResultDataSchema
} from '../schemas/index.js'

// Create AJV instance with configuration
const ajv = new Ajv({
  allErrors: true,           // Return all validation errors
  removeAdditional: true,    // Remove additional properties not in schema
  useDefaults: true,         // Set default values from schema
  coerceTypes: true,         // Type coercion (string "123" -> number 123)
  strict: false              // Allow unknown keywords
})

// Add format validators (date-time, email, etc.)
addFormats(ajv)

// Add all schemas to AJV for reference resolution
ajv.addSchema(connectionConfigSchema)
ajv.addSchema(queryExecuteRequestSchema)
ajv.addSchema(queryValidateRequestSchema)
ajv.addSchema(queryCancelRequestSchema)
ajv.addSchema(connectionTestRequestSchema)
ajv.addSchema(connectionSchemaRequestSchema)
ajv.addSchema(successResponseSchema)
ajv.addSchema(errorResponseSchema)
ajv.addSchema(validationErrorResponseSchema)
ajv.addSchema(queryResultDataSchema)

/**
 * Create validation middleware for request body
 * @param {Object} schema - JSON schema for validation
 * @param {string} target - Target to validate ('body', 'params', 'query')
 * @returns {Function} Express middleware function
 */
export const validateSchema = (schema, target = 'body') => {
  const validate = ajv.compile(schema)
  
  return (req, res, next) => {
    const data = req[target]
    const valid = validate(data)
    
    if (!valid) {
      const errors = validate.errors.map(error => ({
        instancePath: error.instancePath,
        schemaPath: error.schemaPath,
        keyword: error.keyword,
        params: error.params,
        message: error.message,
        data: error.data
      }))
      
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Request validation failed',
        details: errors,
        timestamp: new Date().toISOString()
      })
    }
    
    // Update request with validated/coerced data
    req[target] = data
    next()
  }
}

/**
 * Validate response data against schema (for development/testing)
 * @param {Object} data - Data to validate
 * @param {Object} schema - JSON schema
 * @returns {Object} Validation result
 */
export const validateResponse = (data, schema) => {
  const validate = ajv.compile(schema)
  const valid = validate(data)
  
  return {
    valid,
    errors: validate.errors || []
  }
}

/**
 * Create async validation middleware for complex validations
 * @param {Function} asyncValidator - Async validation function
 * @returns {Function} Express middleware function
 */
export const validateAsync = (asyncValidator) => {
  return async (req, res, next) => {
    try {
      await asyncValidator(req, res)
      next()
    } catch (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
}

/**
 * Sanitize and normalize request data
 * @param {Object} data - Request data
 * @returns {Object} Sanitized data
 */
export const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return data.trim()
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput)
  }
  
  if (typeof data !== 'object' || data === null) {
    return data
  }
  
  const sanitized = {}
  
  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = sanitizeInput(value)
  }
  
  return sanitized
}

/**
 * Middleware to sanitize request body
 */
export const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body)
  }
  if (req.query) {
    req.query = sanitizeInput(req.query)
  }
  if (req.params) {
    req.params = sanitizeInput(req.params)
  }
  next()
}

export default { validateSchema, validateResponse, validateAsync, sanitizeRequest }
