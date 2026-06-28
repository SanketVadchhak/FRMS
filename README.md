# Factory Resource Management System (FRMS)

This is the monorepo for the Factory Resource Management System.

## Documentation

Please read the following documents in `docs/` before contributing:

1. `ARCHITECTURE.md` - Technical architecture
2. `MODULES.md` - System modules overview
3. `DATABASE.md` - Database strategy and entity relationships
4. `BACKEND.md` - Backend architecture
5. `API.md` - API standards
6. `SECURITY.md` - Authentication and RBAC
7. `TESTING.md` - Testing strategy
8. `DEPLOYMENT.md` - Deployment modes
9. `CONTRIBUTING.md` - Contribution guide

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environments
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env

# 3. Setup database
cd apps/api
npx prisma migrate dev

# 4. Start development server
cd ../..
npm run dev
```

## Scripts

- `npm run dev`: Start all apps
- `npm run build`: Build all apps
- `npm run lint`: Lint all apps
- `npm run test`: Run tests
