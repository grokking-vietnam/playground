/**
 * Protected Route Component
 * 
 * Wrapper component that requires authentication and optional permissions
 */

import React, { type ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'
import { LoginForm } from './LoginForm'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Shield } from 'lucide-react'
import type { Permission, UserRole } from '../../types/auth'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermissions?: Permission[]
  requiredRoles?: UserRole[]
  fallbackComponent?: ReactNode
  showLoginForm?: boolean
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallbackComponent,
  showLoginForm = true
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { hasAllPermissions, hasAnyRole } = usePermissions()

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>
    }

    if (showLoginForm) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <LoginForm 
            title="Authentication Required"
            description="Please sign in to access this resource"
          />
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground">
                You must be signed in to access this resource.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground mb-4">
                You don't have the required role to access this resource.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>Required roles: {requiredRoles.join(', ')}</p>
                <p>Your role: {user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check permission requirements
  if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Insufficient Permissions</h3>
              <p className="text-muted-foreground mb-4">
                You don't have the required permissions to access this resource.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>Required permissions:</p>
                <ul className="list-disc list-inside text-left max-w-xs mx-auto">
                  {requiredPermissions.map(permission => (
                    <li key={permission}>{permission}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render children if all checks pass
  return <>{children}</>
}