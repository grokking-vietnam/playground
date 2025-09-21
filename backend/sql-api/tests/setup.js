/**
 * Jest Test Setup
 * 
 * Global test configuration and utilities
 */

import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals'
import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

// Set test environment
process.env.NODE_ENV = 'test'
process.env.PORT = '0' // Use random port for tests

// Global test timeout
jest.setTimeout(30000)

// Mock console methods to reduce test noise
const originalConsole = { ...console }

beforeAll(() => {
  // Mock console methods during tests
  console.log = jest.fn()
  console.info = jest.fn()
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  // Restore console methods
  Object.assign(console, originalConsole)
})

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
})

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks()
})

// Global test utilities
global.testUtils = {
  // Create mock database connection config
  createMockConnection: () => ({
    host: 'localhost',
    port: 5432,
    database: 'testdb',
    username: 'testuser',
    password: 'testpass',
    ssl: false
  }),
  
  // Create mock query execution request
  createMockQueryRequest: (overrides = {}) => ({
    query: 'SELECT 1 as test',
    connectionId: 'test-connection',
    connection: global.testUtils.createMockConnection(),
    options: {
      timeout: 30000,
      maxRows: 1000
    },
    ...overrides
  }),
  
  // Wait for async operations
  wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock PostgreSQL result
  createMockPgResult: (overrides = {}) => ({
    rows: [{ test: 1 }],
    fields: [{ name: 'test', dataTypeID: 23 }],
    command: 'SELECT',
    rowCount: 1,
    ...overrides
  })
}

// Export for use in tests (not needed, testUtils is attached to global)
