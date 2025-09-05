type EventCallback = (data: any) => void

class EventBus {
  private events: Map<string, EventCallback[]> = new Map()

  subscribe(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)?.push(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.events.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  emit(event: string, data?: any) {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  unsubscribe(event: string, callback?: EventCallback) {
    if (!callback) {
      this.events.delete(event)
    } else {
      const callbacks = this.events.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  clear() {
    this.events.clear()
  }
}

// Global event bus instance for microfrontend communication
export const eventBus = new EventBus()

// Predefined event types for type safety
export const EVENT_TYPES = {
  USER_SELECTED: 'user.selected',
  PROJECT_CHANGED: 'project.changed',
  NOTIFICATION_SHOW: 'notification.show',
  NAVIGATION_REQUEST: 'navigation.request',
  DATA_UPDATED: 'data.updated',
  THEME_CHANGED: 'theme.changed',
  
  // Authentication events
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_TOKEN_REFRESHED: 'auth.token.refreshed',
  AUTH_SESSION_EXPIRED: 'auth.session.expired',
  
  // User events
  USER_PROFILE_UPDATED: 'user.profile.updated',
  USER_PREFERENCES_UPDATED: 'user.preferences.updated',
  USER_PASSWORD_CHANGED: 'user.password.changed',
  USER_SESSION_TERMINATED: 'user.session.terminated',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  
  // Permission events
  PERMISSIONS_CHANGED: 'permissions.changed',
  ROLE_UPDATED: 'role.updated',
} as const

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES]
