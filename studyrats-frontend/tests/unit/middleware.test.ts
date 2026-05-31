const mockNext = jest.fn(() => ({ type: 'next' }))
const mockRedirect = jest.fn((url: URL | string) => ({ type: 'redirect', url: url.toString() }))

jest.mock('next/server', () => ({
  NextRequest: class {
    nextUrl: URL
    url: string
    cookies = { get: jest.fn() }
    constructor(url: string) {
      this.url = url
      this.nextUrl = new URL(url)
    }
  },
  NextResponse: {
    next: () => mockNext(),
    redirect: (url: URL | string) => mockRedirect(url),
  },
}))

import { middleware } from '@/middleware'

type MockRequest = {
  nextUrl: URL
  url: string
  cookies: { get: jest.Mock }
}

const makeRequest = (pathname: string, withCookie = false): MockRequest => {
  const url = `http://localhost:3000${pathname}`
  const req = {
    url,
    nextUrl: new URL(url),
    cookies: {
      get: (name: string) =>
        withCookie && name === 'studyrats_session' ? { value: 'token' } : undefined,
    },
  }
  return req as MockRequest
}

describe('middleware', () => {
  beforeEach(() => {
    mockNext.mockClear()
    mockRedirect.mockClear()
  })

  it('redirects unauthenticated request to /dashboard to /login', () => {
    middleware(makeRequest('/dashboard', false) as never)
    expect(mockRedirect).toHaveBeenCalledTimes(1)
    expect(mockRedirect.mock.calls[0][0].toString()).toContain('/login')
  })

  it('calls NextResponse.next() for authenticated request to /dashboard', () => {
    middleware(makeRequest('/dashboard', true) as never)
    expect(mockNext).toHaveBeenCalled()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('allows unauthenticated access to /login (public path)', () => {
    middleware(makeRequest('/login', false) as never)
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('allows unauthenticated access to /register (public path)', () => {
    middleware(makeRequest('/register', false) as never)
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
