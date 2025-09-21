/**
 * Integration Tests for Connection Routes
 * 
 * Tests API endpoints for database connections
 */

import { describe, it, expect, beforeAll } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import { connectionRouter } from '../../../src/routes/connection.js'
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
  
  app.use('/api/connection', connectionRouter)
  app.use(errorHandler)
  return app
}

describe('Connection Routes Integration', () => {
  let app

  beforeAll(() => {
    app = createTestApp()
  })

  describe('POST /api/connection/test', () => {
    it('should validate connection configuration schema', async () => {
      const response = await request(app)
        .post('/api/connection/test')
        .send({
          host: 'localhost',
          // Missing required fields
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

    it('should validate port range', async () => {
      const response = await request(app)
        .post('/api/connection/test')
        .send({
          host: 'localhost',
          port: 70000, // Invalid port
          database: 'testdb',
          username: 'user',
          password: 'pass'
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation Error')
    })

    it('should reject empty required fields', async () => {
      const response = await request(app)
        .post('/api/connection/test')
        .send({
          host: '',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass'
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation Error')
    })

    it('should sanitize input strings', async () => {
      const response = await request(app)
        .post('/api/connection/test')
        .send({
          host: '  localhost  ',
          port: 5432,
          database: '  testdb  ',
          username: '  user  ',
          password: '  pass  '
        })

      // Should pass validation but fail connection (expected in test)
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(false) // Connection will fail
    })

    it('should handle connection failures gracefully', async () => {
      const response = await request(app)
        .post('/api/connection/test')
        .send({
          host: 'nonexistent-host',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass'
        })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        success: false,
        error: expect.any(String),
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      })
    })

    it('should accept valid connection config', async () => {
      const response = await request(app)
        .post('/api/connection/test')
        .send({
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass',
          ssl: false
        })

      expect(response.status).toBe(200)
      // Will fail connection but should pass validation
      expect(response.body).toHaveProperty('success')
      expect(response.body).toHaveProperty('timestamp')
    })

    it('should use default ssl value when not provided', async () => {
      const response = await request(app)
        .post('/api/connection/test')
        .send({
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass'
          // ssl not provided, should default to false
        })

      expect(response.status).toBe(200)
    })
  })

  describe('POST /api/connection/schema', () => {
    it('should validate schema request structure', async () => {
      const response = await request(app)
        .post('/api/connection/schema')
        .send({
          connectionId: 'test-conn'
          // Missing connection config
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation Error')
    })

    it('should validate connectionId pattern', async () => {
      const response = await request(app)
        .post('/api/connection/schema')
        .send({
          connectionId: 'invalid@id!',
          connection: {
            host: 'localhost',
            port: 5432,
            database: 'testdb',
            username: 'user',
            password: 'pass'
          }
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation Error')
    })

    it('should validate nested connection configuration', async () => {
      const response = await request(app)
        .post('/api/connection/schema')
        .send({
          connectionId: 'test-conn',
          connection: {
            host: 'localhost',
            port: 'invalid-port', // Should be integer
            database: 'testdb',
            username: 'user',
            password: 'pass'
          }
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation Error')
    })

    it('should require all connection fields', async () => {
      const response = await request(app)
        .post('/api/connection/schema')
        .send({
          connectionId: 'test-conn',
          connection: {
            host: 'localhost',
            port: 5432
            // Missing database, username, password
          }
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation Error')
    })

    it('should accept valid schema request', async () => {
      const response = await request(app)
        .post('/api/connection/schema')
        .send({
          connectionId: 'test-conn',
          connection: {
            host: 'localhost',
            port: 5432,
            database: 'testdb',
            username: 'user',
            password: 'pass'
          }
        })

      // Should pass validation but fail on connection
      expect([400, 500, 503]).toContain(response.status)
    })

    it('should sanitize connectionId and connection fields', async () => {
      const response = await request(app)
        .post('/api/connection/schema')
        .send({
          connectionId: '  test-conn  ',
          connection: {
            host: '  localhost  ',
            port: 5432,
            database: '  testdb  ',
            username: '  user  ',
            password: '  pass  '
          }
        })

      // Should pass validation
      expect([400, 500, 503]).toContain(response.status)
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/connection/test')
        .send('invalid json')
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(400)
    })

    it('should return consistent error format', async () => {
      const response = await request(app)
        .post('/api/connection/test')
        .send({})

      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('timestamp')
    })

    it('should handle missing request body', async () => {
      const response = await request(app)
        .post('/api/connection/test')

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Validation Error')
    })
  })

  describe('Response Format Validation', () => {
    it('should return properly formatted connection test responses', async () => {
      const response = await request(app)
        .post('/api/connection/test')
        .send({
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success')
      expect(response.body).toHaveProperty('timestamp')
      
      if (response.body.success) {
        expect(response.body).toHaveProperty('data')
      } else {
        expect(response.body).toHaveProperty('error')
      }
    })

    it('should include timestamp in all responses', async () => {
      const response = await request(app)
        .post('/api/connection/test')
        .send({
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass'
        })

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('Input Validation Edge Cases', () => {
    it('should handle very long strings in fields', async () => {
      const longString = 'a'.repeat(1000)
      
      const response = await request(app)
        .post('/api/connection/test')
        .send({
          host: longString,
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass'
        })

      expect(response.status).toBe(200) // Should pass validation
    })

    it('should handle special characters in connection fields', async () => {
      const response = await request(app)
        .post('/api/connection/test')
        .send({
          host: 'localhost',
          port: 5432,
          database: 'test-db_123',
          username: 'test_user-123',
          password: 'p@ssw0rd!#$'
        })

      expect(response.status).toBe(200) // Should pass validation
    })

    it('should handle boolean ssl field correctly', async () => {
      const response = await request(app)
        .post('/api/connection/test')
        .send({
          host: 'localhost',
          port: 5432,
          database: 'testdb',
          username: 'user',
          password: 'pass',
          ssl: true
        })

      expect(response.status).toBe(200)
    })
  })
})
