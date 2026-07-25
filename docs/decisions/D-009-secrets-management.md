# D-009 — Secrets Management

**Status:** Accepted
**Date:** 2026-07-25
**Decided by:** Planner, per KEEL Step 9 (secrets live in the platform, never in code)

## Decision

| Secret | Lives in | Used by | Never appears in |
|---|---|---|---|
| `APP_PASSWORD` | Fly.io secrets | Runtime app (login check) | Repo, CI, `.env` files, chat logs |
| `SESSION_SECRET` | Fly.io secrets | Runtime app (cookie signing) | Repo, CI, `.env` files, chat logs |
| `FLY_API_TOKEN` | GitHub Actions repo secrets | `deploy` job in CI | Repo, local `.env` files |
| `DATABASE_URL` (points at `/data/bct.db`) | Fly.io secrets or `fly.toml` (path only, not a credential) | Runtime app | — |

- `.gitignore` must list `.env` and `.env.local` (confirm — file already exists in the
  repo per project setup; verify it still covers this).
- `.env.example` in the repo root lists **variable names only**, with placeholder/fake
  values, so anyone setting up locally knows what to set — never a real value.
- `FLY_API_TOKEN` must be created with deploy-only scope (`flyctl tokens create deploy`,
  or the current equivalent — verify against Fly's live docs per D-006), not a full
  personal access token.
- Naming: environment variable names in Fly secrets, GitHub secrets, and the app's own
  `process.env.X` references must match **exactly** — KEEL's own scar log flags a
  mismatched secret name as the single most common silent failure. Builder should
  double-check this by name, not by assumption, once secrets are set.

## PROOF (do this, don't just configure it)

Search the whole repo for any real secret value. Find none. Every secret is referenced by
name only, and the names match across Fly, GitHub, and the app code.

## Consequences for the Builder

Do this step before Step 11 (D-008's CI workflow) is wired up — the deploy job will fail
immediately and loudly if `FLY_API_TOKEN` is missing or misnamed, which is a fast, cheap
failure to catch versus a silent one.
