'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { joinGroup } from '@/lib/api/groups'

interface JoinFormValues {
  groupId: string
}

export function GroupJoinForm({ idUser, token }: { idUser: string; token: string }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<JoinFormValues>()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: JoinFormValues) => {
    setError(null)
    try {
      await joinGroup(idUser, data.groupId, token)
      router.push('/dashboard')
    } catch {
      setError('Grupo não encontrado ou erro ao entrar')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="groupId">ID do Grupo</label>
        <input id="groupId" type="text" {...register('groupId', { required: true })} />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        Entrar no Grupo
      </button>
    </form>
  )
}
