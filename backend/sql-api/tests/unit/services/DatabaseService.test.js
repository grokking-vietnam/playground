/**
 * Unit Tests for Database Service
 * 
 * Tests database connection and query functionality
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { databaseService } from '../../../src/services/DatabaseService.js'

// Mock pg module
const mockPool = {
  connect: jest.fn(),
  end: jest.fn(),
  query: jest.fn()
}

const mockClient = {
  query: jest.fn(),
  release: jest.fn()
}

// Mock pg package
jest.mock('pg', () => ({
  Pool: jest.fn(() => mockPool)
}))

describe('DatabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset the database service state
    databaseService.pools.clear()
    databaseService.activeQueries.clear()
    
    // Set up default mock responses
    mockPool.connect.mockResolvedValue(mockClient)
    mockClient.query.mockResolvedValue({
      rows: [{ test: 1 }],
      fields: [{ name: 'test', dataTypeID: 23 }],
      command: 'SELECT',
      rowCount: 1
    })
  })

  afterEach(() => {
    databaseService.pools.clear()
    databaseService.activeQueries.clear()
  })

  describe('validateQuery', () => {
    it('should pass valid SELECT queries', () => {
      expect(() => {
        databaseService.validateQuery('SELECT * FROM users')
      }).not.toThrow()
    })

    it('should pass valid INSERT queries', () => {
      expect(() => {
        databaseService.validateQuery('INSERT INTO users (name) VALUES (\'test\')')
      }).not.toThrow()
    })

    it('should reject empty queries', () => {
      expect(() => {
        databaseService.validateQuery('')
      }).toThrow('Query cannot be empty')
    })

    it('should reject whitespace-only queries', () => {
      expect(() => {
        databaseService.validateQuery('   ')
      }).toThrow('Query cannot be empty')
    })

    it('should reject dangerous DROP DATABASE queries', () => {
      expect(() => {
        databaseService.validateQuery('DROP DATABASE testdb')
      }).toThrow('Query contains potentially dangerous operations')
    })

    it('should reject dangerous DROP SCHEMA queries', () => {
      expect(() => {
        databaseService.validateQuery('drop schema public cascade')
      }).toThrow('Query contains potentially dangerous operations')
    })

    it('should reject dangerous TRUNCATE queries', () => {
      expect(() => {
        databaseService.validateQuery('TRUNCATE TABLE users')
      }).toThrow('Query contains potentially dangerous operations')
    })

    it('should reject DELETE without WHERE clause', () => {
      expect(() => {
        databaseService.validateQuery('DELETE FROM users')
      }).toThrow('Query contains potentially dangerous operations')
    })

    it('should allow DELETE with WHERE clause', () => {
      expect(() => {
        databaseService.validateQuery('DELETE FROM users WHERE id = 1')
      }).not.toThrow()
    })

    it('should reject UPDATE without WHERE clause', () => {
      expect(() => {
        databaseService.validateQuery('UPDATE users SET name = \'test\'')
      }).toThrow('Query contains potentially dangerous operations')
    })

    it('should allow UPDATE with WHERE clause', () => {
      expect(() => {
        databaseService.validateQuery('UPDATE users SET name = \'test\' WHERE id = 1')
      }).not.toThrow()
    })
  })

  describe('formatQueryResult', () => {
    it('should format PostgreSQL result correctly', () => {
      const pgResult = {
        rows: [{ id: 1, name: 'test' }],
        fields: [
          { name: 'id', dataTypeID: 23 },
          { name: 'name', dataTypeID: 25 }
        ],
        command: 'SELECT',
        rowCount: 1
      }

      const result = databaseService.formatQueryResult(pgResult, 150, 1000)

      expect(result).toEqual({
        columns: [
          { name: 'id', type: 'integer', nullable: true },
          { name: 'name', type: 'text', nullable: true }
        ],
        rows: [{ id: 1, name: 'test' }],
        metadata: {
          totalRows: 1,
          affectedRows: 1,
          executionTime: 150,
          command: 'SELECT',
          hasMore: false,
          actualRowCount: 1
        }
      })
    })

    it('should limit rows when maxRows is exceeded', () => {
      const pgResult = {
        rows: [
          { id: 1, name: 'test1' },
          { id: 2, name: 'test2' },
          { id: 3, name: 'test3' }
        ],
        fields: [{ name: 'id', dataTypeID: 23 }],
        command: 'SELECT',
        rowCount: 3
      }

      const result = databaseService.formatQueryResult(pgResult, 100, 2)

      expect(result.rows).toHaveLength(2)
      expect(result.metadata.hasMore).toBe(true)
      expect(result.metadata.actualRowCount).toBe(3)
    })

    it('should handle empty result sets', () => {
      const pgResult = {
        rows: [],
        fields: [],
        command: 'SELECT',
        rowCount: 0
      }

      const result = databaseService.formatQueryResult(pgResult, 50, 1000)

      expect(result.rows).toHaveLength(0)
      expect(result.columns).toHaveLength(0)
      expect(result.metadata.totalRows).toBe(0)
      expect(result.metadata.hasMore).toBe(false)
    })
  })

  describe('mapPostgreSQLType', () => {
    it('should map common PostgreSQL types correctly', () => {
      expect(databaseService.mapPostgreSQLType(16)).toBe('boolean')
      expect(databaseService.mapPostgreSQLType(20)).toBe('bigint')
      expect(databaseService.mapPostgreSQLType(21)).toBe('smallint')
      expect(databaseService.mapPostgreSQLType(23)).toBe('integer')
      expect(databaseService.mapPostgreSQLType(25)).toBe('text')
      expect(databaseService.mapPostgreSQLType(1043)).toBe('varchar')
      expect(databaseService.mapPostgreSQLType(1082)).toBe('date')
      expect(databaseService.mapPostgreSQLType(1114)).toBe('timestamp')
      expect(databaseService.mapPostgreSQLType(2950)).toBe('uuid')
      expect(databaseService.mapPostgreSQLType(114)).toBe('json')
      expect(databaseService.mapPostgreSQLType(3802)).toBe('jsonb')
    })

    it('should return unknown for unmapped types', () => {
      expect(databaseService.mapPostgreSQLType(9999)).toBe('unknown')
    })
  })

  describe('createQueryError', () => {
    it('should create structured error from PostgreSQL error', () => {
      const pgError = {
        message: 'syntax error at or near "SELCT"',
        code: '42601',
        severity: 'ERROR',
        line: '1',
        column: '1',
        position: '1',
        hint: 'Perhaps you meant "SELECT".'
      }
      
      const query = 'SELCT * FROM users'
      const result = databaseService.createQueryError(pgError, query)

      expect(result).toBeInstanceOf(Error)
      expect(result.message).toBe('syntax error at or near "SELCT"')
      expect(result.code).toBe('42601')
      expect(result.severity).toBe('ERROR')
      expect(result.line).toBe('1')
      expect(result.column).toBe('1')
      expect(result.position).toBe('1')
      expect(result.hint).toBe('Perhaps you meant "SELECT".')
      expect(result.query).toBe('SELCT * FROM users')
    })

    it('should truncate long queries in error context', () => {
      const pgError = { message: 'Test error' }
      const longQuery = 'SELECT * FROM users WHERE ' + 'x'.repeat(300)
      
      const result = databaseService.createQueryError(pgError, longQuery)
      
      expect(result.query).toHaveLength(200)
      expect(result.query).toBe(longQuery.substring(0, 200))
    })
  })

  describe('createTimeoutPromise', () => {
    it('should reject after specified timeout', async () => {
      const promise = databaseService.createTimeoutPromise(100)
      
      await expect(promise).rejects.toThrow('Query execution timeout after 100ms')
    })
  })

  describe('testConnection', () => {
    it('should successfully test valid connection', async () => {
      const connectionConfig = {
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass'
      }

      mockClient.query.mockResolvedValueOnce({
        rows: [{
          version: 'PostgreSQL 14.0',
          current_time: new Date()
        }]
      })

      const result = await databaseService.testConnection(connectionConfig)

      expect(result.success).toBe(true)
      expect(result.version).toBe('PostgreSQL 14.0')
      expect(mockPool.end).toHaveBeenCalled()
    })

    it('should handle connection failures', async () => {
      const connectionConfig = {
        host: 'invalid-host',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass'
      }

      mockPool.connect.mockRejectedValueOnce(new Error('Connection refused'))

      await expect(databaseService.testConnection(connectionConfig))
        .rejects.toThrow('Connection test failed: Connection refused')

      expect(mockPool.end).toHaveBeenCalled()
    })
  })

  describe('executeQuery', () => {
    it('should execute query successfully', async () => {
      const connectionConfig = {
        id: 'test-conn',
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass'
      }

      const query = 'SELECT * FROM users'
      const options = { timeout: 30000, maxRows: 1000 }

      const result = await databaseService.executeQuery(
        'test-conn',
        connectionConfig,
        query,
        options
      )

      expect(result).toHaveProperty('queryId')
      expect(result.columns).toHaveLength(1)
      expect(result.rows).toHaveLength(1)
      expect(result.metadata.command).toBe('SELECT')
      expect(mockClient.release).toHaveBeenCalled()
    })

    it('should handle query execution errors', async () => {
      const connectionConfig = {
        id: 'test-conn-error', // Use unique connection ID to avoid cached pool
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass'
      }

      // Mock the pool.connect to return a client that throws on query
      const errorClient = {
        query: jest.fn().mockRejectedValue(new Error('Syntax error')),
        release: jest.fn()
      }
      mockPool.connect.mockResolvedValueOnce(errorClient)

      await expect(databaseService.executeQuery(
        'test-conn-error',
        connectionConfig,
        'SELECT * FROM users', // Use valid query syntax to avoid validation error
        {}
      )).rejects.toThrow('Syntax error')
    })

    it('should validate query before execution', async () => {
      const connectionConfig = {
        id: 'test-conn-dangerous', // Use unique connection ID
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user',
        password: 'pass'
      }

      // This should fail validation before even trying to connect
      await expect(databaseService.executeQuery(
        'test-conn-dangerous',
        connectionConfig,
        'DROP DATABASE testdb',
        {}
      )).rejects.toThrow('Query contains potentially dangerous operations')
    })
  })
})
