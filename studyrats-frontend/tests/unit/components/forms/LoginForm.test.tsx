import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

global.fetch = jest.fn()

import { LoginForm } from '@/components/forms/LoginForm'

describe('LoginForm', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockReset()
    mockPush.mockReset()
  })

  it('renders email field, password field, and submit button', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('password field has type="password"', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/senha/i)).toHaveAttribute('type', 'password')
  })

  it('includes a link to /register', () => {
    render(<LoginForm />)
    const link = screen.getByRole('link', { name: /cadastr/i })
    expect(link).toHaveAttribute('href', '/register')
  })

  it('redirects to /dashboard on successful login', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ idUser: 'u1', username: 'u@test.com' }),
    })
    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText(/email/i), 'u@test.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard'))
  })

  it('shows "Email ou senha inválidos" on 401', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Email ou senha inválidos' }),
    })
    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText(/email/i), 'u@test.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() =>
      expect(screen.getByText(/email ou senha inválidos/i)).toBeInTheDocument()
    )
  })

  it('shows generic error on non-401 server error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    })
    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText(/email/i), 'u@test.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'pass')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() =>
      expect(screen.getByText(/erro ao fazer login/i)).toBeInTheDocument()
    )
  })

  it('shows connection error on network failure', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('network'))
    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText(/email/i), 'u@test.com')
    await userEvent.type(screen.getByLabelText(/senha/i), 'pass')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() =>
      expect(screen.getByText(/erro de conexão|tente novamente/i)).toBeInTheDocument()
    )
  })
})
