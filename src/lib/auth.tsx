import React, { createContext, useContext, useEffect, useState } from 'react'

type AuthUser = {
  id: string
  displayName: string
  email?: string
  imageUrl?: string
}

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'careerly-auth-user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = () => {
    // Simple, local demo login. Replace with real auth later.
    const demoUser: AuthUser = {
      id: 'demo-student',
      displayName: 'Demo Student',
      email: 'student@example.com',
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser))
    setUser(demoUser)
  }

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

