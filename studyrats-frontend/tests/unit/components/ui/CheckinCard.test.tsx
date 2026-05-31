import React from 'react'
import { render, screen } from '@testing-library/react'
import { CheckinCard } from '@/components/ui/CheckinCard'
import type { Checkin } from '@/types'

const checkin: Checkin = {
  id: 'c1',
  title: 'Estudei React',
  description: 'Aprendi hooks avançados',
  durationMinutes: 90,
  checkinDate: '2026-01-15T14:30:00',
}

describe('CheckinCard', () => {
  it('renders title as h4', () => {
    render(<CheckinCard checkin={checkin} />)
    expect(screen.getByRole('heading', { level: 4, name: 'Estudei React' })).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<CheckinCard checkin={checkin} />)
    expect(screen.getByText('Aprendi hooks avançados')).toBeInTheDocument()
  })

  it('renders duration as "90 min"', () => {
    render(<CheckinCard checkin={checkin} />)
    expect(screen.getByText(/90 min/)).toBeInTheDocument()
  })

  it('renders formatted checkinDate in pt-BR locale', () => {
    render(<CheckinCard checkin={checkin} />)
    // 2026-01-15 14:30 should format to something like 15/01/2026
    expect(screen.getByText(/15\/01\/2026/)).toBeInTheDocument()
  })
})
