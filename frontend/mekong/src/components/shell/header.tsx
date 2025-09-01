import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { FloatingNavigation } from "./floating-navigation"
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut,
} from "lucide-react"

interface HeaderProps {
  onNavigate: (appId: string) => void
  currentApp: string
}

export function Header({ onNavigate, currentApp }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center space-x-2">
          {/* Floating Navigation Button - Left of Mekong */}
          <FloatingNavigation onNavigate={onNavigate} currentApp={currentApp} />
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="font-bold text-lg">Mekong</div>
            <div className="hidden md:block text-sm text-muted-foreground">
              Composable Data Workspace
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-sm">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>

          {user ? (
            <div className="flex items-center space-x-2">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.role}</div>
              </div>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                <User className="h-4 w-4" />
                <span className="sr-only">User menu</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}