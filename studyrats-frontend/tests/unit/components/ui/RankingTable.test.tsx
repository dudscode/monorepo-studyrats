import React from 'react'
import { render, screen } from '@testing-library/react'
import { RankingTable } from '@/components/ui/RankingTable'
import type { RankingEntry } from '@/types'

const entries: RankingEntry[] = [
  { userId: 'u1', firstName: 'Ana', totalCheckins: 10, position: 1 },
  { userId: 'u2', firstName: 'Bob', totalCheckins: 5, position: 2 },
]

describe('RankingTable', () => {
  it('renders columns #, Nome, Check-ins', () => {
    render(<RankingTable entries={entries} currentUserId="u1" />)
    expect(screen.getByText('#')).toBeInTheDocument()
    expect(screen.getByText('Nome')).toBeInTheDocument()
    expect(screen.getByText('Check-ins')).toBeInTheDocument()
  })

  it('renders entries in received order', () => {
    render(<RankingTable entries={entries} currentUserId="u1" />)
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Ana')
    expect(rows[2]).toHaveTextContent('Bob')
  })

  it('highlights current user row with font-bold and bg-yellow-50', () => {
    render(<RankingTable entries={entries} currentUserId="u1" />)
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveClass('font-bold')
    expect(rows[1]).toHaveClass('bg-yellow-50')
  })

  it('does not highlight non-current-user rows', () => {
    render(<RankingTable entries={entries} currentUserId="u1" />)
    const rows = screen.getAllByRole('row')
    expect(rows[2]).not.toHaveClass('font-bold')
  })
})
