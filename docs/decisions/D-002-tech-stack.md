# D-002 — Tech Stack

**Status:** Accepted
**Date:** 2026-07-25
**Decided by:** Project owner (chose from options presented by Planner)

## Decision

- **Framework:** Next.js, App Router, TypeScript (strict mode on)
- **Runtime:** Node.js 20 LTS
- **Package manager:** npm (ships with Node, no extra tooling to install/maintain)
- **Styling:** Tailwind CSS (fast to build small internal tools with; no design system needed for v1)

## Why

Owner explicitly chose Node/Next.js over Python options: "one language, modern web app
feel." Confirmed by user selection, not inferred.

## Alternatives considered (rejected)

- Python + Flask/SQLite — rejected by owner's explicit choice
- Python + FastAPI/Postgres — rejected as more infrastructure than a small club app needs

## Consequences for the Builder

- `package.json`, TypeScript config, and Next.js App Router conventions govern file
  layout — see D-010 (repo layout).
- Docker build (see D-006) must produce a Node 20 runtime image.
