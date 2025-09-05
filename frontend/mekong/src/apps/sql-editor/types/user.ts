/**
 * User Types
 * 
 * User-related types for the SQL Editor application
 */

import type { UserRole } from './auth'

// User preferences types
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

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  editor: EditorPreferences
  dashboard: DashboardPreferences
  notifications: NotificationPreferences
}

// User entity
export interface User {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  avatar?: string
  role: UserRole
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  isActive: boolean
  emailVerified: boolean
}

// User profile update data
export interface UserProfileUpdate {
  name?: string
  firstName?: string
  lastName?: string
  avatar?: string
  preferences?: Partial<UserPreferences>
}

// User creation data
export interface CreateUserData {
  email: string
  name: string
  firstName: string
  lastName: string
  role: UserRole
  password: string
}

// User list filters
export interface UserFilters {
  role?: UserRole
  isActive?: boolean
  search?: string
  limit?: number
  offset?: number
}

// User session information
export interface UserSession {
  id: string
  userId: string
  deviceInfo: string
  ipAddress: string
  userAgent: string
  createdAt: string
  lastActivityAt: string
  isActive: boolean
}

// User activity log
export interface UserActivity {
  id: string
  userId: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress: string
  userAgent: string
  createdAt: string
}

// User statistics
export interface UserStats {
  totalQueries: number
  totalConnections: number
  lastActivity: string
  averageSessionDuration: number
  preferredEngine: string
}

export default User