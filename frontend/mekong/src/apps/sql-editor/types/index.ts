/**
 * SQL Editor Types Export
 * 
 * Central export file for all SQL Editor types and interfaces
 */

// Connection types
export * from './connections'

// Re-export commonly used types for convenience
export type {
  DatabaseConnection,
  ConnectionFormData,
  ConnectionTestResult,
  ConnectionManagerOptions
} from './connections'

export {
  DatabaseEngine,
  ConnectionStatus,
  DEFAULT_PORTS,
  ENGINE_DISPLAY_NAMES,
  CONNECTION_STRING_TEMPLATES
} from './connections'
