import { getServerSession } from '@/lib/auth/session'
import { getRanking, getGroupById } from '@/lib/api/groups'
import { RankingTable } from '@/components/ui/RankingTable'

export default async function RankingPage({
  params,
}: {
  params: Promise<{ idGroup: string }>
}) {
  const { idGroup } = await params
  const session = await getServerSession()

  const [ranking, group] = await Promise.all([
    getRanking(idGroup, session!.token),
    getGroupById(session!.idUser, idGroup, session!.token),
  ])

  return (
    <main>
      <h1>{group.name}</h1>
      {ranking.length === 0 ? (
        <p>Nenhum check-in registrado neste grupo ainda.</p>
      ) : (
        <RankingTable entries={ranking} currentUserId={session!.idUser} />
      )}
    </main>
  )
}
