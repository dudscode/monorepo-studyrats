jest.mock('axios', () => {
  const instance = { post: jest.fn() }
  return {
    create: jest.fn(() => instance),
    __instance: instance,
  }
})

import axios from 'axios'
import { loginBackend, registerBackend } from '@/lib/api/auth'

const getInstance = () =>
  (axios as typeof axios & { __instance: { post: jest.Mock } }).__instance

const validRegisterPayload = {
  firstName: 'Ana',
  lastName: 'Silva',
  email: 'ana@test.com',
  password: 'pass123',
  birthday: '1995-06-01',
  role: 'ROLE_USER',
}

describe('loginBackend', () => {
  beforeEach(() => getInstance().post.mockReset())

  it('calls POST /users/login with correct body', async () => {
    getInstance().post.mockResolvedValue({
      data: { username: 'u@test.com', token: 'tok', idUser: 'u1' },
    })
    await loginBackend({ email: 'u@test.com', password: 'pass' })
    expect(getInstance().post).toHaveBeenCalledWith('/users/login', {
      email: 'u@test.com',
      password: 'pass',
    })
  })

  it('returns LoginResponse on success', async () => {
    getInstance().post.mockResolvedValue({
      data: { username: 'u@test.com', token: 'tok', idUser: 'u1' },
    })
    const result = await loginBackend({ email: 'u@test.com', password: 'pass' })
    expect(result).toEqual({ username: 'u@test.com', token: 'tok', idUser: 'u1' })
  })

  it('re-throws on 401', async () => {
    const err = { response: { status: 401 } }
    getInstance().post.mockRejectedValue(err)
    await expect(loginBackend({ email: 'u@test.com', password: 'wrong' })).rejects.toEqual(err)
  })
})

describe('registerBackend', () => {
  beforeEach(() => getInstance().post.mockReset())

  it('calls POST /users/create with pre-mapped payload', async () => {
    getInstance().post.mockResolvedValue({
      data: { name: 'Ana', email: 'ana@test.com', idUser: 'u2' },
    })
    await registerBackend(validRegisterPayload)
    expect(getInstance().post).toHaveBeenCalledWith('/users/create', validRegisterPayload)
  })

  it('returns RegisterResponse on success', async () => {
    getInstance().post.mockResolvedValue({
      data: { name: 'Ana', email: 'ana@test.com', idUser: 'u2' },
    })
    const result = await registerBackend(validRegisterPayload)
    expect(result).toEqual({ name: 'Ana', email: 'ana@test.com', idUser: 'u2' })
  })

  it('throws EMAIL_ALREADY_EXISTS on 409', async () => {
    getInstance().post.mockRejectedValue({ response: { status: 409 } })
    await expect(registerBackend(validRegisterPayload)).rejects.toThrow('EMAIL_ALREADY_EXISTS')
  })

  it('re-throws other errors unchanged', async () => {
    const err = { response: { status: 500 } }
    getInstance().post.mockRejectedValue(err)
    await expect(registerBackend(validRegisterPayload)).rejects.toEqual(err)
  })

  it('re-throws non-axios errors (no response property)', async () => {
    const err = new Error('network failure')
    getInstance().post.mockRejectedValue(err)
    await expect(registerBackend(validRegisterPayload)).rejects.toEqual(err)
  })
})
