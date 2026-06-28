# FRMS — Testing Strategy

> **Document:** docs/TESTING.md
> **Status:** Strategy locked — tests written alongside each module
> **Last Updated:** 2026-06-28

---

## 1. Testing Philosophy

Testing in FRMS follows three principles from the Project Constitution:

1. **No module is complete without tests** (§8.16, §10.1)
2. **Test behavior, not implementation** — tests should reflect how users and business rules interact with the system
3. **Payroll calculations must be unit tested exhaustively** — incorrect wages are a business-critical failure

---

## 2. Testing Stack

| Tool | Layer | Purpose |
|------|-------|---------|
| **Vitest** | Unit | Pure function tests (lib/, utils/) |
| **React Testing Library** | Component | Component behavior and interaction tests |
| **Playwright** | E2E | Critical user journey tests across the full stack |
| **Fastify `inject()`** | API Integration | Backend route tests without a real HTTP server |
| **Vitest** (backend) | Service Unit | Business service logic tests |

---

## 3. Frontend Testing

### 3a. Unit Tests — `modules/<name>/tests/lib/`

Test every function in `lib/` in complete isolation. No React. No Prisma. Pure input → output.

**What to test:**
- All payroll calculation functions with multiple input scenarios
- Production efficiency calculations
- Edge cases: zero hours, zero bonus, advance exceeding gross pay
- Boundary conditions: max hours (24), minimum pay (0)

**Example test structure:**

```ts
// modules/payroll/tests/lib/calculateNetPay.test.ts
import { describe, it, expect } from 'vitest';
import { calculateNetPay } from '../../lib/calculateNetPay';

describe('calculateNetPay', () => {
  it('returns grossWage minus advanceDeducted', () => {
    expect(calculateNetPay({ grossWage: 5000, advanceDeducted: 1000 })).toBe(4000);
  });

  it('returns 0 when advance exceeds gross wage', () => {
    expect(calculateNetPay({ grossWage: 1000, advanceDeducted: 1500 })).toBe(0);
  });

  it('returns grossWage when no advance', () => {
    expect(calculateNetPay({ grossWage: 5000, advanceDeducted: 0 })).toBe(5000);
  });
});
```

**Priority lib/ functions to test (in order):**

| Module | Functions | Priority |
|--------|-----------|----------|
| payroll | `calculateBasicWage`, `calculateGrossWage`, `calculateNetPay` | 🔴 Critical |
| production | `calculateEfficiency`, `calculateProductionSummary` | 🟡 High |
| production | `calculateThreadBreakage` | 🟡 High |
| payroll | `validatePayrollPeriod` | 🟡 High |

### 3b. Component Tests — `modules/<name>/tests/components/`

Test components from the **user's perspective** using React Testing Library. Test what the user sees and interacts with — not internal React state.

**What to test:**
- Form validation messages appear at the right time
- Saving a form calls the expected service
- Empty state is displayed when no data
- Error state is displayed on API failure
- Inactive employee reactivation prompt appears

**Tools:**
- `@testing-library/react` — render, fireEvent, userEvent
- `@testing-library/user-event` — realistic user interactions (type, click, tab)
- `msw` (Mock Service Worker) — intercept API calls without a real backend

**Example:**
```ts
// modules/masters/employees/tests/components/EmployeeForm.test.tsx
it('shows an error when hourly rate is negative', async () => {
  render(<EmployeeForm />);
  await userEvent.type(screen.getByLabelText('Hourly Rate'), '-100');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByText(/hourly rate cannot be negative/i)).toBeInTheDocument();
});
```

**What NOT to test:**
- Internal state values
- CSS classes or visual styling
- shadcn/ui or Radix UI internals

### 3c. Hook Tests — `modules/<name>/tests/hooks/`

Test custom hooks using `@testing-library/react`'s `renderHook`.

**What to test:**
- Hooks return the correct initial state
- Hooks call the service layer with correct arguments
- Hooks handle loading and error states

### 3d. E2E Tests — `apps/web/tests/e2e/`

Test critical user journeys across the full application using Playwright.

**Critical journeys to cover:**

| Journey | File | Priority |
|---------|------|----------|
| Login → Dashboard → Logout | `auth.spec.ts` | 🔴 Critical |
| Add Employee → Verify in list | `employees.spec.ts` | 🔴 Critical |
| Production Entry (single design) | `production-entry.spec.ts` | 🔴 Critical |
| Production Entry (multiple designs) | `production-entry.spec.ts` | 🔴 Critical |
| Generate Payroll → Lock Payroll | `payroll.spec.ts` | 🔴 Critical |
| Deactivate Employee → Select in Production (reactivation prompt) | `employees.spec.ts` | 🟡 High |
| Export Report as PDF | `reports.spec.ts` | 🟡 High |
| Mobile viewport: Production Entry | `mobile.spec.ts` | 🟡 High |

**Playwright configuration:**
- Browsers: Chromium (primary), Firefox, WebKit
- Mobile viewports: iPhone 13 (390×844), Pixel 5 (393×851)
- Base URL: `http://localhost:5173`

**E2E folder structure:**
```
apps/web/
└── tests/
    └── e2e/
        ├── auth.spec.ts
        ├── employees.spec.ts
        ├── production-entry.spec.ts
        ├── payroll.spec.ts
        ├── reports.spec.ts
        └── mobile.spec.ts
```

---

## 4. Backend Testing

### 4a. Route Integration Tests — `apps/api/tests/integration/`

Test API routes using Fastify's built-in `inject()` method. No real HTTP connections. No port binding. Fast and isolated.

**What to test:**
- All happy paths return the correct status code and envelope
- Validation errors return `400` with correct error code and field
- Unauthenticated requests return `401`
- Unauthorized requests return `403`
- Locked payroll cannot be modified (returns `422`)
- Inactive employee cannot be selected in production entry

**Example:**
```ts
// tests/integration/employees.spec.ts
describe('POST /api/v1/employees', () => {
  it('returns 201 with created employee', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/employees',
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { name: 'Test Worker', hourlyRate: 50, joiningDate: '2026-01-01' },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().success).toBe(true);
    expect(response.json().data.name).toBe('Test Worker');
  });

  it('returns 401 without auth token', async () => {
    const response = await app.inject({ method: 'POST', url: '/api/v1/employees', payload: {} });
    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('returns 403 for OPERATOR role', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/employees',
      headers: { authorization: `Bearer ${operatorToken}` },
      payload: { name: 'Test', hourlyRate: 50, joiningDate: '2026-01-01' },
    });
    expect(response.statusCode).toBe(403);
  });
});
```

**Test database:** Use a separate SQLite in-memory or test-specific file database. Never run tests against the development database.

```bash
# .env.test
DATABASE_URL="file:./prisma/test.db"
```

### 4b. Service Unit Tests — `apps/api/tests/unit/`

Test service layer functions with a mocked Prisma client.

**What to test:**
- Payroll generation produces correct calculations
- Locking a payroll sets `locked = true` and `lockedAt`
- Attempting to modify a locked payroll throws `PayrollLockedError`
- Deactivating an employee emits `employee.deactivated` domain event

---

## 5. File Naming Convention

| Type | Convention | Example |
|------|-----------|---------|
| Unit test | `*.test.ts` | `calculateNetPay.test.ts` |
| Component test | `*.test.tsx` | `EmployeeForm.test.tsx` |
| Hook test | `*.test.ts` | `useProductionEntry.test.ts` |
| Integration test | `*.spec.ts` | `employees.spec.ts` |
| E2E test | `*.spec.ts` | `production-entry.spec.ts` |

---

## 6. Test Coverage Targets

| Layer | Target | Rationale |
|-------|--------|-----------|
| `lib/` functions (all modules) | 100% | Business calculations must be exhaustively correct |
| `payroll/lib/` specifically | 100% | Financial correctness is non-negotiable |
| Component tests | 70%+ | Critical interactions covered |
| API integration routes | 80%+ | All status code paths covered |
| E2E critical journeys | All defined journeys | Login, production entry, payroll are non-negotiable |

---

## 7. Running Tests

```bash
# Frontend unit + component tests
cd apps/web && npm run test

# Frontend tests with coverage
cd apps/web && npm run test:coverage

# E2E tests (requires dev servers running)
cd apps/web && npm run test:e2e

# Backend unit + integration tests
cd apps/api && npm run test

# Backend tests with coverage
cd apps/api && npm run test:coverage

# All tests from root
npm run test --workspaces
```

---

## 8. CI Integration

Tests run automatically on every pull request:
1. `eslint` — code quality
2. `tsc --noEmit` — TypeScript type check
3. `vitest run` — unit + component tests (frontend + backend)
4. `playwright test` — E2E tests

A pull request cannot be merged if any test fails.

---

*This document is updated when new test patterns are established or new critical journeys are identified.*
