jest.mock('next/server')

const mockRegisterBackend = jest.fn()
jest.mock('@/lib/api/auth', () => ({
  registerBackend: (...a: unknown[]) => mockRegisterBackend(...a),
}))

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/register/route'

const makeReq = (body: unknown) =>
  new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

const makeRawReq = (raw: string) =>
  new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    body: raw,
    headers: { 'Content-Type': 'application/json' },
  })

const validBody = {
  firstName: 'Ana',
  lastName: 'Silva',
  email: 'ana@test.com',
  password: 'pass123',
  birthDate: '1995-06-01',
}

describe('POST /api/auth/register', () => {
  beforeEach(() => mockRegisterBackend.mockReset())

  it('returns 400 on invalid JSON body', async () => {
    const res = await POST(makeRawReq('not-json') as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when firstName is missing', async () => {
    const { firstName: _, ...body } = validBody
    const res = await POST(makeReq(body) as never)
    expect(res.status).toBe(400)
  })

  it('returns 400 when email is missing', async () => {
    const { email: _, ...body } = validBody
    const res = await POST(makeReq(body) as never)
    expect(res.status).toBe(400)
  })

  it('calls registerBackend with birthday (remapped) and role=ROLE_USER', async () => {
    mockRegisterBackend.mockResolvedValue({ name: 'Ana', email: 'ana@test.com', idUser: 'u2' })
    await POST(makeReq(validBody) as never)
    expect(mockRegisterBackend).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Ana',
        birthday: '1995-06-01',
        role: 'ROLE_USER',
      })
    )
  })

  it('returns 201 on success', async () => {
    mockRegisterBackend.mockResolvedValue({ name: 'Ana', email: 'ana@test.com', idUser: 'u2' })
    const res = await POST(makeReq(validBody) as never)
    expect(res.status).toBe(201)
  })

  it('returns 409 when EMAIL_ALREADY_EXISTS', async () => {
    mockRegisterBackend.mockRejectedValue(new Error('EMAIL_ALREADY_EXISTS'))
    const res = await POST(makeReq(validBody) as never)
    expect(res.status).toBe(409)
  })

  it('returns 500 on unexpected error', async () => {
    mockRegisterBackend.mockRejectedValue(new Error('network'))
    const res = await POST(makeReq(validBody) as never)
    expect(res.status).toBe(500)
  })
})
