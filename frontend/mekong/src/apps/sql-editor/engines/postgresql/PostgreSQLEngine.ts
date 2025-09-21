/**
 * PostgreSQL Database Engine
 * 
 * Main PostgreSQL engine implementation that combines all PostgreSQL-specific
 * components into a cohesive plugin.
 */

import { BaseEngine } from '../base/BaseEngine'
import { PluginCapabilities } from '../base/interfaces'
import { DatabaseEngine } from '../../types/connections'
import { PostgresConnectionManager } from './PostgresConnectionManager'
import { PostgresQueryExecutor } from './PostgresQueryExecutor'
import { PostgresSchemaProvider } from './PostgresSchemaProvider'
import { PostgresLanguageService } from './PostgresLanguageService'
import { BaseResultProcessor } from './PostgresResultProcessor'
import { BaseMetadataExtractor } from './PostgresMetadataExtractor'

/**
 * PostgreSQL database engine plugin
 */
export class PostgreSQLEngine extends BaseEngine {
  public readonly engine = DatabaseEngine.POSTGRESQL
  public readonly connectionManager: PostgresConnectionManager
  public readonly queryExecutor: PostgresQueryExecutor
  public readonly schemaProvider: PostgresSchemaProvider
  public readonly sqlLanguageService: PostgresLanguageService
  public readonly resultProcessor: BaseResultProcessor
  public readonly metadataExtractor: BaseMetadataExtractor

  constructor() {
    super()

    // Initialize components
    this.connectionManager = new PostgresConnectionManager()
    this.queryExecutor = new PostgresQueryExecutor(this.connectionManager)
    this.schemaProvider = new PostgresSchemaProvider(this.connectionManager)
    this.sqlLanguageService = new PostgresLanguageService()
    this.resultProcessor = new BaseResultProcessor()
    this.metadataExtractor = new BaseMetadataExtractor(this.connectionManager)
  }

  /**
   * Get PostgreSQL plugin capabilities
   */
  public getCapabilities(): PluginCapabilities {
    return {
      supportsTransactions: true,
      supportsPreparedStatements: true,
      supportsStreaming: true,
      supportsSSL: true,
      supportsConnectionPooling: true,
      supportsConcurrentQueries: true,
      maxConnections: 100, // Default PostgreSQL max connections
      supportedAuthMethods: [
        'password',
        'md5',
        'scram-sha-256',
        'gss',
        'sspi',
        'ident',
        'peer',
        'ldap',
        'radius',
        'cert',
        'pam',
        'bsd'
      ]
    }
  }

  /**
   * Get default configuration for PostgreSQL
   */
  protected getDefaultConfig(): Record<string, any> {
    return {
      connectionTimeout: 10000,
      queryTimeout: 30000,
      maxConnections: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: {
        rejectUnauthorized: false
      },
      query_timeout: 30000,
      statement_timeout: 30000,
      application_name: 'SQL Editor',
      client_encoding: 'UTF8'
    }
  }

  /**
   * PostgreSQL-specific initialization
   */
  protected async onInitialize(): Promise<void> {
    console.log('Initializing PostgreSQL engine...')
    
    // Initialize language service
    await this.initializeLanguageService()
    
    console.log('PostgreSQL engine initialized successfully')
  }

  /**
   * PostgreSQL-specific cleanup
   */
  protected async onDispose(): Promise<void> {
    console.log('Disposing PostgreSQL engine...')
    
    // Disconnect if connected
    if (this.connectionManager.isConnected()) {
      await this.connectionManager.disconnect()
    }
    
    // Clear schema cache
    this.schemaProvider.clearCache()
    
    console.log('PostgreSQL engine disposed successfully')
  }

  /**
   * Initialize language service with PostgreSQL-specific features
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
      name: 'PostgreSQL',
      engine: this.engine,
      version: '15.0+',
      description: 'PostgreSQL database engine with advanced SQL features',
      capabilities: this.getCapabilities(),
      supportedVersions: ['9.6', '10', '11', '12', '13', '14', '15', '16'],
      officialDocumentation: 'https://www.postgresql.org/docs/',
      features: [
        'Advanced SQL compliance',
        'JSON/JSONB support',
        'Array data types',
        'Full-text search',
        'Window functions',
        'Common Table Expressions (CTEs)',
        'Recursive queries',
        'Triggers and stored procedures',
        'Extensions and custom functions',
        'ACID compliance',
        'Multi-version concurrency control (MVCC)',
        'Point-in-time recovery',
        'Streaming replication'
      ]
    }
  }

  /**
   * Validate PostgreSQL connection configuration
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

    // Validate SSL configuration
    if (config.ssl && typeof config.ssl !== 'boolean' && typeof config.ssl !== 'object') {
      errors.push('SSL configuration must be boolean or object')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Get connection string template
   */
  public getConnectionStringTemplate(): string {
    return 'postgresql://username:password@host:port/database?sslmode=require'
  }

  /**
   * Get default port
   */
  public getDefaultPort(): number {
    return 5432
  }
}