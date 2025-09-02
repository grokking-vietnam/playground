import React, { useEffect } from "react"
import { useNotifications } from "@/lib/shared-state"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
}

export function NotificationSystem() {
  const { notifications, removeNotification } = useNotifications()

  useEffect(() => {
    // Auto-remove notifications after 5 seconds
    notifications.forEach((notification) => {
      if (Date.now() - notification.timestamp > 5000) {
        removeNotification(notification.id)
      }
    })
  }, [notifications, removeNotification])

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon = iconMap[notification.type]
        
        return (
          <div
            key={notification.id}
            className={cn(
              "max-w-md rounded-lg border p-4 shadow-lg transition-all duration-300",
              colorMap[notification.type]
            )}
          >
            <div className="flex items-start space-x-3">
              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm mt-1">{notification.message}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-current hover:bg-white/20"
                onClick={() => removeNotification(notification.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
