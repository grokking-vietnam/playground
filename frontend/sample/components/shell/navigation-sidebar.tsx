"use client"

import { Button } from "@/components/ui/button"
import { Database, GitBranch, Brain, Users, Shield, Workflow, Settings, RefreshCw, HelpCircle, X } from "lucide-react"

interface NavigationSidebarProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (app: string) => void
  currentApp: string
}

export function NavigationSidebar({ isOpen, onClose, onNavigate, currentApp }: NavigationSidebarProps) {
  const navigationItems = [
    {
      category: "Data & Analytics",
      items: [
        { id: "bigquery", name: "BigQuery Studio", icon: Database },
        { id: "datacatalog", name: "Data Catalog", icon: GitBranch },
        { id: "vertexai", name: "Vertex AI", icon: Brain },
      ],
    },
    {
      category: "Management",
      items: [
        { id: "usermanagement", name: "User Management", icon: Users },
        { id: "permissioncontrol", name: "Permission Control", icon: Shield },
        { id: "workflowmanagement", name: "Workflow Management", icon: Workflow },
      ],
    },
    {
      category: "Operations",
      items: [
        { id: "settings", name: "Project Settings", icon: Settings },
        { id: "monitoring", name: "Job Monitoring", icon: RefreshCw },
        { id: "support", name: "Support & Documentation", icon: HelpCircle },
      ],
    },
  ]

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 z-50 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Navigation</h2>
          <Button variant="ghost" size="sm" className="p-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <nav className="space-y-2">
            {navigationItems.map((section) => (
              <div key={section.category} className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">{section.category}</h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = currentApp === item.id

                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className={`w-full justify-start text-left ${isActive ? "bg-blue-50 text-blue-700" : ""}`}
                        onClick={() => {
                          onNavigate(item.id)
                          onClose()
                        }}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.name}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
