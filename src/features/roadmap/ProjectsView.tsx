
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from '@/lib/auth'
import { careerlyApi } from '@/lib/api'
import { Rocket, Sparkles, Code2, Layers, Cpu, ArrowUpRight, Users, Trophy, Star, Plus, MoreHorizontal, CheckCircle2, Clock, PlayCircle } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import toast from 'react-hot-toast'
import { ProjectRecommendation, ProjectRecommendationsResponse, UserProject, UserProjectStatus } from '@/types/roadmap'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getProviderToken, fetchGithubRepos } from '@/lib/integrations'
import { Github } from 'lucide-react'

export function ProjectsView() {
  const { user, linkGithub } = useAuth()
  const [projects, setProjects] = useState<ProjectRecommendation[]>([])
  const [userProjects, setUserProjects] = useState<UserProject[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('board')

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  async function loadData() {
    if (!user) return
    setLoading(true)
    try {
      // Load user projects
      const myProjects = await careerlyApi.db.userProjects.list({ where: { userId: user.id } })
      setUserProjects(myProjects)

      // If no user projects, maybe generate recommendations automatically or just show empty state
      if (myProjects.length === 0) {
        setActiveTab('discover')
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateProjects = async () => {
    if (!user) return
    setGenerating(true)
    try {
      const profiles = await careerlyApi.db.profiles.list({
        where: { userId: user.id },
        limit: 1
      })

      if (profiles.length === 0) {
        toast.error("Please complete your profile first.");
        return;
      }
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

  const syncGithubProjects = async () => {
    if (!user) return
    setGenerating(true)
    try {
      // Trying with 'github' (provider name)
      const token = await getProviderToken('github')

      if (!token) {
        toast.custom((t) => (
          <div className="bg-background border border-border p-4 rounded-xl shadow-lg flex flex-col gap-3 min-w-[300px]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Github className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm">Connect GitHub Account</p>
                <p className="text-xs text-muted-foreground">Required to sync your repositories.</p>
              </div>
            </div>
            <Button size="sm" onClick={async () => {
              toast.dismiss(t.id)
              try {
                await linkGithub()
              } catch (e) {
                toast.error("Connection failed: " + (e as Error).message)
              }
            }} className="w-full">
              Connect Now
            </Button>
          </div>
        ), { duration: 6000 })
        return
      }

      const repos = await fetchGithubRepos(token)

      if (repos.length === 0) {
        toast("No public repositories found.", { icon: '📂' })
        return
      }

      const newProjects = repos.map(repo => ({
        title: repo.name,
        problem_statement: repo.description || "Project imported from GitHub",
        target_users: [],
        tech_stack: repo.language ? [repo.language] : [],
        core_features: [],
        advanced_features: [],
        resume_value: `GitHub Project • ${repo.stargazers_count} stars • Updated ${new Date(repo.updated_at).toLocaleDateString()}`
      })) as ProjectRecommendation[]

      // Filter out existing projects to avoid duplicates if possible, or just prepend
      // Basic check by title
      const uniqueNew = newProjects.filter(np => !projects.some(p => p.title === np.title))

      if (uniqueNew.length === 0) {
        toast.success("GitHub projects already synced!")
      } else {
        setProjects(prev => [...uniqueNew, ...prev])
        toast.success(`Synced ${uniqueNew.length} projects from GitHub!`)
        setActiveTab('discover')
      }

    } catch (error) {
      const err = error as Error
      console.error('Error syncing GitHub:', err)
      if (err.message === 'Unauthorized' || err.message.includes('401')) {
        toast.custom((t) => (
          <div className="bg-background border border-border p-4 rounded-xl shadow-lg flex flex-col gap-3 min-w-[300px]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Github className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm">Switch to GitHub Auth</p>
                <p className="text-xs text-muted-foreground">We need your permission to access repositories.</p>
              </div>
            </div>
            <Button size="sm" onClick={async () => {
              toast.dismiss(t.id)
              try {
                await linkGithub()
              } catch (e) {
                toast.error("Connection failed: " + (e as Error).message)
              }
            }} className="w-full">
              Connect Now
            </Button>
          </div>
        ), { duration: 6000 })
      } else {
        toast.error(`Sync failed: ${err.message}`)
      }
    } finally {
      setGenerating(false)
    }
  }

  const addToBoard = async (project: ProjectRecommendation) => {
    if (!user) return
    try {
      const newProject: Partial<UserProject> = {
        ...project,
        userId: user.id,
        status: 'To Do',
        createdAt: new Date().toISOString()
      }
      await careerlyApi.db.userProjects.create(newProject)
      toast.success("Added to your board!")
      loadData()
      setActiveTab('board')
    } catch (e) {
      console.error(e)
      toast.error("Failed to add project")
    }
  }

  const updateStatus = async (id: string, status: UserProjectStatus) => {
    try {
      await careerlyApi.db.userProjects.update(id, { status })
      toast.success(`Moved to ${status}`)
      loadData()
    } catch (e) {
      console.error(e)
      toast.error("Failed to update status")
    }
  }

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to remove this project?")) return
    try {
      await careerlyApi.db.userProjects.delete(id)
      toast.success("Project removed")
      loadData()
    } catch (e) {
      console.error(e)
      toast.error("Failed to delete")
    }
  }

  const getColumns = () => {
    const todo = userProjects.filter(p => p.status === 'To Do')
    const inProgress = userProjects.filter(p => p.status === 'In Progress')
    const done = userProjects.filter(p => ['Done', 'Review'].includes(p.status)) // Merging Review/Done for simplicity or keep separate
    return { todo, inProgress, done }
  }

  const columns = getColumns()

  return (
    <div className="space-y-8 pb-12 h-full flex flex-col">
      <div className="flex justify-between items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-serif font-bold">Project Workspace</h1>
          <p className="text-muted-foreground mt-1">Manage your builds and discover new ideas.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="board" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">My Board</TabsTrigger>
            <TabsTrigger value="discover" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Discover Ideas</TabsTrigger>
          </TabsList>

          {activeTab === 'discover' && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={syncGithubProjects} disabled={generating} className="gap-2 rounded-xl">
                {generating ? <Spinner className="w-4 h-4" /> : <Github className="w-4 h-4" />}
                Sync GitHub
              </Button>
              <Button variant="outline" size="sm" onClick={generateProjects} disabled={generating} className="gap-2 rounded-xl">
                {generating ? <Spinner className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                Generate New Ideas
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="board" className="flex-1 min-h-0">
          {userProjects.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-secondary/10 text-center">
              <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Layers className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Your board is empty</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Go to the Discover tab to find AI-tailored project ideas to build.
              </p>
              <Button onClick={() => setActiveTab('discover')}>Find Projects</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
              {/* Column 1: To Do */}
              <KanbanColumn
                title="To Do"
                icon={<Clock className="w-4 h-4 text-orange-500" />}
                projects={columns.todo}
                color="bg-orange-500/10 border-orange-500/20"
                onMove={(id) => updateStatus(id, 'In Progress')}
                onDelete={deleteProject}
                nextLabel="Start Building"
              />

              {/* Column 2: In Progress */}
              <KanbanColumn
                title="In Progress"
                icon={<PlayCircle className="w-4 h-4 text-blue-500" />}
                projects={columns.inProgress}
                color="bg-blue-500/10 border-blue-500/20"
                onMove={(id) => updateStatus(id, 'Done')}
                onDelete={deleteProject}
                nextLabel="Mark Value Complete"
              />

              {/* Column 3: Done */}
              <KanbanColumn
                title="Completed"
                icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
                projects={columns.done}
                color="bg-green-500/10 border-green-500/20"
                onDelete={deleteProject}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-6">
          {projects.length === 0 && !generating && (
            <div className="text-center py-20">
              <Button size="lg" onClick={generateProjects}>
                <Sparkles className="mr-2 w-4 h-4" /> Generate Ideas
              </Button>
            </div>
          )}

          {generating && (
            <div className="flex justify-center py-20">
              <Spinner className="w-8 h-8" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, i) => {
              const isAdded = userProjects.some(p => p.title === project.title)
              return (
                <Card key={i} className="rounded-3xl border shadow-sm flex flex-col hover:shadow-xl transition-all group overflow-hidden bg-background">
                  <div className="h-32 bg-primary/5 flex items-center justify-center border-b group-hover:bg-primary/10 transition-colors relative">
                    <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center shadow-sm border border-primary/10 group-hover:scale-110 transition-transform z-10">
                      {i % 3 === 0 ? <Code2 className="w-8 h-8 text-primary" /> : i % 3 === 1 ? <Layers className="w-8 h-8 text-primary" /> : <Cpu className="w-8 h-8 text-primary" />}
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
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech_stack.map((tech: string, j: number) => (
                          <Badge variant="secondary" key={j} className="text-[10px]">{tech}</Badge>
                        ))}
                      </div>
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
                    {isAdded ? (
                      <Button className="w-full rounded-xl" variant="outline" disabled>
                        <CheckCircle2 className="mr-2 w-4 h-4 text-green-500" /> Added to Board
                      </Button>
                    ) : (
                      <Button className="w-full rounded-xl group/btn" onClick={() => addToBoard(project)}>
                        <Plus className="mr-2 w-4 h-4" /> Add to Board
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function KanbanColumn({ title, icon, projects, color, onMove, onDelete, nextLabel }: any) {
  return (
    <div className="flex flex-col h-full bg-secondary/30 rounded-3xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${color} bg-opacity-50`}>
            {icon}
          </div>
          <h3 className="font-bold text-sm text-foreground/80">{title}</h3>
        </div>
        <Badge variant="outline" className="rounded-full">{projects.length}</Badge>
      </div>

      <div className="flex-1 space-y-3 min-h-[200px]">
        {projects.map((p: UserProject) => (
          <motion.div layout key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all border-none bg-background">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-sm font-bold leading-tight line-clamp-2">{p.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onDelete(p.id)} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.tech_stack.slice(0, 2).map((t, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 bg-secondary rounded-md text-muted-foreground">{t}</span>
                  ))}
                </div>
                {onMove && (
                  <Button size="sm" variant="outline" className="w-full text-xs h-8 rounded-lg" onClick={() => onMove(p.id)}>
                    {nextLabel} <ArrowUpRight className="ml-1 w-3 h-3" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
