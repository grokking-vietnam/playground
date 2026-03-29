/**
 * Base Schema Provider Implementation
 * 
 * Abstract base class for database schema introspection.
 * Provides common schema discovery patterns.
 */

import { 
  SchemaProvider, 
  DatabaseSchema, 
  DatabaseInfo, 
  SchemaInfo, 
  TableInfo, 
  ViewInfo 
} from './interfaces'
import { DatabaseConnection, DatabaseEngine } from '../../types/connections'
import { BaseConnectionManager } from './BaseConnectionManager'

/**
 * Abstract base schema provider
 */
export abstract class BaseSchemaProvider implements SchemaProvider {
  protected connectionManager: BaseConnectionManager
  protected schemaCache: Map<string, DatabaseSchema> = new Map()
  protected cacheTimeout = 5 * 60 * 1000 // 5 minutes

  constructor(connectionManager: BaseConnectionManager) {
    this.connectionManager = connectionManager
  }

  public abstract readonly engine: DatabaseEngine

  /**
   * Get database schema information
   */
  public async getSchema(connection: DatabaseConnection): Promise<DatabaseSchema> {
    const cacheKey = this.getCacheKey(connection)
    const cached = this.schemaCache.get(cacheKey)
    
    if (cached && this.isCacheValid(cacheKey)) {
      return cached
    }

    const schema = await this.loadSchema(connection)
    this.schemaCache.set(cacheKey, schema)
    
    return schema
  }

  /**
   * Refresh schema information
   */
  public async refreshSchema(connection: DatabaseConnection): Promise<DatabaseSchema> {
    const cacheKey = this.getCacheKey(connection)
    this.schemaCache.delete(cacheKey)
    return this.getSchema(connection)
  }

  /**
   * Get detailed table information
   */
  public async getTableInfo(
    connection: DatabaseConnection, 
    schemaName: string, 
    tableName: string
  ): Promise<TableInfo> {
    if (!this.connectionManager.isConnected()) {
      throw new Error('Database connection is not established')
    }

    const client = this.connectionManager.getClient()
    return this.loadTableInfo(client, schemaName, tableName)
  }

  /**
   * Get detailed view information
   */
  public async getViewInfo(
    connection: DatabaseConnection, 
    schemaName: string, 
    viewName: string
  ): Promise<ViewInfo> {
    if (!this.connectionManager.isConnected()) {
      throw new Error('Database connection is not established')
    }

    const client = this.connectionManager.getClient()
    return this.loadViewInfo(client, schemaName, viewName)
  }

  /**
   * Engine-specific schema loading
   */
  protected abstract loadSchema(connection: DatabaseConnection): Promise<DatabaseSchema>

  /**
   * Engine-specific table info loading
   */
  protected abstract loadTableInfo(client: any, schemaName: string, tableName: string): Promise<TableInfo>

  /**
   * Engine-specific view info loading
   */
  protected abstract loadViewInfo(client: any, schemaName: string, viewName: string): Promise<ViewInfo>

  /**
   * Engine-specific database list loading
   */
  protected abstract loadDatabases(client: any): Promise<DatabaseInfo[]>

  /**
   * Engine-specific schema list loading
   */
  protected abstract loadSchemas(client: any, databaseName: string): Promise<SchemaInfo[]>

  /**
   * Engine-specific server version detection
   */
  protected abstract getServerVersion(client: any): Promise<string>

  /**
   * Generate cache key for connection
   */
  protected getCacheKey(connection: DatabaseConnection): string {
    return `${connection.engine}:${connection.host}:${connection.port}:${connection.database}`
  }

  /**
   * Check if cache entry is valid
   */
  protected isCacheValid(cacheKey: string): boolean {
    // Simple time-based cache validation
    // In a real implementation, you might want more sophisticated cache invalidation
    return true // For now, assume cache is always valid within timeout
  }

  /**
   * Clear schema cache
   */
  public clearCache(): void {
    this.schemaCache.clear()
  }

  /**
   * Execute query and return results
   */
  protected async executeQuery(client: any, query: string): Promise<any> {
    // This should be implemented by subclasses based on their specific client type
    throw new Error('executeQuery must be implemented by subclasses')
  }
}