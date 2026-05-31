# Quickstart: Next.js SSR Frontend for StudyRats

**Branch**: `001-nextjs-frontend-studyrats`
**Date**: 2026-05-24

---

## Prerequisites

- Node.js 18+ (`node --version`)
- npm 9+ (`npm --version`)
- Docker Desktop (for full-stack mode)
- The StudyRats backend running on `localhost:9090` (or via Docker)

---

## Option A: Local Development (frontend only)

### 1. Bootstrap the project

```bash
cd /path/to/project-root   # same level as studyrats/
npx create-next-app@latest studyrats-frontend \
  --typescript --app --tailwind --eslint
cd studyrats-frontend
```

### 2. Install additional dependencies

```bash
npm install axios js-cookie react-hook-form
npm install -D @types/js-cookie
```

### 3. Configure environment variables

Create `studyrats-frontend/.env.local` (never commit this file):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:9090
API_BASE_URL=http://localhost:9090
```

### 4. Start the backend (required for API calls)

```bash
cd studyrats/
docker-compose up --build -d
```

Backend is ready at `http://localhost:9090`.

### 5. Start the frontend

```bash
cd studyrats-frontend/
npm run dev
```

Frontend available at `http://localhost:3000`.

### 6. Verify setup

1. Navigate to `http://localhost:3000` — should redirect to `/login`
2. Register a new account at `http://localhost:3000/register`
3. Login — should arrive at `/dashboard`

---

## Option B: Full Stack via Docker Compose

### 1. Build and start all services

```bash
cd studyrats/
docker-compose up --build
```

This starts:
- `studyrats-mysql` on port 3306
- `studyrats-app` on port 9090
- `studyrats-frontend` on port 3000

### 2. Verify

All three services healthy → open `http://localhost:3000`.

---

## Directory Structure (frontend)

```text
studyrats-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx                     # SSR auth guard
│   │   ├── dashboard/page.tsx
│   │   ├── checkin/page.tsx
│   │   ├── checkins/page.tsx
│   │   └── groups/
│   │       ├── create/page.tsx
│   │       ├── join/page.tsx
│   │       └── [idGroup]/ranking/page.tsx
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts
│   │       ├── logout/route.ts
│   │       └── register/route.ts
│   └── layout.tsx                         # Root layout with AuthContextProvider
├── components/
│   ├── forms/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── CheckinForm.tsx
│   │   ├── GroupCreateForm.tsx
│   │   └── GroupJoinForm.tsx
│   └── ui/
│       ├── GroupCard.tsx
│       ├── CheckinCard.tsx
│       └── RankingTable.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts                      # Axios instance (dual-URL)
│   │   ├── hateoas.ts                     # unwrapEntity / unwrapCollection
│   │   ├── auth.ts                        # loginBackend / registerBackend
│   │   ├── groups.ts                      # getGroupsByUser, createGroup, joinGroup, getRanking
│   │   └── checkin.ts                     # createCheckin / getCheckinsByUser
│   └── auth/
│       └── session.ts                     # getServerSession() — server-only
├── types/
│   └── index.ts                           # All TypeScript interfaces
├── middleware.ts                           # Edge-layer route protection
├── next.config.ts                         # output: 'standalone'
├── .env.local                             # Never committed
├── Dockerfile                             # Multi-stage build
└── .gitignore                             # Must include .env.local, .next/
```

---

## Running Tests

### Unit tests

```bash
npm test                   # run all Jest tests
npm run test:coverage      # run with coverage report (must hit 100%)
npm run test:watch         # watch mode for TDD
```

### E2E tests (Playwright)

```bash
npx playwright install     # first time only
npm run test:e2e           # run against local dev server
```

E2E test coverage required:
- `tests/e2e/auth.spec.ts` — register, login, logout, unauthenticated redirect
- `tests/e2e/checkin.spec.ts` — submit check-in, already-done state
- `tests/e2e/ranking.spec.ts` — navigate to ranking, highlight current user

---

## Linting and Formatting

```bash
npm run lint               # ESLint check
npm run lint:fix           # auto-fix ESLint issues
npx prettier --write .     # format all files
```

---

## Docker Build (standalone)

The Dockerfile uses Next.js standalone output. `next.config.ts` must have:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
}
export default nextConfig
```

Build manually:

```bash
cd studyrats-frontend/
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:9090 \
  -t studyrats-frontend .
```

---

## Key Gotchas

1. **Login returns HTTP 202** — treat any 2xx from the `/users/login` backend call as success.
2. **Registration sends `birthday`, not `birthDate`** — the BFF `/api/auth/register` remaps and injects `role: "ROLE_USER"`.
3. **Join group 409 = not found, not already-member** — "already member" returns 201 silently.
4. **`API_BASE_URL` vs `NEXT_PUBLIC_API_BASE_URL`** — server-side code uses `API_BASE_URL`; browser uses `NEXT_PUBLIC_API_BASE_URL`. Both are set in `.env.local` for local dev. Docker overrides `API_BASE_URL` at runtime.
5. **`.env.local` must never be committed** — add to `.gitignore` before first commit.
6. **`next.config.ts` must have `output: 'standalone'`** — required for the Docker multi-stage build to produce `server.js`.
