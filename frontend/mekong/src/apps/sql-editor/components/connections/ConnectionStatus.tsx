/**
 * Connection Status Component
 * 
 * A compact component that displays the current connection status
 * with real-time updates and quick actions.
 */

import React from 'react'
import {
  Database,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Settings,
  AlertCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

import {
  DatabaseConnection,
  ConnectionStatus as ConnectionStatusEnum,
  ENGINE_DISPLAY_NAMES
} from '../../types/connections'
import { useConnections } from '../../hooks/useConnections'

/**
 * Props for ConnectionStatus component
 */
interface ConnectionStatusProps {
  /** The connection to display status for */
  connection: DatabaseConnection | null
  /** Callback when manage connections is clicked */
  onManageConnections?: () => void
  /** Callback when connection settings is clicked */
  onConnectionSettings?: (connection: DatabaseConnection) => void
  /** Whether to show detailed information */
  showDetails?: boolean
  /** Custom className */
  className?: string
}

/**
 * Connection Status Component
 */
export function ConnectionStatus({
  connection,
  onManageConnections,
  onConnectionSettings,
  showDetails = false,
  className = ''
}: ConnectionStatusProps) {
  const { testConnection, testing, refreshAllConnections } = useConnections()

  /**
   * Get status icon and color
   */
  const getStatusInfo = (status?: ConnectionStatusEnum) => {
    switch (status) {
      case ConnectionStatusEnum.CONNECTED:
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Connected',
          variant: 'default' as const
        }
      case ConnectionStatusEnum.CONNECTING:
        return {
          icon: Loader2,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Connecting',
          variant: 'secondary' as const,
          animate: true
        }
      case ConnectionStatusEnum.ERROR:
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Connection Error',
          variant: 'destructive' as const
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Not Connected',
          variant: 'secondary' as const
        }
    }
  }

  /**
   * Handle test connection
   */
  const handleTestConnection = async () => {
    if (!connection) return
    
    try {
      await testConnection(connection)
    } catch (error) {
      console.error('Failed to test connection:', error)
    }
  }

  /**
   * Handle refresh all connections
   */
  const handleRefreshAll = async () => {
    try {
      await refreshAllConnections()
    } catch (error) {
      console.error('Failed to refresh connections:', error)
    }
  }

  if (!connection) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Database className="h-4 w-4" />
          <span className="text-sm">No connection selected</span>
        </div>
        {onManageConnections && (
          <Button
            variant="outline"
            size="sm"
            onClick={onManageConnections}
          >
            <Settings className="h-4 w-4 mr-1" />
            Manage
          </Button>
        )}
      </div>
    )
  }

  const statusInfo = getStatusInfo(connection.status)
  const StatusIcon = statusInfo.icon
  const isTestingConnection = testing[connection.id]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status Indicator */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
        <StatusIcon 
          className={`h-4 w-4 ${statusInfo.color} ${statusInfo.animate ? 'animate-spin' : ''}`} 
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            {connection.status === ConnectionStatusEnum.ERROR && (
              <AlertCircle className="h-3 w-3 text-red-500" />
            )}
          </div>
          {showDetails && (
            <div className="text-xs text-muted-foreground">
              {ENGINE_DISPLAY_NAMES[connection.engine]} • {connection.name}
            </div>
          )}
        </div>
      </div>

      {/* Connection Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleTestConnection}
            disabled={isTestingConnection}
          >
            {isTestingConnection ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleRefreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {onConnectionSettings && (
            <DropdownMenuItem
              onClick={() => onConnectionSettings(connection)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Connection Settings
            </DropdownMenuItem>
          )}

          {onManageConnections && (
            <DropdownMenuItem onClick={onManageConnections}>
              <Database className="h-4 w-4 mr-2" />
              Manage Connections
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Connection Details (when expanded) */}
      {showDetails && connection.status === ConnectionStatusEnum.CONNECTED && (
        <div className="text-xs text-muted-foreground">
          <div>Host: {connection.host}:{connection.port}</div>
          <div>Database: {connection.database}</div>
          {connection.metadata?.responseTime && (
            <div>Response: {connection.metadata.responseTime}ms</div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Compact Connection Status Badge
 */
interface ConnectionStatusBadgeProps {
  connection: DatabaseConnection | null
  onClick?: () => void
}

export function ConnectionStatusBadge({ connection, onClick }: ConnectionStatusBadgeProps) {
  if (!connection) {
    return (
      <Badge 
        variant="secondary" 
        className="cursor-pointer"
        onClick={onClick}
      >
        <Database className="h-3 w-3 mr-1" />
        No Connection
      </Badge>
    )
  }

  const statusInfo = getStatusInfo(connection.status)
  const StatusIcon = statusInfo.icon

  return (
    <Badge 
      variant={statusInfo.variant}
      className="cursor-pointer"
      onClick={onClick}
    >
      <StatusIcon 
        className={`h-3 w-3 mr-1 ${statusInfo.animate ? 'animate-spin' : ''}`} 
      />
      {connection.name}
    </Badge>
  )
}

/**
 * Helper function to get status info (exported for reuse)
 */
function getStatusInfo(status?: ConnectionStatusEnum) {
  switch (status) {
    case ConnectionStatusEnum.CONNECTED:
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Connected',
        variant: 'default' as const
      }
    case ConnectionStatusEnum.CONNECTING:
      return {
        icon: Loader2,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Connecting',
        variant: 'secondary' as const,
        animate: true
      }
    case ConnectionStatusEnum.ERROR:
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Connection Error',
        variant: 'destructive' as const
      }
    default:
      return {
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        label: 'Not Connected',
        variant: 'secondary' as const
      }
  }
}
