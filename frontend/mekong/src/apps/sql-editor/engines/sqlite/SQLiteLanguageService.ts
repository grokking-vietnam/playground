/**
 * SQLite Language Service
 * 
 * Provides SQLite-specific SQL language features like keywords, data types,
 * functions, and syntax highlighting.
 */

import { BaseLanguageService } from '../base/BaseLanguageService'
import { CompletionItem } from '../base/interfaces'
import { DatabaseEngine } from '../../types/connections'

/**
 * SQLite-specific language service
 */
export class SQLiteLanguageService extends BaseLanguageService {
  public readonly engine = DatabaseEngine.SQLITE

  constructor() {
    super()
    this.initializeSQLiteFeatures()
  }

  /**
   * Initialize SQLite-specific language features
   */
  private initializeSQLiteFeatures(): void {
    this.keywords = this.getEngineSpecificKeywords()
    this.dataTypes = this.getEngineSpecificDataTypes()
    this.functions = this.getEngineSpecificFunctions()
  }

  /**
   * Get SQLite-specific keywords
   */
  protected getEngineSpecificKeywords(): string[] {
    return [
      // SQLite specific keywords
      'ABORT', 'ACTION', 'AFTER', 'AUTOINCREMENT',
      'BEFORE', 'CASCADE', 'CONFLICT', 'DEFERRABLE',
      'DEFERRED', 'EACH', 'FAIL', 'IMMEDIATE',
      'INDEXED', 'INSTEAD', 'ISNULL', 'NOTNULL',
      'OF', 'PLAN', 'PRAGMA', 'QUERY', 'RAISE',
      'RECURSIVE', 'REGEXP', 'REINDEX', 'RENAME',
      'REPLACE', 'RESTRICT', 'ROW', 'TEMP',
      'TEMPORARY', 'TRIGGER', 'VACUUM', 'VIEW',
      'VIRTUAL', 'WITHOUT', 'EXPLAIN', 'ATTACH',
      'DETACH', 'IF', 'GLOB', 'LIKE', 'MATCH',
      'ESCAPE', 'LIMIT', 'OFFSET', 'EXCEPT',
      'INTERSECT', 'COLLATE', 'BINARY', 'NOCASE',
      'RTRIM'
    ]
  }

  /**
   * Get SQLite-specific data types
   */
  protected getEngineSpecificDataTypes(): string[] {
    return [
      // SQLite data types (flexible type system)
      'INTEGER', 'TEXT', 'REAL', 'BLOB', 'NUMERIC',
      'ANY', 'NONE',
      // Common type aliases
      'INT', 'TINYINT', 'SMALLINT', 'MEDIUMINT', 'BIGINT',
      'INT2', 'INT8', 'UNSIGNED BIG INT',
      'CHARACTER', 'VARCHAR', 'VARYING CHARACTER',
      'NCHAR', 'NATIVE CHARACTER', 'NVARCHAR',
      'CLOB', 'DOUBLE', 'DOUBLE PRECISION', 'FLOAT',
      'DECIMAL', 'BOOLEAN', 'DATE', 'DATETIME'
    ]
  }

  /**
   * Get SQLite-specific functions
   */
  protected getEngineSpecificFunctions(): string[] {
    return [
      // Core functions
      'ABS', 'CHANGES', 'CHAR', 'COALESCE', 'GLOB',
      'HEX', 'IFNULL', 'INSTR', 'LAST_INSERT_ROWID',
      'LENGTH', 'LIKE', 'LOAD_EXTENSION', 'LOWER',
      'LTRIM', 'MAX', 'MIN', 'NULLIF', 'PRINTF',
      'QUOTE', 'RANDOM', 'RANDOMBLOB', 'REPLACE',
      'ROUND', 'RTRIM', 'SOUNDEX', 'SQLITE_COMPILEOPTION_GET',
      'SQLITE_COMPILEOPTION_USED', 'SQLITE_SOURCE_ID',
      'SQLITE_VERSION', 'SUBSTR', 'TOTAL_CHANGES',
      'TRIM', 'TYPEOF', 'UNICODE', 'UPPER', 'ZEROBLOB',

      // Aggregate functions
      'AVG', 'COUNT', 'GROUP_CONCAT', 'MAX', 'MIN',
      'SUM', 'TOTAL',

      // Date and time functions
      'DATE', 'TIME', 'DATETIME', 'JULIANDAY', 'STRFTIME',

      // Mathematical functions
      'ACOS', 'ACOSH', 'ASIN', 'ASINH', 'ATAN', 'ATAN2',
      'ATANH', 'CEIL', 'CEILING', 'COS', 'COSH', 'DEGREES',
      'EXP', 'FLOOR', 'LN', 'LOG', 'LOG10', 'LOG2',
      'MOD', 'PI', 'POW', 'POWER', 'RADIANS', 'SIN',
      'SINH', 'SQRT', 'TAN', 'TANH', 'TRUNC',

      // JSON functions (SQLite 3.38+)
      'JSON', 'JSON_ARRAY', 'JSON_ARRAY_LENGTH',
      'JSON_EXTRACT', 'JSON_INSERT', 'JSON_OBJECT',
      'JSON_PATCH', 'JSON_REMOVE', 'JSON_REPLACE',
      'JSON_SET', 'JSON_TYPE', 'JSON_VALID',
      'JSON_QUOTE', 'JSON_GROUP_ARRAY', 'JSON_GROUP_OBJECT',

      // Window functions (SQLite 3.25+)
      'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'PERCENT_RANK',
      'CUME_DIST', 'NTILE', 'LAG', 'LEAD', 'FIRST_VALUE',
      'LAST_VALUE', 'NTH_VALUE',

      // FTS (Full-Text Search) functions
      'MATCH', 'SNIPPET', 'OFFSETS', 'MATCHINFO',
      'FTS3_TOKENIZER', 'FTS4', 'FTS5',

      // PRAGMA functions
      'PRAGMA_TABLE_INFO', 'PRAGMA_INDEX_LIST',
      'PRAGMA_INDEX_INFO', 'PRAGMA_FOREIGN_KEY_LIST'
    ]
  }

  /**
   * Format SQLite query with specific formatting rules
   */
  public formatQuery(query: string): string {
    let formatted = super.formatQuery(query)

    // SQLite-specific formatting
    formatted = this.formatSQLiteSpecificSyntax(formatted)

    return formatted
  }

  /**
   * Get SQLite-specific completion items
   */
  public getCompletionItems(query: string, position: number): CompletionItem[] {
    const items = super.getCompletionItems(query, position)

    // Add SQLite-specific completion items based on context
    const context = this.analyzeContext(query, position)

    if (context.expectingPragma) {
      // Add SQLite PRAGMA statements
      const pragmas = [
        'application_id', 'auto_vacuum', 'automatic_index',
        'busy_timeout', 'cache_size', 'case_sensitive_like',
        'checkpoint_fullfsync', 'collation_list', 'compile_options',
        'count_changes', 'database_list', 'default_cache_size',
        'defer_foreign_keys', 'empty_result_callbacks', 'encoding',
        'foreign_key_check', 'foreign_key_list', 'foreign_keys',
        'freelist_count', 'full_column_names', 'fullfsync',
        'function_list', 'ignore_check_constraints', 'incremental_vacuum',
        'index_info', 'index_list', 'integrity_check', 'journal_mode',
        'journal_size_limit', 'legacy_file_format', 'locking_mode',
        'max_page_count', 'mmap_size', 'module_list', 'optimize',
        'page_count', 'page_size', 'parser_trace', 'pragma_list',
        'quick_check', 'read_uncommitted', 'recursive_triggers',
        'reverse_unordered_selects', 'schema_version', 'secure_delete',
        'short_column_names', 'shrink_memory', 'soft_heap_limit',
        'stats', 'synchronous', 'table_info', 'temp_store',
        'temp_store_directory', 'threads', 'timeout', 'user_version',
        'vdbe_addoptrace', 'vdbe_debug', 'vdbe_listing', 'vdbe_trace',
        'wal_autocheckpoint', 'wal_checkpoint', 'writable_schema'
      ]

      pragmas.forEach(pragma => {
        items.push({
          label: pragma,
          kind: 'keyword',
          detail: 'SQLite PRAGMA',
          documentation: this.getPragmaDocumentation(pragma),
          insertText: pragma
        })
      })
    }

    if (context.expectingJournalMode) {
      // Add journal mode options
      const journalModes = ['DELETE', 'TRUNCATE', 'PERSIST', 'MEMORY', 'WAL', 'OFF']
      journalModes.forEach(mode => {
        items.push({
          label: mode,
          kind: 'keyword',
          detail: 'Journal Mode',
          documentation: `SQLite journal mode: ${mode}`,
          insertText: mode
        })
      })
    }

    return items
  }

  /**
   * Format SQLite-specific syntax
   */
  private formatSQLiteSpecificSyntax(query: string): string {
    // Handle PRAGMA statements
    query = query.replace(/\bPRAGMA\b/gi, '\nPRAGMA')

    // Handle SQLite-specific keywords
    query = query.replace(/\bAUTOINCREMENT\b/gi, 'AUTOINCREMENT')
    query = query.replace(/\bCONFLICT\b/gi, 'CONFLICT')

    return query
  }

  /**
   * Analyze query context for better completion
   */
  private analyzeContext(query: string, position: number): any {
    const beforeCursor = query.substring(0, position).toLowerCase()
    
    return {
      expectingDataType: /\b(create\s+table|alter\s+table|add\s+column)\s+\w*$/i.test(beforeCursor),
      expectingFunction: /\b(select|where|having|order\s+by)\s+[^()]*$/i.test(beforeCursor),
      expectingPragma: /\bpragma\s+$/i.test(beforeCursor),
      expectingJournalMode: /\bpragma\s+journal_mode\s*=\s*$/i.test(beforeCursor),
      inFTSContext: beforeCursor.includes('match') || beforeCursor.includes('fts'),
      inJSONContext: beforeCursor.includes('json_')
    }
  }

  /**
   * Get documentation for SQLite PRAGMA statements
   */
  private getPragmaDocumentation(pragma: string): string {
    const docs: Record<string, string> = {
      'journal_mode': 'Set or query the journal mode for databases',
      'foreign_keys': 'Enable or disable foreign key constraints',
      'synchronous': 'Set the synchronous flag to control disk synchronization',
      'cache_size': 'Set the suggested maximum number of pages in the page cache',
      'temp_store': 'Control where temporary tables and indices are stored',
      'auto_vacuum': 'Set the auto-vacuum mode for the database',
      'integrity_check': 'Check the database for corruption',
      'table_info': 'Return information about table columns',
      'index_list': 'Return information about indexes on a table',
      'wal_checkpoint': 'Checkpoint the write-ahead log'
    }

    return docs[pragma] || `SQLite PRAGMA: ${pragma}`
  }
}