// Vercel serverless entry point.
// Runs from the monorepo root so npm workspaces can resolve @frms/shared.
export { default } from '../apps/api/src/serverless';
