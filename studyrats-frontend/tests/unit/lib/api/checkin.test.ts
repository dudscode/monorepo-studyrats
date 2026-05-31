jest.mock('axios', () => {
  const instance = { get: jest.fn(), post: jest.fn() }
  return { create: jest.fn(() => instance), __instance: instance }
})
jest.mock('@/lib/api/hateoas', () => ({
  unwrapCollection: jest.fn((data: unknown) => (data as Record<string, Record<string, unknown[]>>)?._embedded?.checkinList ?? []),
}))

import axios from 'axios'
import { createCheckin, getCheckinsByUser } from '@/lib/api/checkin'
import type { CheckinFormValues } from '@/types'

const getInst = () => (axios as typeof axios & { __instance: { get: jest.Mock; post: jest.Mock } }).__instance

const token = 'tok'
const idUser = 'u1'
const values: CheckinFormValues = {
  title: 'Estudei React',
  description: 'Aprendi hooks',
  durationMinutes: 60,
}

describe('createCheckin', () => {
  beforeEach(() => getInst().post.mockReset())

  it('calls POST /checkin/{idUser} with Authorization header', async () => {
    getInst().post.mockResolvedValue({ status: 201, data: { _embedded: { checkinList: [] } } })
    await createCheckin(idUser, values, token)
    expect(getInst().post).toHaveBeenCalledWith(
      `/checkin/${idUser}`,
      expect.any(FormData),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${token}` }) })
    )
  })

  it('builds FormData with title, description, durationMinutes', async () => {
    getInst().post.mockResolvedValue({ status: 201, data: { _embedded: { checkinList: [] } } })
    await createCheckin(idUser, values, token)
    const formData = getInst().post.mock.calls[0][1] as FormData
    expect(formData.get('title')).toBe('Estudei React')
    expect(formData.get('description')).toBe('Aprendi hooks')
    expect(formData.get('durationMinutes')).toBe('60')
  })

  it('appends image to FormData when image is provided', async () => {
    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    const valuesWithImage = { ...values, image: [mockFile] as unknown as FileList }
    getInst().post.mockResolvedValue({ status: 201, data: { _embedded: { checkinList: [] } } })
    await createCheckin(idUser, valuesWithImage, token)
    const formData = getInst().post.mock.calls[0][1] as FormData
    expect(formData.get('image')).toBe(mockFile)
  })

  it('returns unwrapped Checkin[] on 201', async () => {
    const checkins = [{ id: 'c1', title: 'Estudei React', description: 'Aprendi hooks', durationMinutes: 60, checkinDate: '2026-01-01T10:00:00' }]
    getInst().post.mockResolvedValue({ status: 201, data: { _embedded: { checkinList: checkins } } })
    const result = await createCheckin(idUser, values, token)
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns [] on 400 (already done today)', async () => {
    const err = { response: { status: 400 } }
    getInst().post.mockRejectedValue(err)
    const result = await createCheckin(idUser, values, token)
    expect(result).toEqual([])
  })

  it('re-throws non-400 errors', async () => {
    const err = { response: { status: 500 } }
    getInst().post.mockRejectedValue(err)
    await expect(createCheckin(idUser, values, token)).rejects.toEqual(err)
  })

  it('re-throws errors without response property', async () => {
    const err = new Error('network failure')
    getInst().post.mockRejectedValue(err)
    await expect(createCheckin(idUser, values, token)).rejects.toEqual(err)
  })
})

describe('getCheckinsByUser', () => {
  beforeEach(() => getInst().get.mockReset())

  it('calls GET /checkin/user/{idUser} with Authorization header', async () => {
    getInst().get.mockResolvedValue({ data: { _embedded: { checkinList: [] } } })
    await getCheckinsByUser(idUser, token)
    expect(getInst().get).toHaveBeenCalledWith(
      `/checkin/user/${idUser}`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: `Bearer ${token}` }) })
    )
  })

  it('returns [] when collection is empty', async () => {
    getInst().get.mockResolvedValue({ data: {} })
    const result = await getCheckinsByUser(idUser, token)
    expect(result).toEqual([])
  })
})
