# Feature Specification: Next.js SSR Frontend for StudyRats Platform

**Feature Branch**: `001-nextjs-frontend-studyrats`

**Created**: 2026-05-24

**Status**: Draft

**Input**: Build a Next.js 14+ App Router SSR frontend for StudyRats that lets users register, log in, perform daily study check-ins, list groups, view check-in history, and see per-group competitive rankings — consuming the existing Spring Boot HATEOAS backend at localhost:9090.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure Registration and Login (Priority: P1)

A new visitor arrives at the platform, creates an account, and logs in. After logging in, they are taken to their dashboard. If they navigate back to the login page while already authenticated, they are automatically redirected to the dashboard. When they log out, they are returned to the login page and cannot access protected pages without re-authenticating.

**Why this priority**: Authentication is the entry point to every other feature. Without it, no other story is accessible. It also establishes the secure session model used throughout the application.

**Independent Test**: Can be fully tested by registering a new user, logging in, verifying the dashboard appears, navigating to `/login` to confirm redirection, and logging out to confirm all protected pages become inaccessible.

**Acceptance Scenarios**:

1. **Given** a visitor on `/register`, **When** they submit valid first name, last name, email, password (min 6 chars), and a past birth date, **Then** they are redirected to `/login` with a success indicator.
2. **Given** a visitor on `/register`, **When** they submit an email that already exists, **Then** the form shows "Este email já está cadastrado" and the user is not redirected.
3. **Given** a visitor on `/login`, **When** they submit correct email and password, **Then** they are redirected to `/dashboard` and their name is visible in the UI.
4. **Given** a visitor on `/login`, **When** they submit incorrect credentials, **Then** the form shows "Email ou senha inválidos".
5. **Given** an authenticated user on `/login`, **When** the page loads, **Then** they are automatically redirected to `/dashboard`.
6. **Given** an authenticated user, **When** they click "Sair" (logout), **Then** all session cookies are cleared and they are redirected to `/login`.
7. **Given** an unauthenticated visitor, **When** they navigate directly to `/dashboard`, **Then** they are redirected to `/login`.

---

### User Story 2 - Dashboard: View My Groups (Priority: P2)

An authenticated user lands on their dashboard and immediately sees all study groups they belong to — with name, description, member count, and creation date — without any manual page refresh or loading spinner. From the dashboard they can navigate to create a new group or join an existing one.

**Why this priority**: The dashboard is the central hub. It provides orientation and navigational context for all group-related activity.

**Independent Test**: Can be fully tested by logging in, verifying the dashboard shows the user's groups with correct information, and confirming the empty state message when the user has no groups.

**Acceptance Scenarios**:

1. **Given** an authenticated user who belongs to at least one group, **When** they open `/dashboard`, **Then** each group card shows the group name, description (truncated at 100 chars), member count, and creation date formatted as `dd/MM/yyyy`.
2. **Given** an authenticated user with no group memberships, **When** they open `/dashboard`, **Then** the empty state message "Você ainda não pertence a nenhum grupo." is shown.
3. **Given** an authenticated user on `/dashboard`, **When** the page loads, **Then** data is rendered on the first paint without a client-side loading spinner.
4. **Given** an authenticated user on `/dashboard`, **When** they click "Criar Grupo", **Then** they are taken to the group creation form.
5. **Given** an authenticated user on `/dashboard`, **When** they click "Entrar em Grupo", **Then** they are taken to the group join form.

---

### User Story 3 - Daily Study Check-in (Priority: P3)

An authenticated user registers a study session by submitting a check-in form with a title, description, duration in minutes, and an optional image. The system registers the check-in across all groups the user belongs to simultaneously. The user receives clear feedback: success with the count of groups registered, a specific message if they already checked in today or have no groups, or an error if something went wrong.

**Why this priority**: The check-in is the core value-generating action of the platform. It feeds the ranking and history features.

**Independent Test**: Can be fully tested by submitting a check-in form as a user who belongs to at least one group, verifying the success message and group count, and re-submitting to verify the "already checked in" state.

**Acceptance Scenarios**:

1. **Given** an authenticated user on `/checkin` who belongs to one or more groups, **When** they submit a valid check-in form, **Then** a success message "Check-in registrado em X grupos!" is shown (where X is the group count).
2. **Given** an authenticated user who has already checked in today, **When** they submit the check-in form, **Then** the message "Você já fez check-in em todos os seus grupos hoje, ou não pertence a nenhum grupo." is shown.
3. **Given** an authenticated user on `/checkin`, **When** they attach an image over 5MB, **Then** the field shows "Imagem muito grande (máx 5MB)" and the form is not submitted.
4. **Given** an authenticated user on `/checkin`, **When** they enter `durationMinutes` less than 1, **Then** the field shows a validation error and the form is not submitted.
5. **Given** an authenticated user on `/checkin`, **When** the page renders, **Then** a visible notice states that the check-in will be registered across all groups simultaneously.
6. **Given** a network error during submission, **When** the form is submitted, **Then** the message "Erro ao registrar check-in. Tente novamente." is shown.

---

### User Story 4 - Check-in History (Priority: P4)

An authenticated user navigates to `/checkins` and sees their full study history in reverse chronological order — title, description, duration, and formatted date for each entry. If they have no check-ins, an appropriate empty state is shown. If the endpoint is unavailable, a graceful degradation message is shown instead of an error.

**Why this priority**: History gives users visibility into their own progress and motivates continued engagement.

**Independent Test**: Can be fully tested by navigating to `/checkins` as a user with at least one check-in and verifying each entry shows correct details; and again as a user with no check-ins to verify the empty state.

**Acceptance Scenarios**:

1. **Given** an authenticated user with check-in history, **When** they open `/checkins`, **Then** each entry shows title, description, duration in minutes, and date formatted as `dd/MM/yyyy HH:mm`, ordered most recent first.
2. **Given** an authenticated user with no check-in history, **When** they open `/checkins`, **Then** the message "Nenhum check-in registrado ainda." is shown.
3. **Given** the check-in history endpoint is unavailable (e.g., 404), **When** the page loads, **Then** the message "Histórico de check-ins em breve." is shown instead of an error page.

---

### User Story 5 - Per-Group Competitive Ranking (Priority: P5)

An authenticated user navigates to the ranking page for a specific group and sees all members ordered by total check-ins, with their own row visually highlighted. The group name is displayed as the page heading. If no one has checked in yet, an appropriate empty state is shown.

**Why this priority**: Rankings drive competitive motivation and group engagement. It requires both the group and ranking data, making it dependent on earlier stories.

**Independent Test**: Can be fully tested by navigating to a group ranking page as a member, verifying the table shows correct position, name, and check-in count, and verifying the current user's row is highlighted.

**Acceptance Scenarios**:

1. **Given** an authenticated user on `/groups/{idGroup}/ranking`, **When** the page loads, **Then** the group name is shown as a heading and the ranking table lists all members in order: position (`#`), first name, and total check-ins.
2. **Given** the current user is ranked in the group, **When** the ranking table renders, **Then** their row is visually distinct (bold text with a yellow background highlight).
3. **Given** no member of the group has checked in, **When** the ranking page loads, **Then** "Nenhum check-in registrado neste grupo ainda." is shown.
4. **Given** the ranking page loads, **When** data is fetched, **Then** group details and ranking data are retrieved in parallel (not sequentially).

---

### User Story 6 - Create and Join Groups (Priority: P6)

An authenticated user can create a new study group by providing a name and optional description, or join an existing group by entering its UUID. On success they are returned to the dashboard. Attempting to join a group they already belong to surfaces a specific error message.

**Why this priority**: Groups must exist before rankings and check-ins are meaningful. However, since the backend may have pre-existing groups, this is lower priority than reading group data.

**Independent Test**: Can be fully tested by creating a group, verifying it appears on the dashboard, then attempting to join the same group to verify the "already member" error.

**Acceptance Scenarios**:

1. **Given** an authenticated user on `/groups/create`, **When** they submit a name (3–100 chars) and optional description, **Then** the group is created and they are redirected to `/dashboard`.
2. **Given** an authenticated user on `/groups/join`, **When** they submit a valid group UUID they are not yet a member of, **Then** they are redirected to `/dashboard`.
3. **Given** an authenticated user on `/groups/join`, **When** they submit a group UUID they already belong to, **Then** "Você já é membro deste grupo" is shown.
4. **Given** an authenticated user on `/groups/join`, **When** they submit a non-existent UUID, **Then** "Grupo não encontrado ou erro ao entrar" is shown.

---

### Edge Cases

- What happens when the JWT cookie expires mid-session while a client-side action is in progress? The Axios interceptor detects a 401 response and redirects to `/login`.
- What happens when a user submits the check-in form while the backend is unreachable? A network error message is shown; the form remains accessible for retry.
- What happens when an image file passes the size check but has a non-image MIME type? The file input uses `accept="image/*"` to prevent selection; backend validation is a secondary safeguard.
- What happens when a user navigates directly to `/groups/{unknownId}/ranking`? The page attempts to fetch the group; a backend 404 or 401 surfaces as a graceful error state.
- What happens when the registration birth date is today or in the future? The form validation rejects it with an inline error before submission reaches the backend.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow unauthenticated users to register with first name, last name, email, password, and birth date.
- **FR-002**: The system MUST reject registration when the email is already in use, displaying a specific error message in Portuguese.
- **FR-003**: The system MUST validate that the birth date entered during registration is strictly before today.
- **FR-004**: The system MUST validate that the password entered during registration has a minimum of 6 characters.
- **FR-005**: The system MUST allow registered users to log in with email and password, establishing a secure session.
- **FR-006**: The system MUST persist authenticated session state using secure, httpOnly cookies so that protected pages render server-side without exposing the token to client-side JavaScript.
- **FR-007**: The system MUST redirect unauthenticated users attempting to access any protected page to `/login`.
- **FR-008**: The system MUST redirect authenticated users who visit `/login` or `/register` to `/dashboard`.
- **FR-009**: The system MUST allow authenticated users to log out, clearing all session state and redirecting to `/login`.
- **FR-010**: The system MUST display the authenticated user's groups on the dashboard, rendered on first page paint without a client-side loading spinner.
- **FR-011**: The system MUST show an empty state message when the authenticated user has no group memberships.
- **FR-012**: The system MUST allow authenticated users to create a study group with a name (3–100 characters) and optional description.
- **FR-013**: The system MUST allow authenticated users to join an existing group by entering a group UUID.
- **FR-014**: The system MUST surface a specific error when a user attempts to join a group they already belong to.
- **FR-015**: The system MUST allow authenticated users to submit a daily study check-in with a title, description, duration in minutes (minimum 1), and an optional image (max 5MB, image type only).
- **FR-016**: The system MUST register the check-in across all groups the user belongs to simultaneously and inform the user how many groups received the check-in.
- **FR-017**: The system MUST display a contextual message when a check-in submission results in an empty response (already checked in today, or no group memberships).
- **FR-018**: The system MUST include a visible notice on the check-in form that a single submission applies to all of the user's groups.
- **FR-019**: The system MUST display the authenticated user's check-in history in reverse chronological order.
- **FR-020**: The system MUST gracefully degrade the check-in history page if the backend endpoint is unavailable, showing a message instead of an error.
- **FR-021**: The system MUST display a per-group competitive ranking ordered by total check-ins, with the current user's row visually highlighted.
- **FR-022**: The system MUST fetch group details and ranking data in parallel when loading a ranking page.
- **FR-023**: The system MUST normalize all HATEOAS backend responses before use — no page, component, or service may read `_embedded` or `_links` directly.
- **FR-024**: The system MUST include CORS support on the backend to allow browser-originated requests from the frontend origin.
- **FR-025**: The system MUST expose a backend endpoint to retrieve check-in history for a given user.
- **FR-026**: The system MUST be deployable as a Docker container that joins the same network as the backend and database, startable with a single `docker-compose up --build` command.

### Key Entities

- **AuthSession**: Represents an active authenticated session with user identity and a bearer token. Stored server-side in an httpOnly cookie; never exposed to client-side JavaScript.
- **UserIdentity**: The non-sensitive subset of session data (user ID and display name) exposed to the client-side UI for personalisation.
- **Group**: A study group with a name, description, creation date, and a list of membership summaries (member count, roles, join dates).
- **MembershipSummary**: Represents a user's membership in a group, including their role (ADMIN or MEMBER) and join date.
- **Checkin**: A recorded study session with a title, description, duration in minutes, and the date/time it was recorded.
- **RankingEntry**: A member's standing within a group, including their first name, total check-in count, and their computed position in the ranking.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete registration and arrive at their dashboard in under 2 minutes from a fresh browser tab.
- **SC-002**: An authenticated user's dashboard renders with their group list visible on first page load, without any intermediate loading state visible to the user.
- **SC-003**: A check-in form can be completed and submitted, with a result message shown, in under 60 seconds.
- **SC-004**: The ranking page for a group shows correct standings immediately on load, with no visible delay from sequential data fetching.
- **SC-005**: 100% of browser-originated API requests succeed without CORS errors once the backend CORS fix is deployed.
- **SC-006**: All user-facing error messages are in Portuguese and specific to the error condition — no generic "server error" messages for known error cases (duplicate email, wrong credentials, already a member).
- **SC-007**: The entire platform stack (database, backend, frontend) starts successfully from a single command with no manual configuration steps.
- **SC-008**: An unauthenticated user who navigates to any protected URL is redirected to `/login` before any protected content begins to render.

---

## Assumptions

- The existing Spring Boot backend at `localhost:9090` is running and accessible during local development; the frontend does not need to start the backend.
- The backend JWT tokens are treated as opaque strings by the frontend; no decoding or validation of the token payload is performed client-side.
- The backend's ranking endpoint returns members ordered by total check-ins descending; the frontend displays them in received order without re-sorting.
- The `position` field in a ranking entry is not returned by the backend; it is computed sequentially by the frontend (1st = position 1, 2nd = position 2, etc.).
- The check-in endpoint returns an empty collection (HTTP 200 with empty body) for both "already checked in today" and "no group memberships" — the frontend cannot distinguish between the two and presents a combined message.
- Mobile responsiveness is expected but not the primary design target for v1; the layout should be functional on mobile without dedicated mobile-first design work.
- The Docker deployment assumes the backend service is named `studyrats-app` on the shared Docker network, as this is already established in the existing `docker-compose.yml`.
- All user-facing text is in Brazilian Portuguese (`pt-BR`); no internationalisation or language switching is required.
- The backend does not return a JWT on registration; users must log in separately after registering.
- Image upload during check-in is optional; submissions without an image are fully supported.
