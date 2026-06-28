# FRMS — Architecture Document

> **Project:** Factory Resource Management System
> **Type:** Responsive Web Application (Mobile-First)
> **Version:** 1.0
> **Status:** Architecture Approved — Awaiting Scaffold
> **Last Updated:** 2026-06-28
> **Source of Truth:** 📘 Project Constitution.docx
> **Documentation:** [ARCHITECTURE](./ARCHITECTURE.md) │ [DATABASE](./DATABASE.md) │ [MODULES](./MODULES.md) │ [BACKEND](./BACKEND.md) │ [API](./API.md) │ [SECURITY](./SECURITY.md) │ [TESTING](./TESTING.md) │ [DEPLOYMENT](./DEPLOYMENT.md) │ [CONTRIBUTING](./CONTRIBUTING.md)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Approved Technology Stack](#2-approved-technology-stack)
3. [Repository Structure](#3-repository-structure)
4. [Frontend Application Structure](#4-frontend-application-structure)
5. [Module Internal Pattern](#5-module-internal-pattern)
6. [State Management Architecture](#6-state-management-architecture)
7. [API Service Layer](#7-api-service-layer)
8. [Routing Architecture](#8-routing-architecture)
9. [Design System](#9-design-system)
10. [Code Quality Standards](#10-code-quality-standards)
11. [Development Workflow](#11-development-workflow)
12. [Decision Log](#12-decision-log)

---

## 1. Project Overview

FRMS is an internal business management web application built specifically for embroidery manufacturing workshops. It replaces manual registers and spreadsheets with a modern, mobile-first, data-driven platform.

### Application Identity

| Property | Value |
|----------|-------|
| **Browser Tab Title** | FRMS |
| **Login Page Name** | Factory Resource Management System |
| **Sidebar Brand** | FRMS |
| **Internal Code Name** | frms |

### Approved Modules (Version 1.0)

| # | Module | Route Prefix |
|---|--------|-------------|
| 1 | Dashboard | `/dashboard` |
| 2 | Master Data (Employees, Machines, Designs) | `/masters` |
| 3 | Daily Production | `/production` |
| 4 | Payroll | `/payroll` |
| 5 | Reports & Analytics | `/reports` |
| 6 | Notifications | `/notifications` |
| 7 | Data Management | `/data` |
| 8 | User Roles & Permissions | `/users` |
| 9 | Settings | `/settings` |

---

## 2. Approved Technology Stack

### Core

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React | Latest stable |
| Language | TypeScript | Latest stable |
| Build Tool | Vite | Latest stable |
| Package Manager | npm (workspaces) | Latest stable |

### Frontend

| Category | Technology | Notes |
|----------|-----------|-------|
| Styling | Tailwind CSS v4 + CSS Custom Properties | Design tokens via `@theme` |
| UI Components | shadcn/ui (Radix UI) | Copied into `components/ui/` |
| Global State | Zustand | User, theme, notifications |
| Server State | TanStack Query v5 | API caching, loading states |
| Forms | React Hook Form v7 | Dynamic field arrays |
| Validation | Zod v3 | Shared with backend |
| Tables | TanStack Table v8 | Headless, reusable `DataTable` |
| Charts | Recharts | Dashboard & Reports |
| Routing | React Router v6 | Lazy-loaded routes, guards |
| Icons | Lucide React | Tree-shakeable SVGs |
| Animations | Framer Motion | Micro-interactions, transitions |

### Backend (Locked — Implementation Deferred)

| Category | Technology | Notes |
|----------|-----------|-------|
| Runtime | Node.js | TypeScript throughout |
| Framework | Fastify | Fast, TypeScript-native, schema-based |
| ORM | Prisma | Schema-first, auto-generated types, migration system |
| Dev Database | SQLite | No server required; local and Electron-compatible |
| Prod Database | PostgreSQL | Cloud-grade; same Prisma schema, one provider change |
| Shared Validation | Zod (`@frms/shared`) | Same schemas on frontend and backend |

### Code Quality

| Tool | Purpose |
|------|---------|
| ESLint | Code quality, TypeScript rules, accessibility |
| Prettier | Consistent formatting |
| Husky | Git hook runner |
| lint-staged | Run checks on changed files only |

### Prettier Configuration

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Development Ports

| App | Port |
|-----|------|
| Web (Vite dev server) | 5173 |
| API (Node.js) | 3000 |

---

## 3. Repository Structure

FRMS uses a **monorepo** managed with **npm workspaces**. This enables Zod validation schemas and TypeScript types to be shared between the frontend and backend without duplication.

```
FRMS/                                   ← Git repository root
│
├── apps/                               ← Deployable applications
│   ├── web/                            ← React frontend
│   └── api/                            ← Node.js backend (Fastify + Prisma)
│
├── packages/                           ← Shared internal packages
│   └── shared/                         ← Shared types, schemas, constants
│                                         Future: packages/ui/, packages/config/
│
├── docs/                               ← Project documentation
│   ├── ARCHITECTURE.md                 ← Technical architecture (this document)
│   ├── DATABASE.md                     ← Database strategy, entities, indexes
│   ├── MODULES.md                      ← Module overview and dependency map
│   ├── BACKEND.md                      ← Backend folder structure, logging, events
│   ├── API.md                          ← API standards, versioning, response format
│   ├── SECURITY.md                     ← Auth strategy, RBAC permission matrix
│   ├── TESTING.md                      ← Frontend and backend testing strategy
│   ├── DEPLOYMENT.md                   ← Deployment modes, environment setup
│   └── CONTRIBUTING.md                 ← Developer setup, git workflow, DoD
│
├── .agents/                            ← AI development workflow (do not modify)
│   ├── prompts/
│   ├── rules/
│   ├── templates/
│   └── workflows/
│
├── .husky/                             ← Git hook scripts
│   └── pre-commit                      ← Runs lint-staged
│
├── .eslintrc.cjs                       ← Root ESLint configuration
├── .prettierrc                         ← Root Prettier configuration
├── .prettierignore
├── .gitignore
├── package.json                        ← npm workspace root
├── tsconfig.base.json                  ← Shared TypeScript base config
└── README.md                           ← Setup, development workflow, quick start
```

### npm Workspaces Root `package.json`

```json
{
  "name": "frms",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

### Shared Package (`packages/shared`)

Consumed by both `apps/web` and `apps/api`. Published internally as `@frms/shared`.

```
packages/shared/
├── src/
│   ├── schemas/                        ← Zod validation schemas (shared)
│   │   ├── employee.schema.ts
│   │   ├── machine.schema.ts
│   │   ├── design.schema.ts
│   │   ├── production.schema.ts
│   │   ├── payroll.schema.ts
│   │   └── index.ts
│   │
│   ├── types/                          ← Shared TypeScript interfaces
│   │   ├── employee.types.ts
│   │   ├── machine.types.ts
│   │   ├── design.types.ts
│   │   ├── production.types.ts
│   │   ├── payroll.types.ts
│   │   └── index.ts
│   │
│   └── constants/                      ← Shared business constants
│       ├── payroll.constants.ts        ← Formula rules, limits
│       ├── status.constants.ts         ← Active/Inactive, Paid/Pending enums
│       └── index.ts
│
├── tsconfig.json
└── package.json                        ← name: "@frms/shared"
```

**Future packages (door left open — do not create until needed):**
- `packages/ui/` — Shared component library if multiple apps need the same UI
- `packages/config/` — Shared ESLint, Prettier, TypeScript configs as packages

---

## 4. Frontend Application Structure

```
apps/web/
│
├── public/                             ← Static assets served as-is
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── app/                            ← Application shell
│   ├── assets/                         ← Processed static assets
│   ├── components/                     ← Shared reusable UI components
│   ├── config/                         ← Application-level configuration
│   ├── constants/                      ← Frontend-specific constants
│   ├── hooks/                          ← Cross-module custom React hooks
│   ├── layouts/                        ← Navigation chrome and page wrappers
│   ├── modules/                        ← Business feature modules
│   ├── routes/                         ← Route definitions and guards
│   ├── services/                       ← API networking layer
│   ├── stores/                         ← Zustand global state
│   ├── styles/                         ← Global CSS and design system tokens
│   ├── types/                          ← Frontend-only TypeScript types
│   └── utils/                          ← Pure utility/helper functions
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── components.json                     ← shadcn/ui CLI configuration
└── package.json
```

---

### `src/app/` — Application Shell

```
app/
├── App.tsx                             ← Root component
├── providers.tsx                       ← All providers composed
└── router.tsx                          ← Top-level route tree
```

---

### `src/assets/` — Processed Static Assets

```
assets/
├── images/
│   ├── logos/                          ← App logo, brand marks
│   └── illustrations/                  ← Empty state art, onboarding visuals
├── icons/                              ← Custom SVG icons (beyond Lucide)
└── fonts/                              ← Self-hosted font files
```

---

### `src/components/` — Shared UI Components

Business-logic-free components used across multiple modules.

```
components/
│
├── ui/                                 ← shadcn/ui generated components
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── toast.tsx
│   └── ...                             ← Added progressively via shadcn CLI
│
├── data-table/                         ← TanStack Table reusable wrapper
│   ├── DataTable.tsx
│   ├── DataTableToolbar.tsx
│   ├── DataTablePagination.tsx
│   ├── DataTableColumnHeader.tsx
│   └── index.ts
│
├── forms/                              ← Shared form-level components
│   ├── SearchableSelect.tsx
│   ├── DateRangePicker.tsx
│   ├── FormField.tsx
│   └── index.ts
│
├── feedback/                           ← State feedback components
│   ├── LoadingSpinner.tsx
│   ├── SkeletonCard.tsx
│   ├── SkeletonTable.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   └── index.ts
│
├── layout/                             ← Shared structural UI components
│   ├── PageHeader.tsx
│   ├── SectionCard.tsx
│   ├── StatCard.tsx
│   └── index.ts
│
└── index.ts
```

---

### `src/config/` — Application Configuration

Application-level initialization. Not business logic — not utilities.

```
config/
├── env.ts                              ← Type-safe env variable access (Zod-validated)
├── query-client.ts                     ← TanStack Query client instance + defaults
├── theme.ts                            ← Theme constants, system preference detection
└── feature-flags.ts                    ← Feature flag definitions
```

---

### `src/constants/` — Frontend Constants

```
constants/
├── routes.ts                           ← Route path constants
├── query-keys.ts                       ← TanStack Query cache key factories
└── permissions.ts                      ← Permission action constants
```

---

### `src/hooks/` — Cross-Module Custom Hooks

```
hooks/
├── usePermissions.ts
├── useTheme.ts
├── useDebounce.ts
├── useMediaQuery.ts
└── useLocalStorage.ts
```

---

### `src/layouts/` — Navigation Chrome

```
layouts/
├── AppLayout.tsx                       ← Main shell (sidebar + content)
├── AuthLayout.tsx                      ← Login pages
├── Sidebar.tsx                         ← Desktop persistent left sidebar
├── MobileNav.tsx                       ← Mobile bottom nav + slide-out drawer
├── TopBar.tsx                          ← Mobile top bar
└── index.ts
```

---

### `src/modules/` — Business Feature Modules

```
modules/
├── dashboard/
├── masters/
│   ├── employees/
│   ├── machines/
│   └── designs/
├── production/
├── payroll/
├── reports/
├── notifications/
├── data-management/
├── user-roles/
└── settings/
```

See **Section 5** for the module internal pattern.

---

### `src/routes/` — Route Definitions

```
routes/
├── index.tsx
├── guards/
│   ├── AuthGuard.tsx
│   └── PermissionGuard.tsx
└── paths.ts
```

---

### `src/services/` — API Networking Layer

All HTTP communication is centralized here. No component or hook calls `fetch` directly.

```
services/
├── api.client.ts                       ← Base HTTP client (base URL, headers)
├── api.types.ts                        ← ApiResponse<T>, PaginatedResponse<T>, ApiError
├── interceptors.ts                     ← Auth token injection, token refresh, logging
├── error-handler.ts                    ← Centralized API error → user message mapping
├── auth.service.ts                     ← Authentication endpoints
└── index.ts
```

---

### `src/stores/` — Zustand Global State

```
stores/
├── auth.store.ts                       ← User, token, role, permissions
├── theme.store.ts                      ← Active theme
├── notification.store.ts               ← Notification queue
└── index.ts
```

---

### `src/styles/` — Global Styles and Design System

```
styles/
├── globals.css                         ← Tailwind v4 directives, reset, base typography
├── theme.css                           ← @theme: all CSS custom properties (design tokens)
└── animations.css                      ← Shared keyframes
```

---

### `src/types/` — Frontend-Only Types

```
types/
├── ui.types.ts                         ← TableColumn<T>, FilterOption, NavItem
└── index.ts
```

---

### `src/utils/` — Pure Utility Functions

```
utils/
├── format.ts                           ← Number, currency, date formatting
├── export.ts                           ← PDF and Excel export helpers
└── index.ts
```

**Business calculation helpers belong in `modules/<name>/lib/` — not here.**

---

## 5. Module Internal Pattern

Every business module follows an identical internal structure.

```
modules/production/
│
├── components/                         ← Module-specific UI components
│   ├── ProductionEntryForm.tsx
│   ├── ProductionTable.tsx
│   ├── DesignRow.tsx
│   └── DailySummaryCard.tsx
│
├── pages/                              ← Route-level page components
│   ├── ProductionEntryPage.tsx
│   └── ProductionHistoryPage.tsx
│
├── hooks/                              ← Module-specific React hooks
│   ├── useProductionEntry.ts
│   └── useProductionHistory.ts
│
├── services/                           ← Module-specific API calls
│   └── production.service.ts
│
├── lib/                                ← Pure business logic functions
│   ├── calculateEfficiency.ts
│   ├── calculateThreadBreakage.ts
│   ├── calculateProductionSummary.ts
│   └── index.ts
│
├── schemas/                            ← Zod validation schemas
│   └── production.schema.ts
│
├── types/                              ← Module-specific TypeScript types
│   └── production.types.ts
│
├── tests/                              ← Module tests (Vitest + RTL)
│   ├── lib/                            ← Unit tests for pure business functions
│   │   ├── calculateEfficiency.test.ts
│   │   └── calculateProductionSummary.test.ts
│   ├── components/                     ← Component tests
│   │   └── ProductionEntryForm.test.tsx
│   └── hooks/                          ← Hook tests
│       └── useProductionEntry.test.ts
│
└── index.ts                            ← Public API of the module
```

### The `lib/` Directory — Why It Matters

| Location | What belongs there | Example |
|----------|-------------------|---------|
| `src/utils/` | Generic helpers, no business knowledge | `formatCurrency()`, `parseDate()` |
| `modules/<name>/lib/` | Business calculations specific to one module | `calculateEfficiency()`, `computeNetPay()` |
| `packages/shared/constants/` | Business rules shared between frontend and backend | Payroll formula constants |

`lib/` functions are:
- **Pure** — same input always produces same output
- **Independently testable** — no React, no hooks, no side effects
- **Domain-specific** — only called within their module
- **Not hooks** — no `use` prefix, no React state

### Payroll Module `lib/` Example

```
modules/payroll/lib/
├── calculateBasicWage.ts       ← hoursWorked × hourlyRate
├── calculateGrossWage.ts       ← basicWage + bonus
├── calculateNetPay.ts          ← grossWage − salaryAdvances
├── validatePayrollPeriod.ts    ← Date range validation logic
└── index.ts
```

### Masters Sub-Module Pattern

```
modules/masters/
├── employees/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── lib/
│   ├── schemas/
│   ├── types/
│   └── index.ts
├── machines/
│   └── ... (same structure)
├── designs/
│   └── ... (same structure)
└── index.ts
```

---

## 6. State Management Architecture

```
┌─────────────────────────────────────────────────────┐
│                  React Components                    │
└──────────────┬──────────────────┬───────────────────┘
               │                  │
       ┌───────▼───────┐  ┌───────▼────────┐
       │    Zustand     │  │ TanStack Query │
       │  (UI State)   │  │ (Server State) │
       └───────────────┘  └───────┬────────┘
                                  │
                          ┌───────▼────────┐
                          │  Service Layer │
                          │  (api.client)  │
                          └───────┬────────┘
                                  │
                          ┌───────▼────────┐
                          │   Backend API  │
                          └────────────────┘
```

### What Lives Where

| State | Tool | Examples |
|-------|------|---------|
| Form inputs, dialog visibility | React `useState` | Production form fields |
| Logged-in user, token, role | Zustand `auth.store` | `useAuthStore()` |
| Active theme | Zustand `theme.store` | `useThemeStore()` |
| Notification queue | Zustand `notification.store` | `useNotificationStore()` |
| API data (employees, payroll records) | TanStack Query | `useEmployees()` |
| Cached master data for dropdowns | TanStack Query | `useMachines()`, `useDesigns()` |

**Rule:** API response data never goes into Zustand. Zustand is for client-only state.

---

## 7. API Service Layer

### Request Flow

```
Component
  → useProductionEntry() hook (TanStack Query mutation)
    → production.service.ts
      → apiClient.post('/production', data)
        → interceptors.ts (inject auth token)
          → Backend API
            ← interceptors.ts (parse response)
            ← error-handler.ts (on failure → user-friendly message)
```

### Environment Configuration

The API base URL is the **only** environment-specific value:

```
apps/web/.env.development   →  VITE_API_BASE_URL=http://localhost:3000
apps/web/.env.production    →  VITE_API_BASE_URL=https://api.frms.internal
```

This single change switches between local development, LAN server, and cloud deployment — no code changes required.

---

## 8. Routing Architecture

### Route Tree

```
/                       → redirect → /dashboard
/login                  → AuthLayout > LoginPage

/ (AppLayout + AuthGuard)
  /dashboard            → DashboardPage (lazy)
  /masters
    /employees          → EmployeeListPage (lazy)
    /employees/new      → EmployeeFormPage (lazy)
    /employees/:id      → EmployeeDetailPage (lazy)
    /machines           → MachineListPage (lazy)
    /machines/new       → MachineFormPage (lazy)
    /designs            → DesignListPage (lazy)
    /designs/new        → DesignFormPage (lazy)
  /production           → ProductionEntryPage (lazy)
    /history            → ProductionHistoryPage (lazy)
  /payroll              → PayrollListPage (lazy)
    /generate           → PayrollGeneratePage (lazy)
    /:id                → PayrollDetailPage (lazy)
  /reports              → ReportsPage (lazy)
  /notifications        → NotificationsPage (lazy)
  /data                 → DataManagementPage (lazy)
  /users                → UserRolesPage (lazy + PermissionGuard: ADMIN)
  /settings             → SettingsPage (lazy)
```

### Guards

- **`AuthGuard`** — Checks `auth.store` for valid session → redirects to `/login`
- **`PermissionGuard`** — Checks role against required permission → redirects to dashboard

### Lazy Loading

Every module route uses `React.lazy()` + `<Suspense>`. Only the Dashboard loads on the initial visit.

---

## 9. Design System

### Tailwind v4 + CSS Custom Properties

All design tokens are defined as CSS custom properties inside the `@theme` block in `styles/theme.css`. Tailwind v4 automatically generates utility classes from these tokens.

### Token Categories

```css
@theme {
  /* Colors — Neutral and professional. No branding until assets provided. */
  --color-primary-*        /* Brand primary (placeholder neutral) */
  --color-neutral-*        /* Grays: text, borders, backgrounds */
  --color-success-*        /* Green: active, paid, success */
  --color-warning-*        /* Amber: pending, caution */
  --color-error-*          /* Red: error, inactive, overdue */
  --color-info-*           /* Blue: informational notices */

  /* Typography */
  --font-sans              /* Primary font stack */
  --font-size-*            /* Typographic scale (xs → 4xl) */
  --font-weight-*          /* Weight scale */

  /* Spacing */
  --spacing-*              /* Base spacing scale */

  /* Radius */
  --radius-sm / --radius-md / --radius-lg / --radius-full

  /* Shadows */
  --shadow-sm / --shadow-md / --shadow-lg

  /* Transitions */
  --duration-fast / --duration-normal / --duration-slow
}
```

### Theming

```css
/* Default (light) values in @theme */
/* Dark mode via .dark class on <html> */
.dark { --color-background: #0f172a; }
```

Zustand `theme.store` adds/removes `.dark` on `<html>`. System preference is detected on first load via `matchMedia('prefers-color-scheme: dark')`.

### Status Colors (Constitutional §7.15)

| Status | Token | Usage |
|--------|-------|-------|
| 🟢 Active / Paid / Success | `--color-success-*` | Badges, indicators |
| 🟡 Pending / Warning | `--color-warning-*` | Alerts, pending payroll |
| 🔴 Inactive / Error / Overdue | `--color-error-*` | Errors, deactivated records |
| 🔵 Information | `--color-info-*` | Informational notices |

---

## 10. Code Quality Standards

### ESLint Plugins

| Plugin | Purpose |
|--------|---------|
| `eslint-plugin-react` | React-specific rules |
| `eslint-plugin-react-hooks` | Enforces Rules of Hooks |
| `@typescript-eslint` | TypeScript-aware linting |
| `eslint-plugin-jsx-a11y` | Accessibility lint rules |
| `eslint-plugin-import` | Import ordering + no circular deps |
| `eslint-config-prettier` | Disables rules that conflict with Prettier |

### lint-staged

```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,json,md}": ["prettier --write"]
}
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `ProductionEntryForm.tsx` |
| Hooks | camelCase + `use` prefix | `useProductionEntry.ts` |
| Stores | camelCase + `.store` suffix | `auth.store.ts` |
| Services | camelCase + `.service` suffix | `production.service.ts` |
| Schemas | camelCase + `.schema` suffix | `production.schema.ts` |
| Types | camelCase + `.types` suffix | `production.types.ts` |
| Lib functions | camelCase, one function per file | `calculateEfficiency.ts` |
| Constants (values) | SCREAMING_SNAKE_CASE | `STATUS_ACTIVE` |
| Constants (files) | camelCase | `status.constants.ts` |

### Import Order

```ts
// 1. React
import React from 'react';
// 2. Third-party
import { useForm } from 'react-hook-form';
// 3. Shared package
import type { Employee } from '@frms/shared/types';
// 4. Application (aliased with @/)
import { DataTable } from '@/components/data-table';
// 5. Module-local
import { calculateEfficiency } from '../lib';
```

### TypeScript

- `strict: true` in all `tsconfig.json`
- No `any` without an explicit `// eslint-disable-next-line` comment explaining why
- All business entities typed via `packages/shared/types`

---

## 11. Development Workflow

Per the Project Constitution §9.3:

```
Requirements Approved
        ↓
     Planning
 (explain plan → wait for approval)
        ↓
  Implementation
  (one module at a time)
        ↓
   Self Review
        ↓
    Bug Fixes
        ↓
   Enhancement
        ↓
  Final Review
        ↓
  Module Approved
```

### Git Commit Convention

```
feat:     New feature
fix:      Bug fix
refactor: Code improvement without behavior change
docs:     Documentation only
style:    Formatting, no logic change
test:     Adding or updating tests
chore:    Build scripts, dependencies
```

Examples:
```
feat: add employee management module
fix: correct payroll net pay calculation
docs: update ARCHITECTURE.md with lib/ pattern
```

### Definition of Done (§10.1)

A module is complete only when:
- [ ] Business requirements fully implemented
- [ ] Responsive: mobile, tablet, desktop verified
- [ ] All forms validated (frontend + backend)
- [ ] Error handling implemented and tested
- [ ] RBAC permissions enforced
- [ ] Existing functionality unaffected (regression check)
- [ ] Documentation updated
- [ ] Self-review passed
- [ ] No known critical defects

---

## 12. Decision Log

| # | Date | Decision | Rationale |
|---|------|----------|-----------|
| D-001 | 2026-06-28 | Responsive web application — deployment-agnostic | Supports Electron, LAN, or cloud without code changes |
| D-002 | 2026-06-28 | Monorepo with npm workspaces | Zod schema and TypeScript type sharing between frontend and backend |
| D-003 | 2026-06-28 | React + Vite (latest stable) | Static build; works on any deployment target |
| D-004 | 2026-06-28 | TypeScript strict mode | Type safety for payroll calculations |
| D-005 | 2026-06-28 | Tailwind CSS v4 + CSS Custom Properties | Design tokens via `@theme`; user-requested |
| D-006 | 2026-06-28 | shadcn/ui (Radix UI) | Accessible, customizable, no vendor lock-in; user-requested |
| D-007 | 2026-06-28 | Zustand + TanStack Query (split state) | Separates UI state from server state per §8.7 |
| D-008 | 2026-06-28 | React Hook Form + Zod | Performant forms; shared validation; dynamic arrays for production entry |
| D-009 | 2026-06-28 | TanStack Table (headless) | All Constitutional table requirements; one shared `DataTable` |
| D-010 | 2026-06-28 | Recharts | React-native charts; user-requested |
| D-011 | 2026-06-28 | Framer Motion | Micro-interactions; respects `prefers-reduced-motion` |
| D-012 | 2026-06-28 | ESLint + Prettier + Husky + lint-staged | Code quality from day one; user recommendation |
| D-013 | 2026-06-28 | `lib/` per module | Pure business functions separated from utilities and hooks |
| D-014 | 2026-06-28 | `config/` in `src/` | Application initialization distinct from utilities |
| D-015 | 2026-06-28 | Enhanced `services/` layer | Interceptors and error handler as first-class citizens |
| D-016 | 2026-06-28 | Refined `assets/` structure | logos/, illustrations/, icons/, fonts/ — well-categorized from day one |
| D-017 | 2026-06-28 | `packages/` growth path | `packages/shared/` now; `packages/ui/`, `packages/config/` when needed |
| D-018 | 2026-06-28 | Node.js + TypeScript (backend preference) | Zod schema sharing via `packages/shared` |
| D-019 | 2026-06-28 | Prettier: single quotes + semicolons | Explicit style; reduces ambiguity in TypeScript |
| D-020 | 2026-06-28 | App name: FRMS / Factory Resource Management System | Short internal brand; full name on login and formal contexts |
| D-021 | 2026-06-28 | `docs/` folder at repository root | Centralizes all project documentation; clean separation from code |
| D-022 | 2026-06-28 | Backend locked: Fastify + Prisma + SQLite → PostgreSQL | Fastify is TypeScript-native and fast; Prisma generates types from schema; same Prisma schema works for both databases via provider change — preserves deployment-agnostic architecture |
| D-023 | 2026-06-28 | `tests/` folder inside every module | Establishes testing convention before implementation; co-locates tests with source |
| D-024 | 2026-06-28 | DATABASE.md added to docs/ | Conceptual entity map and data integrity rules documented before any schema is written |
| D-025 | 2026-06-28 | MODULES.md added to docs/ | Single-page module overview as the onboarding reference for any new developer |
| D-026 | 2026-06-28 | API versioning: `/api/v1` prefix on all routes | Breaking changes can be introduced in `/api/v2` without disrupting existing clients |
| D-027 | 2026-06-28 | Auth: JWT access token in memory + refresh token in HttpOnly cookie | Access token in memory prevents XSS theft; HttpOnly cookie prevents JavaScript access to refresh token; `SameSite=Strict` prevents CSRF |
| D-028 | 2026-06-28 | Permission-based RBAC instead of role-only checks | `authorize('payroll:generate')` is explicit, testable, and future-proof; new roles require no code changes |
| D-029 | 2026-06-28 | Pino for structured JSON logging | Built into Fastify; zero overhead; structured logs enable log aggregation and alerting |
| D-030 | 2026-06-28 | Domain event bus (EventEmitter) for inter-module communication | Payroll, Notification, and Audit modules remain decoupled; domain events are typed and testable |
| D-031 | 2026-06-28 | Backend module structure mirrors frontend module structure | Consistent mental model; a developer working on `production` knows exactly where to look in both `apps/web` and `apps/api` |

---

*This document is updated after every significant architectural decision. Changes require discussion and approval before implementation.*
