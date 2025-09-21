/**
 * Unit Tests for JSON Schemas
 * 
 * Tests schema validation rules and structure
 */

import { describe, it, expect } from '@jest/globals'
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
} from '../../../src/schemas/index.js'

describe('JSON Schemas', () => {
  let ajv

  beforeEach(() => {
    ajv = new Ajv({ allErrors: true, strict: false })
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
  })

  describe('connectionConfigSchema', () => {
    const validate = () => ajv.compile(connectionConfigSchema)

    it('should validate correct connection config', () => {
      const validator = validate()
      const data = {
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass',
        ssl: false
      }

      expect(validator(data)).toBe(true)
    })

    it('should require all mandatory fields', () => {
      const validator = validate()
      const data = {
        host: 'localhost'
        // Missing port, database, username, password
      }

      expect(validator(data)).toBe(false)
      expect(validator.errors).toHaveLength(4) // 4 missing required fields
    })

    it('should validate port range', () => {
      const validator = validate()
      
      // Invalid port (too low)
      expect(validator({
        host: 'localhost',
        port: 0,
        database: 'testdb',
        username: 'user',
        password: 'pass'
      })).toBe(false)

      // Invalid port (too high)
      expect(validator({
        host: 'localhost',
        port: 70000,
        database: 'testdb',
        username: 'user',
        password: 'pass'
      })).toBe(false)

      // Valid port
      expect(validator({
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass'
      })).toBe(true)
    })

    it('should reject empty strings for required fields', () => {
      const validator = validate()
      const data = {
        host: '',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass'
      }

      expect(validator(data)).toBe(false)
    })

    it('should allow ssl to be optional with default', () => {
      const validator = validate()
      const data = {
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass'
        // ssl not provided
      }

      expect(validator(data)).toBe(true)
    })
  })

  describe('queryExecuteRequestSchema', () => {
    const validate = () => ajv.compile(queryExecuteRequestSchema)

    it('should validate complete query request', () => {
      const validator = validate()
      const data = {
        query: 'SELECT * FROM users',
        connectionId: 'test-conn',
        connection: {
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass'
        },
        options: {
          timeout: 30000,
          maxRows: 1000
        }
      }

      expect(validator(data)).toBe(true)
    })

    it('should require query, connectionId, and connection', () => {
      const validator = validate()
      const data = {}

      expect(validator(data)).toBe(false)
      expect(validator.errors.map(e => e.instancePath)).toContain('')
    })

    it('should validate connectionId pattern', () => {
      const validator = validate()
      
      // Invalid characters
      const invalidData = {
        query: 'SELECT 1',
        connectionId: 'test@conn!',
        connection: {
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass'
        }
      }

      expect(validator(invalidData)).toBe(false)
    })

    it('should validate query length limits', () => {
      const validator = validate()
      
      // Too long query
      const longQuery = 'SELECT '.repeat(20000)
      const data = {
        query: longQuery,
        connectionId: 'test-conn',
        connection: {
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass'
        }
      }

      expect(validator(data)).toBe(false)
    })

    it('should validate options ranges', () => {
      const validator = validate()
      
      const data = {
        query: 'SELECT 1',
        connectionId: 'test-conn',
        connection: {
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass'
        },
        options: {
          timeout: 500, // Too low
          maxRows: 100000 // Too high
        }
      }

      expect(validator(data)).toBe(false)
    })
  })

  describe('queryCancelRequestSchema', () => {
    const validate = () => ajv.compile(queryCancelRequestSchema)

    it('should validate UUID format', () => {
      const validator = validate()
      
      // Valid UUID
      expect(validator({
        queryId: '550e8400-e29b-41d4-a716-446655440000'
      })).toBe(true)

      // Invalid UUID format
      expect(validator({
        queryId: 'invalid-uuid'
      })).toBe(false)
    })
  })

  describe('successResponseSchema', () => {
    const validate = () => ajv.compile(successResponseSchema)

    it('should validate success response', () => {
      const validator = validate()
      const data = {
        success: true,
        data: { result: 'test' },
        timestamp: '2023-12-07T10:00:00.000Z'
      }

      expect(validator(data)).toBe(true)
    })

    it('should require success to be true', () => {
      const validator = validate()
      const data = {
        success: false, // Should be true for success response
        timestamp: '2023-12-07T10:00:00.000Z'
      }

      expect(validator(data)).toBe(false)
    })

    it('should validate timestamp format', () => {
      const validator = validate()
      const data = {
        success: true,
        timestamp: 'invalid-date'
      }

      expect(validator(data)).toBe(false)
    })
  })

  describe('errorResponseSchema', () => {
    const validate = () => ajv.compile(errorResponseSchema)

    it('should validate error response', () => {
      const validator = validate()
      const data = {
        success: false,
        error: 'Database Error',
        message: 'Connection failed',
        timestamp: '2023-12-07T10:00:00.000Z'
      }

      expect(validator(data)).toBe(true)
    })

    it('should require success to be false', () => {
      const validator = validate()
      const data = {
        success: true, // Should be false for error response
        error: 'Test Error',
        message: 'Test message',
        timestamp: '2023-12-07T10:00:00.000Z'
      }

      expect(validator(data)).toBe(false)
    })
  })

  describe('validationErrorResponseSchema', () => {
    const validate = () => ajv.compile(validationErrorResponseSchema)

    it('should validate validation error response', () => {
      const validator = validate()
      const data = {
        error: 'Validation Error',
        message: 'Request validation failed',
        details: [
          {
            instancePath: '/query',
            schemaPath: '#/properties/query/minLength',
            keyword: 'minLength',
            params: { limit: 1 },
            message: 'must NOT have fewer than 1 characters'
          }
        ],
        timestamp: '2023-12-07T10:00:00.000Z'
      }

      expect(validator(data)).toBe(true)
    })
  })

  describe('queryResultDataSchema', () => {
    const validate = () => ajv.compile(queryResultDataSchema)

    it('should validate query result data', () => {
      const validator = validate()
      const data = {
        queryId: '550e8400-e29b-41d4-a716-446655440000',
        columns: [
          { name: 'id', type: 'integer', nullable: false },
          { name: 'name', type: 'text', nullable: true }
        ],
        rows: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ],
        metadata: {
          totalRows: 2,
          affectedRows: 0,
          executionTime: 150,
          command: 'SELECT',
          hasMore: false,
          actualRowCount: 2
        }
      }

      expect(validator(data)).toBe(true)
    })

    it('should require all metadata fields', () => {
      const validator = validate()
      const data = {
        queryId: '550e8400-e29b-41d4-a716-446655440000',
        columns: [],
        rows: [],
        metadata: {
          totalRows: 0,
          executionTime: 100
          // Missing required fields
        }
      }

      expect(validator(data)).toBe(false)
    })
  })
})
