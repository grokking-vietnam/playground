/**
 * Request Logger Middleware
 * 
 * Logs HTTP requests for debugging and monitoring purposes
 */

/**
 * Simple request logger middleware
 */
export function requestLogger(req, res, next) {
  const start = Date.now()
  const { method, url, ip } = req
  
  // Log request start
  console.log(`[${new Date().toISOString()}] ${method} ${url} - ${ip}`)
  
  // Log request completion
  res.on('finish', () => {
    const duration = Date.now() - start
    const { statusCode } = res
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${statusCode} ${duration}ms`)
  })
  
  next()
}
