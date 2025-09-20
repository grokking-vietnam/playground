/**
 * Authentication Status Component
 * 
 * Displays current user authentication status and provides quick actions
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Settings, 
  LogOut, 
  Shield,
  Clock,
  AlertCircle 
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'

interface AuthStatusProps {
  showUserInfo?: boolean
  showRoleBadge?: boolean
  variant?: 'full' | 'compact' | 'minimal'
  onProfileClick?: () => void
  onSettingsClick?: () => void
  className?: string
}

export function AuthStatus({
  showUserInfo = true,
  showRoleBadge = true,
  variant = 'full',
  onProfileClick,
  onSettingsClick,
  className = ''
}: AuthStatusProps) {
  const { user, isAuthenticated, logout, error } = useAuth()
  const { isAdmin, isEditor, isAnalyst, isViewer } = usePermissions()

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {error && (
          <div title={error}>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
        <span className="text-sm text-muted-foreground">Not signed in</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  const getRoleBadgeColor = () => {
    if (isAdmin) return 'bg-red-100 text-red-700 border-red-200'
    if (isEditor) return 'bg-blue-100 text-blue-700 border-blue-200'
    if (isAnalyst) return 'bg-green-100 text-green-700 border-green-200'
    if (isViewer) return 'bg-gray-100 text-gray-700 border-gray-200'
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const getRoleIcon = () => {
    if (isAdmin) return <Shield className="h-3 w-3" />
    return null
  }

  const getUserInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`
    }
    return user.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || user.email[0].toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (variant === 'minimal') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Avatar className="h-6 w-6">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
        </Avatar>
        {showRoleBadge && (
          <Badge variant="outline" className={`text-xs ${getRoleBadgeColor()}`}>
            {getRoleIcon()}
            <span className={getRoleIcon() ? 'ml-1' : ''}>{user.role}</span>
          </Badge>
        )}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`h-auto p-2 justify-start ${className}`}>
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            {showUserInfo && (
              <div className="flex flex-col items-start min-w-0">
                <p className="text-sm font-medium truncate max-w-[120px]">{user.name}</p>
                {showRoleBadge && (
                  <Badge variant="outline" className={`text-xs ${getRoleBadgeColor()}`}>
                    {getRoleIcon()}
                    <span className={getRoleIcon() ? 'ml-1' : ''}>{user.role}</span>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">{user.name}</p>
              {showRoleBadge && (
                <Badge variant="outline" className={`text-xs ${getRoleBadgeColor()}`}>
                  {getRoleIcon()}
                  <span className={getRoleIcon() ? 'ml-1' : ''}>{user.role}</span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {user.lastLoginAt && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                Last active: {new Date(user.lastLoginAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onProfileClick}>
          <User className="h-4 w-4 mr-2" />
          Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onSettingsClick}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}