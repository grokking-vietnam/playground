"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Workflow,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Calendar,
  BarChart3,
  Settings,
  AlertTriangle,
  History,
} from "lucide-react"

export default function WorkflowManagementApp() {
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
            {!sidebarCollapsed && <h2 className="text-lg font-semibold text-gray-900">Workflows</h2>}
            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2">
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="space-y-2">
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Workflow className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">All Workflows</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Plus className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Create Workflow</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <GitBranch className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Templates</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Play className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Running</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Calendar className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Scheduled</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <AlertTriangle className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Failed</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <History className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">History</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <BarChart3 className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Analytics</span>}
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-normal text-gray-900 mb-2">Workflow Management</h1>
              <p className="text-gray-600">Create, monitor, and manage automated workflows and processes</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Workflow
            </Button>
          </div>

          {/* Workflow stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Workflow className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Workflows</p>
                    <p className="text-2xl font-semibold text-gray-900">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Play className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Running</p>
                    <p className="text-2xl font-semibold text-gray-900">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Scheduled</p>
                    <p className="text-2xl font-semibold text-gray-900">8</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-semibold text-gray-900">4</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active workflows */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Data Pipeline ETL",
                    status: "Running",
                    progress: 75,
                    lastRun: "2 minutes ago",
                    nextRun: "In 58 minutes",
                  },
                  {
                    name: "User Onboarding",
                    status: "Completed",
                    progress: 100,
                    lastRun: "1 hour ago",
                    nextRun: "Tomorrow 9:00 AM",
                  },
                  {
                    name: "Report Generation",
                    status: "Failed",
                    progress: 45,
                    lastRun: "3 hours ago",
                    nextRun: "Retry in 15 minutes",
                  },
                  {
                    name: "Backup Process",
                    status: "Scheduled",
                    progress: 0,
                    lastRun: "Yesterday",
                    nextRun: "Tonight 2:00 AM",
                  },
                ].map((workflow, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {workflow.status === "Running" && <Play className="h-4 w-4 text-green-600" />}
                        {workflow.status === "Completed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {workflow.status === "Failed" && <XCircle className="h-4 w-4 text-red-600" />}
                        {workflow.status === "Scheduled" && <Clock className="h-4 w-4 text-yellow-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{workflow.name}</p>
                        <p className="text-sm text-gray-600">
                          Last run: {workflow.lastRun} • Next: {workflow.nextRun}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${
                              workflow.status === "Failed"
                                ? "bg-red-500"
                                : workflow.status === "Completed"
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                            }`}
                            style={{ width: `${workflow.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{workflow.progress}%</span>
                      </div>
                      <Badge
                        variant={
                          workflow.status === "Running"
                            ? "default"
                            : workflow.status === "Completed"
                              ? "secondary"
                              : workflow.status === "Failed"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {workflow.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
