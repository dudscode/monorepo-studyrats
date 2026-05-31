jest.mock('next/server')

import { POST } from '@/app/api/auth/logout/route'

describe('POST /api/auth/logout', () => {
  it('clears all three cookies with Max-Age=0', async () => {
    const res = await POST()
    const setCookies = res.headers.getSetCookie()
    expect(setCookies.some((c: string) => c.includes('studyrats_session='))).toBe(true)
    expect(setCookies.some((c: string) => c.includes('studyrats_token_pub='))).toBe(true)
    expect(setCookies.some((c: string) => c.includes('studyrats_user='))).toBe(true)
    const allExpired = setCookies.every((c: string) => c.includes('Max-Age=0'))
    expect(allExpired).toBe(true)
  })

  it('returns { ok: true } with status 200', async () => {
    const res = await POST()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true })
  })
})
