# Tasks: Next.js SSR Frontend for StudyRats Platform

**Input**: Design documents from `specs/001-nextjs-frontend-studyrats/`

**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/api-endpoints.md ✅ · quickstart.md ✅

**Tests**: Included — constitution requires 100% unit test coverage (TDD: red → green → refactor) and E2E tests for all critical flows.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase
- **[Story]**: Which user story this task belongs to (US1–US6)
- Paths are relative to `studyrats-frontend/` unless noted otherwise

---

## Phase 1: Setup (Project Bootstrap)

**Purpose**: Initialize the Next.js project, install all dependencies, configure tooling. No user story code here — only scaffolding.

- [X] T001 Bootstrap Next.js app: `npx create-next-app@latest studyrats-frontend --typescript --app --tailwind --eslint` in project root (sibling to `studyrats/`)
- [X] T002 Install runtime dependencies: `npm install axios js-cookie react-hook-form` inside `studyrats-frontend/`
- [X] T003 [P] Install dev dependencies: `npm install -D @types/js-cookie` inside `studyrats-frontend/`
- [X] T004 [P] Configure `studyrats-frontend/tsconfig.json` — verify `strict: true` is set; add `paths` aliases if needed
- [X] T005 [P] Configure `studyrats-frontend/next.config.ts` — set `output: 'standalone'` (required for Docker multi-stage Dockerfile)
- [X] T006 [P] Create `studyrats-frontend/.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:9090` and `API_BASE_URL=http://localhost:9090`
- [X] T007 [P] Update `studyrats-frontend/.gitignore` — add `.env.local`, `.next/`, `coverage/`, `playwright-report/`
- [X] T008 [P] Configure `studyrats-frontend/jest.config.ts` — use `next/jest` preset; set `moduleNameMapper` for `@/` alias; enable `collectCoverage: true` with `100%` thresholds for lines/branches/functions
- [X] T009 [P] Configure `studyrats-frontend/playwright.config.ts` — set `baseURL: 'http://localhost:3000'`; configure `webServer` to start `npm run dev` before E2E suite
- [X] T010 [P] Create all empty directory stubs: `app/(auth)/login/`, `app/(auth)/register/`, `app/(protected)/dashboard/`, `app/(protected)/checkin/`, `app/(protected)/checkins/`, `app/(protected)/groups/create/`, `app/(protected)/groups/join/`, `app/(protected)/groups/[idGroup]/ranking/`, `app/api/auth/login/`, `app/api/auth/logout/`, `app/api/auth/register/`, `lib/api/`, `lib/auth/`, `contexts/`, `components/forms/`, `components/ui/`, `types/`, `tests/unit/lib/api/`, `tests/unit/components/forms/`, `tests/unit/components/ui/`, `tests/e2e/`

**Checkpoint**: `npm run dev` starts without errors at `http://localhost:3000`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure shared by all user stories. **No user story can start until this phase is complete.**

- [X] T011 Create `studyrats-frontend/types/index.ts` — define all TypeScript interfaces: `AuthSession`, `UserIdentity`, `Group`, `MembershipSummary`, `Checkin`, `RankingEntry`, `LoginRequest`, `LoginResponse`, `RegisterRequest`, `RegisterResponse`, `CheckinFormValues`, `GroupCreateRequest`, `HateoasEntity<T>`, `HateoasCollection<T>` (see data-model.md for field types)
- [X] T012 [P] Write unit tests for `lib/api/hateoas.ts` in `tests/unit/lib/api/hateoas.test.ts` (TDD — must fail first): test `unwrapEntity` strips `_links` and returns typed object; test `unwrapCollection` extracts first `_embedded` key; test `unwrapCollection` returns `[]` when `_embedded` absent; test `addPosition` adds 1-based `position` field
- [X] T013 Implement `studyrats-frontend/lib/api/hateoas.ts` — `unwrapEntity<T>`, `unwrapCollection<T>`, `addPosition` (make T012 tests pass)
- [X] T014 [P] Write unit tests for `lib/auth/session.ts` in `tests/unit/lib/auth/session.test.ts` (TDD — must fail first): mock `next/headers` `cookies()`; test returns `null` when `studyrats_session` absent; test returns `null` when `studyrats_user` is malformed JSON; test returns `AuthSession` when both cookies valid
- [X] T015 Implement `studyrats-frontend/lib/auth/session.ts` — async `getServerSession(): Promise<AuthSession | null>` using `cookies()` from `next/headers` (make T014 tests pass)
- [X] T016 [P] Write unit tests for `lib/api/client.ts` in `tests/unit/lib/api/client.test.ts` (TDD — must fail first): test server-side `baseURL` uses `API_BASE_URL`; test browser-side `baseURL` uses `NEXT_PUBLIC_API_BASE_URL`; test request interceptor attaches `Authorization` header when `studyrats_token_pub` cookie present; test 401 response triggers `window.location` redirect to `/login` on client
- [X] T017 Implement `studyrats-frontend/lib/api/client.ts` — Axios instance with dual-URL logic (`typeof window === 'undefined'`), `Accept: application/hal+json` default header, request interceptor (reads `studyrats_token_pub` via `js-cookie`), response interceptor (redirects to `/login` on 401) (make T016 tests pass)
- [X] T018 [P] Write unit tests for `contexts/AuthContext.tsx` in `tests/unit/contexts/AuthContext.test.tsx` (TDD — must fail first): test `useAuth()` throws when used outside provider; test `AuthContextProvider` renders with `initialUser`; test `logout()` calls `POST /api/auth/logout`, clears user state, calls `router.push('/login')`
- [X] T019 Implement `studyrats-frontend/contexts/AuthContext.tsx` — `'use client'`; `AuthContextProvider` with `useState(initialUser)`, `logout` function (fetch + setUser(null) + router.push); export `useAuth()` hook (make T018 tests pass)
- [X] T020 [P] Write unit tests for `middleware.ts` in `tests/unit/middleware.test.ts` (TDD — must fail first): test request to `/dashboard` without `studyrats_session` cookie redirects to `/login`; test request to `/dashboard` with valid cookie calls `NextResponse.next()`; test request to `/login` (public path) is never redirected
- [X] T021 Implement `studyrats-frontend/middleware.ts` — check `protectedPaths = ['/dashboard', '/checkin', '/checkins', '/groups']`; redirect to `/login` when cookie absent; export `config.matcher` excluding `_next/static`, `_next/image`, `favicon.ico`, `api/` (make T020 tests pass)
- [X] T022 [P] Write unit tests for `app/layout.tsx` in `tests/unit/app/layout.test.tsx` — mock `getServerSession`; test renders `AuthContextProvider` with `initialUser: null` when no session; test renders with `UserIdentity` when session present
- [X] T023 Implement `studyrats-frontend/app/layout.tsx` — async Server Component; call `getServerSession()`; extract `initialUser`; render `<html lang="pt-BR"><body><AuthContextProvider initialUser={initialUser}>{children}</AuthContextProvider></body></html>` (make T022 tests pass)
- [X] T024 [P] Write unit tests for `app/(protected)/layout.tsx` in `tests/unit/app/(protected)/layout.test.tsx` — mock `getServerSession`; test calls `redirect('/login')` when session is null; test renders children when session present
- [X] T025 Implement `studyrats-frontend/app/(protected)/layout.tsx` — async Server Component; `getServerSession()` → if null call `redirect('/login')`; return `<>{children}</>` (make T024 tests pass)

**Checkpoint**: All Phase 2 unit tests pass; `npm test` 100% coverage on foundational files; `npm run dev` still starts

---

## Phase 3: User Story 1 — Secure Registration and Login (Priority: P1) 🎯 MVP

**Goal**: Users can register, log in, and log out. Unauthenticated navigation to protected pages redirects to `/login`.

**Independent Test**: Register a new user → login → verify dashboard loads → navigate to `/login` → verify redirect to dashboard → logout → verify redirect to `/login` → navigate to `/dashboard` directly → verify redirect to `/login`.

- [X] T026 [P] [US1] Write unit tests for `lib/api/auth.ts` in `tests/unit/lib/api/auth.test.ts` (TDD — must fail first): test `loginBackend` calls `POST /users/login` with correct body and headers; test `loginBackend` returns unwrapped `LoginResponse` on 202; test `loginBackend` re-throws on 401; test `registerBackend` calls `POST /users/create`; test `registerBackend` throws `'EMAIL_ALREADY_EXISTS'` on 409
- [X] T027 [US1] Implement `studyrats-frontend/lib/api/auth.ts` — fresh axios instance (no interceptor); dual-URL base; `loginBackend(req)` POSTs to `/users/login` accepting 2xx; `registerBackend(req)` POSTs to `/users/create`, catches 409 and re-throws `new Error('EMAIL_ALREADY_EXISTS')` (make T026 tests pass)
- [X] T028 [P] [US1] Write unit tests for `app/api/auth/login/route.ts` in `tests/unit/app/api/auth/login.test.ts` (TDD — must fail first): test missing email/password → 400; test `loginBackend` success → response sets 3 cookies + returns `{idUser, username}` with 200; test backend 401 → returns `{error: 'Email ou senha inválidos'}` 401; test generic error → 500
- [X] T029 [US1] Implement `studyrats-frontend/app/api/auth/login/route.ts` — exported `POST`; validate email+password present; call `loginBackend`; set `studyrats_session` (httpOnly, secure in prod, sameSite strict, maxAge 86400), `studyrats_token_pub` (not httpOnly), `studyrats_user` (JSON of idUser+username); return `{idUser, username}` 200 (make T028 tests pass)
- [X] T030 [P] [US1] Write unit tests for `app/api/auth/logout/route.ts` in `tests/unit/app/api/auth/logout.test.ts` (TDD — must fail first): test clears all three cookies with maxAge 0; test returns `{ok: true}` 200
- [X] T031 [US1] Implement `studyrats-frontend/app/api/auth/logout/route.ts` — exported `POST`; set all three cookies to `''` with `maxAge: 0`; return `{ok: true}` (make T030 tests pass)
- [X] T032 [P] [US1] Write unit tests for `app/api/auth/register/route.ts` in `tests/unit/app/api/auth/register.test.ts` (TDD — must fail first): test missing fields → 400; test calls `registerBackend` with `birthday` (remapped from `birthDate`) and `role: 'ROLE_USER'`; test success → 201; test `EMAIL_ALREADY_EXISTS` error → 409
- [X] T033 [US1] Implement `studyrats-frontend/app/api/auth/register/route.ts` — exported `POST`; validate all fields; remap `birthDate → birthday`, inject `role: 'ROLE_USER'`; call `registerBackend`; return 201 on success; return 409 on `EMAIL_ALREADY_EXISTS` (make T032 tests pass)
- [X] T034 [P] [US1] Write unit tests for `components/forms/LoginForm.tsx` in `tests/unit/components/forms/LoginForm.test.tsx` (TDD — must fail first): test renders email + password fields + submit button; test shows "Email ou senha inválidos" on 401 response; test calls `router.push('/dashboard')` on 200; test shows network error message on fetch failure; test includes link to `/register`
- [X] T035 [US1] Implement `studyrats-frontend/components/forms/LoginForm.tsx` — `'use client'`; react-hook-form with email+password fields; `POST /api/auth/login`; on 200 → `router.push('/dashboard')`; on 401 → set error state; on network failure → set connection error; link to `/register` (make T034 tests pass)
- [X] T036 [US1] Implement `studyrats-frontend/app/(auth)/login/page.tsx` — async Server Component; `getServerSession()` → if present `redirect('/dashboard')`; return `<LoginForm />`
- [X] T037 [P] [US1] Write unit tests for `components/forms/RegisterForm.tsx` in `tests/unit/components/forms/RegisterForm.test.tsx` (TDD — must fail first): test renders all 5 fields; test birthDate validation rejects today and future dates; test password min-length 6 validation; test shows "Este email já está cadastrado" on 409; test redirects to `/login?registered=true` on 201; test includes link to `/login`
- [X] T038 [US1] Implement `studyrats-frontend/components/forms/RegisterForm.tsx` — `'use client'`; react-hook-form with firstName, lastName, email, password (minLength 6), birthDate (validate < today); `POST /api/auth/register`; on 201 → `router.push('/login?registered=true')`; on 409 → "Este email já está cadastrado" (make T037 tests pass)
- [X] T039 [US1] Implement `studyrats-frontend/app/(auth)/register/page.tsx` — async Server Component; `getServerSession()` → if present `redirect('/dashboard')`; return `<RegisterForm />`
- [X] T040 [US1] Write Playwright E2E tests in `studyrats-frontend/tests/e2e/auth.spec.ts` — cover: full registration flow (valid data → redirected to login); duplicate email registration (shows error); successful login (reaches dashboard); wrong credentials (shows error); logout (reaches `/login`, dashboard inaccessible); unauthenticated direct navigation to `/dashboard` (redirects to `/login`)

**Checkpoint**: E2E auth flow passes; `npm test` 100% coverage on all Phase 3 files; app manually verifiable: register → login → logout cycle works end-to-end

---

## Phase 4: User Story 2 — Dashboard: View My Groups (Priority: P2)

**Goal**: Authenticated users see all their groups on first page paint — no loading spinner, full SSR.

**Independent Test**: Log in as a user with groups → open `/dashboard` → group cards appear immediately; log in as user with no groups → empty state message visible.

- [X] T041 [P] [US2] Write unit tests for `lib/api/groups.ts` (getGroupsByUser, getGroupById) in `tests/unit/lib/api/groups.test.ts` (TDD — must fail first): test `getGroupsByUser` calls `GET /groups/user/{idUser}` with `Authorization` header; test returns unwrapped `Group[]`; test `getGroupById` calls `GET /groups/{idUser}/{idGroup}`; test returns unwrapped `Group`; test both pass explicit token in header (not relying on interceptor)
- [X] T042 [US2] Create `studyrats-frontend/lib/api/groups.ts` — implement `getGroupsByUser(idUser, token)` and `getGroupById(idUser, idGroup, token)` using `apiClient` with explicit `Authorization` header; unwrap via `unwrapCollection` and `unwrapEntity` respectively (make T041 tests pass)
- [X] T043 [P] [US2] Write unit tests for `components/ui/GroupCard.tsx` in `tests/unit/components/ui/GroupCard.tsx.test.tsx` (TDD — must fail first): test renders group name as h3; test renders description truncated to 100 chars when longer; test renders member count as `N membros`; test renders `createdAt` formatted as `dd/MM/yyyy` using `pt-BR` locale; test renders `href="/groups/{id}/ranking"` link with text "Ver Ranking"
- [X] T044 [US2] Implement `studyrats-frontend/components/ui/GroupCard.tsx` — Server Component; props `{group: Group, idUser: string}`; render name, truncated description, `memberships.length membros`, date via `Intl.DateTimeFormat('pt-BR')`, link to ranking (make T043 tests pass)
- [X] T045 [P] [US2] Write unit tests for `app/(protected)/dashboard/page.tsx` in `tests/unit/app/(protected)/dashboard.test.tsx` (TDD — must fail first): mock `getServerSession` and `getGroupsByUser`; test renders list of GroupCard components when groups returned; test renders "Você ainda não pertence a nenhum grupo." when groups empty; test renders "Criar Grupo" and "Entrar em Grupo" links
- [X] T046 [US2] Implement `studyrats-frontend/app/(protected)/dashboard/page.tsx` — async Server Component; `getServerSession()` (guaranteed by protected layout); `getGroupsByUser(session.idUser, session.token)`; render GroupCards or empty state; render "Criar Grupo" link to `/groups/create` and "Entrar em Grupo" link to `/groups/join` (make T045 tests pass)

**Checkpoint**: Log in and open `/dashboard` — groups render on first paint; empty state message visible when no groups; `npm test` 100% coverage on all Phase 4 files

---

## Phase 5: User Story 3 — Daily Study Check-in (Priority: P3)

**Goal**: Users can submit a daily check-in (with optional image) and receive clear feedback about how many groups it was registered in, or whether it was already done today.

**Independent Test**: Submit check-in form as user with groups → success message with group count; re-submit → "already done" message; attach image > 5MB → validation error before submission.

- [X] T047 [P] [US3] Write unit tests for `lib/api/checkin.ts` (createCheckin) in `tests/unit/lib/api/checkin.test.ts` (TDD — must fail first): test builds `FormData` with title, description, integer durationMinutes, optional image; test calls `POST /checkin/{idUser}` with `multipart/form-data` and `Authorization` header; test returns `unwrapCollection<Checkin>` on 201; test catches 400 and returns `[]`
- [X] T048 [US3] Create `studyrats-frontend/lib/api/checkin.ts` — implement `createCheckin(idUser, values, token)`: build `FormData`, append fields (durationMinutes as `String(Math.floor(...))`), append image if present, POST with explicit Authorization header; on success return `unwrapCollection<Checkin>`; catch 400 → return `[]` (make T047 tests pass)
- [X] T049 [P] [US3] Write unit tests for `components/forms/CheckinForm.tsx` in `tests/unit/components/forms/CheckinForm.test.tsx` (TDD — must fail first): test renders all 4 fields + submit button; test renders notice about check-in applying to all groups; test durationMinutes min=1 validation; test image > 5MB shows "Imagem muito grande (máx 5MB)" field error; test success with non-empty array → shows "Check-in registrado em X grupos!"; test empty array → shows "alreadyDone" message; test network error → "Erro ao registrar check-in. Tente novamente."; test submit button disabled while in-flight
- [X] T050 [US3] Implement `studyrats-frontend/components/forms/CheckinForm.tsx` — `'use client'`; props `{idUser, token}`; react-hook-form with title, description, durationMinutes (min 1), image (optional); `status` state; image file change validator (size ≤ 5MB); call `createCheckin`; map result to status state; visible notice text (make T049 tests pass)
- [X] T051 [US3] Implement `studyrats-frontend/app/(protected)/checkin/page.tsx` — async Server Component; `getServerSession()`; render `<CheckinForm idUser={session!.idUser} token={session!.token} />`
- [X] T052 [US3] Write Playwright E2E tests in `studyrats-frontend/tests/e2e/checkin.spec.ts` — cover: submit valid check-in → success message with group count; submit when already checked in → "already done" message; attach oversized image → error before POST is sent

**Checkpoint**: Submit check-in form → success message; `npm test` 100% coverage on all Phase 5 files

---

## Phase 6: User Story 4 — Check-in History (Priority: P4)

**Goal**: Users can view their full check-in history in reverse chronological order. The page gracefully degrades if the endpoint is unavailable.

**Independent Test**: Navigate to `/checkins` with at least one check-in → list rendered in reverse order; navigate as user with no check-ins → empty state; simulate 404 from endpoint → graceful message shown.

- [X] T053 [P] [US4] Write unit tests for `getCheckinsByUser` in `tests/unit/lib/api/checkin.test.ts` (TDD — must fail first): test calls `GET /checkin/user/{idUser}` with `Authorization` header; test returns `unwrapCollection<Checkin>` on 200; test returns `[]` on empty collection response
- [X] T054 [US4] Add `getCheckinsByUser(idUser, token)` to `studyrats-frontend/lib/api/checkin.ts` — `GET /checkin/user/{idUser}` with explicit Authorization header; return `unwrapCollection<Checkin>(res.data)` (make T053 tests pass)
- [X] T055 [P] [US4] Write unit tests for `components/ui/CheckinCard.tsx` in `tests/unit/components/ui/CheckinCard.test.tsx` (TDD — must fail first): test renders title as h4; test renders description; test renders `{durationMinutes} min`; test renders `checkinDate` formatted as `dd/MM/yyyy HH:mm` using `Intl.DateTimeFormat('pt-BR', {dateStyle: 'short', timeStyle: 'short'})`
- [X] T056 [US4] Implement `studyrats-frontend/components/ui/CheckinCard.tsx` — Server Component; props `{checkin: Checkin}`; render title (h4), description (p), duration, formatted date (make T055 tests pass)
- [X] T057 [P] [US4] Write unit tests for `app/(protected)/checkins/page.tsx` in `tests/unit/app/(protected)/checkins.test.tsx` (TDD — must fail first): mock `getServerSession` + `getCheckinsByUser`; test renders list of CheckinCard when check-ins returned; test renders "Nenhum check-in registrado ainda." when list empty; test renders "Histórico de check-ins em breve." when API throws any error
- [X] T058 [US4] Implement `studyrats-frontend/app/(protected)/checkins/page.tsx` — async Server Component; `getServerSession()`; call `getCheckinsByUser` in try-catch; on success render `CheckinCard` list or empty state; on any error render graceful degradation message (make T057 tests pass)

**Checkpoint**: `/checkins` renders history; empty state works; error-state works with simulated 404; `npm test` 100% coverage on all Phase 6 files

---

## Phase 7: User Story 5 — Per-Group Competitive Ranking (Priority: P5)

**Goal**: Authenticated users see a per-group competitive ranking with the current user's row highlighted. Group details and ranking data load in parallel.

**Independent Test**: Navigate to `/groups/{idGroup}/ranking` → table shows members ordered by check-in count; current user's row is highlighted; parallel fetch verified by checking both promises resolve before render.

- [X] T059 [P] [US5] Write unit tests for `getRanking` in `tests/unit/lib/api/groups.test.ts` (TDD — must fail first): test calls `GET /groups/ranking/{idGroup}` with `Authorization` header; test returns `addPosition(unwrapCollection<RankingEntry>(data))`; test `position` field starts at 1 for first entry
- [X] T060 [US5] Add `getRanking(idGroup, token)` to `studyrats-frontend/lib/api/groups.ts` — `GET /groups/ranking/{idGroup}` with explicit Authorization header; `unwrapCollection<RankingEntry>(res.data)` → `addPosition(entries)` (make T059 tests pass)
- [X] T061 [P] [US5] Write unit tests for `components/ui/RankingTable.tsx` in `tests/unit/components/ui/RankingTable.test.tsx` (TDD — must fail first): test renders table with columns `#`, `Nome`, `Check-ins`; test renders entries in received order (no re-sort); test current user row has `font-bold bg-yellow-50` class; test non-current-user rows do not have highlight class
- [X] T062 [US5] Implement `studyrats-frontend/components/ui/RankingTable.tsx` — Server Component; props `{entries: RankingEntry[], currentUserId: string}`; render table with position, firstName, totalCheckins; highlight row where `entry.userId === currentUserId` (make T061 tests pass)
- [X] T063 [P] [US5] Write unit tests for `app/(protected)/groups/[idGroup]/ranking/page.tsx` in `tests/unit/app/(protected)/ranking.test.tsx` (TDD — must fail first): mock `getServerSession`, `getRanking`, `getGroupById`; test calls both with `Promise.all` (mock both resolve); test renders group name as heading; test renders `RankingTable` with ranking data and `currentUserId`; test renders "Nenhum check-in registrado neste grupo ainda." when ranking empty
- [X] T064 [US5] Implement `studyrats-frontend/app/(protected)/groups/[idGroup]/ranking/page.tsx` — async Server Component; `getServerSession()`; `const [ranking, group] = await Promise.all([getRanking(idGroup, token), getGroupById(idUser, idGroup, token)])`; render group name heading; render `<RankingTable>` or empty state (make T063 tests pass)
- [X] T065 [US5] Write Playwright E2E tests in `studyrats-frontend/tests/e2e/ranking.spec.ts` — cover: navigate to ranking page → table rendered; current user row visually distinct; empty ranking page shows graceful message

**Checkpoint**: Ranking page renders; current user highlighted; parallel fetch confirmed; `npm test` 100% coverage on all Phase 7 files

---

## Phase 8: User Story 6 — Create and Join Groups (Priority: P6)

**Goal**: Authenticated users can create new study groups or join existing ones by UUID. Clear error feedback for not-found or already-member scenarios.

**Independent Test**: Create a group → redirected to dashboard → new group appears; join a group by UUID → redirected to dashboard; join with non-existent UUID → error message; join same group again → success redirect (backend is idempotent for already-member).

- [X] T066 [P] [US6] Write unit tests for `createGroup` and `joinGroup` in `tests/unit/lib/api/groups.test.ts` (TDD — must fail first): test `createGroup` calls `POST /groups/create/{idUser}` with JSON body and `Authorization` header; test `createGroup` returns `unwrapEntity<Group>`; test `joinGroup` calls `POST /groupmember/join/{idUser}/{idGroup}`; test `joinGroup` throws `'ALREADY_MEMBER'` on 409 — ⚠️ Note: per research.md, 409 means UUID not found (not already-member), but error message should still read "Grupo não encontrado ou erro ao entrar" for 409; test `joinGroup` returns group data on 201
- [X] T067 [US6] Add `createGroup(idUser, request, token)` and `joinGroup(idUser, idGroup, token)` to `studyrats-frontend/lib/api/groups.ts` — `createGroup`: POST with JSON, return `unwrapEntity`; `joinGroup`: POST, return `unwrapEntity` on `res.data.content ?? res.data`; catch Axios 409 and re-throw `new Error('GROUP_NOT_FOUND')` (make T066 tests pass)
- [X] T068 [P] [US6] Write unit tests for `components/forms/GroupCreateForm.tsx` in `tests/unit/components/forms/GroupCreateForm.test.tsx` (TDD — must fail first): test renders `name` field (required, minLength 3, maxLength 100) and `description` field (optional); test submit calls `createGroup`; test on success calls `router.push('/dashboard')`; test button disabled while in-flight
- [X] T069 [US6] Implement `studyrats-frontend/components/forms/GroupCreateForm.tsx` — `'use client'`; props `{idUser, token}`; react-hook-form; call `createGroup` on submit; `router.push('/dashboard')` on success (make T068 tests pass)
- [X] T070 [US6] Implement `studyrats-frontend/app/(protected)/groups/create/page.tsx` — async Server Component; `getServerSession()`; render `<GroupCreateForm idUser={session!.idUser} token={session!.token} />`
- [X] T071 [P] [US6] Write unit tests for `components/forms/GroupJoinForm.tsx` in `tests/unit/components/forms/GroupJoinForm.test.tsx` (TDD — must fail first): test renders `groupId` field (required); test on success (201) calls `router.push('/dashboard')`; test on 409 shows "Grupo não encontrado ou erro ao entrar"; test on other errors shows same generic message
- [X] T072 [US6] Implement `studyrats-frontend/components/forms/GroupJoinForm.tsx` — `'use client'`; props `{idUser, token}`; react-hook-form; call `joinGroup`; on success `router.push('/dashboard')`; on any error (including 409) show "Grupo não encontrado ou erro ao entrar" (make T071 tests pass)
- [X] T073 [US6] Implement `studyrats-frontend/app/(protected)/groups/join/page.tsx` — async Server Component; `getServerSession()`; render `<GroupJoinForm idUser={session!.idUser} token={session!.token} />`

**Checkpoint**: Create group → dashboard → group visible; join by UUID → dashboard; invalid UUID → error message; `npm test` 100% coverage on all Phase 8 files

---

## Phase 9: Polish & Infrastructure

**Purpose**: Docker containerization, CI gates, security hardening, and branch rename.

- [X] T074 Create `studyrats-frontend/Dockerfile` — 3-stage build: `deps` stage (`npm ci --omit=dev`); `builder` stage (`ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:9090`, `npm run build`); `runner` stage (copy `.next/standalone`, `.next/static`, `public`; `CMD ["node", "server.js"]`)
- [X] T075 Update `studyrats/docker-compose.yml` — add `frontend` service: `build.context: ../studyrats-frontend`, `build.args.NEXT_PUBLIC_API_BASE_URL: http://localhost:9090`, `ports: "3000:3000"`, `environment.API_BASE_URL: http://studyrats-app:9090`, `environment.NODE_ENV: production`, `depends_on: app`, `networks: studyrats-network`
- [ ] T076 Verify full Docker stack: run `docker-compose up --build` from `studyrats/`; confirm all three services start; confirm `http://localhost:3000` loads login page
- [X] T077 [P] Configure gitleaks pre-commit hook — add `.gitleaks.toml` and pre-commit hook script to `studyrats-frontend/`; verify `.env.local` is blocked from commit
- [X] T078 [P] Configure Lighthouse CI — add `lighthouserc.js` to `studyrats-frontend/`; set thresholds: LCP ≤ 2500ms, INP ≤ 200ms, CLS ≤ 0.1; document as required CI step in README
- [X] T079 [P] Add `npm audit` step documentation — add `npm run audit:ci` script to `package.json` (`npm audit --audit-level=high`); document in CI workflow
- [X] T080 Run final coverage gate: `npm run test:coverage` inside `studyrats-frontend/` — all lines/branches/functions must be 100%; resolve any gaps
- [ ] T081 Run full E2E suite: `npm run test:e2e` inside `studyrats-frontend/` against running backend — all auth, check-in, and ranking specs pass (requires live backend)
- [ ] T082 Rename git branch to follow constitution: `git branch -m feat/001-nextjs-frontend-studyrats` (resolves Principle II violation documented in plan.md Constitution Check)

**Checkpoint**: `docker-compose up --build` starts all three services; Lighthouse CI green on all thresholds; 100% unit test coverage; all E2E tests pass; branch name matches constitution pattern

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 complete — **blocks all user stories**
- **Phase 3 (US1 — Auth)**: Depends on Phase 2 ← **start here for MVP**
- **Phase 4 (US2 — Dashboard)**: Depends on Phase 2; benefits from US1 being testable (login needed to reach dashboard)
- **Phase 5 (US3 — Check-in)**: Depends on Phase 2 + US1; check-in requires login
- **Phase 6 (US4 — History)**: Depends on Phase 2 + US1 + US3 (needs check-ins to exist for meaningful testing)
- **Phase 7 (US5 — Ranking)**: Depends on Phase 2 + US1 + US3 (ranking requires check-ins)
- **Phase 8 (US6 — Groups)**: Depends on Phase 2 + US1; US2 (dashboard) must exist to verify group appears after creation
- **Phase 9 (Polish)**: Depends on all user story phases complete

### User Story Dependencies

| Story | Depends on | Can start after |
|-------|-----------|-----------------|
| US1 — Auth | Foundational | Phase 2 complete |
| US2 — Dashboard | Foundational | Phase 2 complete (needs US1 for E2E) |
| US3 — Check-in | US1 (auth) | US1 complete |
| US4 — History | US1 + US3 | US3 complete |
| US5 — Ranking | US1 + US3 | US3 complete |
| US6 — Groups | US1 (auth) | US1 complete |

### Within Each User Story

1. Write tests → confirm they fail (TDD red)
2. Implement → confirm tests pass (TDD green)
3. Refactor if needed
4. Verify story-level checkpoint before moving to next story

### Parallel Opportunities

- All [P] tasks within Phase 1 can run simultaneously after T001+T002 complete
- All [P] tasks within Phase 2 can run simultaneously (different files)
- US3, US4, US5, US6 can all be worked in parallel after US1 completes (if staffed)
- Test tasks [P] within each story can run in parallel with sibling test tasks

---

## Parallel Example: Phase 2 (Foundational)

```bash
# After T011 (types/index.ts) is done, launch all TDD-red tasks simultaneously:
Task T012: "Write unit tests for lib/api/hateoas.ts"
Task T014: "Write unit tests for lib/auth/session.ts"
Task T016: "Write unit tests for lib/api/client.ts"
Task T018: "Write unit tests for contexts/AuthContext.tsx"
Task T020: "Write unit tests for middleware.ts"
Task T022: "Write unit tests for app/layout.tsx"
Task T024: "Write unit tests for app/(protected)/layout.tsx"
# Then implement each in dependency order
```

## Parallel Example: After US1 (Auth) is complete

```bash
# All four stories can start simultaneously:
Task T041: "Write unit tests for lib/api/groups.ts getGroupsByUser"  [US2]
Task T047: "Write unit tests for lib/api/checkin.ts createCheckin"  [US3]
Task T066: "Write unit tests for lib/api/groups.ts createGroup/joinGroup"  [US6]
# US4 (history) and US5 (ranking) after US3 check-in is complete
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**critical — blocks everything**)
3. Complete Phase 3: User Story 1 (auth)
4. **STOP AND VALIDATE**: Register → login → logout cycle works end-to-end
5. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. + Phase 3 (US1 — Auth) → Users can log in → **MVP**
3. + Phase 4 (US2 — Dashboard) → Users see their groups
4. + Phase 8 (US6 — Groups) → Users can create/join groups
5. + Phase 5 (US3 — Check-in) → Users can record study sessions
6. + Phase 7 (US5 — Ranking) → Users can see competitive rankings
7. + Phase 6 (US4 — History) → Users can review their history
8. + Phase 9 (Polish) → Docker deploy; CI gates; security hardening

### Parallel Team Strategy

With multiple developers (after Phase 2 complete):
- **Dev A**: US1 (Auth) → blocks others, highest priority
- Once US1 complete:
  - **Dev A**: US3 (Check-in)
  - **Dev B**: US2 (Dashboard) + US6 (Groups)
  - **Dev C**: US5 (Ranking) + US4 (History) — after US3 completes

---

## Notes

- **TDD is mandatory** per constitution: write test → confirm it fails → implement → confirm it passes → refactor
- **100% coverage** is enforced: `jest --coverage` must show 100% lines/branches/functions; `/* istanbul ignore */` requires written justification
- **[P] tasks** touch different files — safe to parallelize with no merge conflicts
- **`birthday` field**: the registration BFF route remaps `birthDate → birthday` before forwarding to backend (see research.md Finding 3)
- **Login 202**: `loginBackend` in `lib/api/auth.ts` must accept HTTP 202 as success (see research.md Finding 2)
- **Join 409**: means "UUID not found" — backend is idempotent for already-member (returns 201 silently) — see research.md Finding 4
- **Branch rename** (T082) resolves the constitution violation documented in plan.md; do this before opening PR
- Commit after each completed task or logical group using semantic commit format: `feat(auth): implement login BFF route`
