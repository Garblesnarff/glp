# Bug Bash Checklist

This is the shortest high-value QA pass for the current app. Use it before broader route/device testing.

Target environments:

- local no-auth mode at `http://127.0.0.1:5533`
- hosted mode after deploy for auth, shared household, and worker checks

## Status Legend

- `[ ]` Not run
- `[x]` Passed
- `[-]` Failed

## 1. Local Critical Path

### Boot and Shell

- `[ ]` App loads at `http://127.0.0.1:5533` without a blank screen
- `[ ]` Local scaffold banner is visible
- `[ ]` Top navigation works on desktop
- `[ ]` Top navigation works on a narrow mobile viewport

### Onboarding and Core Targets

- `[ ]` Onboarding saves successfully
- `[ ]` Current weight updates the protein target range
- `[ ]` Medication week updates fiber guidance
- `[ ]` Saved onboarding data survives refresh

### Dashboard and Daily Support

- `[ ]` Hydration controls update today’s state
- `[ ]` Appetite, food mood, and food noise save from the dashboard
- `[ ]` Recommendations appear with visible rationale badges
- `[ ]` Rough-day support can be triggered
- `[ ]` Daily log opens from dashboard

### Daily Log

- `[ ]` Meal response can be logged
- `[ ]` Bristol stool scale can be set and saved
- `[ ]` Supplements and movement checklist toggles persist
- `[ ]` Recent trends update after logging data

### History and Weight

- `[ ]` History page renders recent entries without layout issues
- `[ ]` Trend charts render after enough data exists
- `[ ]` Weight entry saves and appears in the trend view
- `[ ]` Weight page uses consistency framing instead of scale-only messaging

### Planner Stack

- `[ ]` Recipes can be filtered by search
- `[ ]` Recipe modal opens from a recipe card
- `[ ]` Recipe can be assigned into the planner
- `[ ]` Grocery list generates from planned meals
- `[ ]` Grocery item checkoff persists across refresh

### Medication and Notifications

- `[ ]` Medication log entry can be saved
- `[ ]` Refill planning fields can be saved
- `[ ]` Reminder preferences can be changed and persist
- `[ ]` Notifications page can generate or refresh jobs
- `[ ]` Local delivery cycle produces inbox items

## 2. Hosted Critical Path

Run these only after deploy with WorkOS and Supabase configured.

### Auth and Persistence

- `[ ]` Login flow completes through WorkOS
- `[ ]` Auth callback returns to the app successfully
- `[ ]` Profile and daily log changes persist after browser restart
- `[ ]` Planner changes persist after browser restart

### Shared Household

- `[ ]` Primary user can invite prep partner
- `[ ]` Prep partner can accept the invite
- `[ ]` Shared planner is visible to both users
- `[ ]` Rough-day alert from primary user is visible to prep partner

### Worker Flow

- `[ ]` Notification jobs exist in hosted mode
- `[ ]` PM2 worker processes deliveries
- `[ ]` Inbox reflects delivered notifications

## 3. Failure-Focused Spot Checks

- `[ ]` Empty notifications state is understandable
- `[ ]` Empty history state is understandable
- `[ ]` Empty partner state is understandable
- `[ ]` Red-flags route loads and is readable on mobile
- `[ ]` Deep-link refresh works on a routed page

## 4. Bug Log Format

- Route:
- Environment:
- Repro steps:
- Expected:
- Actual:
- Severity:

