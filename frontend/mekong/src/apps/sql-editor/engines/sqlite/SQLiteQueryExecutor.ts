/**
 * SQLite Query Executor
 * 
 * Executes SQL queries against SQLite databases using the better-sqlite3 library.
 * Extends BaseQueryExecutor to provide SQLite-specific functionality.
 */

import Database from 'better-sqlite3'
import { BaseQueryExecutor } from '../base/BaseQueryExecutor'
import { ExecutionOptions, QueryResult, ColumnDefinition } from '../base/interfaces'
import { DatabaseEngine } from '../../types/connections'
import { SQLiteConnectionManager } from './SQLiteConnectionManager'

/**
 * SQLite-specific query executor
 */
export class SQLiteQueryExecutor extends BaseQueryExecutor {
  public readonly engine = DatabaseEngine.SQLITE

  constructor(connectionManager: SQLiteConnectionManager) {
    super(connectionManager)
  }

  /**
   * Execute SQLite query
   */
  protected async executeQuery(
    client: Database.Database,
    query: string,
    options: ExecutionOptions,
    executionId: string
  ): Promise<any> {
    // Store execution for potential cancellation
    this.activeExecutions.set(executionId, client)

    try {
      // SQLite is synchronous, so we'll simulate async behavior
      const trimmedQuery = query.trim().toLowerCase()
      
      if (trimmedQuery.startsWith('select') || trimmedQuery.startsWith('with')) {
        // For SELECT queries, use prepare and all
        const stmt = client.prepare(query)
        const rows = stmt.all()
        
        // Get column info from the statement
        const columns = stmt.columns()
        
        return {
          rows,
          columns,
          changes: 0,
          lastInsertRowid: null
        }
      } else {
        // For INSERT, UPDATE, DELETE, use prepare and run
        const stmt = client.prepare(query)
        const info = stmt.run()
        
        return {
          rows: [],
          columns: [],
          changes: info.changes,
          lastInsertRowid: info.lastInsertRowid
        }
      }
    } finally {
      this.activeExecutions.delete(executionId)
    }
  }

  /**
   * Cancel SQLite query execution
   */
  protected async cancelExecution(client: Database.Database): Promise<void> {
    // SQLite queries are generally fast and can't be easily cancelled
    // In a real implementation, you might close the database connection
    console.warn('SQLite query cancellation not supported - queries are synchronous')
  }

  /**
   * Extract column definitions from SQLite result
   */
  protected extractColumns(rawResult: any): ColumnDefinition[] {
    if (!rawResult.columns || !Array.isArray(rawResult.columns)) {
      return []
    }

    return rawResult.columns.map((column: any) => ({
      name: column.name || '',
      type: this.mapSQLiteType(column.type),
      nullable: true, // SQLite doesn't provide this info easily
      maxLength: undefined
    }))
  }

  /**
   * Extract data rows from SQLite result
   */
  protected extractRows(rawResult: any): any[][] {
    if (!rawResult.rows || !Array.isArray(rawResult.rows)) {
      return []
    }

    if (!rawResult.columns) {
      return []
    }

    return rawResult.rows.map((row: any) => 
      rawResult.columns.map((column: any) => row[column.name])
    )
  }

  /**
   * Get row count from SQLite result
   */
  protected getRowCount(rawResult: any): number {
    if (rawResult.rows && Array.isArray(rawResult.rows)) {
      return rawResult.rows.length
    }
    return rawResult.changes || 0
  }

  /**
   * Extract metadata from SQLite result
   */
  protected extractMetadata(rawResult: any): Record<string, any> {
    return {
      changes: rawResult.changes || 0,
      lastInsertRowid: rawResult.lastInsertRowid || null,
      columns: rawResult.columns?.length || 0
    }
  }

  /**
   * Map SQLite data types to human-readable names
   */
  private mapSQLiteType(type?: string): string {
    if (!type) return 'ANY'
    
    const upperType = type.toUpperCase()
    
    // SQLite has a flexible type system
    if (upperType.includes('INT')) return 'INTEGER'
    if (upperType.includes('CHAR') || upperType.includes('TEXT') || upperType.includes('CLOB')) return 'TEXT'
    if (upperType.includes('BLOB')) return 'BLOB'
    if (upperType.includes('REAL') || upperType.includes('FLOA') || upperType.includes('DOUB')) return 'REAL'
    if (upperType.includes('NUMERIC') || upperType.includes('DECIMAL')) return 'NUMERIC'
    if (upperType.includes('DATE') || upperType.includes('TIME')) return 'TEXT' // SQLite stores dates as text
    if (upperType.includes('BOOL')) return 'INTEGER' // SQLite stores booleans as integers
    
    return type
  }

  /**
   * Perform SQLite-specific query validation
   */
  public async validateQuery(query: string): Promise<any> {
    const baseValidation = await super.validateQuery(query)
    
    // Add SQLite-specific validation
    const sqliteSpecificErrors: any[] = []
    
    // Check for SQLite-specific issues
    if (query.includes('AUTO_INCREMENT')) {
      sqliteSpecificErrors.push({
        line: 1,
        column: 1,
        message: 'Use AUTOINCREMENT instead of AUTO_INCREMENT in SQLite',
        severity: 'error'
      })
    }

    // Check for unsupported features
    if (query.includes('RIGHT JOIN')) {
      sqliteSpecificErrors.push({
        line: 1,
        column: 1,
        message: 'RIGHT JOIN is not supported in SQLite',
        severity: 'error'
      })
    }

    if (query.includes('FULL JOIN') || query.includes('FULL OUTER JOIN')) {
      sqliteSpecificErrors.push({
        line: 1,
        column: 1,
        message: 'FULL OUTER JOIN is not supported in SQLite',
        severity: 'error'
      })
    }

    return {
      ...baseValidation,
      errors: [...baseValidation.errors, ...sqliteSpecificErrors]
    }
  }

  /**
   * Execute multiple statements (SQLite transaction)
   */
  public async executeTransaction(queries: string[]): Promise<QueryResult[]> {
    if (!this.connectionManager.isConnected()) {
      throw new Error('Database connection is not established')
    }

    const client = this.connectionManager.getClient() as Database.Database
    const results: QueryResult[] = []

    const transaction = client.transaction(() => {
      for (const query of queries) {
        const executionId = this.generateExecutionId()
        const startTime = Date.now()
        
        try {
          const rawResult = this.executeQuerySync(client, query, executionId)
          
          results.push({
            executionId,
            success: true,
            columns: this.extractColumns(rawResult),
            rows: this.extractRows(rawResult),
            rowCount: this.getRowCount(rawResult),
            executionTime: Date.now() - startTime,
            metadata: this.extractMetadata(rawResult)
          })
        } catch (error) {
          throw error // This will rollback the transaction
        }
      }
    })

    try {
      transaction()
      return results
    } catch (error) {
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Execute query synchronously (helper method)
   */
  private executeQuerySync(client: Database.Database, query: string, executionId: string): any {
    const trimmedQuery = query.trim().toLowerCase()
    
    if (trimmedQuery.startsWith('select') || trimmedQuery.startsWith('with')) {
      const stmt = client.prepare(query)
      const rows = stmt.all()
      const columns = stmt.columns()
      
      return { rows, columns, changes: 0, lastInsertRowid: null }
    } else {
      const stmt = client.prepare(query)
      const info = stmt.run()
      
      return { rows: [], columns: [], changes: info.changes, lastInsertRowid: info.lastInsertRowid }
    }
  }
}