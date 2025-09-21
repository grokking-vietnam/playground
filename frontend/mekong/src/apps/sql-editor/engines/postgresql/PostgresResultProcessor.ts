/**
 * PostgreSQL Result Processor
 * 
 * Processes query results for PostgreSQL databases.
 * Handles PostgreSQL-specific data type formatting and conversion.
 */

import { ResultProcessor, QueryResult } from '../base/interfaces'
import { DatabaseEngine } from '../../types/connections'

/**
 * PostgreSQL-specific result processor
 */
export class BaseResultProcessor implements ResultProcessor {
  public readonly engine = DatabaseEngine.POSTGRESQL

  /**
   * Process raw PostgreSQL query results
   */
  public processResults(rawResults: any): QueryResult {
    // The BaseQueryExecutor already processes the results,
    // so this method mainly handles additional formatting
    return rawResults
  }

  /**
   * Format PostgreSQL-specific data types
   */
  public formatValue(value: any, columnType: string): any {
    if (value === null || value === undefined) {
      return null
    }

    switch (columnType.toLowerCase()) {
      case 'jsonb':
      case 'json':
        return typeof value === 'string' ? JSON.parse(value) : value

      case 'uuid':
        return value.toString()

      case 'inet':
      case 'cidr':
      case 'macaddr':
      case 'macaddr8':
        return value.toString()

      case 'bytea':
        return value instanceof Buffer ? value.toString('hex') : value

      case 'array':
        return Array.isArray(value) ? value : [value]

      case 'timestamp':
      case 'timestamptz':
      case 'date':
      case 'time':
        return value instanceof Date ? value.toISOString() : value

      case 'boolean':
        return Boolean(value)

      case 'integer':
      case 'bigint':
      case 'smallint':
      case 'serial':
      case 'bigserial':
      case 'smallserial':
        return parseInt(value, 10)

      case 'numeric':
      case 'decimal':
      case 'real':
      case 'double precision':
        return parseFloat(value)

      default:
        return value
    }
  }

  /**
   * Export results in various formats
   */
  public async exportResults(results: QueryResult, format: 'csv' | 'json' | 'xlsx'): Promise<Blob> {
    switch (format) {
      case 'csv':
        return this.exportAsCSV(results)
      case 'json':
        return this.exportAsJSON(results)
      case 'xlsx':
        return this.exportAsXLSX(results)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * Export as CSV
   */
  private exportAsCSV(results: QueryResult): Blob {
    const lines: string[] = []
    
    // Header
    const headers = results.columns.map(col => col.name)
    lines.push(headers.join(','))
    
    // Data rows
    results.rows.forEach(row => {
      const csvRow = row.map(cell => {
        if (cell === null || cell === undefined) return ''
        
        const str = String(cell)
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      lines.push(csvRow.join(','))
    })
    
    return new Blob([lines.join('\n')], { type: 'text/csv' })
  }

  /**
   * Export as JSON
   */
  private exportAsJSON(results: QueryResult): Blob {
    const data = results.rows.map(row => {
      const obj: Record<string, any> = {}
      results.columns.forEach((col, index) => {
        obj[col.name] = row[index]
      })
      return obj
    })
    
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  }

  /**
   * Export as XLSX (simplified - would need a proper XLSX library)
   */
  private exportAsXLSX(results: QueryResult): Blob {
    // This is a simplified implementation
    // In a real application, you'd use a library like xlsx or exceljs
    throw new Error('XLSX export not implemented - requires xlsx library')
  }
}