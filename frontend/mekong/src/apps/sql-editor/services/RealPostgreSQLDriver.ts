/**
 * Real PostgreSQL Database Driver
 * 
 * Implements actual database connection and query execution via backend API.
 * Replaces the mock implementation with real PostgreSQL connectivity.
 */

import type { 
  DatabaseConnection, 
  QueryResult, 
  ColumnDefinition,
  ExecutionOptions,
  QueryError
} from '../types'

/**
 * Get environment variable safely in browser environment
 */
function getEnvVar(name: string, defaultValue: string): string {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Try to get from window object (set by build process)
    const windowEnv = (window as any)[name]
    if (windowEnv) return windowEnv
    
    // Fallback to default
    return defaultValue
  }
  
  // In Node.js environment (shouldn't happen in browser bundle)
  return defaultValue
}

/**
 * Configuration for the backend API
 */
const API_CONFIG = {
  baseUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:3001/api'),
  timeout: 30000
}

/**
 * Real PostgreSQL driver for actual query execution
 */
export class RealPostgreSQLDriver {
  private connection: DatabaseConnection | null = null
  private isConnected = false

  /**
   * Connect to PostgreSQL database via backend API
   */
  async connect(connection: DatabaseConnection): Promise<void> {
    try {
      console.log(`[RealPostgreSQL] Connecting to ${connection.host}:${connection.port}/${connection.database}`)
      
      // Test connection via backend API
      const response = await this.apiCall('/connection/test', {
        method: 'POST',
        body: JSON.stringify({
          host: connection.host,
          port: connection.port,
          database: connection.database,
          username: connection.username,
          password: connection.password,
          ssl: connection.ssl
        })
      })

      if (!response.success) {
        throw new Error(response.error || 'Connection test failed')
      }

      // Store connection for reference
      this.connection = connection
      this.isConnected = true
      
      console.log(`[RealPostgreSQL] Connected successfully to ${connection.name}`)
      console.log(`[RealPostgreSQL] Database version: ${response.data.version}`)
      
    } catch (error) {
      this.isConnected = false
      throw new Error(`Failed to connect to PostgreSQL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    this.connection = null
    this.isConnected = false
    console.log('[RealPostgreSQL] Disconnected')
  }

  /**
   * Execute SQL query via backend API
   */
  async execute(query: string, options?: ExecutionOptions): Promise<QueryResult> {
    if (!this.isConnected || !this.connection) {
      throw new Error('Not connected to database')
    }

    try {
      console.log(`[RealPostgreSQL] Executing query: ${query.substring(0, 100)}...`)
      
      const response = await this.apiCall('/query/execute', {
        method: 'POST',
        body: JSON.stringify({
          query,
          connectionId: this.connection.id,
          connection: {
            host: this.connection.host,
            port: this.connection.port,
            database: this.connection.database,
            username: this.connection.username,
            password: this.connection.password,
            ssl: this.connection.ssl
          },
          options: {
            timeout: options?.timeout || 30000,
            maxRows: options?.maxRows || 10000
          }
        })
      })

      if (!response.success) {
        throw this.createQueryErrorFromResponse(response, query)
      }

      const result = response.data
      
      console.log(`[RealPostgreSQL] Query executed successfully: ${result.metadata.totalRows} rows, ${result.metadata.executionTime}ms`)
      
      return {
        columns: result.columns,
        rows: result.rows,
        metadata: {
          totalRows: result.metadata.totalRows,
          affectedRows: result.metadata.affectedRows,
          executionTime: result.metadata.executionTime,
          notices: result.metadata.notices || []
        },
        hasMore: result.metadata.hasMore || false,
        totalRows: result.metadata.totalRows
      }
      
    } catch (error) {
      console.error(`[RealPostgreSQL] Query execution failed:`, error)
      throw error
    }
  }

  /**
   * Cancel running query
   */
  async cancel(executionId: string): Promise<boolean> {
    try {
      const response = await this.apiCall('/query/cancel', {
        method: 'POST',
        body: JSON.stringify({ queryId: executionId })
      })
      
      return response.success && response.cancelled
    } catch (error) {
      console.error(`[RealPostgreSQL] Failed to cancel query:`, error)
      return false
    }
  }

  /**
   * Test connection without storing it
   */
  async testConnection(connection: DatabaseConnection): Promise<boolean> {
    try {
      const response = await this.apiCall('/connection/test', {
        method: 'POST',
        body: JSON.stringify({
          host: connection.host,
          port: connection.port,
          database: connection.database,
          username: connection.username,
          password: connection.password,
          ssl: connection.ssl
        })
      })

      return response.success
    } catch (error) {
      console.error(`[RealPostgreSQL] Connection test failed:`, error)
      return false
    }
  }

  /**
   * Check if connection is active
   */
  isConnectionActive(): boolean {
    return this.isConnected && this.connection !== null
  }

  /**
   * Get database schema information
   */
  async getSchemaInfo(): Promise<any> {
    if (!this.isConnected || !this.connection) {
      throw new Error('Not connected to database')
    }

    try {
      const response = await this.apiCall('/connection/schema', {
        method: 'POST',
        body: JSON.stringify({
          connectionId: this.connection.id,
          connection: {
            host: this.connection.host,
            port: this.connection.port,
            database: this.connection.database,
            username: this.connection.username,
            password: this.connection.password,
            ssl: this.connection.ssl
          }
        })
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to get schema information')
      }

      return response.data
    } catch (error) {
      console.error(`[RealPostgreSQL] Failed to get schema info:`, error)
      throw error
    }
  }

  /**
   * Make API call to backend server
   */
  private async apiCall(endpoint: string, options: RequestInit): Promise<any> {
    const url = `${API_CONFIG.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: AbortSignal.timeout(API_CONFIG.timeout)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Create a structured query error from API response
   */
  private createQueryErrorFromResponse(response: any, query: string): QueryError {
    const error = response.error || response.message || 'Query execution failed'
    
    return {
      message: error,
      code: response.code,
      severity: response.severity || 'error',
      line: response.details?.line,
      column: response.details?.column,
      position: response.details?.position,
      hint: response.details?.hint,
      context: query.substring(0, 100)
    } as QueryError
  }

  /**
   * Validate query before execution (client-side basic validation)
   */
  private validateQuery(query: string): void {
    const trimmedQuery = query.trim()
    
    if (!trimmedQuery) {
      throw new Error('Query cannot be empty')
    }
    
    // Basic length check
    if (trimmedQuery.length > 50000) {
      throw new Error('Query is too long (maximum 50,000 characters)')
    }
  }
}
