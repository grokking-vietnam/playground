/**
 * Query Routes
 * 
 * API endpoints for SQL query execution, cancellation, and management.
 */

import express from 'express'
import { body, param, validationResult } from 'express-validator'
import { databaseService } from '../services/DatabaseService.js'

const router = express.Router()

/**
 * POST /api/query/execute
 * Execute a SQL query against a database connection
 */
router.post('/execute', [
  body('query').notEmpty().withMessage('Query is required'),
  body('connectionId').notEmpty().withMessage('Connection ID is required'),
  body('connection').isObject().withMessage('Connection configuration is required'),
  body('connection.host').notEmpty().withMessage('Database host is required'),
  body('connection.port').isInt({ min: 1, max: 65535 }).withMessage('Valid port is required'),
  body('connection.database').notEmpty().withMessage('Database name is required'),
  body('connection.username').notEmpty().withMessage('Username is required'),
  body('connection.password').notEmpty().withMessage('Password is required'),
  body('options.timeout').optional().isInt({ min: 1000, max: 300000 }),
  body('options.maxRows').optional().isInt({ min: 1, max: 50000 })
], async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { query, connectionId, connection, options = {} } = req.body

    console.log(`📊 Executing query for connection ${connectionId}: ${query.substring(0, 100)}...`)

    // Execute query
    const result = await databaseService.executeQuery(
      connectionId,
      connection,
      query,
      options
    )

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/query/cancel
 * Cancel a running query
 */
router.post('/cancel', [
  body('queryId').notEmpty().withMessage('Query ID is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { queryId } = req.body
    const cancelled = await databaseService.cancelQuery(queryId)

    res.json({
      success: true,
      cancelled,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/query/validate
 * Validate SQL query syntax (basic validation)
 */
router.post('/validate', [
  body('query').notEmpty().withMessage('Query is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { query } = req.body

    try {
      // Basic validation using the database service
      databaseService.validateQuery(query)
      
      res.json({
        success: true,
        valid: true,
        message: 'Query syntax appears valid',
        timestamp: new Date().toISOString()
      })
    } catch (validationError) {
      res.json({
        success: true,
        valid: false,
        error: validationError.message,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    next(error)
  }
})

export { router as queryRouter }
