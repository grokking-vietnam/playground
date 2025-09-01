import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Play,
  Upload,
  Database,
  Server,
  Shield,
  Users,
  BarChart3,
  Cloud,
  Settings,
  FileText,
  Workflow,
  Brain,
  GitBranch,
  Container,
  Network,
  Key,
  Monitor,
  Zap,
  Globe,
  Lock,
  HardDrive,
  Cpu,
  Activity,
  ChevronRight,
  Star,
  Copy,
  ExternalLink,
} from "lucide-react"

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: string
}

interface ServiceCategory {
  id: string
  title: string
  services: Service[]
}

interface Service {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Project information
  const projectInfo = {
    number: "174501833381",
    id: "logsys-1276",
    name: "logsys"
  }

  // Quick actions similar to Google Cloud Console
  const quickActions: QuickAction[] = [
    {
      id: "create-vm",
      title: "Create a VM",
      description: "Set up a virtual machine instance",
      icon: <Server className="h-5 w-5" />,
      action: "create"
    },
    {
      id: "run-query",
      title: "Run a query in BigQuery", 
      description: "Execute SQL queries on your data",
      icon: <Database className="h-5 w-5" />,
      action: "query"
    },
    {
      id: "deploy-app",
      title: "Deploy an application",
      description: "Deploy your app to the cloud",
      icon: <Upload className="h-5 w-5" />,
      action: "deploy"
    },
    {
      id: "create-bucket",
      title: "Create a storage bucket",
      description: "Set up cloud storage for your files",
      icon: <HardDrive className="h-5 w-5" />,
      action: "storage"
    }
  ]

  // Service categories
  const serviceCategories: ServiceCategory[] = [
    {
      id: "apis-services",
      title: "APIs & Services",
      services: [
        {
          id: "bigquery",
          name: "BigQuery",
          description: "Enterprise data warehouse",
          icon: <Database className="h-5 w-5 text-blue-600" />,
          category: "Data & Analytics"
        },
        {
          id: "vertex-ai",
          name: "Vertex AI",
          description: "Machine learning platform",
          icon: <Brain className="h-5 w-5 text-purple-600" />,
          category: "AI & ML"
        }
      ]
    },
    {
      id: "iam-admin",
      title: "IAM & Admin",
      services: [
        {
          id: "user-management",
          name: "User Management",
          description: "Manage users and groups",
          icon: <Users className="h-5 w-5 text-green-600" />,
          category: "Identity"
        },
        {
          id: "permission-control",
          name: "Permission Control",
          description: "Access control policies",
          icon: <Shield className="h-5 w-5 text-orange-600" />,
          category: "Security"
        }
      ]
    },
    {
      id: "compute",
      title: "Compute Engine",
      services: [
        {
          id: "vm-instances",
          name: "VM Instances",
          description: "Virtual machine instances",
          icon: <Server className="h-5 w-5 text-blue-500" />,
          category: "Compute"
        },
        {
          id: "kubernetes",
          name: "Kubernetes Engine",
          description: "Managed Kubernetes service",
          icon: <Container className="h-5 w-5 text-indigo-600" />,
          category: "Containers"
        }
      ]
    },
    {
      id: "storage",
      title: "Cloud Storage",
      services: [
        {
          id: "buckets",
          name: "Buckets",
          description: "Object storage service",
          icon: <HardDrive className="h-5 w-5 text-red-500" />,
          category: "Storage"
        }
      ]
    },
    {
      id: "networking",
      title: "VPC Network",
      services: [
        {
          id: "vpc-networks",
          name: "VPC Networks",
          description: "Virtual private cloud networks",
          icon: <Network className="h-5 w-5 text-cyan-600" />,
          category: "Networking"
        }
      ]
    },
    {
      id: "monitoring",
      title: "Monitoring",
      services: [
        {
          id: "dashboards",
          name: "Dashboards",
          description: "Custom monitoring dashboards",
          icon: <Monitor className="h-5 w-5 text-yellow-600" />,
          category: "Operations"
        },
        {
          id: "metrics",
          name: "Metrics Explorer",
          description: "Explore and analyze metrics",
          icon: <BarChart3 className="h-5 w-5 text-green-500" />,
          category: "Analytics"
        }
      ]
    }
  ]

  const handleQuickAction = (action: string) => {
    // Handle quick action clicks
    console.log(`Quick action: ${action}`)
  }

  const handleServiceClick = (serviceId: string) => {
    // Navigate to service
    console.log(`Navigate to service: ${serviceId}`)
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-3">
              <Cloud className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-normal text-gray-900">Welcome</h1>
            </div>
          </div>

          {/* Project Info */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span>You're working in</span>
              <Badge variant="secondary" className="font-medium">
                {projectInfo.name}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-8 mt-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Project number:</span>
              <span className="font-mono text-gray-900">{projectInfo.number}</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Project ID:</span>
              <span className="font-mono text-gray-900">{projectInfo.id}</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6 mt-6">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              Dashboard
            </Button>
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 flex items-center">
              Cloud Hub
              <Badge className="ml-2 bg-blue-100 text-blue-700 text-xs">
                New
              </Badge>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="flex items-center space-x-2 h-auto px-4 py-3 bg-white hover:bg-gray-50"
                onClick={() => handleQuickAction(action.action)}
              >
                {action.icon}
                <span className="font-medium">{action.title}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Access Services Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Quick access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium text-gray-900">
                      {category.title}
                    </CardTitle>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {category.services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
                        onClick={() => handleServiceClick(service.id)}
                      >
                        <div className="flex-shrink-0">
                          {service.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                              {service.name}
                            </p>
                            <ExternalLink className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* View All Products */}
        <div className="text-center">
          <Button variant="outline" className="bg-white hover:bg-gray-50">
            <Settings className="h-4 w-4 mr-2" />
            View all products
          </Button>
        </div>

        {/* Try Gemini Cloud Assist Chat */}
        <div className="fixed bottom-6 right-6">
          <Card className="w-80 bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-gray-900">
                Try Gemini Cloud Assist chat
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                (Tip: use <kbd className="px-1.5 py-0.5 text-xs bg-gray-200 rounded">Alt G</kbd> to open and close the chat)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Chat now
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
