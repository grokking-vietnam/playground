/**
 * Connection Form Component
 * 
 * A comprehensive form for creating and editing database connections.
 * Supports multiple database engines with validation and testing.
 */

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Database,
  TestTube,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

import {
  DatabaseConnection,
  ConnectionFormData,
  DatabaseEngine,
  ENGINE_DISPLAY_NAMES,
  DEFAULT_PORTS,
  CONNECTION_STRING_TEMPLATES
} from '../../types/connections'
import { validateConnectionForm } from '../../utils/connectionValidators'
import { useConnections } from '../../hooks/useConnections'

/**
 * Form validation schema using Zod
 */
const connectionFormSchema = z.object({
  name: z.string().min(1, 'Connection name is required').max(100, 'Name too long'),
  engine: z.nativeEnum(DatabaseEngine, { required_error: 'Please select a database engine' }),
  host: z.string().min(1, 'Host is required').max(255, 'Host too long'),
  port: z.coerce.number().min(1, 'Port must be at least 1').max(65535, 'Port must be at most 65535'),
  database: z.string().min(1, 'Database name is required').max(100, 'Database name too long'),
  username: z.string().min(1, 'Username is required').max(100, 'Username too long'),
  password: z.string().min(1, 'Password is required').max(500, 'Password too long'),
  ssl: z.boolean().default(true),
  connectionString: z.string().optional()
})

type ConnectionFormSchema = z.infer<typeof connectionFormSchema>

/**
 * Props for ConnectionForm component
 */
interface ConnectionFormProps {
  /** Existing connection to edit (optional) */
  connection?: DatabaseConnection
  /** Callback when form is submitted successfully */
  onSubmit: (data: ConnectionFormData) => Promise<void>
  /** Callback when form is cancelled */
  onCancel: () => void
  /** Whether the form is in loading state */
  loading?: boolean
  /** Form title override */
  title?: string
}

/**
 * Connection Form Component
 */
export function ConnectionForm({
  connection,
  onSubmit,
  onCancel,
  loading = false,
  title
}: ConnectionFormProps) {
  const { testConnection, connections } = useConnections()
  const [showPassword, setShowPassword] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Initialize form with default values or existing connection data
  const form = useForm<ConnectionFormSchema>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      name: connection?.name || '',
      engine: connection?.engine || DatabaseEngine.POSTGRESQL,
      host: connection?.host || 'localhost',
      port: connection?.port || DEFAULT_PORTS[DatabaseEngine.POSTGRESQL],
      database: connection?.database || '',
      username: connection?.username || '',
      password: '', // Always start with empty password for security
      ssl: connection?.ssl ?? true,
      connectionString: connection?.connectionString || ''
    }
  })

  const watchedEngine = form.watch('engine')
  const watchedConnectionString = form.watch('connectionString')

  /**
   * Update default port when engine changes
   */
  useEffect(() => {
    if (watchedEngine && !connection) {
      const defaultPort = DEFAULT_PORTS[watchedEngine]
      form.setValue('port', defaultPort)
      
      // Update host for specific engines
      if (watchedEngine === DatabaseEngine.BIGQUERY) {
        form.setValue('host', '')
      } else if (watchedEngine === DatabaseEngine.SNOWFLAKE) {
        form.setValue('host', 'account.region.snowflakecomputing.com')
      } else {
        form.setValue('host', 'localhost')
      }
    }
  }, [watchedEngine, form, connection])

  /**
   * Handle form submission
   */
  const handleSubmit = async (data: ConnectionFormSchema) => {
    try {
      // Additional validation
      const validationResult = validateConnectionForm(data)
      if (!validationResult.isValid) {
        // Set form errors
        Object.entries(validationResult.errors).forEach(([field, message]) => {
          form.setError(field as keyof ConnectionFormSchema, { message })
        })
        return
      }

      // Check for duplicate names
      const existingNames = connections
        .filter(conn => conn.id !== connection?.id)
        .map(conn => conn.name)
      
      if (existingNames.some(name => name.toLowerCase() === data.name.toLowerCase())) {
        form.setError('name', { message: 'A connection with this name already exists' })
        return
      }

      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
      // Handle error (could set a general form error here)
    }
  }

  /**
   * Test the current connection configuration
   */
  const handleTestConnection = async () => {
    const formData = form.getValues()
    
    // Validate form first
    const isValid = await form.trigger()
    if (!isValid) {
      setTestResult({
        success: false,
        message: 'Please fix form errors before testing'
      })
      return
    }

    setIsTestingConnection(true)
    setTestResult(null)

    try {
      // Create a temporary connection object for testing
      const tempConnection: DatabaseConnection = {
        id: 'temp',
        name: formData.name,
        engine: formData.engine,
        host: formData.host,
        port: formData.port,
        database: formData.database,
        username: formData.username,
        password: formData.password,
        ssl: formData.ssl,
        connectionString: formData.connectionString,
        createdAt: new Date(),
        lastUsed: new Date()
      }

      const result = await testConnection(tempConnection)
      setTestResult({
        success: result.success,
        message: result.success 
          ? `Connection successful! ${result.details?.version || ''}` 
          : result.error || 'Connection failed'
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  /**
   * Get connection string template for current engine
   */
  const getConnectionStringTemplate = () => {
    return CONNECTION_STRING_TEMPLATES[watchedEngine] || ''
  }

  const formTitle = title || (connection ? 'Edit Connection' : 'New Connection')

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {formTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Connection Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Database Connection" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name to identify this connection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Database Engine */}
            <FormField
              control={form.control}
              name="engine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Engine</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a database engine" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ENGINE_DISPLAY_NAMES).map(([key, name]) => (
                        <SelectItem key={key} value={key}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Connection String (Optional) */}
            <FormField
              control={form.control}
              name="connectionString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection String (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={getConnectionStringTemplate()}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    If provided, this will override individual connection parameters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Individual Connection Parameters (shown when no connection string) */}
            {!watchedConnectionString && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Host */}
                  <FormField
                    control={form.control}
                    name="host"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Host</FormLabel>
                        <FormControl>
                          <Input placeholder="localhost" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Port */}
                  <FormField
                    control={form.control}
                    name="port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder={DEFAULT_PORTS[watchedEngine].toString()}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Database */}
                <FormField
                  control={form.control}
                  name="database"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database</FormLabel>
                      <FormControl>
                        <Input placeholder="my_database" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Username */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? 'text' : 'password'}
                              placeholder="password"
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* SSL */}
                <FormField
                  control={form.control}
                  name="ssl"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">SSL Connection</FormLabel>
                        <FormDescription>
                          Use SSL/TLS encryption for secure connections
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Test Connection Result */}
            {testResult && (
              <div className={`flex items-center gap-2 p-3 rounded-md ${
                testResult.success 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{testResult.message}</span>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTestingConnection || loading}
              >
                {isTestingConnection ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {connection ? 'Update' : 'Create'} Connection
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
