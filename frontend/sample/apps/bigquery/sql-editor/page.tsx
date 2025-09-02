"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Star,
  MoreHorizontal,
  ChevronDown,
  Database,
  Play,
  Share,
  Copy,
  Camera,
  Trash2,
  Download,
  RefreshCw,
  Filter,
  X,
  Settings,
} from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

export default function SQLEditorPage() {
  const [selectedTab, setSelectedTab] = useState("schema")
  const [sqlQuery, setSqlQuery] = useState(`SELECT 
  ID,
  TYPE_,
  AGENT,
  AGENT_TYPE,
  CREATED,
  OPEN_DATE,
  OPEN_BALANCE,
  CURR_BALANCE,
  AVAIL_BALANCE,
  PEND_BALANCE,
  THRESHOLD,
  RATE,
  STATUS,
  LIMIT,
  UPPER_LIMIT,
  CSID,
  LAST_CREDIT,
  LAST_DEBIT
FROM \`momovn-prod.ACCOUNTING.ACCOUNT_BK_20241229_061054\`
LIMIT 1000`)

  // Mock table schema data
  const tableFields = [
    {
      name: "ID",
      type: "FLOAT",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "TYPE_",
      type: "FLOAT",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "AGENT",
      type: "FLOAT",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "AGENT_TYPE",
      type: "FLOAT",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "CREATED",
      type: "INTEGER",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "OPEN_DATE",
      type: "INTEGER",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "OPEN_BALANCE",
      type: "FLOAT",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "CURR_BALANCE",
      type: "FLOAT",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "AVAIL_BALANCE",
      type: "FLOAT",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "PEND_BALANCE",
      type: "FLOAT",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "THRESHOLD",
      type: "FLOAT",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "RATE",
      type: "FLOAT",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "STATUS",
      type: "FLOAT",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "LIMIT",
      type: "FLOAT",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "UPPER_LIMIT",
      type: "FLOAT",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "CSID",
      type: "FLOAT",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "LAST_CREDIT",
      type: "INTEGER",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
    {
      name: "LAST_DEBIT",
      type: "INTEGER",
      mode: "NULLABLE",
      key: "-",
      collation: "-",
      defaultValue: "-",
      policyTags: "-",
      dataPolicies: "-",
      description: "-",
    },
  ]

  return (
    <div className="flex h-screen">
      {/* Explorer Sidebar */}
      <aside className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
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
            <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">momovn-prod</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <Button variant="ghost" size="sm" className="p-1">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="ml-6 space-y-1">
              <div className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded">
                <Database className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Pipelines</span>
              </div>
              <div className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded">
                <Settings className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">External connections</span>
              </div>
              <div className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                  <Database className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">ACCOUNTING</span>
                </div>
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
              </div>

              <div className="ml-6 space-y-1">
                <div className="flex items-center justify-between py-1 px-2 bg-blue-50 rounded">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">ACCOUNT_BK_20241229_061054</span>
                  </div>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Summary</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-2 space-y-1 text-sm">
            <div>
              <span className="text-gray-500">Dataset:</span>{" "}
              <span className="text-gray-700">ACCOUNT_BK_20241229_061054</span>
            </div>
            <div>
              <span className="text-gray-500">Project:</span>{" "}
              <span className="text-gray-700">momovn-prod.ACCOUNTING</span>
            </div>
            <div>
              <span className="text-gray-500">Last modified:</span>{" "}
              <span className="text-gray-700">Dec 29, 2024, 8:07:49 PM UTC+7</span>
            </div>
            <div>
              <span className="text-gray-500">Data location:</span> <span className="text-gray-700">US</span>
            </div>
            <div>
              <span className="text-gray-500">Description:</span> <span className="text-gray-700">-</span>
            </div>
            <div>
              <span className="text-gray-500">Labels:</span> <span className="text-gray-700">-</span>
            </div>
            <div>
              <span className="text-gray-500">Table type:</span> <span className="text-gray-700">table</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-gray-600" />
                <span className="text-lg font-medium text-gray-900">ACCOUNT_BK_20241229_061054</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Play className="h-4 w-4 mr-1" />
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
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start border-b border-gray-200 bg-white rounded-none h-12 p-0">
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
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
            >
              Table Explorer
            </TabsTrigger>
            <TabsTrigger
              value="preview-badge"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent bg-gray-100"
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

          <TabsContent value="schema" className="flex-1 p-0 m-0">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Input placeholder="Enter property name or value" className="max-w-md" />
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-8 p-3 text-left">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Field name</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Mode</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Key</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Collation</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Default Value</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Policy Tags</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Data Policies</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {tableFields.map((field, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="p-3 text-sm text-gray-900">{field.name}</td>
                      <td className="p-3 text-sm text-gray-600">{field.type}</td>
                      <td className="p-3 text-sm text-gray-600">{field.mode}</td>
                      <td className="p-3 text-sm text-gray-600">{field.key}</td>
                      <td className="p-3 text-sm text-gray-600">{field.collation}</td>
                      <td className="p-3 text-sm text-gray-600">{field.defaultValue}</td>
                      <td className="p-3 text-sm text-gray-600">{field.policyTags}</td>
                      <td className="p-3 text-sm text-gray-600">{field.dataPolicies}</td>
                      <td className="p-3 text-sm text-gray-600">{field.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Edit schema
                </Button>
                <Button variant="outline" size="sm">
                  View row access policies
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="flex-1 p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Table Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Table ID:</span> ACCOUNT_BK_20241229_061054
                </div>
                <div>
                  <span className="font-medium">Dataset:</span> ACCOUNTING
                </div>
                <div>
                  <span className="font-medium">Project:</span> momovn-prod
                </div>
                <div>
                  <span className="font-medium">Location:</span> US
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1">
            <div className="h-full">
              <MonacoEditor
                height="100%"
                language="sql"
                theme="vs"
                value={sqlQuery}
                onChange={(value) => setSqlQuery(value || "")}
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
          </TabsContent>
        </Tabs>

        {/* Bottom Job History */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Job history</span>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
