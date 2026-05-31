import { NextRequest, NextResponse } from 'next/server'
import { loginBackend } from '@/lib/api/auth'

export async function POST(request: NextRequest) {
  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, password } = body
  if (!email || !password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
  }

  try {
    const data = await loginBackend({ email, password })

    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOpts = {
      path: '/',
      maxAge: 86400,
      sameSite: 'strict' as const,
    }

    const res = NextResponse.json({ idUser: data.idUser, username: data.username }, { status: 200 })
    res.cookies.set('studyrats_session', data.token, {
      ...cookieOpts,
      httpOnly: true,
      secure: isProduction,
    })
    res.cookies.set('studyrats_token_pub', data.token, cookieOpts)
    res.cookies.set(
      'studyrats_user',
      JSON.stringify({ idUser: data.idUser, username: data.username }),
      cookieOpts
    )
    return res
  } catch (err) {
    const status =
      err != null &&
      typeof err === 'object' &&
      'response' in err &&
      err.response != null &&
      typeof err.response === 'object' &&
      'status' in err.response
        ? (err.response as { status: number }).status
        : undefined

    if (status === 401) {
      return NextResponse.json({ error: 'Email ou senha inválidos' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
