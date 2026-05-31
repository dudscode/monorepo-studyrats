import { getServerSession } from '@/lib/auth/session'
import { CheckinForm } from '@/components/forms/CheckinForm'

export default async function CheckinPage() {
  const session = await getServerSession()
  return <CheckinForm idUser={session!.idUser} token={session!.token} />
}
