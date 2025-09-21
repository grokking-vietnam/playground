/**
 * MySQL Database Engine
 * 
 * Main MySQL engine implementation that combines all MySQL-specific
 * components into a cohesive plugin.
 */

import { BaseEngine } from '../base/BaseEngine'
import { PluginCapabilities } from '../base/interfaces'
import { DatabaseEngine } from '../../types/connections'
import { MySQLConnectionManager } from './MySQLConnectionManager'
import { MySQLQueryExecutor } from './MySQLQueryExecutor'
import { MySQLSchemaProvider } from './MySQLSchemaProvider'
import { MySQLLanguageService } from './MySQLLanguageService'
import { BaseResultProcessor } from '../postgresql/PostgresResultProcessor'
import { BaseMetadataExtractor } from '../postgresql/PostgresMetadataExtractor'

/**
 * MySQL database engine plugin
 */
export class MySQLEngine extends BaseEngine {
  public readonly engine = DatabaseEngine.MYSQL
  public readonly connectionManager: MySQLConnectionManager
  public readonly queryExecutor: MySQLQueryExecutor
  public readonly schemaProvider: MySQLSchemaProvider
  public readonly sqlLanguageService: MySQLLanguageService
  public readonly resultProcessor: BaseResultProcessor
  public readonly metadataExtractor: BaseMetadataExtractor

  constructor() {
    super()

    // Initialize components
    this.connectionManager = new MySQLConnectionManager()
    this.queryExecutor = new MySQLQueryExecutor(this.connectionManager)
    this.schemaProvider = new MySQLSchemaProvider(this.connectionManager)
    this.sqlLanguageService = new MySQLLanguageService()
    // Reusing PostgreSQL result processor and metadata extractor for now
    this.resultProcessor = new BaseResultProcessor()
    this.metadataExtractor = new BaseMetadataExtractor(this.connectionManager as any)
  }

  /**
   * Get MySQL plugin capabilities
   */
  public getCapabilities(): PluginCapabilities {
    return {
      supportsTransactions: true,
      supportsPreparedStatements: true,
      supportsStreaming: true,
      supportsSSL: true,
      supportsConnectionPooling: true,
      supportsConcurrentQueries: true,
      maxConnections: 151, // Default MySQL max_connections
      supportedAuthMethods: [
        'mysql_native_password',
        'caching_sha2_password',
        'sha256_password',
        'auth_socket',
        'mysql_clear_password'
      ]
    }
  }

  /**
   * Get default configuration for MySQL
   */
  protected getDefaultConfig(): Record<string, any> {
    return {
      connectionTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 30000,
      maxConnections: 10,
      charset: 'utf8mb4',
      timezone: 'Z',
      ssl: {
        rejectUnauthorized: false
      },
      dateStrings: false,
      debug: false,
      trace: false,
      multipleStatements: false,
      namedPlaceholders: false
    }
  }

  /**
   * MySQL-specific initialization
   */
  protected async onInitialize(): Promise<void> {
    console.log('Initializing MySQL engine...')
    
    // Initialize language service
    await this.initializeLanguageService()
    
    console.log('MySQL engine initialized successfully')
  }

  /**
   * MySQL-specific cleanup
   */
  protected async onDispose(): Promise<void> {
    console.log('Disposing MySQL engine...')
    
    // Disconnect if connected
    if (this.connectionManager.isConnected()) {
      await this.connectionManager.disconnect()
    }
    
    // Clear schema cache
    this.schemaProvider.clearCache()
    
    console.log('MySQL engine disposed successfully')
  }

  /**
   * Initialize language service with MySQL-specific features
   */
  private async initializeLanguageService(): Promise<void> {
    // The language service is already initialized in the constructor
    // This method can be used for additional setup if needed
  }

  /**
   * Get engine information
   */
  public getEngineInfo(): Record<string, any> {
    return {
      name: 'MySQL',
      engine: this.engine,
      version: '8.0+',
      description: 'MySQL database engine with high performance and reliability',
      capabilities: this.getCapabilities(),
      supportedVersions: ['5.7', '8.0', '8.1', '8.2'],
      officialDocumentation: 'https://dev.mysql.com/doc/',
      features: [
        'ACID compliance',
        'InnoDB storage engine',
        'JSON data type',
        'Common Table Expressions (CTEs)',
        'Window functions',
        'Triggers and stored procedures',
        'Full-text indexing',
        'Replication and clustering',
        'Partitioning',
        'Multiple storage engines',
        'Spatial data support',
        'Performance Schema',
        'Information Schema'
      ]
    }
  }

  /**
   * Validate MySQL connection configuration
   */
  public validateConnectionConfig(config: Record<string, any>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Required fields
    if (!config.host) errors.push('Host is required')
    if (!config.port) errors.push('Port is required')
    if (!config.database) errors.push('Database name is required')
    if (!config.username) errors.push('Username is required')
    if (!config.password) errors.push('Password is required')

    // Validate port
    if (config.port && (config.port < 1 || config.port > 65535)) {
      errors.push('Port must be between 1 and 65535')
    }

    // Validate database name (MySQL has restrictions)
    if (config.database && config.database.length > 64) {
      errors.push('Database name cannot exceed 64 characters')
    }

    // Validate SSL configuration
    if (config.ssl && typeof config.ssl !== 'boolean' && typeof config.ssl !== 'object') {
      errors.push('SSL configuration must be boolean or object')
    }

    // Validate charset
    if (config.charset && !this.isValidCharset(config.charset)) {
      errors.push('Invalid charset specified')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if charset is valid for MySQL
   */
  private isValidCharset(charset: string): boolean {
    const validCharsets = [
      'utf8', 'utf8mb4', 'latin1', 'latin2', 'ascii',
      'cp1250', 'cp1251', 'cp1256', 'cp1257', 'utf16',
      'utf16le', 'utf32', 'binary', 'geostd8', 'cp932',
      'eucjpms', 'gb18030'
    ]
    return validCharsets.includes(charset.toLowerCase())
  }

  /**
   * Get connection string template
   */
  public getConnectionStringTemplate(): string {
    return 'mysql://username:password@host:port/database?ssl=true&charset=utf8mb4'
  }

  /**
   * Get default port
   */
  public getDefaultPort(): number {
    return 3306
  }
}