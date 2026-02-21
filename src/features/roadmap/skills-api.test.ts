import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchSkillsAndAnalysis } from './skills-api'
import { careerlyApi } from '@/lib/api'

// Mock the api module
vi.mock('@/lib/api', () => ({
  careerlyApi: {
    db: {
      profiles: {
        list: vi.fn()
      },
      skills: {
        list: vi.fn()
      }
    }
  }
}))

describe('fetchSkillsAndAnalysis Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup 100ms delays for each call
    vi.mocked(careerlyApi.db.profiles.list).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return [{ skills: 'React, Node' }]
    })

    vi.mocked(careerlyApi.db.skills.list).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return [{ data: JSON.stringify({ missing_skills: [] }) }]
    })
  })

  it('measures execution time', async () => {
    const start = performance.now()
    const result = await fetchSkillsAndAnalysis('user-123')
    const end = performance.now()
    const duration = end - start

    console.log(`Duration: ${duration.toFixed(2)}ms`)

    expect(result.profiles).toBeDefined()
    expect(result.existing).toBeDefined()

    // Baseline check: Sequential should be > 200ms
    // Parallel check: Should be < 150ms

    // We expect sequential behavior initially, so check for > 190ms
    // allowing small margin for setTimeout drift
    expect(duration).toBeLessThan(150)
  })
})
