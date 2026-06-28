# FRMS — Security Architecture

> **Document:** docs/SECURITY.md
> **Status:** Architecture locked — implementation deferred to backend phase
> **Last Updated:** 2026-06-28

---

## 1. Authentication Strategy

FRMS uses a **dual-token authentication system**: a short-lived JWT access token stored in memory, and a long-lived refresh token stored in an HttpOnly cookie.

### Why Not a Single Long-Lived JWT?

| Approach | Problem |
|----------|---------|
| Long-lived JWT in localStorage | XSS attack steals token; token cannot be revoked |
| Long-lived JWT in cookie | CSRF attacks possible; same revocation problem |
| Session-based (server-side session) | Stateful server; harder to scale horizontally |
| **Access token (memory) + Refresh token (HttpOnly cookie)** | ✅ XSS-resistant; CSRF-resistant; short exposure window |

### Token Design

#### Access Token

| Property | Value |
|----------|-------|
| **Type** | JWT (HS256) |
| **Storage** | JavaScript memory (Zustand `auth.store`) |
| **Lifetime** | 15 minutes |
| **Payload** | `{ sub: userId, role, permissions[], iat, exp }` |
| **XSS resistance** | ✅ Not in localStorage or sessionStorage |
| **Automatic revocation** | Expires in 15 min; compromised token has a short window |

#### Refresh Token

| Property | Value |
|----------|-------|
| **Type** | Opaque random string (stored and validated server-side) |
| **Storage** | HttpOnly cookie (inaccessible to JavaScript) |
| **Lifetime** | 7 days |
| **Cookie flags** | `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh` |
| **XSS resistance** | ✅ JavaScript cannot read HttpOnly cookies |
| **CSRF resistance** | ✅ `SameSite=Strict` prevents cross-origin requests |
| **Revocation** | Server-side: stored in database; can be invalidated immediately |

### Token Lifecycle

```
1. LOGIN
   User submits credentials
        ↓
   Server validates password hash (bcrypt)
        ↓
   Server generates:
     - Access token (JWT, 15min)
     - Refresh token (random, stored in DB)
        ↓
   Response body: { accessToken }
   Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict

2. AUTHENTICATED REQUEST
   Client sends: Authorization: Bearer <accessToken>
        ↓
   Middleware verifies JWT signature and expiry
        ↓
   Attaches user + permissions to request

3. ACCESS TOKEN EXPIRY (silent refresh)
   Client detects 401 TOKEN_EXPIRED response
        ↓
   Client calls POST /api/v1/auth/refresh
   (refresh token cookie is sent automatically by browser)
        ↓
   Server validates refresh token from DB
        ↓
   Server returns new accessToken in response body
        ↓
   Client retries original request

4. LOGOUT
   Client calls POST /api/v1/auth/logout
        ↓
   Server deletes refresh token from DB
        ↓
   Server clears cookie (Max-Age=0)
        ↓
   Client clears Zustand auth store (removes access token from memory)
```

### Refresh Token Database Record

Refresh tokens are stored in the database to enable revocation:

| Field | Description |
|-------|-------------|
| `token` | Hashed refresh token (never store raw) |
| `userId` | Owner |
| `expiresAt` | Expiry timestamp |
| `revokedAt` | Populated on logout or suspicious activity |
| `createdAt` | Issue timestamp |

---

## 2. Permission-Based RBAC

FRMS uses **permission-based access control**, not role-based checks.

### Why Permission-Based, Not Role-Based?

```ts
// ❌ Role-only check — fragile and hard to change
if (user.role === 'ADMIN' || user.role === 'SUPERVISOR') {
  // allow payroll generation
}

// ✅ Permission-based check — clear, granular, and role-independent
if (user.permissions.includes('payroll:generate')) {
  // allow payroll generation
}
```

Permission-based checks mean:
- Adding a new role requires no code changes — only a permission assignment change
- Permissions are explicit and self-documenting
- A supervisor can be granted or denied specific permissions without a full role change
- The same `authorize('payroll:generate')` middleware works for any role

### Permission Notation

```
resource:action

Examples:
  employees:read
  payroll:generate
  data:restore
```

### Permission Catalog

| Permission | Description |
|-----------|-------------|
| `employees:read` | View employee list and details |
| `employees:write` | Create and edit employees |
| `employees:delete` | Deactivate employees |
| `machines:read` | View machine list and details |
| `machines:write` | Create and edit machines |
| `machines:delete` | Deactivate machines |
| `designs:read` | View design list |
| `designs:write` | Create and edit designs |
| `designs:delete` | Deactivate designs |
| `production:read` | View production entries |
| `production:write` | Create and edit production entries |
| `production:delete` | Delete production entries |
| `payroll:read` | View payroll records |
| `payroll:generate` | Generate payroll from production data |
| `payroll:lock` | Lock payroll (make immutable) |
| `payroll:delete` | Delete unlocked payroll records |
| `advances:read` | View salary advances |
| `advances:write` | Record salary advances |
| `advances:delete` | Delete salary advances |
| `reports:read` | View all reports |
| `reports:export` | Export reports to PDF or Excel |
| `notifications:read` | View notifications |
| `notifications:dismiss` | Mark notifications as read |
| `data:backup` | Trigger manual backup |
| `data:restore` | Restore from backup |
| `data:export` | Export data |
| `data:import` | Import data |
| `data:audit-read` | View audit logs |
| `data:archive` | Archive records |
| `users:read` | View user list |
| `users:write` | Create and edit users |
| `users:delete` | Deactivate users |
| `settings:read` | View application settings |
| `settings:write` | Modify application settings |

### Role → Permission Matrix

> ⚠️ **Note:** This matrix is proposed and requires formal approval before the User Roles module is built. It should be reviewed against operational needs.

| Permission | ADMIN | SUPERVISOR | OPERATOR |
|-----------|:-----:|:----------:|:--------:|
| `employees:read` | ✅ | ✅ | ✅ |
| `employees:write` | ✅ | ✅ | ❌ |
| `employees:delete` | ✅ | ❌ | ❌ |
| `machines:read` | ✅ | ✅ | ✅ |
| `machines:write` | ✅ | ✅ | ❌ |
| `machines:delete` | ✅ | ❌ | ❌ |
| `designs:read` | ✅ | ✅ | ✅ |
| `designs:write` | ✅ | ✅ | ✅ |
| `designs:delete` | ✅ | ❌ | ❌ |
| `production:read` | ✅ | ✅ | ✅ |
| `production:write` | ✅ | ✅ | ✅ |
| `production:delete` | ✅ | ✅ | ❌ |
| `payroll:read` | ✅ | ✅ | ❌ |
| `payroll:generate` | ✅ | ✅ | ❌ |
| `payroll:lock` | ✅ | ✅ | ❌ |
| `payroll:delete` | ✅ | ❌ | ❌ |
| `advances:read` | ✅ | ✅ | ❌ |
| `advances:write` | ✅ | ✅ | ❌ |
| `advances:delete` | ✅ | ❌ | ❌ |
| `reports:read` | ✅ | ✅ | ❌ |
| `reports:export` | ✅ | ✅ | ❌ |
| `notifications:read` | ✅ | ✅ | ✅ |
| `notifications:dismiss` | ✅ | ✅ | ✅ |
| `data:backup` | ✅ | ✅ | ❌ |
| `data:restore` | ✅ | ❌ | ❌ |
| `data:export` | ✅ | ✅ | ❌ |
| `data:import` | ✅ | ❌ | ❌ |
| `data:audit-read` | ✅ | ✅ | ❌ |
| `data:archive` | ✅ | ❌ | ❌ |
| `users:read` | ✅ | ❌ | ❌ |
| `users:write` | ✅ | ❌ | ❌ |
| `users:delete` | ✅ | ❌ | ❌ |
| `settings:read` | ✅ | ✅ | ✅ |
| `settings:write` | ✅ | ❌ | ❌ |

### Role Summary

| Role | Description | Key Restrictions |
|------|-------------|-----------------|
| **ADMIN** | Full system access | None |
| **SUPERVISOR** | Daily operations + payroll + reports | Cannot manage users, restore backups, or modify settings |
| **OPERATOR** | Production entry only | Read-only on master data; no payroll or reports |

### How Permissions Are Enforced

**On the backend** (primary enforcement):
```ts
// middleware/authorize.ts — Pattern only
export const authorize = (permission: Permission) => async (request, reply) => {
  if (!request.user.permissions.includes(permission)) {
    throw new AuthorizationError(permission);
  }
};

// Usage in routes:
fastify.post('/payroll/generate',
  { preHandler: [authenticate, authorize('payroll:generate')] },
  payrollController.generate
);
```

**On the frontend** (UI-layer enforcement — hides, not blocks):
```ts
// hooks/usePermissions.ts — Pattern only
const { can } = usePermissions();

// In component:
{can('payroll:generate') && <Button>Generate Payroll</Button>}
```

**Rule:** Backend permission checks are mandatory and cannot be bypassed. Frontend checks are for UX only — to hide elements the user cannot use.

---

## 3. Password Security

| Requirement | Detail |
|-------------|--------|
| Hashing algorithm | bcrypt with salt rounds ≥ 12 |
| Minimum length | 8 characters (enforced by Zod schema) |
| Storage | Only the hash is stored; plaintext never logged or persisted |
| Reset mechanism | To be defined (email-based or admin-reset for internal app) |

---

## 4. Input Validation

All input is validated at two points:

1. **Frontend** — React Hook Form + Zod on form submit (immediate UX feedback)
2. **Backend** — Fastify JSON Schema + `@frms/shared` Zod schemas (cannot be bypassed)

**Rule:** Backend validation is the authoritative validation. Frontend validation is for user experience only.

---

## 5. Security Checklist

### Authentication
- [ ] Passwords hashed with bcrypt (rounds ≥ 12)
- [ ] Access token stored in memory only (never localStorage)
- [ ] Refresh token in HttpOnly cookie with Secure + SameSite=Strict
- [ ] Token expiry enforced server-side
- [ ] Refresh tokens stored hashed in database
- [ ] Logout invalidates the refresh token in database

### Authorization
- [ ] Every protected route has `authenticate` middleware
- [ ] Every write/delete route has `authorize(permission)` middleware
- [ ] Permission checks on backend are never skipped
- [ ] Payroll lock check happens at service layer, not just middleware

### Input
- [ ] All inputs validated by Zod on backend
- [ ] SQL injection impossible via Prisma parameterized queries
- [ ] No raw SQL strings built from user input

### HTTP Security
- [ ] CORS restricted to known origins (from env)
- [ ] Rate limiting on auth endpoints (stricter) and all endpoints
- [ ] Security headers set (Content-Security-Policy, X-Frame-Options, etc.)
- [ ] HTTPS enforced in production

### Data
- [ ] Passwords never logged
- [ ] Tokens never logged
- [ ] Sensitive fields (bank details) never appear in list responses
- [ ] Audit log records all significant mutations

---

*This document is reviewed before the authentication module is built and before any production deployment.*
