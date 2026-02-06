import { useState, useEffect, useCallback } from 'react'
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import {
  Plus,
  Search,
  ClipboardList
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import toast from 'react-hot-toast'
import { Internship, Status } from './types'
import { InternshipItem } from './InternshipItem'

export function TrackerView() {
  const { user } = useAuth()
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)

  const [newInternship, setNewInternship] = useState<Partial<Internship & { appliedDate: string }>>({
    status: 'Interested',
    appliedDate: new Date().toISOString().split('T')[0]
  })

  const fetchInternships = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInternships((data as Internship[]) ?? [])
    } catch (error) {
      console.error('Error fetching internships:', error)
      toast.error('Failed to load internships')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchInternships()
  }, [fetchInternships])

  const handleAdd = async () => {
    if (!user || !newInternship.company || !newInternship.position) {
      toast.error('Please fill in required fields')
      return
    }
    try {
      const { error } = await supabase.from('internships').insert({
        user_id: user.id,
        company: newInternship.company,
        position: newInternship.position,
        status: newInternship.status,
        applied_date: newInternship.appliedDate,
        notes: newInternship.notes ?? null,
      })

      if (error) throw error
      toast.success('Internship added!')
      setIsAddOpen(false)
      setNewInternship({
        status: 'Interested',
        appliedDate: new Date().toISOString().split('T')[0]
      })
      fetchInternships()
    } catch (error) {
      console.error('Error adding internship:', error)
      toast.error('Failed to add internship')
    }
  }

  const handleDelete = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('internships')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Internship deleted')
      fetchInternships()
    } catch (error) {
      console.error('Error deleting internship:', error)
      toast.error('Failed to delete')
    }
  }, [fetchInternships])

  const filteredInternships = internships.filter(i =>
    i.company.toLowerCase().includes(search.toLowerCase()) ||
    i.position.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Internship Tracker</h1>
          <p className="text-muted-foreground mt-1">Manage your applications and stay organized.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2 px-6 shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5" /> Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Add Internship</DialogTitle>
              <DialogDescription>Track a new internship opportunity.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  placeholder="e.g. Google, Stripe"
                  value={newInternship.company || ''}
                  onChange={e => setNewInternship({ ...newInternship, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input
                  placeholder="e.g. Software Engineer Intern"
                  value={newInternship.position || ''}
                  onChange={e => setNewInternship({ ...newInternship, position: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newInternship.status}
                    onValueChange={v => setNewInternship({ ...newInternship, status: v as Status })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Interested">Interested</SelectItem>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Interview">Interview</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newInternship.appliedDate}
                    onChange={e => setNewInternship({ ...newInternship, appliedDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Links or reminders..."
                  value={newInternship.notes || ''}
                  onChange={e => setNewInternship({ ...newInternship, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} className="w-full rounded-xl">Save Application</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 bg-background border p-2 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search company or position..."
            className="pl-10 border-none bg-transparent focus-visible:ring-0"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner className="w-8 h-8 text-primary" /></div>
      ) : filteredInternships.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-secondary/20 rounded-3xl border-2 border-dashed border-muted">
          <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No applications yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Start tracking your career opportunities by adding your first internship application.
          </p>
          <Button variant="outline" onClick={() => setIsAddOpen(true)} className="rounded-xl">Add Your First One</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInternships.map((internship) => (
            <InternshipItem
              key={internship.id}
              internship={internship}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
