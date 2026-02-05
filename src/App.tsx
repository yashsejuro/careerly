import { useBlinkAuth } from '@blinkdotnew/react'
import { LandingPage } from './pages/LandingPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { DashboardPage } from './pages/DashboardPage'
import { useState, useEffect } from 'react'
import { blink } from './lib/blink'
import { Spinner } from './components/ui/spinner'

export default function App() {
  const { isAuthenticated, isLoading, user } = useBlinkAuth()
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [checkingProfile, setCheckingProfile] = useState(true)

  useEffect(() => {
    async function checkProfile() {
      if (isAuthenticated && user) {
        try {
          const profile = await blink.db.profiles.exists({
            where: { userId: user.id }
          })
          setHasProfile(profile)
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
