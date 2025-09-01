"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CrossAppUserSelector } from "@/components/shared/cross-app-user-selector"
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  UserCheck,
  UserX,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Shield,
  Activity,
  FileText,
  Bell,
  Database,
} from "lucide-react"

export default function UserManagementApp() {
  // Mock user data - in real app this would come from API
  const availableUsers = [
    { id: "1", name: "John Doe", email: "john.doe@company.com" },
    { id: "2", name: "Jane Smith", email: "jane.smith@company.com" },
    { id: "3", name: "Mike Johnson", email: "mike.johnson@company.com" },
    { id: "4", name: "Sarah Wilson", email: "sarah.wilson@company.com" },
  ]

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
            {!sidebarCollapsed && <h2 className="text-lg font-semibold text-gray-900">User Management</h2>}
            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2">
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="space-y-2">
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Users className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">All Users</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <UserPlus className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Add Users</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Shield className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">User Roles</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Activity className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">User Activity</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Database className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Bulk Operations</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <FileText className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Reports</span>}
            </Button>
            <Button variant="ghost" className={`w-full justify-start ${sidebarCollapsed ? "px-2" : "px-3"}`}>
              <Bell className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2">Notifications</span>}
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
              <h1 className="text-3xl font-normal text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600">Manage users, roles, and permissions across your organization</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>

          <CrossAppUserSelector availableUsers={availableUsers} />

          {/* Search and filters */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search users..." className="pl-10" />
              </div>
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Export</Button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">1,247</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-semibold text-gray-900">1,156</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <UserX className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Inactive Users</p>
                    <p className="text-2xl font-semibold text-gray-900">91</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Admin Users</p>
                    <p className="text-2xl font-semibold text-gray-900">23</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "John Doe",
                    email: "john.doe@company.com",
                    role: "Admin",
                    status: "Active",
                    lastLogin: "2 hours ago",
                  },
                  {
                    name: "Jane Smith",
                    email: "jane.smith@company.com",
                    role: "Editor",
                    status: "Active",
                    lastLogin: "1 day ago",
                  },
                  {
                    name: "Mike Johnson",
                    email: "mike.johnson@company.com",
                    role: "Viewer",
                    status: "Inactive",
                    lastLogin: "1 week ago",
                  },
                  {
                    name: "Sarah Wilson",
                    email: "sarah.wilson@company.com",
                    role: "Editor",
                    status: "Active",
                    lastLogin: "3 hours ago",
                  },
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={user.role === "Admin" ? "default" : "secondary"}>{user.role}</Badge>
                      <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                      <p className="text-sm text-gray-600">{user.lastLogin}</p>
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
