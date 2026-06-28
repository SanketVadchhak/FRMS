# FRMS — Database Architecture

> **Document:** docs/DATABASE.md
> **Status:** Conceptual — Schema implementation deferred to backend phase
> **Backend Stack:** Fastify + Prisma + SQLite (dev) → PostgreSQL (prod)
> **Last Updated:** 2026-06-28
> **Related:** [ARCHITECTURE.md](./ARCHITECTURE.md), [BACKEND.md](./BACKEND.md)

---

## 1. Database Strategy

### Development Database: SQLite

| Property | Detail |
|----------|--------|
| **Type** | Embedded, file-based |
| **File location** | `apps/api/prisma/dev.db` |
| **Why** | Zero server setup; runs anywhere; single file; perfect for local development and future Electron deployment |
| **Who uses it** | Every developer on day one, with zero infrastructure |

### Production Database: PostgreSQL

| Property | Detail |
|----------|--------|
| **Type** | Server-based relational database |
| **Why** | Production-grade reliability; concurrent connections; ACID compliance; cloud-compatible (Supabase, Railway, Neon, self-hosted) |
| **Migration from SQLite** | Change `datasource provider` in `schema.prisma` from `sqlite` to `postgresql`; run `prisma migrate deploy` |

### The Single Prisma Schema

The same `schema.prisma` file works for both databases. Switching from SQLite to PostgreSQL is a **single line change**:

```prisma
datasource db {
  provider = "sqlite"       // ← development
  // provider = "postgresql" // ← production
  url      = env("DATABASE_URL")
}
```

This preserves the deployment-agnostic architectural requirement from Phase 1.

---

## 2. Backend Stack Rationale

### Fastify

| Aspect | Detail |
|--------|--------|
| **Why** | Fastest Node.js web framework; TypeScript-native; JSON schema-based request validation; plugin architecture; built-in serialization |
| **vs Express** | 2–3× faster; better TypeScript support; schema validation built in; more modern API |
| **vs tRPC** | More universal (standard REST API usable by mobile apps, third-party tools, and the frontend equally); better suited for future multi-client scenarios |

### Prisma

| Aspect | Detail |
|--------|--------|
| **Why** | TypeScript-first ORM; generates fully typed client from schema; Prisma Studio for visual data inspection during development; migration system; supports SQLite and PostgreSQL equally |
| **Type generation** | `prisma generate` produces `PrismaClient` with types for every model — no manual type duplication |
| **vs Drizzle** | Prisma's schema-first approach and Prisma Studio make it more accessible; Drizzle is a valid alternative if performance becomes critical |
| **vs raw SQL** | Prisma's typed queries eliminate entire classes of runtime errors |

---

## 3. Conceptual Entity Map

> These are conceptual definitions. Actual Prisma schema syntax is written during backend scaffolding.

---

### Employee

Central registry of all factory workers. Never permanently deleted.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `name` | String | Searchable |
| `mobile` | String | Optional |
| `joiningDate` | Date | |
| `hourlyRate` | Decimal | Used in payroll calculation |
| `status` | Enum | `ACTIVE` \| `INACTIVE` |
| `notes` | Text | Optional |
| `bankName` | String | Optional |
| `accountNumber` | String | Optional |
| `ifscCode` | String | Optional |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Business rules:**
- `status` defaults to `ACTIVE`
- Setting `status = INACTIVE` is the only form of "deletion"
- Historical records always reference the original employee record
- `hourlyRate` changes should not retroactively affect locked payroll records

---

### Machine

Registry of embroidery machines. Never permanently deleted.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `name` | String | Searchable |
| `status` | Enum | `ACTIVE` \| `INACTIVE` |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Business rules:**
- Inactive machines remain in historical production records
- Selecting an inactive machine in production entry prompts reactivation

---

### Design

Reusable embroidery design catalog.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `name` | String | Searchable |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Business rules:**
- Designs are never deleted — historical production references must remain valid
- New designs can be created directly from the production entry form

---

### ProductionEntry (Header)

One entry per employee per day (or per shift if multiple shifts recorded).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `date` | Date | Defaults to today; editable |
| `employeeId` | UUID | FK → Employee |
| `machineId` | UUID | FK → Machine |
| `shift` | Enum | `DAY` \| `NIGHT` |
| `framesChanged` | Integer | Applies to the full day |
| `threadBreakage` | Integer | Applies to the full day |
| `bonus` | Decimal | Defaults to 0 |
| `notes` | Text | Optional |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

---

### ProductionDetail (Line Items)

One row per design within a production entry. One entry can have many details.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `productionEntryId` | UUID | FK → ProductionEntry |
| `designId` | UUID | FK → Design |
| `stitchCount` | Integer | Manually entered |
| `hoursWorked` | Decimal | Used in payroll: Basic Wage |
| `qualityCheck` | Enum | `PASS` \| `FAIL` |
| `createdAt` | DateTime | |

---

### SalaryAdvance

Advance payments deducted from future payroll.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `employeeId` | UUID | FK → Employee |
| `amount` | Decimal | |
| `date` | Date | |
| `notes` | Text | Optional |
| `deducted` | Boolean | True once included in a payroll period |
| `payrollId` | UUID | FK → Payroll (nullable until deducted) |
| `createdAt` | DateTime | |

---

### Payroll

Calculated wage record for an employee covering a defined period.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `employeeId` | UUID | FK → Employee |
| `periodStart` | Date | User-defined payroll period start |
| `periodEnd` | Date | User-defined payroll period end |
| `basicWage` | Decimal | = Hours Worked × Hourly Rate |
| `bonus` | Decimal | Sum of all bonuses in period |
| `grossWage` | Decimal | = Basic Wage + Bonus |
| `advanceDeducted` | Decimal | Sum of SalaryAdvances deducted |
| `netPay` | Decimal | = Gross Wage − Advance Deducted |
| `paymentDate` | Date | Nullable until paid |
| `paymentMethod` | String | Nullable until paid |
| `status` | Enum | `PENDING` \| `PAID` |
| `locked` | Boolean | Immutable once true |
| `lockedAt` | DateTime | Nullable |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

**Business rules:**
- `locked = true` makes the record immutable — no field can be updated
- `netPay` must never go below 0; if advances exceed gross wage, a warning is shown and the result is clamped to 0 (edge case to be formally approved)
- Payroll is generated from production data, never entered manually

---

### User

Application user accounts.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `username` | String | Unique |
| `passwordHash` | String | bcrypt hash |
| `role` | Enum | `ADMIN` \| `SUPERVISOR` \| `OPERATOR` (to be formally defined) |
| `status` | Enum | `ACTIVE` \| `INACTIVE` |
| `lastLoginAt` | DateTime | Nullable |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

---

### AuditLog

Immutable record of all significant system actions.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `entity` | String | e.g., `Employee`, `Payroll`, `ProductionEntry` |
| `entityId` | UUID | ID of the affected record |
| `action` | Enum | `CREATE` \| `UPDATE` \| `DELETE` \| `LOCK` \| `LOGIN` |
| `userId` | UUID | FK → User |
| `previousValue` | JSON | State before action (nullable for CREATE) |
| `newValue` | JSON | State after action (nullable for DELETE) |
| `timestamp` | DateTime | |

**Business rules:**
- Audit logs are append-only; no UPDATE or DELETE operations are permitted
- Includes: payroll generation, payroll locking, employee deactivation, backup events, login attempts

---

### Notification

In-app notifications stored for the Notification Center.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `type` | Enum | `PAYROLL` \| `PRODUCTION` \| `BACKUP` \| `QUALITY` \| `SYSTEM` |
| `severity` | Enum | `INFO` \| `WARNING` \| `CRITICAL` |
| `title` | String | |
| `message` | Text | |
| `read` | Boolean | Defaults to false |
| `userId` | UUID | FK → User (nullable for broadcast) |
| `createdAt` | DateTime | |

---

### Settings

Key-value application configuration store.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `key` | String | Unique, e.g., `company.name`, `payroll.defaultPeriod` |
| `value` | Text | JSON-serialized value |
| `updatedAt` | DateTime | |
| `updatedBy` | UUID | FK → User |

---

## 4. Entity Relationship Map

```
Employee ──────────────────────────────────────────────────────┐
    │                                                           │
    │ 1:N                                                       │ 1:N
    ▼                                                           ▼
ProductionEntry ──── 1:N ────► ProductionDetail      SalaryAdvance
    │                                │                         │
    │ N:1                            │ N:1                      │ N:1
    ▼                                ▼                         ▼
  Machine                          Design                   Payroll
                                                            (deducted)

User ──── 1:N ────► AuditLog
User ──── 1:N ────► Notification
```

### Relationship Summary

| Relationship | Type | Notes |
|-------------|------|-------|
| Employee → ProductionEntry | 1:N | One employee, many production days |
| Machine → ProductionEntry | 1:N | One machine, many production entries |
| ProductionEntry → ProductionDetail | 1:N | One entry, one or many design rows |
| Design → ProductionDetail | 1:N | One design, referenced in many entries |
| Employee → SalaryAdvance | 1:N | One employee, many advances over time |
| Employee → Payroll | 1:N | One employee, many payroll periods |
| SalaryAdvance → Payroll | N:1 | Many advances deducted in one payroll |
| User → AuditLog | 1:N | All significant actions attributed to a user |

---

## 5. Data Integrity Rules

Derived from Project Constitution §6.12 and §5:

| Rule | Implementation |
|------|---------------|
| Employees are never hard-deleted | `status` field only; no DELETE query on Employee table |
| Machines are never hard-deleted | Same as Employee |
| Designs are never hard-deleted | Historical ProductionDetail references must remain valid |
| Locked payroll is immutable | Prisma middleware blocks all UPDATE operations when `locked = true` |
| Audit logs are append-only | No UPDATE or DELETE routes exist for AuditLog |
| Net pay cannot be manually entered | Computed from `grossWage − advanceDeducted`; never a user input field |
| Payroll calculations use production data | Payroll generation reads ProductionDetail records; no manual wage entry |
| Archived data remains searchable | Soft deletes only; no permanent data removal without ADMIN action |

---

## 6. Migration Strategy

### Development → Production

1. Develop and test with SQLite locally
2. Change `datasource provider` from `sqlite` to `postgresql`
3. Set `DATABASE_URL` environment variable to PostgreSQL connection string
4. Run `npx prisma migrate deploy` — all migrations apply to PostgreSQL
5. Run data migration script if moving existing SQLite data

### Schema Evolution

- Every schema change requires a Prisma migration file: `npx prisma migrate dev --name describe_change`
- Migration files are committed to version control
- Migrations run automatically on `prisma migrate deploy`
- No manual SQL changes to production database

### Prisma Workflow

```
Edit schema.prisma
        ↓
npx prisma migrate dev        ← Creates migration + updates dev.db
        ↓
npx prisma generate           ← Regenerates TypeScript client
        ↓
npx prisma studio             ← Optional: visual data inspector
```

---

## 7. Database Indexing Strategy

Indexes are declared in `schema.prisma` using Prisma's `@@index` directive. The right indexes prevent full table scans as data grows.

### Index Priority Guide

| Priority | When | Examples |
|----------|------|---------|
| 🔴 Critical | Foreign keys; columns used in WHERE clauses on large tables | `employeeId`, `date` |
| 🟡 High | Columns used in ORDER BY or GROUP BY | `createdAt`, `status` |
| 🟢 Optional | Columns in small tables or rarely queried | `settings.key` |

### Index Definitions by Entity

#### Employee
| Index | Fields | Reason |
|-------|--------|--------|
| `@@index([name])` | `name` | Searchable dropdown — type-to-search |
| `@@index([status])` | `status` | Filter active/inactive employees |

#### ProductionEntry
| Index | Fields | Reason |
|-------|--------|--------|
| `@@index([date])` | `date` | Date range queries for reports and history |
| `@@index([employeeId])` | `employeeId` | Employee production history lookup |
| `@@index([machineId])` | `machineId` | Machine utilization reports |
| `@@index([employeeId, date])` | `employeeId, date` | Payroll period calculation |
| `@@index([shift])` | `shift` | Shift-based filtering |

#### ProductionDetail
| Index | Fields | Reason |
|-------|--------|--------|
| `@@index([productionEntryId])` | `productionEntryId` | Fetch design rows for an entry |
| `@@index([designId])` | `designId` | Design usage in reports |

#### Payroll
| Index | Fields | Reason |
|-------|--------|--------|
| `@@index([employeeId])` | `employeeId` | Employee payroll history |
| `@@index([employeeId, periodStart, periodEnd])` | composite | Detect overlapping payroll periods |
| `@@index([status])` | `status` | Filter pending vs paid |
| `@@index([locked])` | `locked` | Quick filter for modifiable payrolls |

#### SalaryAdvance
| Index | Fields | Reason |
|-------|--------|--------|
| `@@index([employeeId])` | `employeeId` | Employee advance history |
| `@@index([deducted])` | `deducted` | Find pending advances for payroll deduction |

#### AuditLog
| Index | Fields | Reason |
|-------|--------|--------|
| `@@index([entity, entityId])` | `entity, entityId` | Record history lookup |
| `@@index([userId])` | `userId` | Actions by a specific user |
| `@@index([timestamp])` | `timestamp` | Time-based audit queries |
| `@@index([action])` | `action` | Filter by action type |

#### Notification
| Index | Fields | Reason |
|-------|--------|--------|
| `@@index([userId, read])` | `userId, read` | Unread notification count (dashboard badge) |
| `@@index([createdAt])` | `createdAt` | Chronological notification list |

#### RefreshToken (Auth)
| Index | Fields | Reason |
|-------|--------|--------|
| `@@index([token])` | `token` | Token lookup on every auth/refresh request |
| `@@index([userId])` | `userId` | Revoke all sessions for a user |

### Performance Notes

- **SQLite** — indexes have a smaller performance impact on small datasets (< 100K rows). Still apply them from day one.
- **PostgreSQL** — indexes are critical at scale. All indexes above should be present before going to production.
- **Avoid over-indexing** — every index slows down INSERT/UPDATE. Only index columns that are queried frequently.
- **Monitor slow queries** — Prisma's `log: ['query']` in development shows query plans.

---

## 8. Backup Considerations

| Concern | Approach |
|---------|---------|
| **SQLite (local)** | Copy `dev.db` file; Data Management module triggers backup |
| **PostgreSQL (production)** | `pg_dump`; scheduled automatic backups; stored to external location |
| **Backup notification** | Failed backup triggers a `CRITICAL` severity Notification |
| **Restore** | Restore `.db` file (SQLite) or restore from `pg_dump` file (PostgreSQL) |

---

*This document is updated when entity definitions or backend decisions change. Schema code is written during backend development phase.*
