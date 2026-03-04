import { useState, useEffect, useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth'
import { careerlyApi } from '@/lib/api'
import { useDashboard } from '@/features/dashboard/DashboardContext'
import { Spinner } from '@/components/ui/spinner'
import { X, Plus, Sparkles, BrainCircuit } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const SUGGESTED_SKILLS = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
    'Python', 'Java', 'C++', 'Go', 'Rust',
    'SQL', 'MongoDB', 'PostgreSQL', 'Redis',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
    'Git', 'CI/CD', 'REST API', 'GraphQL',
    'HTML', 'CSS', 'Tailwind', 'Figma',
    'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch',
    'Flutter', 'React Native', 'Swift', 'Kotlin',
]

interface EditSkillsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditSkillsDialog({ open, onOpenChange }: EditSkillsDialogProps) {
    const { user } = useAuth()
    const { profile, refreshData } = useDashboard()

    const [skills, setSkills] = useState<string[]>([])
    const [inputValue, setInputValue] = useState('')
    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Sync skills from profile when dialog opens
    useEffect(() => {
        if (open && profile?.skills) {
            const parsed = profile.skills
                .split(',')
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 0)
            setSkills(parsed)
            setHasChanges(false)
        }
    }, [open, profile])

    const addSkill = (skill: string) => {
        const trimmed = skill.trim()
        if (!trimmed) return
        if (skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
            toast.error(`"${trimmed}" already exists`)
            return
        }
        setSkills(prev => [...prev, trimmed])
        setInputValue('')
        setHasChanges(true)
        inputRef.current?.focus()
    }

    const removeSkill = (index: number) => {
        setSkills(prev => prev.filter((_, i) => i !== index))
        setHasChanges(true)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addSkill(inputValue)
        }
        if (e.key === 'Backspace' && inputValue === '' && skills.length > 0) {
            removeSkill(skills.length - 1)
        }
    }

    const handleSave = async () => {
        if (!user || !profile) return
        setSaving(true)
        try {
            await careerlyApi.db.profiles.update(profile.id, {
                skills: skills.join(', ')
            })

            // Clear the overview cache since skills changed
            localStorage.removeItem(`careerly_overview_${user.id}`)

            await refreshData()
            toast.success('Skills updated successfully!')
            setHasChanges(false)
            onOpenChange(false)
        } catch (error) {
            console.error('Error updating skills:', error)
            toast.error('Failed to update skills. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const suggestionsToShow = SUGGESTED_SKILLS.filter(
        s => !skills.some(existing => existing.toLowerCase() === s.toLowerCase())
    ).filter(
        s => !inputValue || s.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 12)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px] rounded-2xl border-border/40 bg-card/95 backdrop-blur-xl p-0 overflow-hidden">
                {/* Decorative Header Gradient */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />

                <div className="p-6 pb-0">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-lg shadow-lg shadow-primary/25">
                                <BrainCircuit className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold tracking-tight">Edit Skills</DialogTitle>
                                <DialogDescription className="text-xs mt-0.5">
                                    Add or remove skills from your profile
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="px-6 py-4 space-y-5">
                    {/* Skills Input Area */}
                    <div
                        className="min-h-[100px] max-h-[180px] overflow-y-auto p-3 rounded-xl border border-border/60 bg-background/50 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-all cursor-text"
                        onClick={() => inputRef.current?.focus()}
                    >
                        <div className="flex flex-wrap gap-2">
                            <AnimatePresence mode="popLayout">
                                {skills.map((skill, i) => (
                                    <motion.div
                                        key={skill}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        layout>
                                        <Badge
                                            variant="secondary"
                                            className="pl-3 pr-1.5 py-1.5 bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 rounded-lg text-[12px] font-medium flex items-center gap-1.5 group cursor-default select-none"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeSkill(i)
                                                }}
                                                className="ml-0.5 p-0.5 rounded-full hover:bg-destructive/15 hover:text-destructive transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={skills.length === 0 ? 'Type a skill and press Enter...' : 'Add more...'}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/60 py-1"
                            />
                        </div>
                    </div>

                    {/* Skill Count */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{skills.length} skill{skills.length !== 1 ? 's' : ''} added</span>
                        {inputValue && (
                            <button
                                onClick={() => addSkill(inputValue)}
                                className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium"
                            >
                                <Plus className="w-3 h-3" /> Add "{inputValue}"
                            </button>
                        )}
                    </div>

                    {/* Suggested Skills */}
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                            <Sparkles className="w-3 h-3" />
                            Suggestions
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {suggestionsToShow.map((suggestion) => (
                                <motion.button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => addSkill(suggestion)}
                                    className="px-3 py-1.5 rounded-lg border border-border/50 bg-secondary/30 hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-xs font-medium text-muted-foreground transition-all duration-200 cursor-pointer"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Plus className="w-3 h-3 inline mr-1 -mt-0.5" />
                                    {suggestion}
                                </motion.button>
                            ))}
                            {suggestionsToShow.length === 0 && (
                                <span className="text-xs text-muted-foreground/50 italic py-1">
                                    No matching suggestions
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-border/40 bg-secondary/20">
                    <div className="flex items-center justify-between w-full">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || !hasChanges}
                            className="rounded-full px-6 shadow-lg shadow-primary/20 gap-2"
                        >
                            {saving ? (
                                <>
                                    <Spinner className="w-4 h-4" /> Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
