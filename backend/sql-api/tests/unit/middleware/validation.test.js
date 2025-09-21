/**
 * Unit Tests for Validation Middleware
 * 
 * Tests JSON Schema validation functionality
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { validateSchema, sanitizeRequest, validateResponse } from '../../../src/middleware/validation.js'
import { queryExecuteRequestSchema } from '../../../src/schemas/index.js'

describe('Validation Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {}
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
  })

  describe('validateSchema', () => {
    it('should pass validation with valid data', () => {
      const middleware = validateSchema(queryExecuteRequestSchema)
      req.body = {
        query: 'SELECT * FROM users',
        connectionId: 'test-conn',
        connection: {
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass'
        }
      }

      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(res.status).not.toHaveBeenCalled()
    })

    it('should fail validation with missing required fields', () => {
      const middleware = validateSchema(queryExecuteRequestSchema)
      req.body = {
        query: 'SELECT * FROM users'
        // Missing connectionId and connection
      }

      middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation Error',
          message: 'Request validation failed',
          details: expect.arrayContaining([
            expect.objectContaining({
              message: expect.stringContaining('required')
            })
          ])
        })
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should fail validation with invalid data types', () => {
      const middleware = validateSchema(queryExecuteRequestSchema)
      req.body = {
        query: 'SELECT * FROM users',
        connectionId: 'test-conn',
        connection: {
          host: 'localhost',
          port: 'invalid-port', // Should be integer
          database: 'testdb',
          username: 'user',
          password: 'pass'
        }
      }

      middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation Error'
        })
      )
    })

    it('should coerce valid string numbers to integers', () => {
      const middleware = validateSchema(queryExecuteRequestSchema)
      req.body = {
        query: 'SELECT * FROM users',
        connectionId: 'test-conn',
        connection: {
          host: 'localhost',
          port: '5432', // String that should be coerced to number
          database: 'testdb',
          username: 'user',
          password: 'pass'
        }
      }

      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.body.connection.port).toBe(5432)
    })

    it('should not set default values (AJV does not set defaults automatically)', () => {
      const middleware = validateSchema(queryExecuteRequestSchema)
      req.body = {
        query: 'SELECT * FROM users',
        connectionId: 'test-conn',
        connection: {
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass'
          // ssl not provided - AJV does not set defaults automatically
        }
      }

      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      // AJV does not automatically set default values - this is expected behavior
      expect(req.body.connection.ssl).toBeUndefined()
    })

    it('should remove additional properties not in schema', () => {
      const middleware = validateSchema(queryExecuteRequestSchema)
      req.body = {
        query: 'SELECT * FROM users',
        connectionId: 'test-conn',
        connection: {
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass'
        },
        extraProperty: 'should be removed' // Not in schema
      }

      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(req.body.extraProperty).toBeUndefined()
    })
  })

  describe('sanitizeRequest', () => {
    it('should trim whitespace from string values', () => {
      req.body = {
        query: '  SELECT * FROM users  ',
        connectionId: '  test-conn  '
      }

      sanitizeRequest(req, res, next)

      expect(req.body.query).toBe('SELECT * FROM users')
      expect(req.body.connectionId).toBe('test-conn')
      expect(next).toHaveBeenCalledWith()
    })

    it('should recursively sanitize nested objects', () => {
      req.body = {
        connection: {
          host: '  localhost  ',
          database: '  testdb  '
        }
      }

      sanitizeRequest(req, res, next)

      expect(req.body.connection.host).toBe('localhost')
      expect(req.body.connection.database).toBe('testdb')
    })

    it('should sanitize arrays', () => {
      req.body = {
        queries: ['  SELECT 1  ', '  SELECT 2  ']
      }

      sanitizeRequest(req, res, next)

      expect(req.body.queries[0]).toBe('SELECT 1')
      expect(req.body.queries[1]).toBe('SELECT 2')
    })

    it('should handle null and undefined values', () => {
      req.body = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: ''
      }

      sanitizeRequest(req, res, next)

      expect(req.body.nullValue).toBe(null)
      expect(req.body.undefinedValue).toBe(undefined)
      expect(req.body.emptyString).toBe('')
    })
  })

  describe('validateResponse', () => {
    const testSchema = {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' }
      },
      required: ['success']
    }

    it('should validate correct response data', () => {
      const data = {
        success: true,
        data: { result: 'test' }
      }

      const result = validateResponse(data, testSchema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid response data', () => {
      const data = {
        // Missing required 'success' field
        data: { result: 'test' }
      }

      const result = validateResponse(data, testSchema)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})
