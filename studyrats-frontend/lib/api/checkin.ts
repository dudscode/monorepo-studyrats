import axios from 'axios'
import { unwrapCollection } from '@/lib/api/hateoas'
import type { Checkin, CheckinFormValues, HateoasCollection } from '@/types'

/* c8 ignore start */
const baseURL =
  typeof window === 'undefined'
    ? (process.env.API_BASE_URL ?? 'http://localhost:9090')
    : (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9090')
/* c8 ignore stop */

const checkinClient = axios.create({ baseURL })

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` })

export async function createCheckin(
  idUser: string,
  values: CheckinFormValues,
  token: string
): Promise<Checkin[]> {
  const form = new FormData()
  form.append('title', values.title)
  form.append('description', values.description)
  form.append('durationMinutes', String(Math.floor(values.durationMinutes)))
  if (values.image?.[0]) form.append('image', values.image[0])

  try {
    const res = await checkinClient.post<HateoasCollection<Checkin>>(`/checkin/${idUser}`, form, {
      headers: { ...authHeader(token) },
    })
    return unwrapCollection<Checkin>(res.data)
  } catch (err) {
    const status =
      err != null &&
      typeof err === 'object' &&
      'response' in err &&
      err.response != null &&
      typeof err.response === 'object' &&
      'status' in err.response
        ? (err.response as { status: number }).status
        : undefined
    if (status === 400) return []
    throw err
  }
}

export async function getCheckinsByUser(idUser: string, token: string): Promise<Checkin[]> {
  const res = await checkinClient.get<HateoasCollection<Checkin>>(`/checkin/user/${idUser}`, {
    headers: authHeader(token),
  })
  return unwrapCollection<Checkin>(res.data)
}
