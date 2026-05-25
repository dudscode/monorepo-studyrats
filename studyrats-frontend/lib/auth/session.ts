import { cookies } from 'next/headers'
import type { AuthSession, UserIdentity } from '@/types'

export async function getServerSession(): Promise<AuthSession | null> {
  const store = await cookies()
  const sessionCookie = store.get('studyrats_session')
  if (!sessionCookie?.value) return null

  const userCookie = store.get('studyrats_user')
  if (!userCookie?.value) return null

  let identity: UserIdentity
  try {
    identity = JSON.parse(userCookie.value) as UserIdentity
  } catch {
    return null
  }

  return {
    token: sessionCookie.value,
    idUser: identity.idUser,
    username: identity.username,
  }
}
