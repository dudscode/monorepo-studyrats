import Link from 'next/link'
import { getServerSession } from '@/lib/auth/session'
import { getGroupsByUser } from '@/lib/api/groups'
import { GroupCard } from '@/components/ui/GroupCard'

export default async function DashboardPage() {
  const session = await getServerSession()
  const groups = await getGroupsByUser(session!.idUser, session!.token)

  return (
    <main>
      <div>
        <Link href="/groups/create">Criar Grupo</Link>
        <Link href="/groups/join">Entrar em Grupo</Link>
      </div>
      {groups.length === 0 ? (
        <p>Você ainda não pertence a nenhum grupo.</p>
      ) : (
        <ul>
          {groups.map((group) => (
            <li key={group.id}>
              <GroupCard group={group} idUser={session!.idUser} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
