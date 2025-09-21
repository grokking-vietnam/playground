/**
 * SQLite Connection Manager
 * 
 * Manages SQLite database connections using the better-sqlite3 library.
 * Extends BaseConnectionManager to provide SQLite-specific functionality.
 */

import Database from 'better-sqlite3'
import { BaseConnectionManager } from '../base/BaseConnectionManager'
import { DatabaseConnection, DatabaseEngine } from '../../types/connections'

/**
 * SQLite-specific connection manager
 */
export class SQLiteConnectionManager extends BaseConnectionManager {
  public readonly engine = DatabaseEngine.SQLITE

  /**
   * Create a new SQLite connection
   */
  protected async createConnection(connection: DatabaseConnection): Promise<Database.Database> {
    const databasePath = connection.database
    
    // Handle special case for in-memory database
    const dbPath = databasePath === ':memory:' ? ':memory:' : databasePath
    
    const options: Database.Options = {
      readonly: false,
      fileMustExist: databasePath !== ':memory:' ? false : undefined,
      timeout: 10000,
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
    }

    const db = new Database(dbPath, options)
    
    // Set pragmas for better performance and compatibility
    db.pragma('journal_mode = WAL')
    db.pragma('synchronous = NORMAL')
    db.pragma('foreign_keys = ON')
    db.pragma('temp_store = MEMORY')
    
    return db
  }

  /**
   * Validate the SQLite connection
   */
  protected async validateConnection(client: Database.Database): Promise<void> {
    try {
      const result = client.prepare('SELECT 1 as test').get()
      if (!result || (result as any).test !== 1) {
        throw new Error('Connection validation failed')
      }
    } catch (error) {
      throw new Error('SQLite connection validation failed')
    }
  }

  /**
   * Close the SQLite connection
   */
  protected async closeConnection(client: Database.Database): Promise<void> {
    client.close()
  }

  /**
   * Get SQLite server version
   */
  protected async getServerVersion(client: Database.Database): Promise<string> {
    try {
      const result = client.prepare('SELECT sqlite_version() as version').get() as any
      return `SQLite ${result.version}`
    } catch (error) {
      return 'SQLite Unknown'
    }
  }

  /**
   * Get available databases (SQLite has only one database per file)
   */
  protected async getAvailableDatabases(connection: DatabaseConnection): Promise<string[]> {
    // SQLite has only one database per file
    return [connection.database === ':memory:' ? 'memory' : connection.database]
  }

  /**
   * Get default SQLite connection string
   */
  protected getDefaultConnectionString(connection: DatabaseConnection): string {
    return `sqlite:///${connection.database}`
  }

  /**
   * Get SQLite database file path
   */
  public getDatabasePath(): string | null {
    return this.connection?.database || null
  }

  /**
   * Check if database is in-memory
   */
  public isInMemoryDatabase(): boolean {
    return this.connection?.database === ':memory:'
  }

  /**
   * Get database file size (returns 0 for in-memory databases)
   */
  public async getDatabaseSize(): Promise<number> {
    if (this.isInMemoryDatabase() || !this.connection) {
      return 0
    }

    try {
      const fs = await import('fs')
      const stats = fs.statSync(this.connection.database)
      return stats.size
    } catch (error) {
      return 0
    }
  }

  /**
   * Vacuum the database to optimize storage
   */
  public async vacuum(): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Not connected to database')
    }

    const client = this.getClient() as Database.Database
    client.exec('VACUUM')
  }

  /**
   * Get database integrity check
   */
  public async checkIntegrity(): Promise<{ isValid: boolean; errors: string[] }> {
    if (!this.isConnected()) {
      throw new Error('Not connected to database')
    }

    const client = this.getClient() as Database.Database
    try {
      const results = client.prepare('PRAGMA integrity_check').all() as any[]
      const isValid = results.length === 1 && results[0].integrity_check === 'ok'
      const errors = isValid ? [] : results.map(r => r.integrity_check)
      
      return { isValid, errors }
    } catch (error) {
      return { 
        isValid: false, 
        errors: [error instanceof Error ? error.message : 'Unknown integrity check error']
      }
    }
  }
}