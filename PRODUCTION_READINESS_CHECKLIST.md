# Production Readiness Checklist

This checklist is based on the current codebase and PRD state as of March 8, 2026.

## Status Legend

- `[x]` Complete in codebase
- `[-]` Partially complete / scaffolded
- `[ ]` Not complete yet

## 1. Product Surface

- `[x]` Companion-first routed app shell exists
- `[x]` Dashboard, daily log, history, planner, grocery, tracker, medication, weight, social-eating, partner, and inbox routes exist
- `[x]` Onboarding/profile flow exists
- `[x]` Recipe recommendations, meal response capture, and tolerance feedback exist
- `[x]` Dynamic protein targets are weight-based
- `[x]` Fiber ramp logic is medication-week aware
- `[x]` Bristol stool scale logging exists in constipation support
- `[-]` Some PRD features are foundation-level rather than fully polished
- `[ ]` Public marketing/landing site for real users
- `[ ]` Account settings page with profile/security/privacy controls
- `[ ]` Dedicated legal pages for privacy policy and terms

## 2. Local Development

- `[x]` Bun-first install/run workflow works
- `[x]` Local no-auth scaffold mode works
- `[x]` App defaults to `http://127.0.0.1:5533`
- `[x]` Lint, typecheck, tests, and build run under Bun scripts
- `[x]` Documented local smoke-test runbook for non-technical QA

## 3. Auth and Identity

- `[x]` WorkOS integration boundary exists
- `[x]` App can run without auth for local development
- `[-]` Hosted WorkOS flow is wired in code but still needs full environment validation in deployed infrastructure
- `[ ]` Production callback/cookie/session verification against live WorkOS environment
- `[ ]` Failure-state coverage for expired session, revoked user, and partial auth configuration

## 4. Database and Persistence

- `[x]` Supabase repository boundaries exist for core features
- `[x]` SQL migrations exist for planner, profile, daily logs, medication logs, weight logs, partner flows, and notifications
- `[x]` Local persistence fallbacks exist for local mode
- `[-]` Shared-account and partner flows are implemented but need end-to-end verification in hosted Supabase
- `[ ]` Migration runbook for Hetzner deployment
- `[ ]` Backup/restore procedure for production database
- `[ ]` Data retention policy and cleanup rules

## 5. Notifications and Delivery

- `[x]` In-app reminder derivation exists
- `[x]` Reminder preferences and channel intent exist
- `[x]` Notification queue, inbox, and Bun worker foundation exist
- `[x]` Transport readiness and provider adapter boundaries exist for email/SMS planning
- `[-]` Worker exists, but automated scheduling/orchestration is not yet live on the server
- `[ ]` Live Resend send execution
- `[ ]` Live Twilio send execution
- `[ ]` Push notification delivery, if still desired
- `[ ]` Production cron/systemd/worker scheduling on Hetzner
- `[ ]` Delivery failure retries, dead-letter handling, and alerting

## 6. Shared Household / Partner Flows

- `[x]` Invite, accept, decline, revoke, and unlink flows exist
- `[x]` Shared planner/grocery scope exists for hosted sessions
- `[x]` Rough-day support alert flow exists
- `[-]` Household behavior needs real multi-user QA in hosted mode
- `[ ]` Conflict/audit handling for simultaneous shared edits
- `[ ]` Stronger partner notification coordination beyond current in-app support flows

## 7. Clinical / Companion Features

- `[x]` Symptom logging exists
- `[x]` Hydration tracking and risk messaging exist
- `[x]` Constipation support flow exists
- `[x]` Medication timeline and refill planning exist
- `[x]` Weight logging and consistency framing exist
- `[x]` Food mood/noise tracking and coaching exist
- `[x]` Social eating playbook exists
- `[-]` Trending and correlation views are useful but still lightweight
- `[ ]` Clinician-style exports or downloadable summaries
- `[ ]` Deeper personalization from long-horizon behavior memory
- `[ ]` Lab-informed or clinician-adjustable target logic, if desired

## 8. QA and Reliability

- `[x]` Unit/integration-style logic tests exist for many domain helpers
- `[x]` Core Bun checks pass now: `typecheck`, `lint`, `test`, `build`
- `[-]` UI is feature-rich enough that manual regression testing is now required before release
- `[x]` Route-by-route QA checklist
- `[ ]` Empty-state, error-state, and slow-loading-state audit
- `[ ]` Hosted environment smoke tests
- `[ ]` Browser/device QA for mobile Safari and Chrome on Android
- `[ ]` Accessibility pass for keyboard, contrast, semantics, and labels

Manual QA artifact:

- [MANUAL_QA_CHECKLIST.md](/Volumes/T7/Claude-workspaces/glp/MANUAL_QA_CHECKLIST.md)

## 9. Security and Compliance

- `[x]` RLS groundwork exists in Supabase migrations
- `[-]` Sensitive-user-data app exists conceptually, so privacy/security review is now required before public release
- `[ ]` Secrets handling/runbook for WorkOS, Supabase, Resend, and Twilio on Hetzner
- `[ ]` CSP, headers, and reverse-proxy hardening review
- `[ ]` Privacy policy and terms
- `[ ]` Incident response and credential rotation checklist
- `[ ]` Review whether any HIPAA/medical-disclaimer language is needed for launch positioning

## 10. Deployment and Operations

- `[x]` Bun-compatible project structure exists
- `[x]` Local Supabase docker assets exist in repo
- `[-]` Hetzner target is clear, but deployment automation is not yet defined in repo
- `[ ]` Production deployment script or documented manual runbook
- `[ ]` Reverse proxy config (Caddy/Nginx) for app and worker environment
- `[ ]` Systemd/PM2/service definition for Bun app
- `[ ]` Systemd/cron/service definition for notification worker
- `[ ]` Production log aggregation and basic monitoring
- `[ ]` Health checks for app, database connectivity, and worker execution

## 11. Release Readiness

- `[ ]` Freeze feature work and run a dedicated bug bash
- `[ ]` Verify production env vars on Hetzner
- `[ ]` Run migrations against production-like environment
- `[ ]` Test full WorkOS login/logout/callback flow
- `[ ]` Test Supabase persistence end-to-end with two linked users
- `[ ]` Test reminder scheduling and worker execution end-to-end
- `[ ]` Confirm backup plan before first real-user data
- `[ ]` Add versioned release notes / launch checklist

## Recommended Next Sequence

1. `P0`: Hosted-stack validation
   - WorkOS real env
   - Supabase real env
   - multi-user partner/account flow verification

2. `P0`: Worker deployment
   - define how the Bun notification worker runs on Hetzner
   - add scheduling and health checks

3. `P0`: Production safety minimums
   - privacy policy
   - terms
   - secrets/runbook
   - backups

4. `P1`: Release QA
   - route-by-route smoke test
   - mobile/browser pass
   - accessibility pass

5. `P1`: External delivery
   - live Resend/Twilio execution
   - retry/failure handling

## Release Recommendation

Today, the app looks ready for:

- internal use
- founder QA
- hosted staging
- small private alpha

It is not yet ready for:

- broad public release with real users
- unsupervised notifications across external channels
- a launch without ops/security/runbook work
