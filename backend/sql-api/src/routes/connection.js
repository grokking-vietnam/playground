/**
 * Connection Routes
 * 
 * API endpoints for database connection testing and schema information.
 */

import express from 'express'
import { body, validationResult } from 'express-validator'
import { databaseService } from '../services/DatabaseService.js'

const router = express.Router()

/**
 * POST /api/connection/test
 * Test database connection
 */
router.post('/test', [
  body('host').notEmpty().withMessage('Database host is required'),
  body('port').isInt({ min: 1, max: 65535 }).withMessage('Valid port is required'),
  body('database').notEmpty().withMessage('Database name is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('ssl').optional().isBoolean()
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

    const connectionConfig = req.body

    console.log(`🔍 Testing connection to ${connectionConfig.host}:${connectionConfig.port}/${connectionConfig.database}`)

    // Test connection
    const testResult = await databaseService.testConnection(connectionConfig)

    res.json({
      success: true,
      data: testResult,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    // Connection test failures should return 200 with success: false
    res.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/connection/schema
 * Get database schema information
 */
router.post('/schema', [
  body('connectionId').notEmpty().withMessage('Connection ID is required'),
  body('connection').isObject().withMessage('Connection configuration is required'),
  body('connection.host').notEmpty().withMessage('Database host is required'),
  body('connection.port').isInt({ min: 1, max: 65535 }).withMessage('Valid port is required'),
  body('connection.database').notEmpty().withMessage('Database name is required'),
  body('connection.username').notEmpty().withMessage('Username is required'),
  body('connection.password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { connectionId, connection } = req.body

    console.log(`🗂️  Getting schema info for connection ${connectionId}`)

    // Get schema information
    const schemaInfo = await databaseService.getSchemaInfo(connectionId, connection)

    res.json({
      success: true,
      data: schemaInfo,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    next(error)
  }
})

export { router as connectionRouter }
