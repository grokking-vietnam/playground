/**
 * SQL validator service for syntax validation and error detection
 */

import * as monaco from 'monaco-editor';
import type { DatabaseEngine, DatabaseSchema } from '../types/editor';

export interface SQLValidationError {
  message: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export class SQLValidator {
  /**
   * Validate SQL syntax and return validation markers
   */
  validateSyntax(
    model: monaco.editor.ITextModel,
    engine: DatabaseEngine,
    schema?: DatabaseSchema
  ): monaco.editor.IMarkerData[] {
    const sql = model.getValue();
    if (!sql || sql.trim().length === 0) {
      return [];
    }

    const errors = this.validateSQL(sql, engine, schema);
    return this.convertToMarkers(errors);
  }

  /**
   * Main SQL validation logic
   */
  private validateSQL(
    sql: string,
    engine: DatabaseEngine,
    schema?: DatabaseSchema
  ): SQLValidationError[] {
    const errors: SQLValidationError[] = [];
    const lines = sql.split('\n');

    // Basic syntax validation
    errors.push(...this.validateBasicSyntax(sql, lines, engine));
    
    // Schema-aware validation
    if (schema) {
      errors.push(...this.validateSchemaReferences(sql, lines, schema, engine));
    }

    // Engine-specific validation
    errors.push(...this.validateEngineSpecific(sql, lines, engine));

    return errors;
  }

  /**
   * Validate basic SQL syntax
   */
  private validateBasicSyntax(
    sql: string,
    lines: string[],
    engine: DatabaseEngine
  ): SQLValidationError[] {
    const errors: SQLValidationError[] = [];

    // Check for unmatched parentheses
    let parenCount = 0;
    let parenStack: { line: number; column: number }[] = [];

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      for (let col = 0; col < line.length; col++) {
        const char = line[col];
        if (char === '(') {
          parenCount++;
          parenStack.push({ line: lineNum + 1, column: col + 1 });
        } else if (char === ')') {
          parenCount--;
          if (parenCount < 0) {
            errors.push({
              message: 'Unmatched closing parenthesis',
              line: lineNum + 1,
              column: col + 1,
              severity: 'error',
              code: 'syntax.unmatched_paren'
            });
          } else {
            parenStack.pop();
          }
        }
      }
    }

    // Check for unmatched opening parentheses
    if (parenCount > 0) {
      const lastParen = parenStack[parenStack.length - 1];
      if (lastParen) {
        errors.push({
          message: 'Unmatched opening parenthesis',
          line: lastParen.line,
          column: lastParen.column,
          severity: 'error',
          code: 'syntax.unmatched_paren'
        });
      }
    }

    // Check for unmatched quotes
    this.validateQuotes(lines, errors);

    // Check for common syntax patterns
    this.validateCommonPatterns(lines, errors, engine);

    return errors;
  }

  /**
   * Validate string quotes
   */
  private validateQuotes(lines: string[], errors: SQLValidationError[]): void {
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      let inString = false;
      let stringChar = '';
      let i = 0;

      while (i < line.length) {
        const char = line[i];
        
        if (!inString) {
          if (char === "'" || char === '"' || char === '`') {
            inString = true;
            stringChar = char;
          }
        } else {
          if (char === stringChar) {
            // Check for escaped quote
            if (i + 1 < line.length && line[i + 1] === stringChar) {
              i++; // Skip escaped quote
            } else {
              inString = false;
              stringChar = '';
            }
          }
        }
        i++;
      }

      // Check for unclosed string
      if (inString) {
        errors.push({
          message: `Unclosed string literal (${stringChar})`,
          line: lineNum + 1,
          column: line.indexOf(stringChar) + 1,
          severity: 'error',
          code: 'syntax.unclosed_string'
        });
      }
    }
  }

  /**
   * Validate common SQL patterns
   */
  private validateCommonPatterns(
    lines: string[],
    errors: SQLValidationError[],
    engine: DatabaseEngine
  ): void {
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum].trim().toUpperCase();
      
      // Check for SELECT without FROM (except for certain engines)
      if (line.startsWith('SELECT') && !line.includes(' FROM ') && 
          engine.dialect !== 'bigquery' && !line.includes('SELECT 1')) {
        const fromIndex = lines.slice(lineNum).findIndex(l => 
          l.trim().toUpperCase().startsWith('FROM'));
        
        if (fromIndex === -1) {
          errors.push({
            message: 'SELECT statement should have a FROM clause',
            line: lineNum + 1,
            column: 1,
            severity: 'warning',
            code: 'syntax.missing_from'
          });
        }
      }

      // Check for missing semicolon at end (warning)
      if (lineNum === lines.length - 1 && line.length > 0 && 
          !line.endsWith(';') && !line.endsWith('GO')) {
        errors.push({
          message: 'Consider ending SQL statements with semicolon',
          line: lineNum + 1,
          column: lines[lineNum].length + 1,
          severity: 'info',
          code: 'style.missing_semicolon'
        });
      }
    }
  }

  /**
   * Validate schema references (tables, columns)
   */
  private validateSchemaReferences(
    sql: string,
    lines: string[],
    schema: DatabaseSchema,
    engine: DatabaseEngine
  ): SQLValidationError[] {
    const errors: SQLValidationError[] = [];
    const tableNames = new Set(schema.tables.map(t => t.name.toLowerCase()));
    const columnsByTable = new Map<string, Set<string>>();

    // Build column lookup
    schema.tables.forEach(table => {
      const columns = new Set(table.columns.map(c => c.name.toLowerCase()));
      columnsByTable.set(table.name.toLowerCase(), columns);
    });

    // Simple regex to find table references (basic implementation)
    const fromRegex = /FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi;
    const joinRegex = /JOIN\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi;

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      
      // Check table references
      let match;
      while ((match = fromRegex.exec(line)) !== null) {
        const tableName = match[1].toLowerCase();
        if (!tableNames.has(tableName)) {
          errors.push({
            message: `Table '${match[1]}' does not exist`,
            line: lineNum + 1,
            column: match.index + match[0].indexOf(match[1]) + 1,
            endColumn: match.index + match[0].indexOf(match[1]) + match[1].length + 1,
            severity: 'error',
            code: 'schema.table_not_found'
          });
        }
      }

      // Reset regex
      fromRegex.lastIndex = 0;
      
      while ((match = joinRegex.exec(line)) !== null) {
        const tableName = match[1].toLowerCase();
        if (!tableNames.has(tableName)) {
          errors.push({
            message: `Table '${match[1]}' does not exist`,
            line: lineNum + 1,
            column: match.index + match[0].indexOf(match[1]) + 1,
            endColumn: match.index + match[0].indexOf(match[1]) + match[1].length + 1,
            severity: 'error',
            code: 'schema.table_not_found'
          });
        }
      }

      joinRegex.lastIndex = 0;
    }

    return errors;
  }

  /**
   * Validate engine-specific syntax
   */
  private validateEngineSpecific(
    sql: string,
    lines: string[],
    engine: DatabaseEngine
  ): SQLValidationError[] {
    const errors: SQLValidationError[] = [];

    switch (engine.dialect) {
      case 'bigquery':
        errors.push(...this.validateBigQuery(lines));
        break;
      case 'mysql':
        errors.push(...this.validateMySQL(lines));
        break;
      case 'postgresql':
        errors.push(...this.validatePostgreSQL(lines));
        break;
      case 'sparksql':
        errors.push(...this.validateSparkSQL(lines));
        break;
    }

    return errors;
  }

  /**
   * BigQuery-specific validation
   */
  private validateBigQuery(lines: string[]): SQLValidationError[] {
    const errors: SQLValidationError[] = [];

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum].trim();
      
      // Check for legacy SQL syntax
      if (line.toUpperCase().includes('TABLE_DATE_RANGE')) {
        errors.push({
          message: 'TABLE_DATE_RANGE is deprecated, use standard SQL instead',
          line: lineNum + 1,
          column: line.toUpperCase().indexOf('TABLE_DATE_RANGE') + 1,
          severity: 'warning',
          code: 'bigquery.deprecated_function'
        });
      }
    }

    return errors;
  }

  /**
   * MySQL-specific validation
   */
  private validateMySQL(lines: string[]): SQLValidationError[] {
    // Add MySQL-specific validations
    return [];
  }

  /**
   * PostgreSQL-specific validation
   */
  private validatePostgreSQL(lines: string[]): SQLValidationError[] {
    // Add PostgreSQL-specific validations
    return [];
  }

  /**
   * Spark SQL-specific validation
   */
  private validateSparkSQL(lines: string[]): SQLValidationError[] {
    // Add Spark SQL-specific validations
    return [];
  }

  /**
   * Convert validation errors to Monaco markers
   */
  private convertToMarkers(errors: SQLValidationError[]): monaco.editor.IMarkerData[] {
    return errors.map(error => ({
      severity: this.getSeverity(error.severity),
      startLineNumber: error.line,
      startColumn: error.column,
      endLineNumber: error.endLine || error.line,
      endColumn: error.endColumn || error.column + 1,
      message: error.message,
      code: error.code
    }));
  }

  /**
   * Convert severity string to Monaco severity
   */
  private getSeverity(severity: string): monaco.MarkerSeverity {
    switch (severity) {
      case 'error':
        return monaco.MarkerSeverity.Error;
      case 'warning':
        return monaco.MarkerSeverity.Warning;
      case 'info':
        return monaco.MarkerSeverity.Info;
      default:
        return monaco.MarkerSeverity.Error;
    }
  }
}