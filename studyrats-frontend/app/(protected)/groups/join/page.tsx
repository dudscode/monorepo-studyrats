import { getServerSession } from '@/lib/auth/session'
import { GroupJoinForm } from '@/components/forms/GroupJoinForm'

export default async function GroupJoinPage() {
  const session = await getServerSession()
  return <GroupJoinForm idUser={session!.idUser} token={session!.token} />
}
