export type Status = 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Interested'

export interface Internship {
  id: string
  company: string
  position: string
  status: Status
  applied_date: string
  notes?: string
}
