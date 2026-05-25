import axios from 'axios'
import { unwrapEntity, unwrapCollection, addPosition } from '@/lib/api/hateoas'
import type { Group, GroupCreateRequest, HateoasEntity, HateoasCollection, RankingEntry } from '@/types'

/* c8 ignore start */
const baseURL =
  typeof window === 'undefined'
    ? (process.env.API_BASE_URL ?? 'http://localhost:9090')
    : (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9090')
/* c8 ignore stop */

const groupsClient = axios.create({ baseURL, headers: { Accept: 'application/hal+json' } })

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` })

export async function getGroupsByUser(idUser: string, token: string): Promise<Group[]> {
  const res = await groupsClient.get<HateoasCollection<Group>>(`/groups/user/${idUser}`, {
    headers: authHeader(token),
  })
  return unwrapCollection<Group>(res.data)
}

export async function getGroupById(idUser: string, idGroup: string, token: string): Promise<Group> {
  const res = await groupsClient.get<HateoasEntity<Group>>(`/groups/${idUser}/${idGroup}`, {
    headers: authHeader(token),
  })
  return unwrapEntity<Group>(res.data)
}

export async function getRanking(idGroup: string, token: string): Promise<RankingEntry[]> {
  const res = await groupsClient.get<HateoasCollection<Omit<RankingEntry, 'position'>>>(
    `/groups/ranking/${idGroup}`,
    { headers: authHeader(token) }
  )
  return addPosition(unwrapCollection<Omit<RankingEntry, 'position'>>(res.data))
}

export async function createGroup(
  idUser: string,
  request: GroupCreateRequest,
  token: string
): Promise<Group> {
  const res = await groupsClient.post<HateoasEntity<Group>>(`/groups/create/${idUser}`, request, {
    headers: { ...authHeader(token), 'Content-Type': 'application/json' },
  })
  return unwrapEntity<Group>(res.data)
}

export async function joinGroup(idUser: string, idGroup: string, token: string): Promise<Group> {
  try {
    const res = await groupsClient.post<HateoasEntity<Group>>(
      `/groupmember/join/${idUser}/${idGroup}`,
      {},
      { headers: authHeader(token) }
    )
    return unwrapEntity<Group>(res.data)
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
    if (status === 409) throw new Error('GROUP_NOT_FOUND')
    throw err
  }
}
