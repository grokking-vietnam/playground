/**
 * Base Database Engine Implementation
 * 
 * Abstract base class that provides common functionality for all database engines.
 * Each specific engine (PostgreSQL, MySQL, SQLite) extends this class.
 */

import { 
  DatabaseEnginePlugin, 
  ConnectionManager, 
  QueryExecutor, 
  SchemaProvider, 
  SQLLanguageService, 
  ResultProcessor, 
  MetadataExtractor,
  PluginCapabilities 
} from './interfaces'
import { DatabaseEngine } from '../../types/connections'

/**
 * Abstract base class for database engines
 */
export abstract class BaseEngine implements DatabaseEnginePlugin {
  public abstract readonly engine: DatabaseEngine
  public abstract readonly connectionManager: ConnectionManager
  public abstract readonly queryExecutor: QueryExecutor
  public abstract readonly schemaProvider: SchemaProvider
  public abstract readonly sqlLanguageService: SQLLanguageService
  public abstract readonly resultProcessor: ResultProcessor
  public abstract readonly metadataExtractor: MetadataExtractor

  protected config: Record<string, any> = {}
  protected initialized = false

  /**
   * Initialize the plugin with configuration
   */
  public async initialize(config: Record<string, any> = {}): Promise<void> {
    this.config = { ...this.getDefaultConfig(), ...config }
    await this.onInitialize()
    this.initialized = true
  }

  /**
   * Clean up resources
   */
  public async dispose(): Promise<void> {
    if (this.initialized) {
      await this.onDispose()
      this.initialized = false
    }
  }

  /**
   * Get plugin capabilities
   */
  public abstract getCapabilities(): PluginCapabilities

  /**
   * Get default configuration for this engine
   */
  protected abstract getDefaultConfig(): Record<string, any>

  /**
   * Engine-specific initialization logic
   */
  protected abstract onInitialize(): Promise<void>

  /**
   * Engine-specific cleanup logic
   */
  protected abstract onDispose(): Promise<void>

  /**
   * Check if the engine is initialized
   */
  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(`Database engine ${this.engine} is not initialized`)
    }
  }
}