import { Routes, Route, useNavigate } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { Spinner } from './components/ui/spinner'
import { useAuth } from './lib/auth'
import { supabase } from './lib/supabaseClient'
import { ErrorBoundary } from 'react-error-boundary'
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import { Button } from './components/ui/button'

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(module => ({ default: module.OnboardingPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage').then(module => ({ default: module.AuthCallbackPage })))
const CareerRoadmapBlog = lazy(() => import('./pages/CareerRoadmapBlog'))

function ErrorBoundaryPage({ error, resetErrorBoundary }: { error: any; resetErrorBoundary: () => void }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight text-destructive">Something went wrong</h1>
        <p className="text-muted-foreground text-sm">An unexpected error occurred. Please try again.</p>
        {import.meta.env.DEV && error?.message && (
          <div className="p-4 bg-muted/50 rounded-lg text-left overflow-auto max-h-40 text-xs font-mono">
            {String(error.message)}
          </div>
        )}
        <div className="pt-4">
          <Button onClick={resetErrorBoundary} variant="outline" className="gap-2">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="text-6xl font-bold">404</div>
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground text-sm">Sorry, we couldn’t find the page you’re looking for.</p>
        <div className="pt-4">
          <Button onClick={() => navigate('/')} className="gap-2">
            Return Home
          </Button>
        </div>
      </div>
    </div>
  )
}

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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <SpeedInsights />
      <Analytics />
    </ErrorBoundary>
  )
}
