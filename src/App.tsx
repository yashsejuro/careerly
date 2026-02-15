import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardPage } from './pages/DashboardPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import NotFoundPage, { ErrorBoundaryPage } from './pages/ErrorPages'
import { useState, useEffect } from 'react'
import { Spinner } from './components/ui/spinner'
import { useAuth } from './lib/auth'
import { supabase } from './lib/supabaseClient'
import { ErrorBoundary } from 'react-error-boundary'
import { SpeedInsights } from "@vercel/speed-insights/react"

function MainApp() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [checkingProfile, setCheckingProfile] = useState(true)

  useEffect(() => {
    async function checkProfile() {
      // If not authenticated, we don't need to check profile
      if (!isAuthenticated || !user) {
        setCheckingProfile(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        if (error) {
          console.error('Error checking profile:', error)
          // In case of error (e.g. network), we might want to retry or show error
          // For now, assume no profile or let the error boundary handle catastrophic failures if we threw
          setHasProfile(false)
        } else {
          setHasProfile((data?.length ?? 0) > 0)
        }
      } catch (error) {
        console.error('Unexpected error checking profile:', error)
        setHasProfile(false)
      } finally {
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

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryPage} onReset={() => window.location.reload()}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/" element={<MainApp />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <SpeedInsights />
    </ErrorBoundary>
  )
}
