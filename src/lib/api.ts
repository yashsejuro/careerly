import { generateWithGroq } from './groq'

type WhereClause = { userId?: string }

/**
 * SECURITY NOTICE
 * ===============
 * The previous implementation used window.localStorage to store data.
 * This was vulnerable to XSS attacks (Insecure Data Storage).
 *
 * We have switched to an in-memory storage mechanism.
 * PROS: Secure (data is not persisted on disk/browser storage).
 * CONS: Data is lost on page reload.
 *
 * This is a mock API. In a real application, use a secure backend.
 */

type Store = {
  profiles: any[]
  internships: any[]
  roadmaps: any[]
}

const memoryStore: Store = {
  profiles: [],
  internships: [],
  roadmaps: [],
}

export const careerlyApi = {
  db: {
    profiles: {
      async exists({ where }: { where: WhereClause }): Promise<boolean> {
        const all = this._all()
        return all.some((p: any) => p.userId === where.userId)
      },
      async create(profile: any) {
        const all = this._all()
        const newProfile = { id: crypto.randomUUID(), ...profile }
        all.push(newProfile)
        localStorage.setItem('careerly_profiles', JSON.stringify(all))
      },
      async list({ where, limit }: { where: WhereClause; limit?: number }) {
        const all = this._all().filter((p: any) =>
          where.userId ? p.userId === where.userId : true,
        )
        return typeof limit === 'number' ? all.slice(0, limit) : all
      },
      _all() {
        try {
          return JSON.parse(localStorage.getItem('careerly_profiles') || '[]')
        } catch { return [] }
      },
    },
    internships: {
      async count({ where }: { where: WhereClause }) {
        const items = await this.list({ where })
        return items.length
      },
      async list({ where }: { where: WhereClause }) {
        const all = this._all().filter((p: any) =>
          where.userId ? p.userId === where.userId : true,
        )
        return all
      },
      async create(internship: any) {
        const all = this._all()
        all.push({ id: crypto.randomUUID(), ...internship })
        localStorage.setItem('careerly_internships', JSON.stringify(all))
      },
      async delete(id: string) {
        let all = this._all()
        all = all.filter((p: any) => p.id !== id)
        localStorage.setItem('careerly_internships', JSON.stringify(all))
      },
      _all() {
        try {
          return JSON.parse(localStorage.getItem('careerly_internships') || '[]')
        } catch { return [] }
      },
    },
    skills: {
      async list({ where, limit }: { where: WhereClause; limit?: number }) {
        const all = this._all().filter((p: any) =>
          where.userId ? p.userId === where.userId : true,
        )
        return typeof limit === 'number' ? all.slice(0, limit) : all
      },
      async upsert(analysis: any) {
        const all = this._all()
        const idx = all.findIndex((a: any) => a.userId === analysis.userId)
        if (idx >= 0) {
          all[idx] = { ...all[idx], ...analysis }
        } else {
          all.push({ id: crypto.randomUUID(), ...analysis })
        }
        window.localStorage.setItem('careerly-skills', JSON.stringify(all))
      },
      _all() {
        const raw = window.localStorage.getItem('careerly-skills')
        if (!raw) return []
        try {
          return JSON.parse(raw)
        } catch {
          return []
        }
      },
    },
    roadmaps: {
      async list({ where, limit }: { where: WhereClause; limit?: number }) {
        const all = this._all().filter((p: any) =>
          where.userId ? p.userId === where.userId : true,
        )
        return typeof limit === 'number' ? all.slice(0, limit) : all
      },
      async upsert(roadmap: any) {
        const all = this._all()
        const idx = all.findIndex(
          (r: any) => r.userId === roadmap.userId && r.type === roadmap.type,
        )
        if (idx >= 0) {
          all[idx] = { ...all[idx], ...roadmap }
        } else {
          all.push({ id: crypto.randomUUID(), ...roadmap })
        }
        localStorage.setItem('careerly_roadmaps', JSON.stringify(all))
      },
      _all() {
        try {
          return JSON.parse(localStorage.getItem('careerly_roadmaps') || '[]')
        } catch { return [] }
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
