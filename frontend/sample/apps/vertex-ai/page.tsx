"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Brain,
  Cpu,
  Database,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  BarChart3,
  Code,
  Layers,
  Target,
} from "lucide-react"

export default function VertexAIApp() {
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
            {!sidebarCollapsed && <h2 className="text-lg font-semibold text-gray-900">Vertex AI</h2>}
            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2">
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="space-y-2">
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Brain className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Models</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Cpu className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Training Jobs</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Zap className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Endpoints</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Database className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Datasets</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Code className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Notebooks</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Layers className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Pipelines</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Target className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Experiments</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <BarChart3 className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Model Monitoring</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <FileText className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Feature Store</span>}
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
          <h1 className="text-3xl font-normal text-gray-900 mb-8">Vertex AI</h1>
          <Card>
            <CardHeader>
              <CardTitle>Vertex AI Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Vertex AI microfrontend</p>
                  <p className="text-sm text-gray-400">
                    Build, deploy, and scale ML models with Google Cloud's unified AI platform
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
