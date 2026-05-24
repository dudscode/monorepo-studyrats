# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**StudyRats** is a learning project built with Java 21 + Spring Boot 4.0.2. The goal is to build a study group management system and progressively integrate AWS services (S3, Lambda, API Gateway, RDS). Features include: user auth with JWT, study groups, daily check-ins, and ranking.

## Commands

### Run locally (Docker)
```bash
docker-compose up --build        # build image + start MySQL + app
docker-compose up -d --build     # same, detached
docker-compose down              # stop
docker-compose down -v           # stop + wipe MySQL volume
```
App runs at `http://localhost:9090`

### Maven (without Docker)
Requires a local MySQL with database `study_rats` and updating the datasource URL in `application.properties` from `mysql` to `localhost`.
```bash
mvn spring-boot:run
mvn package -DskipTests
mvn test
```

### RSA Keys for JWT
The app needs RSA keys at `src/main/resources/app.key` (private) and `src/main/resources/app.pub` (public). These are referenced in `application.properties` via `jwt.private-key` and `jwt.public-key`.

## Architecture

### Layer structure
```
com.example.studyrats/
├── config/       # Security, JWT token config
├── controller/   # REST endpoints
├── service/      # Business logic
├── repository/   # JPA data access (Spring Data)
├── model/        # JPA entities
├── dto/          # Request/response records
└── mapper/       # Entity ↔ DTO conversion
```

### Key design decisions
- **HATEOAS**: All responses use `EntityModel<>` and `CollectionModel<>` returning HAL+JSON. Controllers build hypermedia links manually.
- **JWT**: RSA key pair (not symmetric). `TokenConfig` generates and validates tokens. `SecurityFilter` extracts the Bearer token. OAuth2 Resource Server is configured in `SecurityConfig`.
- **Stateless**: Sessions are stateless; no cookies. CSRF is disabled.
- **User is UserDetails**: `User` entity implements Spring Security's `UserDetails` directly — no separate UserDetails wrapper.
- **Roles**: `Role` entity + `RoleName` enum. Users have a `Set<Role>`. Used for Spring Security authority resolution.
- **Ranking**: Computed in `CheckinRepository` via JPQL `GROUP BY` + `COUNT`, not in-memory.
- **Check-in constraint**: One check-in per user per group per day, enforced in `CheckinService`.

### Entities and relationships
- `User` ←→ `Group` via `GroupMembership` (join table with `role` enum: ADMIN or MEMBER)
- `Checkin` → `User`, `Checkin` → `Group`
- `User` ←→ `Role` via `users_roles` join table
- All primary keys are UUIDs (`@GeneratedValue(strategy = GenerationType.UUID)`)
- `ddl-auto=update` — Hibernate manages schema automatically

### Auth flow
1. `POST /users/create` — register (no auth required)
2. `POST /users/login` — returns JWT Bearer token
3. All other endpoints require `Authorization: Bearer <token>`

## Planned AWS integrations (roadmap)
- **S3**: Image uploads attached to check-ins
- **Lambda**: Event-driven processing
- **API Gateway**: Expose endpoints
- **RDS (PostgreSQL)**: Replace local MySQL — will require datasource config update and possibly dialect change
