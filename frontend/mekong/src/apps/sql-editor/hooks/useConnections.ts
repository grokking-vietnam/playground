/**
 * useConnections Hook
 * 
 * React hook for managing database connections state and operations.
 * Provides a clean interface for components to interact with the ConnectionManager.
 */

import { useState, useEffect, useCallback } from 'react'
import { 
  DatabaseConnection, 
  ConnectionFormData, 
  ConnectionTestResult,
  DatabaseEngine,
  ConnectionStatus
} from '../types/connections'
import { connectionManager } from '../services/ConnectionManager'

/**
 * Hook state interface
 */
interface UseConnectionsState {
  /** All available connections */
  connections: DatabaseConnection[]
  /** Currently selected/active connection */
  activeConnection: DatabaseConnection | null
  /** Loading state for async operations */
  loading: boolean
  /** Error state */
  error: string | null
  /** Connection testing state */
  testing: Record<string, boolean>
}

/**
 * Hook return interface
 */
interface UseConnectionsReturn extends UseConnectionsState {
  // Connection CRUD operations
  /** Create a new connection */
  createConnection: (data: ConnectionFormData) => Promise<DatabaseConnection>
  /** Update an existing connection */
  updateConnection: (id: string, data: Partial<ConnectionFormData>) => Promise<DatabaseConnection>
  /** Delete a connection */
  deleteConnection: (id: string) => Promise<void>
  /** Get a specific connection */
  getConnection: (id: string) => Promise<DatabaseConnection | null>
  
  // Connection testing
  /** Test a connection */
  testConnection: (connection: DatabaseConnection) => Promise<ConnectionTestResult>
  /** Test connection by ID */
  testConnectionById: (id: string) => Promise<ConnectionTestResult>
  /** Refresh all connection statuses */
  refreshAllConnections: () => Promise<void>
  
  // Connection selection
  /** Set the active connection */
  setActiveConnection: (connection: DatabaseConnection | null) => void
  /** Set active connection by ID */
  setActiveConnectionById: (id: string) => void
  
  // Filtering and querying
  /** Get connections by engine type */
  getConnectionsByEngine: (engine: DatabaseEngine) => DatabaseConnection[]
  /** Get only connected connections */
  getActiveConnections: () => DatabaseConnection[]
  /** Get connections with errors */
  getErrorConnections: () => DatabaseConnection[]
  
  // Utility functions
  /** Refresh connections from storage */
  refreshConnections: () => Promise<void>
  /** Clear error state */
  clearError: () => void
  /** Export connections */
  exportConnections: () => Promise<Omit<DatabaseConnection, 'password'>[]>
  /** Import connections */
  importConnections: (connections: Omit<DatabaseConnection, 'password'>[]) => Promise<void>
}

/**
 * Custom hook for managing database connections
 */
export function useConnections(): UseConnectionsReturn {
  const [state, setState] = useState<UseConnectionsState>({
    connections: [],
    activeConnection: null,
    loading: false,
    error: null,
    testing: {}
  })

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<UseConnectionsState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  /**
   * Set error state
   */
  const setError = useCallback((error: string | null) => {
    updateState({ error, loading: false })
  }, [updateState])

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    updateState({ loading })
  }, [updateState])

  /**
   * Update testing state for a specific connection
   */
  const setTesting = useCallback((connectionId: string, testing: boolean) => {
    setState(prev => ({
      ...prev,
      testing: {
        ...prev.testing,
        [connectionId]: testing
      }
    }))
  }, [])

  /**
   * Load connections from the manager
   */
  const loadConnections = useCallback(async () => {
    try {
      setLoading(true)
      const connections = await connectionManager.getConnections()
      updateState({ connections, error: null })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load connections')
    } finally {
      setLoading(false)
    }
  }, [setLoading, updateState, setError])

  /**
   * Initialize the connection manager and load connections
   */
  useEffect(() => {
    const initializeConnections = async () => {
      try {
        await connectionManager.initialize()
        await loadConnections()
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to initialize connections')
      }
    }

    initializeConnections()
  }, [loadConnections, setError])

  /**
   * Subscribe to connection changes
   */
  useEffect(() => {
    const unsubscribe = connectionManager.onConnectionsChange((connections) => {
      setState(prev => ({
        ...prev,
        connections,
        // Update active connection if it was modified
        activeConnection: prev.activeConnection 
          ? connections.find(c => c.id === prev.activeConnection!.id) || null
          : null
      }))
    })

    return unsubscribe
  }, [])

  /**
   * Create a new connection
   */
  const createConnection = useCallback(async (data: ConnectionFormData): Promise<DatabaseConnection> => {
    try {
      setLoading(true)
      const connection = await connectionManager.createConnection(data)
      updateState({ error: null })
      return connection
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create connection')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, updateState, setError])

  /**
   * Update an existing connection
   */
  const updateConnection = useCallback(async (id: string, data: Partial<ConnectionFormData>): Promise<DatabaseConnection> => {
    try {
      setLoading(true)
      const connection = await connectionManager.updateConnection(id, data)
      updateState({ error: null })
      return connection
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update connection')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, updateState, setError])

  /**
   * Delete a connection
   */
  const deleteConnection = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true)
      await connectionManager.deleteConnection(id)
      
      // Clear active connection if it was deleted
      setState(prev => ({
        ...prev,
        activeConnection: prev.activeConnection?.id === id ? null : prev.activeConnection,
        error: null
      }))
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete connection')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  /**
   * Get a specific connection
   */
  const getConnection = useCallback(async (id: string): Promise<DatabaseConnection | null> => {
    try {
      return await connectionManager.getConnection(id)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get connection')
      return null
    }
  }, [setError])

  /**
   * Test a connection
   */
  const testConnection = useCallback(async (connection: DatabaseConnection): Promise<ConnectionTestResult> => {
    try {
      setTesting(connection.id, true)
      const result = await connectionManager.testConnection(connection)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed'
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setTesting(connection.id, false)
    }
  }, [setTesting])

  /**
   * Test connection by ID
   */
  const testConnectionById = useCallback(async (id: string): Promise<ConnectionTestResult> => {
    const connection = state.connections.find(c => c.id === id)
    if (!connection) {
      return {
        success: false,
        error: 'Connection not found'
      }
    }
    return testConnection(connection)
  }, [state.connections, testConnection])

  /**
   * Refresh all connection statuses
   */
  const refreshAllConnections = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      await connectionManager.refreshAllConnections()
      updateState({ error: null })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh connections')
    } finally {
      setLoading(false)
    }
  }, [setLoading, updateState, setError])

  /**
   * Set the active connection
   */
  const setActiveConnection = useCallback((connection: DatabaseConnection | null) => {
    updateState({ activeConnection: connection })
  }, [updateState])

  /**
   * Set active connection by ID
   */
  const setActiveConnectionById = useCallback((id: string) => {
    const connection = state.connections.find(c => c.id === id) || null
    setActiveConnection(connection)
  }, [state.connections, setActiveConnection])

  /**
   * Get connections by engine type
   */
  const getConnectionsByEngine = useCallback((engine: DatabaseEngine): DatabaseConnection[] => {
    return state.connections.filter(conn => conn.engine === engine)
  }, [state.connections])

  /**
   * Get only connected connections
   */
  const getActiveConnections = useCallback((): DatabaseConnection[] => {
    return state.connections.filter(conn => conn.status === ConnectionStatus.CONNECTED)
  }, [state.connections])

  /**
   * Get connections with errors
   */
  const getErrorConnections = useCallback((): DatabaseConnection[] => {
    return state.connections.filter(conn => conn.status === ConnectionStatus.ERROR)
  }, [state.connections])

  /**
   * Refresh connections from storage
   */
  const refreshConnections = useCallback(async (): Promise<void> => {
    await loadConnections()
  }, [loadConnections])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  /**
   * Export connections
   */
  const exportConnections = useCallback(async (): Promise<Omit<DatabaseConnection, 'password'>[]> => {
    try {
      return await connectionManager.exportConnections()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export connections')
      return []
    }
  }, [setError])

  /**
   * Import connections
   */
  const importConnections = useCallback(async (connections: Omit<DatabaseConnection, 'password'>[]): Promise<void> => {
    try {
      setLoading(true)
      await connectionManager.importConnections(connections)
      await loadConnections() // Refresh the list
      updateState({ error: null })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to import connections')
    } finally {
      setLoading(false)
    }
  }, [setLoading, loadConnections, updateState, setError])

  return {
    // State
    connections: state.connections,
    activeConnection: state.activeConnection,
    loading: state.loading,
    error: state.error,
    testing: state.testing,
    
    // CRUD operations
    createConnection,
    updateConnection,
    deleteConnection,
    getConnection,
    
    // Testing
    testConnection,
    testConnectionById,
    refreshAllConnections,
    
    // Selection
    setActiveConnection,
    setActiveConnectionById,
    
    // Filtering
    getConnectionsByEngine,
    getActiveConnections,
    getErrorConnections,
    
    // Utilities
    refreshConnections,
    clearError,
    exportConnections,
    importConnections
  }
}
