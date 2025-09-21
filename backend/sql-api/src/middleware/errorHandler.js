/**
 * Error Handler Middleware
 * 
 * Centralized error handling for the API server.
 */

export const errorHandler = (error, req, res, next) => {
  console.error('🚨 API Error:', error)

  // Default error response
  let statusCode = 500
  let errorResponse = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400
    errorResponse.error = 'Validation Error'
    errorResponse.message = error.message
  } else if (error.code === 'ECONNREFUSED') {
    statusCode = 503
    errorResponse.error = 'Database Connection Failed'
    errorResponse.message = 'Unable to connect to the database server'
  } else if (error.code?.startsWith('28')) { // PostgreSQL authentication errors
    statusCode = 401
    errorResponse.error = 'Authentication Failed'
    errorResponse.message = 'Invalid database credentials'
  } else if (error.code?.startsWith('42')) { // PostgreSQL syntax errors
    statusCode = 400
    errorResponse.error = 'SQL Syntax Error'
    errorResponse.message = error.message
    errorResponse.details = {
      line: error.line,
      column: error.column,
      position: error.position,
      hint: error.hint
    }
  } else if (error.message) {
    errorResponse.message = error.message
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    delete errorResponse.stack
  } else {
    errorResponse.stack = error.stack
  }

  res.status(statusCode).json(errorResponse)
}

export const requestLogger = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const { method, originalUrl } = req
    const { statusCode } = res
    
    console.log(`${method} ${originalUrl} ${statusCode} - ${duration}ms`)
  })
  
  next()
}
