/**
 * SQL Editor Types Export
 * 
 * Central export file for all SQL Editor types and interfaces.
 * Combines enhanced Monaco Editor features with connection management.
 */

// Connection types
export * from './connections'

// Editor types  
export type {
  EditorSettings,
  SQLLanguageConfig,
  SQLFunction,
  Parameter,
  CompletionContext,
  HoverContext,
  ValidationContext
} from './editor';

// Schema types
export type {
  DatabaseSchema,
  Database,
  Table,
  Column,
  Index,
  Constraint,
  ForeignKey,
  Relationship,
  StoredProcedure,
  SchemaCache,
  SchemaProviderOptions,
  SchemaUpdateEvent,
  SchemaQuery
} from './schema';

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
