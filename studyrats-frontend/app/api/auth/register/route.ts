import { NextRequest, NextResponse } from 'next/server'
import { registerBackend } from '@/lib/api/auth'

export async function POST(request: NextRequest) {
  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { firstName, lastName, email, password, birthDate } = body
  if (!firstName || !lastName || !email || !password || !birthDate) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  try {
    const data = await registerBackend({
      firstName,
      lastName,
      email,
      password,
      birthday: birthDate,
      role: 'ROLE_USER',
    })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message === 'EMAIL_ALREADY_EXISTS') {
      return NextResponse.json({ error: 'EMAIL_ALREADY_EXISTS' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
