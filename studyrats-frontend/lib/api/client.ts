import axios from 'axios'
import Cookies from 'js-cookie'

/* c8 ignore start */
const baseURL =
  typeof window === 'undefined'
    ? (process.env.API_BASE_URL ?? 'http://localhost:9090')
    : (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9090')
/* c8 ignore stop */

const apiClient = axios.create({
  baseURL,
  headers: { Accept: 'application/hal+json' },
})

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('studyrats_token_pub')
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status =
      error != null &&
      typeof error === 'object' &&
      'response' in error &&
      error.response != null &&
      typeof error.response === 'object' &&
      'status' in error.response
        ? (error.response as { status: number }).status
        : undefined

    /* c8 ignore next */
    if (status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
