"use client"

import { useState } from "react"
import { useMicrofrontendCommunication } from "@/hooks/use-microfrontend-communication"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, X } from "lucide-react"

interface CrossAppUserSelectorProps {
  availableUsers?: Array<{ id: string; name: string; email: string }>
}

export function CrossAppUserSelector({ availableUsers = [] }: CrossAppUserSelectorProps) {
  const { selectedUsers, setSelectedUsers, emit } = useMicrofrontendCommunication()
  const [isVisible, setIsVisible] = useState(false)

  const handleUserToggle = (userId: string) => {
    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter((id) => id !== userId)
      : [...selectedUsers, userId]

    setSelectedUsers(newSelection)

    // Emit event for other microfrontends
    emit("user:updated", { userId, userData: { selected: !selectedUsers.includes(userId) } })
  }

  const clearSelection = () => {
    setSelectedUsers([])
  }

  if (selectedUsers.length === 0 && !isVisible) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsVisible(true)} className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        Select Users
      </Button>
    )
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Selected Users ({selectedUsers.length})</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear All
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((userId) => {
            const user = availableUsers.find((u) => u.id === userId)
            return (
              <Badge
                key={userId}
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => handleUserToggle(userId)}
              >
                {user?.name || `User ${userId}`}
                <X className="h-3 w-3" />
              </Badge>
            )
          })}
        </div>

        {isVisible && availableUsers.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-600">Available Users:</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {availableUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                    selectedUsers.includes(user.id) ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleUserToggle(user.id)}
                >
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <Badge variant="default" className="text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
