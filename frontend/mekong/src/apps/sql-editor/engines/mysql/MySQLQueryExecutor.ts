/**
 * MySQL Query Executor
 * 
 * Executes SQL queries against MySQL databases using the mysql2 library.
 * Extends BaseQueryExecutor to provide MySQL-specific functionality.
 */

import { Connection } from 'mysql2/promise'
import { BaseQueryExecutor } from '../base/BaseQueryExecutor'
import { ExecutionOptions, QueryResult, ColumnDefinition } from '../base/interfaces'
import { DatabaseEngine } from '../../types/connections'
import { MySQLConnectionManager } from './MySQLConnectionManager'

/**
 * MySQL-specific query executor
 */
export class MySQLQueryExecutor extends BaseQueryExecutor {
  public readonly engine = DatabaseEngine.MYSQL

  constructor(connectionManager: MySQLConnectionManager) {
    super(connectionManager)
  }

  /**
   * Execute MySQL query
   */
  protected async executeQuery(
    client: Connection,
    query: string,
    options: ExecutionOptions,
    executionId: string
  ): Promise<any> {
    // Store execution for potential cancellation
    this.activeExecutions.set(executionId, client)

    try {
      // Apply query timeout if specified
      if (options.timeout) {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), options.timeout)
        })

        return await Promise.race([
          client.execute(query),
          timeoutPromise
        ])
      }

      return await client.execute(query)
    } finally {
      this.activeExecutions.delete(executionId)
    }
  }

  /**
   * Cancel MySQL query execution
   */
  protected async cancelExecution(client: Connection): Promise<void> {
    try {
      // MySQL doesn't have a direct way to cancel individual queries
      // We'll close the connection which will cancel the query
      await client.end()
    } catch (error) {
      console.warn('Error canceling MySQL query:', error)
    }
  }

  /**
   * Extract column definitions from MySQL result
   */
  protected extractColumns(rawResult: any): ColumnDefinition[] {
    const [rows, fields] = rawResult
    
    if (!fields || !Array.isArray(fields)) {
      return []
    }

    return fields.map(field => ({
      name: field.name || '',
      type: this.mapMySQLType(field.type, field.columnType),
      nullable: (field.flags & 1) === 0, // NOT_NULL flag
      maxLength: field.length,
      precision: field.decimals
    }))
  }

  /**
   * Extract data rows from MySQL result
   */
  protected extractRows(rawResult: any): any[][] {
    const [rows, fields] = rawResult
    
    if (!rows || !Array.isArray(rows)) {
      return []
    }

    if (!fields) {
      return []
    }

    return rows.map(row => 
      fields.map((field: any) => row[field.name])
    )
  }

  /**
   * Get row count from MySQL result
   */
  protected getRowCount(rawResult: any): number {
    const [rows] = rawResult
    return Array.isArray(rows) ? rows.length : 0
  }

  /**
   * Extract metadata from MySQL result
   */
  protected extractMetadata(rawResult: any): Record<string, any> {
    const [rows, fields] = rawResult
    
    return {
      affectedRows: rawResult.affectedRows || 0,
      insertId: rawResult.insertId || null,
      warningCount: rawResult.warningCount || 0,
      fields: fields?.length || 0,
      serverStatus: rawResult.serverStatus || null
    }
  }

  /**
   * Map MySQL data types to human-readable names
   */
  private mapMySQLType(typeId: number, columnType?: string): string {
    // MySQL field type constants (from mysql2)
    const typeMap: Record<number, string> = {
      0: 'DECIMAL',
      1: 'TINYINT',
      2: 'SMALLINT',
      3: 'INTEGER',
      4: 'FLOAT',
      5: 'DOUBLE',
      6: 'NULL',
      7: 'TIMESTAMP',
      8: 'BIGINT',
      9: 'MEDIUMINT',
      10: 'DATE',
      11: 'TIME',
      12: 'DATETIME',
      13: 'YEAR',
      14: 'NEWDATE',
      15: 'VARCHAR',
      16: 'BIT',
      245: 'JSON',
      246: 'NEWDECIMAL',
      247: 'ENUM',
      248: 'SET',
      249: 'TINY_BLOB',
      250: 'MEDIUM_BLOB',
      251: 'LONG_BLOB',
      252: 'BLOB',
      253: 'VAR_STRING',
      254: 'STRING',
      255: 'GEOMETRY'
    }

    // If we have column type string, prefer that
    if (columnType) {
      const upperType = columnType.toUpperCase()
      if (upperType.includes('(')) {
        return upperType.split('(')[0]
      }
      return upperType
    }

    return typeMap[typeId] || `UNKNOWN(${typeId})`
  }

  /**
   * Perform MySQL-specific query validation
   */
  public async validateQuery(query: string): Promise<any> {
    const baseValidation = await super.validateQuery(query)
    
    // Add MySQL-specific validation
    const mysqlSpecificErrors: any[] = []
    
    // Check for MySQL-specific syntax issues
    if (query.includes('`') && !this.isValidBacktickQuoting(query)) {
      mysqlSpecificErrors.push({
        line: 1,
        column: 1,
        message: 'Invalid backtick quoting syntax',
        severity: 'error'
      })
    }

    // Check for MySQL storage engine syntax
    if (query.includes('ENGINE=') && !this.isValidEngineClause(query)) {
      mysqlSpecificErrors.push({
        line: 1,
        column: 1,
        message: 'Invalid ENGINE clause',
        severity: 'warning'
      })
    }

    return {
      ...baseValidation,
      errors: [...baseValidation.errors, ...mysqlSpecificErrors]
    }
  }

  /**
   * Validate MySQL backtick identifiers
   */
  private isValidBacktickQuoting(query: string): boolean {
    // Simple validation for backtick-quoted identifiers
    const backticks = query.split('`')
    return backticks.length % 2 === 1 // Should be odd number (start without backtick)
  }

  /**
   * Validate MySQL ENGINE clause
   */
  private isValidEngineClause(query: string): boolean {
    const validEngines = [
      'InnoDB', 'MyISAM', 'Memory', 'CSV', 'Archive', 'Federated', 
      'Blackhole', 'MRG_MYISAM', 'NDB'
    ]
    
    const engineMatch = query.match(/ENGINE\s*=\s*(\w+)/i)
    if (engineMatch) {
      return validEngines.includes(engineMatch[1])
    }
    
    return true // No engine specified is fine
  }
}