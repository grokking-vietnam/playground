/**
 * SQL Editor Types Export
 * 
 * Central export file for all SQL Editor types and interfaces
 */

// Connection types
export * from './connections'

// Authentication types
export * from './auth'

// User types  
export * from './user'

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
