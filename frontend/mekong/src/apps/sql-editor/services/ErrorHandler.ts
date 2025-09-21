/**
 * Error Handler Service
 * 
 * Handles and formats errors from query execution for user-friendly display.
 */

import type { QueryError } from '../types'
import { ExecutionStatus } from '../types'

/**
 * Error category types
 */
export enum ErrorCategory {
  SYNTAX = 'syntax',
  CONNECTION = 'connection', 
  PERMISSION = 'permission',
  RUNTIME = 'runtime',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * User-friendly error information
 */
export interface ErrorInfo {
  category: ErrorCategory
  title: string
  message: string
  suggestion?: string
  action?: string
}

/**
 * Error Handler Service
 */
export class ErrorHandler {
  private static instance: ErrorHandler

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Process query error into user-friendly format
   */
  processQueryError(error: QueryError): ErrorInfo {
    const category = this.categorizeError(error)
    
    switch (category) {
      case ErrorCategory.SYNTAX:
        return this.handleSyntaxError(error)
      
      case ErrorCategory.CONNECTION:
        return this.handleConnectionError(error)
      
      case ErrorCategory.PERMISSION:
        return this.handlePermissionError(error)
      
      case ErrorCategory.TIMEOUT:
        return this.handleTimeoutError(error)
      
      case ErrorCategory.RUNTIME:
        return this.handleRuntimeError(error)
      
      default:
        return this.handleUnknownError(error)
    }
  }

  /**
   * Process execution status errors
   */
  processExecutionError(status: ExecutionStatus, error?: QueryError): ErrorInfo {
    switch (status) {
      case ExecutionStatus.TIMEOUT:
        return {
          category: ErrorCategory.TIMEOUT,
          title: 'Query Timeout',
          message: 'The query took too long to execute and was cancelled.',
          suggestion: 'Try simplifying your query, adding WHERE clauses to limit results, or increasing the timeout limit.',
          action: 'Modify query or increase timeout'
        }
      
      case ExecutionStatus.CANCELLED:
        return {
          category: ErrorCategory.RUNTIME,
          title: 'Query Cancelled',
          message: 'The query was cancelled by the user.',
          suggestion: 'You can run the query again if needed.',
          action: 'Run query again'
        }
      
      case ExecutionStatus.FAILED:
        if (error) {
          return this.processQueryError(error)
        }
        return this.handleUnknownError()
      
      default:
        return this.handleUnknownError()
    }
  }

  /**
   * Categorize error based on its properties
   */
  private categorizeError(error: QueryError): ErrorCategory {
    const message = error.message.toLowerCase()
    const code = error.code.toLowerCase()

    // Syntax errors
    if (
      message.includes('syntax error') ||
      message.includes('unexpected token') ||
      message.includes('parsing failed') ||
      code.includes('syntax')
    ) {
      return ErrorCategory.SYNTAX
    }

    // Connection errors
    if (
      message.includes('connection') ||
      message.includes('connect') ||
      message.includes('host') ||
      message.includes('network') ||
      code.includes('connection')
    ) {
      return ErrorCategory.CONNECTION
    }

    // Permission errors
    if (
      message.includes('permission') ||
      message.includes('access denied') ||
      message.includes('unauthorized') ||
      message.includes('privilege') ||
      code.includes('permission')
    ) {
      return ErrorCategory.PERMISSION
    }

    // Timeout errors
    if (
      message.includes('timeout') ||
      message.includes('time out') ||
      code.includes('timeout')
    ) {
      return ErrorCategory.TIMEOUT
    }

    // Runtime errors (table not found, column not found, etc.)
    if (
      message.includes('does not exist') ||
      message.includes('not found') ||
      message.includes('undefined') ||
      message.includes('invalid')
    ) {
      return ErrorCategory.RUNTIME
    }

    return ErrorCategory.UNKNOWN
  }

  /**
   * Handle syntax errors
   */
  private handleSyntaxError(error: QueryError): ErrorInfo {
    let suggestion = 'Check your SQL syntax for:'
    const suggestions = [
      '• Missing or extra commas, parentheses, or quotation marks',
      '• Misspelled SQL keywords (SELECT, FROM, WHERE, etc.)',
      '• Incorrect column or table names',
      '• Missing semicolons at the end of statements'
    ]

    if (error.line) {
      suggestion += `\n\nError appears to be near line ${error.line}`
      if (error.column) {
        suggestion += `, column ${error.column}`
      }
    }

    if (error.hint) {
      suggestion += `\n\nHint: ${error.hint}`
    }

    return {
      category: ErrorCategory.SYNTAX,
      title: 'SQL Syntax Error',
      message: error.message,
      suggestion: suggestion + '\n\n' + suggestions.join('\n'),
      action: 'Fix syntax and try again'
    }
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(error: QueryError): ErrorInfo {
    const suggestions = [
      '• Verify the database server is running',
      '• Check your connection settings (host, port, database name)',
      '• Ensure your network connection is working',
      '• Verify your authentication credentials',
      '• Check if firewall is blocking the connection'
    ]

    return {
      category: ErrorCategory.CONNECTION,
      title: 'Database Connection Error',
      message: error.message,
      suggestion: 'Connection to the database failed. Please check:\n\n' + suggestions.join('\n'),
      action: 'Check connection settings'
    }
  }

  /**
   * Handle permission errors
   */
  private handlePermissionError(error: QueryError): ErrorInfo {
    const suggestions = [
      '• Verify you have the required permissions for this operation',
      '• Check if your user account has access to the requested tables/schemas',
      '• Contact your database administrator if you need additional permissions',
      '• Ensure you\'re connected to the correct database'
    ]

    return {
      category: ErrorCategory.PERMISSION,
      title: 'Permission Denied',
      message: error.message,
      suggestion: 'You don\'t have permission to perform this operation:\n\n' + suggestions.join('\n'),
      action: 'Contact administrator for access'
    }
  }

  /**
   * Handle timeout errors
   */
  private handleTimeoutError(error: QueryError): ErrorInfo {
    const suggestions = [
      '• Add WHERE clauses to limit the data being processed',
      '• Create appropriate indexes on columns used in WHERE/JOIN clauses',
      '• Break complex queries into smaller parts',
      '• Consider using LIMIT to reduce result set size',
      '• Increase the query timeout if necessary'
    ]

    return {
      category: ErrorCategory.TIMEOUT,
      title: 'Query Timeout',
      message: error.message,
      suggestion: 'The query took too long to execute. Try:\n\n' + suggestions.join('\n'),
      action: 'Optimize query or increase timeout'
    }
  }

  /**
   * Handle runtime errors
   */
  private handleRuntimeError(error: QueryError): ErrorInfo {
    let suggestions: string[] = []

    if (error.message.includes('does not exist')) {
      suggestions = [
        '• Verify the table/column name is spelled correctly',
        '• Check if the table exists in the current database/schema',
        '• Ensure you\'re connected to the correct database',
        '• Check if the table name is case-sensitive in your database'
      ]
    } else if (error.message.includes('data type')) {
      suggestions = [
        '• Check data types are compatible in your operations',
        '• Use appropriate casting functions if needed',
        '• Verify input values match expected column types'
      ]
    } else {
      suggestions = [
        '• Review your query logic and data',
        '• Check the database documentation for this error',
        '• Verify your data meets the operation requirements'
      ]
    }

    return {
      category: ErrorCategory.RUNTIME,
      title: 'Runtime Error',
      message: error.message,
      suggestion: suggestions.length > 0 ? suggestions.join('\n• ') : error.hint,
      action: 'Review and modify query'
    }
  }

  /**
   * Handle unknown errors
   */
  private handleUnknownError(error?: QueryError): ErrorInfo {
    return {
      category: ErrorCategory.UNKNOWN,
      title: 'Unexpected Error',
      message: error?.message || 'An unexpected error occurred during query execution.',
      suggestion: 'Please try again. If the problem persists, contact support with the error details.',
      action: 'Try again or contact support'
    }
  }

  /**
   * Get error severity color for UI
   */
  getErrorSeverityColor(category: ErrorCategory): string {
    switch (category) {
      case ErrorCategory.SYNTAX:
        return 'text-orange-600'
      case ErrorCategory.CONNECTION:
        return 'text-red-600'
      case ErrorCategory.PERMISSION:
        return 'text-yellow-600'
      case ErrorCategory.TIMEOUT:
        return 'text-blue-600'
      case ErrorCategory.RUNTIME:
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  /**
   * Get error icon for UI
   */
  getErrorIcon(category: ErrorCategory): string {
    switch (category) {
      case ErrorCategory.SYNTAX:
        return '⚠️'
      case ErrorCategory.CONNECTION:
        return '🔌'
      case ErrorCategory.PERMISSION:
        return '🔒'
      case ErrorCategory.TIMEOUT:
        return '⏱️'
      case ErrorCategory.RUNTIME:
        return '❌'
      default:
        return '❓'
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()