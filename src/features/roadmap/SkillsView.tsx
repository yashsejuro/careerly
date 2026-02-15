
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { careerlyApi } from '@/lib/api'
import { Target, ArrowRight, BookOpen, ExternalLink, Sparkles, BrainCircuit, Rocket, CheckSquare } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import toast from 'react-hot-toast'
import { SkillGapAnalysisResponse, MissingSkill } from '@/types/roadmap'

export function SkillsView() {
  const { user } = useAuth()
  const [analysis, setAnalysis] = useState<SkillGapAnalysisResponse | null>(null)
  const [currentSkills, setCurrentSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    async function fetchAnalysis() {
      if (!user) return
      setLoading(true)
      try {
        // Fetch Profile for current skills
        const profiles = await careerlyApi.db.profiles.list({
          where: { userId: user.id },
          limit: 1
        })
        if (profiles.length > 0) {
          setCurrentSkills(profiles[0].skills.split(',').map((s: string) => s.trim()))
        }

        // Check for cached analysis
        const existing = await careerlyApi.db.skills.list({
          where: { userId: user.id },
          limit: 1,
        })

        if (existing.length > 0 && existing[0].data) {
          const parsed = JSON.parse(existing[0].data)
          if (parsed.missing_skills) {
            setAnalysis(parsed)
          } else {
            setAnalysis(null)
          }
        } else {
          // If no cache, wait for user to trigger or auto-trigger? 
          // Let's rely on user click to be safe, or just auto-trigger if empty.
          // For now, consistent with RoadmapView, show "Generate" state if empty.
        }
      } catch (error) {
        console.error('Error fetching analysis:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalysis()
  }, [user])

  const analyzeSkills = async () => {
    if (!user) return
    setAnalyzing(true)
    try {
      const profiles = await careerlyApi.db.profiles.list({
        where: { userId: user.id },
        limit: 1,
      })

      if (profiles.length === 0) return
      const profile = profiles[0]

      const prompt = `Student Profile:

Chosen Career Path: ${profile.goalCareer}
Current Skills: ${profile.skills}

Return JSON in this exact format:

{
  "missing_skills": [
    {
      "skill": "",
      "priority": "High | Medium | Low",
      "why_important": "",
      "how_to_learn": "",
      "mini_task": ""
    }
  ],
  "overall_gap_summary": ""
}`

      const { object } = await careerlyApi.ai.generateObject<SkillGapAnalysisResponse>({
        prompt,
        schema: {
          type: 'object',
          properties: {
            missing_skills: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  skill: { type: 'string' },
                  priority: { type: 'string', enum: ['High', 'Medium', 'Low'] },
                  why_important: { type: 'string' },
                  how_to_learn: { type: 'string' },
                  mini_task: { type: 'string' },
                },
              },
            },
            overall_gap_summary: { type: 'string' }
          },
          required: ['missing_skills', 'overall_gap_summary'],
        },
      })

      // Save to DB for caching
      await careerlyApi.db.skills.upsert({
        userId: user.id,
        data: JSON.stringify(object),
        updatedAt: new Date().toISOString()
      })

      setAnalysis(object)
      toast.success('Skills analyzed!')
    } catch (error) {
      console.error('Error analyzing skills:', error)
      toast.error('Failed to analyze skills.')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading && !analysis) return <div className="py-20 flex justify-center"><Spinner className="w-8 h-8 text-primary" /></div>

  if (!analysis && !analyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-serif font-bold mb-2">Analyze Your Skill Gap</h2>
          <p className="text-muted-foreground">
            Find out exactly what you're missing to land your dream job.
          </p>
        </div>
        <Button onClick={analyzeSkills} size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
          Run Analysis
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Skill Gap Analysis</h1>
          <p className="text-muted-foreground mt-1">{analysis?.overall_gap_summary || 'AI-powered insights into your professional development.'}</p>
        </div>
        <Button variant="outline" size="sm" onClick={analyzeSkills} disabled={analyzing} className="gap-2 rounded-xl">
          {analyzing ? <Spinner className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          Refresh Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Strength */}
        <Card className="lg:col-span-1 rounded-3xl border-none bg-primary/5 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              Your Strengths
            </CardTitle>
            <CardDescription>Based on your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentSkills.map((skill, i) => (
                <div key={i} className="px-3 py-1.5 bg-background border border-primary/20 rounded-xl text-sm font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {skill}
                </div>
              ))}
              {currentSkills.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No skills listed in profile.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skill Gaps */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold px-1">Top Skills to Focus On</h2>
          <div className="grid grid-cols-1 gap-4">
            {analysis?.missing_skills.map((gap: MissingSkill, i: number) => (
              <Card key={i} className="rounded-3xl border shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className={`md:w-2 ${gap.priority === 'High' ? 'bg-destructive' : gap.priority === 'Medium' ? 'bg-primary' : 'bg-muted'}`} />
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-bold">{gap.skill}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{gap.why_important}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${gap.priority === 'High' ? 'bg-destructive/10 text-destructive' : gap.priority === 'Medium' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {gap.priority} Priority
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <BookOpen className="w-3 h-3" /> How to Learn
                        </p>
                        <p className="text-sm">{gap.how_to_learn}</p>
                      </div>
                      <div className="bg-secondary/30 p-3 rounded-xl border border-secondary">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-1">
                          <CheckSquare className="w-3 h-3" /> Mini Challenge
                        </p>
                        <p className="text-sm italic text-foreground/80">"{gap.mini_task}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
