# Research: Next.js SSR Frontend for StudyRats Platform

**Phase**: 0 — Research & Unknowns Resolution
**Branch**: `001-nextjs-frontend-studyrats`
**Date**: 2026-05-24

---

## Summary of Findings

All unknowns from the SPDD prompt resolved through direct inspection of the existing Spring Boot backend source code. No external research required — every decision derives from confirmed implementation details.

---

## Finding 1: Backend Prerequisites Status

**Decision**: Both backend prerequisites described in the SPDD prompt are **already implemented** in the codebase.

**Evidence**:
- `SecurityConfig.java` already declares `@Value("${app.cors.allowed-origins:http://localhost:3000}")` and `corsConfigurationSource()` bean using `setAllowedOriginPatterns`, `setAllowedCredentials(true)`, all required methods/headers.
- `application.properties` already has `app.cors.allowed-origins=http://localhost:3000`.
- `CheckinController.java` already has `@GetMapping("/user/{idUser}")` backed by `checkinService.getCheckinsByUser(idUser)`.
- `CheckinRepository.java` already has `findByUserUserIdOrderByCheckinDateDesc(String userId)` derived query.
- `CheckinService.java` already has `getCheckinsByUser(String userId)`.

**Implication**: No backend changes are required before frontend integration. Both CORS and the history endpoint are production-ready.

---

## Finding 2: Login Endpoint Returns HTTP 202, Not 200

**Decision**: The `POST /users/login` handler returns `HttpStatus.ACCEPTED` (202), not 200.

**Evidence** (`UserController.java`):
```java
return ResponseEntity.status(HttpStatus.ACCEPTED)
        .contentType(MediaTypes.HAL_JSON)
        .body(EntityModel.of(loginResponse, ...));
```

**Implication**: The BFF `/api/auth/login` route must treat HTTP 202 as a success response, not just 200. Axios does not throw on 2xx status codes, so the existing logic works — but the route should explicitly handle 202. The login response shape is confirmed as `{username, token, idUser}` (from `LoginUserResponse` record).

---

## Finding 3: Registration Request Field Discrepancy (`birthday` vs `birthDate`) and Required `role` Field

**Decision**: The registration endpoint expects `birthday` (not `birthDate`) and requires a `role` field of type `RoleName` enum.

**Evidence** (`UserRequest.java`):
```java
public record UserRequest(
    String firstName, String lastName, String email,
    String password,
    LocalDate birthday,   // ← not birthDate
    RoleName role         // ← required; enum: ROLE_ADMIN | ROLE_USER
)
```

**Evidence** (`UserService.createUser`):
```java
.birthDate(user.birthday())
.roles(List.of(Role.builder().name(user.role()).build()))
```

**Implication**: The registration form must send `{ birthday: "YYYY-MM-DD", role: "ROLE_USER" }`. The form field name can remain `birthDate` for UX but the JSON sent to the backend API route must use `birthday`. The registration API route (`/api/auth/register`) must remap `birthDate → birthday` and inject `role: "ROLE_USER"` before proxying to `POST /users/create`.

**Alternatives considered**: Changing the backend field name — rejected, backend is stable and out of scope for this feature.

---

## Finding 4: Group Join — 409 Means "Not Found", Not "Already Member"

**Decision**: `POST /groupmember/join/{idUser}/{idGroup}` returns HTTP **409** only when user or group UUID does not exist. When a user is already a member, the service returns 201 with the existing group data (silently idempotent).

**Evidence** (`GroupMemberShipService.java`):
```java
boolean alreadyMember = group.getMemberships().stream()
        .anyMatch(m -> m.getUser().getUserId().equals(userId));
if (alreadyMember) {
    return Optional.of(GroupMapper.toDTO(group));  // ← non-empty → 201
}
```

```java
if (optionalUser.isEmpty() || optionalGroup.isEmpty()) {
    return Optional.empty();  // ← empty → 409
}
```

**Implication**: The "already member" detection cannot be driven by HTTP status alone. The frontend must handle 409 as "group or user UUID not found" and display "Grupo não encontrado ou erro ao entrar". The "already member" scenario silently produces a 201 response — the frontend cannot distinguish it from a successful new join. Both are treated as success and redirect to dashboard. The SPDD spec's assumption that 409 = already-member is incorrect; the frontend error mapping must be corrected.

**Alternatives considered**: Changing the backend to return 409 on already-member — rejected, backend is stable.

---

## Finding 5: MembershipDTO Fields Populated in GroupMapper

**Decision**: `GroupMapper.mapMembership` populates only `id`, `joinedAt`, `role`, `userId`, `userFirstName`. The fields `groupId` and `groupName` are **not set** (null in JSON response).

**Evidence** (`GroupMapper.java`):
```java
return MembershipDTO.builder()
    .id(membership.getId())
    .joinedAt(membership.getJoinedAt())
    .role(membership.getRole().name())
    .userId(membership.getUser().getUserId())
    .userFirstName(membership.getUser().getFirstName())
    .build();  // ← groupId and groupName not set → null
```

**Implication**: The TypeScript `MembershipSummary` interface should not declare `groupId` or `groupName`. The confirmed interface is `{ id: string; role: 'ADMIN' | 'MEMBER'; joinedAt: string; userId: string; userFirstName: string }`. However, since the frontend spec only uses `id`, `role`, `joinedAt`, and `memberships.length` for member count, the additional fields can be safely ignored.

---

## Finding 6: Checkin JSON Serialization — `user` and `group` Not Included

**Decision**: `Checkin` entity fields `user` and `group` use `@JsonBackReference` and are **not serialized** in JSON responses.

**Evidence** (`Checkin.java`):
```java
@JsonBackReference("user-checkin")
private User user;
@JsonBackReference("group-checkin")
private Group group;
```

**Implication**: Checkin response fields are: `id`, `title`, `description`, `durationMinutes`, `checkinDate` (ISO 8601 LocalDateTime), `imageData` (Base64-encoded byte array or null), `imageContentType` (string or null). The TypeScript `Checkin` interface matches the spec. The `imageData` field will be included in history responses — large for check-ins with images — but the `CheckinCard` component does not display images so the field is safely ignored.

---

## Finding 7: HAL Embedded Key Names

**Decision**: Spring HATEOAS auto-generates `_embedded` keys using the DTO class name in camelCase + "List". E.g., `groupResponseDTOList`, `checkinList`.

**Implication**: The `unwrapCollection<T>` function must use `Object.keys(response._embedded)[0]` (first key) to be agnostic to the specific key name. This is already the design in the SPDD spec — confirmed correct.

---

## Finding 8: RankingDTO Is Not Wrapped in EntityModel

**Decision**: `CollectionModel.of(ranking, ...)` in `GroupController.getRanking` wraps `List<RankingDTO>` directly — not `List<EntityModel<RankingDTO>>`. Each entry in `_embedded` is a plain object without `_links`.

**Implication**: `unwrapCollection<RankingEntry>` strips `_links` from each item. Since ranking items have no `_links`, stripping is a no-op. The `addPosition` step correctly adds the `position` field after unwrapping.

---

## Finding 9: Technology Stack Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Framework | Next.js 14+ App Router | Specified; SSR-first requirement |
| Language | TypeScript 5 strict mode | Specified; constitution requires 100% typed |
| Styling | Tailwind CSS | Specified; matches create-next-app template |
| HTTP client | Axios | Specified; HATEOAS header handling |
| Auth state | httpOnly cookie (BFF pattern) | Specified; security constraint |
| Forms | react-hook-form | Specified |
| Unit testing | Jest + React Testing Library | Default with create-next-app; Next.js 14 Jest preset available |
| E2E testing | Playwright | Constitution: "Playwright ou Cypress"; Playwright preferred for SSR/Server Components |
| Code quality | ESLint (Next.js config) + Prettier | Constitution requirement |
| Container | node:18-alpine multi-stage | Specified; mirrors backend Dockerfile pattern |
| Node version | 18 (minimum) | Next.js 14 requirement |

---

## Finding 10: Constitution Compliance Pre-Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Semantic commits | REQUIRES PLANNING | Dev workflow must enforce; CI hook needed |
| Semantic branches | **VIOLATION** | Current branch `001-nextjs-frontend-studyrats` must be `feat/001-nextjs-frontend-studyrats` per constitution. Created by speckit tooling — justified as tooling limitation; rename before first PR. |
| Core Web Vitals | REQUIRES PLANNING | Lighthouse CI must be configured in PR pipeline |
| 100% unit test coverage | REQUIRES PLANNING | Jest + istanbul; all `lib/api/`, hooks, utility functions |
| E2E tests (critical flows) | REQUIRES PLANNING | Playwright: auth (login, register, logout), check-in, ranking |
| No secrets committed | REQUIRES PLANNING | `.env.local` must be in `.gitignore`; gitleaks pre-commit hook |
| HATEOAS consumption | COMPLIANT | `unwrapEntity`/`unwrapCollection` pattern enforced by norm #3 |
| Dependency security | REQUIRES PLANNING | `npm audit` step in CI |
