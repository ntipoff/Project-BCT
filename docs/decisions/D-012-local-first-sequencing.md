# D-012 — Local-First Development Sequencing (Deployment Deferred)

**Status:** Accepted
**Date:** 2026-07-25
**Decided by:** Project owner
**Supersedes (in part):** the *ordering* in D-006 and D-008 only — not their content. Fly.io
is still the eventual host (D-006) and the CI/CD shape in D-008 still stands. What changes
is *when* the deploy half of that gets built.

## Decision

Development proceeds **locally first**:

- The app runs via `npm run dev` on `localhost:3000`.
- The database is a local SQLite file (e.g. `prisma/dev.db`), not a Fly volume.
- Secrets for local dev live in `.env.local` (gitignored), not Fly.io secrets — see
  updated table below.
- Fly.io provisioning, the Dockerfile, `fly.toml`, and the `deploy` job in
  `.github/workflows/ci.yml` are **not built yet**. They get built when the owner says
  "let's deploy," not before.

**What does NOT get deferred** — these still happen early, per the original KEEL
ordering, because they're free, fast, and don't depend on Fly.io existing:

- Version control (every commit still goes through git/GitHub, from the first line of
  code).
- Self-contained local tests (D-007) — still written early, still run offline, still
  prove the harness works before real features are built. This has nothing to do with
  Fly.io.
- **A test-only CI job** — `.github/workflows/ci.yml` with just the `test` job from
  D-008 (checkout → install → `vitest run`), running on every PR. This costs nothing,
  needs no Fly.io account, and still gives the real KEEL benefit: a broken PR shows a
  red check before it merges. The `deploy` job is what's deferred, not the whole
  workflow.
- Decision docs (this whole `docs/decisions/` discipline) — unchanged.

## Why

The owner wants to validate the app itself — the data model, the CRUD flows, the
dashboard — before spending time on hosting/deploy plumbing. That's a reasonable
sequencing choice for a solo/early build: there's no production system yet, so there's
nothing for a missing deploy gate to put at risk. The KEEL principle "lay the keel before
you build" is about not skipping foundations *while pretending you have them* — it is
not violated by honestly deferring a piece that has no target to deploy to yet, as long
as that deferral is written down (this doc) rather than silently forgotten.

## Risk this decision accepts, and how it's bounded

KEEL's own scar log (principle 2/9) warns what happens when deploy has no gate: *"for
weeks, anything we pushed could reach production whether it worked or not."* That risk
specifically requires a production to push to. Bounded here by:

- No Fly.io app exists yet, so nothing can accidentally ship broken to real users.
- The test-only CI job (above) still catches broken code at the PR stage, locally
  meaningful even with no deploy target.
- **This deferral has an expiration condition, not an open-ended one:** before the app
  is opened to the rest of the book club (i.e., before it leaves "owner's laptop"), D-006
  and D-008's deploy half must be completed and *proven* exactly as originally
  specified — gate blocks a bad build, branch protection is binding, before real people's
  attendance data lives on it. Don't let "later" quietly become "never."

## Consequences for the Builder

- Follow the revised phase order in `docs/ORDERS-FOR-BUILDER.md` (updated alongside this
  doc): scaffold → local tests → test-only CI → build all features locally against
  `localhost` → *then* Fly.io provisioning, Dockerfile, deploy job, prove-the-gate, branch
  protection, backups — in that order, when the owner is ready.
- When implementing auth (D-004) and secrets (D-009) for local dev, use `.env.local`
  values for `APP_PASSWORD`/`SESSION_SECRET`/`DATABASE_URL`. These are throwaway local
  dev values, not real secrets — still never commit `.env.local` itself.
- Don't build `Dockerfile`/`fly.toml` speculatively "while we're in there." Wait for the
  explicit go-ahead — writing infra for a target you're not deploying to yet is exactly
  the kind of premature work KEEL warns against in the other direction.
