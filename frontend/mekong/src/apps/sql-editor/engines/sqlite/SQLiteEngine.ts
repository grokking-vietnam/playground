/**
 * SQLite Database Engine
 * 
 * Main SQLite engine implementation that combines all SQLite-specific
 * components into a cohesive plugin.
 */

import { BaseEngine } from '../base/BaseEngine'
import { PluginCapabilities, SchemaProvider } from '../base/interfaces'
import { DatabaseEngine } from '../../types/connections'
import { SQLiteConnectionManager } from './SQLiteConnectionManager'
import { SQLiteQueryExecutor } from './SQLiteQueryExecutor'
import { SQLiteLanguageService } from './SQLiteLanguageService'
import { BaseResultProcessor } from '../postgresql/PostgresResultProcessor'
import { BaseMetadataExtractor } from '../postgresql/PostgresMetadataExtractor'

/**
 * Simple SQLite Schema Provider (simplified implementation)
 */
class SQLiteSchemaProvider implements SchemaProvider {
  constructor(private connectionManager: SQLiteConnectionManager) {}
  
  public clearCache(): void {
    // No-op for now
  }

  public async getSchema(): Promise<any> {
    // Simplified implementation
    return { databases: [], version: 'SQLite', serverInfo: {} }
  }

  public async refreshSchema(): Promise<any> {
    return this.getSchema()
  }

  public async getTableInfo(): Promise<any> {
    return { name: '', type: 'table', columns: [] }
  }

  public async getViewInfo(): Promise<any> {
    return { name: '', definition: '', columns: [] }
  }
}

/**
 * SQLite database engine plugin
 */
export class SQLiteEngine extends BaseEngine {
  public readonly engine = DatabaseEngine.SQLITE
  public readonly connectionManager: SQLiteConnectionManager
  public readonly queryExecutor: SQLiteQueryExecutor
  public readonly schemaProvider: SQLiteSchemaProvider
  public readonly sqlLanguageService: SQLiteLanguageService
  public readonly resultProcessor: BaseResultProcessor
  public readonly metadataExtractor: BaseMetadataExtractor

  constructor() {
    super()

    // Initialize components
    this.connectionManager = new SQLiteConnectionManager()
    this.queryExecutor = new SQLiteQueryExecutor(this.connectionManager)
    this.schemaProvider = new SQLiteSchemaProvider(this.connectionManager)
    this.sqlLanguageService = new SQLiteLanguageService()
    // Reusing PostgreSQL result processor and metadata extractor for now
    this.resultProcessor = new BaseResultProcessor()
    this.metadataExtractor = new BaseMetadataExtractor(this.connectionManager as any)
  }

  /**
   * Get SQLite plugin capabilities
   */
  public getCapabilities(): PluginCapabilities {
    return {
      supportsTransactions: true,
      supportsPreparedStatements: true,
      supportsStreaming: false, // SQLite is synchronous
      supportsSSL: false, // SQLite is file-based
      supportsConnectionPooling: false, // SQLite connections are lightweight
      supportsConcurrentQueries: false, // SQLite has limited concurrency
      maxConnections: 1, // SQLite allows only one writer at a time
      supportedAuthMethods: [] // SQLite doesn't have authentication
    }
  }

  /**
   * Get default configuration for SQLite
   */
  protected getDefaultConfig(): Record<string, any> {
    return {
      timeout: 10000,
      readonly: false,
      fileMustExist: false,
      verbose: false,
      pragmas: {
        journal_mode: 'WAL',
        synchronous: 'NORMAL',
        foreign_keys: 'ON',
        temp_store: 'MEMORY'
      }
    }
  }

  /**
   * SQLite-specific initialization
   */
  protected async onInitialize(): Promise<void> {
    console.log('Initializing SQLite engine...')
    
    // Initialize language service
    await this.initializeLanguageService()
    
    console.log('SQLite engine initialized successfully')
  }

  /**
   * SQLite-specific cleanup
   */
  protected async onDispose(): Promise<void> {
    console.log('Disposing SQLite engine...')
    
    // Disconnect if connected
    if (this.connectionManager.isConnected()) {
      await this.connectionManager.disconnect()
    }
    
    // Clear schema cache
    this.schemaProvider.clearCache()
    
    console.log('SQLite engine disposed successfully')
  }

  /**
   * Initialize language service with SQLite-specific features
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
      name: 'SQLite',
      engine: this.engine,
      version: '3.44+',
      description: 'SQLite embedded database engine with ACID compliance',
      capabilities: this.getCapabilities(),
      supportedVersions: ['3.35', '3.36', '3.37', '3.38', '3.39', '3.40', '3.41', '3.42', '3.43', '3.44'],
      officialDocumentation: 'https://www.sqlite.org/docs.html',
      features: [
        'ACID compliance',
        'Zero-configuration',
        'Self-contained',
        'File-based database',
        'In-memory database support',
        'Full-text search (FTS)',
        'JSON support',
        'Common Table Expressions (CTEs)',
        'Window functions',
        'Triggers',
        'Views',
        'Indexes',
        'PRAGMA statements',
        'WAL mode',
        'Virtual tables',
        'R-Tree spatial index'
      ]
    }
  }

  /**
   * Validate SQLite connection configuration
   */
  public validateConnectionConfig(config: Record<string, any>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Required fields
    if (!config.database) {
      errors.push('Database path is required')
    }

    // Validate database path
    if (config.database) {
      const dbPath = config.database as string
      
      // Check for valid file extensions or :memory:
      if (dbPath !== ':memory:' && !this.hasValidSQLiteExtension(dbPath)) {
        errors.push('Database should have a valid extension (.db, .sqlite, .sqlite3) or be ":memory:" for in-memory database')
      }

      // Check for absolute paths on server-side usage
      if (typeof window === 'undefined' && dbPath !== ':memory:' && !dbPath.startsWith('/')) {
        errors.push('Database path should be absolute when running on server')
      }
    }

    // SQLite doesn't use host, port, username, password
    // But we should warn if they're provided
    if (config.host && config.host !== '') {
      errors.push('SQLite is file-based and does not use a host')
    }
    
    if (config.port && config.port !== 0) {
      errors.push('SQLite is file-based and does not use a port')
    }

    if (config.username && config.username !== '') {
      errors.push('SQLite does not support authentication (username not needed)')
    }

    if (config.password && config.password !== '') {
      errors.push('SQLite does not support authentication (password not needed)')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if file has valid SQLite extension
   */
  private hasValidSQLiteExtension(filePath: string): boolean {
    const validExtensions = ['.db', '.sqlite', '.sqlite3', '.db3']
    return validExtensions.some(ext => filePath.toLowerCase().endsWith(ext))
  }

  /**
   * Get connection string template
   */
  public getConnectionStringTemplate(): string {
    return 'sqlite:///path/to/database.db'
  }

  /**
   * Get default port (not applicable for SQLite)
   */
  public getDefaultPort(): number {
    return 0
  }

  /**
   * Get SQLite-specific utility methods
   */
  public getSQLiteUtilities() {
    return {
      /**
       * Check database integrity
       */
      checkIntegrity: async () => {
        return this.connectionManager.checkIntegrity()
      },

      /**
       * Vacuum database
       */
      vacuum: async () => {
        return this.connectionManager.vacuum()
      },

      /**
       * Get database file size
       */
      getDatabaseSize: async () => {
        return this.connectionManager.getDatabaseSize()
      },

      /**
       * Check if database is in-memory
       */
      isInMemory: () => {
        return this.connectionManager.isInMemoryDatabase()
      },

      /**
       * Execute transaction
       */
      executeTransaction: async (queries: string[]) => {
        return this.queryExecutor.executeTransaction(queries)
      }
    }
  }
}