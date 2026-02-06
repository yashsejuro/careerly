import { z } from 'zod'

export const profileSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  year: z.string().min(1, "Current Year is required"),
  skills: z.string().min(1, "Skills are required"),
  interests: z.string().min(1, "Interests are required"),
  goalCareer: z.string().min(1, "Target Career Role is required"),
})

export type ProfileFormData = z.infer<typeof profileSchema>
