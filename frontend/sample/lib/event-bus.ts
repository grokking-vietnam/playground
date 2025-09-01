type EventCallback<T = any> = (data: T) => void

interface EventBusEvents {
  "user:updated": { userId: string; userData: any }
  "user:deleted": { userId: string }
  "user:created": { userData: any }
  "permission:changed": { userId: string; permissions: string[] }
  "role:updated": { roleId: string; roleData: any }
  "workflow:status-changed": { workflowId: string; status: string }
  "notification:show": { type: "success" | "error" | "warning" | "info"; message: string; title?: string }
  "navigation:change": { appId: string; path?: string }
}

class EventBus {
  private events: Map<keyof EventBusEvents, Set<EventCallback>> = new Map()

  subscribe<K extends keyof EventBusEvents>(event: K, callback: EventCallback<EventBusEvents[K]>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }

    this.events.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.events.get(event)?.delete(callback)
    }
  }

  emit<K extends keyof EventBusEvents>(event: K, data: EventBusEvents[K]): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error)
        }
      })
    }
  }

  unsubscribe<K extends keyof EventBusEvents>(event: K, callback: EventCallback<EventBusEvents[K]>): void {
    this.events.get(event)?.delete(callback)
  }

  clear(): void {
    this.events.clear()
  }
}

export const eventBus = new EventBus()
export type { EventBusEvents }
