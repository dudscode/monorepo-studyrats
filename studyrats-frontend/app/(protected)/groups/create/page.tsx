import { getServerSession } from '@/lib/auth/session'
import { GroupCreateForm } from '@/components/forms/GroupCreateForm'

export default async function GroupCreatePage() {
  const session = await getServerSession()
  return <GroupCreateForm idUser={session!.idUser} token={session!.token} />
}
