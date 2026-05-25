import type { Checkin } from '@/types'

export function CheckinCard({ checkin }: { checkin: Checkin }) {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(checkin.checkinDate))

  return (
    <div>
      <h4>{checkin.title}</h4>
      <p>{checkin.description}</p>
      <span>{checkin.durationMinutes} min</span>
      <span>{formattedDate}</span>
    </div>
  )
}
