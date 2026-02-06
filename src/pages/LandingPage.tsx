import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth'
import {
  ArrowRight,
  Compass,
  Target,
  Rocket,
  ClipboardCheck,
  Briefcase,
  GraduationCap,
  Code,
  Lightbulb,
  TrendingUp,
  Award,
  BookOpen,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export function LandingPage() {
  const { loginWithEmail, loginWithGoogle } = useAuth()
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

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await loginWithGoogle()
      // User will be redirected to Google, no need for success toast
    } catch (error) {
      console.error('Google login error:', error)
      toast.error('Failed to sign in with Google')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Navigation */}
      <motion.nav
        className="border-b bg-background/50 backdrop-blur-md sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Compass className="text-primary-foreground w-6 h-6" />
            </motion.div>
            <span className="text-xl font-serif font-bold tracking-tight">Careerly</span>
          </div>
          <Button onClick={() => setIsLoginOpen(true)} variant="ghost" className="font-medium">
            Sign In
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              className="text-5xl lg:text-7xl font-serif font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Navigate Your Career Path with{' '}
              <motion.span
                className="gradient-text-animated"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Confidence
              </motion.span>
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Discover personalized roadmaps, analyze skill gaps, and track internships.
              Empowering college students to reach their full professional potential.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setIsLoginOpen(true)}
                  size="lg"
                  className="h-14 px-8 text-lg rounded-full shadow-lg glow-primary-hover"
                >
                  Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Floating Icons */}
        <FloatingIcons />

        {/* Animated Background Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-10">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent rounded-full blur-3xl"
            animate={{
              x: [-50, 50, -50],
              y: [-50, 50, -50],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 bg-secondary/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-serif font-bold mb-4">Core MVP Features</h2>
            <p className="text-muted-foreground text-lg">Everything you need to jumpstart your career journey.</p>
          </motion.div>

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

        {/* Floating Icons for Features Section */}
        <FloatingIcons />
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
            {/* Google Sign-In Button */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full rounded-xl h-11 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email Input */}
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
            © 2026 Careerly. Built for the next generation of professionals.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      className="glass-card p-8 rounded-3xl border border-primary/10 shadow-sm group cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      whileHover={{
        y: -8,
        boxShadow: "0 20px 40px rgba(0, 191, 165, 0.2)",
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
    >
      <motion.div
        className="mb-6"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  )
}

function FloatingIcons() {
  const icons = [
    { Icon: Briefcase, delay: 0, duration: 20, x: '10%', y: '20%' },
    { Icon: GraduationCap, delay: 2, duration: 25, x: '80%', y: '15%' },
    { Icon: Code, delay: 4, duration: 22, x: '15%', y: '70%' },
    { Icon: Lightbulb, delay: 1, duration: 24, x: '85%', y: '65%' },
    { Icon: TrendingUp, delay: 3, duration: 23, x: '50%', y: '10%' },
    { Icon: Award, delay: 5, duration: 21, x: '25%', y: '45%' },
    { Icon: BookOpen, delay: 2.5, duration: 26, x: '70%', y: '40%' },
    { Icon: Zap, delay: 4.5, duration: 19, x: '40%', y: '80%' },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, delay, duration, x, y }, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.15, 0.15, 0],
            scale: [0, 1, 1, 0],
            y: [0, -30, -60, -90],
            x: [0, Math.sin(index) * 20, Math.cos(index) * 20, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon className="w-12 h-12 text-primary" strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  )
}
