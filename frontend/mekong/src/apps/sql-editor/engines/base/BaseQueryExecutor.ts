/**
 * Base Query Executor Implementation
 * 
 * Abstract base class for executing database queries.
 * Provides common query execution patterns and result processing.
 */

import { QueryExecutor, ExecutionOptions, QueryResult, ValidationResult, ColumnDefinition } from './interfaces'
import { DatabaseEngine } from '../../types/connections'
import { BaseConnectionManager } from './BaseConnectionManager'

/**
 * Abstract base query executor
 */
export abstract class BaseQueryExecutor implements QueryExecutor {
  protected connectionManager: BaseConnectionManager
  protected activeExecutions: Map<string, any> = new Map()

  constructor(connectionManager: BaseConnectionManager) {
    this.connectionManager = connectionManager
  }

  public abstract readonly engine: DatabaseEngine

  /**
   * Execute a SQL query
   */
  public async execute(query: string, options: ExecutionOptions = {}): Promise<QueryResult> {
    if (!this.connectionManager.isConnected()) {
      throw new Error('Database connection is not established')
    }

    const executionId = this.generateExecutionId()
    const startTime = Date.now()

    try {
      const client = this.connectionManager.getClient()
      const rawResult = await this.executeQuery(client, query, options, executionId)
      
      const result: QueryResult = {
        executionId,
        success: true,
        columns: this.extractColumns(rawResult),
        rows: this.extractRows(rawResult),
        rowCount: this.getRowCount(rawResult),
        executionTime: Date.now() - startTime,
        metadata: this.extractMetadata(rawResult)
      }

      this.activeExecutions.delete(executionId)
      return result

    } catch (error) {
      this.activeExecutions.delete(executionId)
      
      return {
        executionId,
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown execution error'
      }
    }
  }

  /**
   * Cancel a running query execution
   */
  public async cancel(executionId: string): Promise<boolean> {
    const execution = this.activeExecutions.get(executionId)
    if (!execution) {
      return false
    }

    try {
      await this.cancelExecution(execution)
      this.activeExecutions.delete(executionId)
      return true
    } catch (error) {
      console.warn(`Failed to cancel execution ${executionId}:`, error)
      return false
    }
  }

  /**
   * Validate a SQL query
   */
  public async validateQuery(query: string): Promise<ValidationResult> {
    try {
      // Basic validation - can be overridden in subclasses
      const errors = this.performBasicValidation(query)
      const warnings = this.performBasicWarningCheck(query)

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          line: 1,
          column: 1,
          message: error instanceof Error ? error.message : 'Validation error',
          severity: 'error'
        }],
        warnings: []
      }
    }
  }

  /**
   * Engine-specific query execution
   */
  protected abstract executeQuery(
    client: any, 
    query: string, 
    options: ExecutionOptions, 
    executionId: string
  ): Promise<any>

  /**
   * Engine-specific query cancellation
   */
  protected abstract cancelExecution(execution: any): Promise<void>

  /**
   * Extract column definitions from raw result
   */
  protected abstract extractColumns(rawResult: any): ColumnDefinition[]

  /**
   * Extract data rows from raw result
   */
  protected abstract extractRows(rawResult: any): any[][]

  /**
   * Get row count from raw result
   */
  protected abstract getRowCount(rawResult: any): number

  /**
   * Extract metadata from raw result
   */
  protected extractMetadata(rawResult: any): Record<string, any> {
    return {}
  }

  /**
   * Generate unique execution ID
   */
  protected generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Perform basic SQL validation
   */
  protected performBasicValidation(query: string): any[] {
    const errors: any[] = []
    
    // Check for empty query
    if (!query.trim()) {
      errors.push({
        line: 1,
        column: 1,
        message: 'Query cannot be empty',
        severity: 'error'
      })
    }

    // Check for common SQL injection patterns (basic)
    const suspiciousPatterns = [
      /--\s*$/m,  // SQL comments at end of line
      /\/\*.*\*\//s,  // SQL block comments
    ]

    // Note: In a real implementation, you'd want more sophisticated validation
    
    return errors
  }

  /**
   * Perform basic warning checks
   */
  protected performBasicWarningCheck(query: string): any[] {
    const warnings: any[] = []
    
    // Check for SELECT * usage
    if (/SELECT\s+\*\s+FROM/i.test(query)) {
      warnings.push({
        line: 1,
        column: 1,
        message: 'Consider specifying column names instead of using SELECT *',
        suggestion: 'Use explicit column names for better performance and clarity'
      })
    }

    return warnings
  }
}