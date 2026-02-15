
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { JDAnalyzer } from '@/features/tools/JDAnalyzer'
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
import { Overview } from '@/features/dashboard/Overview'
import { RoadmapView } from '@/features/roadmap/RoadmapView'
import { SkillsView } from '@/features/roadmap/SkillsView'
import { ProjectsView } from '@/features/roadmap/ProjectsView'
import { TrackerView } from '@/features/tracker/TrackerView'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DashboardProvider } from '@/features/dashboard/DashboardContext'
import { motion } from 'framer-motion'

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
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-sidebar">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Compass className="text-primary-foreground w-5 h-5" />
              </div>
              <span className="text-lg font-serif font-bold">Careerly</span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? 'secondary' : 'ghost'}
                  className={`w-full justify-start gap-3 rounded-xl h-11 ${activeView === item.id ? 'bg-primary/10 text-primary font-medium hover:bg-primary/20' : 'text-muted-foreground'}`}
                  onClick={() => setActiveView(item.id as View)}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              )
            })}
          </nav>

          <div className="p-4 border-t space-y-4">
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="w-9 h-9 border-2 border-primary/10">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-primary/5 text-primary">
                  {user?.displayName?.charAt(0) || <UserIcon className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.displayName || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r flex flex-col p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Compass className="text-primary w-6 h-6" />
                  <span className="text-lg font-serif font-bold">Careerly</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Button
                      key={item.id}
                      variant={activeView === item.id ? 'secondary' : 'ghost'}
                      className={`w-full justify-start gap-3 rounded-xl h-11 ${activeView === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 border-b flex items-center justify-between px-6 bg-background/50 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="w-6 h-6" />
              </Button>
              <h2 className="text-lg font-serif font-bold capitalize">
                {navItems.find(i => i.id === activeView)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1.5 bg-secondary rounded-full text-secondary-foreground">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                AI System Ready
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 bg-background/50">
            <div className="max-w-6xl mx-auto animate-fade-in">
              {renderContent()}
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
