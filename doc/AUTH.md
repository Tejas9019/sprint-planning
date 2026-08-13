# Authentication & Authorization

JWT (access + refresh) + OTP, Google OAuth 2.0 (Spring `oauth2Login` redirect), RBAC + fine-grained
permissions, and multi-tenancy (per-user membership + request-scoped tenant context). All endpoints
are versioned under `/api/v1`.

## Architecture (backend, `com.example.sprint_planning`)

- `auth/` — sign-up/sign-in/OTP/refresh/logout flows (`AuthService`), OTP (`OtpService` + `OtpSender`
  with console/SMTP impls), refresh-token rotation (`RefreshTokenService`).
- `security/` — `JwtTokenProvider`, `JwtAuthenticationFilter` (builds authorities from token claims,
  no DB hit), JSON 401/403 handlers, `oauth/` Google handlers.
- `rbac/` — `Role`/`Permission` entities, `AuthorityMapper`, `TenantPermissionEvaluator`
  (`hasPermission(#tenantId,'Tenant','MEMBER_INVITE')`).
- `tenant/` — `Tenant`/`TenantMembership`, request-scoped `TenantContext` + `TenantResolutionFilter`.
- `user/`, `common/` (exceptions + `ApiError` + `GlobalExceptionHandler`), `config/`.

Schema is owned by **Flyway** (`src/main/resources/db/migration`, `V1`–`V6`); Hibernate runs in
`validate` mode. UUID PKs are `BINARY(16)`.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/signup` | public | create user + personal tenant, issue signup OTP |
| POST | `/api/v1/auth/signin` | public | verify password, issue sign-in OTP |
| POST | `/api/v1/auth/verify-otp` | public | validate OTP → access + refresh tokens |
| POST | `/api/v1/auth/resend-otp` | public | re-issue OTP (cooldown enforced) |
| POST | `/api/v1/auth/refresh` | public | rotate refresh token, new access token |
| POST | `/api/v1/auth/logout` | public | revoke a refresh token |
| POST | `/api/v1/auth/switch-tenant` | bearer | re-mint a session scoped to another tenant |
| GET | `/api/v1/auth/me` | bearer | current user + tenants + roles/permissions |
| GET | `/oauth2/authorization/google` | public | start Google login (redirect flow) |
| GET/POST/PUT/DELETE | `/api/v1/users` | bearer + `USER_READ`/`USER_MANAGE` | user CRUD |
| GET/POST | `/api/v1/tenants` | bearer | list / create tenants |
| ...    | `/api/v1/tenants/{tenantId}/members` | bearer + tenant-scoped `MEMBER_*` | membership mgmt |

## Configuration (env-overridable, see `application.properties`)

`JWT_SECRET` (Base64, ≥32 bytes), `DB_URL`/`DB_USERNAME`/`DB_PASSWORD`, `OTP_DELIVERY=console|smtp`
(+ `SMTP_*` when smtp), `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `FRONTEND_URL`, `CORS_ORIGINS`.
Google login is wired only when a client id/secret is present, so the app boots without it.

## Run

```bash
# 1. fresh dev DB (Flyway owns the schema)
mysql -u root -proot -P 3307 -e "DROP DATABASE IF EXISTS sprint_planning; CREATE DATABASE sprint_planning;"

# 2. backend (OTP printed to the console in dev)
cd backend && ./mvnw spring-boot:run

# 3. frontend
cd frontend && cp .env.example .env && npm install && npm run dev
```

## Manual verification (curl)

```bash
BASE=http://localhost:8080/api/v1

# signup -> challengeId; read the 6-digit OTP from the backend console
curl -s $BASE/auth/signup -H 'Content-Type: application/json' \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","password":"password123"}'

# verify -> { accessToken, refreshToken, user, tenants, ... }
curl -s $BASE/auth/verify-otp -H 'Content-Type: application/json' \
  -d '{"challengeId":"<id>","code":"<otp>"}'

# authorized call
curl -s $BASE/users -H "Authorization: Bearer <accessToken>"      # 200
curl -s $BASE/users                                               # 401

# refresh (rotates) then reuse the old token -> 401 (chain revoked)
curl -s $BASE/auth/refresh -H 'Content-Type: application/json' -d '{"refreshToken":"<refresh>"}'
```

## Tests

`cd backend && ./mvnw test` — unit (`JwtTokenProvider`, `OtpService`, `RefreshTokenService`,
`AuthorityMapper`) + `AuthorizationIntegrationTest` (401/403/200, validation 400) on in-memory H2.
