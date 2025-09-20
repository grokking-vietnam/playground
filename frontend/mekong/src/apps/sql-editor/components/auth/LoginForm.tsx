/**
 * Login Form Component
 * 
 * Provides user authentication interface with email/password login
 */

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters long')
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSuccess?: () => void
  onForgotPassword?: () => void
  className?: string
  showLogo?: boolean
  title?: string
  description?: string
}

export function LoginForm({ 
  onSuccess,
  onForgotPassword,
  className = '',
  showLogo = true,
  title = 'Welcome back',
  description = 'Sign in to your SQL Editor account'
}: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError()
      await login(data)
      reset()
      onSuccess?.()
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="space-y-1">
        {showLogo && (
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <LogIn className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        )}
        <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
        <CardDescription className="text-center">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register('password')}
                className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Sign in
              </>
            )}
          </Button>

          {/* Forgot Password Link */}
          {onForgotPassword && (
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={onForgotPassword}
                className="text-muted-foreground hover:text-foreground"
              >
                Forgot your password?
              </Button>
            </div>
          )}
        </form>

        {/* Demo Accounts */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center mb-3">
            Demo accounts (any password with 6+ characters):
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-muted rounded text-center">
              <div className="font-medium">Admin</div>
              <div className="text-muted-foreground">admin@example.com</div>
            </div>
            <div className="p-2 bg-muted rounded text-center">
              <div className="font-medium">Editor</div>
              <div className="text-muted-foreground">editor@example.com</div>
            </div>
            <div className="p-2 bg-muted rounded text-center">
              <div className="font-medium">Analyst</div>
              <div className="text-muted-foreground">analyst@example.com</div>
            </div>
            <div className="p-2 bg-muted rounded text-center">
              <div className="font-medium">Viewer</div>
              <div className="text-muted-foreground">viewer@example.com</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}