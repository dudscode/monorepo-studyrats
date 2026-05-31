import { getServerSession } from '@/lib/auth/session'
import { getCheckinsByUser } from '@/lib/api/checkin'
import { CheckinCard } from '@/components/ui/CheckinCard'
import type { Checkin } from '@/types'

export default async function CheckinsPage() {
  const session = await getServerSession()

  let checkins: Checkin[] = []
  let error = false
  try {
    checkins = await getCheckinsByUser(session!.idUser, session!.token)
  } catch {
    error = true
  }

  if (error) {
    return <p>Histórico de check-ins em breve.</p>
  }

  return (
    <main>
      <h1>Histórico de Check-ins</h1>
      {checkins.length === 0 ? (
        <p>Nenhum check-in registrado ainda.</p>
      ) : (
        <ul>
          {checkins.map((checkin) => (
            <li key={checkin.id}>
              <CheckinCard checkin={checkin} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
