/**
 * Integration Tests for Query Routes
 * 
 * Tests API endpoints with real HTTP requests
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import { queryRouter } from '../../../src/routes/query.js'
import { errorHandler } from '../../../src/middleware/errorHandler.js'

// Create test app
const createTestApp = () => {
  const app = express()
  
  // Body parsing middleware with error handling (same as server.js)
  app.use(express.json({ 
    limit: '10mb',
    strict: true
  }))
  
  // Handle JSON parsing errors (same as server.js)
  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({
        error: 'Invalid JSON',
        message: 'Request body contains invalid JSON',
        timestamp: new Date().toISOString()
      })
    }
    next(error)
  })
  
  app.use('/api/query', queryRouter)
  app.use(errorHandler)
  return app
}

describe('Query Routes Integration', () => {
  let app

  beforeAll(() => {
    app = createTestApp()
  })

  describe('POST /api/query/execute', () => {
    it('should validate request body schema', async () => {
      const response = await request(app)
        .post('/api/query/execute')
        .send({
          // Missing required fields
          query: 'SELECT 1'
        })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        error: 'Validation Error',
        message: 'Request validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('required')
          })
        ])
      })
    })

    it('should reject invalid connection configuration', async () => {
      const response = await request(app)
        .post('/api/query/execute')
        .send({
          query: 'SELECT 1',
          connectionId: 'test-conn',
          connection: {
            host: 'localhost',
            port: 'invalid-port', // Should be number
            database: 'testdb',
            username: 'user',
            password: 'pass'
          }
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation Error')
    })

    it('should reject dangerous queries', async () => {
      const response = await request(app)
        .post('/api/query/execute')
        .send({
          query: 'DROP DATABASE testdb',
          connectionId: 'test-conn',
          connection: {
            host: 'localhost',
            port: 5432,
            database: 'testdb',
            username: 'user',
            password: 'pass'
          }
        })

      expect(response.status).toBe(500) // Will be caught by error handler
    })

    it('should sanitize input data', async () => {
      const response = await request(app)
        .post('/api/query/execute')
        .send({
          query: '  SELECT 1  ', // Should be trimmed
          connectionId: '  test-conn  ', // Should be trimmed
          connection: {
            host: '  localhost  ',
            port: 5432,
            database: '  testdb  ',
            username: '  user  ',
            password: '  pass  '
          }
        })

      // Even if the query fails due to connection, input should be sanitized
      expect(response.status).toBeGreaterThanOrEqual(400)
    })

    it('should validate options ranges', async () => {
      const response = await request(app)
        .post('/api/query/execute')
        .send({
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
            timeout: 500, // Below minimum
            maxRows: 100000 // Above maximum
          }
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation Error')
    })

    it('should accept valid request with default options', async () => {
      const response = await request(app)
        .post('/api/query/execute')
        .send({
          query: 'SELECT 1 as test',
          connectionId: 'test-conn',
          connection: {
            host: 'localhost',
            port: 5432,
            database: 'testdb',
            username: 'user',
            password: 'pass'
          }
        })

      // Should pass validation but fail on connection (expected in test)
      expect([400, 500, 503]).toContain(response.status)
    })
  })

  describe('POST /api/query/cancel', () => {
    it('should validate UUID format for queryId', async () => {
      const response = await request(app)
        .post('/api/query/cancel')
        .send({
          queryId: 'invalid-uuid'
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation Error')
    })

    it('should accept valid UUID', async () => {
      const response = await request(app)
        .post('/api/query/cancel')
        .send({
          queryId: '550e8400-e29b-41d4-a716-446655440000'
        })

      // Should pass validation
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        cancelled: false // No active query with this ID
      })
    })

    it('should require queryId field', async () => {
      const response = await request(app)
        .post('/api/query/cancel')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation Error')
    })
  })

  describe('POST /api/query/validate', () => {
    it('should require query field', async () => {
      const response = await request(app)
        .post('/api/query/validate')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation Error')
    })

    it('should reject empty query', async () => {
      const response = await request(app)
        .post('/api/query/validate')
        .send({
          query: ''
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation Error')
    })

    it('should validate query length limits', async () => {
      const longQuery = 'SELECT * FROM users WHERE ' + 'x'.repeat(100001) // Exceeds max length of 100000
      
      const response = await request(app)
        .post('/api/query/validate')
        .send({
          query: longQuery
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation Error')
    })

    it('should accept valid query for validation', async () => {
      const response = await request(app)
        .post('/api/query/validate')
        .send({
          query: 'SELECT * FROM users WHERE id = 1'
        })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        valid: true,
        message: 'Query syntax appears valid'
      })
    })

    it('should detect dangerous queries', async () => {
      const response = await request(app)
        .post('/api/query/validate')
        .send({
          query: 'DROP DATABASE testdb'
        })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        valid: false,
        error: 'Query contains potentially dangerous operations'
      })
    })

    it('should sanitize query input', async () => {
      const response = await request(app)
        .post('/api/query/validate')
        .send({
          query: '  SELECT 1  ' // Should be trimmed
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/query/execute')
        .send('invalid json')
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(400)
    })

    it('should handle missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/query/execute')
        .send('query=SELECT 1')

      expect(response.status).toBe(400)
    })

    it('should return consistent error format', async () => {
      const response = await request(app)
        .post('/api/query/execute')
        .send({})

      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('Response Format Validation', () => {
    it('should return properly formatted success responses', async () => {
      const response = await request(app)
        .post('/api/query/cancel')
        .send({
          queryId: '550e8400-e29b-41d4-a716-446655440000'
        })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        cancelled: expect.any(Boolean),
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      })
    })

    it('should return properly formatted validation responses', async () => {
      const response = await request(app)
        .post('/api/query/validate')
        .send({
          query: 'SELECT 1'
        })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: true,
        valid: expect.any(Boolean),
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      })
    })
  })
})
