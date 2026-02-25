import { useState, useEffect, useRef } from 'react'
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
  Zap,
  Github,
  Linkedin,
  Sparkles,
  ChevronRight,
  Users,
  BarChart3,
  Star,
  Brain,
  MousePointerClick,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { handleAppError } from '@/lib/errors'
import { motion, useInView, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { SEO } from '@/components/common/SEO'
import Lenis from 'lenis'

// ── Scroll-Triggered Section Reveal ──
const sectionRevealVariants = {
  hidden: { opacity: 0, y: 60, filter: 'blur(12px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
}

function SectionReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      variants={sectionRevealVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Cinematic Word-by-Word Text Reveal ──
function RevealText({ text, highlightWords = [], className = '' }: { text: string; highlightWords?: string[]; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const words = text.split(' ')

  return (
    <h1 ref={ref} className={className}>
      {words.map((word, idx) => {
        const isHighlight = highlightWords.includes(word)
        return (
          <span key={idx} className="inline-block overflow-hidden mr-[0.22em] align-top">
            <motion.span
              className={`inline-block ${isHighlight ? 'gradient-text-animated' : ''}`}
              initial={{ y: '120%', rotateX: 80 }}
              animate={isInView ? { y: 0, rotateX: 0 } : { y: '120%', rotateX: 80 }}
              transition={{
                delay: 0.15 + idx * 0.08,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
        )
      })}
    </h1>
  )
}

// ── Animated Number Counter ──
function AnimatedCounter({ target, suffix = '', duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const step = Math.ceil(target / (duration * 60))
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [isInView, target, duration])

  return <span ref={ref} className="stat-number">{count}{suffix}</span>
}

// ── Rotating Subtitle Words (Dynamic width) ──
function RotatingWords() {
  const words = ['Roadmaps', 'Skill Analysis', 'Project Ideas', 'Internship Tracking']
  const [currentIndex, setCurrentIndex] = useState(0)
  const [width, setWidth] = useState<number>(0)
  const measureRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % words.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Measure the width of the current word
  useEffect(() => {
    if (measureRef.current) {
      setWidth(measureRef.current.offsetWidth)
    }
  }, [currentIndex])

  return (
    <>
      {/* Hidden measurer */}
      <span
        ref={measureRef}
        className="gradient-text-animated font-bold whitespace-nowrap absolute opacity-0 pointer-events-none"
        aria-hidden="true"
        style={{ position: 'absolute', visibility: 'hidden' }}
      >
        {words[currentIndex]}
      </span>
      {/* Visible slot */}
      <span
        className="inline-block relative overflow-hidden align-bottom"
        style={{ width: width > 0 ? width : 'auto', height: '1.2em', transition: 'width 0.3s ease' }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={words[currentIndex]}
            className="absolute left-0 top-0 gradient-text-animated font-bold whitespace-nowrap"
            initial={{ y: 28, opacity: 0, filter: 'blur(4px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -28, opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  )
}

// ── Interactive Magnetic Button ──
function MagneticButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 20 })
  const springY = useSpring(y, { stiffness: 200, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((e.clientX - centerX) * 0.2)
    y.set((e.clientY - centerY) * 0.2)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      <Button
        onClick={onClick}
        size="lg"
        className="h-14 px-10 text-lg rounded-full shadow-lg glow-primary-hover animate-pulse-ring relative overflow-hidden group"
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%]"
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ opacity: 0.15 }}
        />
      </Button>
    </motion.div>
  )
}

// ── How-it-works Step ──
function StepItem({ step, title, desc, icon: Icon, index }: { step: number; title: string; desc: string; icon: any; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center text-center relative"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 relative"
        whileHover={{ scale: 1.1, rotate: 5, borderColor: 'rgba(0,191,165,0.5)' }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Icon className="w-7 h-7 text-primary" />
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
          {step}
        </span>
      </motion.div>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed">{desc}</p>
    </motion.div>
  )
}

export function LandingPage() {
  const { loginWithEmail, loginWithGoogle, loginWithGithub, loginWithLinkedin } = useAuth()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  // ── Parallax mouse tracking for hero ──
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 30 })
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 30 })
  const parallaxX = useTransform(smoothX, [-500, 500], [-15, 15])
  const parallaxY = useTransform(smoothY, [-500, 500], [-15, 15])

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  // ── Lenis Smooth Scroll ──
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

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
      handleAppError({ error, context: 'auth.email', errorCode: 'AUTH_SEND_LINK' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error('Google login error:', error)
      handleAppError({ error, context: 'auth.google', errorCode: 'AUTH_PROVIDER' })
      setIsLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    setIsLoading(true)
    try {
      await loginWithGithub()
    } catch (error) {
      console.error('GitHub login error:', error)
      handleAppError({ error, context: 'auth.github', errorCode: 'AUTH_PROVIDER' })
      setIsLoading(false)
    }
  }

  const handleLinkedinLogin = async () => {
    setIsLoading(true)
    try {
      await loginWithLinkedin()
    } catch (error) {
      console.error('LinkedIn login error:', error)
      handleAppError({ error, context: 'auth.linkedin', errorCode: 'AUTH_PROVIDER' })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <SEO
        title="Home"
        description="Careerly helps students navigate their career path with confidence through personalized roadmaps, skill gap analysis, and internship tracking."
        url="https://careerly-pi.vercel.app/"
      />

      {/* ── Navigation ── */}
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
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setIsLoginOpen(true)} variant="ghost" className="font-medium">
                Sign In
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setIsLoginOpen(true)} size="sm" className="rounded-full px-5 shadow-md hidden sm:flex">
                Get Started <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Section ── */}
      <section
        ref={heroRef}
        className="relative py-24 lg:py-36 overflow-hidden"
        onMouseMove={handleHeroMouseMove}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">

            {/* Animated Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(0,191,165,0.4)' }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-semibold text-primary tracking-wide uppercase">AI-Powered Career Platform</span>
              <Sparkles className="w-3 h-3 text-primary" />
            </motion.div>

            {/* Hero Headline */}
            <RevealText
              text="Your Career Starts Here — Own Every Step."
              highlightWords={['Here', 'Every']}
              className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] mb-6"
            />

            {/* Rotating subtitle */}
            <motion.p
              className="text-xl sm:text-2xl text-muted-foreground mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.9, duration: 2.78, ease: [0.22, 1, 0.36, 1] }}
            >
              AI-powered <RotatingWords /> for college students<br className="hidden sm:block" />
              who refuse to leave their future to chance.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 1.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <MagneticButton onClick={() => setIsLoginOpen(true)}>
                Start Free — No Credit Card <ArrowRight className="w-5 h-5" />
              </MagneticButton>

              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-14 px-8 text-lg rounded-full border border-border/50 gap-2 group"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  See How It Works
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Social proof micro-line */}
            <motion.div
              className="flex items-center justify-center gap-4 mt-8 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              <div className="flex -space-x-2">
                {['🎓', '💻', '🚀', '🎯'].map((emoji, i) => (
                  <motion.div
                    key={i}
                    className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs"
                    initial={{ scale: 0, x: -10 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: 1.8 + i * 0.1, type: 'spring', stiffness: 300 }}
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
              <span>Join students already navigating smarter</span>
            </motion.div>
          </div>
        </div>

        {/* Floating Icons — parallax-linked */}
        <motion.div
          style={{ x: parallaxX, y: parallaxY }}
          className="absolute inset-0 pointer-events-none"
        >
          <FloatingIcons />
        </motion.div>

        {/* Animated Background Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-10">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl"
            animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl"
            animate={{ x: [0, -100, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent rounded-full blur-3xl"
            animate={{ x: [-50, 50, -50], y: [-50, 50, -50], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <SectionReveal>
        <section className="border-y bg-secondary/20">
          {(() => {
            const stats = [
              { value: 50, suffix: '+', label: 'Early Users', icon: Users },
              { value: 4, suffix: '', label: 'AI-Powered Tools', icon: Brain },
              { value: 95, suffix: '%', label: 'Accuracy Rate', icon: BarChart3 },
              { value: 4.9, suffix: '★', label: 'User Rating', icon: Star },
            ]

            return (
              <div
                className="max-w-5xl mx-auto px-4 py-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
              >
                <div className="flex w-max gap-10 pr-10 animate-marquee">
                  {[...stats, ...stats].map((stat, i) => (
                    <motion.div
                      key={`${stat.label}-${i}`}
                      className="flex flex-col items-center gap-2 group cursor-default text-center min-w-[9.5rem]"
                      whileHover={{ scale: 1.05, y: -3 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <stat.icon className="w-5 h-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                      <span className="text-3xl lg:text-4xl font-bold text-foreground">
                        <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                      </span>
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })()}
        </section>
      </SectionReveal>

      {/* ── How It Works ── */}
      <section className="py-24 relative overflow-hidden">
        <SectionReveal>
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <motion.span
                className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Simple & Effective
              </motion.span>
              <h2 className="text-4xl font-serif font-bold mb-4">Three Steps to Career Clarity</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                From confusion to confidence in minutes, not months.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connector lines (desktop only) */}
              <div className="hidden md:block absolute top-8 left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-0.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />

              <StepItem step={1} title="Build Your Profile" desc="Tell us your degree, skills & dream career in under 2 minutes." icon={GraduationCap} index={0} />
              <StepItem step={2} title="Get AI Insights" desc="Receive a personalized roadmap, skill gaps, and project ideas." icon={Brain} index={1} />
              <StepItem step={3} title="Track & Execute" desc="Manage applications, build projects, and watch your progress." icon={Rocket} index={2} />
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* ── Features Grid (Bento-style) ── */}
      <section id="features" className="relative py-24 bg-secondary/30 overflow-hidden">
        <SectionReveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <motion.span
                className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-3"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Everything You Need
              </motion.span>
              <h2 className="text-4xl font-serif font-bold mb-4">Powerful Features, Zero Complexity</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Built specifically for students who want to take control of their career journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<Compass className="w-8 h-8 text-primary" />}
                title="Career Roadmaps"
                description="AI-generated step-by-step guides tailored to your specific career goals and degree."
                index={0}
                emoji="🗺️"
              />
              <FeatureCard
                icon={<Target className="w-8 h-8 text-primary" />}
                title="Skill Gap Analysis"
                description="Identify exactly what skills you're missing for your dream job and how to bridge them."
                index={1}
                emoji="🎯"
              />
              <FeatureCard
                icon={<Rocket className="w-8 h-8 text-primary" />}
                title="Project Ideas"
                description="Receive personalized project recommendations to build a portfolio that stands out."
                index={2}
                emoji="🚀"
              />
              <FeatureCard
                icon={<ClipboardCheck className="w-8 h-8 text-primary" />}
                title="Internship Tracker"
                description="Manage all your internship applications in one intuitive, organized dashboard."
                index={3}
                emoji="📋"
              />
            </div>
          </div>
        </SectionReveal>

        <FloatingIcons />
      </section>

      {/* ── Final CTA ── */}
      <section className="py-28 relative overflow-hidden">
        <SectionReveal>
          <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <MousePointerClick className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Ready to Start?</span>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-4">
              Your Dream Career Won't<br />
              <span className="gradient-text-animated">Build Itself.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
              Join students who stopped guessing and started growing.
              It's free, and takes less than 2 minutes.
            </p>
            <MagneticButton onClick={() => setIsLoginOpen(true)} className="mx-auto inline-block">
              Get Started — It's Free <Sparkles className="w-5 h-5" />
            </MagneticButton>
          </div>
        </SectionReveal>

        {/* Background glow */}
        <div className="absolute inset-0 -z-10 opacity-10">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary rounded-full blur-[120px]"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </section>

      {/* ── Email Login Dialog ── */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Sign In</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a magic link to sign in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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

            <div className="flex gap-4">
              <Button onClick={handleGithubLogin} disabled={isLoading} variant="outline" className="w-full rounded-xl h-11 flex items-center justify-center gap-2">
                <Github className="w-5 h-5" /> GitHub
              </Button>
              <Button onClick={handleLinkedinLogin} disabled={isLoading} variant="outline" className="w-full rounded-xl h-11 flex items-center justify-center gap-2">
                <Linkedin className="w-5 h-5 text-[#0077b5]" /> LinkedIn
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

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

      {/* ── Footer ── */}
      <footer className="py-12 border-t">
        <SectionReveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Compass className="text-primary w-6 h-6" />
              <span className="text-lg font-serif font-bold">Careerly</span>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2">
              <p className="text-sm text-muted-foreground">
                Developed by <span className="font-medium text-foreground">Yash Divate</span>
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="https://linkedin.com/in/yash-divate"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-secondary/40 transition-colors"
                >
                  <Linkedin className="w-4 h-4 text-[#0077b5]" />
                  LinkedIn
                </a>
                <a
                  href="https://github.com/yashsejuro"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-secondary/40 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </div>
              <p className="text-xs text-muted-foreground">© 2026 Careerly. Built for the next generation of professionals.</p>
            </div>
          </div>
        </SectionReveal>
      </footer>
    </div>
  )
}

// Default export for lazy loading
export default LandingPage

// ── Feature Card with Interactive Hover ──
function FeatureCard({ icon, title, description, index = 0, emoji }: { icon: React.ReactNode; title: string; description: string; index?: number; emoji?: string }) {
  return (
    <motion.div
      className="glass-card p-8 rounded-3xl border border-primary/10 shadow-sm group cursor-pointer relative overflow-hidden"
      initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -8,
        boxShadow: "0 20px 40px rgba(0, 191, 165, 0.2)",
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
    >
      {/* Background emoji on hover */}
      {emoji && (
        <motion.span
          className="absolute -right-4 -bottom-4 text-[80px] opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 select-none pointer-events-none"
          aria-hidden
        >
          {emoji}
        </motion.span>
      )}

      <motion.div
        className="mb-6"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>

      {/* Micro interaction: reveal arrow on hover */}
      <motion.div
        className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Learn more <ArrowRight className="w-3.5 h-3.5" />
      </motion.div>
    </motion.div>
  )
}

// ── Floating Background Icons ──
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
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: [0, 0.35, 0.3, 0],
            scale: [0.6, 1.15, 1.05, 0.6],
            y: [0, -15, -35, -60],
            x: [0, Math.sin(index) * 12, Math.cos(index) * 12, 0],
            rotate: [0, 120],
          }}
          transition={{
            duration: duration * 0.6,
            delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon className="w-14 h-14 text-primary" strokeWidth={1.2} />
        </motion.div>
      ))}
    </div>
  )
}
