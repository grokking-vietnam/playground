import React, { type ReactNode } from "react"
import { Header } from "./header"
import { useFloatingNav } from "@/lib/shared-state"
import { cn } from "@/lib/utils"

interface ShellLayoutProps {
  children: ReactNode
  currentApp: string
  onNavigate: (app: string) => void
}

export function ShellLayout({ children, currentApp, onNavigate }: ShellLayoutProps) {
  const { isFloatingNavOpen } = useFloatingNav()
  
  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={onNavigate} currentApp={currentApp} />
      <main 
        className={cn(
          "h-[calc(100vh-3.5rem)] overflow-auto transition-all duration-300",
          isFloatingNavOpen && "blur-sm brightness-50 pointer-events-none"
        )}
        id="main-content-area"
      >
        {children}
      </main>
    </div>
  )
}