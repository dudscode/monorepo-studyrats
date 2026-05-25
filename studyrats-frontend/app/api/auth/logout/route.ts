import { NextResponse } from 'next/server'

export function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 })
  const clearOpts = { path: '/', maxAge: 0, sameSite: 'strict' as const }
  res.cookies.set('studyrats_session', '', { ...clearOpts, httpOnly: true })
  res.cookies.set('studyrats_token_pub', '', clearOpts)
  res.cookies.set('studyrats_user', '', clearOpts)
  return res
}
