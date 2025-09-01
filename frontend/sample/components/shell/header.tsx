"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Search, Menu, Bell, Grid3X3, HelpCircle, Settings, LogOut } from "lucide-react"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="border-b border-gray-200 bg-white relative z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="p-2" onClick={onMenuClick}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Google Cloud</span>
            </div>
            <Badge variant="outline" className="text-xs">
              MoMo Dev
            </Badge>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search (/) for resources, docs, products, and more"
              className="pl-10 bg-gray-50 border-gray-200"
            />
            <Button size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7">
              Search
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-2">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Settings className="h-4 w-4" />
          </Button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="p-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => (window.location.href = "/auth/signin")}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
