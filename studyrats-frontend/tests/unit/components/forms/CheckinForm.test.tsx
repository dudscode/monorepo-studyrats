import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockCreateCheckin = jest.fn()
jest.mock('@/lib/api/checkin', () => ({ createCheckin: (...a: unknown[]) => mockCreateCheckin(...a) }))

import { CheckinForm } from '@/components/forms/CheckinForm'

const props = { idUser: 'u1', token: 'tok' }

describe('CheckinForm', () => {
  beforeEach(() => mockCreateCheckin.mockReset())

  it('renders title, description, durationMinutes, image fields and submit button', () => {
    render(<CheckinForm {...props} />)
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/duração/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/imagem/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /registrar check-in/i })).toBeInTheDocument()
  })

  it('renders notice about check-in applying to all groups', () => {
    render(<CheckinForm {...props} />)
    expect(screen.getByText(/todos os seus grupos/i)).toBeInTheDocument()
  })

  it('shows success message with group count on non-empty result', async () => {
    mockCreateCheckin.mockResolvedValue([
      { id: 'c1', title: 'T', description: 'D', durationMinutes: 30, checkinDate: '2026-01-01' },
      { id: 'c2', title: 'T2', description: 'D2', durationMinutes: 30, checkinDate: '2026-01-01' },
    ])
    render(<CheckinForm {...props} />)
    await userEvent.type(screen.getByLabelText(/título/i), 'Estudei React')
    await userEvent.type(screen.getByLabelText(/descrição/i), 'Aprendi hooks')
    await userEvent.type(screen.getByLabelText(/duração/i), '60')
    await userEvent.click(screen.getByRole('button', { name: /registrar check-in/i }))
    await waitFor(() =>
      expect(screen.getByText(/check-in registrado em 2 grupos/i)).toBeInTheDocument()
    )
  })

  it('shows already done message when result is empty array', async () => {
    mockCreateCheckin.mockResolvedValue([])
    render(<CheckinForm {...props} />)
    await userEvent.type(screen.getByLabelText(/título/i), 'Estudei')
    await userEvent.type(screen.getByLabelText(/descrição/i), 'Feito')
    await userEvent.type(screen.getByLabelText(/duração/i), '30')
    await userEvent.click(screen.getByRole('button', { name: /registrar check-in/i }))
    await waitFor(() =>
      expect(screen.getByText(/você já fez check-in hoje|check-in já realizado/i)).toBeInTheDocument()
    )
  })

  it('shows error message on network error', async () => {
    mockCreateCheckin.mockRejectedValue(new Error('network'))
    render(<CheckinForm {...props} />)
    await userEvent.type(screen.getByLabelText(/título/i), 'Estudei')
    await userEvent.type(screen.getByLabelText(/descrição/i), 'Feito')
    await userEvent.type(screen.getByLabelText(/duração/i), '30')
    await userEvent.click(screen.getByRole('button', { name: /registrar check-in/i }))
    await waitFor(() =>
      expect(screen.getByText(/erro ao registrar check-in/i)).toBeInTheDocument()
    )
  })

  it('shows validation error when durationMinutes < 1', async () => {
    render(<CheckinForm {...props} />)
    await userEvent.type(screen.getByLabelText(/duração/i), '0')
    await userEvent.click(screen.getByRole('button', { name: /registrar check-in/i }))
    await waitFor(() =>
      expect(screen.getByText(/mínimo 1 minuto/i)).toBeInTheDocument()
    )
  })
})
