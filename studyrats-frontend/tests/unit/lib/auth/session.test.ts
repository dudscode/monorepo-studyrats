import { getServerSession } from '@/lib/auth/session'

const mockGet = jest.fn()

jest.mock('next/headers', () => ({
  cookies: () => ({ get: mockGet }),
}))

describe('getServerSession', () => {
  beforeEach(() => mockGet.mockReset())

  it('returns null when studyrats_session cookie is absent', async () => {
    mockGet.mockReturnValue(undefined)
    expect(await getServerSession()).toBeNull()
  })

  it('returns null when studyrats_user cookie is absent', async () => {
    mockGet.mockImplementation((name: string) => {
      if (name === 'studyrats_session') return { value: 'token-abc' }
      return undefined
    })
    expect(await getServerSession()).toBeNull()
  })

  it('returns null when studyrats_user contains malformed JSON', async () => {
    mockGet.mockImplementation((name: string) => {
      if (name === 'studyrats_session') return { value: 'token-abc' }
      if (name === 'studyrats_user') return { value: 'NOT_JSON' }
      return undefined
    })
    expect(await getServerSession()).toBeNull()
  })

  it('returns AuthSession when both cookies are valid', async () => {
    const userJson = JSON.stringify({ idUser: 'u1', username: 'user@test.com' })
    mockGet.mockImplementation((name: string) => {
      if (name === 'studyrats_session') return { value: 'token-abc' }
      if (name === 'studyrats_user') return { value: userJson }
      return undefined
    })
    const session = await getServerSession()
    expect(session).toEqual({
      token: 'token-abc',
      idUser: 'u1',
      username: 'user@test.com',
    })
  })
})
