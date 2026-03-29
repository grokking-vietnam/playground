/**
 * PostgreSQL Language Service
 * 
 * Provides PostgreSQL-specific SQL language features like keywords, data types,
 * functions, and syntax highlighting.
 */

import { BaseLanguageService } from '../base/BaseLanguageService'
import { CompletionItem } from '../base/interfaces'
import { DatabaseEngine } from '../../types/connections'

/**
 * PostgreSQL-specific language service
 */
export class PostgresLanguageService extends BaseLanguageService {
  public readonly engine = DatabaseEngine.POSTGRESQL

  constructor() {
    super()
    this.initializePostgreSQLFeatures()
  }

  /**
   * Initialize PostgreSQL-specific language features
   */
  private initializePostgreSQLFeatures(): void {
    this.keywords = this.getEngineSpecificKeywords()
    this.dataTypes = this.getEngineSpecificDataTypes()
    this.functions = this.getEngineSpecificFunctions()
  }

  /**
   * Get PostgreSQL-specific keywords
   */
  protected getEngineSpecificKeywords(): string[] {
    return [
      // PostgreSQL specific keywords
      'SERIAL', 'BIGSERIAL', 'SMALLSERIAL',
      'SERIAL4', 'SERIAL8', 'SERIAL2',
      'RETURNING', 'CONFLICT', 'NOTHING',
      'UPSERT', 'EXCLUDED', 'CONCURRENTLY',
      'MATERIALIZED', 'REFRESH', 'VACUUM',
      'ANALYZE', 'EXPLAIN', 'VERBOSE',
      'EXTENSION', 'SCHEMA', 'DOMAIN',
      'ENUM', 'COMPOSITE', 'RANGE',
      'ARRAY', 'JSONB', 'HSTORE',
      'TABLESPACE', 'INHERIT', 'INHERITS',
      'PARTITION', 'PARTITIONED', 'GENERATED',
      'ALWAYS', 'STORED', 'IDENTITY',
      'LATERAL', 'ORDINALITY', 'CROSS',
      'ILIKE', 'SIMILAR', 'POSIX',
      'WINDOW', 'OVER', 'FILTER',
      'WITHIN', 'GROUPS', 'EXCLUDE',
      'CURRENT', 'FOLLOWING', 'PRECEDING',
      'UNBOUNDED', 'RANGE', 'ROWS',
      'NULLS', 'FIRST', 'LAST'
    ]
  }

  /**
   * Get PostgreSQL-specific data types
   */
  protected getEngineSpecificDataTypes(): string[] {
    return [
      // PostgreSQL specific data types
      'SERIAL', 'BIGSERIAL', 'SMALLSERIAL',
      'SERIAL2', 'SERIAL4', 'SERIAL8',
      'JSONB', 'JSON', 'XML', 'UUID',
      'INET', 'CIDR', 'MACADDR', 'MACADDR8',
      'POINT', 'LINE', 'LSEG', 'BOX',
      'PATH', 'POLYGON', 'CIRCLE',
      'TSVECTOR', 'TSQUERY',
      'BIT', 'VARBIT', 'BYTEA',
      'MONEY', 'PG_LSN', 'TXID_SNAPSHOT',
      'INT4RANGE', 'INT8RANGE', 'NUMRANGE',
      'TSRANGE', 'TSTZRANGE', 'DATERANGE',
      'ARRAY', 'COMPOSITE', 'ENUM', 'DOMAIN',
      'HSTORE', 'LTREE', 'CUBE', 'SEG'
    ]
  }

  /**
   * Get PostgreSQL-specific functions
   */
  protected getEngineSpecificFunctions(): string[] {
    return [
      // JSON/JSONB functions
      'JSON_EXTRACT_PATH', 'JSON_EXTRACT_PATH_TEXT',
      'JSON_ARRAY_ELEMENTS', 'JSON_ARRAY_ELEMENTS_TEXT',
      'JSON_OBJECT_KEYS', 'JSON_POPULATE_RECORD',
      'JSON_POPULATE_RECORDSET', 'JSON_TO_RECORD',
      'JSON_TO_RECORDSET', 'JSONB_AGG',
      'JSONB_OBJECT_AGG', 'JSONB_BUILD_ARRAY',
      'JSONB_BUILD_OBJECT', 'JSONB_EXTRACT_PATH',
      'JSONB_PRETTY', 'JSONB_SET', 'JSONB_INSERT',
      'JSONB_STRIP_NULLS', 'JSONB_PATH_EXISTS',
      'JSONB_PATH_QUERY', 'JSONB_PATH_QUERY_ARRAY',

      // Array functions
      'ARRAY_AGG', 'ARRAY_APPEND', 'ARRAY_PREPEND',
      'ARRAY_CAT', 'ARRAY_DIMS', 'ARRAY_FILL',
      'ARRAY_LENGTH', 'ARRAY_LOWER', 'ARRAY_UPPER',
      'ARRAY_NDIMS', 'ARRAY_POSITION', 'ARRAY_POSITIONS',
      'ARRAY_REMOVE', 'ARRAY_REPLACE', 'ARRAY_TO_STRING',
      'STRING_TO_ARRAY', 'UNNEST', 'CARDINALITY',

      // String functions
      'REGEXP_MATCHES', 'REGEXP_REPLACE', 'REGEXP_SPLIT_TO_ARRAY',
      'REGEXP_SPLIT_TO_TABLE', 'SPLIT_PART', 'STRPOS',
      'LEFT', 'RIGHT', 'REVERSE', 'REPEAT',
      'TRANSLATE', 'ASCII', 'CHR', 'INITCAP',
      'LPAD', 'RPAD', 'BTRIM', 'OVERLAY',
      'QUOTE_IDENT', 'QUOTE_LITERAL', 'QUOTE_NULLABLE',
      'FORMAT', 'CONCAT_WS', 'MD5', 'ENCODE', 'DECODE',

      // Date/Time functions
      'AGE', 'CLOCK_TIMESTAMP', 'DATE_PART', 'DATE_TRUNC',
      'EXTRACT', 'ISFINITE', 'JUSTIFY_DAYS', 'JUSTIFY_HOURS',
      'JUSTIFY_INTERVAL', 'MAKE_DATE', 'MAKE_INTERVAL',
      'MAKE_TIME', 'MAKE_TIMESTAMP', 'MAKE_TIMESTAMPTZ',
      'TO_TIMESTAMP', 'TO_CHAR', 'TO_DATE', 'TO_NUMBER',

      // Mathematical functions
      'RANDOM', 'SETSEED', 'SQRT', 'CBRT', 'POWER',
      'EXP', 'LN', 'LOG', 'SIN', 'COS', 'TAN',
      'ASIN', 'ACOS', 'ATAN', 'ATAN2', 'SINH',
      'COSH', 'TANH', 'ASINH', 'ACOSH', 'ATANH',
      'DEGREES', 'RADIANS', 'PI', 'FACTORIAL',
      'GCD', 'LCM', 'DIV', 'MOD', 'TRUNC',

      // Window functions
      'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'PERCENT_RANK',
      'CUME_DIST', 'NTILE', 'LAG', 'LEAD',
      'FIRST_VALUE', 'LAST_VALUE', 'NTH_VALUE',

      // Aggregate functions
      'STRING_AGG', 'BOOL_AND', 'BOOL_OR',
      'BIT_AND', 'BIT_OR', 'EVERY', 'XMLAGG',
      'CORR', 'COVAR_POP', 'COVAR_SAMP',
      'REGR_AVGX', 'REGR_AVGY', 'REGR_COUNT',
      'REGR_INTERCEPT', 'REGR_R2', 'REGR_SLOPE',
      'REGR_SXX', 'REGR_SXY', 'REGR_SYY',
      'STDDEV', 'STDDEV_POP', 'STDDEV_SAMP',
      'VARIANCE', 'VAR_POP', 'VAR_SAMP',

      // System information functions
      'CURRENT_DATABASE', 'CURRENT_SCHEMA', 'CURRENT_SCHEMAS',
      'INET_CLIENT_ADDR', 'INET_CLIENT_PORT', 'INET_SERVER_ADDR',
      'INET_SERVER_PORT', 'PG_BACKEND_PID', 'PG_CONF_LOAD_TIME',
      'PG_IS_OTHER_TEMP_SCHEMA', 'PG_LISTENING_CHANNELS',
      'PG_MY_TEMP_SCHEMA', 'PG_POSTMASTER_START_TIME',
      'VERSION', 'PG_COLUMN_SIZE', 'PG_DATABASE_SIZE',
      'PG_RELATION_SIZE', 'PG_SIZE_PRETTY', 'PG_TABLE_SIZE',
      'PG_TOTAL_RELATION_SIZE'
    ]
  }

  /**
   * Format PostgreSQL query with specific formatting rules
   */
  public formatQuery(query: string): string {
    let formatted = super.formatQuery(query)

    // PostgreSQL-specific formatting
    formatted = this.formatPostgreSQLSpecificSyntax(formatted)

    return formatted
  }

  /**
   * Get PostgreSQL-specific completion items
   */
  public getCompletionItems(query: string, position: number): CompletionItem[] {
    const items = super.getCompletionItems(query, position)

    // Add PostgreSQL-specific completion items based on context
    const context = this.analyzeContext(query, position)

    if (context.expectingDataType) {
      // Add PostgreSQL-specific data types
      this.getEngineSpecificDataTypes().forEach(dataType => {
        items.push({
          label: dataType,
          kind: 'datatype',
          detail: 'PostgreSQL Data Type',
          documentation: this.getDataTypeDocumentation(dataType),
          insertText: dataType
        })
      })
    }

    if (context.expectingFunction) {
      // Add PostgreSQL-specific functions
      this.getEngineSpecificFunctions().forEach(func => {
        items.push({
          label: func,
          kind: 'function',
          detail: 'PostgreSQL Function',
          documentation: this.getFunctionDocumentation(func),
          insertText: `${func}()`
        })
      })
    }

    return items
  }

  /**
   * Format PostgreSQL-specific syntax
   */
  private formatPostgreSQLSpecificSyntax(query: string): string {
    // Handle dollar-quoted strings
    query = query.replace(/(\$\w*\$)/g, '\n$1')

    // Handle RETURNING clause
    query = query.replace(/\bRETURNING\b/gi, '\nRETURNING')

    // Handle CONFLICT clause
    query = query.replace(/\bON\s+CONFLICT\b/gi, '\nON CONFLICT')

    return query
  }

  /**
   * Analyze query context for better completion
   */
  private analyzeContext(query: string, position: number): any {
    const beforeCursor = query.substring(0, position).toLowerCase()
    
    return {
      expectingDataType: /\b(create\s+table|alter\s+table|add\s+column|modify\s+column)\s+\w*$/i.test(beforeCursor),
      expectingFunction: /\b(select|where|having|order\s+by)\s+[^()]*$/i.test(beforeCursor),
      inJsonPath: beforeCursor.includes('->') || beforeCursor.includes('->>'),
      inArrayContext: beforeCursor.includes('[') && !beforeCursor.includes(']')
    }
  }

  /**
   * Get documentation for PostgreSQL data types
   */
  private getDataTypeDocumentation(dataType: string): string {
    const docs: Record<string, string> = {
      'JSONB': 'Binary JSON data type with indexing support',
      'JSON': 'JSON data type stored as text',
      'UUID': 'Universally unique identifier',
      'INET': 'IPv4 or IPv6 host address',
      'CIDR': 'IPv4 or IPv6 network address',
      'SERIAL': 'Auto-incrementing integer (32-bit)',
      'BIGSERIAL': 'Auto-incrementing integer (64-bit)',
      'ARRAY': 'Array of elements of a specific type',
      'HSTORE': 'Key-value pairs stored in a single value'
    }

    return docs[dataType] || `PostgreSQL ${dataType} data type`
  }

  /**
   * Get documentation for PostgreSQL functions
   */
  private getFunctionDocumentation(func: string): string {
    const docs: Record<string, string> = {
      'JSONB_AGG': 'Aggregates values as a JSON array',
      'ARRAY_AGG': 'Aggregates values into an array',
      'STRING_AGG': 'Concatenates strings with a delimiter',
      'UNNEST': 'Expands an array to a set of rows',
      'GENERATE_SERIES': 'Generates a series of values',
      'REGEXP_MATCHES': 'Returns matches for a regular expression'
    }

    return docs[func] || `PostgreSQL ${func} function`
  }
}