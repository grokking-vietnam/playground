import React from "react"
import { Outlet } from "@modern-js/runtime/router"
import { AuthProvider } from "@/lib/auth-context"
import { SharedStateProvider } from "@/lib/shared-state"
import { NotificationSystem } from "@/components/shared/notification-system"
import "@/styles/globals.css"

export default function Layout() {
  return (
    <AuthProvider>
      <SharedStateProvider>
        <div className="microfrontend-container">
          <Outlet />
          <NotificationSystem />
        </div>
      </SharedStateProvider>
    </AuthProvider>
  )
}