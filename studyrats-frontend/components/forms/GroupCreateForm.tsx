'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { createGroup } from '@/lib/api/groups'
import type { GroupCreateRequest } from '@/types'

export function GroupCreateForm({ idUser, token }: { idUser: string; token: string }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<GroupCreateRequest>()
  const router = useRouter()

  const onSubmit = async (data: GroupCreateRequest) => {
    await createGroup(idUser, data, token)
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Nome do Grupo</label>
        <input
          id="name"
          type="text"
          {...register('name', { required: true, minLength: 3, maxLength: 100 })}
        />
      </div>
      <div>
        <label htmlFor="description">Descrição</label>
        <input id="description" type="text" {...register('description')} />
      </div>
      <button type="submit" disabled={isSubmitting}>
        Criar Grupo
      </button>
    </form>
  )
}
