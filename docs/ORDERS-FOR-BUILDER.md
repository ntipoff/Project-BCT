# Orders for the Builder (Claude Code) — Project-BCT

Read this top to bottom. Do it in order. Every step has a PROOF — don't move to the
next step until you've actually seen the proof, not just written the code you believe
produces it. Full reasoning for every decision referenced below lives in
`docs/decisions/D-0XX-*.md`.

**Sequencing note (per D-012):** this project builds and validates **locally first**.
Fly.io provisioning, the Dockerfile, `fly.toml`, and the CI `deploy` job come later, as
Phase 7, only when the owner explicitly says to move to deployment. Don't build ahead of
that — no speculative `Dockerfile`/`fly.toml`. Everything else — version control,
self-contained tests, decision docs, and a test-only CI gate — still happens early,
exactly as original KEEL ordering intends.

---

## Phase 0 — Confirm the foundation (KEEL Steps 1–6)

- [ ] Confirm you (Claude Code) are connected to the `Project-BCT` repo and can commit.
- [ ] Confirm `.gitignore` and `README.md` already exist — don't recreate them.

**PROOF:** you can list the repo contents and see the existing README.md and .gitignore.

## Phase 1 — Lay the Keel docs (KEEL Steps 7–9)

1. Create `docs/README.md` — copy verbatim from the planning handoff. Commit it.
2. Create `docs/decisions/` and commit all twelve `D-001` through `D-012` files verbatim
   as provided by the Planner. **These are decisions already made — do not re-derive or
   "improve" them silently.** If you think one is wrong, say so before building against
   it; don't quietly deviate.
3. Create `docs/ORDERS-FOR-BUILDER.md` (this file) and commit it.
4. Confirm `.gitignore` lists `.env`, `.env.local`, and `*.db` (local SQLite files
   shouldn't be committed either — per D-012, local dev DB is throwaway/regenerable via
   `prisma migrate dev`).

**PROOF:** `docs/` exists in the repo with the README, this orders file, and 12 numbered
decision docs, all committed.

## Phase 2 — Scaffold the app to run locally (per D-002, D-003, D-005, D-010, D-012)

1. `npx create-next-app@latest` with TypeScript, App Router, Tailwind — match D-002.
2. Set up Prisma: `npm install prisma @prisma/client`, `npx prisma init`.
3. Write `prisma/schema.prisma` exactly as specified in D-005. Point `DATABASE_URL` at a
   local file, e.g. `file:./dev.db`, via `.env.local` (per D-012 — not a Fly secret yet).
4. Run `npx prisma migrate dev --name init` to create the local DB and confirm the schema
   is valid.
5. Build the repo folder structure to match D-010.
6. Run `npm run dev` and confirm the default Next.js page loads at `http://localhost:3000`.

**PROOF:** `npx prisma migrate dev` succeeds; the app is reachable in a browser at
`localhost:3000`.

## Phase 3 — Self-contained tests, before real features (KEEL Step 10 / D-007)

*(Unchanged by D-012 — this still happens early and still runs fully offline.)*

1. Set up Vitest.
2. Write the smoke test first: `expect(1 + 1).toBe(2)`.
3. **Turn off your internet connection and run the smoke test. Confirm it passes.** This
   is the actual KEEL proof — not optional, not assumed.
4. Only after that, write the four required tests from D-007 (attendance uniqueness,
   dashboard query correctness, auth guard, rating-null handling) — fine if some fail
   until the corresponding feature exists yet.

**PROOF:** smoke test passes with network disabled.

## Phase 4 — Local secrets only (KEEL Step 9 / D-009 / D-012)

1. Create `.env.local` (gitignored) with throwaway local values for `APP_PASSWORD`,
   `SESSION_SECRET`, `DATABASE_URL`.
2. Create `.env.example` in the repo listing variable names only, no real values —
   include `FLY_API_TOKEN` in the example even though it isn't used yet, so the file
   stays accurate for Phase 7.

**PROOF:** grep the whole repo for anything that looks like a real secret. Find nothing.
`.env.local` itself does not appear in `git status` as trackable.

## Phase 5 — Test-only CI gate (KEEL Step 11, partial / D-008 / D-012)

Build **only** the `test` job from D-008 — no `deploy` job yet, no Fly.io account needed.

```yaml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx prisma generate
      - run: npx vitest run
```

Prove it the same way KEEL always requires proof: push a deliberately failing test on a
branch, open a PR, confirm the check goes red. Fix it, confirm it goes green.

**PROOF:** you've watched a failing test show as a failing check on a real PR, and
watched it pass after the fix. (Branch protection / "no bypass" and the `deploy` job are
Phase 7 — not required yet, since nothing deploys.)

## Phase 6 — Build the actual features, locally (per D-001, D-004, D-005)

Now the real work. Each feature: write the test, watch it fail, implement, watch it
pass, verify by hand at `localhost:3000`, commit via a PR (the test-only gate from Phase
5 applies to every change from here on).

1. Auth: shared password + member picker, per D-004, using `.env.local` values.
2. Books CRUD, per D-001/D-005.
3. Members CRUD, per D-001/D-005.
4. Meetings CRUD (date, book, host, notes), per D-001/D-005.
5. Attendance logging per meeting, per D-001/D-005.
6. Dashboard: books this year, average rating, most active members — backed by the tests
   from D-007 point 2, not eyeballed.

**PROOF:** every feature has a passing test *and* has been clicked through manually at
`localhost:3000` — the loop KEEL warns about ("a story about a safety net" vs. actually
seeing it work) applies to features too, not just the CI gate.

Stop here and confirm with the owner before starting Phase 7. Don't drift into Fly.io
work "since we're close" — that's the exact temptation D-012 is guarding against.

---

## Phase 7 — Move to deployment (KEEL Steps 11–14 fully / D-006 / D-008) — ONLY when the owner says go

1. Check Fly.io's *current* documentation before writing anything below — D-006/D-008
   flag this explicitly; don't assume the shapes in those docs are still current.
2. Write `Dockerfile` (multi-stage, Node 20) and `fly.toml` (volume at `/data`, release
   command `prisma migrate deploy`) per D-006.
3. Create the Fly app `project-bct` and its persistent volume.
4. Move real secrets out of `.env.local` into Fly.io secrets (`APP_PASSWORD`,
   `SESSION_SECRET`) — matching names exactly, per D-009.
5. Add the `deploy` job to `.github/workflows/ci.yml` per D-008, gated on `test` passing,
   only running on push to `main`. Create a deploy-scoped `FLY_API_TOKEN`, add as a
   GitHub Actions secret.
6. **Prove the full gate** (KEEL Step 12): failing test on a PR blocks deploy; passing
   merge to `main` produces a real, visible deploy on Fly.
7. **Make it binding** (KEEL Step 13): branch protection on `main` — require the PR,
   require the check, no bypass for anyone, including the owner. Try pushing straight to
   `main` and confirm it's refused.
8. **Kill manual deploys** (KEEL Step 14): merging is the only way anything reaches Fly.
9. Set up the scheduled SQLite backup job per D-006, and prove a downloaded backup file
   actually opens and has real data in it.

**PROOF (all witnessed, not assumed):** gate blocks bad, ships good; branch protection
refuses a direct push; a backup file has been downloaded and opened successfully.

---

## Daily rituals from here on (KEEL)

- End of every session: write a close-out (what got done, what's open, what's next,
  **with artefact links per D-011**) and commit it to `docs/`.
- Start of every session: fresh chat, snapshot the repo (`git archive`), hand it to the
  Planner with "read the latest close-out and the relevant D-0XX docs — where are we?"
