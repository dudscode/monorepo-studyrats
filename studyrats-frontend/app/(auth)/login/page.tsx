import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth/session'
import { LoginForm } from '@/components/forms/LoginForm'

export default async function LoginPage() {
  const session = await getServerSession()
  if (session) redirect('/dashboard')
  return <LoginForm />
}
