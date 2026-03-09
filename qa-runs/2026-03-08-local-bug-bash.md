# QA Run Log

## Run Info

- Date: 2026-03-08
- Tester: Codex
- Environment: local no-auth
- Build/version: workspace `main` state as of this run
- Browser/device: command-line smoke only, no browser automation available in repo
- Checklist used: [BUG_BASH_CHECKLIST.md](/Volumes/T7/Claude-workspaces/glp/BUG_BASH_CHECKLIST.md)

## Outcome Summary

- Total checks run: 8
- Passed: 8
- Failed: 0
- Blocked: manual browser/UI interactions not executed from this environment

## Executed Checks

### 1. Code-level smoke checks

- `[x]` `bun run typecheck`
- `[x]` `bun test`
- `[x]` `bun run build`

Notes:

- 49 tests passed
- production build completed successfully
- route-level chunks emitted as expected

### 2. Local serving smoke checks

- `[x]` `bun run preview --host 127.0.0.1 --port 5533`
- `[x]` HTTP `200 OK` returned from `http://127.0.0.1:5533`
- `[x]` served HTML includes the expected root shell and built asset references

Notes:

- confirmed `index.html` served with `#root`
- confirmed built JS and CSS asset tags are present

## Blocked / Not Yet Executed

These remain pending because this repo does not currently include Playwright, Cypress, or another browser automation layer:

- app shell navigation clicks
- onboarding save flow in a real browser
- dashboard interactions
- daily log interactions
- history and chart rendering verification in browser
- planner assignment flow
- grocery checkoff persistence in browser
- medication and notifications UI interaction
- partner workspace UI behavior
- mobile viewport usability

## Findings

No code-level or serving-level failures were found in this run.

## Recommended Next Run

1. Open `http://127.0.0.1:5533`
2. Execute the local section of [BUG_BASH_CHECKLIST.md](/Volumes/T7/Claude-workspaces/glp/BUG_BASH_CHECKLIST.md)
3. Record failures with [QA_RUN_LOG_TEMPLATE.md](/Volumes/T7/Claude-workspaces/glp/QA_RUN_LOG_TEMPLATE.md)
4. Open GitHub issues using [.github/ISSUE_TEMPLATE/bug-bash-report.md](/Volumes/T7/Claude-workspaces/glp/.github/ISSUE_TEMPLATE/bug-bash-report.md)

