import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'

interface DashboardContextType {
  profile: any
  internshipCount: number
  refreshData: () => Promise<void>
  isLoading: boolean
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [internshipCount, setInternshipCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchData = useCallback(async (force = false) => {
    if (!user) return
    if (!force && isLoaded) return

    setIsLoading(true)
    try {
        const [pResult, iResult] = await Promise.all([
            supabase.from('profiles').select('*').eq('user_id', user.id).limit(1),
            supabase
            .from('internships')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id),
        ])

        const profileRows = pResult.data ?? []
        if (profileRows.length > 0) setProfile(profileRows[0])
        setInternshipCount(iResult.count ?? 0)
        setIsLoaded(true)
    } finally {
        setIsLoading(false)
    }
  }, [user, isLoaded])

  useEffect(() => {
    if (user && !isLoaded) {
        fetchData()
    }
  }, [user, isLoaded, fetchData])

  const refreshData = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  const value = useMemo(() => ({
    profile,
    internshipCount,
    refreshData,
    isLoading
  }), [profile, internshipCount, refreshData, isLoading])

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
    const context = useContext(DashboardContext)
    if (!context) throw new Error("useDashboard must be used within DashboardProvider")
    return context
}
