import { LandingPage } from './pages/LandingPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardPage } from './pages/DashboardPage'
import { useState, useEffect } from 'react'
import { Spinner } from './components/ui/spinner'
import { useAuth } from './lib/auth'
import { supabase } from './lib/supabaseClient'

export default function App() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [checkingProfile, setCheckingProfile] = useState(true)

  useEffect(() => {
    async function checkProfile() {
      if (isAuthenticated && user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)
          
          if (error) throw error
          setHasProfile((data?.length ?? 0) > 0)
        } catch (error) {
          console.error('Error checking profile:', error)
          setHasProfile(false)
        } finally {
          setCheckingProfile(false)
        }
      } else {
        setCheckingProfile(false)
      }
    }
    checkProfile()
  }, [isAuthenticated, user])

  if (isLoading || checkingProfile) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LandingPage />
  }

  if (hasProfile === false) {
    return <OnboardingPage onComplete={() => setHasProfile(true)} />
  }

  return <DashboardPage />
}
