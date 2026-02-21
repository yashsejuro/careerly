
import React, { useState, useEffect } from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DashboardProvider, useDashboard } from '../DashboardContext'

// Use vi.hoisted to ensure mocks are available
const { mockFrom } = vi.hoisted(() => {
    const mockFrom = vi.fn()
    return { mockFrom }
})

vi.mock('@/lib/supabaseClient', () => {
  return {
    supabase: {
      from: mockFrom
    }
  }
})

const { mockUser } = vi.hoisted(() => {
  return { mockUser: { id: 'test-user', email: 'test@example.com' } }
})

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: mockUser
  })
}))

const RenderCounter = ({ onRender }: { onRender: () => void }) => {
  const { isLoading } = useDashboard()
  onRender()
  return <div>{isLoading ? 'Loading...' : 'Loaded'}</div>
}

describe('DashboardContext Performance', () => {
  it('prevents unnecessary re-renders of consumers', async () => {
    // Setup Supabase mock behavior
    const mockSelect = vi.fn()
    const mockEq = vi.fn()
    const mockLimit = vi.fn()

    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })

    mockLimit.mockResolvedValue({ data: [] })

    const promiseResult = Promise.resolve({ count: 0, data: [] })
    const eqResult = {
        limit: mockLimit,
        then: (resolve: any, reject: any) => promiseResult.then(resolve, reject)
    }
    mockEq.mockReturnValue(eqResult)

    const renderCount = vi.fn()

    // Create a stable child element to ensure re-renders are only due to context changes
    const stableChild = <RenderCounter onRender={renderCount} />

    const Wrapper = () => {
      const [count, setCount] = useState(0)
      return (
        <div>
          <button onClick={() => setCount(c => c + 1)}>Force Render</button>
          <DashboardProvider>
            {stableChild}
          </DashboardProvider>
        </div>
      )
    }

    const { getByText, findByText } = render(<Wrapper />)

    // Wait for data to be loaded
    await findByText('Loaded')

    // At this point, initial render + loading state updates should have happened.
    // Reset the render count to measure subsequent re-renders.
    renderCount.mockClear()

    // Force re-render of Wrapper
    await act(async () => {
      fireEvent.click(getByText('Force Render'))
    })

    // Check render count
    // If not optimized, it should be 1 (because consumer re-renders).
    // If optimized, it should be 0 (consumer doesn't re-render).
    console.log(`Render count after force update: ${renderCount.mock.calls.length}`)

    // We expect it to be 0 after optimization
    expect(renderCount).not.toHaveBeenCalled()
  })
})
