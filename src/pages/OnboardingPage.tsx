import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { careerlyApi } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Compass, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'

interface OnboardingPageProps {
  onComplete: () => void
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    degree: '',
    year: '',
    skills: '',
    interests: '',
    goalCareer: ''
  })

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  const handleSubmit = async () => {
    if (!user) return
    setLoading(true)
    try {
      await careerlyApi.db.profiles.create({
        userId: user.id,
        ...formData,
        createdAt: new Date().toISOString()
      })
      toast.success('Profile created successfully!')
      onComplete()
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Compass className="text-primary w-8 h-8" />
          <span className="text-2xl font-serif font-bold">Career Navigator</span>
        </div>

        <Card className="border-none shadow-xl rounded-3xl overflow-hidden">
          <div className="h-2 bg-secondary">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${(step / 3) * 100}%` }} 
            />
          </div>
          
          <CardHeader className="pt-8 px-8">
            <CardTitle className="text-2xl">
              {step === 1 && "Academic Background"}
              {step === 2 && "Skills & Interests"}
              {step === 3 && "Career Goals"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about your current studies."}
              {step === 2 && "What are you good at and what do you enjoy?"}
              {step === 3 && "Where do you see yourself heading?"}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 py-6">
            <div className="space-y-6 animate-fade-in">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree / Major</Label>
                    <Input 
                      id="degree" 
                      placeholder="e.g. B.Tech in Computer Science" 
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Current Year</Label>
                    <Input 
                      id="year" 
                      placeholder="e.g. 3rd Year" 
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Current Skills (comma separated)</Label>
                    <Input 
                      id="skills" 
                      placeholder="e.g. Python, React, SQL" 
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interests">Interests</Label>
                    <Input 
                      id="interests" 
                      placeholder="e.g. Web Dev, Machine Learning" 
                      value={formData.interests}
                      onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                    />
                  </div>
                </>
              )}

              {step === 3 && (
                <div className="space-y-2">
                  <Label htmlFor="goalCareer">Target Career Role</Label>
                  <Input 
                    id="goalCareer" 
                    placeholder="e.g. Full Stack Developer" 
                    value={formData.goalCareer}
                    onChange={(e) => setFormData({ ...formData, goalCareer: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground pt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> We'll use this to build your personalized roadmap.
                  </p>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="px-8 pb-8 pt-2 flex justify-between">
            {step > 1 ? (
              <Button variant="ghost" onClick={prevStep} disabled={loading}>
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
            ) : <div />}
            
            {step < 3 ? (
              <Button onClick={nextStep} className="rounded-full px-6">
                Next <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="rounded-full px-8 bg-primary shadow-lg hover:shadow-primary/25 transition-all">
                {loading ? "Creating Profile..." : "Complete Setup"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
