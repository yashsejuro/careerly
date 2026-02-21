
import { ProfileOverviewResponse } from '@/types/roadmap'

const CACHE_PREFIX = 'careerly_overview_'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

interface CachedOverview {
  data: ProfileOverviewResponse
  timestamp: number
}

export function getCachedOverview(userId: string): ProfileOverviewResponse | null {
  try {
    const key = `${CACHE_PREFIX}${userId}`
    const raw = localStorage.getItem(key)

    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<CachedOverview>

    // Check if it's the new format with timestamp
    if (parsed && typeof parsed === 'object' && typeof parsed.timestamp === 'number' && parsed.data) {
      const { timestamp, data } = parsed as CachedOverview

      // Check if expired
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data
      }
    }

    // Expired or old format
    return null
  } catch (e) {
    console.error('Failed to parse cached overview', e)
    return null
  }
}

export function setCachedOverview(userId: string, data: ProfileOverviewResponse): void {
  try {
    const key = `${CACHE_PREFIX}${userId}`
    const cacheEntry: CachedOverview = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(cacheEntry))
  } catch (e) {
    console.error('Failed to save overview to cache', e)
  }
}
