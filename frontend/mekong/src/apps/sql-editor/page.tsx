import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import Editor from "@monaco-editor/react"
import { EnhancedSQLEditor } from "./components/editor/EnhancedSQLEditor"
import { EditorStatusBar } from "./components/editor/EditorStatusBar"
import { EditorSettingsDropdown } from "./components/editor/EditorSettings"
import type { EditorSettings, DatabaseSchema } from "./types"
import * as monaco from 'monaco-editor'

// Import connection management components and hooks
import { useConnections } from "./hooks/useConnections"
import { ConnectionForm } from "./components/connections/ConnectionForm"
import { ConnectionList } from "./components/connections/ConnectionList"
import { ConnectionStatus } from "./components/connections/ConnectionStatus"
import { 
  DatabaseConnection, 
  ConnectionFormData, 
  ENGINE_DISPLAY_NAMES,
  DatabaseEngine 
} from "./types"
import {
  Search,
  Plus,
  Star,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
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
  Settings,
  Bookmark,
  History,
  FolderOpen,
  TableProperties,
  Eye,
  PinIcon,
  Clock,
  Shield,
  X,
  Save,
  Calendar,
  MoreVertical,
  ChevronDown,
  Check,
  Settings2,
  Wand2,
  Languages,
  Zap,
} from "lucide-react"

interface Project {
  id: string
  name: string
  datasets: Dataset[]
  expanded?: boolean
}

interface Dataset {
  id: string
  name: string
  tables: TableInfo[]
  expanded?: boolean
}

interface TableInfo {
  id: string
  name: string
  type: 'table' | 'view' | 'external'
  lastModified: string
}

interface QueryTab {
  id: string
  name: string
  query: string
  isUnsaved: boolean
}

export default function SqlEditorApp() {
  // Connection management
  const { 
    connections, 
    activeConnection, 
    setActiveConnection,
    createConnection,
    updateConnection,
    deleteConnection,
    loading: connectionLoading,
    error: connectionError
  } = useConnections()

  // Connection management UI state
  const [showConnectionForm, setShowConnectionForm] = useState(false)
  const [showConnectionList, setShowConnectionList] = useState(false)
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null)
  
  // Query tabs state
  const [queryTabs, setQueryTabs] = useState<QueryTab[]>([
    { id: "tab-1", name: "Untitled query", query: "SELECT 1+1", isUnsaved: false }
  ])
  const [activeQueryTabId, setActiveQueryTabId] = useState("tab-1")
  
  // Legacy state (for backward compatibility)
  const [sqlQuery, setSqlQuery] = useState(`SELECT 1+1`)
  const [selectedEngine, setSelectedEngine] = useState(DatabaseEngine.BIGQUERY)

  const [queryResults, setQueryResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedProject, setSelectedProject] = useState("default-project")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("results")
  const [showStarredOnly, setShowStarredOnly] = useState(false)
  const [processingLocation, setProcessingLocation] = useState("US")
  const [isAppSidebarCollapsed, setIsAppSidebarCollapsed] = useState(true)
  const [isDataCatalogCollapsed, setIsDataCatalogCollapsed] = useState(false)
  const [dataCatalogWidth, setDataCatalogWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(true)
  const [searchBoxWidth, setSearchBoxWidth] = useState(Math.floor(window.innerWidth / 3))
  const [collapsedSections, setCollapsedSections] = useState({
    queries: false,
    administration: false,
    tools: false,
    migration: false
  })
  const [jobHistory, setJobHistory] = useState([
    {
      id: "job_123",
      query: "SELECT 1+1",
      status: "completed",
      duration: "0.5 sec",
      timestamp: "2 minutes ago",
      bytesProcessed: "0 B"
    }
  ])

  // More dropdown options state
  const [sqlAutocomplete, setSqlAutocomplete] = useState(true)
  const [queryMode, setQueryMode] = useState("standard") // "standard", "batch", "streaming"
  const [enableSqlTranslation, setEnableSqlTranslation] = useState(false)

  // Enhanced editor state
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: false,
    lineNumbers: true,
    autoComplete: true,
    syntaxHighlighting: true,
    errorHighlighting: true,
    formatOnType: false
  })
  const [validationErrors, setValidationErrors] = useState<monaco.editor.IMarkerData[]>([])
  const [currentSchema, setCurrentSchema] = useState<DatabaseSchema | null>(null)

  // Helper functions for query tabs
  const getCurrentQueryTab = () => {
    return queryTabs.find(tab => tab.id === activeQueryTabId) || queryTabs[0]
  }

  const updateQueryTab = (tabId: string, updates: Partial<QueryTab>) => {
    setQueryTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, ...updates, isUnsaved: true } : tab
    ))
  }

  const addNewQueryTab = () => {
    const newTabId = `tab-${Date.now()}`
    const newTab: QueryTab = {
      id: newTabId,
      name: `Untitled query ${queryTabs.length + 1}`,
      query: getDefaultQuery(),
      isUnsaved: false
    }
    setQueryTabs(prev => [...prev, newTab])
    setActiveQueryTabId(newTabId)
  }

  const closeQueryTab = (tabId: string) => {
    if (queryTabs.length <= 1) return // Don't close the last tab
    
    setQueryTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId)
      // If we're closing the active tab, switch to the first remaining tab
      if (tabId === activeQueryTabId && newTabs.length > 0) {
        setActiveQueryTabId(newTabs[0].id)
      }
      return newTabs
    })
  }

  // Connection management functions
  const handleCreateConnection = async (data: ConnectionFormData) => {
    try {
      const newConnection = await createConnection(data)
      setActiveConnection(newConnection)
      setShowConnectionForm(false)
      setEditingConnection(null)
    } catch (error) {
      console.error('Failed to create connection:', error)
      // Error handling is managed by the useConnections hook
    }
  }

  const handleUpdateConnection = async (data: ConnectionFormData) => {
    if (!editingConnection) return
    
    try {
      const updatedConnection = await updateConnection(editingConnection.id, data)
      setActiveConnection(updatedConnection)
      setShowConnectionForm(false)
      setEditingConnection(null)
    } catch (error) {
      console.error('Failed to update connection:', error)
    }
  }

  const handleDeleteConnection = async (connection: DatabaseConnection) => {
    try {
      await deleteConnection(connection.id)
      if (activeConnection?.id === connection.id) {
        setActiveConnection(null)
      }
    } catch (error) {
      console.error('Failed to delete connection:', error)
    }
  }

  const handleEditConnection = (connection: DatabaseConnection) => {
    setEditingConnection(connection)
    setShowConnectionForm(true)
    setShowConnectionList(false)
  }

  const handleCancelConnectionForm = () => {
    setShowConnectionForm(false)
    setEditingConnection(null)
  }

  const handleConnectionSelect = (connection: DatabaseConnection) => {
    setActiveConnection(connection)
    setShowConnectionList(false)
  }

  // Get default query based on active connection engine
  const getDefaultQuery = () => {
    if (!activeConnection) {
      return "SELECT 1+1"
    }
    
    switch (activeConnection.engine) {
      case DatabaseEngine.MYSQL:
        return "SELECT 1+1 as result;"
      case DatabaseEngine.POSTGRESQL:
        return "SELECT 1+1 as result;"
      case DatabaseEngine.SPARK_SQL:
        return "SELECT 1+1 as result"
      case DatabaseEngine.BIGQUERY:
      default:
        return "SELECT 1+1"
    }
  }
  
  // Mock data structure for database explorer
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "default-project",
      name: "default-project",
      expanded: true,
      datasets: [
        {
          id: "sample-data",
          name: "sample-data", 
          expanded: true,
          tables: [
            { id: "customers", name: "customers", type: 'table', lastModified: "3 days ago" },
            { id: "orders", name: "orders", type: 'table', lastModified: "5 days ago" },
            { id: "products", name: "products", type: 'view', lastModified: "1 week ago" },
            { id: "analytics", name: "analytics", type: 'table', lastModified: "2 days ago" },
            { id: "logs", name: "logs", type: 'table', lastModified: "4 days ago" },
            { id: "reports", name: "reports", type: 'external', lastModified: "1 week ago" },
          ]
        }
      ]
    }
  ])

  const toggleProjectExpanded = (projectId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, expanded: !p.expanded } : p
    ))
  }

  const toggleDatasetExpanded = (projectId: string, datasetId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { 
            ...p, 
            datasets: p.datasets.map(d => 
              d.id === datasetId ? { ...d, expanded: !d.expanded } : d
            )
          }
        : p
    ))
  }

  const runQuery = async () => {
    setIsRunning(true)
    const currentTab = getCurrentQueryTab()
    
    // Simulate query execution
    setTimeout(() => {
      setQueryResults([
        { "result": 2 }
      ])
      setIsRunning(false)
      setActiveTab("results")
      
      // Mark tab as saved after successful run
      if (currentTab) {
        updateQueryTab(currentTab.id, { isUnsaved: false })
      }
    }, 1000)
  }

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // More dropdown actions
  const formatQuery = () => {
    const currentTab = getCurrentQueryTab()
    if (currentTab && currentTab.query) {
      // Simple SQL formatting - in a real app, you'd use a proper SQL formatter
      const formatted = currentTab.query
        .replace(/\s+/g, ' ')
        .replace(/select/gi, 'SELECT')
        .replace(/from/gi, '\nFROM')
        .replace(/where/gi, '\nWHERE')
        .replace(/order by/gi, '\nORDER BY')
        .replace(/group by/gi, '\nGROUP BY')
        .trim()
      
      updateQueryTab(currentTab.id, { query: formatted })
    }
  }

  const openQuerySettings = () => {
    // In a real app, this would open a settings modal
    console.log("Opening query settings...")
  }

  const openTranslationSettings = () => {
    // In a real app, this would open translation settings modal
    console.log("Opening translation settings...")
  }

  const createStoredProcedure = () => {
    // In a real app, this would open stored procedure creation dialog
    console.log("Creating stored procedure...")
  }

  // Handle resize functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return
    
    // Calculate the sidebar width
    const sidebarWidth = isAppSidebarCollapsed ? 64 : 256
    
    // Calculate new width based on mouse position
    const newWidth = e.clientX - sidebarWidth
    const minWidth = 250
    // Allow up to half the screen width minus the app sidebar
    const maxWidth = Math.floor((window.innerWidth - sidebarWidth) / 2)
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setDataCatalogWidth(newWidth)
    }
  }, [isResizing, isAppSidebarCollapsed])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  // Handle window resize for search box width
  useEffect(() => {
    const handleWindowResize = () => {
      const oneThirdWidth = Math.floor(window.innerWidth / 3)
      // Ensure it doesn't exceed the data catalog width when expanded
      const maxWidth = isDataCatalogCollapsed ? oneThirdWidth : Math.min(oneThirdWidth, dataCatalogWidth - 40)
      const minWidth = 200 // Minimum usable width
      setSearchBoxWidth(Math.max(minWidth, Math.min(maxWidth, oneThirdWidth)))
    }

    handleWindowResize() // Call once on mount
    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [isDataCatalogCollapsed, dataCatalogWidth])

  const getTableIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye className="h-4 w-4 text-primary" />
      case 'external': return <FolderOpen className="h-4 w-4 text-primary" />
      default: return <Table className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getCurrentEngine = () => {
    if (!activeConnection) {
      return {
        name: 'No Connection',
        engine: DatabaseEngine.BIGQUERY, // Default engine for compatibility
        icon: <Database className="h-4 w-4" />
      }
    }
    return {
      name: activeConnection.name,
      engine: activeConnection.engine,
      engineName: ENGINE_DISPLAY_NAMES[activeConnection.engine],
      icon: <Database className="h-4 w-4" />
    }
  }

  // Enhanced editor handlers
  const handleEditorSettingsChange = (newSettings: Partial<EditorSettings>) => {
    setEditorSettings(prev => ({ ...prev, ...newSettings }))
  }

  const handleValidationChange = (errors: monaco.editor.IMarkerData[]) => {
    setValidationErrors(errors)
  }

  const handleSchemaUpdate = (schema: DatabaseSchema | null) => {
    setCurrentSchema(schema)
  }

  return (
    <div className="flex h-full bg-white">
      {/* 1. SQL Editor App Sidebar */}
      <div 
        id="sql-editor-app-sidebar" 
        className={cn(
          "relative bg-card border-r flex flex-col py-4 transition-all duration-300 ease-in-out",
          isAppSidebarCollapsed ? "w-16 items-center" : "w-64 items-start"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center mb-6",
          isAppSidebarCollapsed ? "justify-center" : "w-full px-4"
        )}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Database className="h-5 w-5 text-primary-foreground" />
            </div>
            {!isAppSidebarCollapsed && (
              <span className="ml-3 text-lg font-semibold">SQL Editor</span>
            )}
          </div>
        </div>

        {/* Connection Selector */}
        {!isAppSidebarCollapsed && (
          <div className="px-4 mb-4 w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center min-w-0">
                    {getCurrentEngine().icon}
                    <span className="ml-2 truncate">{getCurrentEngine().name}</span>
                    {activeConnection && (
                      <span className="ml-1 text-xs text-muted-foreground truncate">
                        ({getCurrentEngine().engineName})
                      </span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuLabel>Database Connections</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {connections.length > 0 ? (
                  connections.map((connection) => (
                    <DropdownMenuItem
                      key={connection.id}
                      onClick={() => setActiveConnection(connection)}
                      className="flex items-center"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate">{connection.name}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {ENGINE_DISPLAY_NAMES[connection.engine]}
                        </span>
                      </div>
                      {activeConnection?.id === connection.id && (
                        <Check className="h-4 w-4 ml-auto flex-shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    <span className="text-muted-foreground">No connections available</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowConnectionForm(true)}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Connection
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowConnectionList(true)}
                  className="flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Connections
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Navigation Sections */}
        <div className={cn(
          "flex-1 overflow-y-auto",
          isAppSidebarCollapsed ? "px-1" : "px-2"
        )}>
          {isAppSidebarCollapsed ? (
            /* Collapsed state - show icons only */
            <div className="flex flex-col space-y-2 items-center">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent" title="Editor">
                <Database className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent" title="Data transfers">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent" title="Version control">
                <GitBranch className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent" title="Scheduled queries">
                <Clock className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent" title="Settings">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent" title="Sharing">
                <Share className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent" title="Monitoring">
                <Eye className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent" title="Query optimizer">
                <Brain className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            /* Expanded state - show collapsible sections */
            <div className="space-y-4">
              {/* Editor Section */}
              <div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="w-full justify-start mb-2 bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <Database className="h-4 w-4 mr-3" />
                  SQL Editor
                </Button>
              </div>

              {/* Queries & Tools */}
              <div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('queries')}
                  className="w-full justify-between text-sm font-medium text-foreground hover:bg-accent mb-1"
                >
                  <span>Queries & Tools</span>
                  {collapsedSections.queries ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                {!collapsedSections.queries && (
                  <div className="ml-4 space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                      <ArrowLeft className="h-4 w-4 mr-3" />
                      Data transfers
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                      <GitBranch className="h-4 w-4 mr-3" />
                      Version control
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                      <Clock className="h-4 w-4 mr-3" />
                      Scheduled queries
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                      <Settings className="h-4 w-4 mr-3" />
                      Query settings
                    </Button>
                  </div>
                )}
              </div>

              {/* Administration */}
              <div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('administration')}
                  className="w-full justify-between text-sm font-medium text-foreground hover:bg-accent mb-1"
                >
                  <span>Administration</span>
                  {collapsedSections.administration ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                {!collapsedSections.administration && (
                  <div className="ml-4 space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                      <Eye className="h-4 w-4 mr-3" />
                      Query monitoring
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                      <Search className="h-4 w-4 mr-3" />
                      Query history
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                      <Table className="h-4 w-4 mr-3" />
                      Resource management
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                      <Brain className="h-4 w-4 mr-3" />
                      Query optimizer
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                      <RefreshCw className="h-4 w-4 mr-3" />
                      Backup & recovery
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                      <Sparkles className="h-4 w-4 mr-3" />
                      Performance insights
                    </Button>
                  </div>
                )}
              </div>

              {/* Tools */}
              <div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('tools')}
                  className="w-full justify-between text-sm font-medium text-foreground hover:bg-accent mb-1"
                >
                  <span>Tools</span>
                  {collapsedSections.tools ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                {!collapsedSections.tools && (
                  <div className="ml-4 space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                      <Share className="h-4 w-4 mr-3" />
                      Data sharing
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                      <Shield className="h-4 w-4 mr-3" />
                      Security policies
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                      <Database className="h-4 w-4 mr-3" />
                      Schema management
                    </Button>
                  </div>
                )}
              </div>

              {/* Migration */}
              <div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('migration')}
                  className="w-full justify-between text-sm font-medium text-foreground hover:bg-accent mb-1"
                >
                  <span>Migration</span>
                  {collapsedSections.migration ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                {!collapsedSections.migration && (
                  <div className="ml-4 space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                      <Workflow className="h-4 w-4 mr-3" />
                      Migration services
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer when expanded */}
        {!isAppSidebarCollapsed && (
          <div className="mt-auto border-t pt-4 px-4 w-full pb-10">
            <div className="text-xs text-muted-foreground">
              <div className="font-medium">SQL Editor Studio</div>
              <div className="mt-1">Multi-Engine SQL Platform</div>
            </div>
          </div>
        )}

        {/* Toggle button - flush at bottom */}
        <div className="absolute bottom-0 left-0 w-full">
          <div className="border-t bg-card">
            {isAppSidebarCollapsed ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsAppSidebarCollapsed(false)}
                className="w-full h-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-none justify-center"
                title="Expand sidebar"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsAppSidebarCollapsed(true)}
                className="w-full h-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-none justify-start px-4"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Data Catalog Explorer */}
      <div 
        id="data-catalog-explorer" 
        className={cn(
          "border-r flex bg-muted/30 relative",
          isDataCatalogCollapsed ? "w-12 transition-all duration-300 ease-in-out" : "flex-col",
          isResizing ? "" : "transition-all duration-150 ease-out"
        )}
        style={{ 
          width: isDataCatalogCollapsed ? '48px' : `${dataCatalogWidth}px`
        }}
      >
        {isDataCatalogCollapsed ? (
          /* Collapsed state - show only toggle button */
          <div className="flex flex-col items-center py-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsDataCatalogCollapsed(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent mb-2"
              title="Expand Explorer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            {/* Explorer Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Explorer</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsDataCatalogCollapsed(true)}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent"
                  title="Collapse Explorer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search database resources"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
              style={{ width: `${searchBoxWidth}px` }}
            />
          </div>

          {/* Show starred only checkbox */}
          <div className="flex items-center mb-3">
            <CheckSquare 
              className={`h-4 w-4 mr-2 cursor-pointer ${showStarredOnly ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => setShowStarredOnly(!showStarredOnly)}
            />
            <span className="text-sm text-muted-foreground">Show starred only</span>
          </div>
        </div>

              {/* Project Tree */}
              <div className="flex-1 overflow-auto p-2">
                {projects.map((project) => (
                  <div key={project.id} className="mb-2">
                    {/* Project Node */}
                    <div 
                      className="flex items-center p-2 hover:bg-accent rounded cursor-pointer"
                      onClick={() => toggleProjectExpanded(project.id)}
                    >
                      {project.expanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground mr-1" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground mr-1" />
                      )}
                      <Database className="h-4 w-4 text-primary mr-2" />
                      <span className="text-sm font-medium flex-1">{project.name}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Datasets */}
                    {project.expanded && (
                      <div className="ml-4">
                        {project.datasets.map((dataset) => (
                          <div key={dataset.id}>
                            {/* Dataset Node */}
                            <div 
                              className="flex items-center p-2 hover:bg-accent rounded cursor-pointer"
                              onClick={() => toggleDatasetExpanded(project.id, dataset.id)}
                            >
                              {dataset.expanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground mr-1" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground mr-1" />
                              )}
                              <FileText className="h-4 w-4 text-primary mr-2" />
                              <span className="text-sm text-muted-foreground flex-1">{dataset.name}</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Tables */}
                            {dataset.expanded && (
                              <div className="ml-4">
                                {dataset.tables.map((table) => (
                                  <div 
                                    key={table.id}
                                    className="flex items-center p-2 hover:bg-accent rounded cursor-pointer group"
                                  >
                                    {getTableIcon(table.type)}
                                    <span className="text-sm text-muted-foreground ml-2 flex-1">{table.name}</span>
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center">
                                      <Star className="h-3 w-3 text-muted-foreground mr-1" />
                                      <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            {/* Resize Handle */}
            <div
              className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-primary/30 transition-colors group"
              onMouseDown={handleMouseDown}
              style={{ 
                background: isResizing ? 'rgba(59, 130, 246, 0.5)' : 'transparent'
              }}
            >
              {/* Visual indicator */}
              <div className="absolute right-0 top-0 w-0.5 h-full bg-border group-hover:bg-primary/50 transition-colors" />
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Query Editor and Results Container */}
        <div className="flex-1 flex flex-col">
          {/* 3. Query Editor Tabs */}
          <div id="query-editor-tabs" className="bg-white">
            <div className="flex items-center">
              {/* Query Tabs */}
              <div className="flex-1 flex items-center overflow-x-auto">
                {queryTabs.map((tab, index) => (
                  <div
                    key={tab.id}
                    className={cn(
                      "flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 min-w-0 relative group",
                      "border-r border-gray-200",
                      tab.id === activeQueryTabId 
                        ? "bg-white" 
                        : "bg-gray-50"
                    )}
                    onClick={() => setActiveQueryTabId(tab.id)}
                  >
                    {/* Tab content */}
                    <div className="flex items-center min-w-0">
                      <span className="text-sm text-gray-700 truncate mr-1">
                        {tab.name}
                      </span>
                      {tab.isUnsaved && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-1 flex-shrink-0" />
                      )}
                    </div>
                    
                    {/* Close button */}
                    {queryTabs.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          closeQueryTab(tab.id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {/* Active tab indicator */}
                    {tab.id === activeQueryTabId && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                  </div>
                ))}
                
                {/* Add New Tab Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addNewQueryTab}
                  className="px-3 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  title="New query tab"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Query Controls Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">
                    {getCurrentQueryTab()?.name || "Untitled query"}
                  </span>
                  {getCurrentQueryTab()?.isUnsaved && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={runQuery}
                  disabled={isRunning}
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isRunning ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Run
                </Button>
                
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>

                <EditorSettingsDropdown
                  settings={editorSettings}
                  onSettingsChange={handleEditorSettingsChange}
                />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Settings2 className="h-4 w-4 mr-2" />
                      More
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuItem onClick={formatQuery}>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Format query
                    </DropdownMenuItem>
                    
                    <DropdownMenuCheckboxItem
                      checked={editorSettings.autoComplete}
                      onCheckedChange={(checked) => handleEditorSettingsChange({ autoComplete: checked })}
                    >
                      <div className="flex flex-col">
                        <span>SQL autocomplete</span>
                        <span className="text-xs text-muted-foreground">
                          Auto displaying code suggestions when you type
                        </span>
                      </div>
                    </DropdownMenuCheckboxItem>
                    
                    <DropdownMenuItem onClick={openQuerySettings}>
                      <Settings2 className="h-4 w-4 mr-2" />
                      Query settings
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuLabel>Choose query mode</DropdownMenuLabel>
                    
                    <DropdownMenuRadioGroup value={queryMode} onValueChange={setQueryMode}>
                      <DropdownMenuRadioItem value="standard">
                        <div className="flex flex-col">
                          <span>Standard query</span>
                          <span className="text-xs text-muted-foreground">
                            Standard mode for processing data
                          </span>
                        </div>
                      </DropdownMenuRadioItem>
                      
                      <DropdownMenuRadioItem value="batch">
                        <div className="flex flex-col">
                          <span>Batch processing</span>
                          <span className="text-xs text-muted-foreground">
                            Optimized for large data processing
                          </span>
                        </div>
                      </DropdownMenuRadioItem>
                      
                      <DropdownMenuRadioItem value="streaming">
                        <div className="flex flex-col">
                          <span>Streaming query</span>
                          <span className="text-xs text-muted-foreground">
                            Process incoming data continuously
                          </span>
                        </div>
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuCheckboxItem
                      checked={enableSqlTranslation}
                      onCheckedChange={setEnableSqlTranslation}
                    >
                      <div className="flex flex-col">
                        <span>Enable SQL translation</span>
                        <span className="text-xs text-muted-foreground">
                          Cross-engine SQL compatibility
                        </span>
                      </div>
                    </DropdownMenuCheckboxItem>
                    
                    <DropdownMenuItem 
                      onClick={openTranslationSettings}
                      disabled={!enableSqlTranslation}
                    >
                      <Languages className="h-4 w-4 mr-2" />
                      Translation settings
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={createStoredProcedure}>
                      <Zap className="h-4 w-4 mr-2" />
                      Create stored procedure
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* 4. Enhanced Query Editor using Monaco Editor */}
          <div id="query-editor" className="h-64 border-b border-gray-200">
            <div className="h-full flex flex-col">
              <div className="flex-1">
                <EnhancedSQLEditor
                  value={getCurrentQueryTab()?.query || ""}
                  onChange={(value) => {
                    const currentTab = getCurrentQueryTab()
                    if (currentTab) {
                      updateQueryTab(currentTab.id, { query: value || "" })
                      // Update legacy state for backward compatibility
                      setSqlQuery(value || "")
                    }
                  }}
                  engine={getCurrentEngine().engine}
                  connectionId={`${getCurrentEngine().engine}-${selectedProject}`}
                  height="100%"
                  settings={editorSettings}
                  onValidationChange={handleValidationChange}
                  onSchemaUpdate={handleSchemaUpdate}
                />
              </div>
              
              {/* Editor Status Bar */}
              <EditorStatusBar
                errors={validationErrors}
                lineCount={(getCurrentQueryTab()?.query || "").split('\n').length}
                characterCount={(getCurrentQueryTab()?.query || "").length}
                engine={getCurrentEngine().engineName || getCurrentEngine().name}
                connectionStatus={currentSchema ? 'connected' : 'disconnected'}
                schemaLastUpdated={currentSchema?.lastUpdated}
              />
            </div>
          </div>

          {/* 5. Query Results */}
          <div id="query-results" className="flex-1 flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b border-gray-200">
                <TabsList className="h-10 bg-transparent p-0 px-4">
                  <TabsTrigger value="job-info" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                    Query information
                  </TabsTrigger>
                  <TabsTrigger value="results" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                    Results
                  </TabsTrigger>
                  <TabsTrigger value="visualization" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                    Visualization
                  </TabsTrigger>
                  <TabsTrigger value="json" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                    JSON
                  </TabsTrigger>
                  <TabsTrigger value="execution" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                    Execution details
                  </TabsTrigger>
                  <TabsTrigger value="execution-graph" className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none">
                    Execution graph
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="job-info" className="flex-1 m-0 p-4">
                <div className="text-center text-gray-500">
                  Query information will appear here after running a query
                </div>
              </TabsContent>

              <TabsContent value="results" className="flex-1 m-0 p-0">
                <div className="h-full flex flex-col">
                  {queryResults.length > 0 ? (
                    <>
                      {/* Results Header */}
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Row</span>
                            <span className="text-sm text-gray-600">result</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              Save results
                            </Button>
                            <Button variant="ghost" size="sm">
                              Export to
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Results Table */}
                      <div className="flex-1 overflow-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                Row
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                result
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {queryResults.map((row, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {row.result}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                        1 - 1 of 1
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No results yet</h3>
                        <p className="text-gray-600 mb-4">Run a query to see results here</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="visualization" className="flex-1 m-0 p-4">
                <div className="text-center text-gray-500">
                  Visualization will appear here after running a query
                </div>
              </TabsContent>

              <TabsContent value="json" className="flex-1 m-0 p-4">
                <div className="text-center text-gray-500">
                  JSON results will appear here after running a query
                </div>
              </TabsContent>

              <TabsContent value="execution" className="flex-1 m-0 p-4">
                <div className="text-center text-gray-500">
                  Execution details will appear here after running a query
                </div>
              </TabsContent>

              <TabsContent value="execution-graph" className="flex-1 m-0 p-4">
                <div className="text-center text-gray-500">
                  Execution graph will appear here after running a query
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* 6. Query History */}
        <div id="query-history" className="h-48 border-t border-gray-200 bg-gray-50">
          <div className="h-full flex flex-col">
            <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Query history</h3>
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              {jobHistory.map((job) => (
                <div key={job.id} className="p-3 border-b border-gray-100 hover:bg-gray-100 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">{job.query}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{job.duration}</span>
                      <span>{job.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7. Right Sidebar */}
      <div 
        id="right-sidebar" 
        className={cn(
          "border-l bg-muted/30 flex transition-all duration-300 ease-in-out",
          isRightSidebarCollapsed ? "w-12 items-center" : "w-80 flex-col"
        )}
      >
        {isRightSidebarCollapsed ? (
          /* Collapsed state - show only expand button */
          <div className="flex flex-col items-center py-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsRightSidebarCollapsed(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent mb-2"
              title="Expand Query Details"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Query details</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsRightSidebarCollapsed(true)}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent"
                  title="Collapse Query Details"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Query information</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Status: {activeConnection ? 'Ready to run' : 'No connection'}</div>
                    <div>Connection: {activeConnection ? activeConnection.name : 'None selected'}</div>
                    {activeConnection && (
                      <>
                        <div>Engine: {ENGINE_DISPLAY_NAMES[activeConnection.engine]}</div>
                        <div>Host: {activeConnection.host}:{activeConnection.port}</div>
                        <div>Database: {activeConnection.database}</div>
                      </>
                    )}
                    <div>Processing location: {processingLocation}</div>
                    <div>Estimated cost: -</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Recent activity</h4>
                  <div className="text-sm text-muted-foreground">
                    No recent activity
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Connection Management Modals */}
      {showConnectionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ConnectionForm
              connection={editingConnection || undefined}
              onSubmit={editingConnection ? handleUpdateConnection : handleCreateConnection}
              onCancel={handleCancelConnectionForm}
              loading={connectionLoading}
            />
          </div>
        </div>
      )}

      {showConnectionList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Manage Database Connections</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowConnectionList(false)
                      setShowConnectionForm(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Connection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowConnectionList(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
              
              <ConnectionList
                onConnectionSelect={handleConnectionSelect}
                onEdit={handleEditConnection}
                onDelete={handleDeleteConnection}
                selectedConnectionId={activeConnection?.id}
                maxHeight="60vh"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
