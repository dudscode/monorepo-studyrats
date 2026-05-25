import React from 'react'
import { render, screen } from '@testing-library/react'
import { GroupCard } from '@/components/ui/GroupCard'
import type { Group } from '@/types'

const baseGroup: Group = {
  id: 'g1',
  name: 'Estudo de React',
  description: 'Grupo para estudar React e Next.js',
  createdAt: '2026-01-15T10:00:00',
  memberships: [
    { id: 'm1', role: 'ADMIN', joinedAt: '2026-01-15T10:00:00', userId: 'u1', userFirstName: 'Ana' },
    { id: 'm2', role: 'MEMBER', joinedAt: '2026-01-16T10:00:00', userId: 'u2', userFirstName: 'Bob' },
  ],
}

describe('GroupCard', () => {
  it('renders group name as h3', () => {
    render(<GroupCard group={baseGroup} idUser="u1" />)
    expect(screen.getByRole('heading', { level: 3, name: 'Estudo de React' })).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<GroupCard group={baseGroup} idUser="u1" />)
    expect(screen.getByText('Grupo para estudar React e Next.js')).toBeInTheDocument()
  })

  it('truncates description longer than 100 chars', () => {
    const longDesc = 'A'.repeat(110)
    render(<GroupCard group={{ ...baseGroup, description: longDesc }} idUser="u1" />)
    expect(screen.getByText(`${'A'.repeat(100)}...`)).toBeInTheDocument()
  })

  it('renders member count as "N membros"', () => {
    render(<GroupCard group={baseGroup} idUser="u1" />)
    expect(screen.getByText(/2 membros/i)).toBeInTheDocument()
  })

  it('renders a link to /groups/{id}/ranking with text "Ver Ranking"', () => {
    render(<GroupCard group={baseGroup} idUser="u1" />)
    const link = screen.getByRole('link', { name: /ver ranking/i })
    expect(link).toHaveAttribute('href', '/groups/g1/ranking')
  })

  it('renders formatted createdAt date in pt-BR locale', () => {
    render(<GroupCard group={baseGroup} idUser="u1" />)
    // 2026-01-15 should format to 15/01/2026 in pt-BR
    expect(screen.getByText(/15\/01\/2026/)).toBeInTheDocument()
  })
})
