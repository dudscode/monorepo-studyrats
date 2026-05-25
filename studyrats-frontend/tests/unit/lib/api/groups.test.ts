jest.mock('axios', () => {
  const instance = { get: jest.fn(), post: jest.fn() }
  return { create: jest.fn(() => instance), __instance: instance }
})
jest.mock('@/lib/api/hateoas', () => ({
  unwrapEntity: jest.fn((data: unknown) => data),
  unwrapCollection: jest.fn((data: unknown) => (Array.isArray(data) ? data : [])),
  addPosition: jest.fn((arr: unknown[]) => arr.map((e, i) => ({ ...(e as object), position: i + 1 }))),
}))

import axios from 'axios'
import { getGroupsByUser, getGroupById, getRanking, createGroup, joinGroup } from '@/lib/api/groups'

const getInst = () => (axios as typeof axios & { __instance: { get: jest.Mock; post: jest.Mock } }).__instance

const token = 'tok-abc'
const idUser = 'u1'
const idGroup = 'g1'

describe('getGroupsByUser', () => {
  beforeEach(() => getInst().get.mockReset())

  it('calls GET /groups/user/{idUser} with Authorization header', async () => {
    getInst().get.mockResolvedValue({ data: { _embedded: { groupList: [] } } })
    await getGroupsByUser(idUser, token)
    expect(getInst().get).toHaveBeenCalledWith(
      `/groups/user/${idUser}`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${token}` }) })
    )
  })

  it('returns unwrapped Group[] from collection', async () => {
    const groups = [{ id: 'g1', name: 'G1' }]
    getInst().get.mockResolvedValue({ data: { _embedded: { groupList: groups } } })
    const result = await getGroupsByUser(idUser, token)
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('getGroupById', () => {
  beforeEach(() => getInst().get.mockReset())

  it('calls GET /groups/{idUser}/{idGroup} with Authorization header', async () => {
    getInst().get.mockResolvedValue({ data: { id: idGroup, name: 'G1' } })
    await getGroupById(idUser, idGroup, token)
    expect(getInst().get).toHaveBeenCalledWith(
      `/groups/${idUser}/${idGroup}`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${token}` }) })
    )
  })

  it('returns unwrapped Group entity', async () => {
    getInst().get.mockResolvedValue({ data: { id: idGroup, name: 'G1' } })
    const result = await getGroupById(idUser, idGroup, token)
    expect(result).toMatchObject({ id: idGroup })
  })
})

describe('getRanking', () => {
  beforeEach(() => getInst().get.mockReset())

  it('calls GET /groups/ranking/{idGroup} with Authorization header', async () => {
    getInst().get.mockResolvedValue({ data: { _embedded: { rankingList: [] } } })
    await getRanking(idGroup, token)
    expect(getInst().get).toHaveBeenCalledWith(
      `/groups/ranking/${idGroup}`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${token}` }) })
    )
  })

  it('returns entries with position starting at 1', async () => {
    const entries = [
      { userId: 'u1', firstName: 'Ana', totalCheckins: 10 },
      { userId: 'u2', firstName: 'Bob', totalCheckins: 5 },
    ]
    getInst().get.mockResolvedValue({ data: { _embedded: { rankingList: entries } } })
    const result = await getRanking(idGroup, token)
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('createGroup', () => {
  beforeEach(() => getInst().post.mockReset())

  it('calls POST /groups/create/{idUser} with Authorization and JSON body', async () => {
    getInst().post.mockResolvedValue({ data: { id: 'g2', name: 'New Group' } })
    await createGroup(idUser, { name: 'New Group' }, token)
    expect(getInst().post).toHaveBeenCalledWith(
      `/groups/create/${idUser}`,
      { name: 'New Group' },
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${token}` }) })
    )
  })

  it('returns unwrapped Group entity', async () => {
    getInst().post.mockResolvedValue({ data: { id: 'g2', name: 'New Group' } })
    const result = await createGroup(idUser, { name: 'New Group' }, token)
    expect(result).toMatchObject({ id: 'g2' })
  })
})

describe('joinGroup', () => {
  beforeEach(() => getInst().post.mockReset())

  it('calls POST /groupmember/join/{idUser}/{idGroup} with Authorization', async () => {
    getInst().post.mockResolvedValue({ data: { id: idGroup } })
    await joinGroup(idUser, idGroup, token)
    expect(getInst().post).toHaveBeenCalledWith(
      `/groupmember/join/${idUser}/${idGroup}`,
      {},
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${token}` }) })
    )
  })

  it('throws GROUP_NOT_FOUND on 409', async () => {
    getInst().post.mockRejectedValue({ response: { status: 409 } })
    await expect(joinGroup(idUser, idGroup, token)).rejects.toThrow('GROUP_NOT_FOUND')
  })

  it('re-throws non-409 errors unchanged', async () => {
    const err = { response: { status: 500 } }
    getInst().post.mockRejectedValue(err)
    await expect(joinGroup(idUser, idGroup, token)).rejects.toEqual(err)
  })

  it('re-throws errors without response property', async () => {
    const err = new Error('network failure')
    getInst().post.mockRejectedValue(err)
    await expect(joinGroup(idUser, idGroup, token)).rejects.toEqual(err)
  })
})
