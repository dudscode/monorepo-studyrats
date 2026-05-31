const mockGetServerSession = jest.fn()
const mockRedirect = jest.fn()

jest.mock('@/lib/auth/session', () => ({ getServerSession: () => mockGetServerSession() }))
jest.mock('next/navigation', () => ({ redirect: (path: string) => mockRedirect(path) }))

import RootPage from '@/app/page'

describe('RootPage', () => {
  beforeEach(() => {
    mockGetServerSession.mockReset()
    mockRedirect.mockReset()
  })

  it('redirects to /dashboard when session exists', async () => {
    mockGetServerSession.mockResolvedValue({ idUser: 'u1', username: 'u@test.com', token: 'tok' })
    await RootPage()
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
  })

  it('redirects to /login when no session', async () => {
    mockGetServerSession.mockResolvedValue(null)
    await RootPage()
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
