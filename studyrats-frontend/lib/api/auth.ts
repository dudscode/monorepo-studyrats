import axios from 'axios'
import type { LoginRequest, LoginResponse, RegisterResponse } from '@/types'

/* c8 ignore start */
const baseURL =
  typeof window === 'undefined'
    ? (process.env.API_BASE_URL ?? 'http://localhost:9090')
    : (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9090')
/* c8 ignore stop */

const authClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

export type BackendRegisterPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
  birthday: string
  role: string
}

export async function loginBackend(req: LoginRequest): Promise<LoginResponse> {
  const { data } = await authClient.post<LoginResponse>('/users/login', req)
  return data
}

export async function registerBackend(payload: BackendRegisterPayload): Promise<RegisterResponse> {
  try {
    const { data } = await authClient.post<RegisterResponse>('/users/create', payload)
    return data
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
    if (status === 409) throw new Error('EMAIL_ALREADY_EXISTS')
    throw err
  }
}
