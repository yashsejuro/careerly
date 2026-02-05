import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { careerlyApi } from '@/lib/api'
import { Target, ArrowRight, BookOpen, ExternalLink, Sparkles, BrainCircuit } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import toast from 'react-hot-toast'

export function SkillsView() {
  const { user } = useAuth()
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    async function fetchAnalysis() {
      if (!user) return
      setLoading(true)
      try {
        // We'll regenerate analysis on each visit for fresh insights, or we could cache it.
        // For the MVP, let's just generate it once or provide a refresh button.
        await analyzeSkills()
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
        limit: 1
      })
      
      if (profiles.length === 0) return
      const profile = profiles[0]

      const prompt = `Analyze skill gaps for this profile:
Target Career: ${profile.goalCareer}
Current Skills: ${profile.skills}

Identify:
1. Skills they already have that are relevant.
2. The most critical "Gap Skills" they need to learn.
3. Recommended resources for each gap skill (online courses, documentation, or concepts).`

      const { object } = await careerlyApi.ai.generateObject({
        prompt,
        schema: {
          type: 'object',
          properties: {
            matchingSkills: { 
              type: 'array', 
              items: { type: 'string' } 
            },
            gapSkills: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  skill: { type: 'string' },
                  importance: { type: 'string', enum: ['high', 'medium', 'low'] },
                  reason: { type: 'string' },
                  resources: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          },
          required: ['matchingSkills', 'gapSkills']
        }
      })

      setAnalysis(object)
    } catch (error) {
      console.error('Error analyzing skills:', error)
      toast.error('Failed to analyze skills.')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading && !analysis) return <div className="py-20 flex justify-center"><Spinner className="w-8 h-8 text-primary" /></div>

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Skill Gap Analysis</h1>
          <p className="text-muted-foreground mt-1">AI-powered insights into your professional development.</p>
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
            <CardDescription>Relevant skills you already possess.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis?.matchingSkills.map((skill: string, i: number) => (
                <div key={i} className="px-3 py-1.5 bg-background border border-primary/20 rounded-xl text-sm font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {skill}
                </div>
              ))}
              {analysis?.matchingSkills.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No matching skills identified yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skill Gaps */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold px-1">Top Skills to Focus On</h2>
          <div className="grid grid-cols-1 gap-4">
            {analysis?.gapSkills.map((gap: any, i: number) => (
              <Card key={i} className="rounded-3xl border shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className={`md:w-2 ${gap.importance === 'high' ? 'bg-destructive' : gap.importance === 'medium' ? 'bg-primary' : 'bg-muted'}`} />
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-bold">{gap.skill}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{gap.reason}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${gap.importance === 'high' ? 'bg-destructive/10 text-destructive' : gap.importance === 'medium' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {gap.importance} Priority
                      </span>
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="w-3 h-3" /> Recommended Resources
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {gap.resources.map((res: string, j: number) => (
                          <div key={j} className="flex items-center gap-2 text-xs bg-secondary/50 p-2 rounded-lg group cursor-pointer hover:bg-secondary transition-colors">
                            <span className="flex-1 truncate">{res}</span>
                            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary shrink-0" />
                          </div>
                        ))}
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
