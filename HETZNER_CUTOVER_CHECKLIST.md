# Hetzner Cutover Checklist

Use this when moving from local-only validation to the real hosted stack on `glp.infiniterealms.tech`.

This checklist is intentionally limited to the deployment-critical work:

- hosted integration validation
- production safety basics
- notification/worker reality check

## Status Legend

- `[ ]` Not started
- `[x]` Complete
- `[-]` Failed or needs follow-up

## 1. Hosted Integration Validation

### Domain and App Reachability

- `[ ]` `glp.infiniterealms.tech` resolves to the Hetzner box
- `[ ]` Nginx site config is enabled for `glp.infiniterealms.tech`
- `[ ]` TLS certificate is issued and HTTPS works cleanly
- `[ ]` built frontend is being served from the expected app root

### WorkOS Auth

- `[ ]` `VITE_WORKOS_CLIENT_ID` is set correctly
- `[ ]` `VITE_WORKOS_API_HOSTNAME` is set correctly
- `[ ]` WorkOS callback URL is configured as `https://glp.infiniterealms.tech/auth/callback`
- `[ ]` login flow completes from `/login`
- `[ ]` `/auth/callback` returns to the app successfully
- `[ ]` logout works and returns the app to a sane signed-out state
- `[ ]` a broken/expired session produces recoverable UX instead of a dead screen

### Supabase Persistence

- `[ ]` `VITE_SUPABASE_URL` points at the GLP self-hosted stack
- `[ ]` `VITE_SUPABASE_ANON_KEY` is set correctly
- `[ ]` `SUPABASE_SERVICE_ROLE_KEY` is set for worker/server operations
- `[ ]` database migrations are applied successfully
- `[ ]` profile saves persist across refresh
- `[ ]` daily log saves persist across refresh
- `[ ]` planner/grocery state persists across refresh
- `[ ]` medication logs persist across refresh
- `[ ]` weight logs persist across refresh

### Shared Household Validation

- `[ ]` primary user can send prep partner invite
- `[ ]` prep partner can see incoming invite
- `[ ]` prep partner can accept invite
- `[ ]` shared planner state is visible to both users
- `[ ]` rough-day support alert is visible across the linked household
- `[ ]` partner can leave household cleanly

## 2. Production Safety Basics

### Secrets and Config

- `[ ]` production env file exists on the server
- `[ ]` WorkOS secrets are only stored on the server, not in repo files
- `[ ]` Supabase keys are only stored on the server, not in repo files
- `[ ]` optional notification provider secrets are only present if those transports are actually live

### Database Safety

- `[ ]` confirm where GLP Postgres data volumes live
- `[ ]` document backup command/process for the GLP Postgres instance
- `[ ]` perform one manual backup before first real-user data
- `[ ]` confirm restore procedure at least at a runbook level

### Legal and User-Safety Basics

- `[ ]` privacy policy page/content exists before real user data is collected
- `[ ]` terms/disclaimer language exists before broader use
- `[ ]` medical-companion framing is non-diagnostic and non-clinician-replacement language is clear

## 3. Notification and Worker Reality Check

### Worker Execution

- `[ ]` PM2 process exists for the Bun notification worker
- `[ ]` PM2 worker starts successfully on the server
- `[ ]` PM2 worker restarts cleanly after deploy/reboot
- `[ ]` worker logs are readable and stored somewhere predictable

### Notification Flow

- `[ ]` scheduled jobs can be generated from the medication page
- `[ ]` worker processes due jobs
- `[ ]` delivered notifications appear in the in-app inbox
- `[ ]` fallback behavior is clear when email/SMS are not actually available
- `[ ]` transport readiness shown in the app matches real server env/config

### External Channel Reality Check

- `[ ]` if Resend is not live, email remains effectively unavailable
- `[ ]` if Twilio is not live, SMS remains effectively unavailable
- `[ ]` no UI copy implies external sends are active when they are still fallback-only

## Suggested Order

1. Domain + Nginx + TLS
2. WorkOS env + callback validation
3. Supabase env + migration validation
4. Single-user persistence validation
5. Two-user household validation
6. PM2 worker validation
7. Notification fallback/reality check
8. Backup + legal/disclaimer completion

