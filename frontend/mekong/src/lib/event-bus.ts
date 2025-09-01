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
} as const

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES]
