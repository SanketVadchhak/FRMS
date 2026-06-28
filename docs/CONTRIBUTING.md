# FRMS — Contributing Guide

> **Document:** docs/CONTRIBUTING.md
> **Status:** Active — applies to all development from Day 1
> **Last Updated:** 2026-06-28

---

## 1. Before You Start

Read these documents **in order** before writing any code:

1. [📘 Project Constitution](../📘%20Project%20Constitution.docx) — The single source of truth
2. [docs/ARCHITECTURE.md](./ARCHITECTURE.md) — Technical architecture and decisions
3. [docs/MODULES.md](./MODULES.md) — Module overview and dependency map
4. [docs/DATABASE.md](./DATABASE.md) — Entity definitions and data integrity rules
5. [docs/API.md](./API.md) — API standards and response formats
6. [docs/SECURITY.md](./SECURITY.md) — Authentication and permissions
7. [docs/TESTING.md](./TESTING.md) — Testing strategy

**If anything is unclear after reading the above, ask — do not assume.**

---

## 2. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ (LTS) | Runtime |
| npm | 10+ | Package manager |
| Git | Latest | Version control |
| VS Code | Latest | Recommended editor |

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-playwright.playwright"
  ]
}
```

---

## 3. Initial Setup

```bash
# 1. Clone
git clone <repository-url>
cd FRMS

# 2. Install all workspace dependencies from root
npm install

# 3. Set up environment files
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env

# 4. Fill in required values in apps/api/.env
#    - JWT_ACCESS_SECRET (min 32 chars)
#    - JWT_REFRESH_SECRET (min 32 chars, different from access)

# 5. Initialize database
cd apps/api && npx prisma migrate dev && cd ../..

# 6. Verify setup
npm run dev
# → Web: http://localhost:5173
# → API: http://localhost:3000
```

---

## 4. Development Workflow

Every module follows the lifecycle defined in the Project Constitution (§9.3) and enforced by the AI development workflow:

```
1. Requirements reviewed and approved
          ↓
2. Implementation plan presented and approved
          ↓
3. Code implemented (one module at a time)
          ↓
4. Self-review completed
          ↓
5. Tests written and passing
          ↓
6. Documentation updated
          ↓
7. Module submitted for final review
          ↓
8. Module approved
```

**Rules:**
- Build **one module at a time** — never start a second module before the first is approved
- Do not modify unrelated files
- Do not change approved business logic without discussion
- Every module must pass the [Definition of Done](#8-definition-of-done)

---

## 5. Git Workflow

### Branch Naming

```
<type>/<short-description>

Examples:
  feat/employee-management
  feat/production-entry-form
  fix/payroll-calculation-edge-case
  refactor/data-table-component
  docs/update-architecture
  chore/update-dependencies
```

**Types:**
| Type | When to use |
|------|------------|
| `feat` | New feature or module |
| `fix` | Bug fix |
| `refactor` | Code improvement without behavior change |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `test` | Adding or improving tests |
| `chore` | Build scripts, dependency updates |

### Commit Message Convention

```
<type>: <imperative, present tense description>

Examples: ✅
  feat: add employee management module
  fix: correct payroll net pay calculation when advance exceeds gross
  refactor: extract calculateNetPay into standalone lib function
  docs: add indexing strategy to DATABASE.md
  test: add unit tests for calculateEfficiency

Examples: ❌ (do not use)
  update
  changes
  fix stuff
  final
  WIP
```

**Rules:**
- Use the imperative mood: "add" not "added" or "adding"
- Keep the first line under 72 characters
- Husky enforces this format on every commit

### Pre-commit Checks (Husky + lint-staged)

Every commit automatically runs:
1. `eslint --fix` on changed `.ts` and `.tsx` files
2. `prettier --write` on changed files

A commit is blocked if ESLint finds errors that cannot be auto-fixed.

---

## 6. Code Review Process

### Before Submitting for Review

- [ ] Code builds without errors (`npm run build`)
- [ ] TypeScript has no errors (`npm run typecheck`)
- [ ] All tests pass (`npm run test`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Self-review completed against this checklist
- [ ] Module-level documentation updated

### Review Checklist

Reviewers check:

| Category | Checks |
|----------|--------|
| **Business Logic** | Does it match the Constitution? Are all rules enforced? |
| **Validation** | Frontend + backend validation present? Error messages clear? |
| **Permissions** | Are permission guards applied on all routes? |
| **Edge Cases** | Inactive records, empty states, boundary values handled? |
| **Performance** | No unnecessary re-renders? No N+1 queries? |
| **Accessibility** | Keyboard navigable? ARIA labels present? Color-only indicators avoided? |
| **Responsiveness** | Works on mobile, tablet, and desktop? |
| **Tests** | All `lib/` functions unit tested? Critical paths covered? |
| **Code Quality** | Follows naming conventions? No duplication? Readable? |

---

## 7. AI Development Workflow

This project uses an AI assistant (Antigravity) as a development partner, governed by the Project Constitution (§9) and the `.agents/` directory.

### How AI Assistance Works

| Phase | Prompt File | What Happens |
|-------|-------------|-------------|
| Project init | `00-project-init.md` | Understand project; ask questions |
| Tech stack | `01-tech-stack-review.md` | Recommend stack; wait for approval |
| Scaffold | `02-project-scaffold.md` | Create structure only; no logic |
| Build module | `03-module-build.md` | Build one module; explain plan first |
| Review module | `04-module-review.md` | Multi-role review report |
| Enhance module | `05-module-enhancement.md` | Improve UX, performance, accessibility |
| Bug fix | `06-bug-fix.md` | Analyze root cause; minimal fix |
| Refactor | `07-refactor.md` | Improve code; preserve behavior |
| Performance | `08-performance-review.md` | Find and fix slow paths |
| Security | `09-security-review.md` | Audit security posture |
| Release | `10-release-checklist.md` | Final quality gate |

### Rules for AI Collaboration

- The AI must **explain** its plan before writing code
- The AI must **wait for approval** before proceeding
- The AI must **never change business logic** without explicit approval
- The AI must **ask questions** when requirements are ambiguous
- If the AI's plan conflicts with the Constitution, **the Constitution wins**

---

## 8. Definition of Done

A module is complete **only** when all of these are true:

### Functional
- [ ] All business requirements from the Constitution are implemented
- [ ] All business rules are enforced (not just happy paths)
- [ ] Payroll calculations produce mathematically correct results (if applicable)

### Quality
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] ESLint passes with no warnings
- [ ] All `lib/` functions have unit tests
- [ ] Critical interactions have component tests
- [ ] Integration tests cover all routes (happy path + auth + validation)

### UX
- [ ] Mobile layout verified (375px width)
- [ ] Tablet layout verified (768px width)
- [ ] Desktop layout verified (1280px width)
- [ ] Empty state implemented (no blank screens)
- [ ] Loading state implemented
- [ ] Error state implemented with retry
- [ ] Validation messages are user-friendly (explain how to fix, not just what is wrong)

### Security
- [ ] Permission guards applied on all routes
- [ ] Backend validates all inputs (not just frontend)
- [ ] Sensitive data excluded from list responses

### Documentation
- [ ] Module's `index.ts` exports are clean and intentional
- [ ] MODULES.md status updated
- [ ] Decision log updated if any new decisions were made

---

## 9. Environment Variable Management

- **Never commit `.env` files** — they are gitignored
- **Always update `.env.example`** when adding a new variable
- **Document every variable** with a comment in `.env.example`
- **Validate on startup** — if a required variable is missing, the server must refuse to start

---

## 10. Common Commands Reference

```bash
# Development
npm run dev                  # Start all services
npm run dev:web              # Frontend only
npm run dev:api              # Backend only

# Quality
npm run lint                 # ESLint all workspaces
npm run format               # Prettier all workspaces
npm run typecheck            # TypeScript check all workspaces

# Testing
npm run test                 # All unit + integration tests
npm run test:e2e             # Playwright E2E tests
npm run test:coverage        # Tests with coverage report

# Database
cd apps/api
npx prisma migrate dev       # Create and apply migration
npx prisma migrate deploy    # Apply migrations (production)
npx prisma studio            # Visual database browser
npx prisma db seed           # Seed development data
npx prisma generate          # Regenerate client types

# Build
npm run build                # Build all workspaces
npm run build:web            # Build frontend only
```

---

*This document is updated when development processes change. Following this guide is a project requirement, not a suggestion.*
