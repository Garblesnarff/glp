# Manual QA Checklist

This checklist is for hands-on validation before staging or production deploys. It is split into:

- local no-auth QA at `http://127.0.0.1:5533`
- hosted QA with WorkOS + Supabase
- route-by-route checks
- cross-cutting regression checks

## Status Legend

- `[ ]` Not run yet
- `[x]` Passed
- `[-]` Failed or needs follow-up
- `N/A` Not applicable for this environment

## 1. Test Environments

### Local No-Auth Mode

Use this for fast feature QA without WorkOS or Supabase.

- Start with:
  - `bun install`
  - `bun run dev`
- Open:
  - `http://127.0.0.1:5533`
- Expected:
  - app loads without sign-in
  - local scaffold banner is visible
  - data persists across refresh in the same browser

### Hosted Mode

Use this after Hetzner deploy with real env vars.

- Expected:
  - WorkOS login works
  - Supabase persistence works across refresh and devices
  - linked household behavior works across two users
  - notification worker can create and process deliveries

## 2. Global Smoke Test

- `[ ]` App loads without console-breaking errors
- `[ ]` Top navigation renders and every nav link opens the expected route
- `[ ]` Browser refresh works on a deep link
- `[ ]` Returning to a page preserves saved state
- `[ ]` App remains usable on a narrow mobile viewport
- `[ ]` No route shows obvious layout overflow or clipped controls

## 3. Local No-Auth Checklist

### App Shell and Routing

- `[ ]` `/` redirects or lands on the intended default experience
- `[ ]` local scaffold banner is shown
- `[ ]` nav links work for:
  - `[ ]` `/today`
  - `[ ]` `/history`
  - `[ ]` `/medication`
  - `[ ]` `/notifications`
  - `[ ]` `/onboarding`
  - `[ ]` `/partner`
  - `[ ]` `/social-eating`
  - `[ ]` `/weight`
  - `[ ]` `/planner`
  - `[ ]` `/grocery`
  - `[ ]` `/tracker`
  - `[ ]` `/recipes`
  - `[ ]` `/red-flags`

### Onboarding and Profile

- `[ ]` onboarding form loads without auth
- `[ ]` required fields can be completed and saved
- `[ ]` weight entry updates protein target range
- `[ ]` medication-week-aware fiber guidance appears
- `[ ]` saved profile persists after refresh

### Dashboard

- `[ ]` quick check-in saves appetite, food mood, and food noise
- `[ ]` hydration controls update totals
- `[ ]` symptom logging updates the current day
- `[ ]` recipe recommendations render
- `[ ]` recommendation reason badges are visible
- `[ ]` rough-day support alert can be triggered in local mode
- `[ ]` consistency wins section renders
- `[ ]` reminders panel renders without transport config

### Daily Log

- `[ ]` daily log opens from dashboard and direct route
- `[ ]` meal response card can log a meal outcome
- `[ ]` constipation card allows bowel movement logging
- `[ ]` Bristol stool scale can be set and saved
- `[ ]` supplement checklist can be toggled and saved
- `[ ]` movement checklist can be toggled and saved
- `[ ]` recent trends card updates after new entries

### History

- `[ ]` recent days render after at least one day of data exists
- `[ ]` pattern signals panel renders
- `[ ]` line charts render without overlap or empty-axis glitches
- `[ ]` meal outcome history appears when meals were logged
- `[ ]` consistency framing appears in history

### Medication

- `[ ]` medication page loads without auth
- `[ ]` shot log can be added
- `[ ]` shot status can be set to completed/delayed/missed
- `[ ]` dose increase marker can be saved
- `[ ]` injection site rotation can be saved
- `[ ]` refill planning fields can be saved
- `[ ]` reminder preferences can be changed and persist

### Notifications

- `[ ]` notifications page loads without auth
- `[ ]` inbox empty state is sensible before any jobs exist
- `[ ]` scheduled jobs can be refreshed or generated
- `[ ]` delivery cycle can be run from the UI in local mode
- `[ ]` created reminders appear in inbox
- `[ ]` reminder item shows requested channel vs actual channel
- `[ ]` reminder can be marked reviewed/handled

### Weight

- `[ ]` weight entry can be added
- `[ ]` optional waist and notes fields save correctly
- `[ ]` weight trend chart renders after multiple entries
- `[ ]` consistency-first framing appears instead of scale-only messaging

### Social Eating

- `[ ]` cuisine guidance renders
- `[ ]` current appetite/symptom state changes the advice
- `[ ]` family script / doggy-bag guidance is visible

### Planner, Recipes, Grocery, Tracker

- `[ ]` recipe filtering by search works
- `[ ]` meal filter works
- `[ ]` tag filter works
- `[ ]` recipe modal opens from card click
- `[ ]` enriched GLP-1 support metadata shows in the recipe modal
- `[ ]` planner can assign recipes into slots
- `[ ]` planner totals update when meals are assigned
- `[ ]` grocery list generates from the planner
- `[ ]` grocery items can be checked off and persist
- `[ ]` tracker bars update from planned meals

### Partner Workspace

- `[ ]` partner page loads without auth
- `[ ]` local empty states are understandable
- `[ ]` invite management UI renders without crashing
- `[ ]` linked-primary-context empty state is understandable in local mode
- `[ ]` rough-day alerts panel renders

### Safety

- `[ ]` red-flags page loads
- `[ ]` escalation guidance is readable on mobile
- `[ ]` navigation back to daily support flow is clear

## 4. Hosted WorkOS + Supabase Checklist

Run this only after deploy or against a production-like hosted environment.

### Auth

- `[ ]` `/login` starts the WorkOS flow
- `[ ]` `/auth/callback` completes successfully
- `[ ]` user lands in the app after login
- `[ ]` logout works cleanly
- `[ ]` broken or expired session shows a sane recovery path

### Persistence

- `[ ]` profile saves to Supabase and survives browser restart
- `[ ]` daily log saves to Supabase and survives browser restart
- `[ ]` planner saves to Supabase and survives browser restart
- `[ ]` weight log saves to Supabase and survives browser restart
- `[ ]` medication log saves to Supabase and survives browser restart

### Shared Household

- `[ ]` primary user can create/send partner invite
- `[ ]` prep partner can see incoming invite
- `[ ]` prep partner can accept invite
- `[ ]` shared planner becomes visible to both users
- `[ ]` grocery list reflects shared planner state for both users
- `[ ]` prep partner can decline or leave household
- `[ ]` rough-day alert created by primary user is visible to partner
- `[ ]` partner can mark support alert handled

### Notifications Worker

- `[ ]` notification jobs can be generated in hosted mode
- `[ ]` PM2-managed Bun worker processes deliveries
- `[ ]` in-app inbox reflects delivered reminders
- `[ ]` requested email/SMS channel falls back clearly when provider is unavailable
- `[ ]` provider readiness panel matches actual env configuration

## 5. Cross-Browser and Device Pass

- `[ ]` Chrome desktop
- `[ ]` Safari desktop
- `[ ]` Mobile Safari on iPhone
- `[ ]` Chrome on Android

For each:

- `[ ]` app shell/nav usable
- `[ ]` dashboard usable
- `[ ]` daily log usable
- `[ ]` planner usable
- `[ ]` weight/history charts readable
- `[ ]` no blocking tap-target or keyboard issues

## 6. Accessibility Pass

- `[ ]` keyboard navigation reaches all major controls
- `[ ]` focus states are visible
- `[ ]` buttons and inputs have readable labels
- `[ ]` color contrast is acceptable on cards, tabs, and charts
- `[ ]` modal can be opened and closed with keyboard
- `[ ]` screen-reader audit of major route headings and forms

## 7. Empty, Error, and Slow-State Pass

- `[ ]` empty planner state is clear
- `[ ]` empty grocery state is clear
- `[ ]` empty notifications state is clear
- `[ ]` empty partner state is clear
- `[ ]` empty history state is clear
- `[ ]` failed save states show useful feedback where applicable
- `[ ]` loading states do not leave blank or confusing screens

## 8. Suggested Test Order

1. Local no-auth smoke test
2. Onboarding -> dashboard -> daily log -> history
3. Planner -> grocery -> tracker -> recipe modal
4. Medication -> notifications -> weight
5. Social eating -> partner -> red flags
6. Hosted auth and persistence
7. Hosted shared-household flow with two accounts
8. Hosted notification worker flow
9. Mobile/browser pass
10. Accessibility pass

## 9. Bug Log Template

Use this format for issues found during QA:

- Route:
- Environment:
- Device/Browser:
- Reproduction steps:
- Expected result:
- Actual result:
- Severity:
- Screenshot/video:

