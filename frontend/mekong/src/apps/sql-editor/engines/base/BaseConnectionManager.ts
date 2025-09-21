/**
 * Base Connection Manager Implementation
 * 
 * Abstract base class for managing database connections.
 * Provides common connection lifecycle management functionality.
 */

import { ConnectionManager } from './interfaces'
import { DatabaseConnection, ConnectionStatus, ConnectionTestResult, DatabaseEngine } from '../../types/connections'

/**
 * Abstract base connection manager
 */
export abstract class BaseConnectionManager implements ConnectionManager {
  protected connection: DatabaseConnection | null = null
  protected connectionClient: any = null
  protected isConnectedFlag = false

  public abstract readonly engine: DatabaseEngine

  /**
   * Connect to the database
   */
  public async connect(connection: DatabaseConnection): Promise<void> {
    if (this.isConnectedFlag) {
      await this.disconnect()
    }

    this.connection = connection
    
    try {
      this.connectionClient = await this.createConnection(connection)
      await this.validateConnection(this.connectionClient)
      this.isConnectedFlag = true
      
      // Update connection status
      this.updateConnectionStatus(ConnectionStatus.CONNECTED)
    } catch (error) {
      this.isConnectedFlag = false
      this.connectionClient = null
      this.updateConnectionStatus(ConnectionStatus.ERROR)
      throw new Error(`Failed to connect to ${this.engine}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Disconnect from the database
   */
  public async disconnect(): Promise<void> {
    if (this.connectionClient) {
      try {
        await this.closeConnection(this.connectionClient)
      } catch (error) {
        console.warn(`Error closing connection: ${error}`)
      }
    }
    
    this.connectionClient = null
    this.isConnectedFlag = false
    this.updateConnectionStatus(ConnectionStatus.DISCONNECTED)
  }

  /**
   * Test the database connection
   */
  public async testConnection(connection: DatabaseConnection): Promise<ConnectionTestResult> {
    const startTime = Date.now()
    
    try {
      const testClient = await this.createConnection(connection)
      await this.validateConnection(testClient)
      
      const version = await this.getServerVersion(testClient)
      const responseTime = Date.now() - startTime
      
      await this.closeConnection(testClient)
      
      return {
        success: true,
        details: {
          version,
          responseTime,
          availableDatabases: await this.getAvailableDatabases(connection)
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }
  }

  /**
   * Check if currently connected
   */
  public isConnected(): boolean {
    return this.isConnectedFlag && this.connectionClient !== null
  }

  /**
   * Get current connection info
   */
  public getConnectionInfo(): DatabaseConnection | null {
    return this.connection
  }

  /**
   * Get the native connection client
   */
  public getClient(): any {
    if (!this.isConnected()) {
      throw new Error('Not connected to database')
    }
    return this.connectionClient
  }

  /**
   * Engine-specific connection creation
   */
  protected abstract createConnection(connection: DatabaseConnection): Promise<any>

  /**
   * Engine-specific connection validation
   */
  protected abstract validateConnection(client: any): Promise<void>

  /**
   * Engine-specific connection closing
   */
  protected abstract closeConnection(client: any): Promise<void>

  /**
   * Get server version
   */
  protected abstract getServerVersion(client: any): Promise<string>

  /**
   * Get available databases
   */
  protected abstract getAvailableDatabases(connection: DatabaseConnection): Promise<string[]>

  /**
   * Update connection status (override in subclasses for custom behavior)
   */
  protected updateConnectionStatus(status: ConnectionStatus): void {
    if (this.connection) {
      this.connection.status = status
      this.connection.lastUsed = new Date()
    }
  }

  /**
   * Build connection string from connection object
   */
  protected buildConnectionString(connection: DatabaseConnection): string {
    if (connection.connectionString) {
      return connection.connectionString
    }
    
    return this.getDefaultConnectionString(connection)
  }

  /**
   * Get default connection string format for this engine
   */
  protected abstract getDefaultConnectionString(connection: DatabaseConnection): string
}