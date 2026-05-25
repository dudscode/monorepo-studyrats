import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

global.fetch = jest.fn()

import { RegisterForm } from '@/components/forms/RegisterForm'

describe('RegisterForm', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockReset()
    mockPush.mockReset()
  })

  it('renders all 5 fields and submit button', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Sobrenome')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data de nascimento/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument()
  })

  it('password field has type="password"', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText(/senha/i)).toHaveAttribute('type', 'password')
  })

  it('includes a link to /login', () => {
    render(<RegisterForm />)
    const link = screen.getByRole('link', { name: /entrar|login/i })
    expect(link).toHaveAttribute('href', '/login')
  })

  it('redirects to /login?registered=true on success (201)', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ name: 'Ana', email: 'ana@test.com', idUser: 'u2' }),
    })
    render(<RegisterForm />)

    const today = new Date()
    const pastDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate())
    const dateStr = pastDate.toISOString().split('T')[0]

    await userEvent.type(screen.getByLabelText('Nome'), 'Ana')
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'Silva')
    await userEvent.type(screen.getByLabelText(/email/i), 'ana@test.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'pass123')
    await userEvent.type(screen.getByLabelText(/data de nascimento/i), dateStr)
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }))

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/login?registered=true')
    )
  })

  it('shows "Este email já está cadastrado" on 409', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: 'EMAIL_ALREADY_EXISTS' }),
    })
    render(<RegisterForm />)

    const today = new Date()
    const pastDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate())
    const dateStr = pastDate.toISOString().split('T')[0]

    await userEvent.type(screen.getByLabelText('Nome'), 'Ana')
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'Silva')
    await userEvent.type(screen.getByLabelText(/email/i), 'existing@test.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'pass123')
    await userEvent.type(screen.getByLabelText(/data de nascimento/i), dateStr)
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }))

    await waitFor(() =>
      expect(screen.getByText(/este email já está cadastrado/i)).toBeInTheDocument()
    )
  })

  it('shows generic error on non-409 server error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    })
    render(<RegisterForm />)
    const today = new Date()
    const pastDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate())
    const dateStr = pastDate.toISOString().split('T')[0]
    await userEvent.type(screen.getByLabelText('Nome'), 'Ana')
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'Silva')
    await userEvent.type(screen.getByLabelText(/email/i), 'a@test.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'pass123')
    await userEvent.type(screen.getByLabelText(/data de nascimento/i), dateStr)
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }))
    await waitFor(() =>
      expect(screen.getByText(/erro ao cadastrar/i)).toBeInTheDocument()
    )
  })

  it('shows connection error on network failure', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('network'))
    render(<RegisterForm />)
    const today = new Date()
    const pastDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate())
    const dateStr = pastDate.toISOString().split('T')[0]
    await userEvent.type(screen.getByLabelText('Nome'), 'Ana')
    await userEvent.type(screen.getByLabelText('Sobrenome'), 'Silva')
    await userEvent.type(screen.getByLabelText(/email/i), 'a@test.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'pass123')
    await userEvent.type(screen.getByLabelText(/data de nascimento/i), dateStr)
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }))
    await waitFor(() =>
      expect(screen.getByText(/erro de conexão/i)).toBeInTheDocument()
    )
  })

  it('shows validation error for password shorter than 6 chars', async () => {
    render(<RegisterForm />)
    await userEvent.type(screen.getByLabelText(/senha/i), '123')
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }))
    await waitFor(() =>
      expect(screen.getByText(/mínimo 6 caracteres/i)).toBeInTheDocument()
    )
  })

  it('shows validation error for today or future birthDate', async () => {
    render(<RegisterForm />)
    const today = new Date().toISOString().split('T')[0]
    await userEvent.type(screen.getByLabelText(/data de nascimento/i), today)
    await userEvent.click(screen.getByRole('button', { name: /cadastrar/i }))
    await waitFor(() =>
      expect(screen.getByText(/data de nascimento deve ser/i)).toBeInTheDocument()
    )
  })
})
