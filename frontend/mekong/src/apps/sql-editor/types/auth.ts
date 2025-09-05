/**
 * Authentication Types
 * 
 * Core types for user authentication and authorization system
 */

// JWT Token structure
export interface JWTToken {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: 'Bearer'
}

// Authentication credentials
export interface LoginCredentials {
  email: string
  password: string
}

// Password reset request
export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  password: string
  confirmPassword: string
}

// User roles with hierarchical permissions
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  ANALYST = 'analyst', 
  VIEWER = 'viewer'
}

// Permission types for granular access control
export enum Permission {
  // Query permissions
  QUERY_CREATE = 'query:create',
  QUERY_READ = 'query:read',
  QUERY_UPDATE = 'query:update',
  QUERY_DELETE = 'query:delete',
  QUERY_EXECUTE = 'query:execute',
  
  // Connection permissions
  CONNECTION_CREATE = 'connection:create',
  CONNECTION_READ = 'connection:read',
  CONNECTION_UPDATE = 'connection:update',
  CONNECTION_DELETE = 'connection:delete',
  CONNECTION_TEST = 'connection:test',
  
  // User management permissions
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // System permissions
  SYSTEM_SETTINGS = 'system:settings',
  SYSTEM_MONITORING = 'system:monitoring',
  SYSTEM_BACKUP = 'system:backup',
  
  // Data permissions
  DATA_EXPORT = 'data:export',
  DATA_IMPORT = 'data:import',
  DATA_SHARE = 'data:share'
}

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin has all permissions
    Permission.QUERY_CREATE,
    Permission.QUERY_READ,
    Permission.QUERY_UPDATE,
    Permission.QUERY_DELETE,
    Permission.QUERY_EXECUTE,
    Permission.CONNECTION_CREATE,
    Permission.CONNECTION_READ,
    Permission.CONNECTION_UPDATE,
    Permission.CONNECTION_DELETE,
    Permission.CONNECTION_TEST,
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.SYSTEM_SETTINGS,
    Permission.SYSTEM_MONITORING,
    Permission.SYSTEM_BACKUP,
    Permission.DATA_EXPORT,
    Permission.DATA_IMPORT,
    Permission.DATA_SHARE
  ],
  [UserRole.EDITOR]: [
    // Editor can create/edit queries and manage connections
    Permission.QUERY_CREATE,
    Permission.QUERY_READ,
    Permission.QUERY_UPDATE,
    Permission.QUERY_DELETE,
    Permission.QUERY_EXECUTE,
    Permission.CONNECTION_CREATE,
    Permission.CONNECTION_READ,
    Permission.CONNECTION_UPDATE,
    Permission.CONNECTION_DELETE,
    Permission.CONNECTION_TEST,
    Permission.DATA_EXPORT,
    Permission.DATA_IMPORT,
    Permission.DATA_SHARE
  ],
  [UserRole.ANALYST]: [
    // Analyst can execute queries and create visualizations
    Permission.QUERY_CREATE,
    Permission.QUERY_READ,
    Permission.QUERY_EXECUTE,
    Permission.CONNECTION_READ,
    Permission.CONNECTION_TEST,
    Permission.DATA_EXPORT,
    Permission.DATA_SHARE
  ],
  [UserRole.VIEWER]: [
    // Viewer has read-only access
    Permission.QUERY_READ,
    Permission.CONNECTION_READ,
    Permission.DATA_EXPORT
  ]
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: JWTToken | null
  isLoading: boolean
  error: string | null
}

// Authentication context type
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  resetPassword: (request: PasswordResetRequest) => Promise<void>
  confirmPasswordReset: (data: PasswordResetConfirm) => Promise<void>
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: UserRole) => boolean
  clearError: () => void
}

// User type (imported from user.ts but defined here for convenience)
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  preferences: UserPreferences
  createdAt: string
  lastLoginAt?: string
  isActive: boolean
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  editor: EditorPreferences
  dashboard: DashboardPreferences
  notifications: NotificationPreferences
}

export interface EditorPreferences {
  fontSize: number
  tabSize: number
  wordWrap: boolean
  minimap: boolean
  lineNumbers: boolean
  autoComplete: boolean
  formatOnSave: boolean
  theme: string
}

export interface DashboardPreferences {
  defaultView: 'grid' | 'list'
  itemsPerPage: number
  showPreviewPane: boolean
  autoRefresh: boolean
  refreshInterval: number
}

export interface NotificationPreferences {
  queryCompletion: boolean
  errorAlerts: boolean
  systemMaintenance: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}