jest.mock('next/server')

const mockLoginBackend = jest.fn()
jest.mock('@/lib/api/auth', () => ({ loginBackend: (...a: unknown[]) => mockLoginBackend(...a) }))

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'

const makeReq = (body: unknown) =>
  new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

const makeRawReq = (raw: string) =>
  new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    body: raw,
    headers: { 'Content-Type': 'application/json' },
  })

describe('POST /api/auth/login', () => {
  beforeEach(() => mockLoginBackend.mockReset())

  it('returns 400 on invalid JSON body', async () => {
    const res = await POST(makeRawReq('not-json') as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when email is missing', async () => {
    const res = await POST(makeReq({ password: '123456' }) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when password is missing', async () => {
    const res = await POST(makeReq({ email: 'u@test.com' }) as never)
    expect(res.status).toBe(400)
  })

  it('sets three cookies and returns idUser/username on success', async () => {
    mockLoginBackend.mockResolvedValue({ idUser: 'u1', username: 'u@test.com', token: 'tok' })
    const res = await POST(makeReq({ email: 'u@test.com', password: 'pass' }) as never)
    expect(res.status).toBe(200)

    const setCookies = res.headers.getSetCookie()
    expect(setCookies.some((c: string) => c.startsWith('studyrats_session='))).toBe(true)
    expect(setCookies.some((c: string) => c.startsWith('studyrats_token_pub='))).toBe(true)
    expect(setCookies.some((c: string) => c.startsWith('studyrats_user='))).toBe(true)

    const body = await res.json()
    expect(body).toEqual({ idUser: 'u1', username: 'u@test.com' })
  })

  it('returns 401 with error message on backend 401', async () => {
    mockLoginBackend.mockRejectedValue({ response: { status: 401 } })
    const res = await POST(makeReq({ email: 'u@test.com', password: 'wrong' }) as never)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  it('returns 500 on unexpected error', async () => {
    mockLoginBackend.mockRejectedValue(new Error('network'))
    const res = await POST(makeReq({ email: 'u@test.com', password: 'pass' }) as never)
    expect(res.status).toBe(500)
  })
})
