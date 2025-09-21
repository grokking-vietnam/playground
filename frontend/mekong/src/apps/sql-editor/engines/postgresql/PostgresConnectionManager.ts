/**
 * PostgreSQL Connection Manager
 * 
 * Manages PostgreSQL database connections using the pg library.
 * Extends BaseConnectionManager to provide PostgreSQL-specific functionality.
 */

import { Client } from 'pg'
import { BaseConnectionManager } from '../base/BaseConnectionManager'
import { DatabaseConnection, DatabaseEngine } from '../../types/connections'

/**
 * PostgreSQL-specific connection manager
 */
export class PostgresConnectionManager extends BaseConnectionManager {
  public readonly engine = DatabaseEngine.POSTGRESQL

  /**
   * Create a new PostgreSQL connection
   */
  protected async createConnection(connection: DatabaseConnection): Promise<Client> {
    const client = new Client({
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.username,
      password: connection.password,
      ssl: connection.ssl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      query_timeout: 30000,
    })

    await client.connect()
    return client
  }

  /**
   * Validate the PostgreSQL connection
   */
  protected async validateConnection(client: Client): Promise<void> {
    const result = await client.query('SELECT 1 as test')
    if (!result.rows || result.rows.length === 0) {
      throw new Error('Connection validation failed')
    }
  }

  /**
   * Close the PostgreSQL connection
   */
  protected async closeConnection(client: Client): Promise<void> {
    await client.end()
  }

  /**
   * Get PostgreSQL server version
   */
  protected async getServerVersion(client: Client): Promise<string> {
    const result = await client.query('SELECT version() as version')
    return result.rows[0]?.version || 'Unknown'
  }

  /**
   * Get available databases
   */
  protected async getAvailableDatabases(connection: DatabaseConnection): Promise<string[]> {
    try {
      // Create a temporary connection to get database list
      const tempClient = await this.createConnection({
        ...connection,
        database: 'postgres' // Connect to default database
      })

      const result = await tempClient.query(`
        SELECT datname FROM pg_database 
        WHERE datistemplate = false 
        ORDER BY datname
      `)

      await this.closeConnection(tempClient)
      return result.rows.map(row => row.datname)
    } catch (error) {
      console.warn('Failed to get available databases:', error)
      return []
    }
  }

  /**
   * Get default PostgreSQL connection string
   */
  protected getDefaultConnectionString(connection: DatabaseConnection): string {
    const { username, password, host, port, database, ssl } = connection
    let connectionString = `postgresql://${username}:${password}@${host}:${port}/${database}`
    
    if (ssl) {
      connectionString += '?sslmode=require'
    }
    
    return connectionString
  }
}