# FRMS — Modules Overview

> **Document:** docs/MODULES.md
> **Status:** Reference — Updated as modules are built
> **Last Updated:** 2026-06-28

This document is the single-page reference for understanding the entire FRMS system. Read this before building or reviewing any module.

---

## Module Dependency Graph

```
                    ┌─────────────────┐
                    │   Master Data   │
                    │ (Employees,     │
                    │  Machines,      │
                    │  Designs)       │
                    └────────┬────────┘
                             │ provides reference data to
                             ▼
                    ┌─────────────────┐
                    │   Production    │◄─── primary data source
                    │   (Daily Entry) │
                    └────────┬────────┘
                             │ feeds into
                    ┌────────▼────────┐
                    │    Payroll      │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────────┐
        │Dashboard │  │ Reports  │  │Notifications │
        └──────────┘  └──────────┘  └──────────────┘

  ┌──────────────────────────────────────────────────┐
  │ Cross-cutting: User Roles, Settings, Data Mgmt   │
  └──────────────────────────────────────────────────┘
```

---

## Module Build Order (Recommended)

| Order | Module | Reason |
|-------|--------|--------|
| 1 | **User Roles & Permissions** | Every other module depends on RBAC |
| 2 | **Settings** | Provides application defaults before data entry |
| 3 | **Master Data — Employees** | Required by Production and Payroll |
| 4 | **Master Data — Machines** | Required by Production |
| 5 | **Master Data — Designs** | Required by Production |
| 6 | **Production** | Core daily workflow; feeds Payroll and Reports |
| 7 | **Payroll** | Depends on Production data |
| 8 | **Dashboard** | Reads from all modules |
| 9 | **Reports & Analytics** | Reads from all modules |
| 10 | **Notifications** | Integrates with all modules |
| 11 | **Data Management** | Backup/restore; depends on all data |

---

## Module 1 — Dashboard

### Purpose
Default landing page. Provides factory owners and supervisors with a real-time operational overview without navigating to individual modules.

### Key Screens
| Screen | Route | Description |
|--------|-------|-------------|
| Management Dashboard | `/dashboard` | KPIs, trends, payroll summary, alerts |
| Production Dashboard | `/dashboard?mode=production` | Today's production focus, quick entry |

### Features
- Two dashboard modes: **Management** and **Production**
- Customizable widgets
- **Quick Production Entry** shortcut (avoids navigating to Production module)
- Today's production snapshot
- Payroll summary (pending, paid, overdue)
- Employee performance cards
- Machine status overview
- Active alerts (backup overdue, payroll due)
- Trend charts (production volume, quality rate)

### Owned Entities
None — reads from all other modules. Does not write data except via Quick Production Entry (which delegates to the Production module).

### Dependencies
- Production (today's entries, trend data)
- Payroll (pending/paid summary)
- Master Data (employee/machine status)
- Notifications (alert badges)

### Key Business Rules (Constitution §6.9)
- Dashboard is the **default landing page** — users must not be redirected elsewhere on login
- Two modes must always be available
- Widgets must display meaningful data, not raw numbers without context
- Must not cause information overload — prioritize the most actionable data

---

## Module 2 — Master Data

Three sub-modules sharing the same pattern. Each maintains a reusable reference entity.

---

### 2a — Employees

#### Purpose
Central registry of all factory workers. The authoritative source of employee information used by Production and Payroll.

#### Key Screens
| Screen | Route |
|--------|-------|
| Employee List | `/masters/employees` |
| Add Employee | `/masters/employees/new` |
| Employee Detail / Edit | `/masters/employees/:id` |

#### Fields
`name`, `mobile`, `joiningDate`, `hourlyRate`, `status`, `notes`, `bankName`, `accountNumber`, `ifscCode`

#### Key Business Rules (Constitution §6.3)
- Employees are **never permanently deleted** — only deactivated (`status = INACTIVE`)
- Inactive employees remain accessible in all historical reports
- Selecting an inactive employee anywhere in the system prompts reactivation
- Missing employees can be created **directly from searchable dropdowns** in Production Entry
- Employee names must be searchable (type-to-search)

---

### 2b — Machines

#### Purpose
Registry of embroidery machines used during production.

#### Key Screens
| Screen | Route |
|--------|-------|
| Machine List | `/masters/machines` |
| Add Machine | `/masters/machines/new` |
| Machine Detail / Edit | `/masters/machines/:id` |

#### Key Business Rules (Constitution §6.4)
- Machines are **never permanently deleted** — only deactivated
- Inactive machines remain in historical production records
- Selecting an inactive machine prompts reactivation
- Machines can be created directly from production entry dropdowns

---

### 2c — Designs

#### Purpose
Catalog of embroidery designs assigned to production entries.

#### Key Screens
| Screen | Route |
|--------|-------|
| Design List | `/masters/designs` |
| Add Design | `/masters/designs/new` |

#### Key Business Rules (Constitution §6.5)
- Designs are **never deleted** — historical production must always reference the original design
- New designs can be created directly from the Production Entry form
- Designs are searchable

---

## Module 3 — Production

### Purpose
Record the daily work completed by employees. This is the **most frequently used module** and the data foundation for Payroll and Reports.

### Key Screens
| Screen | Route | Usage Frequency |
|--------|-------|----------------|
| Production Entry | `/production` | **Daily — multiple times per day** |
| Production History | `/production/history` | Weekly / as needed |

### Production Entry Structure
```
Header (once per entry)
├── Date            ← Defaults to today; editable
├── Employee        ← Searchable dropdown
├── Machine         ← Searchable dropdown
└── Shift           ← DAY or NIGHT

Design Rows (one or more)
├── Design          ← Searchable dropdown; creatable inline
├── Stitch Count    ← Manually entered
├── Hours Worked    ← Used in payroll calculation
└── Quality Check   ← PASS or FAIL

Daily Summary (once per entry)
├── Frames Changed  ← Full day total
├── Thread Breakage ← Full day total
├── Bonus           ← Defaults to 0
└── Notes           ← Optional
```

### Owned Entities
`ProductionEntry` (header), `ProductionDetail` (design rows)

### Dependencies
- Master Data — Employees, Machines, Designs (all required for entry)

### Key Business Rules (Constitution §6.6)
- Date defaults to today but **remains editable**
- Multiple design rows are **optional** — one is the minimum
- `framesChanged` and `threadBreakage` apply to the **full day**, not per design
- `bonus` defaults to **0**
- After saving, **only Date, Shift, and Machine are retained** — employee and design rows clear
- Saving does not navigate away — allows rapid sequential entry

### Module `lib/` Functions
| Function | Purpose |
|----------|---------|
| `calculateEfficiency` | Stitch count ÷ hours worked |
| `calculateThreadBreakage` | Thread breakage rate as percentage |
| `calculateProductionSummary` | Daily, weekly, monthly aggregations |

---

## Module 4 — Payroll

### Purpose
Automatically calculate and track employee wages from production data. Users must **never manually calculate wages**.

### Key Screens
| Screen | Route |
|--------|-------|
| Payroll List | `/payroll` |
| Generate Payroll | `/payroll/generate` |
| Payroll Detail | `/payroll/:id` |

### Payroll Formula (Constitution §6.7, §12.2)
```
Basic Wage   = Hours Worked × Hourly Rate
Gross Wage   = Basic Wage + Bonus
Net Pay      = Gross Wage − Salary Advances
```

### Features
- Custom user-defined payroll periods (start date to end date)
- Preview before finalizing (show calculation breakdown)
- Record payment date and payment method
- Pending / Paid status tracking
- **Payroll lock** — locked payroll is immutable

### Owned Entities
`Payroll`, `SalaryAdvance`

### Dependencies
- Production (source of Hours Worked and Bonus)
- Master Data — Employees (source of Hourly Rate)

### Key Business Rules (Constitution §6.7)
- Payroll is **generated from production data** — never manually entered
- Salary advances are **deducted automatically**
- Locked payroll **cannot be modified** under any circumstances
- Not supported in Version 1: loans, taxes, salary slips, partial payments
- Edge case: if Net Pay < 0, show a warning — behavior to be formally defined

### Module `lib/` Functions
| Function | Purpose |
|----------|---------|
| `calculateBasicWage` | hours × hourlyRate |
| `calculateGrossWage` | basicWage + bonus |
| `calculateNetPay` | grossWage − salaryAdvances |
| `validatePayrollPeriod` | Ensure period dates are valid and non-overlapping |

---

## Module 5 — Reports & Analytics

### Purpose
Transform production and payroll data into business intelligence. Reports must **answer business questions**, not simply list records.

### Key Screens
| Screen | Route |
|--------|-------|
| Reports Home | `/reports` |
| Employee Report | `/reports/employee` |
| Machine Report | `/reports/machine` |
| Production Report | `/reports/production` |
| Payroll Report | `/reports/payroll` |
| Quality Report | `/reports/quality` |
| Trends | `/reports/trends` |

### Report Types (Constitution §6.8)
| Report | Key Questions Answered |
|--------|----------------------|
| Employee | Who produces the most? Who has the highest quality rate? |
| Machine | Which machine is most utilized? Which has the most thread breakage? |
| Design | Which designs are most frequently produced? |
| Payroll | What are total wages per period? Who received advances? |
| Production | Daily/weekly/monthly production volumes |
| Quality | Pass/fail rates by employee, machine, and design |
| Trends | Production and quality trends over time |

### Features
- All reports support filtering (date range, employee, machine, design)
- Charts used whenever they improve understanding
- Tables available for detailed analysis
- Export: **PDF**, **Excel**, **Print**

### Owned Entities
None — reads from Production, Payroll, and Master Data.

### Dependencies
- Production, Payroll, Master Data (all)

### Key Business Rules (Constitution §6.8)
- Reports must be generated from recorded data — not estimates
- Charts are preferred over raw numbers for trend data
- Every report must support at minimum: date range filter and export

---

## Module 6 — Notifications

### Purpose
Inform users about important events requiring attention. Notifications assist users without disrupting their workflow.

### Key Screens
| Screen | Route |
|--------|-------|
| Notification Center | `/notifications` |

### Notification Types (Constitution §6.10)
| Type | Severity | Display |
|------|----------|---------|
| Payroll due / generated | INFO | Dashboard + Center |
| Backup completed | INFO | Center only |
| Backup failed | CRITICAL | Popup + Center |
| Quality check failures | WARNING | Dashboard + Center |
| Database corruption | CRITICAL | Popup + Center |
| Production milestone | INFO | Dashboard + Center |

### Owned Entities
`Notification`

### Key Business Rules (Constitution §6.10)
- `CRITICAL` notifications appear as **immediate popup alerts**
- `INFO` and `WARNING` notifications appear in the Dashboard and Notification Center only
- Notifications are stored — not transient
- Read/unread state is tracked per user

---

## Module 7 — Data Management

### Purpose
Protect application data through backup, restore, import, export, and audit logging.

### Key Screens
| Screen | Route |
|--------|-------|
| Data Management Home | `/data` |
| Backup | `/data/backup` |
| Import Center | `/data/import` |
| Export Center | `/data/export` |
| Audit Logs | `/data/audit` |
| Archive | `/data/archive` |
| Recycle Bin | `/data/recycle-bin` |

### Features (Constitution §6.11)
- Manual backup trigger
- Automatic scheduled local backup
- Import Center (bulk data import)
- Export Center (data export for external use)
- **Audit Logs** — immutable record of all significant actions
- Archive — move old records to archive (still searchable)
- Recycle Bin — soft-deleted records recoverable by Admin

### Owned Entities
`AuditLog`, backup records

### Key Business Rules (Constitution §6.11, §6.12)
- Business records are **never permanently deleted** without administrator action
- Audit logs are **immutable** — no editing or deletion
- Archived data remains searchable
- Backup failure triggers a `CRITICAL` notification

---

## Module 8 — User Roles & Permissions

### Purpose
Control who can access, create, modify, and delete records across the application.

### Key Screens
| Screen | Route |
|--------|-------|
| User List | `/users` |
| User Form | `/users/new`, `/users/:id` |
| Role & Permission Matrix | `/users/roles` |

### Roles & Permissions (v1)

| Module / Action | `ADMIN` | `SUPERVISOR` | `OPERATOR` |
|-----------------|---------|--------------|------------|
| **Dashboard** | Full Access | Full Access | Read-only |
| **Master Data** | Create/Edit/Deactivate | View Only | View Only |
| **Production** | Full Access | Full Access | Create/View |
| **Payroll** | Generate/Lock/View | View Only | No Access |
| **Reports** | Full Access | Full Access | No Access |
| **Notifications** | Manage | View Own | View Own |
| **Data Mgmt** | Full Access | No Access | No Access |
| **User Mgmt** | Full Access | No Access | No Access |
| **Settings** | Full Access | View Only | No Access |

### Owned Entities
`User`

### Key Business Rules (Constitution §6, §8.12)
- RBAC — Role-Based Access Control
- Permissions are checked on both frontend (UI visibility) and backend (API authorization)
- User Management is accessible to ADMIN only
- Deactivated users cannot log in

---

## Module 9 — Settings

### Purpose
Control application behavior through configuration without requiring code changes.

### Key Screens
| Screen | Route |
|--------|-------|
| Settings | `/settings` |

### Setting Categories
| Category | Examples |
|----------|---------|
| Company | Company name, address |
| Payroll | Default payroll period, advance limits |
| Backup | Automatic backup schedule, backup location |
| Theme | Light / Dark / System default |
| Notifications | Which events trigger notifications |

### Owned Entities
`Settings` (key-value store)

### Key Business Rules (Constitution §6, §8.15)
- Configuration must be centralized — no hardcoded company information in code
- Settings changes are recorded in the Audit Log
- Theme preference is per-user (stored in Zustand + localStorage)
- Company-level settings are global and ADMIN-only

---

## Cross-Module Standards

These apply to **every** module without exception.

### Navigation
Every module is accessible within **2–3 clicks** from any screen (Constitution §7.4).

### Forms
- Group related fields into sections
- Auto-fill sensible defaults (today's date, etc.)
- Primary button: **Save** | Secondary: **Cancel**
- Retain context after save where appropriate (Production Entry)

### Tables
Every table must support: Search, Sort, Filter, Pagination, Column visibility, Export (Constitution §7.8).

### Empty States
Never show a blank screen. Always provide a message and a call-to-action (Constitution §7.11).

### Validation Messages
- Validate before saving
- Display message close to the relevant field
- Explain *how* to fix the error — not just *what* the error is (Constitution §7.9)

### Responsive Behavior
- Mobile: single column, cards over tables, large touch targets
- Tablet: two columns, expanded charts
- Desktop: multi-column, full tables, keyboard shortcuts (Constitution §7.3)

---

*This document is updated as each module is approved and built. Module status is tracked in task.md during active development.*
