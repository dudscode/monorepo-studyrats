# Data Model: Next.js SSR Frontend for StudyRats Platform

**Phase**: 1 — Design & Contracts
**Branch**: `001-nextjs-frontend-studyrats`
**Date**: 2026-05-24

---

## Overview

All TypeScript types live in `studyrats-frontend/types/index.ts`. This document maps each type to its backend source of truth and documents field constraints derived from the research phase.

---

## Authentication Types

### `AuthSession`
Server-side only. Stored in an httpOnly cookie; never exposed to client JavaScript.

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `idUser` | `string` | `LoginUserResponse.idUser` | UUID |
| `username` | `string` | `LoginUserResponse.username` | Email of the logged-in user |
| `token` | `string` | `LoginUserResponse.token` | RSA-signed JWT; opaque string on frontend |

### `UserIdentity`
Client-safe subset of session data. Hydrated server-side via `studyrats_user` cookie.

| Field | Type | Notes |
|-------|------|-------|
| `idUser` | `string` | UUID |
| `username` | `string` | Email (used as display name) |

---

## Domain Types (backend response shapes, after HATEOAS unwrapping)

### `Group`
Source: `GroupResponseDTO.java` → `GroupMapper.toDTO()`

| Field | Type | Backend field | Notes |
|-------|------|--------------|-------|
| `id` | `string` | `id` | UUID |
| `name` | `string` | `name` | 3–100 chars |
| `description` | `string` | `description` | Optional; may be null/empty |
| `createdAt` | `string` | `createdAt` (LocalDateTime) | ISO 8601 string; format with `Intl.DateTimeFormat('pt-BR')` |
| `memberships` | `MembershipSummary[]` | `memberships` | See below |

### `MembershipSummary`
Source: `MembershipDTO.java` → `GroupMapper.mapMembership()`

Only the fields populated by GroupMapper are reliable. `groupId` and `groupName` are always null.

| Field | Type | Backend field | Notes |
|-------|------|--------------|-------|
| `id` | `string` | `id` | Membership UUID |
| `role` | `'ADMIN' \| 'MEMBER'` | `role` (RoleName.name()) | Maps `ADMIN` / `MEMBER` from GroupMembership.Role enum |
| `joinedAt` | `string` | `joinedAt` (LocalDateTime) | ISO 8601 string |
| `userId` | `string` | `userId` | Member's user UUID |
| `userFirstName` | `string` | `userFirstName` | Member's first name |

**Note**: `memberships.length` is the member count displayed in GroupCard.

### `Checkin`
Source: `Checkin.java` (entity, serialized; `user` and `group` excluded via `@JsonBackReference`)

| Field | Type | Backend field | Notes |
|-------|------|--------------|-------|
| `id` | `string` | `id` | UUID |
| `title` | `string` | `title` | Non-blank |
| `description` | `string` | `description` | Non-blank |
| `durationMinutes` | `number` | `durationMinutes` (int) | Min 1 |
| `checkinDate` | `string` | `checkinDate` (LocalDateTime) | ISO 8601 string |

**Note**: `imageData` and `imageContentType` are present in the backend response but unused by the frontend.

### `RankingEntry`
Source: `RankingDTO.java`

| Field | Type | Backend field | Notes |
|-------|------|--------------|-------|
| `userId` | `string` | `userId` | UUID |
| `firstName` | `string` | `firstName` | Member's first name |
| `totalCheckins` | `number` | `totalCheckins` (long) | Always ≥ 0 |
| `position` | `number` | — | Computed frontend-side by `addPosition()` (1-based index) |

---

## Request Types

### `LoginRequest`
Sent to backend `POST /users/login`.

| Field | Type | Validation |
|-------|------|-----------|
| `email` | `string` | Required; email format |
| `password` | `string` | Required |

### `LoginResponse`
Returned by backend `POST /users/login` (HTTP 202).

| Field | Type | Notes |
|-------|------|-------|
| `username` | `string` | Email |
| `token` | `string` | JWT |
| `idUser` | `string` | UUID |

### `RegisterRequest` (sent to `/api/auth/register` BFF route)
Frontend form sends `birthDate` (HTML date input native format). The BFF route remaps and enriches before proxying.

| Field | Type | Form validation |
|-------|------|----------------|
| `firstName` | `string` | Required |
| `lastName` | `string` | Required |
| `email` | `string` | Required; email format |
| `password` | `string` | Required; min 6 chars |
| `birthDate` | `string` | Required; must be before today (`< new Date()`) |

**BFF remapping** before forwarding to `POST /users/create`:
```json
{
  "firstName": "...",
  "lastName": "...",
  "email": "...",
  "password": "...",
  "birthday": "<birthDate value>",
  "role": "ROLE_USER"
}
```

### `RegisterResponse`
Returned by backend `POST /users/create` (HTTP 201).

| Field | Type | Notes |
|-------|------|-------|
| `name` | `string` | User's first name |
| `email` | `string` | |
| `idUser` | `string` | UUID |

### `CheckinFormValues` (form state; sent as multipart/form-data)

| Field | Type | Validation |
|-------|------|-----------|
| `title` | `string` | Required |
| `description` | `string` | Required |
| `durationMinutes` | `number` | Required; min 1; integer |
| `image` | `FileList?` | Optional; max 5MB; accept `image/*` |

### `GroupCreateRequest`
Sent to `POST /groups/create/{idUser}`.

| Field | Type | Validation |
|-------|------|-----------|
| `name` | `string` | Required; 3–100 chars |
| `description` | `string` | Optional |

---

## HATEOAS Wrapper Types

These generic types represent the raw HAL+JSON response shapes before unwrapping. They are used in `lib/api/hateoas.ts` only.

### `HateoasEntity<T>`
```typescript
interface HateoasEntity<T> extends Record<string, unknown> {
  _links?: Record<string, { href: string }>
}
```

### `HateoasCollection<T>`
```typescript
interface HateoasCollection<T> {
  _embedded?: Record<string, (T & { _links?: unknown })[]>
  _links?: Record<string, { href: string }>
}
```

---

## State Transitions

### Authentication State Machine

```
[Unauthenticated]
    │
    ├─── POST /api/auth/login (success) ──────→ [Authenticated]
    │        Sets: studyrats_session (httpOnly)
    │              studyrats_token_pub (pub)
    │              studyrats_user (pub JSON)
    │
    │◄── POST /api/auth/logout ─────────────── [Authenticated]
    │        Clears all three cookies
    │
    │◄── Axios 401 interceptor ──────────────── [Authenticated]
         Auto-clears via window.location = '/login'
```

### Check-in Status Machine

```
[idle]
  │
  ├─── submit + API returns non-empty array ──→ [success]
  ├─── submit + API returns empty (400) ──────→ [alreadyDone]
  ├─── submit + network/other error ──────────→ [error]
  └─── (any state) reset form ───────────────→ [idle]
```

---

## Cookie Inventory

| Cookie | httpOnly | Content | Purpose |
|--------|----------|---------|---------|
| `studyrats_session` | ✅ Yes | JWT token | Read by Server Components and Next.js API routes for backend auth |
| `studyrats_token_pub` | No | JWT token | Read by client-side Axios interceptor to attach `Authorization` header |
| `studyrats_user` | No | `{idUser, username}` JSON | Read by `AuthContextProvider` for client-side identity display |

All cookies: `sameSite: 'strict'`, `path: '/'`, `maxAge: 86400` (24h).
`studyrats_session` additionally: `secure: true` in production.

---

## Environment Variables

| Variable | Side | Set by | Value (local) | Value (Docker) |
|----------|------|--------|---------------|----------------|
| `NEXT_PUBLIC_API_BASE_URL` | Client (build-time) | `.env.local` / `build.args` | `http://localhost:9090` | `http://localhost:9090` |
| `API_BASE_URL` | Server (runtime) | `.env.local` / `environment:` | `http://localhost:9090` | `http://studyrats-app:9090` |
| `NODE_ENV` | Server | Docker / Next.js | `development` | `production` |

URL selection logic in `lib/api/client.ts`:
```typescript
const baseURL = typeof window === 'undefined'
  ? (process.env.API_BASE_URL ?? 'http://localhost:9090')
  : (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9090')
```
