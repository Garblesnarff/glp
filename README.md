# GLP-1 Meal Planner

A production-oriented Bun + React + TypeScript scaffold for a deployable GLP-1 meal planning app.

## Stack

- Vite
- Bun
- React
- TypeScript
- ESLint
- Bun test
- WorkOS-ready auth boundary
- Supabase-ready persistence boundary

## Commands

- `bun install`
- `bun run dev`
- `bun run build`
- `bun run lint`
- `bun test`

## Project structure

- `src/app`: app shell components
- `src/config`: typed environment and deployment configuration
- `src/features/meal-planner`: feature-specific data, types, and UI
- `src/integrations`: external service configuration boundaries
- `src/lib`: shared utilities
- `supabase/migrations`: database schema for the hosted Supabase instance

## Notes

- The app uses a browser-safe storage adapter. It prefers an injected `window.storage` API when present and falls back to `localStorage`.
- Recipe data currently lives in source so future feature work can focus on UX, persistence, auth, and backend integration without re-scaffolding.
- Bun is the default package manager and test runner. Vite remains the browser bundler for a straightforward deployment path.
- Meal-planner persistence is abstracted behind a repository interface so local storage can be replaced by Supabase without rewriting feature code.
- Add `.env` values from `.env.example` before wiring WorkOS and Supabase clients.
- WorkOS is the auth source of truth. Supabase is configured to accept WorkOS JWTs through the client `accessToken` callback.

## Deployment

- Hetzner deployment runbook: [deploy/hetzner/DEPLOYMENT_RUNBOOK.md](/Volumes/T7/Claude-workspaces/glp/deploy/hetzner/DEPLOYMENT_RUNBOOK.md)
- Hetzner production env template: [deploy/hetzner/.env.production.example](/Volumes/T7/Claude-workspaces/glp/deploy/hetzner/.env.production.example)
- Nginx site template: [deploy/hetzner/nginx.glp.conf.example](/Volumes/T7/Claude-workspaces/glp/deploy/hetzner/nginx.glp.conf.example)
- PM2 worker config: [deploy/hetzner/ecosystem.config.cjs](/Volumes/T7/Claude-workspaces/glp/deploy/hetzner/ecosystem.config.cjs)
- Hetzner cutover checklist: [HETZNER_CUTOVER_CHECKLIST.md](/Volumes/T7/Claude-workspaces/glp/HETZNER_CUTOVER_CHECKLIST.md)

## QA

- Bug bash checklist: [BUG_BASH_CHECKLIST.md](/Volumes/T7/Claude-workspaces/glp/BUG_BASH_CHECKLIST.md)
- Manual QA checklist: [MANUAL_QA_CHECKLIST.md](/Volumes/T7/Claude-workspaces/glp/MANUAL_QA_CHECKLIST.md)
- QA run log template: [QA_RUN_LOG_TEMPLATE.md](/Volumes/T7/Claude-workspaces/glp/QA_RUN_LOG_TEMPLATE.md)
- Example QA run log: [qa-runs/2026-03-08-local-bug-bash.md](/Volumes/T7/Claude-workspaces/glp/qa-runs/2026-03-08-local-bug-bash.md)
- Production readiness checklist: [PRODUCTION_READINESS_CHECKLIST.md](/Volumes/T7/Claude-workspaces/glp/PRODUCTION_READINESS_CHECKLIST.md)
