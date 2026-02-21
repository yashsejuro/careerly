
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { Map, Target, Rocket, ChevronRight, Sparkles, Trophy, TrendingUp, AlertCircle, ArrowUpRight, Code, Briefcase, Zap, Lightbulb, GraduationCap } from 'lucide-react'

// ... (other components unchanged)

const FLOATING_ICONS = [
  // Top Left Cluster
  { icon: Code, color: 'text-blue-500', bg: 'bg-blue-500/10', delay: 0, top: '-15%', left: '5%', size: 'w-8 h-8' },
  { icon: Sparkles, color: 'text-yellow-400', bg: 'bg-yellow-400/10', delay: 1.5, top: '10%', left: '-8%', size: 'w-6 h-6' },

  // Top Right Cluster
  { icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10', delay: 0.5, top: '-20%', right: '10%', size: 'w-7 h-7' },

  // Bottom Right Cluster
  { icon: Rocket, color: 'text-emerald-500', bg: 'bg-emerald-500/10', delay: 2, bottom: '20%', right: '-8%', size: 'w-8 h-8' },
  { icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10', delay: 2.5, bottom: '-10%', right: '5%', size: 'w-6 h-6' },

  // Bottom Left Cluster
  { icon: Target, color: 'text-red-500', bg: 'bg-red-500/10', delay: 1, bottom: '10%', left: '-10%', size: 'w-7 h-7' },
  { icon: GraduationCap, color: 'text-cyan-500', bg: 'bg-cyan-500/10', delay: 3, bottom: '-15%', left: '15%', size: 'w-6 h-6' },
]

function FloatingMicroIcons() {

  return (
    <>
      {FLOATING_ICONS.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute z-20 flex items-center justify-center rounded-2xl ${item.bg} backdrop-blur-sm shadow-sm border border-white/10`}
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
            width: 'fit-content',
            height: 'fit-content',
            padding: '8px'
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4 + i, // Varied duration
            repeat: Infinity,
            delay: item.delay,
            ease: "easeInOut"
          }}
        >
          <item.icon className={`${item.size} ${item.color}`} strokeWidth={1.5} />
        </motion.div>
      ))}
    </>
  )
}
import { useDashboard } from './DashboardContext'
import { careerlyApi } from '@/lib/api'
import { ProfileOverviewResponse } from '@/types/roadmap'
import { getCachedOverview, setCachedOverview } from './overviewCache'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

export function Overview({ setActiveView }: { setActiveView: (view: any) => void }) {
  const { user } = useAuth()
  const { profile, internshipCount } = useDashboard()
  const [overview, setOverview] = useState<ProfileOverviewResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchOverview() {
      if (!user || !profile) return

      const cached = getCachedOverview(user.id)
      if (cached) {
        setOverview(cached)
        return
      }

      setLoading(true)
      try {
        const prompt = `Student Profile:

Degree: ${profile.degree}
Year: ${profile.year}
Skills: ${profile.skills}
Interests: ${profile.interests}

Return JSON:

{
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "recommended_focus": ""
}`
        const { object } = await careerlyApi.ai.generateObject<ProfileOverviewResponse>({
          prompt,
          schema: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              strengths: { type: 'array', items: { type: 'string' } },
              weaknesses: { type: 'array', items: { type: 'string' } },
              recommended_focus: { type: 'string' }
            },
            required: ['summary', 'strengths', 'weaknesses', 'recommended_focus']
          }
        })
        setOverview(object)
        setCachedOverview(user.id, object)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchOverview()
  }, [user, profile])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
  } as any

  return (
    <motion.div
      className="space-y-10"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Welcome Section */}
      <motion.div variants={item}>
        <WelcomeSection user={user} profile={profile} internshipCount={internshipCount} />
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Map className="w-5 h-5 text-blue-500" />}
          title="Roadmap Status"
          value="Phase 2"
          subValue="of 8 Completed"
          description="Next: Build Project"
          onClick={() => setActiveView('roadmap')}
          color="bg-blue-500/10"
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-purple-500" />}
          title="Skill Targets"
          value="4 Pending"
          subValue="High Priority"
          description="Focus: Backend Dev"
          onClick={() => setActiveView('skills')}
          color="bg-purple-500/10"
        />
        <StatCard
          icon={<Rocket className="w-5 h-5 text-emerald-500" />}
          title="Applications"
          value={internshipCount.toString()}
          subValue="Active"
          description="View Pipeline"
          onClick={() => setActiveView('tracker')}
          color="bg-emerald-500/10"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Summary */}
        <motion.div variants={item} className="lg:col-span-7 h-full">
          <Card className="rounded-2xl border-border/40 shadow-sm bg-card/50 backdrop-blur-sm h-full hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-semibold tracking-tight">Professional Profile</CardTitle>
                  <CardDescription className="text-sm mt-1">Snapshot of your current standing.</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <ArrowUpRight className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <ProfileItem label="Degree Program" value={profile?.degree} />
                <ProfileItem label="Academic Year" value={profile?.year} />
                <ProfileItem label="Target Career" value={profile?.goal_career} highlight />
                <ProfileItem label="Current Level" value="Intermediate Student" />
              </div>

              <div className="pt-6 border-t border-border/40">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Skill Stack</Label>
                  <span className="text-[10px] text-muted-foreground hover:text-primary cursor-pointer">Edit Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile?.skills.split(',').map((skill: string, i: number) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="px-3 py-1 bg-secondary/50 hover:bg-secondary text-secondary-foreground border border-border/30 rounded-md text-[11px] font-medium transition-colors cursor-none"
                    >
                      {skill.trim()}
                    </Badge>
                  )) || <span className="text-sm text-muted-foreground italic">No skills listed</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Suggestions Box */}
        <motion.div variants={item} className="lg:col-span-5 h-full relative group">
          {/* Infinite Color Loop Border (Google Gradient) */}
          <div
            className="absolute -inset-[1px] rounded-2xl animate-gradient-flow blur-[6px] opacity-40 transition-all duration-500"
            style={{
              backgroundImage: "linear-gradient(270deg, #EA4335, #FBBC05, #34A853, #4285F4, #EA4335)"
            }}
          />

          {/* Floating Micro Icons */}
          <FloatingMicroIcons />

          <Card className="relative rounded-2xl border-0 shadow-xl bg-card/90 backdrop-blur-xl h-full flex flex-col overflow-hidden z-10">
            {/* Decorative top sheen */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-lg shadow-lg shadow-primary/25">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold tracking-tight">AI Insights</CardTitle>
                  <CardDescription className="text-xs">Live career optimization</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col space-y-6">
              {loading ? (
                <div className="space-y-4 animate-pulse py-4">
                  <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                  <div className="h-4 bg-muted/50 rounded w-full"></div>
                  <div className="h-16 bg-muted/30 rounded-xl w-full"></div>
                </div>
              ) : overview ? (
                <>
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                      "{overview.summary}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 p-1 bg-green-500/10 rounded-full">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top Strength</h4>
                        <p className="text-sm font-semibold">{overview.strengths[0]}</p>
                      </div>
                    </div>
                    <div className="w-full h-px bg-border/40" />
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 p-1 bg-orange-500/10 rounded-full">
                        <AlertCircle className="w-3 h-3 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Focus Area</h4>
                        <p className="text-sm font-semibold">{overview.recommended_focus}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                  <p className="text-sm">Complete your profile to unlock AI insights.</p>
                </div>
              )}

              <div className="mt-auto pt-4">
                <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border-0 shadow-none justify-between group/btn" variant="outline" onClick={() => setActiveView('roadmap')}>
                  Explore Roadmap <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

function StatCard({ icon, title, value, subValue, description, onClick, color }: any) {
  return (
    <Card
      className="rounded-2xl border-border/40 hover:border-border/80 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-pointer group bg-card/60 backdrop-blur-sm"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-xl ${color} transition-colors`}>
            {icon}
          </div>
          <Badge variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/50">View</Badge>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
            <span className="text-sm text-muted-foreground font-medium">{subValue}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/40 flex items-center text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
            {description} <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileItem({ label, value, highlight }: { label: string, value?: string, highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">{label}</p>
      <p className={`text-base font-semibold truncate ${highlight ? 'text-primary' : 'text-foreground/90'}`}>
        {value || 'Not set'}
      </p>
    </div>
  )
}


function WelcomeSection({ user, profile, internshipCount = 0 }: any) {
  const calculateStrength = () => {
    let score = 10 // Base score for signing up

    // Profile Basics (30%)
    if (profile?.degree && profile?.goal_career) score += 30

    // Linked Accounts (40%)
    const identities = user?.identities || []
    if (identities.find((i: any) => i.provider === 'github')) score += 20
    if (identities.find((i: any) => i.provider === 'linkedin_oidc')) score += 20

    // Skills (10%)
    if (profile?.skills?.length > 0) score += 10

    // Activity (10%)
    if (internshipCount > 0) score += 10

    return Math.min(score, 100)
  }

  const strength = calculateStrength()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row justify-between items-end gap-6 pt-2"
    >
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Welcome back, {user?.displayName?.split(' ')[0] || 'Navigator'}
        </h1>
        <p className="text-lg text-muted-foreground font-light">
          Here's what's happening with your career trajectory today.
        </p>
      </div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-3 px-5 py-2.5 bg-background shadow-sm border border-border/60 rounded-full cursor-default backdrop-blur-sm"
      >
        <div className="relative">
          <Trophy className={`w-5 h-5 ${strength === 100 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
          {strength === 100 && <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-20" />}
        </div>
        <span className="text-sm font-medium tracking-wide">
          Profile Strength <span className={`font-bold ${strength === 100 ? 'text-green-600' : 'text-foreground'}`}>{strength}%</span>
        </span>
      </motion.div>
    </motion.div>
  )
}



function Label({ className, children }: any) {
  return <label className={className}>{children}</label>
}
