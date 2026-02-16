
import { useState, lazy, Suspense } from 'react'
import { useAuth } from '@/lib/auth'
import {
  Compass,
  LayoutDashboard,
  Map,
  Target,
  Rocket,
  ClipboardCheck,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Sparkles,
  ScanSearch
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DashboardProvider } from '@/features/dashboard/DashboardContext'
import { motion } from 'framer-motion'
import { Spinner } from '@/components/ui/spinner'

// Lazy load feature views
const Overview = lazy(() => import('@/features/dashboard/Overview').then(module => ({ default: module.Overview })))
const RoadmapView = lazy(() => import('@/features/roadmap/RoadmapView').then(module => ({ default: module.RoadmapView })))
const SkillsView = lazy(() => import('@/features/roadmap/SkillsView').then(module => ({ default: module.SkillsView })))
const ProjectsView = lazy(() => import('@/features/roadmap/ProjectsView').then(module => ({ default: module.ProjectsView })))
const TrackerView = lazy(() => import('@/features/tracker/TrackerView').then(module => ({ default: module.TrackerView })))
const JDAnalyzer = lazy(() => import('@/features/tools/JDAnalyzer').then(module => ({ default: module.JDAnalyzer })))

type View = 'overview' | 'roadmap' | 'skills' | 'projects' | 'tracker' | 'jd-scanner'

export function DashboardPage() {
  const { user, logout } = useAuth()
  const [activeView, setActiveView] = useState<View>('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roadmap', label: 'Career Roadmap', icon: Map },
    { id: 'skills', label: 'Skill Gap', icon: Target },
    { id: 'projects', label: 'Projects', icon: Rocket },
    { id: 'tracker', label: 'Internships', icon: ClipboardCheck },
    { id: 'jd-scanner', label: 'JD Scanner', icon: ScanSearch },
  ]

  const renderContent = () => {
    switch (activeView) {
      case 'overview': return <Overview setActiveView={setActiveView} />
      case 'roadmap': return <RoadmapView />
      case 'skills': return <SkillsView />
      case 'projects': return <ProjectsView />
      case 'tracker': return <TrackerView />
      case 'jd-scanner': return <JDAnalyzer />
      default: return <Overview setActiveView={setActiveView} />
    }
  }

  return (
    <DashboardProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Premium Ambient Background */}
        <div className="fixed inset-0 z-[-1] bg-background">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border/40 bg-card/30 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center">
                <Compass className="text-primary-foreground w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">Careerly</span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start gap-3 rounded-lg h-10 transition-all duration-200 ${isActive
                    ? 'bg-primary/10 text-primary font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                    }`}
                  onClick={() => setActiveView(item.id as View)}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground/70'}`} />
                  {item.label}
                </Button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-border/40 space-y-4">
            <div className="flex items-center gap-3 px-2 py-2 p-2 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
              <Avatar className="w-8 h-8 border ring-2 ring-background">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user?.displayName?.charAt(0) || <UserIcon className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate leading-none">{user?.displayName || 'User'}</p>
                <p className="text-sm text-muted-foreground truncate mt-1">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg h-9"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay (Unchanged logic, just style tweaks if needed - kept mostly same for safety) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-background border-r flex flex-col p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
              {/* Mobile sidebar content matching refined style */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Compass className="text-primary w-6 h-6" />
                  <span className="text-lg font-bold tracking-tight">Careerly</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeView === item.id
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`w-full justify-start gap-3 rounded-lg h-10 ${isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground'
                        }`}
                      onClick={() => {
                        setActiveView(item.id as View)
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  )
                })}
              </nav>
              <Button variant="ghost" className="w-full justify-start gap-3 text-destructive mt-auto" onClick={logout}>
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <header className="h-14 border-b border-border/40 flex items-center justify-between px-8 bg-background/60 backdrop-blur-xl sticky top-0 z-40 transition-all">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden -ml-2" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-semibold tracking-tight text-foreground/90 capitalize">
                {navItems.find(i => i.id === activeView)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-medium px-2.5 py-1 bg-primary/10 rounded-full text-primary border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow shadow-primary/50 animate-pulse" />
                Live System
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Suspense fallback={
                <div className="h-full w-full flex items-center justify-center p-20">
                  <Spinner className="w-8 h-8 text-primary" />
                </div>
              }>
                {renderContent()}
              </Suspense>
            </div>
          </main>
        </div>

        {/* Floating AI Assistant Button */}
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Button
              size="lg"
              className="h-16 w-16 rounded-full shadow-2xl glow-primary hover:scale-110 transition-transform"
              onClick={() => alert('AI Assistant coming soon! 🤖')}
            >
              <Sparkles className="w-6 h-6" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </DashboardProvider>
  )
}
