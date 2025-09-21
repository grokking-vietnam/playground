/**
 * MySQL Language Service
 * 
 * Provides MySQL-specific SQL language features like keywords, data types,
 * functions, and syntax highlighting.
 */

import { BaseLanguageService } from '../base/BaseLanguageService'
import { CompletionItem } from '../base/interfaces'
import { DatabaseEngine } from '../../types/connections'

/**
 * MySQL-specific language service
 */
export class MySQLLanguageService extends BaseLanguageService {
  public readonly engine = DatabaseEngine.MYSQL

  constructor() {
    super()
    this.initializeMySQLFeatures()
  }

  /**
   * Initialize MySQL-specific language features
   */
  private initializeMySQLFeatures(): void {
    this.keywords = this.getEngineSpecificKeywords()
    this.dataTypes = this.getEngineSpecificDataTypes()
    this.functions = this.getEngineSpecificFunctions()
  }

  /**
   * Get MySQL-specific keywords
   */
  protected getEngineSpecificKeywords(): string[] {
    return [
      // MySQL specific keywords
      'AUTO_INCREMENT', 'ENGINE', 'CHARSET', 'COLLATE',
      'STORAGE', 'MEMORY', 'DISK', 'TEMPORARY',
      'REPLACE', 'DUPLICATE', 'IGNORE', 'LOW_PRIORITY',
      'HIGH_PRIORITY', 'DELAYED', 'QUICK', 'LOCK',
      'UNLOCK', 'OPTIMIZE', 'REPAIR', 'ANALYZE',
      'CHECK', 'CHECKSUM', 'BACKUP', 'RESTORE',
      'FLUSH', 'RESET', 'KILL', 'PROCESSLIST',
      'SHOW', 'EXPLAIN', 'DESCRIBE', 'DESC',
      'USE', 'HANDLER', 'LOAD', 'DATA', 'INFILE',
      'OUTFILE', 'FIELDS', 'TERMINATED', 'ENCLOSED',
      'ESCAPED', 'LINES', 'STARTING', 'ENDING',
      'PARTITION', 'PARTITIONS', 'SUBPARTITION',
      'REORGANIZE', 'EXCHANGE', 'TRUNCATE',
      'FULLTEXT', 'SPATIAL', 'MATCH', 'AGAINST',
      'BOOLEAN', 'MODE', 'EXPANSION', 'QUERY',
      'NATURAL', 'LANGUAGE', 'WITH', 'WITHOUT',
      'MYISAM', 'INNODB', 'NDBCLUSTER', 'MERGE',
      'FEDERATED', 'ARCHIVE', 'CSV', 'BLACKHOLE'
    ]
  }

  /**
   * Get MySQL-specific data types
   */
  protected getEngineSpecificDataTypes(): string[] {
    return [
      // MySQL specific data types
      'TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT',
      'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL',
      'BIT', 'BOOL', 'BOOLEAN',
      'CHAR', 'VARCHAR', 'BINARY', 'VARBINARY',
      'TINYBLOB', 'BLOB', 'MEDIUMBLOB', 'LONGBLOB',
      'TINYTEXT', 'TEXT', 'MEDIUMTEXT', 'LONGTEXT',
      'ENUM', 'SET',
      'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR',
      'GEOMETRY', 'POINT', 'LINESTRING', 'POLYGON',
      'MULTIPOINT', 'MULTILINESTRING', 'MULTIPOLYGON',
      'GEOMETRYCOLLECTION', 'JSON'
    ]
  }

  /**
   * Get MySQL-specific functions
   */
  protected getEngineSpecificFunctions(): string[] {
    return [
      // String functions
      'ASCII', 'BIN', 'CHAR_LENGTH', 'CHARACTER_LENGTH',
      'CONCAT_WS', 'ELT', 'EXPORT_SET', 'FIELD',
      'FIND_IN_SET', 'FORMAT', 'HEX', 'INSERT',
      'INSTR', 'LCASE', 'LEFT', 'LOAD_FILE',
      'LOCATE', 'LOWER', 'LPAD', 'LTRIM',
      'MAKE_SET', 'MATCH', 'MID', 'OCT',
      'POSITION', 'QUOTE', 'REPEAT', 'REPLACE',
      'REVERSE', 'RIGHT', 'RPAD', 'RTRIM',
      'SOUNDEX', 'SPACE', 'STRCMP', 'SUBSTRING',
      'SUBSTRING_INDEX', 'TRIM', 'UCASE', 'UNHEX',
      'UPPER',

      // Numeric functions
      'ABS', 'ACOS', 'ASIN', 'ATAN', 'ATAN2',
      'CEILING', 'CEIL', 'COS', 'COT', 'CRC32',
      'DEGREES', 'EXP', 'FLOOR', 'LN', 'LOG',
      'LOG10', 'LOG2', 'MOD', 'PI', 'POW',
      'POWER', 'RADIANS', 'RAND', 'ROUND',
      'SIGN', 'SIN', 'SQRT', 'TAN', 'TRUNCATE',

      // Date and time functions
      'ADDDATE', 'ADDTIME', 'CONVERT_TZ', 'CURDATE',
      'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP',
      'CURTIME', 'DATE', 'DATE_ADD', 'DATE_FORMAT',
      'DATE_SUB', 'DATEDIFF', 'DAYNAME', 'DAYOFMONTH',
      'DAYOFWEEK', 'DAYOFYEAR', 'EXTRACT', 'FROM_DAYS',
      'FROM_UNIXTIME', 'GET_FORMAT', 'HOUR', 'LAST_DAY',
      'LOCALTIME', 'LOCALTIMESTAMP', 'MAKEDATE',
      'MAKETIME', 'MICROSECOND', 'MINUTE', 'MONTH',
      'MONTHNAME', 'NOW', 'PERIOD_ADD', 'PERIOD_DIFF',
      'QUARTER', 'SEC_TO_TIME', 'SECOND', 'STR_TO_DATE',
      'SUBDATE', 'SUBTIME', 'SYSDATE', 'TIME',
      'TIME_FORMAT', 'TIME_TO_SEC', 'TIMEDIFF',
      'TIMESTAMP', 'TIMESTAMPADD', 'TIMESTAMPDIFF',
      'TO_DAYS', 'TO_SECONDS', 'UNIX_TIMESTAMP',
      'UTC_DATE', 'UTC_TIME', 'UTC_TIMESTAMP',
      'WEEK', 'WEEKDAY', 'WEEKOFYEAR', 'YEAR',
      'YEARWEEK',

      // Aggregate functions
      'AVG', 'BIT_AND', 'BIT_OR', 'BIT_XOR',
      'COUNT', 'GROUP_CONCAT', 'MAX', 'MIN',
      'STD', 'STDDEV', 'STDDEV_POP', 'STDDEV_SAMP',
      'SUM', 'VAR_POP', 'VAR_SAMP', 'VARIANCE',

      // JSON functions (MySQL 5.7+)
      'JSON_ARRAY', 'JSON_OBJECT', 'JSON_QUOTE',
      'JSON_CONTAINS', 'JSON_CONTAINS_PATH', 'JSON_EXTRACT',
      'JSON_KEYS', 'JSON_SEARCH', 'JSON_ARRAYAGG',
      'JSON_OBJECTAGG', 'JSON_ARRAY_APPEND',
      'JSON_ARRAY_INSERT', 'JSON_INSERT', 'JSON_MERGE',
      'JSON_MERGE_PATCH', 'JSON_MERGE_PRESERVE',
      'JSON_REMOVE', 'JSON_REPLACE', 'JSON_SET',
      'JSON_UNQUOTE', 'JSON_DEPTH', 'JSON_LENGTH',
      'JSON_TYPE', 'JSON_VALID',

      // Information functions
      'BENCHMARK', 'CHARSET', 'COERCIBILITY', 'COLLATION',
      'CONNECTION_ID', 'CURRENT_USER', 'DATABASE',
      'FOUND_ROWS', 'LAST_INSERT_ID', 'ROW_COUNT',
      'SCHEMA', 'SESSION_USER', 'SYSTEM_USER',
      'USER', 'VERSION',

      // Encryption functions
      'AES_DECRYPT', 'AES_ENCRYPT', 'COMPRESS',
      'DECODE', 'DES_DECRYPT', 'DES_ENCRYPT',
      'ENCODE', 'ENCRYPT', 'MD5', 'OLD_PASSWORD',
      'PASSWORD', 'SHA1', 'SHA', 'SHA2',
      'UNCOMPRESS', 'UNCOMPRESSED_LENGTH',

      // Control flow functions
      'CASE', 'IF', 'IFNULL', 'NULLIF'
    ]
  }

  /**
   * Format MySQL query with specific formatting rules
   */
  public formatQuery(query: string): string {
    let formatted = super.formatQuery(query)

    // MySQL-specific formatting
    formatted = this.formatMySQLSpecificSyntax(formatted)

    return formatted
  }

  /**
   * Get MySQL-specific completion items
   */
  public getCompletionItems(query: string, position: number): CompletionItem[] {
    const items = super.getCompletionItems(query, position)

    // Add MySQL-specific completion items based on context
    const context = this.analyzeContext(query, position)

    if (context.expectingEngine) {
      // Add MySQL storage engines
      const engines = ['InnoDB', 'MyISAM', 'Memory', 'CSV', 'Archive']
      engines.forEach(engine => {
        items.push({
          label: engine,
          kind: 'keyword',
          detail: 'MySQL Storage Engine',
          documentation: this.getEngineDocumentation(engine),
          insertText: engine
        })
      })
    }

    return items
  }

  /**
   * Format MySQL-specific syntax
   */
  private formatMySQLSpecificSyntax(query: string): string {
    // Handle ENGINE clause
    query = query.replace(/\bENGINE\s*=\s*/gi, '\nENGINE = ')

    // Handle AUTO_INCREMENT
    query = query.replace(/\bAUTO_INCREMENT\b/gi, 'AUTO_INCREMENT')

    // Handle CHARSET
    query = query.replace(/\bCHARSET\s*=\s*/gi, '\nCHARSET = ')

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
      expectingEngine: /\bengine\s*=\s*$/i.test(beforeCursor),
      inBackticks: (beforeCursor.match(/`/g) || []).length % 2 === 1
    }
  }

  /**
   * Get documentation for MySQL storage engines
   */
  private getEngineDocumentation(engine: string): string {
    const docs: Record<string, string> = {
      'InnoDB': 'ACID-compliant storage engine with foreign key support',
      'MyISAM': 'Fast storage engine, good for read-heavy workloads',
      'Memory': 'Stores data in RAM for fastest access',
      'CSV': 'Stores data in comma-separated values format',
      'Archive': 'Compressed storage for archival data'
    }

    return docs[engine] || `MySQL ${engine} storage engine`
  }
}