/**
 * Query Routes
 * 
 * API endpoints for SQL query execution, cancellation, and management.
 */

import express from 'express'
import { validateSchema, sanitizeRequest } from '../middleware/validation.js'
import { 
  queryExecuteRequestSchema, 
  queryCancelRequestSchema, 
  queryValidateRequestSchema 
} from '../schemas/index.js'
import { queryController } from '../controllers/QueryController.js'

const router = express.Router()

/**
 * POST /api/query/execute
 * Execute a SQL query against a database connection
 */
router.post('/execute', [
  sanitizeRequest,
  validateSchema(queryExecuteRequestSchema)
], queryController.executeQuery.bind(queryController))

/**
 * POST /api/query/cancel
 * Cancel a running query
 */
router.post('/cancel', [
  sanitizeRequest,
  validateSchema(queryCancelRequestSchema)
], queryController.cancelQuery.bind(queryController))

/**
 * POST /api/query/validate
 * Validate SQL query syntax (basic validation)
 */
router.post('/validate', [
  sanitizeRequest,
  validateSchema(queryValidateRequestSchema)
], queryController.validateQuery.bind(queryController))

/**
 * GET /api/query/active
 * Get list of currently active queries
 */
router.get('/active', queryController.getActiveQueries.bind(queryController))

export { router as queryRouter }
