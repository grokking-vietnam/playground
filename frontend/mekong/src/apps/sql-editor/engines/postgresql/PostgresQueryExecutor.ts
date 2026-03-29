/**
 * PostgreSQL Query Executor
 * 
 * Executes SQL queries against PostgreSQL databases using the pg library.
 * Extends BaseQueryExecutor to provide PostgreSQL-specific functionality.
 */

import { Client, QueryResult as PgQueryResult } from 'pg'
import { BaseQueryExecutor } from '../base/BaseQueryExecutor'
import { ExecutionOptions, QueryResult, ColumnDefinition } from '../base/interfaces'
import { DatabaseEngine } from '../../types/connections'
import { PostgresConnectionManager } from './PostgresConnectionManager'

/**
 * PostgreSQL-specific query executor
 */
export class PostgresQueryExecutor extends BaseQueryExecutor {
  public readonly engine = DatabaseEngine.POSTGRESQL

  constructor(connectionManager: PostgresConnectionManager) {
    super(connectionManager)
  }

  /**
   * Execute PostgreSQL query
   */
  protected async executeQuery(
    client: Client,
    query: string,
    options: ExecutionOptions,
    executionId: string
  ): Promise<PgQueryResult> {
    // Store execution for potential cancellation
    this.activeExecutions.set(executionId, client)

    try {
      // Apply query timeout if specified
      if (options.timeout) {
        // PostgreSQL doesn't support per-query timeout directly
        // We'll need to implement this at the client level
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), options.timeout)
        })

        return await Promise.race([
          client.query(query),
          timeoutPromise as Promise<PgQueryResult>
        ])
      }

      return await client.query(query)
    } finally {
      this.activeExecutions.delete(executionId)
    }
  }

  /**
   * Cancel PostgreSQL query execution
   */
  protected async cancelExecution(client: Client): Promise<void> {
    // PostgreSQL doesn't have a direct way to cancel individual queries
    // In a real implementation, you might need to track query PIDs and use pg_cancel_backend
    // For now, we'll close the connection which will cancel the query
    try {
      await client.end()
    } catch (error) {
      console.warn('Error canceling PostgreSQL query:', error)
    }
  }

  /**
   * Extract column definitions from PostgreSQL result
   */
  protected extractColumns(rawResult: PgQueryResult): ColumnDefinition[] {
    if (!rawResult.fields) {
      return []
    }

    return rawResult.fields.map(field => ({
      name: field.name,
      type: this.mapPostgreSQLType(field.dataTypeID),
      nullable: true, // PostgreSQL doesn't provide this in basic query results
      maxLength: field.dataTypeModifier > 0 ? field.dataTypeModifier - 4 : undefined
    }))
  }

  /**
   * Extract data rows from PostgreSQL result
   */
  protected extractRows(rawResult: PgQueryResult): any[][] {
    if (!rawResult.rows) {
      return []
    }

    return rawResult.rows.map(row => 
      rawResult.fields.map(field => row[field.name])
    )
  }

  /**
   * Get row count from PostgreSQL result
   */
  protected getRowCount(rawResult: PgQueryResult): number {
    return rawResult.rowCount || 0
  }

  /**
   * Extract metadata from PostgreSQL result
   */
  protected extractMetadata(rawResult: PgQueryResult): Record<string, any> {
    return {
      command: rawResult.command,
      oid: rawResult.oid,
      rowCount: rawResult.rowCount,
      fields: rawResult.fields?.length || 0
    }
  }

  /**
   * Map PostgreSQL data type IDs to human-readable names
   */
  private mapPostgreSQLType(dataTypeID: number): string {
    // PostgreSQL OID to type mapping (partial)
    const typeMap: Record<number, string> = {
      16: 'BOOLEAN',
      17: 'BYTEA',
      18: 'CHAR',
      19: 'NAME',
      20: 'BIGINT',
      21: 'SMALLINT',
      23: 'INTEGER',
      25: 'TEXT',
      26: 'OID',
      114: 'JSON',
      142: 'XML',
      700: 'REAL',
      701: 'DOUBLE PRECISION',
      1042: 'CHARACTER',
      1043: 'VARCHAR',
      1082: 'DATE',
      1083: 'TIME',
      1114: 'TIMESTAMP',
      1184: 'TIMESTAMPTZ',
      1700: 'NUMERIC',
      2950: 'UUID',
      3802: 'JSONB'
    }

    return typeMap[dataTypeID] || `UNKNOWN(${dataTypeID})`
  }

  /**
   * Perform PostgreSQL-specific query validation
   */
  public async validateQuery(query: string): Promise<any> {
    const baseValidation = await super.validateQuery(query)
    
    // Add PostgreSQL-specific validation
    const pgSpecificErrors: any[] = []
    
    // Check for PostgreSQL-specific syntax
    if (query.includes('$$') && !this.isValidDollarQuoting(query)) {
      pgSpecificErrors.push({
        line: 1,
        column: 1,
        message: 'Invalid dollar-quoted string syntax',
        severity: 'error'
      })
    }

    return {
      ...baseValidation,
      errors: [...baseValidation.errors, ...pgSpecificErrors]
    }
  }

  /**
   * Validate PostgreSQL dollar-quoted strings
   */
  private isValidDollarQuoting(query: string): boolean {
    // Simple validation for dollar-quoted strings
    const dollarPattern = /\$([^$]*)\$/g
    const matches = query.match(dollarPattern)
    
    if (!matches) return true
    
    // Check if opening and closing tags match
    for (let i = 0; i < matches.length; i += 2) {
      if (i + 1 >= matches.length || matches[i] !== matches[i + 1]) {
        return false
      }
    }
    
    return true
  }
}