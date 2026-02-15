import { generateWithGroq } from './groq'
import { supabase } from './supabaseClient'

type WhereClause = { userId?: string }

export const careerlyApi = {
  db: {
    profiles: {
      async exists({ where }: { where: WhereClause }): Promise<boolean> {
        if (!where.userId) return false
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', where.userId)

        if (error) {
          console.error('Error checking profile existence:', error)
          return false
        }
        return (count || 0) > 0
      },
      async create(profile: any) {
        const { userId, ...rest } = profile
        const { error } = await supabase.from('profiles').insert([{
          user_id: userId,
          ...rest
        }])
        if (error) throw error
      },
      async list({ where, limit }: { where: WhereClause; limit?: number }) {
        let query = supabase.from('profiles').select('*')
        if (where.userId) query = query.eq('user_id', where.userId)
        if (limit) query = query.limit(limit)

        const { data, error } = await query
        if (error) throw error
        return (data || []).map((p: any) => ({ ...p, userId: p.user_id }))
      },
    },
    internships: {
      async count({ where }: { where: WhereClause }) {
        if (!where.userId) return 0
        const { count, error } = await supabase
          .from('internships')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', where.userId)
        if (error) throw error
        return count || 0
      },
      async list({ where }: { where: WhereClause }) {
        let query = supabase.from('internships').select('*')
        if (where.userId) query = query.eq('user_id', where.userId)

        const { data, error } = await query
        if (error) throw error
        return (data || []).map((i: any) => ({
          ...i,
          userId: i.user_id,
          role: i.position,
          date_applied: i.applied_date
        }))
      },
      async create(internship: any) {
        const { userId, role, date_applied, ...rest } = internship
        const { error } = await supabase.from('internships').insert([{
          user_id: userId,
          position: role,
          applied_date: date_applied,
          ...rest
        }])
        if (error) throw error
      },
      async delete(id: string) {
        const { error } = await supabase.from('internships').delete().eq('id', id)
        if (error) throw error
      },
    },
    skills: {
      async list({ where, limit }: { where: WhereClause; limit?: number }) {
        let query = supabase.from('skills_analysis').select('*')
        if (where.userId) query = query.eq('user_id', where.userId)
        if (limit) query = query.limit(limit)

        const { data, error } = await query
        if (error) throw error
        // Map the stored 'data' jsonb back to the top-level object, preserving id/userId
        return (data || []).map((row: any) => ({ ...row.data, id: row.id, userId: row.user_id }))
      },
      async upsert(analysis: any) {
        const { userId, ...rest } = analysis
        const { error } = await supabase.from('skills_analysis').upsert({
          user_id: userId,
          data: rest
        }, { onConflict: 'user_id' })
        if (error) throw error
      },
    },
    userProjects: {
      async list({ where }: { where: WhereClause }) {
        let query = supabase.from('user_projects').select('*')
        if (where.userId) query = query.eq('user_id', where.userId)

        const { data, error } = await query
        if (error) throw error
        return (data || []).map((row: any) => ({ ...row.data, id: row.id, userId: row.user_id, title: row.title, status: row.status }))
      },
      async create(project: any) {
        const { userId, title, status, ...rest } = project
        const { error } = await supabase.from('user_projects').insert([{
          user_id: userId,
          title,
          status: status || 'planned',
          data: rest
        }])
        if (error) throw error
      },
      async update(id: string, updates: any) {
        // Fetch existing logic to merge properly since Supabase update replaces the whole JSONB column if targeted directly
        const { data: existing, error: fetchError } = await supabase.from('user_projects').select('data, title, status').eq('id', id).single()
        if (fetchError || !existing) return // or throw

        const { title, status, ...rest } = updates
        const newData = { ...existing.data, ...rest }

        const { error } = await supabase.from('user_projects').update({
          title: title || existing.title,
          status: status || existing.status,
          data: newData
        }).eq('id', id)

        if (error) throw error
      },
      async delete(id: string) {
        const { error } = await supabase.from('user_projects').delete().eq('id', id)
        if (error) throw error
      },
    },
    roadmaps: {
      async list({ where, limit }: { where: WhereClause; limit?: number }) {
        let query = supabase.from('roadmaps').select('*')
        if (where.userId) query = query.eq('user_id', where.userId)
        if (limit) query = query.limit(limit)

        const { data, error } = await query
        if (error) throw error
        return (data || []).map((row: any) => ({ ...row.data, id: row.id, userId: row.user_id, type: row.type }))
      },
      async upsert(roadmap: any) {
        const { userId, type, ...rest } = roadmap
        const { error } = await supabase.from('roadmaps').upsert({
          user_id: userId,
          type: type || 'career',
          data: rest
        }, { onConflict: 'user_id,type' })
        if (error) throw error
      },
    },
  },
  ai: {
    async generateObject<T>({
      prompt,
      schema,
    }: {
      prompt: string
      schema?: any
    }): Promise<{ object: T }> {
      // 1. Try Real AI (Groq)
      try {
        if (import.meta.env.VITE_GROQ_API_KEY) {
          const result = await generateWithGroq<T>(prompt, schema)
          return { object: result }
        }
      } catch (e) {
        console.warn('Groq AI failed, falling back to mock:', e)
        // Fallthrough to mock data below
      }

      // 2. Fallback Mock Data (Robustness)
      // 2. Fallback Mock Data (Robustness)
      let fallback: any = {}

      // A. Roadmap Fallback
      if (schema?.properties?.career_paths) {
        fallback = {
          career_paths: [
            {
              title: "Frontend Developer",
              description: "Focus on building user interfaces and web experiences.",
              why_fit: "Matches your interest in visual design and React skills.",
              skills: {
                must_have: ["React", "CSS", "TypeScript"],
                good_to_have: ["Figma", "Next.js"]
              },
              learning_roadmap: [
                { step: 1, title: "Advanced React", description: "Master hooks and context." },
                { step: 2, title: "State Management", description: "Learn Redux or Zustand." }
              ],
              entry_roles: ["Junior Frontend Dev", "UI Engineer"],
              timeline_months: 6
            }
          ],
          next_30_days_focus: "Build a complex portfolio project."
        }
      }
      // B. Skills Fallback
      else if (schema?.properties?.missing_skills) {
        fallback = {
          missing_skills: [
            {
              skill: "TypeScript",
              priority: "High",
              why_important: "Standard for modern web dev safety.",
              how_to_learn: "Official docs & Total TypeScript course.",
              mini_task: "Convert one JS file to TS."
            }
          ],
          overall_gap_summary: "You are strong in logic but need typed safety."
        }
      }
      // C. Projects Fallback
      else if (schema?.properties?.projects) {
        fallback = {
          projects: [
            {
              title: "E-Commerce Dashboard",
              problem_statement: "Small businesses need to track inventory.",
              target_users: ["Shop owners"],
              tech_stack: ["React", "Supabase", "Tailwind"],
              core_features: ["Inventory CRUD", "Sales Charts"],
              advanced_features: ["AI Sales Prediction"],
              resume_value: "Demonstrates full-stack ability."
            }
          ]
        }
      }
      // D. Overview Fallback
      else if (schema?.properties?.summary) {
        fallback = {
          summary: "You are on track but need more backend exposure.",
          strengths: ["Frontend", "Design"],
          weaknesses: ["Database Design"],
          recommended_focus: "Build a full-stack CRUD app."
        }
      }

      console.info('[careerlyApi.ai] using Fallback Mock for:', prompt)
      return { object: fallback }
    },
  },
}
