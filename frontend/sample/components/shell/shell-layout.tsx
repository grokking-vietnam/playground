"use client"

import { useState, type ReactNode } from "react"
import { Header } from "./header"
import { NavigationSidebar } from "./navigation-sidebar"

interface ShellLayoutProps {
  children: ReactNode
  currentApp: string
  onNavigate: (app: string) => void
}

export function ShellLayout({ children, currentApp, onNavigate }: ShellLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onMenuClick={toggleSidebar} />
      <NavigationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={onNavigate}
        currentApp={currentApp}
      />
      {children}
    </div>
  )
}
