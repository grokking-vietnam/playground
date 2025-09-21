/**
 * Query Executor Service
 * 
 * Main service for executing SQL queries against database connections.
 * Manages execution lifecycle, status tracking, and result processing.
 */

import type { 
  DatabaseConnection,
  QueryExecution,
  QueryResult,
  ExecutionOptions,
  QueryError
} from '../types'

import {
  ExecutionStatus,
  ExecutionPriority,
  ExecutionMode,
  DEFAULT_EXECUTION_OPTIONS
} from '../types'

import { RealPostgreSQLDriver } from './RealPostgreSQLDriver'
import { encryptionService, EncryptedData } from './EncryptionService'

/**
 * Generate unique execution ID
 */
function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Query Executor Service
 */
export class QueryExecutor {
  private static instance: QueryExecutor
  private executions = new Map<string, QueryExecution>()
  private drivers = new Map<string, RealPostgreSQLDriver>()
  private executionListeners = new Set<(execution: QueryExecution) => void>()

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): QueryExecutor {
    if (!QueryExecutor.instance) {
      QueryExecutor.instance = new QueryExecutor()
    }
    return QueryExecutor.instance
  }

  /**
   * Execute a SQL query against a database connection
   */
  async executeQuery(
    query: string,
    connectionId: string,
    connection: DatabaseConnection,
    options?: ExecutionOptions
  ): Promise<string> {
    const executionId = generateExecutionId()
    const mergedOptions = { ...DEFAULT_EXECUTION_OPTIONS, ...options }
    
    // Create execution record
    const execution: QueryExecution = {
      id: executionId,
      query: query.trim(),
      connectionId,
      status: ExecutionStatus.PENDING,
      startTime: new Date(),
      metadata: {
        priority: mergedOptions.priority,
        mode: mergedOptions.mode,
        queryHash: this.hashQuery(query)
      }
    }

    // Store and notify
    this.executions.set(executionId, execution)
    this.notifyExecutionListeners(execution)

    // Start execution asynchronously
    this.executeAsync(execution, connection, mergedOptions).catch(error => {
      console.error('Async execution failed:', error)
    })

    return executionId
  }

  /**
   * Cancel a running query execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId)
    if (!execution) {
      return false
    }

    if (execution.status !== ExecutionStatus.RUNNING) {
      return false
    }

    try {
      // Get driver and cancel
      const driver = this.drivers.get(execution.connectionId)
      if (driver) {
        await driver.cancel(executionId)
      }

      // Update execution status
      this.updateExecution(executionId, {
        status: ExecutionStatus.CANCELLED,
        endTime: new Date()
      })

      return true
    } catch (error) {
      console.error('Failed to cancel execution:', error)
      return false
    }
  }

  /**
   * Get execution details
   */
  async getExecution(executionId: string): Promise<QueryExecution | null> {
    return this.executions.get(executionId) || null
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(connectionId?: string): Promise<QueryExecution[]> {
    const executions = Array.from(this.executions.values())
    
    if (connectionId) {
      return executions.filter(exec => exec.connectionId === connectionId)
    }
    
    return executions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
  }

  /**
   * Subscribe to execution updates
   */
  onExecutionUpdate(callback: (execution: QueryExecution) => void): () => void {
    this.executionListeners.add(callback)
    
    return () => {
      this.executionListeners.delete(callback)
    }
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executions.clear()
  }

  /**
   * Get active executions (running or pending)
   */
  getActiveExecutions(): QueryExecution[] {
    return Array.from(this.executions.values())
      .filter(exec => 
        exec.status === ExecutionStatus.RUNNING || 
        exec.status === ExecutionStatus.PENDING
      )
  }

  /**
   * Execute query asynchronously
   */
  private async executeAsync(execution: QueryExecution, connection: DatabaseConnection, options: ExecutionOptions): Promise<void> {
    try {
      // Update to running status
      this.updateExecution(execution.id, {
        status: ExecutionStatus.RUNNING
      })

      // Get or create driver for connection
      const driver = await this.getDriver(execution.connectionId, connection)
      if (!driver) {
        throw new Error(`No driver available for connection ${execution.connectionId}`)
      }

      // Execute query with timeout
      const results = await this.executeWithTimeout(
        () => driver.execute(execution.query, options),
        options.timeout || 30000
      )

      // Calculate duration
      const duration = Date.now() - execution.startTime.getTime()

      // Update execution with results
      this.updateExecution(execution.id, {
        status: ExecutionStatus.COMPLETED,
        endTime: new Date(),
        duration,
        rowCount: results.metadata.totalRows,
        results
      })

    } catch (error) {
      const duration = Date.now() - execution.startTime.getTime()
      
      // Determine if this was a timeout
      const isTimeout = error instanceof Error && error.message.includes('timeout')
      
      this.updateExecution(execution.id, {
        status: isTimeout ? ExecutionStatus.TIMEOUT : ExecutionStatus.FAILED,
        endTime: new Date(),
        duration,
        error: this.normalizeError(error)
      })
    }
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Query execution timeout after ${timeoutMs}ms`))
      }, timeoutMs)

      operation()
        .then(result => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timer)
          reject(error)
        })
    })
  }

  /**
   * Get or create database driver
   */
  private async getDriver(connectionId: string, connection: DatabaseConnection): Promise<RealPostgreSQLDriver | null> {
    // Check if driver already exists
    let driver = this.drivers.get(connectionId)
    if (driver && driver.isConnectionActive()) {
      return driver
    }

    // Create new driver and connect
    try {
      // Decrypt password if needed
      let decryptedConnection = { ...connection }
      if (encryptionService.isInitialized()) {
        try {
          const encryptedData: EncryptedData = JSON.parse(connection.password)
          decryptedConnection.password = await encryptionService.decrypt(encryptedData)
        } catch (e) {
          // Password might not be encrypted (backward compatibility)
          decryptedConnection.password = connection.password
        }
      }

      driver = new RealPostgreSQLDriver()
      await driver.connect(decryptedConnection)
      
      this.drivers.set(connectionId, driver)
      return driver
    } catch (error) {
      console.error('Failed to create/connect driver:', error)
      return null
    }
  }


  /**
   * Update execution record
   */
  private updateExecution(executionId: string, updates: Partial<QueryExecution>): void {
    const execution = this.executions.get(executionId)
    if (!execution) {
      return
    }

    const updatedExecution = { ...execution, ...updates }
    this.executions.set(executionId, updatedExecution)
    this.notifyExecutionListeners(updatedExecution)
  }

  /**
   * Notify execution listeners
   */
  private notifyExecutionListeners(execution: QueryExecution): void {
    this.executionListeners.forEach(callback => {
      try {
        callback(execution)
      } catch (error) {
        console.error('Error in execution listener:', error)
      }
    })
  }

  /**
   * Create query hash for caching
   */
  private hashQuery(query: string): string {
    // Simple hash function - in production, use a proper hash library
    let hash = 0
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  /**
   * Normalize error to QueryError format
   */
  private normalizeError(error: unknown): QueryError {
    if (error && typeof error === 'object' && 'code' in error) {
      return error as QueryError
    }

    const message = error instanceof Error ? error.message : 'Unknown error'
    
    return {
      code: 'EXEC_ERROR',
      message,
      severity: 'error',
      context: 'Query execution failed'
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    // Disconnect all drivers
    for (const driver of this.drivers.values()) {
      try {
        await driver.disconnect()
      } catch (error) {
        console.error('Error disconnecting driver:', error)
      }
    }
    
    this.drivers.clear()
    this.executionListeners.clear()
  }
}

// Export singleton instance
export const queryExecutor = QueryExecutor.getInstance()