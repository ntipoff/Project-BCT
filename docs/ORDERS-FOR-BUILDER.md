# Orders for the Builder (Claude Code) — Project-BCT

Read this top to bottom. Do it in order. Every step has a PROOF — don't move to the
next step until you've actually seen the proof, not just written the code you believe
produces it. Full reasoning for every decision referenced below lives in
`docs/decisions/D-0XX-*.md` — read the relevant one before implementing that piece if
anything here is ambiguous.

---

## Phase 0 — Confirm the foundation (KEEL Steps 1–6)

- [ ] Confirm you (Claude Code) are connected to the `Project-BCT` repo and can commit.
- [ ] Confirm `.gitignore` and `README.md` already exist (they do, per project setup) —
      don't recreate them, extend `.gitignore` only if D-009 requires an addition.

**PROOF:** you can list the repo contents and see the existing README.md and .gitignore.

## Phase 1 — Lay the Keel (KEEL Steps 7–9)

1. Create `docs/README.md` — content is already written; copy it from this planning
   handoff verbatim (see the Planner's output). Commit it.
2. Create `docs/decisions/` and commit all eleven `D-001` through `D-011` files verbatim
   as provided by the Planner. **These are decisions already made — do not
   re-derive or "improve" them silently.** If you think one is wrong, say so before
   building against it; don't quietly deviate.
3. Create `docs/ORDERS-FOR-BUILDER.md` (this file) and commit it.
4. Confirm `.gitignore` lists `.env` and `.env.local` (per D-009).

**PROOF:** `docs/` exists in the repo with the README, this orders file, and 11 numbered
decision docs, all committed.

## Phase 2 — Scaffold the app (per D-002, D-003, D-005, D-010)

1. `npx create-next-app@latest` with TypeScript, App Router, Tailwind — match D-002.
2. Set up Prisma: `npm install prisma @prisma/client`, `npx prisma init`.
3. Write `prisma/schema.prisma` exactly as specified in D-005.
4. Run `npx prisma migrate dev --name init` locally to confirm the schema is valid and
   generates a working migration.
5. Build the repo folder structure to match D-010.

**PROOF:** `npx prisma migrate dev` succeeds with no errors; `app/`, `lib/`, `tests/`
exist per D-010.

## Phase 3 — Self-contained tests, before real features (KEEL Step 10 / D-007)

1. Set up Vitest.
2. Write the smoke test first: `expect(1 + 1).toBe(2)`.
3. **Turn off your internet connection (or block outbound network in the test
   environment) and run the smoke test. Confirm it passes.** This is the actual KEEL
   proof — not optional, not assumed.
4. Only after that, write the four required tests from D-007 (attendance uniqueness,
   dashboard query correctness, auth guard, rating-null handling) — they'll fail until
   the corresponding features exist, which is expected and fine at this point (or write
   them alongside the features in Phase 4/5, whichever is more natural — just don't skip
   any of the four).

**PROOF:** smoke test passes with network disabled. This proof must be witnessed before
continuing, not inferred.

## Phase 4 — Secrets (KEEL Step 9 / D-009)

1. Create `.env.example` listing variable names only: `APP_PASSWORD`, `SESSION_SECRET`,
   `DATABASE_URL`, `FLY_API_TOKEN` (this last one is a GitHub secret, not app-level, but
   list it for documentation).
2. Do not put real values anywhere in the repo.

**PROOF:** grep the whole repo for anything that looks like a real secret. Find nothing.

## Phase 5 — Build the gate before building features (KEEL Steps 11–13 / D-008)

Yes, before the actual book/member/meeting features. The gate needs to exist and be
proven before there's real work for it to guard.

1. Write `.github/workflows/ci.yml` per D-008. **Before finalizing the Fly deploy step,
   check Fly.io's current documentation for the recommended GitHub Action / CLI
   invocation — do not assume the YAML in D-008 is current, it's a shape, not a
   guarantee.**
2. Create the Fly app (`project-bct`) and the persistent volume per D-006 — check Fly's
   current docs for exact commands.
3. Create a deploy-scoped `FLY_API_TOKEN`, add it as a GitHub Actions secret.
4. Push this workflow on a branch, open a PR **with the trivial smoke test still the only
   test** — confirm the `test` job runs and passes, and that `deploy` does NOT run (PR,
   not a push to main).
5. Deliberately break the smoke test, push, confirm the PR shows the check failing.
6. Fix it, merge to `main`, confirm the `deploy` job runs and actually reaches Fly.io.

**PROOF (both required, witnessed, not assumed):**
- A failing test on a PR blocked deploy and showed a clear failure.
- A passing merge to `main` produced a real deploy you can see in Fly's dashboard/logs.

## Phase 6 — Make the gate binding (KEEL Step 13)

1. In GitHub repo settings, turn on branch protection for `main`: require a pull request,
   require the `test` status check, **do not allow bypass for administrators.**
2. Attempt `git push origin main` directly (no PR). Confirm GitHub refuses it.
3. Open a PR with a deliberately failing test and confirm it reads **BLOCKED** in the
   GitHub UI, not just a red X next to an otherwise-clickable merge button.

**PROOF:** both 2 and 3, witnessed directly.

## Phase 7 — Kill manual deploys (KEEL Step 14)

Confirm there is no `fly deploy` habit — deployment only happens via a merged PR through
CI. Note this explicitly in the next session close-out.

## Phase 8 — Now build the actual features (per D-001, D-004, D-005)

Only now:

1. Auth: shared password + member picker, per D-004.
2. Books CRUD, per D-001/D-005.
3. Members CRUD, per D-001/D-005.
4. Meetings CRUD (date, book, host, notes), per D-001/D-005.
5. Attendance logging per meeting, per D-001/D-005.
6. Dashboard: books this year, average rating, most active members — backed by the tests
   from D-007 point 2, not eyeballed.

For each feature: write the test, watch it fail, implement, watch it pass, commit via a
PR (the gate applies to every change from here on, no exceptions).

## Phase 9 — Backups (per D-006)

Set up the scheduled SQLite backup job. Confirm it actually produces a restorable backup
file once, by hand, before trusting the schedule.

**PROOF:** you have downloaded a backup artifact and confirmed it's a valid, openable
SQLite file with real data in it.

## Daily rituals from here on (KEEL)

- End of every session: write a close-out (what got done, what's open, what's next,
  **with artefact links per D-011** — CI run numbers, deploy log timestamps) and commit it
  to `docs/`.
- Start of every session: fresh chat, snapshot the repo (`git archive`), hand it to the
  Planner with "read the latest close-out and the relevant D-0XX docs — where are we?"
