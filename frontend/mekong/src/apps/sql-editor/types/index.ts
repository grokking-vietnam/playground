/**
 * SQL Editor Types Export
 * 
 * Central export file for all SQL Editor types and interfaces.
 * Combines enhanced Monaco Editor features with connection management.
 */

// Connection types
export * from './connections'

// Authentication types
export * from './auth'

// User types  
export * from './user'

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

// Enhanced schema tree types
export type {
  SchemaTreeNode,
  SchemaNodeMetadata,
  ForeignKeyInfo,
  DatabaseIntrospectionResult,
  DatabaseInfo,
  SchemaInfo,
  TableInfo,
  ViewInfo,
  ColumnInfo,
  IndexInfo,
  ConstraintInfo,
  FunctionInfo,
  ProcedureInfo,
  ParameterInfo,
  SchemaSearchFilters,
  SchemaSearchResult,
  SchemaTreeCache,
  SchemaSearchIndex
} from './schema-tree';

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

// Re-export auth types
export type {
  User,
  JWTToken,
  LoginCredentials,
  AuthState,
  AuthContextType,
  UserPreferences,
  EditorPreferences,
  DashboardPreferences,
  NotificationPreferences
} from './auth'

export {
  UserRole,
  Permission,
  ROLE_PERMISSIONS
} from './auth'

// Query execution types
export type {
  QueryExecution,
  ExecutionMetadata,
  ExecutionOptions,
  QueryError
} from './execution'

export {
  ExecutionStatus,
  ExecutionPriority,
  ExecutionMode,
  DEFAULT_EXECUTION_OPTIONS
} from './execution'

// Query results types
export type {
  QueryResult,
  QueryRow,
  ColumnDefinition,
  ResultMetadata,
  ExecutionPlan,
  PlanNode,
  PlanAnalysis,
  ResultFormattingOptions,
  ResultExportOptions
} from './results'

export {
  DEFAULT_FORMATTING_OPTIONS,
  DATA_TYPE_GROUPS,
  getDataTypeGroup
} from './results'
