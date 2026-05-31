'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { RegisterRequest } from '@/types'

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>()
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const onSubmit = async (data: RegisterRequest) => {
    setServerError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.status === 409) {
        setServerError('Este email já está cadastrado')
        return
      }
      if (!res.ok) {
        setServerError('Erro ao cadastrar. Tente novamente.')
        return
      }
      router.push('/login?registered=true')
    } catch {
      setServerError('Erro de conexão. Tente novamente.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="firstName">Nome</label>
        <input id="firstName" type="text" {...register('firstName', { required: true })} />
      </div>
      <div>
        <label htmlFor="lastName">Sobrenome</label>
        <input id="lastName" type="text" {...register('lastName', { required: true })} />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email', { required: true })} />
      </div>
      <div>
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          {...register('password', {
            required: true,
            minLength: { value: 6, message: 'Mínimo 6 caracteres' },
          })}
        />
        {errors.password && <span>{errors.password.message}</span>}
      </div>
      <div>
        <label htmlFor="birthDate">Data de Nascimento</label>
        <input
          id="birthDate"
          type="date"
          {...register('birthDate', {
            required: true,
            validate: (v) => {
              // date input returns 'YYYY-MM-DD'; compare as date string against today
              const todayStr = new Date().toISOString().split('T')[0]
              return v < todayStr || 'Data de nascimento deve ser anterior a hoje'
            },
          })}
        />
        {errors.birthDate && <span>{errors.birthDate.message}</span>}
      </div>
      {serverError && <p role="alert">{serverError}</p>}
      <button type="submit">Cadastrar</button>
      <p>
        Já tem conta?{' '}
        <Link href="/login">Entrar</Link>
      </p>
    </form>
  )
}
