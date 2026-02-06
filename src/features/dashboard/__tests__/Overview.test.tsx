// @vitest-environment jsdom
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Overview } from '../Overview'
import { DashboardProvider } from '../DashboardContext'

// Use vi.hoisted to create mocks available in vi.mock
const { mockFrom, mockSelect, mockEq, mockLimit } = vi.hoisted(() => {
  return {
    mockFrom: vi.fn(),
    mockSelect: vi.fn(),
    mockEq: vi.fn(),
    mockLimit: vi.fn(),
  }
})

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: mockFrom
  }
}))

// Mock Auth with stable user reference
const mockUser = { id: 'test-user-id', displayName: 'Test User' }
vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: mockUser
  })
}))

describe('Overview Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup chain
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })

    const promiseResultProfiles = Promise.resolve({ data: [{ degree: 'BTech', skills: 'React', interests: 'AI', goal_career: 'Engineer', year: '3rd' }] })
    const promiseResultInternships = Promise.resolve({ count: 5 })

    mockLimit.mockReturnValue(promiseResultProfiles)

    // eq needs to be thenable for internships, but also have limit for profiles
    const eqResult = {
      limit: mockLimit,
      then: (resolve: any, reject: any) => promiseResultInternships.then(resolve, reject)
    }
    mockEq.mockReturnValue(eqResult)
  })

  it('fetches data only once', async () => {
    const TestWrapper = () => {
      const [show, setShow] = React.useState(true)
      return (
        <DashboardProvider>
          {show ? <Overview setActiveView={() => {}} /> : <div>Hidden</div>}
          <button onClick={() => setShow(!show)}>Toggle</button>
        </DashboardProvider>
      )
    }

    const { getByText } = render(<TestWrapper />)

    // Wait for initial fetch
    await new Promise(r => setTimeout(r, 0))

    // Expect calls: Supabase.from called twice (profiles + internships)
    expect(mockFrom).toHaveBeenCalledTimes(2)

    // Toggle off (Unmount Overview)
    fireEvent.click(getByText('Toggle'))
    await new Promise(r => setTimeout(r, 0))

    // Toggle on (Remount Overview)
    fireEvent.click(getByText('Toggle'))
    await new Promise(r => setTimeout(r, 0))

    // Should still be 2 calls because data is cached in provider
    expect(mockFrom).toHaveBeenCalledTimes(2)
  })
})
