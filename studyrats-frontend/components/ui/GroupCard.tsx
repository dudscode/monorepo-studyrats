import Link from 'next/link'
import type { Group } from '@/types'

export function GroupCard({ group, idUser: _idUser }: { group: Group; idUser: string }) {
  const description =
    group.description.length > 100
      ? group.description.slice(0, 100) + '...'
      : group.description

  const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(
    new Date(group.createdAt)
  )

  return (
    <div>
      <h3>{group.name}</h3>
      <p>{description}</p>
      <span>{group.memberships.length} membros</span>
      <span>{formattedDate}</span>
      <Link href={`/groups/${group.id}/ranking`}>Ver Ranking</Link>
    </div>
  )
}
