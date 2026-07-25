# D-006 — Hosting & Deployment

**Status:** Accepted — content stands; **execution deferred, see D-012** (local-first dev
first, Fly.io provisioning happens when the owner says go)
**Date:** 2026-07-25
**Decided by:** Project owner (explicit choice: Fly.io)

## Decision

- **Host:** Fly.io
- **Fly app name:** `project-bct` (matches the project name from D-001, lowercase-hyphen
  form — Fly app names can't have uppercase/underscores)
- **Container:** multi-stage Dockerfile — Node 20 build stage, slim Node 20 runtime stage
- **Persistence:** a Fly volume mounted at `/data`, holding the SQLite file
  (`/data/bct.db`, per D-003)
- **Release step:** `prisma migrate deploy` runs as Fly's `release_command`, before the
  new version takes traffic
- **Backups:** the Builder must set up a scheduled job (Fly Machine on a cron trigger, or
  a simple GitHub Actions scheduled workflow) that copies `/data/bct.db` to offsite
  storage (e.g. a private GitHub release asset or an S3-compatible bucket) at least
  weekly. This is not optional — see D-003's accepted risk (single SQLite file, no
  redundancy).

## Why

Owner's explicit choice. Fly.io supports Dockerized Next.js apps and persistent volumes,
which is exactly what the SQLite decision (D-003) requires.

## Important — verify before building, don't assume

Fly.io's exact CLI commands, free-tier limits, and volume pricing change over time and
this plan is not the authoritative source. **Before writing `fly.toml` or the deploy
workflow, the Builder should pull Fly's current documentation** rather than working from
either the Planner's or the Builder's training data. This is the provenance principle
(D-011) applied to infrastructure, not just app data — "how Fly.io works" is a claim like
any other and needs a current source.

## Consequences for the Builder

- `fly.toml` declares the volume mount, the release command, and internal port.
- `Dockerfile` builds the Next.js app in standalone output mode (`next.config.js` →
  `output: 'standalone'`) to keep the runtime image small.
- Deploy only happens via the GitHub Actions workflow on merge to `main` — see D-008. No
  manual `fly deploy` as a habit (KEEL Step 14).
