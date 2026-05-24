# SPDD Analysis: Next.js Frontend for StudyRats

## Original Business Requirement

> No meu projeto da pasta /studyrats possui meu backend, com hateoas, se trata de um projeto para cadastro de grupo de estudos onde as pessoas entram em grupo e fazem checkin, assim elas competem entre si par saber o ranking.
> Preciso criar uma aplicacao com next.js com SSR, com tela de login, cadastro, checkin, listagem de grupos participantes, listagem de checking, ranking consumindo os endpoints do backend

---

## Domain Concept Identification

### Existing Concepts (from codebase)

- **User**: Authentication subject and platform participant — has firstName, lastName, email, passwordHash, birthDate; implements Spring Security `UserDetails`; identified by UUID (`userId`); exposed via `RegisterUserResponse(name, email, idUser)` on register and `LoginUserResponse(username, token, idUser)` on login
- **Group**: Study group entity — has name, description, createdAt; identified by UUID; exposed via `GroupResponseDTO(id, name, description, createdAt, memberships)`
- **GroupMembership**: Association between a User and a Group — carries a role (`ADMIN` or `MEMBER`) and a `joinedAt` timestamp; represents a user's participation in one or more groups
- **Checkin**: Daily study session record attached to a user across all their groups simultaneously — has title, description, durationMinutes, optional image (stored as LONGBLOB), checkinDate; business rule: one checkin per user per group per day enforced in service
- **Ranking**: Derived concept computed via JPQL `GROUP BY` on `GroupMembership LEFT JOIN Checkin` — exposes `(userId, firstName, totalCheckins)` ordered descending; scoped per group
- **Role**: System-level authority (`ADMIN`, `MEMBER`) associated to a user via `users_roles` join table; drives `@PreAuthorize` checks on certain endpoints

### New Concepts Required

- **AuthSession**: Client-side representation of the authenticated session — encapsulates `token` (JWT Bearer), `idUser`, and `username`; does not exist in the backend; must be managed by the frontend; requires a storage and lifecycle strategy compatible with Next.js SSR
- **NavigationState**: Page routing and protection concept — public routes (login, register) vs. protected routes (checkin, groups, ranking); does not exist in the backend; must be implemented as Next.js middleware or route guards

### Key Business Rules

- **One checkin per user per group per day**: A user cannot register a second checkin in the same group on the same calendar day; enforced in `CheckinService.hasCheckedInTodayForGroup`
- **Checkin is broadcast to all groups**: When a user submits a checkin, a single call creates checkin records for every group the user belongs to — there is no per-group selection at checkin time
- **Group creator becomes ADMIN member**: Group creation via `POST /groups/create/{idUser}` automatically registers the creator as an ADMIN in that group (inferred from `GroupService.save`)
- **All non-auth endpoints require JWT**: Only `POST /users/create` and `POST /users/login` are publicly accessible; all other endpoints require a valid `Authorization: Bearer <token>` header
- **Admin-only listing**: `GET /users/all` and `GET /groups/all` require the `ADMIN` role; regular users cannot access these
- **Ranking is per group**: Ranking is scoped to a single group (`GET /groups/ranking/{idGroup}`); there is no global cross-group ranking endpoint

---

## Strategic Approach

### Solution Direction

- Build a **Next.js 14+ App Router** application that acts as a consumer of the existing Spring Boot + HATEOAS backend running at `http://localhost:9090`
- Use **Server-Side Rendering (SSR)** via `getServerSideProps` or App Router server components for pages that require authenticated data (groups listing, checkin history, ranking) to enable proper SSR with session context
- Store the JWT token in an **httpOnly cookie** so it is accessible both from server components during SSR and from client-side API calls — this is the only storage strategy compatible with SSR
- Abstract backend API calls behind a typed **API client layer** that handles HATEOAS HAL+JSON response parsing (`_embedded`, `_links`), automatic Bearer token injection, and multipart/form-data for checkin
- Protect routes via **Next.js middleware** that validates the presence of the auth cookie before rendering protected pages; redirect to `/login` if absent

### Key Design Decisions

- **JWT storage — httpOnly cookie vs. localStorage**: localStorage cannot be read server-side, making SSR impossible for authenticated pages → **Recommendation: httpOnly cookie** set on login response, cleared on logout; trade-off is that the cookie is not accessible via JavaScript (less flexible but more secure)
- **HAL+JSON (HATEOAS) parsing**: The backend returns `application/hal+json` with `_embedded` wrappers (e.g., collection responses) and `_links` blocks; the frontend must unwrap these structures → **Recommendation: a thin HATEOAS client utility** that normalizes responses before passing to components; do not expose HAL structure to UI components
- **Auth state on the client**: After SSR, the client still needs access to `idUser` and `username` for client-side navigation and conditional rendering → **Recommendation: React Context** populated from the httpOnly cookie value decoded server-side and hydrated as a non-sensitive user object (no token) into a context provider in the layout
- **Checkin endpoint uses multipart/form-data**: Unlike all other endpoints which use JSON, checkin uses `multipart/form-data` with `@RequestParam` fields; the frontend must send a `FormData` object, not `JSON.stringify` → this is a notable integration point that differs from other API calls
- **Group discovery for joining**: There is no public `GET /groups` endpoint for non-admin users; a user can only join a group if they know the `idGroup` → **Recommendation: surface this as a gap (see Risk section); for the initial frontend, the join-group screen requires group ID input or a separate group code mechanism**

### Alternatives Considered

- **Client-side rendering (SPA) only**: Would avoid SSR complexity but contradicts the stated requirement for SSR; also degrades initial load performance and SEO
- **Token storage in localStorage**: Simpler implementation but incompatible with SSR — server components cannot read localStorage; also susceptible to XSS
- **Next.js Pages Router instead of App Router**: Pages Router is more familiar but App Router is the current Next.js standard and better aligned with React Server Components for SSR; rejected in favor of App Router unless the user specifies otherwise

---

## Risk & Gap Analysis

### Requirement Ambiguities

- **"Listagem de checkins"**: The requirement requests a checkin listing screen, but the backend has **no GET endpoint for checkins** — `CheckinController` only exposes `POST /checkin/{idUser}`; it is unclear whether the listing should show the authenticated user's own checkins, checkins within a group, or all checkins; **this requires either a new backend endpoint or a clarification on scope**
- **"Listagem de grupos participantes"**: The endpoint `GET /groups/user/{idUser}` requires the `idUser` as a path variable; the frontend must have the userId available at render time — confirmed possible via the auth cookie strategy, but the naming of the path parameter (`idUser`) implies it fetches groups for any user, not necessarily the authenticated one; **clarify whether users should be able to view other users' groups**
- **Group joining flow**: There is no browsable group list for regular users (`GET /groups/all` is ADMIN-only); the requirement mentions "cadastro de grupo" (group registration/joining) but does not specify how a user discovers a group to join — **is group discovery out of scope for the frontend, or does a new endpoint need to be added to the backend?**
- **Ranking scope**: The ranking endpoint is per-group; the requirement says "ranking" without specifying whether this is a per-group view (user navigates to a specific group's ranking) or a cross-group leaderboard — **needs clarification**
- **Register flow after login vs. register**: The requirement lists both login and register screens; after registration, `RegisterUserResponse` returns `name, email, idUser` but no JWT token — meaning the user must log in separately after registering; **clarify whether auto-login after register is expected**

### Edge Cases

- **Checkin when user belongs to no group**: `CheckinService.createCheckin` returns an empty list if the user has no group memberships; the frontend checkin screen must handle this case with a clear message (e.g., "Join a group before checking in")
- **Checkin already done today**: If all groups already have a checkin for today, the service returns an empty list; the frontend must distinguish between "no groups to check in to" and "already checked in everywhere today"
- **Image upload on checkin**: The checkin form includes an optional image upload (`MultipartFile image`); the image is stored as a LONGBLOB in MySQL; the frontend must handle file selection, size/type validation client-side, and send as a `multipart/form-data` part — there are no size limits enforced in the backend, which is a risk for large uploads
- **JWT expiry**: There is no visible token expiry configuration in the files read; if the token never expires, there is no automatic logout; if it does expire, the frontend must handle 401 responses and redirect to login
- **CORS on cross-origin requests**: The SecurityConfig calls `cors.configure(http)` without a declared `CorsConfigurationSource` bean; Spring's default CORS behavior without an explicit bean may block requests from the Next.js dev server (typically `http://localhost:3000`) to the backend (`http://localhost:9090`) — this is a high-probability integration blocker
- **HATEOAS link construction mismatch**: In `UserController`, the HATEOAS link to `CheckinController.createCheckin` is built with 2 arguments but the actual method signature has 5 parameters — this is a likely compilation error or stale link-building code that should be verified before frontend integration

### Technical Risks

- **Missing GET /checkin endpoint (HIGH)**: The "listagem de checkins" page has no backend API to power it; a new endpoint must be added to the backend before the frontend page can be built; this is a **scope gap that requires backend work** — potential impact: delays frontend delivery for that specific screen
- **CORS not explicitly configured (HIGH)**: Without a `CorsConfigurationSource` bean, cross-origin requests from `http://localhost:3000` (Next.js) to `http://localhost:9090` (Spring Boot) will be blocked by the browser; a `@Bean CorsConfigurationSource` must be added to `SecurityConfig` before any frontend integration test can succeed
- **HAL+JSON response format (MEDIUM)**: All backend responses are `application/hal+json` with HATEOAS `_embedded` and `_links` wrappers; the frontend API client must correctly unwrap these structures — particularly `CollectionModel` responses where data is inside `_embedded.<entity-name>List` or similar; incorrect parsing will cause silent data loss
- **Checkin multipart vs. JSON inconsistency (MEDIUM)**: Every other endpoint uses `application/json`; only checkin uses `multipart/form-data`; this breaks a uniform API client pattern and requires special handling; developers building the frontend must be explicitly aware of this exception
- **No group browsing for regular users (MEDIUM)**: A regular authenticated user cannot discover groups to join; the join endpoint requires knowing the `idGroup` in advance; this makes the "join group" flow undiscoverable without additional backend support or a workaround (e.g., share group ID via external channel)
- **Large image storage as LONGBLOB in MySQL (LOW)**: Storing images as LONGBLOB is functional but not scalable; CLAUDE.md notes a roadmap item to migrate to S3; for the frontend, this means the current checkin image upload will work but may degrade performance under load — the frontend should enforce reasonable file size limits client-side

### Acceptance Criteria Coverage

The requirement does not list formal ACs; the following table derives implicit ACs from the stated screens and features:

| AC# | Description | Addressable? | Gaps / Notes |
|-----|-------------|--------------|--------------|
| 1 | Login screen — authenticate with email/password, receive JWT, redirect to app | Yes | `POST /users/login` returns `token + idUser`; CORS must be resolved first |
| 2 | Register screen — create user account, redirect to login | Yes | `POST /users/create` exists; auto-login after register is not supported — user must log in separately |
| 3 | Checkin screen — submit a checkin (title, description, duration, optional image) | Yes | `POST /checkin/{idUser}` exists; uses multipart/form-data; checkin goes to all groups simultaneously |
| 4 | Listing of participated groups | Yes | `GET /groups/user/{idUser}` exists; requires `idUser` in session |
| 5 | Listing of checkins | Partial | No backend GET endpoint exists; requires new backend endpoint or scope clarification before this page can be built |
| 6 | Ranking | Yes | `GET /groups/ranking/{idGroup}` exists; requires navigating to a specific group first; no cross-group ranking available |
| 7 | SSR (Server-Side Rendering) | Yes | Achievable with Next.js App Router + httpOnly cookie strategy for JWT |
| 8 | Group creation | Partial | `POST /groups/create/{idUser}` exists; no group-discovery mechanism for non-admin users; join flow requires prior knowledge of group ID |
