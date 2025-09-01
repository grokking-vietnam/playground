"use client"

import { useEffect } from "react"
import { useMicrofrontendCommunication } from "@/hooks/use-microfrontend-communication"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react"

export function NotificationSystem() {
  const { notifications, removeNotification, subscribe } = useMicrofrontendCommunication()

  // Listen for notification events from other microfrontends
  useEffect(() => {
    const unsubscribe = subscribe("notification:show", (data) => {
      // Notification is already handled by the shared state
      // This is just for cross-microfrontend coordination
    })

    return unsubscribe
  }, [subscribe])

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    notifications.forEach((notification) => {
      const timeElapsed = Date.now() - notification.timestamp
      if (timeElapsed < 5000) {
        const timeRemaining = 5000 - timeElapsed
        setTimeout(() => {
          removeNotification(notification.id)
        }, timeRemaining)
      }
    })
  }, [notifications, removeNotification])

  if (notifications.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "info":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Card key={notification.id} className={`${getBackgroundColor(notification.type)} shadow-lg`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {getIcon(notification.type)}
              <div className="flex-1">
                {notification.title && <h4 className="font-medium text-gray-900 mb-1">{notification.title}</h4>}
                <p className="text-sm text-gray-700">{notification.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={() => removeNotification(notification.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
