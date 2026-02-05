import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBlinkAuth } from '@blinkdotnew/react'
import { blink } from '@/lib/blink'
import { Rocket, Sparkles, Code2, Layers, Cpu, ArrowUpRight } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import toast from 'react-hot-toast'

export function ProjectsView() {
  const { user } = useBlinkAuth()
  const [projects, setProjects] = useState<any[]>([])
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
      const profiles = await blink.db.profiles.list({
        where: { userId: user.id },
        limit: 1
      })
      
      if (profiles.length === 0) return
      const profile = profiles[0]

      const prompt = `Suggest 3 unique and impressive portfolio project ideas for this profile:
Target Career: ${profile.goalCareer}
Current Skills: ${profile.skills}
Interests: ${profile.interests}

Each project should include:
1. A catchy name.
2. A clear description.
3. Tech stack to use.
4. Key features to implement.
5. Why it will impress recruiters for the ${profile.goalCareer} role.`

      const { object } = await blink.ai.generateObject({
        prompt,
        schema: {
          type: 'object',
          properties: {
            projects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  techStack: { type: 'array', items: { type: 'string' } },
                  features: { type: 'array', items: { type: 'string' } },
                  impact: { type: 'string' },
                  difficulty: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced'] }
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((project, i) => (
          <Card key={i} className="rounded-3xl border shadow-sm flex flex-col hover:shadow-xl transition-all group overflow-hidden">
            <div className="h-32 bg-primary/5 flex items-center justify-center border-b group-hover:bg-primary/10 transition-colors">
              <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center shadow-sm border border-primary/10 group-hover:scale-110 transition-transform">
                {i === 0 ? <Code2 className="w-8 h-8 text-primary" /> : i === 1 ? <Layers className="w-8 h-8 text-primary" /> : <Cpu className="w-8 h-8 text-primary" />}
              </div>
            </div>
            
            <CardHeader>
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${project.difficulty === 'Advanced' ? 'bg-orange-100 text-orange-600' : project.difficulty === 'Intermediate' ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-600'}`}>
                  {project.difficulty}
                </span>
              </div>
              <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
              <CardDescription className="line-clamp-3 text-sm min-h-[60px]">
                {project.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.map((tech: string, j: number) => (
                    <span key={j} className="text-xs bg-secondary px-2 py-1 rounded-md font-medium">{tech}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Key Features</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {project.features.slice(0, 3).map((feat: string, j: number) => (
                    <li key={j} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="line-clamp-1">{feat}</span>
                    </li>
                  ))}
                </ul>
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

      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 text-primary-foreground shadow-xl shadow-primary/20">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <h3 className="text-2xl font-serif font-bold italic">Why these projects?</h3>
            <p className="opacity-90 leading-relaxed text-sm">
              Recruiters don't just look for code; they look for problem-solving skills and the ability to build meaningful applications. These projects were chosen by our AI to demonstrate exactly those traits in your specific target field.
            </p>
          </div>
          <div className="shrink-0">
             <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
               <Sparkles className="w-10 h-10" />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
