import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Calendar, ClipboardList, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Internship, Status } from './types'

interface InternshipItemProps {
  internship: Internship
  onDelete: (id: string) => void
}

const statusColors: Record<Status, string> = {
  'Interested': 'bg-blue-100 text-blue-700 border-blue-200',
  'Applied': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Interview': 'bg-purple-100 text-purple-700 border-purple-200',
  'Offer': 'bg-green-100 text-green-700 border-green-200',
  'Rejected': 'bg-red-100 text-red-700 border-red-200'
}

export const InternshipItem = memo(function InternshipItem({ internship, onDelete }: InternshipItemProps) {
  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden group">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-center p-6 gap-6">
          <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-primary" />
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h3 className="text-lg font-bold truncate">{internship.company}</h3>
            <p className="text-sm text-muted-foreground truncate">{internship.position}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{format(internship.applied_date, 'MMM d, yyyy')}</span>
            </div>

            <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${statusColors[internship.status]}`}>
              {internship.status}
            </div>

            <div className="flex items-center gap-2">
              {internship.notes && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="View notes"
                  onClick={() => toast(internship.notes || '')}
                >
                  <ClipboardList className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(internship.id)}
                aria-label={`Delete internship at ${internship.company}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
