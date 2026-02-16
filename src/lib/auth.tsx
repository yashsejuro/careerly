import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

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
  loginWithEmail: (email: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGithub: () => Promise<void>
  linkGithub: () => Promise<void>
  loginWithLinkedin: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial session
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUser({
          id: data.user.id,
          displayName: data.user.user_metadata.full_name || data.user.email || 'Student',
          email: data.user.email ?? undefined,
          imageUrl: data.user.user_metadata.avatar_url,
        })
      }
      setIsLoading(false)
    }
    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null)
      } else {
        const u = session.user
        setUser({
          id: u.id,
          displayName: u.user_metadata.full_name || u.email || 'Student',
          email: u.email ?? undefined,
          imageUrl: u.user_metadata.avatar_url,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loginWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        // improved options for better delivery if possible
      }
    })
    if (error) throw error
  }

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) {
      throw error
    }
  }

  const loginWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'read:user repo', // Request access to user profile and repositories
      },
    })
    if (error) throw error
  }

  const linkGithub = async () => {
    const { error } = await supabase.auth.linkIdentity({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'read:user repo',
      },
    })
    if (error) throw error
  }

  const loginWithLinkedin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'openid profile email',
      },
    })
    if (error) throw error
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithEmail,
        loginWithGoogle,
        loginWithGithub,
        linkGithub,
        loginWithLinkedin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}