import React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { microfrontendRegistry, getAllCategories } from "@/lib/microfrontend-registry"
import { 
  X, 
  Database, 
  Users, 
  Shield, 
  Workflow, 
  GitBranch, 
  Brain,
  Code,
  ChevronRight,
  ChevronLeft,
  Menu
} from "lucide-react"

interface NavigationSidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
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

export function NavigationSidebar({ 
  isOpen, 
  isCollapsed,
  onClose, 
  onToggleCollapse,
  onNavigate, 
  currentApp 
}: NavigationSidebarProps) {
  const categories = getAllCategories()

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap] || Database
    return Icon
  }

  const handleNavigate = (appId: string) => {
    onNavigate(appId)
    // Only close on mobile
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r bg-card h-[calc(100vh-3.5rem)] transition-all duration-300 ease-in-out",
          // Width based on collapsed state
          isCollapsed ? "w-16" : "w-80",
          // Desktop: always show, Mobile: slide in/out
          "md:translate-x-0",
          isOpen ? "translate-x-0 fixed z-50 md:relative" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header with collapse toggle */}
          <div className="flex items-center justify-between p-4 border-b">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold truncate">Navigation</h2>
            )}
            <div className="flex items-center gap-1">
              {/* Desktop collapse toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onToggleCollapse}
                className="hidden md:flex"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              {/* Mobile close button */}
              <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation content */}
          <div className="flex-1 overflow-y-auto p-2">
            <nav className="space-y-4">
              {categories.map((category) => (
                <div key={category}>
                  {!isCollapsed && (
                    <h3 className="mb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {category}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {microfrontendRegistry
                      .filter((app) => app.category === category)
                      .map((app) => {
                        const Icon = getIcon(app.icon)
                        const isActive = currentApp === app.id
                        
                        return (
                          <Button
                            key={app.id}
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start h-auto",
                              isCollapsed ? "p-3 justify-center" : "p-3",
                              isActive && "bg-secondary font-medium"
                            )}
                            onClick={() => handleNavigate(app.id)}
                            title={isCollapsed ? app.name : undefined}
                          >
                            <div className={cn(
                              "flex items-center",
                              isCollapsed ? "justify-center" : "space-x-3"
                            )}>
                              <Icon className="h-5 w-5 flex-shrink-0" />
                              {!isCollapsed && (
                                <div className="flex-1 min-w-0 text-left">
                                  <div className="text-sm font-medium truncate">
                                    {app.name}
                                  </div>
                                  {app.description && (
                                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                                      {app.description}
                                    </div>
                                  )}
                                </div>
                              )}
                              {!isCollapsed && isActive && (
                                <ChevronRight className="h-4 w-4 flex-shrink-0" />
                              )}
                            </div>
                          </Button>
                        )
                      })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Footer */}
          {!isCollapsed && (
            <div className="border-t p-4">
              <div className="text-xs text-muted-foreground">
                <div className="font-medium">Mekong Platform</div>
                <div className="mt-1">Version 1.0.0</div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}