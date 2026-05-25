import React from 'react'
import { render, screen } from '@testing-library/react'

const mockGetServerSession = jest.fn()
const mockGetCheckinsByUser = jest.fn()

jest.mock('@/lib/auth/session', () => ({ getServerSession: () => mockGetServerSession() }))
jest.mock('@/lib/api/checkin', () => ({ getCheckinsByUser: (...a: unknown[]) => mockGetCheckinsByUser(...a) }))
jest.mock('@/components/ui/CheckinCard', () => ({
  CheckinCard: ({ checkin }: { checkin: { title: string } }) => (
    <div data-testid="checkin-card">{checkin.title}</div>
  ),
}))

import CheckinsPage from '@/app/(protected)/checkins/page'

const session = { idUser: 'u1', username: 'u@test.com', token: 'tok' }

describe('CheckinsPage', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue(session)
    mockGetCheckinsByUser.mockReset()
  })

  it('renders a CheckinCard for each check-in', async () => {
    mockGetCheckinsByUser.mockResolvedValue([
      { id: 'c1', title: 'A', description: '', durationMinutes: 30, checkinDate: '2026-01-01' },
      { id: 'c2', title: 'B', description: '', durationMinutes: 60, checkinDate: '2026-01-02' },
    ])
    render(await CheckinsPage())
    expect(screen.getAllByTestId('checkin-card')).toHaveLength(2)
  })

  it('renders empty state when no check-ins', async () => {
    mockGetCheckinsByUser.mockResolvedValue([])
    render(await CheckinsPage())
    expect(screen.getByText(/nenhum check-in registrado ainda/i)).toBeInTheDocument()
  })

  it('renders graceful degradation on API error', async () => {
    mockGetCheckinsByUser.mockRejectedValue(new Error('404'))
    render(await CheckinsPage())
    expect(screen.getByText(/histórico de check-ins em breve/i)).toBeInTheDocument()
  })
})
