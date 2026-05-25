import type { Metadata } from 'next'
import { getServerSession } from '@/lib/auth/session'
import { AuthContextProvider } from '@/contexts/AuthContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'StudyRats',
  description: 'Plataforma de grupos de estudo',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  const initialUser = session ? { idUser: session.idUser, username: session.username } : null

  return (
    <html lang="pt-BR">
      <body>
        <AuthContextProvider initialUser={initialUser}>{children}</AuthContextProvider>
      </body>
    </html>
  )
}
