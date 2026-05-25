import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthContextProvider, useAuth } from '@/contexts/AuthContext'
import type { UserIdentity } from '@/types'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

global.fetch = jest.fn()

describe('useAuth', () => {
  it('throws when used outside AuthContextProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    const BadComponent = () => {
      useAuth()
      return null
    }
    expect(() => render(<BadComponent />)).toThrow()
    consoleError.mockRestore()
  })
})

describe('AuthContextProvider', () => {
  const user: UserIdentity = { idUser: 'u1', username: 'test@test.com' }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders children with initialUser', () => {
    const Child = () => {
      const { currentUser } = useAuth()
      return <span data-testid="user">{currentUser?.username ?? 'none'}</span>
    }
    render(
      <AuthContextProvider initialUser={user}>
        <Child />
      </AuthContextProvider>
    )
    expect(screen.getByTestId('user').textContent).toBe('test@test.com')
  })

  it('renders with null when no initialUser', () => {
    const Child = () => {
      const { currentUser } = useAuth()
      return <span data-testid="user">{currentUser?.username ?? 'none'}</span>
    }
    render(
      <AuthContextProvider initialUser={null}>
        <Child />
      </AuthContextProvider>
    )
    expect(screen.getByTestId('user').textContent).toBe('none')
  })

  it('logout calls POST /api/auth/logout, clears user, and redirects to /login', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: true })

    const Child = () => {
      const { logout } = useAuth()
      return <button onClick={logout}>Logout</button>
    }
    render(
      <AuthContextProvider initialUser={user}>
        <Child />
      </AuthContextProvider>
    )

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Logout' }))
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
