"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Lock,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Settings,
  History,
  FileText,
  AlertTriangle,
} from "lucide-react"

export default function PermissionControlApp() {
  const [sidebarVisible, setSidebarVisible] = useState(true)

  return (
    <div className="flex h-full">
      {sidebarVisible && (
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">Permission Tools</h2>
            <Button variant="ghost" size="sm" onClick={() => setSidebarVisible(false)} className="p-1">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <nav className="space-y-2">
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Management</p>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Roles & Permissions
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  User Groups
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                  <Lock className="h-4 w-4 mr-2" />
                  Access Policies
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Monitoring</p>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                  <History className="h-4 w-4 mr-2" />
                  Audit Logs
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Security Alerts
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Compliance Reports
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Configuration</p>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}

      <div className="flex-1 p-8">
        {!sidebarVisible && (
          <Button variant="ghost" size="sm" onClick={() => setSidebarVisible(true)} className="mb-4 p-2">
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        <div className="max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-normal text-gray-900 mb-2">Permission Control</h1>
              <p className="text-gray-600">Manage roles, permissions, and access control policies</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          </div>

          {/* Permission overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Roles</p>
                    <p className="text-2xl font-semibold text-gray-900">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Lock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Permissions</p>
                    <p className="text-2xl font-semibold text-gray-900">47</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Policy Groups</p>
                    <p className="text-2xl font-semibold text-gray-900">8</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roles and permissions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Roles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Super Admin", users: 3, permissions: 47, color: "red" },
                    { name: "Admin", users: 12, permissions: 35, color: "blue" },
                    { name: "Data Analyst", users: 45, permissions: 18, color: "green" },
                    { name: "Viewer", users: 156, permissions: 8, color: "gray" },
                    { name: "Guest", users: 23, permissions: 3, color: "yellow" },
                  ].map((role, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-${role.color}-500`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{role.name}</p>
                          <p className="text-sm text-gray-600">
                            {role.users} users • {role.permissions} permissions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Permission Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: "Data Access", permissions: ["Read", "Write", "Delete"], count: 12 },
                    { category: "User Management", permissions: ["Create User", "Edit User", "Delete User"], count: 8 },
                    { category: "System Settings", permissions: ["Configure", "Monitor", "Backup"], count: 15 },
                    {
                      category: "Analytics",
                      permissions: ["View Reports", "Export Data", "Create Dashboards"],
                      count: 12,
                    },
                  ].map((category, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{category.category}</h4>
                        <Badge variant="secondary">{category.count} permissions</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.permissions.map((permission, pIndex) => (
                          <Badge key={pIndex} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
