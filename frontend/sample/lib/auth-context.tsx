"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  image?: string
}

interface AuthContextType {
  session: { user: User } | null
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
  session?: { user: User } | null
}

export function AuthProvider({ children, session: initialSession }: AuthProviderProps) {
  const [session, setSession] = useState<{ user: User } | null>(initialSession || null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock authentication functions
  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser: User = {
      id: "1",
      name: "John Doe",
      email: email,
      image: undefined,
    }

    setSession({ user: mockUser })
    setIsLoading(false)
  }

  const signOut = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    setSession(null)
    setIsLoading(false)
  }

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem("auth-session")
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession))
      } catch (error) {
        console.error("Failed to parse saved session:", error)
      }
    }
  }, [])

  // Save session to localStorage when it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem("auth-session", JSON.stringify(session))
    } else {
      localStorage.removeItem("auth-session")
    }
  }, [session])

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        signIn,
        signOut,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
