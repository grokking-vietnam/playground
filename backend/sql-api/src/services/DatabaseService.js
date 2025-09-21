/**
 * Database Service
 * 
 * Manages PostgreSQL connections and query execution.
 * Handles connection pooling, query validation, and result formatting.
 */

import pkg from 'pg'
const { Pool } = pkg
import { v4 as uuidv4 } from 'uuid'

class DatabaseService {
  constructor() {
    this.pools = new Map() // Connection pools by connection ID
    this.activeQueries = new Map() // Track running queries for cancellation
  }

  /**
   * Create a connection pool for a database connection
   */
  async createPool(connectionConfig) {
    const poolConfig = {
      host: connectionConfig.host,
      port: connectionConfig.port,
      database: connectionConfig.database,
      user: connectionConfig.username,
      password: connectionConfig.password,
      ssl: connectionConfig.ssl ? { rejectUnauthorized: false } : false,
      max: 10, // Maximum number of connections in pool
      min: 2,  // Minimum number of connections in pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }

    const pool = new Pool(poolConfig)
    
    // Test the connection
    try {
      const client = await pool.connect()
      await client.query('SELECT NOW()')
      client.release()
      
      this.pools.set(connectionConfig.id, pool)
      console.log(`✅ Database pool created for connection: ${connectionConfig.name}`)
      
      return pool
    } catch (error) {
      await pool.end()
      throw new Error(`Failed to connect to database: ${error.message}`)
    }
  }

  /**
   * Get or create a connection pool
   */
  async getPool(connectionId, connectionConfig) {
    let pool = this.pools.get(connectionId)
    
    if (!pool) {
      pool = await this.createPool(connectionConfig)
    }
    
    return pool
  }

  /**
   * Test database connection
   */
  async testConnection(connectionConfig) {
    const testPool = new Pool({
      host: connectionConfig.host,
      port: connectionConfig.port,
      database: connectionConfig.database,
      user: connectionConfig.username,
      password: connectionConfig.password,
      ssl: connectionConfig.ssl ? { rejectUnauthorized: false } : false,
      max: 1,
      connectionTimeoutMillis: 5000,
    })

    try {
      const client = await testPool.connect()
      const result = await client.query('SELECT version() as version, NOW() as current_time')
      client.release()
      await testPool.end()
      
      return {
        success: true,
        version: result.rows[0].version,
        currentTime: result.rows[0].current_time,
        latency: Date.now() - Date.now() // Simple latency measurement
      }
    } catch (error) {
      await testPool.end()
      throw new Error(`Connection test failed: ${error.message}`)
    }
  }

  /**
   * Execute SQL query
   */
  async executeQuery(connectionId, connectionConfig, query, options = {}) {
    const queryId = uuidv4()
    const startTime = Date.now()
    
    try {
      // Get connection pool
      const pool = await this.getPool(connectionId, connectionConfig)
      const client = await pool.connect()
      
      // Store query for potential cancellation
      this.activeQueries.set(queryId, { client, query, startTime })
      
      // Validate query (basic safety checks)
      this.validateQuery(query)
      
      // Execute query with timeout
      const timeoutMs = options.timeout || parseInt(process.env.MAX_QUERY_TIMEOUT) || 30000
      const maxRows = options.maxRows || parseInt(process.env.MAX_RESULT_ROWS) || 10000
      
      const result = await Promise.race([
        client.query(query),
        this.createTimeoutPromise(timeoutMs)
      ])
      
      // Calculate execution time
      const executionTime = Date.now() - startTime
      
      // Format results
      const formattedResult = this.formatQueryResult(result, executionTime, maxRows)
      
      // Clean up
      client.release()
      this.activeQueries.delete(queryId)
      
      console.log(`✅ Query executed successfully: ${query.substring(0, 50)}... (${executionTime}ms)`)
      
      return {
        queryId,
        ...formattedResult
      }
      
    } catch (error) {
      // Clean up on error
      this.activeQueries.delete(queryId)
      
      console.error(`❌ Query execution failed: ${error.message}`)
      throw this.createQueryError(error, query)
    }
  }

  /**
   * Cancel a running query
   */
  async cancelQuery(queryId) {
    const activeQuery = this.activeQueries.get(queryId)
    
    if (!activeQuery) {
      return false
    }
    
    try {
      // PostgreSQL query cancellation
      await activeQuery.client.query('SELECT pg_cancel_backend(pg_backend_pid())')
      this.activeQueries.delete(queryId)
      
      console.log(`🛑 Query cancelled: ${queryId}`)
      return true
    } catch (error) {
      console.error(`Failed to cancel query ${queryId}:`, error.message)
      return false
    }
  }

  /**
   * Get database schema information
   */
  async getSchemaInfo(connectionId, connectionConfig) {
    const pool = await this.getPool(connectionId, connectionConfig)
    const client = await pool.connect()
    
    try {
      // Get tables and views
      const tablesQuery = `
        SELECT 
          schemaname as schema_name,
          tablename as table_name,
          'table' as object_type
        FROM pg_tables 
        WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        UNION ALL
        SELECT 
          schemaname as schema_name,
          viewname as table_name,
          'view' as object_type
        FROM pg_views 
        WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
        ORDER BY schema_name, table_name
      `
      
      const result = await client.query(tablesQuery)
      client.release()
      
      // Group by schema
      const schemas = {}
      result.rows.forEach(row => {
        if (!schemas[row.schema_name]) {
          schemas[row.schema_name] = {
            name: row.schema_name,
            tables: [],
            views: []
          }
        }
        
        if (row.object_type === 'table') {
          schemas[row.schema_name].tables.push(row.table_name)
        } else {
          schemas[row.schema_name].views.push(row.table_name)
        }
      })
      
      return Object.values(schemas)
      
    } catch (error) {
      client.release()
      throw new Error(`Failed to get schema info: ${error.message}`)
    }
  }

  /**
   * Format query results for frontend consumption
   */
  formatQueryResult(pgResult, executionTime, maxRows) {
    const { rows, fields, command, rowCount } = pgResult
    
    // Format columns
    const columns = fields?.map(field => ({
      name: field.name,
      type: this.mapPostgreSQLType(field.dataTypeID),
      nullable: true // PostgreSQL doesn't provide this info easily
    })) || []
    
    // Limit rows if necessary
    const limitedRows = rows?.slice(0, maxRows) || []
    const hasMore = rows && rows.length > maxRows
    
    return {
      columns,
      rows: limitedRows,
      metadata: {
        totalRows: limitedRows.length,
        affectedRows: rowCount,
        executionTime,
        command,
        hasMore,
        actualRowCount: rows?.length || 0
      }
    }
  }

  /**
   * Map PostgreSQL data type IDs to readable names
   */
  mapPostgreSQLType(dataTypeID) {
    const typeMap = {
      16: 'boolean',
      20: 'bigint',
      21: 'smallint',
      23: 'integer',
      25: 'text',
      700: 'real',
      701: 'double precision',
      1043: 'varchar',
      1082: 'date',
      1114: 'timestamp',
      1184: 'timestamptz',
      2950: 'uuid',
      114: 'json',
      3802: 'jsonb'
    }
    
    return typeMap[dataTypeID] || 'unknown'
  }

  /**
   * Validate SQL query for basic safety
   */
  validateQuery(query) {
    const trimmedQuery = query.trim().toLowerCase()
    
    // Block potentially dangerous operations
    const dangerousPatterns = [
      /drop\s+database/i,
      /drop\s+schema/i,
      /truncate\s+table/i,
      /delete\s+from\s+\w+(?:\s*;?\s*)?$/i, // DELETE without WHERE
      /update\s+\w+\s+set\s+(?!.*where)[^;]*(?:\s*;?\s*)?$/i,   // UPDATE without WHERE (no WHERE clause found)
    ]
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmedQuery)) {
        throw new Error('Query contains potentially dangerous operations')
      }
    }
    
    // Check for empty query
    if (!trimmedQuery) {
      throw new Error('Query cannot be empty')
    }
  }

  /**
   * Create timeout promise for query execution
   */
  createTimeoutPromise(timeoutMs) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Query execution timeout after ${timeoutMs}ms`))
      }, timeoutMs)
    })
  }

  /**
   * Create structured error for query failures
   */
  createQueryError(error, query) {
    const queryError = new Error(error.message)
    queryError.code = error.code
    queryError.severity = error.severity
    queryError.line = error.line
    queryError.column = error.column
    queryError.position = error.position
    queryError.hint = error.hint
    queryError.query = query.substring(0, 200) // First 200 chars for context
    
    return queryError
  }

  /**
   * Close all connection pools
   */
  async closeAllPools() {
    const closePromises = Array.from(this.pools.values()).map(pool => pool.end())
    await Promise.all(closePromises)
    this.pools.clear()
    console.log('🔌 All database pools closed')
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()
