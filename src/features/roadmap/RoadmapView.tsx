
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { careerlyApi } from '@/lib/api'
import { Sparkles, MapPin, ChevronRight, CheckCircle2, Clock, RotateCcw, Briefcase, GraduationCap, Trophy } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import toast from 'react-hot-toast'
import { handleAppError } from '@/lib/errors'
import { CareerRoadmapResponse, CareerPath, LearningStep } from '@/types/roadmap'

export function RoadmapView() {
  const { user } = useAuth()
  const [data, setData] = useState<CareerRoadmapResponse | null>(null)
  const [selectedPathIndex, setSelectedPathIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const currentPath = data?.career_paths?.[selectedPathIndex]

  useEffect(() => {
    async function fetchRoadmap() {
      if (!user) return
      try {
        const records = await careerlyApi.db.roadmaps.list({
          where: { userId: user.id },
          limit: 1
        })
        if (records.length > 0) {
          // Check if data matches new schema (has career_paths)
          const parsed = JSON.parse(records[0].data)
          if (parsed.career_paths) {
            setData(parsed)
          } else {
            setData(null)
          }
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
      const profiles = await careerlyApi.db.profiles.list({
        where: { userId: user.id },
        limit: 1
      })

      if (profiles.length === 0) {
        // Auto-create a default profile for better DX
        const defaultProfile = {
          userId: user.id,
          degree: 'Computer Science',
          year: '2nd Year',
          skills: 'JavaScript, React, Basic Python',
          interests: 'Web Development, AI',
          goal_career: 'Software Engineer'
        }
        await careerlyApi.db.profiles.create(defaultProfile)
        profiles.push(defaultProfile)
        toast.success('Created a default profile to get you started!')
      }

      const profile = profiles[0]
      const prompt = `Student Profile:

Degree: ${profile.degree}
Year: ${profile.year}
Skills: ${profile.skills}
Interests: ${profile.interests}

Generate 2–3 realistic career paths.

Return JSON in this exact format:

{
  "career_paths": [
    {
      "title": "",
      "description": "",
      "why_fit": "",
      "skills": {
        "must_have": [],
        "good_to_have": []
      },
      "learning_roadmap": [
        {
          "step": 1,
          "title": "",
          "description": ""
        }
      ],
      "entry_roles": [],
      "timeline_months": 0
    }
  ],
  "next_30_days_focus": ""
}`

      const { object } = await careerlyApi.ai.generateObject<CareerRoadmapResponse>({
        prompt,
        schema: {
          type: 'object',
          properties: {
            career_paths: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  why_fit: { type: 'string' },
                  skills: {
                    type: 'object',
                    properties: {
                      must_have: { type: 'array', items: { type: 'string' } },
                      good_to_have: { type: 'array', items: { type: 'string' } }
                    }
                  },
                  learning_roadmap: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        step: { type: 'number' },
                        title: { type: 'string' },
                        description: { type: 'string' }
                      }
                    }
                  },
                  entry_roles: { type: 'array', items: { type: 'string' } },
                  timeline_months: { type: 'number' }
                }
              }
            },
            next_30_days_focus: { type: 'string' }
          },
          required: ['career_paths', 'next_30_days_focus']
        }
      })

      await careerlyApi.db.roadmaps.upsert({
        userId: user.id,
        data: JSON.stringify(object),
        updatedAt: new Date().toISOString()
      })

      setData(object)
      toast.success('Roadmap generated!')
    } catch (error) {
      console.error('Error generating roadmap:', error)
      handleAppError({ error, context: 'ai.roadmap', errorCode: 'AI_GENERATE' })
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <div className="py-20 flex justify-center"><Spinner className="w-8 h-8 text-primary" /></div>

  if (!data && !generating) {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Your Career Paths</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            AI suggested {data?.career_paths.length} potential paths based on your profile.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={generateRoadmap} className="gap-2 rounded-xl">
          <RotateCcw className="w-4 h-4" /> Regenerate
        </Button>
      </div>

      {/* Path Selector */}
      <div className="flex flex-wrap gap-2">
        {data?.career_paths.map((path, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedPathIndex(idx)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedPathIndex === idx
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
          >
            {path.title}
          </button>
        ))}
      </div>

      {currentPath && (
        <div className="space-y-8 animate-fade-in">
          {/* Path Header */}
          <Card className="rounded-3xl border-none bg-secondary/20 shadow-sm">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider">
                  <Briefcase className="w-4 h-4" /> Recommended Path
                </div>
                <h2 className="text-3xl font-serif font-bold">{currentPath.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {currentPath.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2 text-sm"><Sparkles className="w-4 h-4 text-primary" /> Why this fits you</h3>
                  <p className="text-sm text-muted-foreground">{currentPath.why_fit}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-primary" /> Estimated Timeline</h3>
                  <p className="text-sm text-muted-foreground">{currentPath.timeline_months} Months to job readiness</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Learning Roadmap
              </h3>
              <div className="relative space-y-8 pl-4">
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border -z-10" />
                {currentPath.learning_roadmap.map((step, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="w-10 h-10 rounded-full bg-background border-4 border-primary flex items-center justify-center shrink-0 shadow-sm z-10">
                      <span className="font-bold text-xs">{step.step}</span>
                    </div>
                    <Card className="flex-1 rounded-2xl border hover:shadow-md transition-all">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              <Card className="rounded-2xl shadow-sm border p-4">
                <h4 className="font-bold mb-3 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Must Have Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentPath.skills.must_have.map((s, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">{s}</span>
                  ))}
                </div>
              </Card>

              <Card className="rounded-2xl shadow-sm border p-4">
                <h4 className="font-bold mb-3 flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-primary" /> Good to Have
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentPath.skills.good_to_have.map((s, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-md font-medium">{s}</span>
                  ))}
                </div>
              </Card>

              <Card className="rounded-2xl shadow-sm border p-4">
                <h4 className="font-bold mb-3 flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-primary" /> Entry Roles
                </h4>
                <ul className="space-y-2">
                  {currentPath.entry_roles.map((role, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {role}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          {/* Focus Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="p-3 bg-primary rounded-full text-primary-foreground">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-primary">Next 30 Days Focus</h4>
              <p className="text-muted-foreground">{data?.next_30_days_focus}</p>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
