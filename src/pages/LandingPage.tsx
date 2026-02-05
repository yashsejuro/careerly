import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth'
import { ArrowRight, Compass, Target, Rocket, ClipboardCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export function LandingPage() {
  const { loginWithEmail } = useAuth()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    setIsLoading(true)
    try {
      await loginWithEmail(email)
      toast.success('Check your email for the login link!')
      setIsLoginOpen(false)
      setEmail('')
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Failed to send login email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Navigation */}
      <nav className="border-b bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Compass className="text-primary-foreground w-6 h-6" />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight">Career Navigator</span>
          </div>
          <Button onClick={() => setIsLoginOpen(true)} variant="ghost" className="font-medium">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-tight mb-6">
              Navigate Your Career Path with <span className="text-primary">Confidence</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Discover personalized roadmaps, analyze skill gaps, and track internships. 
              Empowering college students to reach their full professional potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => setIsLoginOpen(true)} size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:scale-105 transition-transform">
                Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold mb-4">Core MVP Features</h2>
            <p className="text-muted-foreground text-lg">Everything you need to jumpstart your career journey.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Compass className="w-8 h-8 text-primary" />}
              title="Career Roadmaps"
              description="AI-generated step-by-step guides tailored to your specific career goals and degree."
            />
            <FeatureCard 
              icon={<Target className="w-8 h-8 text-primary" />}
              title="Skill Gap Analysis"
              description="Identify exactly what skills you're missing for your dream job and how to bridge them."
            />
            <FeatureCard 
              icon={<Rocket className="w-8 h-8 text-primary" />}
              title="Project Ideas"
              description="Receive personalized project recommendations to build a portfolio that stands out."
            />
            <FeatureCard 
              icon={<ClipboardCheck className="w-8 h-8 text-primary" />}
              title="Internship Tracker"
              description="Manage all your internship applications in one intuitive, organized dashboard."
            />
          </div>
        </div>
      </section>

      {/* Email Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Sign In</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a magic link to sign in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleLogin} disabled={isLoading} className="w-full rounded-xl">
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Compass className="text-primary w-6 h-6" />
            <span className="text-lg font-serif font-bold">Career Navigator</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Career Navigator. Built for the next generation of professionals.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-background p-8 rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
