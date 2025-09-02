"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Database,
  Search,
  Tag,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Shield,
  Clock,
} from "lucide-react"

export default function DataCatalogApp() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-full">
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            {!sidebarCollapsed && <h2 className="text-lg font-semibold text-gray-900">Data Catalog</h2>}
            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2">
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="space-y-2">
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Database className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">All Datasets</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Search className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Search Data</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <FolderOpen className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Collections</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Tag className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Tags & Labels</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Shield className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Data Governance</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Users className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Data Owners</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Clock className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Data Lineage</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <BarChart3 className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Usage Analytics</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Settings className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Settings</span>}
            </Button>
          </nav>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-6xl">
          <h1 className="text-3xl font-normal text-gray-900 mb-8">Data Catalog</h1>
          <Card>
            <CardHeader>
              <CardTitle>Data Catalog Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Data Catalog microfrontend</p>
                  <p className="text-sm text-gray-400">
                    Discover, understand, and manage your organization's data assets
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
