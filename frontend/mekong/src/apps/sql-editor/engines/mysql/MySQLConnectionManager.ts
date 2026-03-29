/**
 * MySQL Connection Manager
 * 
 * Manages MySQL database connections using the mysql2 library.
 * Extends BaseConnectionManager to provide MySQL-specific functionality.
 */

import mysql, { Connection, PoolConnection } from 'mysql2/promise'
import { BaseConnectionManager } from '../base/BaseConnectionManager'
import { DatabaseConnection, DatabaseEngine } from '../../types/connections'

/**
 * MySQL-specific connection manager
 */
export class MySQLConnectionManager extends BaseConnectionManager {
  public readonly engine = DatabaseEngine.MYSQL

  /**
   * Create a new MySQL connection
   */
  protected async createConnection(connection: DatabaseConnection): Promise<Connection> {
    const connectionConfig = {
      host: connection.host,
      port: connection.port,
      database: connection.database,
      user: connection.username,
      password: connection.password,
      ssl: connection.ssl ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 10000,
      acquireTimeout: 10000,
      queryTimeout: 30000,
      charset: 'utf8mb4',
      timezone: 'Z'
    }

    const mysqlConnection = await mysql.createConnection(connectionConfig)
    return mysqlConnection
  }

  /**
   * Validate the MySQL connection
   */
  protected async validateConnection(client: Connection): Promise<void> {
    const [result] = await client.execute('SELECT 1 as test')
    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Connection validation failed')
    }
  }

  /**
   * Close the MySQL connection
   */
  protected async closeConnection(client: Connection): Promise<void> {
    await client.end()
  }

  /**
   * Get MySQL server version
   */
  protected async getServerVersion(client: Connection): Promise<string> {
    const [rows] = await client.execute('SELECT VERSION() as version')
    const result = rows as any[]
    return result[0]?.version || 'Unknown'
  }

  /**
   * Get available databases
   */
  protected async getAvailableDatabases(connection: DatabaseConnection): Promise<string[]> {
    try {
      // Create a temporary connection to get database list
      const tempClient = await this.createConnection({
        ...connection,
        database: 'information_schema' // Connect to information_schema
      })

      const [rows] = await tempClient.execute('SHOW DATABASES')
      const databases = rows as any[]

      await this.closeConnection(tempClient)
      return databases
        .map(row => row.Database)
        .filter((db: string) => !['information_schema', 'performance_schema', 'mysql', 'sys'].includes(db))
    } catch (error) {
      console.warn('Failed to get available databases:', error)
      return []
    }
  }

  /**
   * Get default MySQL connection string
   */
  protected getDefaultConnectionString(connection: DatabaseConnection): string {
    const { username, password, host, port, database, ssl } = connection
    let connectionString = `mysql://${username}:${password}@${host}:${port}/${database}`
    
    if (ssl) {
      connectionString += '?ssl=true'
    }
    
    return connectionString
  }
}