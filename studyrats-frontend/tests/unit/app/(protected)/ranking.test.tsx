import React from 'react'
import { render, screen } from '@testing-library/react'

const mockGetServerSession = jest.fn()
const mockGetRanking = jest.fn()
const mockGetGroupById = jest.fn()

jest.mock('@/lib/auth/session', () => ({ getServerSession: () => mockGetServerSession() }))
jest.mock('@/lib/api/groups', () => ({
  getRanking: (...a: unknown[]) => mockGetRanking(...a),
  getGroupById: (...a: unknown[]) => mockGetGroupById(...a),
}))
jest.mock('@/components/ui/RankingTable', () => ({
  RankingTable: ({ entries }: { entries: unknown[] }) => (
    <div data-testid="ranking-table">{entries.length} entries</div>
  ),
}))

import RankingPage from '@/app/(protected)/groups/[idGroup]/ranking/page'

const session = { idUser: 'u1', username: 'u@test.com', token: 'tok' }
const group = { id: 'g1', name: 'React Study', description: '', createdAt: '2026-01-01', memberships: [] }

describe('RankingPage', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue(session)
    mockGetRanking.mockReset()
    mockGetGroupById.mockReset()
  })

  it('fetches ranking and group in parallel with Promise.all', async () => {
    const ranking = [{ userId: 'u1', firstName: 'Ana', totalCheckins: 5, position: 1 }]
    mockGetRanking.mockResolvedValue(ranking)
    mockGetGroupById.mockResolvedValue(group)
    await RankingPage({ params: Promise.resolve({ idGroup: 'g1' }) })
    expect(mockGetRanking).toHaveBeenCalledWith('g1', 'tok')
    expect(mockGetGroupById).toHaveBeenCalledWith('u1', 'g1', 'tok')
  })

  it('renders group name as heading', async () => {
    mockGetRanking.mockResolvedValue([])
    mockGetGroupById.mockResolvedValue(group)
    render(await RankingPage({ params: Promise.resolve({ idGroup: 'g1' }) }))
    expect(screen.getByRole('heading', { name: /react study/i })).toBeInTheDocument()
  })

  it('renders RankingTable when entries exist', async () => {
    mockGetRanking.mockResolvedValue([
      { userId: 'u1', firstName: 'Ana', totalCheckins: 5, position: 1 },
    ])
    mockGetGroupById.mockResolvedValue(group)
    render(await RankingPage({ params: Promise.resolve({ idGroup: 'g1' }) }))
    expect(screen.getByTestId('ranking-table')).toBeInTheDocument()
  })

  it('renders empty state when ranking is empty', async () => {
    mockGetRanking.mockResolvedValue([])
    mockGetGroupById.mockResolvedValue(group)
    render(await RankingPage({ params: Promise.resolve({ idGroup: 'g1' }) }))
    expect(screen.getByText(/nenhum check-in registrado neste grupo/i)).toBeInTheDocument()
  })
})
