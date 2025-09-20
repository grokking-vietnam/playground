/**
 * SQL Editor Authentication Context
 * 
 * Provides authentication state and methods for the SQL Editor application
 */

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AuthContextType, AuthState, LoginCredentials, PasswordResetRequest, PasswordResetConfirm, User, Permission, UserRole } from '../types/auth'
import { authService } from '../services/AuthService'
import { permissionService } from '../services/PermissionService'
import { tokenManager } from '../services/TokenManager'
import { eventBus, EVENT_TYPES } from '@/lib/event-bus'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    error: null
  })

  // Initialize authentication state
  useEffect(() => {
    initializeAuth()
  }, [])

  // Set up token refresh interval
  useEffect(() => {
    if (!authState.isAuthenticated) return

    const interval = setInterval(async () => {
      try {
        if (tokenManager.needsRefresh()) {
          await refreshToken()
        }
      } catch (error) {
        console.error('Background token refresh failed:', error)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [authState.isAuthenticated])

  const initializeAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      // Check if we have a stored token
      const storedToken = tokenManager.getStoredToken()
      if (!storedToken) {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return
      }

      // Validate token and get current user
      if (tokenManager.isTokenExpired()) {
        // Try to refresh token
        const refreshedToken = await authService.refreshToken()
        if (!refreshedToken) {
          tokenManager.clearTokens()
          setAuthState(prev => ({ ...prev, isLoading: false }))
          return
        }
      }

      // Get current user
      const user = await authService.getCurrentUser()
      if (!user) {
        tokenManager.clearTokens()
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return
      }

      // Set authenticated state
      setAuthState({
        isAuthenticated: true,
        user,
        token: storedToken,
        isLoading: false,
        error: null
      })

      // Emit authentication events
      eventBus.emit(EVENT_TYPES.AUTH_LOGIN, user)
      eventBus.emit(EVENT_TYPES.USER_SELECTED, user)

    } catch (error) {
      console.error('Auth initialization failed:', error)
      tokenManager.clearTokens()
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      })
    }
  }

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

      const result = await authService.login(credentials)
      
      setAuthState({
        isAuthenticated: true,
        user: result.user,
        token: result.token,
        isLoading: false,
        error: null
      })

      // Emit authentication events
      eventBus.emit(EVENT_TYPES.AUTH_LOGIN, result.user)
      eventBus.emit(EVENT_TYPES.USER_SELECTED, result.user)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null
      })

      // Emit logout events
      eventBus.emit(EVENT_TYPES.AUTH_LOGOUT, null)
    }
  }, [])

  const refreshToken = useCallback(async () => {
    try {
      const newToken = await authService.refreshToken()
      if (!newToken) {
        await logout()
        throw new Error('Token refresh failed')
      }

      setAuthState(prev => ({
        ...prev,
        token: newToken
      }))

      // Emit token refresh event
      eventBus.emit(EVENT_TYPES.AUTH_TOKEN_REFRESHED, newToken)

    } catch (error) {
      console.error('Token refresh failed:', error)
      await logout()
      throw error
    }
  }, [logout])

  const resetPassword = useCallback(async (request: PasswordResetRequest) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      await authService.requestPasswordReset(request)
      setAuthState(prev => ({ ...prev, isLoading: false }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  const confirmPasswordReset = useCallback(async (data: PasswordResetConfirm) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      await authService.confirmPasswordReset(data)
      setAuthState(prev => ({ ...prev, isLoading: false }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset confirmation failed'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  const hasPermission = useCallback((permission: Permission): boolean => {
    return permissionService.hasPermission(authState.user, permission)
  }, [authState.user])

  const hasRole = useCallback((role: UserRole): boolean => {
    return permissionService.hasRole(authState.user, role)
  }, [authState.user])

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

  // Listen for session expiration
  useEffect(() => {
    const handleSessionExpired = () => {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: 'Your session has expired. Please log in again.'
      })
      eventBus.emit(EVENT_TYPES.AUTH_SESSION_EXPIRED, null)
    }

    const unsubscribe = eventBus.subscribe('auth.session.expired', handleSessionExpired)
    return unsubscribe
  }, [])

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshToken,
    resetPassword,
    confirmPasswordReset,
    hasPermission,
    hasRole,
    clearError
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}