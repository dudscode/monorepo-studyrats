# API Contracts: StudyRats Backend

**Source**: Spring Boot backend at `studyrats/` (confirmed from source code)
**Base URL (local)**: `http://localhost:9090`
**Base URL (Docker server-side)**: `http://studyrats-app:9090`
**Content-Type (requests)**: `application/json` (except checkin creation: `multipart/form-data`)
**Accept (all requests)**: `application/hal+json`
**Auth**: `Authorization: Bearer <JWT>` on all endpoints except login and register

---

## Auth Endpoints

### POST /users/create — Register

**Auth required**: No

**Request body**:
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required)",
  "birthday": "YYYY-MM-DD (required, must be past)",
  "role": "ROLE_USER"
}
```

> ⚠️ **Field name is `birthday`**, not `birthDate`. The BFF `/api/auth/register` route remaps `birthDate → birthday` and injects `role: "ROLE_USER"` before forwarding.

**Success — HTTP 201**:
```json
{
  "name": "string (firstName)",
  "email": "string",
  "idUser": "UUID",
  "_links": { ... }
}
```

**Error — HTTP 409**: Email already exists. Body is empty.

---

### POST /users/login — Authenticate

**Auth required**: No

**Request body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Success — HTTP 202** ⚠️ (not 200):
```json
{
  "username": "string (email)",
  "token": "string (JWT)",
  "idUser": "UUID",
  "_links": { ... }
}
```

**Error — HTTP 401**: Invalid credentials. Body is empty.

---

## Group Endpoints

All require `Authorization: Bearer <token>`.

### GET /groups/user/{idUser} — List User's Groups

**Success — HTTP 200**:
```json
{
  "_embedded": {
    "groupResponseDTOList": [
      {
        "id": "UUID",
        "name": "string",
        "description": "string",
        "createdAt": "ISO 8601 LocalDateTime",
        "memberships": [
          {
            "id": "UUID",
            "joinedAt": "ISO 8601 LocalDateTime",
            "role": "ADMIN | MEMBER",
            "userId": "UUID",
            "userFirstName": "string"
          }
        ],
        "_links": { ... }
      }
    ]
  },
  "_links": { ... }
}
```

**Empty** (user has no groups): Returns `CollectionModel` with empty `_embedded` (or no `_embedded` key). `unwrapCollection` returns `[]`.

---

### GET /groups/{idUser}/{idGroup} — Get Single Group

**Success — HTTP 200**: Same shape as a single item from the list above, wrapped in EntityModel.

**Not found — HTTP 404**: Group does not exist or user is not a member.

---

### POST /groups/create/{idUser} — Create Group

**Request body**:
```json
{
  "name": "string (required, 3–100 chars)",
  "description": "string (optional)"
}
```

**Success — HTTP 201**:
```json
{
  "id": "UUID",
  "name": "string",
  "description": "string",
  "createdAt": "ISO 8601",
  "memberships": [...],
  "_links": { ... }
}
```

---

### GET /groups/ranking/{idGroup} — Group Ranking

**Success — HTTP 200**:
```json
{
  "_embedded": {
    "rankingDTOList": [
      {
        "userId": "UUID",
        "firstName": "string",
        "totalCheckins": 0
      }
    ]
  },
  "_links": { ... }
}
```

Items are ordered by `totalCheckins DESC`. Items have **no `_links`** (not wrapped in EntityModel).
Frontend adds `position` field via `addPosition()`.

---

## Group Membership Endpoint

### POST /groupmember/join/{idUser}/{idGroup} — Join Group

**Auth required**: Yes

> ⚠️ **Behavior nuance**: Returns **409 only when user or group UUID is not found**. When already a member, returns **201** with existing group data (idempotent). Frontend cannot distinguish "newly joined" from "already member" via HTTP status — both are treated as success.

**Success — HTTP 201** (newly joined OR already member):
```json
{
  "content": {
    "id": "UUID",
    "name": "string",
    "description": "string",
    "createdAt": "ISO 8601",
    "memberships": [...],
    "_links": { ... }
  },
  "_links": { ... }
}
```

> ⚠️ The response wraps `Optional<GroupResponseDTO>` in EntityModel. Jackson serializes this as `{ "content": {...}, "_links": {...} }`. Access the group via `res.data.content`.

**Error — HTTP 409**: User or group UUID not found. Body is EntityModel with empty Optional.

**Frontend error mapping**:
- 409 → display "Grupo não encontrado ou erro ao entrar"
- 201 → redirect to dashboard (success, regardless of whether already-member or new join)

---

## Checkin Endpoints

### POST /checkin/{idUser} — Create Check-in

**Auth required**: Yes
**Content-Type**: `multipart/form-data`

**Form fields**:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | Yes | |
| `description` | string | Yes | |
| `durationMinutes` | string | Yes | Integer; use `String(Math.floor(value))` |
| `image` | file | No | Max 5MB; image/* MIME type |

**Success — HTTP 201**: CollectionModel of EntityModel<Checkin> for each group the check-in was registered in.

```json
{
  "_embedded": {
    "checkinList": [
      {
        "id": "UUID",
        "title": "string",
        "description": "string",
        "durationMinutes": 30,
        "checkinDate": "ISO 8601",
        "imageData": "base64 | null",
        "imageContentType": "string | null",
        "_links": { ... }
      }
    ]
  },
  "_links": { ... }
}
```

**Empty result — HTTP 400** (already checked in today OR user has no groups): No body.
→ Frontend catches Axios error on 400 → returns `[]` → displays "alreadyDone" message.

---

### GET /checkin/user/{idUser} — Check-in History

**Auth required**: Yes

**Success — HTTP 200**:
```json
{
  "_embedded": {
    "checkinList": [
      {
        "id": "UUID",
        "title": "string",
        "description": "string",
        "durationMinutes": 30,
        "checkinDate": "ISO 8601",
        "imageData": "base64 | null",
        "imageContentType": "string | null",
        "_links": { ... }
      }
    ]
  },
  "_links": { ... }
}
```

**Empty** (no check-ins): `CollectionModel.empty()` with no `_embedded` key.
→ `unwrapCollection` returns `[]`.

Items are ordered `checkinDate DESC` (most recent first).

---

## BFF Routes (Next.js API Routes — Frontend Internal)

These routes are internal to the frontend and are not part of the Spring Boot API.

### POST /api/auth/login

**Responsibility**: Proxy to `POST /users/login`; set three auth cookies.
- On backend 202 → set cookies, return `{ idUser, username }` with HTTP 200
- On backend 401 → return `{ error: 'Email ou senha inválidos' }` with HTTP 401
- On missing fields → return `{ error: 'Campos obrigatórios' }` with HTTP 400

### POST /api/auth/logout

**Responsibility**: Clear all three auth cookies.
- Returns `{ ok: true }` with HTTP 200 always.

### POST /api/auth/register

**Responsibility**: Remap form fields and proxy to `POST /users/create`.
- Remaps `birthDate → birthday`, injects `role: "ROLE_USER"`
- On backend 201 → return result with HTTP 201
- On backend 409 (email conflict) → return `{ error: 'EMAIL_ALREADY_EXISTS' }` with HTTP 409
