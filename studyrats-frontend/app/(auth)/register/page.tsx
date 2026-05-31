import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth/session'
import { RegisterForm } from '@/components/forms/RegisterForm'

export default async function RegisterPage() {
  const session = await getServerSession()
  if (session) redirect('/dashboard')
  return <RegisterForm />
}
