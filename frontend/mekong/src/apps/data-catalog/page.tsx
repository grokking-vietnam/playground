import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { GitBranch, Search, Database, Table, FileText, Tag, Star, Filter } from "lucide-react"

export default function DataCatalogApp() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Catalog</h1>
          <p className="text-muted-foreground">Discover and catalog data assets</p>
        </div>
        <Button className="gap-2">
          <GitBranch className="h-4 w-4" />
          Register Dataset
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search datasets, tables, columns..."
                className="pl-10 text-lg h-12"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">Data assets cataloged</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datasets</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Registered datasets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables</CardTitle>
            <Table className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">Tables indexed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentation</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">Assets documented</p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Datasets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Featured Datasets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Customer Analytics",
                description: "Comprehensive customer behavior and analytics data",
                tables: 24,
                lastUpdated: "2 hours ago",
                tags: ["analytics", "customer", "production"],
              },
              {
                name: "Financial Reports",
                description: "Financial reporting and accounting datasets",
                tables: 18,
                lastUpdated: "1 day ago",
                tags: ["finance", "reports", "accounting"],
              },
              {
                name: "Product Catalog",
                description: "Complete product information and inventory data",
                tables: 12,
                lastUpdated: "3 hours ago",
                tags: ["product", "inventory", "catalog"],
              },
            ].map((dataset, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Database className="h-5 w-5 text-primary" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-foreground">{dataset.name}</div>
                    <div className="text-sm text-muted-foreground">{dataset.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {dataset.tables} tables • Updated {dataset.lastUpdated}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dataset.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "Dataset registered",
                item: "User Behavior Analytics",
                user: "John Doe",
                time: "2 minutes ago",
                type: "dataset",
              },
              {
                action: "Documentation updated",
                item: "Customer Orders Table",
                user: "Jane Smith",
                time: "15 minutes ago",
                type: "docs",
              },
              {
                action: "Schema modified",
                item: "Product Inventory",
                user: "Bob Johnson",
                time: "1 hour ago",
                type: "schema",
              },
              {
                action: "New table added",
                item: "Sales Metrics",
                user: "Alice Brown",
                time: "2 hours ago",
                type: "table",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  {activity.type === 'dataset' && <Database className="h-4 w-4 text-primary" />}
                  {activity.type === 'docs' && <FileText className="h-4 w-4 text-primary" />}
                  {activity.type === 'schema' && <GitBranch className="h-4 w-4 text-primary" />}
                  {activity.type === 'table' && <Table className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-foreground">
                    <span className="font-medium">{activity.user}</span> {activity.action.toLowerCase()}{" "}
                    <span className="font-medium">{activity.item}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
