/**
 * Connection List Component
 * 
 * Displays a list of database connections with status indicators,
 * actions for editing/deleting, and connection testing.
 */

import React, { useState } from 'react'
import {
  Database,
  Edit,
  Trash2,
  TestTube,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  Copy
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

import {
  DatabaseConnection,
  ConnectionStatus,
  ENGINE_DISPLAY_NAMES
} from '../../types/connections'
import { useConnections } from '../../hooks/useConnections'

/**
 * Props for ConnectionList component
 */
interface ConnectionListProps {
  /** Callback when a connection is selected */
  onConnectionSelect?: (connection: DatabaseConnection) => void
  /** Callback when edit is requested */
  onEdit?: (connection: DatabaseConnection) => void
  /** Callback when delete is requested */
  onDelete?: (connection: DatabaseConnection) => void
  /** Currently selected connection ID */
  selectedConnectionId?: string
  /** Whether to show actions */
  showActions?: boolean
  /** Maximum height for the list */
  maxHeight?: string
}

/**
 * Connection List Component
 */
export function ConnectionList({
  onConnectionSelect,
  onEdit,
  onDelete,
  selectedConnectionId,
  showActions = true,
  maxHeight = '400px'
}: ConnectionListProps) {
  const { 
    connections, 
    loading, 
    error, 
    testConnectionById, 
    testing,
    refreshConnections 
  } = useConnections()
  
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(new Set())

  /**
   * Toggle connection details expansion
   */
  const toggleExpanded = (connectionId: string) => {
    setExpandedConnections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(connectionId)) {
        newSet.delete(connectionId)
      } else {
        newSet.add(connectionId)
      }
      return newSet
    })
  }

  /**
   * Get status badge for connection
   */
  const getStatusBadge = (status?: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case ConnectionStatus.CONNECTING:
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Connecting
          </Badge>
        )
      case ConnectionStatus.ERROR:
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Not Connected
          </Badge>
        )
    }
  }

  /**
   * Handle connection test
   */
  const handleTestConnection = async (connection: DatabaseConnection, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await testConnectionById(connection.id)
    } catch (error) {
      console.error('Failed to test connection:', error)
    }
  }

  /**
   * Handle connection selection
   */
  const handleConnectionClick = (connection: DatabaseConnection) => {
    if (onConnectionSelect) {
      onConnectionSelect(connection)
    }
  }

  /**
   * Copy connection details to clipboard
   */
  const handleCopyDetails = async (connection: DatabaseConnection, e: React.MouseEvent) => {
    e.stopPropagation()
    const details = {
      name: connection.name,
      engine: connection.engine,
      host: connection.host,
      port: connection.port,
      database: connection.database,
      username: connection.username,
      ssl: connection.ssl
    }
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(details, null, 2))
      // You might want to show a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading connections...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Failed to load connections</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={refreshConnections}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Database className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No connections found
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Create your first database connection to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connections ({connections.length})
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshConnections}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          className="space-y-1 overflow-y-auto"
          style={{ maxHeight }}
        >
          {connections.map((connection) => (
            <div
              key={connection.id}
              className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                selectedConnectionId === connection.id ? 'bg-muted' : ''
              }`}
              onClick={() => handleConnectionClick(connection)}
            >
              {/* Connection Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Database className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{connection.name}</h3>
                      {getStatusBadge(connection.status)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {ENGINE_DISPLAY_NAMES[connection.engine]} • {connection.host}:{connection.port}/{connection.database}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Test Connection Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleTestConnection(connection, e)}
                    disabled={testing[connection.id]}
                    title="Test connection"
                  >
                    {testing[connection.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Actions Menu */}
                  {showActions && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpanded(connection.id)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {expandedConnections.has(connection.id) ? 'Hide' : 'Show'} Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleCopyDetails(connection, e)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onEdit(connection)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(connection)
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedConnections.has(connection.id) && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Engine:</span>
                      <p>{ENGINE_DISPLAY_NAMES[connection.engine]}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Username:</span>
                      <p>{connection.username}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">SSL:</span>
                      <p>{connection.ssl ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Last Used:</span>
                      <p>{new Date(connection.lastUsed).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {connection.connectionString && (
                    <div>
                      <span className="font-medium text-muted-foreground">Connection String:</span>
                      <p className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
                        {connection.connectionString.replace(/password=[^&;]*/, 'password=***')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
