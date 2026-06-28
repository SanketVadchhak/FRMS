# FRMS — API Standards

> **Document:** docs/API.md
> **Base URL (dev):** `http://localhost:3000/api/v1`
> **Status:** Standard locked — implementation deferred to backend phase
> **Last Updated:** 2026-06-28

---

## 1. Versioning

All API routes are prefixed with `/api/v1`.

```
http://localhost:3000/api/v1/employees
http://localhost:3000/api/v1/production
http://localhost:3000/api/v1/payroll
```

**Why versioning from day one?**
If breaking changes are needed in the future (mobile app, third-party integration), `/api/v2` can exist alongside `/api/v1` without disrupting existing clients. The cost of adding versioning later is high; the cost of adding it now is zero.

**Version lifecycle:**
- `v1` — Current; actively maintained
- `v2+` — Created only when breaking changes are required
- Old versions are deprecated with a minimum 6-month notice

---

## 2. Standard Response Envelope

All API responses — success and error — use the same envelope structure. Clients should always check `success` before processing `data`.

### Success Response

```json
{
  "success": true,
  "data": { },
  "meta": { }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `success` | boolean | ✅ | Always `true` for successful responses |
| `data` | object \| array | ✅ | The response payload |
| `meta` | object | ❌ | Pagination and request metadata |

### Paginated Success Response

```json
{
  "success": true,
  "data": [
    { "id": "...", "name": "Ravi Kumar", "status": "ACTIVE" }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 87,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Hours worked cannot exceed 24 hours. Please review the entered value.",
    "field": "hoursWorked",
    "details": [
      { "field": "hoursWorked", "message": "Maximum value is 24" }
    ]
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `success` | boolean | ✅ | Always `false` for error responses |
| `error.code` | string | ✅ | Machine-readable error code (see §5) |
| `error.message` | string | ✅ | Human-readable message aligned with Constitutional UX standards |
| `error.field` | string | ❌ | The specific field that caused the error |
| `error.details` | array | ❌ | Multiple validation errors |

**Rule:** Error messages must always explain how to fix the issue, not just what is wrong. This is a Constitutional UX requirement (§7.9).

---

## 3. HTTP Status Codes

| Status | Meaning | Used When |
|--------|---------|-----------|
| `200 OK` | Success | GET, PUT, PATCH that returns data |
| `201 Created` | Resource created | POST that creates a new record |
| `204 No Content` | Success, no body | DELETE operations |
| `400 Bad Request` | Validation error | Invalid input data |
| `401 Unauthorized` | Not authenticated | Missing or expired access token |
| `403 Forbidden` | Not authorized | Valid token, insufficient permissions |
| `404 Not Found` | Resource missing | Record does not exist |
| `409 Conflict` | Duplicate / state conflict | Duplicate entry, locked payroll edit |
| `422 Unprocessable Entity` | Business rule violation | Net pay would go negative, locked payroll |
| `429 Too Many Requests` | Rate limit exceeded | Too many requests from same IP |
| `500 Internal Server Error` | Unexpected server error | Never shown with stack traces |

---

## 4. Pagination

All list endpoints support offset-based pagination via query parameters.

### Query Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | `1` | Page number (1-indexed) |
| `limit` | `20` | Records per page (max: 100) |
| `search` | — | Full-text search string |
| `sortBy` | — | Field to sort by |
| `sortOrder` | `asc` | `asc` or `desc` |

### Example Request

```
GET /api/v1/employees?page=2&limit=20&search=kumar&sortBy=name&sortOrder=asc
```

---

## 5. Error Code Catalog

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input failed schema or business validation |
| `AUTHENTICATION_REQUIRED` | 401 | No valid access token provided |
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `INVALID_TOKEN` | 401 | Token is malformed or signature invalid |
| `REFRESH_TOKEN_INVALID` | 401 | Refresh token is missing, expired, or revoked |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks the required permission |
| `NOT_FOUND` | 404 | Requested resource does not exist |
| `CONFLICT` | 409 | Duplicate record or conflicting state |
| `PAYROLL_LOCKED` | 422 | Attempt to modify a locked payroll record |
| `INACTIVE_RECORD` | 422 | Operation attempted on an inactive employee/machine |
| `BUSINESS_RULE_VIOLATION` | 422 | Generic business rule violation |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 6. Authentication Endpoints

See `docs/SECURITY.md` for the full authentication strategy (JWT + HttpOnly cookie).

### POST `/api/v1/auth/login`

Authenticate a user. Returns an access token in the response body and sets a refresh token in an HttpOnly cookie.

**Request:**
```json
{
  "username": "admin",
  "password": "plaintext-password"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {
      "id": "user-uuid",
      "username": "admin",
      "role": "ADMIN",
      "permissions": ["employees:read", "employees:write", "payroll:generate"]
    }
  }
}
```

**Set-Cookie header (HttpOnly):**
```
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth/refresh; Max-Age=604800
```

---

### POST `/api/v1/auth/refresh`

Exchange a valid refresh token (from cookie) for a new access token.

**Request:** No body. Refresh token is read from the HttpOnly cookie automatically.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci..."
  }
}
```

---

### POST `/api/v1/auth/logout`

Revoke the refresh token and clear the HttpOnly cookie.

**Request:** No body. Auth header required.

**Response `200`:**
```json
{
  "success": true,
  "data": { "message": "Logged out successfully." }
}
```

**Clears cookie:** `Set-Cookie: refreshToken=; Max-Age=0`

---

### GET `/api/v1/auth/me`

Return the currently authenticated user's profile and permissions.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "username": "admin",
    "role": "ADMIN",
    "permissions": ["employees:read", "employees:write"],
    "lastLoginAt": "2026-06-28T09:00:00.000Z"
  }
}
```

---

## 7. Request Headers

| Header | Required | Value |
|--------|----------|-------|
| `Authorization` | ✅ (all protected routes) | `Bearer <access_token>` |
| `Content-Type` | ✅ (POST/PUT/PATCH) | `application/json` |
| `Accept` | Optional | `application/json` |

---

## 8. Route Reference

> Full schema and field-level documentation is written during backend implementation. This table defines the route structure.

### Master Data

| Method | Route | Permission | Description |
|--------|-------|-----------|-------------|
| `GET` | `/employees` | `employees:read` | List employees (paginated) |
| `POST` | `/employees` | `employees:write` | Create employee |
| `GET` | `/employees/:id` | `employees:read` | Get employee detail |
| `PUT` | `/employees/:id` | `employees:write` | Update employee |
| `PATCH` | `/employees/:id/deactivate` | `employees:delete` | Deactivate employee |
| `PATCH` | `/employees/:id/reactivate` | `employees:write` | Reactivate employee |
| `GET` | `/machines` | `machines:read` | List machines |
| `POST` | `/machines` | `machines:write` | Create machine |
| `PUT` | `/machines/:id` | `machines:write` | Update machine |
| `PATCH` | `/machines/:id/deactivate` | `machines:delete` | Deactivate machine |
| `GET` | `/designs` | `designs:read` | List designs |
| `POST` | `/designs` | `designs:write` | Create design |
| `PUT` | `/designs/:id` | `designs:write` | Update design |

### Production

| Method | Route | Permission | Description |
|--------|-------|-----------|-------------|
| `GET` | `/production` | `production:read` | List entries (paginated, filterable) |
| `POST` | `/production` | `production:write` | Create production entry with details |
| `GET` | `/production/:id` | `production:read` | Get entry detail |
| `PUT` | `/production/:id` | `production:write` | Update entry |
| `DELETE` | `/production/:id` | `production:delete` | Delete entry (soft) |

### Payroll

| Method | Route | Permission | Description |
|--------|-------|-----------|-------------|
| `GET` | `/payroll` | `payroll:read` | List payroll records |
| `POST` | `/payroll/generate` | `payroll:generate` | Generate payroll for a period |
| `GET` | `/payroll/:id` | `payroll:read` | Get payroll detail |
| `PATCH` | `/payroll/:id/lock` | `payroll:lock` | Lock payroll (immutable after) |
| `GET` | `/payroll/advances` | `advances:read` | List salary advances |
| `POST` | `/payroll/advances` | `advances:write` | Record salary advance |

### Reports

| Method | Route | Permission | Description |
|--------|-------|-----------|-------------|
| `GET` | `/reports/production` | `reports:read` | Production summary report |
| `GET` | `/reports/payroll` | `reports:read` | Payroll summary report |
| `GET` | `/reports/employees` | `reports:read` | Employee performance report |
| `GET` | `/reports/quality` | `reports:read` | Quality check report |
| `GET` | `/reports/export` | `reports:export` | Export report (PDF/Excel) |

---

## 9. API Response Builder Pattern

All responses use helpers from `utils/response.ts` for consistency:

```ts
// Pattern only — implementation during backend scaffold
export const success = <T>(data: T, meta?: Meta) => ({ success: true, data, meta });
export const error = (code: string, message: string, field?: string) =>
  ({ success: false, error: { code, message, field } });
```

**Controllers always use these helpers. Never construct raw response objects.**

---

*This document is updated when new routes are added or response formats change. Breaking changes require a version bump.*
