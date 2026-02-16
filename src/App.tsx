import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { Spinner } from './components/ui/spinner'
import { useAuth } from './lib/auth'
import { supabase } from './lib/supabaseClient'
import { ErrorBoundary } from 'react-error-boundary'
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(module => ({ default: module.OnboardingPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage').then(module => ({ default: module.AuthCallbackPage })))
const NotFoundPage = lazy(() => import('./pages/ErrorPages')) // Default export
const ErrorBoundaryPage = lazy(() => import('./pages/ErrorPages').then(module => ({ default: module.ErrorBoundaryPage })))
const CareerRoadmapBlog = lazy(() => import('./pages/CareerRoadmapBlog'))

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
      <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-background">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      }>
        <Routes>
          <Route path="/blog/career-roadmap-for-college-students" element={<CareerRoadmapBlog />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/" element={<MainApp />} />
          {/* Redirect any unknown routes (like the broken LinkedIn link) to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <SpeedInsights />
      <Analytics />
    </ErrorBoundary>
  )
}
