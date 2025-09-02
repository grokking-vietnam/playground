"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Editor from "@monaco-editor/react"
import {
  Search,
  Plus,
  Star,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Database,
  FileText,
  Sparkles,
  Brain,
  GitBranch,
  Workflow,
  Table,
  Play,
  RefreshCw,
  ArrowLeft,
  Share,
  Copy,
  Camera,
  Trash2,
  Download,
  Filter,
  CheckSquare,
} from "lucide-react"

export default function BigQueryStudioApp() {
  const [currentView, setCurrentView] = useState<"studio" | "sql-editor">("studio")
  const [sqlQuery, setSqlQuery] = useState(`SELECT 
  field_name,
  type,
  mode,
  description
FROM 
  \`momovn-prod.ACCOUNTING.ACCOUNT_BK_20241229_061054\`
LIMIT 100;`)

  const handleOpenSQLEditor = () => {
    setCurrentView("sql-editor")
  }

  const handleBackToStudio = () => {
    setCurrentView("studio")
  }

  if (currentView === "sql-editor") {
    return (
      <div className="flex">
        {/* Explorer Sidebar */}
        <aside className="w-80 border-r border-gray-200 bg-white h-screen overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Explorer</h2>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                <Plus className="h-4 w-4 mr-1" />
                Add data
              </Button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search BigQuery resources" className="pl-10 text-sm" />
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="rounded" />
                Show starred only
              </label>
            </div>

            <div className="space-y-1">
              {[
                { name: "momovn-dev", starred: false, expanded: false },
                { name: "momovn-ipos", starred: true, expanded: false },
                { name: "momovn-nhanhvn", starred: true, expanded: false },
                { name: "momovn-prod", starred: true, expanded: true },
                { name: "project-540504384186330", starred: true, expanded: false },
              ].map((project) => (
                <div key={project.name}>
                  <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {project.expanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">{project.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {project.starred && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                      <Button variant="ghost" size="sm" className="p-1">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {project.expanded && project.name === "momovn-prod" && (
                    <div className="ml-6 space-y-1">
                      <div className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded">
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                        <Database className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">ACCOUNTING</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        <div className="flex items-center gap-2 py-1 px-2 hover:bg-blue-50 rounded bg-blue-50">
                          <Table className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-700 font-medium">ACCOUNT_BK_20241229_061054</span>
                          <Star className="h-4 w-4 text-yellow-400 fill-current ml-auto" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900 mb-2">ACCOUNT_BK_20241229_061054</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>momovn-prod.ACCOUNTING</div>
                <div>Last modified: Dec 29, 2024, 8:07:49 PM UTC+7</div>
                <div>Data location: US</div>
                <div>Description: -</div>
                <div>Labels: -</div>
                <div>Table type: table</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main SQL Editor Content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={handleBackToStudio}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">ACCOUNT_BK_20241229_061054</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 bg-transparent">
                  <Database className="h-4 w-4 mr-1" />
                  Query
                </Button>
                <Button variant="outline" size="sm">
                  Open in
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-1" />
                  Snapshot
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="schema" className="flex-1 flex flex-col">
            <TabsList className="border-b border-gray-200 bg-white rounded-none h-auto p-0">
              <TabsTrigger
                value="schema"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
              >
                Schema
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
              >
                Preview
              </TabsTrigger>
              <TabsTrigger
                value="table-explorer"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent bg-blue-100 text-blue-700"
              >
                Table Explorer
              </TabsTrigger>
              <TabsTrigger
                value="preview-badge"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent bg-gray-800 text-white"
              >
                Preview
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
              >
                Insights
              </TabsTrigger>
              <TabsTrigger
                value="lineage"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
              >
                Lineage
              </TabsTrigger>
              <TabsTrigger
                value="data-profile"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
              >
                Data Profile
              </TabsTrigger>
              <TabsTrigger
                value="data-quality"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
              >
                Data Quality
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schema" className="flex-1 p-4">
              <div className="space-y-4">
                {/* Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Input placeholder="Enter property name or value" className="max-w-md" />
                </div>

                {/* Table Header */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                      <div className="col-span-1">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                      <div className="col-span-2">Field name</div>
                      <div className="col-span-1">Type</div>
                      <div className="col-span-1">Mode</div>
                      <div className="col-span-1">Key</div>
                      <div className="col-span-1">Collation</div>
                      <div className="col-span-1">Default Value</div>
                      <div className="col-span-1">Policy Tags</div>
                      <div className="col-span-1">Data Policies</div>
                      <div className="col-span-2">Description</div>
                    </div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-gray-200">
                    {[
                      { name: "ID", type: "FLOAT", mode: "NULLABLE" },
                      { name: "TYPE_", type: "FLOAT", mode: "NULLABLE" },
                      { name: "AGENT", type: "FLOAT", mode: "NULLABLE" },
                      { name: "AGENT_TYPE", type: "FLOAT", mode: "NULLABLE" },
                      { name: "CREATED", type: "INTEGER", mode: "NULLABLE" },
                      { name: "OPEN_DATE", type: "INTEGER", mode: "NULLABLE" },
                      { name: "OPEN_BALANCE", type: "FLOAT", mode: "NULLABLE" },
                      { name: "CURR_BALANCE", type: "FLOAT", mode: "NULLABLE" },
                      { name: "AVAIL_BALANCE", type: "FLOAT", mode: "NULLABLE" },
                      { name: "PEND_BALANCE", type: "FLOAT", mode: "NULLABLE" },
                      { name: "THRESHOLD", type: "FLOAT", mode: "NULLABLE" },
                      { name: "RATE", type: "FLOAT", mode: "NULLABLE" },
                      { name: "STATUS", type: "FLOAT", mode: "NULLABLE" },
                      { name: "LIMIT", type: "FLOAT", mode: "NULLABLE" },
                      { name: "UPPER_LIMIT", type: "FLOAT", mode: "NULLABLE" },
                      { name: "CSID", type: "FLOAT", mode: "NULLABLE" },
                      { name: "LAST_CREDIT", type: "INTEGER", mode: "NULLABLE" },
                      { name: "LAST_DEBIT", type: "INTEGER", mode: "NULLABLE" },
                    ].map((field, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 px-4 py-3 text-sm hover:bg-gray-50">
                        <div className="col-span-1">
                          <input type="checkbox" className="rounded" />
                        </div>
                        <div className="col-span-2 font-medium text-gray-900">{field.name}</div>
                        <div className="col-span-1 text-gray-600">{field.type}</div>
                        <div className="col-span-1 text-gray-600">{field.mode}</div>
                        <div className="col-span-1 text-gray-400">-</div>
                        <div className="col-span-1 text-gray-400">-</div>
                        <div className="col-span-1 text-gray-400">-</div>
                        <div className="col-span-1 text-gray-400">-</div>
                        <div className="col-span-1 text-gray-400">-</div>
                        <div className="col-span-2 text-gray-400">-</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" className="text-blue-600 border-blue-200 bg-transparent">
                    Edit schema
                  </Button>
                  <Button variant="outline">View row access policies</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="table-explorer" className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">
                {/* SQL Editor */}
                <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">SQL Query</span>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                  </div>
                  <Editor
                    height="300px"
                    defaultLanguage="sql"
                    value={sqlQuery}
                    onChange={(value) => setSqlQuery(value || "")}
                    theme="vs"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Other tab contents would go here */}
            <TabsContent value="details" className="flex-1 p-4">
              <div className="text-gray-600">Table details content...</div>
            </TabsContent>
            <TabsContent value="preview" className="flex-1 p-4">
              <div className="text-gray-600">Table preview content...</div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    )
  }

  return (
    <div className="flex">
      <aside className="w-80 border-r border-gray-200 bg-white h-screen overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Explorer</h2>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
              <Plus className="h-4 w-4 mr-1" />
              Add data
            </Button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search BigQuery resources" className="pl-10 text-sm" />
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="rounded" />
              Show starred only
            </label>
          </div>

          <div className="space-y-1">
            {[
              { name: "momovn-dev", starred: false },
              { name: "momovn-ipos", starred: true },
              { name: "momovn-nhanhvn", starred: true },
              { name: "momovn-prod", starred: true },
              { name: "project-540504384186330", starred: true },
            ].map((project) => (
              <div key={project.name} className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{project.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {project.starred && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                  <Button variant="ghost" size="sm" className="p-1">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Summary</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Nothing currently selected</p>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-6xl">
          <h1 className="text-3xl font-normal text-gray-900 mb-8">Welcome to BigQuery Studio!</h1>

          {/* Create new section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create new</h2>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
                onClick={handleOpenSQLEditor}
              >
                <Database className="h-4 w-4" />
                SQL query
              </Button>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <FileText className="h-4 w-4" />
                Notebook
              </Button>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Sparkles className="h-4 w-4" />
                Notebook with Spark
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
              >
                <Brain className="h-4 w-4" />
                ML model
              </Button>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <GitBranch className="h-4 w-4" />
                Data canvas
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
              >
                <Workflow className="h-4 w-4" />
                Pipeline
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
              >
                <RefreshCw className="h-4 w-4" />
                Data preparation
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
              >
                <Table className="h-4 w-4" />
                Table
              </Button>
            </div>
          </div>

          {/* Recently opened section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recently opened</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {[
                { name: "USER_PARAMS", type: "US · momovn-dev", time: "3 days ago" },
                { name: "employee_data", type: "US · momovn-cdo-shared", time: "3 days ago" },
                { name: "USERS", type: "US · momovn-dev", time: "3 days ago" },
                { name: "APP_EVENT_V7", type: "US · momovn-data-platform", time: "4 days ago" },
                { name: "OFFLINE_MERCHANT_M4B_P2...", type: "US · project-540504384186...", time: "6 days ago" },
                { name: "NEWTON_PAYMENT_FUNNEL", type: "US · momovn-prod", time: "6 days ago" },
                { name: "D_OFF_PAYMENT_ARC", type: "US · momovn-arc", time: "6 days ago" },
              ].map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Database className="h-5 w-5 text-gray-400" />
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-gray-300" />
                        <MoreHorizontal className="h-4 w-4 text-gray-300" />
                      </div>
                    </div>
                    <h3 className="font-medium text-sm text-gray-900 mb-1 truncate">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-3">{item.type}</p>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 p-0 h-auto">
                      Open
                    </Button>
                    <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Try with sample data section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Try with sample data</h2>
            <div className="space-y-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-green-400 to-yellow-400 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 rounded-sm"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Try the Google Trends Demo Query</h3>
                      <p className="text-gray-600 mb-4">
                        This simple query generates the top search terms in the US from the Google Trends public
                        dataset.
                      </p>
                      <div className="flex items-center gap-4">
                        <Button className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Open query
                        </Button>
                        <Button variant="ghost" className="text-gray-600">
                          View dataset
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <div className="text-orange-600 font-bold text-lg">⚡</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Try the Spark Demo Notebook</h3>
                      <p className="text-gray-600 mb-4">
                        This notebook walks you through their basics and showcases Spark in BigQuery.
                      </p>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 text-orange-600 hover:bg-orange-50 p-0"
                      >
                        <Sparkles className="h-4 w-4" />
                        Open notebook with Spark
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Add your own data section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add your own data</h2>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Job history</span>
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
