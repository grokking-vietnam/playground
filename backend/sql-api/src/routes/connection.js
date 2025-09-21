/**
 * Connection Routes
 * 
 * API endpoints for database connection testing and schema information.
 */

import express from 'express'
import { validateSchema, sanitizeRequest } from '../middleware/validation.js'
import { 
  connectionTestRequestSchema, 
  connectionSchemaRequestSchema 
} from '../schemas/index.js'
import { connectionController } from '../controllers/ConnectionController.js'

const router = express.Router()

/**
 * POST /api/connection/test
 * Test database connection
 */
router.post('/test', [
  sanitizeRequest,
  validateSchema(connectionTestRequestSchema)
], connectionController.testConnection.bind(connectionController))

/**
 * POST /api/connection/schema
 * Get database schema information
 */
router.post('/schema', [
  sanitizeRequest,
  validateSchema(connectionSchemaRequestSchema)
], connectionController.getSchemaInfo.bind(connectionController))

/**
 * GET /api/connection/pools
 * Get connection pool status
 */
router.get('/pools', connectionController.getPoolStatus.bind(connectionController))

/**
 * DELETE /api/connection/pools/:connectionId
 * Close specific connection pool
 */
router.delete('/pools/:connectionId', connectionController.closePool.bind(connectionController))

/**
 * POST /api/connection/table/:schema/:table
 * Get detailed table information
 */
router.post('/table/:schema/:table', [
  sanitizeRequest,
  validateSchema(connectionSchemaRequestSchema)
], connectionController.getTableInfo.bind(connectionController))

export { router as connectionRouter }
