/**
 * Authentication Service
 * 
 * Handles user authentication, login, logout, and session management
 */

import type { LoginCredentials, JWTToken, PasswordResetRequest, PasswordResetConfirm, User } from '../types/auth'
import { tokenManager } from './TokenManager'
import { eventBus, EVENT_TYPES } from '@/lib/event-bus'

export class AuthService {
  private apiBaseUrl = '/api/auth' // Configure based on environment

  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: JWTToken }> {
    try {
      // Mock API call - replace with actual authentication endpoint
      const response = await this.mockLogin(credentials)
      
      if (!response.token) {
        throw new Error('Invalid response from authentication server')
      }

      // Store tokens
      tokenManager.storeTokens(response.token)

      // Emit authentication events
      eventBus.emit(EVENT_TYPES.USER_SELECTED, response.user)
      eventBus.emit('auth.login', response.user)

      return response
    } catch (error) {
      console.error('Authentication failed:', error)
      throw error
    }
  }

  /**
   * Log out current user
   */
  async logout(): Promise<void> {
    try {
      const token = tokenManager.getAccessToken()
      
      if (token) {
        // Attempt to notify server of logout
        try {
          await fetch(`${this.apiBaseUrl}/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          })
        } catch (error) {
          // Continue with logout even if server notification fails
          console.warn('Failed to notify server of logout:', error)
        }
      }

      // Clear local tokens
      tokenManager.clearTokens()

      // Emit logout events
      eventBus.emit('auth.logout', null)

    } catch (error) {
      console.error('Logout failed:', error)
      // Still clear tokens even if logout fails
      tokenManager.clearTokens()
      throw error
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<JWTToken | null> {
    try {
      return await tokenManager.refreshToken()
    } catch (error) {
      console.error('Token refresh failed:', error)
      // If refresh fails, user needs to log in again
      await this.logout()
      return null
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) return null

      // Mock API call - replace with actual user endpoint
      const response = await this.mockGetCurrentUser(token)
      return response
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const token = tokenManager.getAccessToken()
    return !!token && !tokenManager.isTokenExpired()
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    try {
      // Mock API call - replace with actual password reset endpoint
      await this.mockRequestPasswordReset(request)
    } catch (error) {
      console.error('Password reset request failed:', error)
      throw error
    }
  }

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    try {
      // Mock API call - replace with actual password reset confirmation endpoint
      await this.mockConfirmPasswordReset(data)
    } catch (error) {
      console.error('Password reset confirmation failed:', error)
      throw error
    }
  }

  /**
   * Validate current session
   */
  async validateSession(): Promise<boolean> {
    try {
      const token = tokenManager.getAccessToken()
      if (!token) return false

      // Check if token needs refresh
      if (tokenManager.needsRefresh()) {
        const refreshed = await this.refreshToken()
        return !!refreshed
      }

      return !tokenManager.isTokenExpired()
    } catch (error) {
      console.error('Session validation failed:', error)
      return false
    }
  }

  // Mock implementations - replace with actual API calls

  private async mockLogin(credentials: LoginCredentials): Promise<{ user: User; token: JWTToken }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock validation
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required')
    }

    if (credentials.password.length < 6) {
      throw new Error('Invalid credentials')
    }

    // Mock user data based on email
    const user: User = {
      id: `user_${Date.now()}`,
      email: credentials.email,
      name: this.getNameFromEmail(credentials.email),
      firstName: this.getNameFromEmail(credentials.email).split(' ')[0],
      lastName: this.getNameFromEmail(credentials.email).split(' ')[1] || '',
      role: credentials.email.includes('admin') ? 'admin' : 
            credentials.email.includes('editor') ? 'editor' :
            credentials.email.includes('analyst') ? 'analyst' : 'viewer',
      preferences: this.getDefaultPreferences(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isActive: true,
      emailVerified: true
    }

    const token: JWTToken = {
      access_token: this.generateMockJWT(user),
      refresh_token: this.generateMockRefreshToken(),
      expires_in: 3600, // 1 hour
      token_type: 'Bearer'
    }

    return { user, token }
  }

  private async mockGetCurrentUser(token: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    // Decode mock JWT to get user data
    try {
      const payload = tokenManager.decodeTokenPayload(token)
      if (!payload) {
        throw new Error('Invalid token')
      }

      return payload.user
    } catch (error) {
      throw new Error('Failed to get user from token')
    }
  }

  private async mockRequestPasswordReset(request: PasswordResetRequest): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real implementation, this would send an email
    console.log(`Password reset requested for: ${request.email}`)
  }

  private async mockConfirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    console.log('Password reset confirmed')
  }

  private getNameFromEmail(email: string): string {
    const username = email.split('@')[0]
    return username.replace(/[._-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private getDefaultPreferences() {
    return {
      theme: 'system' as const,
      language: 'en',
      dateFormat: 'MM/dd/yyyy',
      timeFormat: '12h' as const,
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
        defaultView: 'grid' as const,
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

  private generateMockJWT(user: User): string {
    const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }))
    const payload = btoa(JSON.stringify({
      user,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    }))
    const signature = btoa('mock-signature')
    
    return `${header}.${payload}.${signature}`
  }

  private generateMockRefreshToken(): string {
    return btoa(`refresh_${Date.now()}_${Math.random()}`)
  }
}

// Create singleton instance
export const authService = new AuthService()