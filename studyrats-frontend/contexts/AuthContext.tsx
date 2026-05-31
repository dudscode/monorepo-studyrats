'use client'

import React, { createContext, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { UserIdentity } from '@/types'

interface AuthContextValue {
  currentUser: UserIdentity | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthContextProvider({
  initialUser,
  children,
}: {
  initialUser: UserIdentity | null
  children: React.ReactNode
}) {
  const [currentUser, setCurrentUser] = useState<UserIdentity | null>(initialUser)
  const router = useRouter()

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setCurrentUser(null)
    router.push('/login')
  }

  return <AuthContext.Provider value={{ currentUser, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthContextProvider')
  return ctx
}
