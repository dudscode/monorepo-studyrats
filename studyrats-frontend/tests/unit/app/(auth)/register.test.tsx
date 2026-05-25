import React from 'react'
import { render, screen } from '@testing-library/react'

const mockGetServerSession = jest.fn()
const mockRedirect = jest.fn()

jest.mock('@/lib/auth/session', () => ({ getServerSession: () => mockGetServerSession() }))
jest.mock('next/navigation', () => ({ redirect: (path: string) => mockRedirect(path) }))
jest.mock('@/components/forms/RegisterForm', () => ({
  RegisterForm: () => <div data-testid="register-form" />,
}))

import RegisterPage from '@/app/(auth)/register/page'

describe('RegisterPage', () => {
  beforeEach(() => {
    mockGetServerSession.mockReset()
    mockRedirect.mockReset()
  })

  it('redirects to /dashboard when session exists', async () => {
    mockGetServerSession.mockResolvedValue({ idUser: 'u1', username: 'u@test.com', token: 'tok' })
    await RegisterPage()
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('renders RegisterForm when no session', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const result = await RegisterPage()
    render(result as React.ReactElement)
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
