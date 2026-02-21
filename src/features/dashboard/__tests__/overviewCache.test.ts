
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getCachedOverview, setCachedOverview } from '../overviewCache'
import { ProfileOverviewResponse } from '@/types/roadmap'

const mockOverview: ProfileOverviewResponse = {
  summary: 'Test Summary',
  strengths: ['Test Strength'],
  weaknesses: ['Test Weakness'],
  recommended_focus: 'Test Focus'
}

describe('overviewCache', () => {
  const userId = 'test-user-123'
  const cacheKey = `careerly_overview_${userId}`

  // Mock localStorage
  const store: Record<string, string> = {}

  beforeEach(() => {
    vi.useFakeTimers()
    // Reset store
    for (const key in store) delete store[key]

    // Mock localStorage methods
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] || null)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      store[key] = value.toString()
    })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete store[key]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('stores data with current timestamp', () => {
    const now = 1000
    vi.setSystemTime(now)

    setCachedOverview(userId, mockOverview)

    expect(store[cacheKey]).toBeDefined()
    const stored = JSON.parse(store[cacheKey])
    expect(stored).toEqual({
      data: mockOverview,
      timestamp: now
    })
  })

  it('retrieves valid cached data', () => {
    const now = 1000
    vi.setSystemTime(now)

    // Seed cache
    const cacheEntry = {
      data: mockOverview,
      timestamp: now
    }
    store[cacheKey] = JSON.stringify(cacheEntry)

    const result = getCachedOverview(userId)
    expect(result).toEqual(mockOverview)
  })

  it('returns null if cache is expired (24 hours + 1ms)', () => {
    const now = 1000
    vi.setSystemTime(now)

    // Seed cache
    const cacheEntry = {
      data: mockOverview,
      timestamp: now
    }
    store[cacheKey] = JSON.stringify(cacheEntry)

    // Advance time beyond 24 hours
    vi.setSystemTime(now + (24 * 60 * 60 * 1000) + 1)

    const result = getCachedOverview(userId)
    expect(result).toBeNull()
  })

  it('returns null if cache is missing', () => {
    const result = getCachedOverview(userId)
    expect(result).toBeNull()
  })

  it('returns null if cache format is old (just the object)', () => {
    // Seed old format
    store[cacheKey] = JSON.stringify(mockOverview)

    const result = getCachedOverview(userId)
    expect(result).toBeNull()
  })

  it('returns null if cache is invalid JSON', () => {
    store[cacheKey] = 'invalid-json'
    const result = getCachedOverview(userId)
    expect(result).toBeNull()
  })
})
