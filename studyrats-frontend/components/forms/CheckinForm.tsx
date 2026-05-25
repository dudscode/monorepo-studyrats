'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createCheckin } from '@/lib/api/checkin'
import type { CheckinFormValues, Checkin } from '@/types'

type Status = 'idle' | 'success' | 'alreadyDone' | 'error'

export function CheckinForm({ idUser, token }: { idUser: string; token: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CheckinFormValues>()
  const [status, setStatus] = useState<Status>('idle')
  const [successCount, setSuccessCount] = useState(0)

  const onSubmit = async (data: CheckinFormValues) => {
    setStatus('idle')
    try {
      const result: Checkin[] = await createCheckin(idUser, data, token)
      if (result.length === 0) {
        setStatus('alreadyDone')
      } else {
        setSuccessCount(result.length)
        setStatus('success')
        reset()
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p>O check-in será registrado em todos os seus grupos.</p>
      <div>
        <label htmlFor="title">Título</label>
        <input id="title" type="text" {...register('title', { required: true })} />
      </div>
      <div>
        <label htmlFor="description">Descrição</label>
        <textarea id="description" {...register('description', { required: true })} />
      </div>
      <div>
        <label htmlFor="durationMinutes">Duração (minutos)</label>
        <input
          id="durationMinutes"
          type="number"
          {...register('durationMinutes', {
            required: true,
            min: { value: 1, message: 'Mínimo 1 minuto' },
            valueAsNumber: true,
          })}
        />
        {errors.durationMinutes && <span>{errors.durationMinutes.message}</span>}
      </div>
      <div>
        <label htmlFor="image">Imagem (opcional)</label>
        <input id="image" type="file" accept="image/*" {...register('image')} />
      </div>

      {status === 'success' && (
        <p>Check-in registrado em {successCount} grupos!</p>
      )}
      {status === 'alreadyDone' && (
        <p>Você já fez check-in hoje.</p>
      )}
      {status === 'error' && (
        <p>Erro ao registrar check-in. Tente novamente.</p>
      )}

      <button type="submit" disabled={isSubmitting}>
        Registrar Check-in
      </button>
    </form>
  )
}
