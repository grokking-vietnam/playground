import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { microfrontendRegistry, getAllCategories } from "@/lib/microfrontend-registry"
import { useFloatingNav } from "@/lib/shared-state"
import { 
  Menu,
  X,
  Database, 
  Users, 
  Shield, 
  Workflow, 
  GitBranch, 
  Brain,
  Code,
  Check
} from "lucide-react"

interface FloatingNavigationProps {
  onNavigate: (appId: string) => void
  currentApp: string
}

const iconMap = {
  Database,
  Users,
  Shield,
  Workflow,
  GitBranch,
  Brain,
  Code,
}

export function FloatingNavigation({ onNavigate, currentApp }: FloatingNavigationProps) {
  const { isFloatingNavOpen: isOpen, setFloatingNavOpen: setIsOpen } = useFloatingNav()
  const categories = getAllCategories()

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap] || Database
    return Icon
  }

  const getCurrentApp = () => {
    return microfrontendRegistry.find(app => app.id === currentApp)
  }

  const handleNavigate = (appId: string) => {
    onNavigate(appId)
    setIsOpen(false)
  }

  const toggleNavigation = () => {
    setIsOpen(!isOpen)
  }

  const currentAppData = getCurrentApp()

  return (
    <>
      {/* Navigation Toggle Button */}
      <Button
        id="floating-nav-toggle-btn"
        variant="ghost"
        size="icon"
        onClick={toggleNavigation}
        className="mr-2 hover:bg-accent"
        title="Open navigation"
        data-testid="floating-nav-toggle"
      >
        <Menu className="h-5 w-5" id="floating-nav-menu-icon" />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          id="floating-nav-backdrop"
          className="fixed inset-0 bg-black/30 backdrop-blur-md transition-all duration-300"
          style={{ zIndex: 99999 }}
          onClick={() => setIsOpen(false)}
          data-testid="floating-nav-backdrop"
        />
      )}

      {/* Floating Sidebar */}
      <div
        id="floating-nav-sidebar"
        className={cn(
          "fixed top-0 h-full w-80 transform transition-all duration-300 ease-out shadow-xl",
          isOpen 
            ? "left-0 translate-x-0" 
            : "-left-80 -translate-x-4 pointer-events-none"
        )}
        style={{ 
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          opacity: isOpen ? 1 : 0,
          zIndex: 999999,
          position: 'fixed',
          top: 0,
          left: isOpen ? 0 : -320,
          height: '100vh',
          width: '320px',
          marginLeft: 0
        }}
        data-testid="floating-nav-sidebar"
        data-state={isOpen ? 'open' : 'closed'}
      >
        <div className="flex h-full flex-col" style={{ backgroundColor: '#ffffff' }} id="floating-nav-content">
          {/* Current App Indicator */}
          {currentAppData && (
            <div className="border-b border-border" id="floating-nav-current-app">
              <div className="flex items-center gap-3 p-2.5 bg-secondary/50 rounded-lg" id="floating-nav-current-app-card">
                <Button
                  id="floating-nav-close-btn"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                  title="Close navigation"
                  data-testid="floating-nav-close"
                >
                  <X className="h-4 w-4" />
                </Button>
                {React.createElement(getIcon(currentAppData.icon), { 
                  className: "h-5 w-5 text-primary flex-shrink-0" 
                })}
                <div className="flex-1 min-w-0" id="floating-nav-current-app-info">
                  <div className="font-medium text-sm truncate" id="floating-nav-current-app-name">{currentAppData.name}</div>
                  <div className="text-xs text-muted-foreground" id="floating-nav-current-app-label">Current application</div>
                </div>
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              </div>
            </div>
          )}

          {/* Navigation Content */}
          <div className="flex-1 overflow-y-auto" id="floating-nav-scroll-area">
            <nav className="space-y-6" id="floating-nav-categories">
              {categories.map((category) => (
                <div key={category} id={`floating-nav-category-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                  <h3 className="mb-3 px-4 pt-4 text-xs font-medium text-muted-foreground uppercase tracking-wide" id={`floating-nav-category-title-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                    {category}
                  </h3>
                  <div className="space-y-1" id={`floating-nav-category-items-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                    {microfrontendRegistry
                      .filter((app) => app.category === category)
                      .map((app) => {
                        const Icon = getIcon(app.icon)
                        const isActive = currentApp === app.id
                        
                        return (
                          <button
                            key={app.id}
                            id={`floating-nav-app-${app.id}`}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-accent transition-all duration-200",
                              isActive && "bg-secondary shadow-sm"
                            )}
                            onClick={() => handleNavigate(app.id)}
                            data-testid={`floating-nav-app-${app.id}`}
                            data-active={isActive}
                          >
                            <Icon className="h-5 w-5 flex-shrink-0 text-primary" />
                            <div className="flex-1 min-w-0" id={`floating-nav-app-info-${app.id}`}>
                              <div className="text-sm font-medium truncate" id={`floating-nav-app-name-${app.id}`}>
                                {app.name}
                              </div>
                              {app.description && (
                                <div className="text-xs text-muted-foreground truncate mt-0.5" id={`floating-nav-app-desc-${app.id}`}>
                                  {app.description}
                                </div>
                              )}
                            </div>
                            {isActive && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" id={`floating-nav-app-indicator-${app.id}`} />
                            )}
                          </button>
                        )
                      })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="text-xs text-muted-foreground">
              <div className="font-medium">Mekong Platform</div>
              <div className="mt-1">Version 1.0.0</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
