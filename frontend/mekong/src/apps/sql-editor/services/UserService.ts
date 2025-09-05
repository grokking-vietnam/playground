/**
 * User Service
 * 
 * Handles user profile management, preferences, and user-related operations
 */

import type { 
  User, 
  UserPreferences, 
  UserProfileUpdate, 
  CreateUserData, 
  UserFilters,
  UserSession,
  UserActivity,
  UserStats
} from '../types/user'
import { tokenManager } from './TokenManager'
import { eventBus } from '@/lib/event-bus'

export class UserService {
  private apiBaseUrl = '/api/users' // Configure based on environment

  /**
   * Get current user profile
   */
  async getCurrentUserProfile(): Promise<User | null> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) return null

      // Mock API call - replace with actual user profile endpoint
      const response = await this.mockGetUserProfile(token)
      return response
    } catch (error) {
      console.error('Failed to get user profile:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: UserProfileUpdate): Promise<User> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) {
        throw new Error('User not authenticated')
      }

      // Mock API call - replace with actual update endpoint
      const updatedUser = await this.mockUpdateUserProfile(token, updates)

      // Emit user update event
      eventBus.emit('user.profile.updated', updatedUser)

      return updatedUser
    } catch (error) {
      console.error('Failed to update user profile:', error)
      throw error
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) {
        throw new Error('User not authenticated')
      }

      // Mock API call - replace with actual preferences endpoint
      const updatedPreferences = await this.mockUpdatePreferences(token, preferences)

      // Emit preferences update event
      eventBus.emit('user.preferences.updated', updatedPreferences)

      return updatedPreferences
    } catch (error) {
      console.error('Failed to update user preferences:', error)
      throw error
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) return null

      // Mock API call - replace with actual preferences endpoint
      const preferences = await this.mockGetPreferences(token)
      return preferences
    } catch (error) {
      console.error('Failed to get user preferences:', error)
      return null
    }
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) {
        throw new Error('User not authenticated')
      }

      // Mock API call - replace with actual password change endpoint
      await this.mockChangePassword(token, currentPassword, newPassword)

      // Emit password change event
      eventBus.emit('user.password.changed', null)
    } catch (error) {
      console.error('Failed to change password:', error)
      throw error
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(): Promise<UserSession[]> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) return []

      // Mock API call - replace with actual sessions endpoint
      const sessions = await this.mockGetUserSessions(token)
      return sessions
    } catch (error) {
      console.error('Failed to get user sessions:', error)
      return []
    }
  }

  /**
   * Terminate user session
   */
  async terminateSession(sessionId: string): Promise<void> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) {
        throw new Error('User not authenticated')
      }

      // Mock API call - replace with actual session termination endpoint
      await this.mockTerminateSession(token, sessionId)

      // Emit session termination event
      eventBus.emit('user.session.terminated', { sessionId })
    } catch (error) {
      console.error('Failed to terminate session:', error)
      throw error
    }
  }

  /**
   * Get user activity log
   */
  async getUserActivity(limit = 50, offset = 0): Promise<UserActivity[]> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) return []

      // Mock API call - replace with actual activity endpoint
      const activities = await this.mockGetUserActivity(token, limit, offset)
      return activities
    } catch (error) {
      console.error('Failed to get user activity:', error)
      return []
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats | null> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) return null

      // Mock API call - replace with actual stats endpoint
      const stats = await this.mockGetUserStats(token)
      return stats
    } catch (error) {
      console.error('Failed to get user stats:', error)
      return null
    }
  }

  // Admin-only methods

  /**
   * Create new user (Admin only)
   */
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) {
        throw new Error('User not authenticated')
      }

      // Mock API call - replace with actual user creation endpoint
      const newUser = await this.mockCreateUser(token, userData)

      // Emit user creation event
      eventBus.emit('user.created', newUser)

      return newUser
    } catch (error) {
      console.error('Failed to create user:', error)
      throw error
    }
  }

  /**
   * Get all users with filters (Admin only)
   */
  async getUsers(filters: UserFilters = {}): Promise<User[]> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) return []

      // Mock API call - replace with actual users list endpoint
      const users = await this.mockGetUsers(token, filters)
      return users
    } catch (error) {
      console.error('Failed to get users:', error)
      return []
    }
  }

  /**
   * Update user by ID (Admin only)
   */
  async updateUser(userId: string, updates: UserProfileUpdate): Promise<User> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) {
        throw new Error('User not authenticated')
      }

      // Mock API call - replace with actual user update endpoint
      const updatedUser = await this.mockUpdateUser(token, userId, updates)

      // Emit user update event
      eventBus.emit('user.updated', updatedUser)

      return updatedUser
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  /**
   * Delete user by ID (Admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) {
        throw new Error('User not authenticated')
      }

      // Mock API call - replace with actual user deletion endpoint
      await this.mockDeleteUser(token, userId)

      // Emit user deletion event
      eventBus.emit('user.deleted', { userId })
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  }

  // Mock implementations - replace with actual API calls

  private async mockGetUserProfile(token: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const payload = tokenManager.decodeTokenPayload(token)
    if (!payload?.user) {
      throw new Error('Invalid token')
    }
    
    return payload.user
  }

  private async mockUpdateUserProfile(token: string, updates: UserProfileUpdate): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const currentUser = await this.mockGetUserProfile(token)
    return {
      ...currentUser,
      ...updates,
      updatedAt: new Date().toISOString()
    }
  }

  private async mockUpdatePreferences(token: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const currentUser = await this.mockGetUserProfile(token)
    return {
      ...currentUser.preferences,
      ...preferences
    }
  }

  private async mockGetPreferences(token: string): Promise<UserPreferences> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const currentUser = await this.mockGetUserProfile(token)
    return currentUser.preferences
  }

  private async mockChangePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }
    
    // In real implementation, validate current password
    console.log('Password changed successfully')
  }

  private async mockGetUserSessions(token: string): Promise<UserSession[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return [
      {
        id: 'session_1',
        userId: 'user_123',
        deviceInfo: 'Chrome on Windows',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        lastActivityAt: new Date().toISOString(),
        isActive: true
      }
    ]
  }

  private async mockTerminateSession(token: string, sessionId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    console.log(`Session ${sessionId} terminated`)
  }

  private async mockGetUserActivity(token: string, limit: number, offset: number): Promise<UserActivity[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    return [
      {
        id: 'activity_1',
        userId: 'user_123',
        action: 'login',
        resource: 'auth',
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0',
        createdAt: new Date().toISOString()
      }
    ]
  }

  private async mockGetUserStats(token: string): Promise<UserStats> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      totalQueries: 42,
      totalConnections: 3,
      lastActivity: new Date().toISOString(),
      averageSessionDuration: 3600,
      preferredEngine: 'PostgreSQL'
    }
  }

  private async mockCreateUser(token: string, userData: CreateUserData): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    return {
      id: `user_${Date.now()}`,
      email: userData.email,
      name: userData.name,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      preferences: this.getDefaultPreferences(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      emailVerified: false
    }
  }

  private async mockGetUsers(token: string, filters: UserFilters): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // Return mock user list
    return []
  }

  private async mockUpdateUser(token: string, userId: string, updates: UserProfileUpdate): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const currentUser = await this.mockGetUserProfile(token)
    return {
      ...currentUser,
      ...updates,
      updatedAt: new Date().toISOString()
    }
  }

  private async mockDeleteUser(token: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    console.log(`User ${userId} deleted`)
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'system',
      language: 'en',
      dateFormat: 'MM/dd/yyyy',
      timeFormat: '12h',
      editor: {
        fontSize: 14,
        tabSize: 2,
        wordWrap: true,
        minimap: false,
        lineNumbers: true,
        autoComplete: true,
        formatOnSave: false,
        theme: 'vs-light'
      },
      dashboard: {
        defaultView: 'grid',
        itemsPerPage: 20,
        showPreviewPane: true,
        autoRefresh: false,
        refreshInterval: 30
      },
      notifications: {
        queryCompletion: true,
        errorAlerts: true,
        systemMaintenance: true,
        emailNotifications: false,
        pushNotifications: true
      }
    }
  }
}

// Create singleton instance
export const userService = new UserService()