# D-007 — Testing Strategy

**Status:** Accepted
**Date:** 2026-07-25
**Decided by:** Planner, per KEEL Step 10 (self-contained tests, done early)

## Decision

- **Test runner:** Vitest
- **Test database:** a fresh SQLite file in the OS temp directory (or `file::memory:`),
  migrated from scratch at the start of the test run via Prisma. Never touches the real
  `/data/bct.db`. No network calls, no live Fly.io calls, no real `APP_PASSWORD`.
- **First test, before any real ones:** a trivial smoke test (`expect(1 + 1).toBe(2)`)
  whose only job is proving the harness runs. Must pass **with the internet turned off**
  before any other work continues — this is the KEEL Step 10 proof, not optional
  ceremony.
- **Required coverage for v1** (minimum; the Builder can add more):
  1. Attendance composite key rejects a duplicate (same member, same meeting) at the DB
     level.
  2. Each of the three dashboard queries from D-005 against a known fixture set, with the
     expected numbers asserted explicitly (this is the "artefact" for dashboard claims —
     see D-011).
  3. Auth middleware blocks an unauthenticated request to a protected route.
  4. A book with `status: PLANNED` or `READING` never appears in the "average rating"
     calculation even if a stray `rating` value exists on it.

## Why

Matches KEEL principle 5/10 directly: self-contained tests are what make the CI gate
(D-008) fast, free, and trustworthy. A test suite that needs the real database or real
Fly credentials would be slow, flaky, and impossible to run offline — exactly what KEEL
warns against.

## Consequences for the Builder

- `tests/` directory, one file per model/feature area.
- CI workflow (D-008) runs `npx vitest run` with no external service dependencies and no
  secrets required — if a test needs a secret to pass, that's a sign it's testing the
  wrong thing.
