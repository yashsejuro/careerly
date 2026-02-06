type WhereClause = { userId?: string }

export const careerlyApi = {
  db: {
    profiles: {
      async exists({ where }: { where: WhereClause }): Promise<boolean> {
        const all = this._all()
        return all.some((p: any) => p.userId === where.userId)
      },
      async create(profile: any) {
        const all = this._all()
        all.push({ id: crypto.randomUUID(), ...profile })
        window.localStorage.setItem('careerly-profiles', JSON.stringify(all))
      },
      async list({ where, limit }: { where: WhereClause; limit?: number }) {
        const all = this._all().filter((p: any) =>
          where.userId ? p.userId === where.userId : true,
        )
        return typeof limit === 'number' ? all.slice(0, limit) : all
      },
      _all() {
        const raw = window.localStorage.getItem('careerly-profiles')
        if (!raw) return []
        try {
          return JSON.parse(raw)
        } catch {
          return []
        }
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
        window.localStorage.setItem('careerly-internships', JSON.stringify(all))
      },
      async delete(id: string) {
        const all = this._all().filter((p: any) => p.id !== id)
        window.localStorage.setItem('careerly-internships', JSON.stringify(all))
      },
      _all() {
        const raw = window.localStorage.getItem('careerly-internships')
        if (!raw) return []
        try {
          return JSON.parse(raw)
        } catch {
          return []
        }
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
        window.localStorage.setItem('careerly-roadmaps', JSON.stringify(all))
      },
      _all() {
        const raw = window.localStorage.getItem('careerly-roadmaps')
        if (!raw) return []
        try {
          return JSON.parse(raw)
        } catch {
          return []
        }
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
      // Simple deterministic mock so the UI has data.
      let fallback: any = {
        steps: [
          { title: 'Learn HTML, CSS, JS', duration: '2-4 weeks' },
          { title: 'Build 2–3 small projects', duration: '4-6 weeks' },
          { title: 'Apply for internships', duration: 'ongoing' },
        ],
      }

      // If schema looks like skill analysis, return compatible mock
      if (schema?.properties?.matchingSkills) {
        fallback = {
            matchingSkills: ['JavaScript', 'React'],
            gapSkills: [
                {
                    skill: 'TypeScript',
                    importance: 'high',
                    reason: 'Essential for modern web dev',
                    resources: ['TypeScript Docs', 'Total TypeScript']
                },
                {
                    skill: 'Node.js',
                    importance: 'medium',
                    reason: 'Backend knowledge is useful',
                    resources: ['Node.js Docs']
                }
            ]
        }
      }

      console.info('[careerlyApi.ai] Mock generateObject for prompt:', prompt)
      console.info('[careerlyApi.ai] Schema:', schema)
      return { object: fallback }
    },
  },
}

