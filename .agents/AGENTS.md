# Project Rules

- The application is in **BETA** and actively used in production.
- **DATA LOSS IS STRICTLY UNACCEPTABLE**.
- NEVER use `--accept-data-loss` with Prisma.
- ALWAYS use proper `npx prisma migrate` steps with custom SQL if necessary to rename tables or columns without dropping data.
