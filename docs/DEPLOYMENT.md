# FRMS — Deployment Guide

> **Document:** docs/DEPLOYMENT.md
> **Status:** Reference — Updated as deployment decisions are finalized
> **Last Updated:** 2026-06-28

---

## 1. Deployment Overview

FRMS is designed to be **deployment-agnostic**. The same codebase supports three deployment modes without code changes. Only environment variables differ between modes.

| Mode | Database | Who uses it |
|------|----------|-------------|
| **Local Development** | SQLite | Developers |
| **LAN Server** | SQLite or PostgreSQL | Single factory, internal network |
| **Cloud** | PostgreSQL | Remote access, multi-user |

The key that switches between modes is the `DATABASE_URL` and `HOST` environment variable.

---

## 2. Mode 1 — Local Development

Every developer runs the full stack locally.

### Prerequisites

- Node.js 20+ (LTS)
- npm 10+
- Git

### Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd FRMS

# 2. Install all workspace dependencies
npm install

# 3. Set up frontend environment
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env if needed (default values work for local dev)

# 4. Set up backend environment
cp apps/api/.env.example apps/api/.env
# Fill in JWT secrets — minimum 32 characters each
# DATABASE_URL is already set to SQLite in .env.example

# 5. Initialize the database
cd apps/api
npx prisma migrate dev
npx prisma db seed    # Optional: add demo data

# 6. Start development servers
cd ../..
npm run dev           # Starts both web (5173) and api (3000) concurrently
```

### Development Commands

```bash
# Start both servers
npm run dev

# Start only frontend
npm run dev:web

# Start only backend
npm run dev:api

# Run all tests
npm run test

# Type check all packages
npm run typecheck

# Lint all packages
npm run lint

# Format all packages
npm run format
```

---

## 3. Mode 2 — LAN Server

The API server runs on a machine (PC, Raspberry Pi, NAS) on the factory's local network. All devices (phones, tablets, desktops) access it over Wi-Fi.

### Architecture

```
Factory Wi-Fi Network
    │
    ├── Server PC / Raspberry Pi
    │   ├── apps/api (Node.js — port 3000)
    │   └── apps/web/dist (served by nginx or Node.js — port 80 or 8080)
    │
    ├── Mobile Phone 1 → http://192.168.1.100
    ├── Mobile Phone 2 → http://192.168.1.100
    └── Desktop PC → http://192.168.1.100
```

### Build for LAN Deployment

```bash
# 1. Build frontend static files
cd apps/web
npm run build
# Output: apps/web/dist/

# 2. Set backend HOST to 0.0.0.0 to accept LAN connections
# apps/api/.env:
HOST=0.0.0.0
PORT=3000
CORS_ORIGIN=http://192.168.1.100   # LAN IP of the server

# 3. Set frontend API URL to the server's LAN IP
# apps/web/.env:
VITE_API_BASE_URL=http://192.168.1.100:3000/api/v1

# 4. Start the API server
cd apps/api
npm run start

# 5. Serve frontend static files (option A: Node.js serve)
npx serve apps/web/dist -l 8080

# 5. Serve frontend static files (option B: nginx)
# Point nginx root to apps/web/dist/
# Configure try_files for SPA routing
```

### nginx Configuration (LAN)

```nginx
server {
    listen 80;
    root /path/to/FRMS/apps/web/dist;
    index index.html;

    # SPA routing — serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to the Node.js backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Database Choice for LAN

- **SQLite** — sufficient for a single factory with one concurrent writer. Simple, no server required.
- **PostgreSQL** — required if multiple users write data simultaneously at high frequency.

---

## 4. Mode 3 — Cloud Deployment

For remote access or multi-site access via the internet.

### Infrastructure Requirements

| Service | Options |
|---------|---------|
| Frontend hosting | Vercel, Netlify, Cloudflare Pages, AWS S3 + CloudFront |
| Backend hosting | Railway, Render, Fly.io, AWS EC2, DigitalOcean |
| Database | Supabase (PostgreSQL), Neon, Railway PostgreSQL, self-hosted |

### Switching to PostgreSQL

```bash
# 1. Change datasource in apps/api/prisma/schema.prisma
# provider = "postgresql"  (one line change)

# 2. Update .env
DATABASE_URL="postgresql://user:password@host:5432/frms?schema=public"

# 3. Run migrations on PostgreSQL
cd apps/api
npx prisma migrate deploy
```

### Environment Variables for Production

```bash
# apps/api/.env.production
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
LOG_LEVEL=warn

DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=<strong-random-secret-min-64-chars>
JWT_REFRESH_SECRET=<different-strong-random-secret-min-64-chars>
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

CORS_ORIGIN=https://frms.yourdomain.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

BACKUP_DIR=/var/frms/backups
AUTO_BACKUP_ENABLED=true
AUTO_BACKUP_INTERVAL_HOURS=24
```

---

## 5. Future: Electron Desktop App

If desktop deployment is chosen, Vite + Electron can be added without changing frontend code:

1. Add `electron` and `electron-vite` packages to a new `apps/desktop` workspace
2. The `apps/web` build output is served by Electron's renderer process
3. The `apps/api` runs as a child process within the Electron main process
4. SQLite is the natural database choice (no external server)

No component code changes are required.

---

## 6. Pre-Deployment Checklist

Run before every production deployment:

```
Security
  [ ] JWT secrets are long (≥ 64 chars) and randomly generated
  [ ] .env files are not committed to git
  [ ] CORS_ORIGIN is restricted to the specific frontend domain
  [ ] HTTPS is enabled (not HTTP) in production
  [ ] Rate limiting is enabled

Database
  [ ] DATABASE_URL points to the correct production database
  [ ] `prisma migrate deploy` has been run
  [ ] Backup of existing data has been taken

Application
  [ ] NODE_ENV=production
  [ ] LOG_LEVEL=warn (not debug)
  [ ] Frontend .env points to the correct API URL
  [ ] Frontend build (npm run build) is fresh
  [ ] All tests pass (npm run test)

Operations
  [ ] Backup directory is writable
  [ ] Auto-backup is enabled and tested
  [ ] Error monitoring is configured (if applicable)
```

---

## 7. Rollback Procedure

If a deployment fails or causes regressions:

1. **Restore the previous build:** redeploy the previous frontend `dist/` and backend version
2. **Restore the database:** if migrations were run, use `prisma migrate reset` (caution — data loss) or restore from backup
3. **Never run `prisma migrate reset` on production** without a verified backup
4. **Check logs** (Pino JSON logs) to identify the root cause before redeploying

---

*This document is updated as deployment decisions are formalized. The production deployment target is not yet finalized — see Phase 1 decision D-001.*
