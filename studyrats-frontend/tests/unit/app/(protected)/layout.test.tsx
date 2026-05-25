import React from 'react'
import { render, screen } from '@testing-library/react'

const mockGetServerSession = jest.fn()
const mockRedirect = jest.fn()

jest.mock('@/lib/auth/session', () => ({
  getServerSession: () => mockGetServerSession(),
}))

jest.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
}))

import ProtectedLayout from '@/app/(protected)/layout'

describe('ProtectedLayout', () => {
  beforeEach(() => {
    mockGetServerSession.mockReset()
    mockRedirect.mockReset()
  })

  it('calls redirect("/login") when session is null', async () => {
    mockGetServerSession.mockResolvedValue(null)
    await ProtectedLayout({ children: <span>child</span> })
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('renders children when session is present', async () => {
    mockGetServerSession.mockResolvedValue({
      idUser: 'u1',
      username: 'user@test.com',
      token: 'tok',
    })
    const result = await ProtectedLayout({ children: <span data-testid="inner">protected</span> })
    render(result as React.ReactElement)
    expect(screen.getByTestId('inner')).toBeInTheDocument()
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
