# FRMS — Backend Architecture

> **Document:** docs/BACKEND.md
> **Stack:** Node.js + TypeScript + Fastify + Prisma + SQLite → PostgreSQL
> **Status:** Architecture locked — implementation deferred to backend phase
> **Last Updated:** 2026-06-28

---

## 1. Folder Structure

```
apps/api/
│
├── src/
│   ├── config/                         ← Environment & application configuration
│   │   └── env.ts                      ← Zod-validated process.env (fail fast on startup)
│   │
│   ├── plugins/                        ← Fastify plugins (registered once at startup)
│   │   ├── auth.plugin.ts              ← JWT verification, attach user to request
│   │   ├── prisma.plugin.ts            ← Prisma client lifecycle, attach to fastify
│   │   ├── cors.plugin.ts              ← CORS policy (configured from env)
│   │   ├── rate-limit.plugin.ts        ← Request rate limiting per IP
│   │   └── sensible.plugin.ts          ← @fastify/sensible (error helpers, assert)
│   │
│   ├── modules/                        ← Business feature modules (mirrors frontend)
│   │   ├── auth/
│   │   │   ├── auth.routes.ts          ← /api/v1/auth/*
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts         ← Login, logout, token refresh
│   │   │   └── auth.schema.ts          ← Fastify request/response schemas
│   │   │
│   │   ├── employees/
│   │   │   ├── employee.routes.ts      ← /api/v1/employees/*
│   │   │   ├── employee.controller.ts
│   │   │   ├── employee.service.ts
│   │   │   └── employee.schema.ts
│   │   │
│   │   ├── machines/
│   │   ├── designs/
│   │   ├── production/
│   │   │   ├── production.routes.ts
│   │   │   ├── production.controller.ts
│   │   │   ├── production.service.ts
│   │   │   └── production.schema.ts
│   │   │
│   │   ├── payroll/
│   │   │   ├── payroll.routes.ts
│   │   │   ├── payroll.controller.ts
│   │   │   ├── payroll.service.ts      ← Payroll generation logic
│   │   │   └── payroll.schema.ts
│   │   │
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── data-management/
│   │   ├── users/
│   │   └── settings/
│   │
│   ├── middleware/                     ← Fastify hooks (onRequest, preHandler)
│   │   ├── authenticate.ts             ← Verify access token; attach user to request
│   │   ├── authorize.ts                ← Permission check for specific routes
│   │   └── audit-logger.ts            ← Write to AuditLog for significant mutations
│   │
│   ├── events/                         ← Lightweight domain event bus
│   │   ├── event-bus.ts               ← EventEmitter wrapper
│   │   ├── events.types.ts            ← Typed event definitions
│   │   └── handlers/
│   │       ├── on-payroll-generated.ts ← Creates payroll notification
│   │       ├── on-backup-failed.ts     ← Creates CRITICAL notification
│   │       └── on-employee-deactivated.ts ← Checks pending payroll
│   │
│   ├── db/
│   │   ├── client.ts                   ← Singleton PrismaClient export
│   │   └── seed.ts                     ← Development seed data
│   │
│   ├── utils/
│   │   ├── response.ts                 ← success() and error() response builders
│   │   ├── errors.ts                   ← AppError, ValidationError, AuthError classes
│   │   ├── logger.ts                   ← Pino logger instance configuration
│   │   └── pagination.ts               ← Cursor / offset pagination helpers
│   │
│   ├── types/
│   │   ├── fastify.d.ts               ← Augment FastifyRequest with user, prisma
│   │   └── index.ts
│   │
│   └── index.ts                        ← Server bootstrap: register plugins, routes, start
│
├── prisma/
│   ├── schema.prisma                   ← Data model and datasource configuration
│   ├── migrations/                     ← Prisma migration history (committed to git)
│   └── seed.ts                         ← Entry point for `prisma db seed`
│
├── tests/
│   ├── integration/                    ← Route-level tests via fastify.inject()
│   │   ├── employees.spec.ts
│   │   ├── production.spec.ts
│   │   └── payroll.spec.ts
│   └── unit/                           ← Service and utility unit tests
│       ├── payroll.service.test.ts
│       └── response.test.ts
│
├── .env                                ← Local environment (not committed)
├── .env.example                        ← Template for all required variables
├── tsconfig.json
└── package.json
```

---

## 2. Module Internal Pattern

Each backend module follows the same four-file structure:

```
modules/production/
├── production.routes.ts        ← Route registration; applies auth + permission hooks
├── production.controller.ts    ← Request parsing, response shaping; no business logic
├── production.service.ts       ← All business logic; calls Prisma; emits domain events
└── production.schema.ts        ← Fastify JSON Schema + imports from @frms/shared/schemas
```

### Responsibility Boundaries

| Layer | Responsibility | Must NOT |
|-------|---------------|----------|
| `routes.ts` | Register routes, attach hooks, define permissions required | Contain logic |
| `controller.ts` | Parse validated request, call service, format response | Touch Prisma directly |
| `service.ts` | Business rules, Prisma queries, domain event emission | Know about HTTP or request/response |
| `schema.ts` | Fastify request/response JSON schemas | Contain logic |

---

## 3. Plugin Architecture

Fastify uses a plugin system. All plugins are registered at startup in `index.ts` before routes are registered.

### Plugin Registration Order

```
index.ts
  1. register(env-validation)          ← Fail fast if env vars are missing
  2. register(pino-logger)             ← Logging must be available first
  3. register(prisma.plugin)           ← Database connection established
  4. register(cors.plugin)             ← CORS before routes
  5. register(rate-limit.plugin)       ← Rate limiting before routes
  6. register(sensible.plugin)         ← Error helpers
  7. register(auth.plugin)             ← JWT utilities registered
  8. register(routes, { prefix: '/api/v1' }) ← All business routes
```

### Fastify Type Augmentation

`types/fastify.d.ts` augments the `FastifyRequest` interface so TypeScript knows about custom properties:

```ts
declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      role: UserRole;
      permissions: Permission[];
    };
  }
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
```

---

## 4. Logging (Pino)

Fastify uses **Pino** as its built-in logger. No additional logging library is needed.

### Log Levels

| Level | When to use |
|-------|------------|
| `error` | Unhandled exceptions, database connection failures, critical system failures |
| `warn` | Recoverable errors, validation failures, suspicious activity |
| `info` | Significant business events (payroll generated, backup completed, login) |
| `debug` | Detailed flow information (only in development) |

### Structured Log Format

All logs are structured JSON in production. Human-readable in development via `pino-pretty`.

```json
{
  "level": "info",
  "time": "2026-06-28T14:30:00.000Z",
  "requestId": "req-123",
  "userId": "user-abc",
  "event": "payroll.generated",
  "employeeId": "emp-xyz",
  "periodStart": "2026-06-01",
  "periodEnd": "2026-06-30",
  "netPay": 15000.00
}
```

### What to Log

| Event | Level | Notes |
|-------|-------|-------|
| Login success | `info` | Include userId, IP |
| Login failure | `warn` | Include username attempted, IP |
| Payroll generated | `info` | Include employeeId, period, netPay |
| Payroll locked | `info` | Include payrollId, lockedBy |
| Employee deactivated | `info` | Include employeeId, deactivatedBy |
| Backup completed | `info` | Include path, size |
| Backup failed | `error` | Include error message, stack |
| Unauthorized access attempt | `warn` | Include userId, route, permission required |
| Database error | `error` | Include query context (no PII) |

### What to NEVER Log

- Passwords (even hashed)
- JWT tokens
- Refresh tokens
- Bank account numbers
- Full request bodies on auth routes

---

## 5. Environment Variables

All environment variables are validated at startup using Zod in `config/env.ts`. The server refuses to start if any required variable is missing or invalid.

### `.env.example`

```bash
# ─────────────────────────────────────────
# Database
# ─────────────────────────────────────────
# SQLite (development):
DATABASE_URL="file:./prisma/dev.db"

# PostgreSQL (production):
# DATABASE_URL="postgresql://user:password@localhost:5432/frms"

# ─────────────────────────────────────────
# Authentication
# ─────────────────────────────────────────
JWT_ACCESS_SECRET="minimum-32-character-secret-here"
JWT_REFRESH_SECRET="different-minimum-32-character-secret"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# ─────────────────────────────────────────
# Server
# ─────────────────────────────────────────
PORT=3000
NODE_ENV="development"     # development | production | test
HOST="0.0.0.0"             # 0.0.0.0 for LAN/Docker; 127.0.0.1 for local only
LOG_LEVEL="info"           # error | warn | info | debug

# ─────────────────────────────────────────
# CORS
# ─────────────────────────────────────────
CORS_ORIGIN="http://localhost:5173"    # Comma-separated for multiple origins

# ─────────────────────────────────────────
# Rate Limiting
# ─────────────────────────────────────────
RATE_LIMIT_MAX=100          # Requests per window
RATE_LIMIT_WINDOW_MS=60000  # Window in milliseconds (1 minute)

# ─────────────────────────────────────────
# Backup
# ─────────────────────────────────────────
BACKUP_DIR="./backups"
AUTO_BACKUP_ENABLED=true
AUTO_BACKUP_INTERVAL_HOURS=24
```

### Validation in `config/env.ts`

```ts
// Pattern only — implementation during backend scaffold
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // ...
});

export const env = envSchema.parse(process.env);
```

---

## 6. Domain Event Bus

Domain events decouple modules. A service emits an event; a separate handler reacts to it. This means the Payroll service does not directly know about the Notification module.

### Pattern

```
PayrollService.generatePayroll()
  → prisma.payroll.create(...)
  → eventBus.emit('payroll.generated', { employeeId, netPay, period })

handlers/on-payroll-generated.ts
  ← listens for 'payroll.generated'
  → NotificationService.create({ type: 'PAYROLL', ... })
```

### Approved Domain Events

| Event Name | Emitted By | Handled By |
|-----------|-----------|-----------|
| `payroll.generated` | PayrollService | NotificationHandler → create INFO notification |
| `payroll.locked` | PayrollService | AuditLogger |
| `backup.completed` | DataService | NotificationHandler → create INFO notification |
| `backup.failed` | DataService | NotificationHandler → create CRITICAL notification |
| `employee.deactivated` | EmployeeService | PayrollChecker → warn if pending payroll exists |
| `user.login.failed` | AuthService | RateLimiter / SecurityLogger |

### Event Bus Implementation

```ts
// events/event-bus.ts — Pattern only
import { EventEmitter } from 'events';

class TypedEventBus extends EventEmitter {
  emit<T extends keyof DomainEvents>(event: T, payload: DomainEvents[T]): boolean {
    return super.emit(event, payload);
  }
  on<T extends keyof DomainEvents>(event: T, listener: (payload: DomainEvents[T]) => void): this {
    return super.on(event, listener);
  }
}

export const eventBus = new TypedEventBus();
```

---

## 7. Error Handling

### Custom Error Classes (`utils/errors.ts`)

```ts
// Pattern only — implementation during backend scaffold
class AppError extends Error {
  constructor(public code: string, message: string, public statusCode: number) { ... }
}

class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super('VALIDATION_ERROR', message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor() { super('AUTHENTICATION_REQUIRED', 'Please log in', 401); }
}

class AuthorizationError extends AppError {
  constructor(permission: string) {
    super('INSUFFICIENT_PERMISSIONS', `Permission required: ${permission}`, 403);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

class ConflictError extends AppError {
  constructor(message: string) { super('CONFLICT', message, 409); }
}
```

### Global Error Handler

Fastify's `setErrorHandler` catches all unhandled errors and formats them using the standard response envelope defined in `docs/API.md`.

---

*This document is updated when backend architecture decisions change. Backend implementation begins in a dedicated scaffold phase.*
