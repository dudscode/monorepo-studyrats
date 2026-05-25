import type { RankingEntry } from '@/types'

export function RankingTable({
  entries,
  currentUserId,
}: {
  entries: RankingEntry[]
  currentUserId: string
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Nome</th>
          <th>Check-ins</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr
            key={entry.userId}
            className={entry.userId === currentUserId ? 'font-bold bg-yellow-50' : ''}
          >
            <td>{entry.position}</td>
            <td>{entry.firstName}</td>
            <td>{entry.totalCheckins}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
