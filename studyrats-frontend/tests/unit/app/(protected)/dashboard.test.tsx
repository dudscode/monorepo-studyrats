import React from 'react'
import { render, screen } from '@testing-library/react'

const mockGetServerSession = jest.fn()
const mockGetGroupsByUser = jest.fn()

jest.mock('@/lib/auth/session', () => ({ getServerSession: () => mockGetServerSession() }))
jest.mock('@/lib/api/groups', () => ({ getGroupsByUser: (...a: unknown[]) => mockGetGroupsByUser(...a) }))
jest.mock('@/components/ui/GroupCard', () => ({
  GroupCard: ({ group }: { group: { name: string } }) => <div data-testid="group-card">{group.name}</div>,
}))

import DashboardPage from '@/app/(protected)/dashboard/page'

const session = { idUser: 'u1', username: 'u@test.com', token: 'tok' }

describe('DashboardPage', () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue(session)
    mockGetGroupsByUser.mockReset()
  })

  it('renders GroupCard for each group', async () => {
    mockGetGroupsByUser.mockResolvedValue([
      { id: 'g1', name: 'React', description: '', createdAt: '2026-01-01', memberships: [] },
      { id: 'g2', name: 'TypeScript', description: '', createdAt: '2026-01-02', memberships: [] },
    ])
    const jsx = await DashboardPage()
    render(jsx)
    expect(screen.getAllByTestId('group-card')).toHaveLength(2)
  })

  it('renders empty state when no groups', async () => {
    mockGetGroupsByUser.mockResolvedValue([])
    const jsx = await DashboardPage()
    render(jsx)
    expect(screen.getByText(/você ainda não pertence a nenhum grupo/i)).toBeInTheDocument()
  })

  it('renders Criar Grupo link', async () => {
    mockGetGroupsByUser.mockResolvedValue([])
    const jsx = await DashboardPage()
    render(jsx)
    expect(screen.getByRole('link', { name: /criar grupo/i })).toHaveAttribute('href', '/groups/create')
  })

  it('renders Entrar em Grupo link', async () => {
    mockGetGroupsByUser.mockResolvedValue([])
    const jsx = await DashboardPage()
    render(jsx)
    expect(screen.getByRole('link', { name: /entrar em grupo/i })).toHaveAttribute('href', '/groups/join')
  })
})
