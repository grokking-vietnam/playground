/**
 * useUserPreferences Hook
 * 
 * Custom hook for managing user preferences
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { userService } from '../services/UserService'
import { eventBus, EVENT_TYPES } from '@/lib/event-bus'
import type { UserPreferences } from '../types/auth'

export function useUserPreferences() {
  const { isAuthenticated } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load preferences when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPreferences()
    } else {
      setPreferences(null)
    }
  }, [isAuthenticated])

  // Listen for preference updates from other parts of the app
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(EVENT_TYPES.USER_PREFERENCES_UPDATED, (updatedPreferences: UserPreferences) => {
      setPreferences(updatedPreferences)
    })

    return unsubscribe
  }, [])

  const loadPreferences = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const userPreferences = await userService.getUserPreferences()
      setPreferences(userPreferences)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load preferences'
      setError(errorMessage)
      console.error('Failed to load user preferences:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    try {
      setError(null)
      const updatedPreferences = await userService.updateUserPreferences(updates)
      setPreferences(updatedPreferences)
      return updatedPreferences
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Convenience methods for specific preference updates
  const updateTheme = useCallback(async (theme: 'light' | 'dark' | 'system') => {
    return updatePreferences({ theme })
  }, [updatePreferences])

  const updateLanguage = useCallback(async (language: string) => {
    return updatePreferences({ language })
  }, [updatePreferences])

  const updateDateFormat = useCallback(async (dateFormat: string) => {
    return updatePreferences({ dateFormat })
  }, [updatePreferences])

  const updateTimeFormat = useCallback(async (timeFormat: '12h' | '24h') => {
    return updatePreferences({ timeFormat })
  }, [updatePreferences])

  const updateEditorPreferences = useCallback(async (editorUpdates: Partial<UserPreferences['editor']>) => {
    if (!preferences) return
    
    return updatePreferences({
      editor: {
        ...preferences.editor,
        ...editorUpdates
      }
    })
  }, [preferences, updatePreferences])

  const updateDashboardPreferences = useCallback(async (dashboardUpdates: Partial<UserPreferences['dashboard']>) => {
    if (!preferences) return
    
    return updatePreferences({
      dashboard: {
        ...preferences.dashboard,
        ...dashboardUpdates
      }
    })
  }, [preferences, updatePreferences])

  const updateNotificationPreferences = useCallback(async (notificationUpdates: Partial<UserPreferences['notifications']>) => {
    if (!preferences) return
    
    return updatePreferences({
      notifications: {
        ...preferences.notifications,
        ...notificationUpdates
      }
    })
  }, [preferences, updatePreferences])

  // Apply theme to document
  useEffect(() => {
    if (!preferences?.theme) return

    const applyTheme = (theme: 'light' | 'dark') => {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)
    }

    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light')
      }
      
      applyTheme(mediaQuery.matches ? 'dark' : 'light')
      mediaQuery.addEventListener('change', handleChange)
      
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      applyTheme(preferences.theme)
    }
  }, [preferences?.theme])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    preferences,
    isLoading,
    error,
    loadPreferences,
    updatePreferences,
    updateTheme,
    updateLanguage,
    updateDateFormat,
    updateTimeFormat,
    updateEditorPreferences,
    updateDashboardPreferences,
    updateNotificationPreferences,
    clearError
  }
}