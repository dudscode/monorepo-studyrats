import React from 'react'
import { render, screen } from '@testing-library/react'

const mockGetServerSession = jest.fn()
const mockRedirect = jest.fn()

jest.mock('@/lib/auth/session', () => ({ getServerSession: () => mockGetServerSession() }))
jest.mock('next/navigation', () => ({ redirect: (path: string) => mockRedirect(path) }))
jest.mock('@/components/forms/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form" />,
}))

import LoginPage from '@/app/(auth)/login/page'

describe('LoginPage', () => {
  beforeEach(() => {
    mockGetServerSession.mockReset()
    mockRedirect.mockReset()
  })

  it('redirects to /dashboard when session exists', async () => {
    mockGetServerSession.mockResolvedValue({ idUser: 'u1', username: 'u@test.com', token: 'tok' })
    await LoginPage()
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('renders LoginForm when no session', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const result = await LoginPage()
    render(result as React.ReactElement)
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
