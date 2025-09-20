/**
 * User Profile Component
 * 
 * Displays and manages user profile information and preferences
 */

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Save, User as UserIcon, Settings, Bell, Palette } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUserPreferences } from '../../hooks/useUserPreferences'
import { userService } from '../../services/UserService'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface UserProfileProps {
  className?: string
  onClose?: () => void
}

export function UserProfile({ className = '', onClose }: UserProfileProps) {
  const { user } = useAuth()
  const { 
    preferences, 
    updatePreferences,
    updateEditorPreferences,
    updateDashboardPreferences,
    updateNotificationPreferences,
    isLoading: preferencesLoading
  } = useUserPreferences()
  
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || ''
    }
  })

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setIsUpdating(true)
      setUpdateError(null)
      
      await userService.updateUserProfile(data)
      
      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 3000)
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePreferenceUpdate = async (updates: any) => {
    try {
      setUpdateError(null)
      await updatePreferences(updates)
      setUpdateSuccess(true)
      setTimeout(() => setUpdateSuccess(false), 2000)
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to update preferences')
    }
  }

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`
    }
    return user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || user?.email[0].toUpperCase()
  }

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'admin': return 'bg-red-100 text-red-700'
      case 'editor': return 'bg-blue-100 text-blue-700'
      case 'analyst': return 'bg-green-100 text-green-700'
      case 'viewer': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No user information available</p>
      </div>
    )
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <Badge className={`mt-1 ${getRoleBadgeColor()}`}>
              {user.role}
            </Badge>
          </div>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {updateError && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {updateError}
          </p>
        </div>
      )}

      {updateSuccess && (
        <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200">
          <p className="text-sm text-green-700">
            Settings updated successfully!
          </p>
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email address cannot be changed
                  </p>
                </div>
                <Button type="submit" disabled={!isDirty || isUpdating}>
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Editor Preferences Tab */}
        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <CardTitle>Editor Preferences</CardTitle>
              <CardDescription>
                Customize your SQL editor experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {preferences?.editor && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <Select 
                        value={preferences.editor.fontSize.toString()} 
                        onValueChange={(value) => updateEditorPreferences({ fontSize: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12px</SelectItem>
                          <SelectItem value="14">14px</SelectItem>
                          <SelectItem value="16">16px</SelectItem>
                          <SelectItem value="18">18px</SelectItem>
                          <SelectItem value="20">20px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tab Size</Label>
                      <Select 
                        value={preferences.editor.tabSize.toString()} 
                        onValueChange={(value) => updateEditorPreferences({ tabSize: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 spaces</SelectItem>
                          <SelectItem value="4">4 spaces</SelectItem>
                          <SelectItem value="8">8 spaces</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="wordWrap">Word Wrap</Label>
                      <Switch
                        id="wordWrap"
                        checked={preferences.editor.wordWrap}
                        onCheckedChange={(checked) => updateEditorPreferences({ wordWrap: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="lineNumbers">Line Numbers</Label>
                      <Switch
                        id="lineNumbers"
                        checked={preferences.editor.lineNumbers}
                        onCheckedChange={(checked) => updateEditorPreferences({ lineNumbers: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoComplete">Auto Complete</Label>
                      <Switch
                        id="autoComplete"
                        checked={preferences.editor.autoComplete}
                        onCheckedChange={(checked) => updateEditorPreferences({ autoComplete: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="minimap">Minimap</Label>
                      <Switch
                        id="minimap"
                        checked={preferences.editor.minimap}
                        onCheckedChange={(checked) => updateEditorPreferences({ minimap: checked })}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {preferences && (
                <>
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select 
                      value={preferences.theme} 
                      onValueChange={(value: 'light' | 'dark' | 'system') => handlePreferenceUpdate({ theme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select 
                      value={preferences.language} 
                      onValueChange={(value) => handlePreferenceUpdate({ language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Time Format</Label>
                    <Select 
                      value={preferences.timeFormat} 
                      onValueChange={(value: '12h' | '24h') => handlePreferenceUpdate({ timeFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12 Hour</SelectItem>
                        <SelectItem value="24h">24 Hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {preferences?.notifications && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="queryCompletion">Query Completion</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when queries finish running
                      </p>
                    </div>
                    <Switch
                      id="queryCompletion"
                      checked={preferences.notifications.queryCompletion}
                      onCheckedChange={(checked) => updateNotificationPreferences({ queryCompletion: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="errorAlerts">Error Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when queries fail or errors occur
                      </p>
                    </div>
                    <Switch
                      id="errorAlerts"
                      checked={preferences.notifications.errorAlerts}
                      onCheckedChange={(checked) => updateNotificationPreferences({ errorAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="systemMaintenance">System Maintenance</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about scheduled maintenance and updates
                      </p>
                    </div>
                    <Switch
                      id="systemMaintenance"
                      checked={preferences.notifications.systemMaintenance}
                      onCheckedChange={(checked) => updateNotificationPreferences({ systemMaintenance: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={preferences.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateNotificationPreferences({ emailNotifications: checked })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}