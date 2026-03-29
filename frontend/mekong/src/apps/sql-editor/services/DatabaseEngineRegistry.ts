/**
 * Database Engine Registry Service
 * 
 * Central registry for managing database engine plugins.
 * Handles plugin registration, discovery, and instantiation.
 */

import { DatabaseEnginePlugin, PluginCapabilities } from '../engines/base/interfaces'
import { DatabaseEngine } from '../types/connections'

/**
 * Engine factory function type
 */
export type EngineFactory = () => Promise<DatabaseEnginePlugin>

/**
 * Engine registration info
 */
export interface EngineRegistration {
  engine: DatabaseEngine
  factory: EngineFactory
  capabilities: PluginCapabilities
  displayName: string
  description?: string
  version?: string
}

/**
 * Database Engine Registry
 */
export class DatabaseEngineRegistry {
  private static instance: DatabaseEngineRegistry
  private engines: Map<DatabaseEngine, EngineRegistration> = new Map()
  private instantiatedEngines: Map<DatabaseEngine, DatabaseEnginePlugin> = new Map()

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseEngineRegistry {
    if (!DatabaseEngineRegistry.instance) {
      DatabaseEngineRegistry.instance = new DatabaseEngineRegistry()
    }
    return DatabaseEngineRegistry.instance
  }

  /**
   * Register a database engine plugin
   */
  public registerEngine(registration: EngineRegistration): void {
    if (this.engines.has(registration.engine)) {
      throw new Error(`Database engine ${registration.engine} is already registered`)
    }

    // Validate capabilities
    this.validateCapabilities(registration.capabilities)

    this.engines.set(registration.engine, registration)
    console.log(`Registered database engine: ${registration.displayName} (${registration.engine})`)
  }

  /**
   * Unregister a database engine plugin
   */
  public async unregisterEngine(engine: DatabaseEngine): Promise<void> {
    if (!this.engines.has(engine)) {
      throw new Error(`Database engine ${engine} is not registered`)
    }

    // Dispose of instantiated engine if exists
    const instantiated = this.instantiatedEngines.get(engine)
    if (instantiated) {
      await instantiated.dispose()
      this.instantiatedEngines.delete(engine)
    }

    this.engines.delete(engine)
    console.log(`Unregistered database engine: ${engine}`)
  }

  /**
   * Get a database engine instance
   */
  public async getEngine(engine: DatabaseEngine): Promise<DatabaseEnginePlugin> {
    const registration = this.engines.get(engine)
    if (!registration) {
      throw new Error(`Database engine ${engine} is not registered`)
    }

    // Return existing instance if available
    let instance = this.instantiatedEngines.get(engine)
    if (instance) {
      return instance
    }

    // Create new instance
    try {
      instance = await registration.factory()
      await instance.initialize()
      this.instantiatedEngines.set(engine, instance)
      return instance
    } catch (error) {
      throw new Error(`Failed to create engine instance for ${engine}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check if an engine is registered
   */
  public isEngineRegistered(engine: DatabaseEngine): boolean {
    return this.engines.has(engine)
  }

  /**
   * Get all registered engines
   */
  public getRegisteredEngines(): DatabaseEngine[] {
    return Array.from(this.engines.keys())
  }

  /**
   * Get engine registration info
   */
  public getEngineRegistration(engine: DatabaseEngine): EngineRegistration | null {
    return this.engines.get(engine) || null
  }

  /**
   * Get all engine registrations
   */
  public getAllRegistrations(): EngineRegistration[] {
    return Array.from(this.engines.values())
  }

  /**
   * Get engine capabilities
   */
  public getEngineCapabilities(engine: DatabaseEngine): PluginCapabilities | null {
    const registration = this.engines.get(engine)
    return registration ? registration.capabilities : null
  }

  /**
   * Find engines by capability
   */
  public findEnginesByCapability(capability: keyof PluginCapabilities, value: any): DatabaseEngine[] {
    const engines: DatabaseEngine[] = []
    
    for (const [engine, registration] of this.engines) {
      const caps = registration.capabilities as any
      if (caps[capability] === value) {
        engines.push(engine)
      }
    }
    
    return engines
  }

  /**
   * Get engines that support specific features
   */
  public getEnginesWithFeatures(features: Partial<PluginCapabilities>): DatabaseEngine[] {
    const engines: DatabaseEngine[] = []
    
    for (const [engine, registration] of this.engines) {
      const caps = registration.capabilities
      let supportsAll = true
      
      for (const [feature, value] of Object.entries(features)) {
        const capValue = (caps as any)[feature]
        if (capValue !== value) {
          supportsAll = false
          break
        }
      }
      
      if (supportsAll) {
        engines.push(engine)
      }
    }
    
    return engines
  }

  /**
   * Dispose of all engine instances
   */
  public async disposeAllEngines(): Promise<void> {
    const disposePromises: Promise<void>[] = []
    
    for (const [engine, instance] of this.instantiatedEngines) {
      disposePromises.push(
        instance.dispose().catch(error => {
          console.warn(`Error disposing engine ${engine}:`, error)
        })
      )
    }
    
    await Promise.all(disposePromises)
    this.instantiatedEngines.clear()
  }

  /**
   * Validate engine capabilities
   */
  private validateCapabilities(capabilities: PluginCapabilities): void {
    // Basic validation of capabilities object
    const requiredFields = [
      'supportsTransactions',
      'supportsPreparedStatements',
      'supportsStreaming',
      'supportsSSL',
      'supportsConnectionPooling',
      'supportsConcurrentQueries',
      'supportedAuthMethods'
    ]

    for (const field of requiredFields) {
      if (!(field in capabilities)) {
        throw new Error(`Missing required capability field: ${field}`)
      }
    }

    if (!Array.isArray(capabilities.supportedAuthMethods)) {
      throw new Error('supportedAuthMethods must be an array')
    }

    if (capabilities.maxConnections !== undefined && capabilities.maxConnections <= 0) {
      throw new Error('maxConnections must be a positive number')
    }
  }
}

// Export singleton instance
export const databaseEngineRegistry = DatabaseEngineRegistry.getInstance()