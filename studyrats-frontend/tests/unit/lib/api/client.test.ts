import Cookies from 'js-cookie'
import axios from 'axios'

jest.mock('js-cookie', () => ({ get: jest.fn() }))
jest.mock('axios', () => {
  const requestUseMock = jest.fn()
  const responseUseMock = jest.fn()
  const instance = {
    interceptors: {
      request: { use: requestUseMock },
      response: { use: responseUseMock },
    },
  }
  return {
    create: jest.fn(() => instance),
    __instance: instance,
  }
})

import '@/lib/api/client'

const axiosMock = axios as typeof axios & {
  __instance: {
    interceptors: {
      request: { use: jest.Mock }
      response: { use: jest.Mock }
    }
  }
}

describe('lib/api/client', () => {
  const getInstance = () => axiosMock.__instance

  it('creates an axios instance with a non-empty baseURL', () => {
    const calls = (axios.create as jest.Mock).mock.calls
    expect(calls.length).toBeGreaterThan(0)
    const cfg = calls[0][0] as Record<string, unknown>
    expect(typeof cfg.baseURL).toBe('string')
    expect((cfg.baseURL as string).length).toBeGreaterThan(0)
  })

  it('includes Accept: application/hal+json in default headers', () => {
    const cfg = (axios.create as jest.Mock).mock.calls[0][0] as Record<string, unknown>
    expect(cfg.headers).toMatchObject({ Accept: 'application/hal+json' })
  })

  it('registers a request interceptor', () => {
    expect(getInstance().interceptors.request.use).toHaveBeenCalled()
  })

  it('registers a response interceptor', () => {
    expect(getInstance().interceptors.response.use).toHaveBeenCalled()
  })

  it('request interceptor attaches Authorization when token cookie present', () => {
    ;(Cookies.get as jest.Mock).mockReturnValue('my-jwt-token')
    const [handler] = getInstance().interceptors.request.use.mock.calls[0] as [
      (c: { headers: Record<string, string> }) => { headers: Record<string, string> },
    ]
    const result = handler({ headers: {} })
    expect(result.headers['Authorization']).toBe('Bearer my-jwt-token')
  })

  it('request interceptor creates headers object when headers is undefined', () => {
    ;(Cookies.get as jest.Mock).mockReturnValue('my-jwt-token')
    const [handler] = getInstance().interceptors.request.use.mock.calls[0] as [
      (c: Record<string, unknown>) => Record<string, unknown>,
    ]
    const result = handler({}) as { headers: Record<string, string> }
    expect(result.headers['Authorization']).toBe('Bearer my-jwt-token')
  })

  it('request interceptor omits Authorization when cookie absent', () => {
    ;(Cookies.get as jest.Mock).mockReturnValue(undefined)
    const [handler] = getInstance().interceptors.request.use.mock.calls[0] as [
      (c: { headers: Record<string, string> }) => { headers: Record<string, string> },
    ]
    const result = handler({ headers: {} })
    expect(result.headers['Authorization']).toBeUndefined()
  })

  it('response success interceptor passes through the response', () => {
    const [successHandler] = getInstance().interceptors.response.use.mock.calls[0] as [
      (r: { data: string }) => { data: string },
      unknown,
    ]
    const response = { data: 'ok' }
    expect(successHandler(response)).toBe(response)
  })

  it('response error interceptor rejects the original error', async () => {
    const [, errHandler] = getInstance().interceptors.response.use.mock.calls[0] as [
      unknown,
      (e: unknown) => Promise<unknown>,
    ]
    const err = { response: { status: 401 } }
    await expect(errHandler(err)).rejects.toEqual(err)
  })

  it('response error interceptor rejects errors without response property', async () => {
    const [, errHandler] = getInstance().interceptors.response.use.mock.calls[0] as [
      unknown,
      (e: unknown) => Promise<unknown>,
    ]
    const err = new Error('network failure')
    await expect(errHandler(err)).rejects.toEqual(err)
  })
})
