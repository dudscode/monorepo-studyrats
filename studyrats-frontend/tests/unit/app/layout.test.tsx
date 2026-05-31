import React from 'react'
import { render, screen } from '@testing-library/react'
import type { UserIdentity } from '@/types'

const mockGetServerSession = jest.fn()
jest.mock('@/lib/auth/session', () => ({
  getServerSession: () => mockGetServerSession(),
}))

jest.mock('@/contexts/AuthContext', () => ({
  AuthContextProvider: ({
    initialUser,
    children,
  }: {
    initialUser: UserIdentity | null
    children: React.ReactNode
  }) => (
    <div data-testid="auth-provider" data-user={initialUser ? initialUser.username : 'null'}>
      {children}
    </div>
  ),
}))

import RootLayout from '@/app/layout'

describe('RootLayout', () => {
  it('renders AuthContextProvider with initialUser null when no session', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const jsx = await RootLayout({ children: <span>child</span> })
    render(jsx)
    expect(screen.getByTestId('auth-provider')).toHaveAttribute('data-user', 'null')
  })

  it('renders AuthContextProvider with UserIdentity when session present', async () => {
    mockGetServerSession.mockResolvedValue({
      idUser: 'u1',
      username: 'user@test.com',
      token: 'tok',
    })
    const jsx = await RootLayout({ children: <span>child</span> })
    render(jsx)
    expect(screen.getByTestId('auth-provider')).toHaveAttribute('data-user', 'user@test.com')
  })

  it('renders children inside AuthContextProvider', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const jsx = await RootLayout({ children: <span data-testid="inner">hello</span> })
    render(jsx)
    expect(screen.getByTestId('inner')).toBeInTheDocument()
  })
})
