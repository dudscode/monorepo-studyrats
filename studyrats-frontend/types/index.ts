// Auth

export interface AuthSession {
  idUser: string
  username: string
  token: string
}

export interface UserIdentity {
  idUser: string
  username: string
}

// Domain

export interface MembershipSummary {
  id: string
  role: 'ADMIN' | 'MEMBER'
  joinedAt: string
  userId: string
  userFirstName: string
}

export interface Group {
  id: string
  name: string
  description: string
  createdAt: string
  memberships: MembershipSummary[]
}

export interface Checkin {
  id: string
  title: string
  description: string
  durationMinutes: number
  checkinDate: string
}

export interface RankingEntry {
  userId: string
  firstName: string
  totalCheckins: number
  position: number
}

// Request / Response

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  username: string
  token: string
  idUser: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  birthDate: string
}

export interface RegisterResponse {
  name: string
  email: string
  idUser: string
}

export interface CheckinFormValues {
  title: string
  description: string
  durationMinutes: number
  image?: FileList
}

export interface GroupCreateRequest {
  name: string
  description?: string
}

// HATEOAS wrappers (raw HAL+JSON before unwrapping)

export interface HateoasEntity<T> extends Record<string, unknown> {
  _links?: Record<string, { href: string }>
}

export interface HateoasCollection<T> {
  _embedded?: Record<string, (T & { _links?: unknown })[]>
  _links?: Record<string, { href: string }>
}
