/**
 * Result Processor Service
 * 
 * Processes and formats query results for display in the UI.
 */

import type { 
  QueryResult, 
  QueryRow, 
  ColumnDefinition,
  ResultFormattingOptions,
  DEFAULT_FORMATTING_OPTIONS,
  getDataTypeGroup
} from '../types'

/**
 * Result Processor Service
 */
export class ResultProcessor {
  private static instance: ResultProcessor

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ResultProcessor {
    if (!ResultProcessor.instance) {
      ResultProcessor.instance = new ResultProcessor()
    }
    return ResultProcessor.instance
  }

  /**
   * Format query results for UI display
   */
  formatForDisplay(
    result: QueryResult, 
    options: ResultFormattingOptions = DEFAULT_FORMATTING_OPTIONS
  ): QueryResult {
    const formattedRows = result.rows.map(row => 
      this.formatRow(row, result.columns, options)
    )

    return {
      ...result,
      rows: formattedRows
    }
  }

  /**
   * Format a single row
   */
  private formatRow(
    row: QueryRow, 
    columns: ColumnDefinition[], 
    options: ResultFormattingOptions
  ): QueryRow {
    const formattedRow: QueryRow = {}

    for (const column of columns) {
      const value = row[column.name]
      formattedRow[column.name] = this.formatValue(value, column, options)
    }

    return formattedRow
  }

  /**
   * Format a single value based on its type and options
   */
  private formatValue(
    value: any, 
    column: ColumnDefinition, 
    options: ResultFormattingOptions
  ): any {
    // Handle null values
    if (value === null || value === undefined) {
      return options.nullDisplay || '(null)'
    }

    const dataTypeGroup = getDataTypeGroup(column.type)

    switch (dataTypeGroup) {
      case 'NUMERIC':
        return this.formatNumericValue(value, options)
      
      case 'DATE_TIME':
        return this.formatDateValue(value, options)
      
      case 'TEXT':
        return this.formatTextValue(value, options)
      
      case 'BOOLEAN':
        return this.formatBooleanValue(value)
      
      case 'JSON':
        return this.formatJsonValue(value, options)
      
      default:
        return this.formatDefaultValue(value, options)
    }
  }

  /**
   * Format numeric values
   */
  private formatNumericValue(value: any, options: ResultFormattingOptions): any {
    if (typeof value !== 'number') {
      return value
    }

    if (options.formatNumbers) {
      // Format with locale-specific number formatting
      return new Intl.NumberFormat().format(value)
    }

    return value
  }

  /**
   * Format date/time values
   */
  private formatDateValue(value: any, options: ResultFormattingOptions): string {
    if (!value) return value

    try {
      const date = new Date(value)
      
      if (options.formatDates && options.dateFormat) {
        // Simple date formatting - in production, use a proper date library
        return this.formatDateString(date, options.dateFormat)
      }

      return date.toISOString()
    } catch (error) {
      return String(value)
    }
  }

  /**
   * Format text values
   */
  private formatTextValue(value: any, options: ResultFormattingOptions): string {
    const stringValue = String(value)
    
    if (options.truncateLongValues && options.maxCellLength) {
      if (stringValue.length > options.maxCellLength) {
        return stringValue.substring(0, options.maxCellLength) + '...'
      }
    }

    return stringValue
  }

  /**
   * Format boolean values
   */
  private formatBooleanValue(value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false'
    }
    
    // Handle various boolean representations
    const stringValue = String(value).toLowerCase()
    if (['true', '1', 'yes', 'on', 't', 'y'].includes(stringValue)) {
      return 'true'
    }
    if (['false', '0', 'no', 'off', 'f', 'n'].includes(stringValue)) {
      return 'false'
    }
    
    return String(value)
  }

  /**
   * Format JSON values
   */
  private formatJsonValue(value: any, options: ResultFormattingOptions): string {
    try {
      if (typeof value === 'string') {
        // Try to parse and re-stringify for formatting
        const parsed = JSON.parse(value)
        const formatted = JSON.stringify(parsed, null, 2)
        
        if (options.truncateLongValues && options.maxCellLength) {
          if (formatted.length > options.maxCellLength) {
            return formatted.substring(0, options.maxCellLength) + '...'
          }
        }
        
        return formatted
      } else if (typeof value === 'object') {
        const formatted = JSON.stringify(value, null, 2)
        
        if (options.truncateLongValues && options.maxCellLength) {
          if (formatted.length > options.maxCellLength) {
            return formatted.substring(0, options.maxCellLength) + '...'
          }
        }
        
        return formatted
      }
    } catch (error) {
      // If JSON parsing fails, treat as regular text
    }

    return this.formatTextValue(value, options)
  }

  /**
   * Format default values
   */
  private formatDefaultValue(value: any, options: ResultFormattingOptions): any {
    const stringValue = String(value)
    
    if (options.truncateLongValues && options.maxCellLength) {
      if (stringValue.length > options.maxCellLength) {
        return stringValue.substring(0, options.maxCellLength) + '...'
      }
    }

    return value
  }

  /**
   * Simple date formatting (replace with proper date library in production)
   */
  private formatDateString(date: Date, format: string): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }

  /**
   * Get summary statistics for results
   */
  getSummary(result: QueryResult): {
    rowCount: number
    columnCount: number
    executionTime?: number
    dataTypes: Record<string, number>
  } {
    const dataTypes: Record<string, number> = {}
    
    result.columns.forEach(column => {
      const group = getDataTypeGroup(column.type)
      dataTypes[group] = (dataTypes[group] || 0) + 1
    })

    return {
      rowCount: result.rows.length,
      columnCount: result.columns.length,
      executionTime: result.metadata.executionTime,
      dataTypes
    }
  }

  /**
   * Prepare results for export
   */
  prepareForExport(result: QueryResult, format: 'csv' | 'json' | 'sql'): string {
    switch (format) {
      case 'csv':
        return this.toCsv(result)
      case 'json':
        return this.toJson(result)
      case 'sql':
        return this.toSql(result)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * Convert results to CSV
   */
  private toCsv(result: QueryResult): string {
    const headers = result.columns.map(col => col.name).join(',')
    const rows = result.rows.map(row => 
      result.columns.map(col => {
        const value = row[col.name]
        // Escape CSV values
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    )

    return [headers, ...rows].join('\n')
  }

  /**
   * Convert results to JSON
   */
  private toJson(result: QueryResult): string {
    return JSON.stringify({
      columns: result.columns,
      rows: result.rows,
      metadata: result.metadata
    }, null, 2)
  }

  /**
   * Convert results to SQL INSERT statements
   */
  private toSql(result: QueryResult): string {
    if (result.rows.length === 0) {
      return '-- No data to export'
    }

    const tableName = 'exported_data'
    const columnNames = result.columns.map(col => col.name).join(', ')
    
    const insertStatements = result.rows.map(row => {
      const values = result.columns.map(col => {
        const value = row[col.name]
        if (value === null || value === undefined) return 'NULL'
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`
        return String(value)
      }).join(', ')
      
      return `INSERT INTO ${tableName} (${columnNames}) VALUES (${values});`
    })

    return insertStatements.join('\n')
  }
}

// Export singleton instance
export const resultProcessor = ResultProcessor.getInstance()