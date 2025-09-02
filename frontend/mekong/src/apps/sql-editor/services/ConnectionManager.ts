/**
 * Connection Manager Service for Database Connections
 * 
 * This service manages CRUD operations for database connections,
 * including secure storage, connection testing, and status monitoring.
 */

import { 
  DatabaseConnection, 
  ConnectionFormData, 
  ConnectionTestResult, 
  ConnectionManagerOptions,
  DatabaseEngine,
  ConnectionStatus,
  DEFAULT_PORTS
} from '../types/connections'
import { encryptionService, EncryptedData } from './EncryptionService'

/**
 * Storage key for connections in localStorage
 */
const CONNECTIONS_STORAGE_KEY = 'sql-editor-connections'

/**
 * Connection Manager Service
 */
export class ConnectionManager {
  private static instance: ConnectionManager
  private options: ConnectionManagerOptions
  private connections: Map<string, DatabaseConnection> = new Map()
  private connectionListeners: Set<(connections: DatabaseConnection[]) => void> = new Set()

  private constructor(options: ConnectionManagerOptions = {}) {
    this.options = {
      autoTest: true,
      timeout: 10000,
      encryptPasswords: true,
      ...options
    }
    this.loadConnections()
  }

  /**
   * Get singleton instance of ConnectionManager
   */
  public static getInstance(options?: ConnectionManagerOptions): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager(options)
    }
    return ConnectionManager.instance
  }

  /**
   * Initialize the connection manager
   */
  public async initialize(): Promise<void> {
    // Initialize encryption service if not already done
    if (!encryptionService.isInitialized()) {
      await encryptionService.initialize()
    }
    
    // Load existing connections
    await this.loadConnections()
  }

  /**
   * Create a new database connection
   */
  public async createConnection(data: ConnectionFormData): Promise<DatabaseConnection> {
    try {
      // Generate unique ID
      const id = this.generateConnectionId()
      
      // Encrypt password if encryption is enabled
      let encryptedPassword = data.password
      if (this.options.encryptPasswords && encryptionService.isInitialized()) {
        const encrypted = await encryptionService.encrypt(data.password)
        encryptedPassword = JSON.stringify(encrypted)
      }

      // Create connection object
      const connection: DatabaseConnection = {
        id,
        name: data.name,
        engine: data.engine,
        host: data.host,
        port: data.port || DEFAULT_PORTS[data.engine],
        database: data.database,
        username: data.username,
        password: encryptedPassword,
        ssl: data.ssl,
        connectionString: data.connectionString,
        metadata: {},
        createdAt: new Date(),
        lastUsed: new Date(),
        status: ConnectionStatus.DISCONNECTED
      }

      // Test connection if auto-test is enabled
      if (this.options.autoTest) {
        const testResult = await this.testConnection(connection)
        connection.status = testResult.success ? ConnectionStatus.CONNECTED : ConnectionStatus.ERROR
        if (testResult.details) {
          connection.metadata = { ...connection.metadata, ...testResult.details }
        }
      }

      // Store connection
      this.connections.set(id, connection)
      await this.saveConnections()
      
      // Notify listeners
      this.notifyConnectionListeners()

      return connection
    } catch (error) {
      console.error('Failed to create connection:', error)
      throw new Error('Failed to create database connection')
    }
  }

  /**
   * Update an existing connection
   */
  public async updateConnection(id: string, data: Partial<ConnectionFormData>): Promise<DatabaseConnection> {
    const existingConnection = this.connections.get(id)
    if (!existingConnection) {
      throw new Error(`Connection with id ${id} not found`)
    }

    try {
      // Encrypt password if provided and encryption is enabled
      let encryptedPassword = existingConnection.password
      if (data.password && this.options.encryptPasswords && encryptionService.isInitialized()) {
        const encrypted = await encryptionService.encrypt(data.password)
        encryptedPassword = JSON.stringify(encrypted)
      }

      // Update connection
      const updatedConnection: DatabaseConnection = {
        ...existingConnection,
        name: data.name ?? existingConnection.name,
        engine: data.engine ?? existingConnection.engine,
        host: data.host ?? existingConnection.host,
        port: data.port ?? existingConnection.port,
        database: data.database ?? existingConnection.database,
        username: data.username ?? existingConnection.username,
        password: data.password ? encryptedPassword : existingConnection.password,
        ssl: data.ssl ?? existingConnection.ssl,
        connectionString: data.connectionString ?? existingConnection.connectionString,
        lastUsed: new Date()
      }

      // Test connection if credentials changed
      if (data.password || data.host || data.port || data.username) {
        const testResult = await this.testConnection(updatedConnection)
        updatedConnection.status = testResult.success ? ConnectionStatus.CONNECTED : ConnectionStatus.ERROR
      }

      // Store updated connection
      this.connections.set(id, updatedConnection)
      await this.saveConnections()
      
      // Notify listeners
      this.notifyConnectionListeners()

      return updatedConnection
    } catch (error) {
      console.error('Failed to update connection:', error)
      throw new Error('Failed to update database connection')
    }
  }

  /**
   * Delete a connection
   */
  public async deleteConnection(id: string): Promise<void> {
    if (!this.connections.has(id)) {
      throw new Error(`Connection with id ${id} not found`)
    }

    this.connections.delete(id)
    await this.saveConnections()
    
    // Notify listeners
    this.notifyConnectionListeners()
  }

  /**
   * Get all connections
   */
  public async getConnections(): Promise<DatabaseConnection[]> {
    return Array.from(this.connections.values())
  }

  /**
   * Get a specific connection by ID
   */
  public async getConnection(id: string): Promise<DatabaseConnection | null> {
    return this.connections.get(id) || null
  }

  /**
   * Test a connection
   */
  public async testConnection(connection: DatabaseConnection): Promise<ConnectionTestResult> {
    try {
      // Set status to connecting
      connection.status = ConnectionStatus.CONNECTING
      this.notifyConnectionListeners()

      // Decrypt password if needed
      let password = connection.password
      if (this.options.encryptPasswords && encryptionService.isInitialized()) {
        try {
          const encryptedData: EncryptedData = JSON.parse(connection.password)
          password = await encryptionService.decrypt(encryptedData)
        } catch (e) {
          // Password might not be encrypted (backward compatibility)
          password = connection.password
        }
      }

      // Simulate connection test (in a real app, this would make actual network calls)
      const result = await this.simulateConnectionTest(connection, password)
      
      // Update connection status
      connection.status = result.success ? ConnectionStatus.CONNECTED : ConnectionStatus.ERROR
      connection.lastUsed = new Date()
      
      // Save updated status
      await this.saveConnections()
      this.notifyConnectionListeners()

      return result
    } catch (error) {
      console.error('Connection test failed:', error)
      
      // Update status to error
      connection.status = ConnectionStatus.ERROR
      await this.saveConnections()
      this.notifyConnectionListeners()

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }

  /**
   * Get connections by engine type
   */
  public async getConnectionsByEngine(engine: DatabaseEngine): Promise<DatabaseConnection[]> {
    const allConnections = await this.getConnections()
    return allConnections.filter(conn => conn.engine === engine)
  }

  /**
   * Get active connections (connected status)
   */
  public async getActiveConnections(): Promise<DatabaseConnection[]> {
    const allConnections = await this.getConnections()
    return allConnections.filter(conn => conn.status === ConnectionStatus.CONNECTED)
  }

  /**
   * Subscribe to connection changes
   */
  public onConnectionsChange(callback: (connections: DatabaseConnection[]) => void): () => void {
    this.connectionListeners.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.connectionListeners.delete(callback)
    }
  }

  /**
   * Refresh connection status for all connections
   */
  public async refreshAllConnections(): Promise<void> {
    const connections = Array.from(this.connections.values())
    
    // Test all connections in parallel
    const testPromises = connections.map(conn => this.testConnection(conn))
    await Promise.allSettled(testPromises)
  }

  /**
   * Export connections (without passwords for security)
   */
  public async exportConnections(): Promise<Omit<DatabaseConnection, 'password'>[]> {
    const connections = await this.getConnections()
    return connections.map(({ password, ...conn }) => conn)
  }

  /**
   * Import connections
   */
  public async importConnections(connections: Omit<DatabaseConnection, 'password'>[]): Promise<void> {
    for (const conn of connections) {
      // Create connection with empty password (user will need to set it)
      const connectionData: ConnectionFormData = {
        name: conn.name,
        engine: conn.engine,
        host: conn.host,
        port: conn.port,
        database: conn.database,
        username: conn.username,
        password: '', // Will need to be set by user
        ssl: conn.ssl,
        connectionString: conn.connectionString
      }
      
      await this.createConnection(connectionData)
    }
  }

  /**
   * Generate a unique connection ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Load connections from storage
   */
  private async loadConnections(): Promise<void> {
    try {
      const stored = localStorage.getItem(CONNECTIONS_STORAGE_KEY)
      if (stored) {
        const connectionsData = JSON.parse(stored) as DatabaseConnection[]
        this.connections.clear()
        
        for (const conn of connectionsData) {
          // Convert date strings back to Date objects
          conn.createdAt = new Date(conn.createdAt)
          conn.lastUsed = new Date(conn.lastUsed)
          
          // Set initial status
          conn.status = ConnectionStatus.DISCONNECTED
          
          this.connections.set(conn.id, conn)
        }
      }
    } catch (error) {
      console.error('Failed to load connections:', error)
    }
  }

  /**
   * Save connections to storage
   */
  private async saveConnections(): Promise<void> {
    try {
      const connectionsArray = Array.from(this.connections.values())
      localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(connectionsArray))
    } catch (error) {
      console.error('Failed to save connections:', error)
    }
  }

  /**
   * Notify all connection listeners
   */
  private notifyConnectionListeners(): void {
    const connections = Array.from(this.connections.values())
    this.connectionListeners.forEach(callback => {
      try {
        callback(connections)
      } catch (error) {
        console.error('Error in connection listener:', error)
      }
    })
  }

  /**
   * Simulate connection test (placeholder for actual database connection logic)
   */
  private async simulateConnectionTest(
    connection: DatabaseConnection, 
    password: string
  ): Promise<ConnectionTestResult> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // Simple validation logic (in real app, this would make actual database calls)
        const isValid = connection.host && 
                        connection.database && 
                        connection.username && 
                        password &&
                        connection.port > 0

        if (isValid) {
          resolve({
            success: true,
            details: {
              version: this.getSimulatedVersion(connection.engine),
              responseTime: Math.floor(Math.random() * 100) + 50,
              availableDatabases: [connection.database, 'information_schema', 'public']
            }
          })
        } else {
          resolve({
            success: false,
            error: 'Invalid connection parameters'
          })
        }
      }, 500 + Math.random() * 1000) // Random delay between 500-1500ms
    })
  }

  /**
   * Get simulated version for different database engines
   */
  private getSimulatedVersion(engine: DatabaseEngine): string {
    const versions = {
      [DatabaseEngine.POSTGRESQL]: 'PostgreSQL 15.2',
      [DatabaseEngine.MYSQL]: 'MySQL 8.0.33',
      [DatabaseEngine.BIGQUERY]: 'BigQuery 2024.01',
      [DatabaseEngine.SNOWFLAKE]: 'Snowflake 7.34.2',
      [DatabaseEngine.SPARK_SQL]: 'Spark 3.5.0'
    }
    return versions[engine] || 'Unknown'
  }
}

// Export singleton instance
export const connectionManager = ConnectionManager.getInstance()
