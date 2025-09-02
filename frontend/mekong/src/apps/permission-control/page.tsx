import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Users, Settings, AlertTriangle, CheckCircle } from "lucide-react"

export default function PermissionControlApp() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permission Control</h1>
          <p className="text-muted-foreground">Configure access controls and security policies</p>
        </div>
        <Button className="gap-2">
          <Shield className="h-4 w-4" />
          New Policy
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Security policies active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Rules</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">Access control rules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Resources</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Resources under protection</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Overall security rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Access Control Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Control Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                name: "Data Access Policy",
                description: "Controls access to sensitive data resources",
                status: "active",
                rules: 12,
              },
              {
                name: "Admin Access Policy",
                description: "Restricts administrative functions",
                status: "active",
                rules: 8,
              },
              {
                name: "Guest User Policy",
                description: "Limited access for guest users",
                status: "inactive",
                rules: 5,
              },
            ].map((policy, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{policy.name}</div>
                  <div className="text-sm text-muted-foreground">{policy.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {policy.rules} rules configured
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    policy.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {policy.status}
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resource Protection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Resource Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                resource: "SQL Database Tables",
                protection: "High",
                policies: 3,
                status: "protected",
              },
              {
                resource: "User Data",
                protection: "Critical",
                policies: 5,
                status: "protected",
              },
              {
                resource: "Analytics Reports",
                protection: "Medium",
                policies: 2,
                status: "protected",
              },
              {
                resource: "System Logs",
                protection: "Low",
                policies: 1,
                status: "warning",
              },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{item.resource}</div>
                  <div className="text-sm text-muted-foreground">
                    Protection Level: {item.protection}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.policies} policies applied
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {item.status === 'protected' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-yellow-800">
                  Review Guest User Permissions
                </div>
                <div className="text-sm text-yellow-700 mt-1">
                  Some guest users have elevated permissions that may pose security risks.
                </div>
              </div>
              <Button variant="outline" size="sm">
                Review
              </Button>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-blue-800">
                  Enable Multi-Factor Authentication
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Enhance security by requiring MFA for admin accounts.
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-green-800">
                  Regular Security Audits
                </div>
                <div className="text-sm text-green-700 mt-1">
                  Schedule regular security audits to maintain compliance.
                </div>
              </div>
              <Button variant="outline" size="sm">
                Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
