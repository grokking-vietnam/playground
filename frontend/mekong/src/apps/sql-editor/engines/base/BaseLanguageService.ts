/**
 * Base SQL Language Service Implementation
 * 
 * Abstract base class for SQL language features like autocomplete, 
 * syntax highlighting, and formatting.
 */

import { SQLLanguageService, CompletionItem } from './interfaces'
import { DatabaseEngine } from '../../types/connections'

/**
 * Abstract base SQL language service
 */
export abstract class BaseLanguageService implements SQLLanguageService {
  protected keywords: string[] = []
  protected dataTypes: string[] = []
  protected functions: string[] = []

  public abstract readonly engine: DatabaseEngine

  /**
   * Get SQL keywords for this engine
   */
  public getKeywords(): string[] {
    return [...this.keywords, ...this.getCommonKeywords()]
  }

  /**
   * Get data types for this engine
   */
  public getDataTypes(): string[] {
    return [...this.dataTypes, ...this.getCommonDataTypes()]
  }

  /**
   * Get functions for this engine
   */
  public getFunctions(): string[] {
    return [...this.functions, ...this.getCommonFunctions()]
  }

  /**
   * Format SQL query
   */
  public formatQuery(query: string): string {
    // Basic formatting - can be enhanced in subclasses
    return this.basicFormat(query)
  }

  /**
   * Get completion items for autocomplete
   */
  public getCompletionItems(query: string, position: number): CompletionItem[] {
    const items: CompletionItem[] = []
    
    // Add keywords
    this.getKeywords().forEach(keyword => {
      items.push({
        label: keyword,
        kind: 'keyword',
        detail: 'SQL Keyword',
        insertText: keyword
      })
    })

    // Add data types
    this.getDataTypes().forEach(dataType => {
      items.push({
        label: dataType,
        kind: 'datatype',
        detail: 'Data Type',
        insertText: dataType
      })
    })

    // Add functions
    this.getFunctions().forEach(func => {
      items.push({
        label: func,
        kind: 'function',
        detail: 'SQL Function',
        insertText: `${func}()`
      })
    })

    return items
  }

  /**
   * Common SQL keywords shared across engines
   */
  protected getCommonKeywords(): string[] {
    return [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
      'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
      'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
      'ALTER', 'DROP', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA', 'PRIMARY', 'KEY',
      'FOREIGN', 'REFERENCES', 'NOT', 'NULL', 'UNIQUE', 'CHECK', 'DEFAULT',
      'AND', 'OR', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'AS', 'CASE',
      'WHEN', 'THEN', 'ELSE', 'END', 'UNION', 'ALL', 'DISTINCT', 'COUNT',
      'SUM', 'AVG', 'MIN', 'MAX', 'CAST', 'CONVERT'
    ]
  }

  /**
   * Common data types shared across engines
   */
  protected getCommonDataTypes(): string[] {
    return [
      'INTEGER', 'INT', 'SMALLINT', 'BIGINT', 'DECIMAL', 'NUMERIC', 'FLOAT',
      'REAL', 'DOUBLE', 'VARCHAR', 'CHAR', 'TEXT', 'DATE', 'TIME', 'TIMESTAMP',
      'BOOLEAN', 'BOOL', 'BLOB', 'BINARY', 'VARBINARY'
    ]
  }

  /**
   * Common functions shared across engines
   */
  protected getCommonFunctions(): string[] {
    return [
      'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'UPPER', 'LOWER', 'LENGTH',
      'SUBSTRING', 'TRIM', 'LTRIM', 'RTRIM', 'CONCAT', 'COALESCE', 'NULLIF',
      'NOW', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'ABS',
      'ROUND', 'CEIL', 'FLOOR', 'CAST', 'CONVERT'
    ]
  }

  /**
   * Basic SQL formatting
   */
  protected basicFormat(query: string): string {
    let formatted = query
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\s*,\s*/g, ', ') // Format commas
      .replace(/\s*\(\s*/g, '(') // Format opening parentheses
      .replace(/\s*\)\s*/g, ')') // Format closing parentheses
      .trim()

    // Add line breaks for major keywords
    const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY']
    majorKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      formatted = formatted.replace(regex, `\n${keyword}`)
    })

    return formatted.trim()
  }

  /**
   * Engine-specific keyword extensions (override in subclasses)
   */
  protected abstract getEngineSpecificKeywords(): string[]

  /**
   * Engine-specific data type extensions (override in subclasses)
   */
  protected abstract getEngineSpecificDataTypes(): string[]

  /**
   * Engine-specific function extensions (override in subclasses)
   */
  protected abstract getEngineSpecificFunctions(): string[]
}