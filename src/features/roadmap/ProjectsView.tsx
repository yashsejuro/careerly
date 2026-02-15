
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { careerlyApi } from '@/lib/api'
import { Rocket, Sparkles, Code2, Layers, Cpu, ArrowUpRight, Users, Trophy, Star } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import toast from 'react-hot-toast'
import { ProjectRecommendation, ProjectRecommendationsResponse } from '@/types/roadmap'

export function ProjectsView() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<ProjectRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!user) return
      setLoading(true)
      try {
        await generateProjects()
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const generateProjects = async () => {
    if (!user) return
    setGenerating(true)
    try {
      const profiles = await careerlyApi.db.profiles.list({
        where: { userId: user.id },
        limit: 1
      })

      if (profiles.length === 0) return
      const profile = profiles[0]

      const prompt = `Student Profile:

Career Path: ${profile.goalCareer}
Skills: ${profile.skills}
Experience Level: Intermediate (College Student)

Return JSON in this format:

{
  "projects": [
    {
      "title": "",
      "problem_statement": "",
      "target_users": [],
      "tech_stack": [],
      "core_features": [],
      "advanced_features": [],
      "resume_value": ""
    }
  ]
}`

      const { object } = await careerlyApi.ai.generateObject<ProjectRecommendationsResponse>({
        prompt,
        schema: {
          type: 'object',
          properties: {
            projects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  problem_statement: { type: 'string' },
                  target_users: { type: 'array', items: { type: 'string' } },
                  tech_stack: { type: 'array', items: { type: 'string' } },
                  core_features: { type: 'array', items: { type: 'string' } },
                  advanced_features: { type: 'array', items: { type: 'string' } },
                  resume_value: { type: 'string' },
                }
              }
            }
          },
          required: ['projects']
        }
      })

      setProjects(object.projects)
    } catch (error) {
      console.error('Error generating projects:', error)
      toast.error('Failed to generate project recommendations.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading && projects.length === 0) return <div className="py-20 flex justify-center"><Spinner className="w-8 h-8 text-primary" /></div>

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Project Recommendations</h1>
          <p className="text-muted-foreground mt-1">Build your portfolio with projects that matter.</p>
        </div>
        <Button variant="outline" size="sm" onClick={generateProjects} disabled={generating} className="gap-2 rounded-xl">
          {generating ? <Spinner className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          Get New Ideas
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, i) => (
          <Card key={i} className="rounded-3xl border shadow-sm flex flex-col hover:shadow-xl transition-all group overflow-hidden bg-background">
            <div className="h-32 bg-primary/5 flex items-center justify-center border-b group-hover:bg-primary/10 transition-colors relative">
              <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center shadow-sm border border-primary/10 group-hover:scale-110 transition-transform z-10">
                {i === 0 ? <Code2 className="w-8 h-8 text-primary" /> : i === 1 ? <Layers className="w-8 h-8 text-primary" /> : <Cpu className="w-8 h-8 text-primary" />}
              </div>
              <div className="absolute top-4 right-4 flex -space-x-1">
                {project.target_users?.slice(0, 3).map((u, k) => (
                  <div key={k} className="w-6 h-6 rounded-full bg-secondary border border-background flex items-center justify-center text-[10px]" title={u}>
                    <Users className="w-3 h-3" />
                  </div>
                ))}
              </div>
            </div>

            <CardHeader>
              <CardTitle className="text-xl line-clamp-1">{project.title}</CardTitle>
              <CardDescription className="line-clamp-3 text-sm min-h-[60px] italic">
                "{project.problem_statement}"
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech_stack.map((tech: string, j: number) => (
                    <span key={j} className="text-xs bg-secondary px-2 py-1 rounded-md font-medium">{tech}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Features</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {project.core_features.slice(0, 2).map((feat: string, j: number) => (
                    <li key={j} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="line-clamp-1">{feat}</span>
                    </li>
                  ))}
                  {project.advanced_features.slice(0, 1).map((feat: string, j: number) => (
                    <li key={j} className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span className="line-clamp-1 font-semibold text-primary">{feat} (Advanced)</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-900/50">
                <p className="text-[10px] uppercase tracking-wider font-bold text-green-700 dark:text-green-400 flex items-center gap-1 mb-1">
                  <Trophy className="w-3 h-3" /> Resume Value
                </p>
                <p className="text-xs text-green-800 dark:text-green-300 leading-tight">
                  {project.resume_value}
                </p>
              </div>
            </CardContent>

            <CardFooter className="pt-0 pb-6 px-6">
              <Button className="w-full rounded-xl group/btn" variant="secondary">
                View Project Plan <ArrowUpRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
