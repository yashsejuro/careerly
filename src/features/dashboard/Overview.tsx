
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { Map, Target, Rocket, ChevronRight, Sparkles, Trophy, TrendingUp, AlertCircle } from 'lucide-react'
import { useDashboard } from './DashboardContext'
import { careerlyApi } from '@/lib/api'
import { ProfileOverviewResponse } from '@/types/roadmap'

export function Overview({ setActiveView }: { setActiveView: (view: any) => void }) {
  const { user } = useAuth()
  const { profile, internshipCount } = useDashboard()
  const [overview, setOverview] = useState<ProfileOverviewResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchOverview() {
      if (!user || !profile) return

      const cacheKey = `careerly_overview_${user.id}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        setOverview(JSON.parse(cached))
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
        localStorage.setItem(cacheKey, JSON.stringify(object))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchOverview()
  }, [user, profile])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Welcome back, {user?.displayName?.split(' ')[0] || 'Navigator'}!</h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your career progress.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-2xl">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Profile {profile ? '100%' : '20%'} Complete</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Map className="w-5 h-5 text-primary" />}
          title="Roadmap Progress"
          value="Step 2 of 8"
          description="Build your first project"
          onClick={() => setActiveView('roadmap')}
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-primary" />}
          title="Skills to Learn"
          value="4 Skills"
          description="Focusing on Backend"
          onClick={() => setActiveView('skills')}
        />
        <StatCard
          icon={<Rocket className="w-5 h-5 text-primary" />}
          title="Internships"
          value={internshipCount.toString()}
          description="Total applications"
          onClick={() => setActiveView('tracker')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Summary */}
        <Card className="rounded-3xl border-none shadow-sm bg-secondary/20 h-full">
          <CardHeader>
            <CardTitle>Professional Profile</CardTitle>
            <CardDescription>Your current academic and career status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ProfileItem label="Degree" value={profile?.degree || 'Not set'} />
              <ProfileItem label="Current Year" value={profile?.year || 'Not set'} />
              <ProfileItem label="Target Role" value={profile?.goal_career || 'Not set'} />
              <ProfileItem label="Experience" value="Beginner" />
            </div>
            <div className="pt-4 border-t">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile?.skills.split(',').map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-background border rounded-full text-xs font-medium">
                    {skill.trim()}
                  </span>
                )) || <span className="text-sm text-muted-foreground italic">No skills listed yet</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions Box (Dynamic) */}
        <Card className="rounded-3xl border-2 border-primary/20 shadow-lg shadow-primary/5 bg-gradient-to-br from-primary/5 to-transparent flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-primary rounded-lg">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl">AI Career Advice</CardTitle>
            </div>
            <CardDescription>Generated based on your interests and target role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-primary/10 rounded w-3/4"></div>
                <div className="h-4 bg-primary/10 rounded w-full"></div>
                <div className="h-4 bg-primary/10 rounded w-1/2"></div>
              </div>
            ) : overview ? (
              <>
                <div className="p-4 bg-background/50 rounded-2xl border border-primary/10">
                  <p className="text-sm leading-relaxed italic text-foreground/90">
                    "{overview.summary}"
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mt-1" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Strength</h4>
                      <p className="text-sm font-medium">{overview.strengths[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-1" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Focus Area</h4>
                      <p className="text-sm font-medium">{overview.recommended_focus}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                Complete your profile to get AI advice.
              </div>
            )}

            <div className="pt-4 mt-auto">
              <Button variant="link" className="p-0 h-auto gap-1 text-primary" onClick={() => setActiveView('roadmap')}>
                View Full Roadmap <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, description, onClick }: any) {
  return (
    <Card className="rounded-3xl hover:shadow-md transition-shadow cursor-pointer group" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2.5 bg-secondary rounded-xl group-hover:bg-primary/10 transition-colors">
            {icon}
          </div>
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 italic">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate mt-0.5">{value}</p>
    </div>
  )
}

function Label({ className, children }: any) {
  return <label className={className}>{children}</label>
}
