import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBlinkAuth } from '@blinkdotnew/react'
import { blink } from '@/lib/blink'
import { Sparkles, MapPin, ChevronRight, CheckCircle2, Clock, RotateCcw } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import toast from 'react-hot-toast'

export function RoadmapView() {
  const { user } = useBlinkAuth()
  const [roadmap, setRoadmap] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    async function fetchRoadmap() {
      if (!user) return
      try {
        const records = await blink.db.roadmaps.list({
          where: { userId: user.id },
          limit: 1
        })
        if (records.length > 0) {
          setRoadmap(JSON.parse(records[0].data))
        }
      } catch (error) {
        console.error('Error fetching roadmap:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRoadmap()
  }, [user])

  const generateRoadmap = async () => {
    if (!user) return
    setGenerating(true)
    try {
      const profiles = await blink.db.profiles.list({
        where: { userId: user.id },
        limit: 1
      })
      
      if (profiles.length === 0) {
        toast.error('Profile not found. Please complete onboarding.')
        return
      }

      const profile = profiles[0]
      const prompt = `Generate a career roadmap for a college student with the following profile:
Degree: ${profile.degree}
Year: ${profile.year}
Current Skills: ${profile.skills}
Interests: ${profile.interests}
Target Career Goal: ${profile.goalCareer}

Create a structured step-by-step roadmap with phases (e.g. Foundation, Specialization, Portfolio, Application).
Each phase should have specific actionable items.`

      const { object } = await blink.ai.generateObject({
        prompt,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            phases: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  steps: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          },
          required: ['title', 'phases']
        }
      })

      const roadmapData = object as any
      await blink.db.roadmaps.upsert({
        userId: user.id,
        data: JSON.stringify(roadmapData),
        updatedAt: new Date().toISOString()
      })

      setRoadmap(roadmapData)
      toast.success('Roadmap generated!')
    } catch (error) {
      console.error('Error generating roadmap:', error)
      toast.error('Failed to generate roadmap.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <div className="py-20 flex justify-center"><Spinner className="w-8 h-8 text-primary" /></div>

  if (!roadmap && !generating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-serif font-bold mb-2">Generate Your Career Roadmap</h2>
          <p className="text-muted-foreground">
            Our AI will analyze your profile and create a personalized step-by-step guide to help you reach your goals.
          </p>
        </div>
        <Button onClick={generateRoadmap} size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
          Generate Now
        </Button>
      </div>
    )
  }

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <Spinner className="w-12 h-12 text-primary" />
        <div className="max-w-md">
          <h2 className="text-2xl font-serif font-bold mb-2">Analyzing Your Profile</h2>
          <p className="text-muted-foreground animate-pulse">
            Crafting your personalized career roadmap...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">{roadmap.title}</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">{roadmap.description}</p>
        </div>
        <Button variant="outline" size="sm" onClick={generateRoadmap} className="gap-2 rounded-xl">
          <RotateCcw className="w-4 h-4" /> Regenerate
        </Button>
      </div>

      <div className="relative space-y-12">
        {/* Timeline Line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border -z-10" />

        {roadmap.phases.map((phase: any, phaseIdx: number) => (
          <div key={phaseIdx} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 border-4 border-background">
                <span className="text-primary-foreground font-bold">{phaseIdx + 1}</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">{phase.name}</h3>
                <p className="text-sm text-muted-foreground">{phase.description}</p>
              </div>
            </div>

            <div className="ml-16 grid grid-cols-1 md:grid-cols-2 gap-4">
              {phase.steps.map((step: string, stepIdx: number) => (
                <Card key={stepIdx} className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all bg-secondary/30 group">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="mt-1">
                      <Clock className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-medium leading-tight">{step}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card className="rounded-3xl bg-primary/5 border-primary/20 p-8 text-center mt-12">
        <div className="max-w-md mx-auto space-y-4">
          <Trophy className="w-12 h-12 text-primary mx-auto" />
          <h3 className="text-xl font-bold">Stay Consistent!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Success is the sum of small efforts repeated day in and day out. 
            Keep following your roadmap and you'll get there.
          </p>
        </div>
      </Card>
    </div>
  )
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}
