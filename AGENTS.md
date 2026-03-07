# Project Instructions

## Goal

This repository is being built incrementally by AI agents. Prefer changes that keep the codebase easy to extend, test, and review.

## Architecture rules

- Keep feature logic inside `src/features`.
- Put reusable browser or app helpers in `src/lib`.
- Avoid monolithic files when a concern can be separated without adding ceremony.
- Preserve TypeScript strictness.
- Default to deployable browser behavior over host-specific APIs.

## Delivery rules

- Run `bun run lint`, `bun run typecheck`, and `bun test` after meaningful changes when dependencies are installed.
- Prefer small, typed utilities over implicit global behavior.
- If adding persistence, make browser compatibility the default and keep adapters swappable.
- Keep UI state local unless multiple features truly need to share it.
