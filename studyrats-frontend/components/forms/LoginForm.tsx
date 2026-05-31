'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { LoginRequest } from '@/types'

export function LoginForm() {
  const { register, handleSubmit } = useForm<LoginRequest>()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: LoginRequest) => {
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.status === 401) {
        setError('Email ou senha inválidos')
        return
      }
      if (!res.ok) {
        setError('Erro ao fazer login. Tente novamente.')
        return
      }
      router.push('/dashboard')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email', { required: true })} />
      </div>
      <div>
        <label htmlFor="password">Senha</label>
        <input id="password" type="password" {...register('password', { required: true })} />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Entrar</button>
      <p>
        Não tem conta?{' '}
        <Link href="/register">Cadastre-se</Link>
      </p>
    </form>
  )
}
