# Prework — Next Session (KEEL Pre-Flight Ritual)

## 1. Start a brand-new chat with the Planner

Open a new one in the Project-BCT Project.

## 2. Snapshot and hand it to the Planner

```
git archive --format=tar.gz -o project-bct-$(date +%Y%m%d).tar.gz HEAD
```

Same as always. If you want commit history auditable too (the PR/CI links in the build
close-out haven't been independently checked yet), you can additionally provide:

```
git log --oneline -20
```

pasted directly, or a `git bundle` if you want the Planner to be able to inspect history
itself. Not required to proceed — just closes the one remaining verification gap.

## 3. Say this to the Planner

> Read `docs/close-outs/2026-08-01-verification-session-close-out.md` and
> `docs/decisions/` — where are we, and what's next?

## 4. The one open verification item

- [ ] If you want it: confirm the commit hashes / PR numbers / CI run links in
      `docs/close-outs/2026-08-01-close-out.md` actually resolve (e.g. open one PR link
      and check it matches). Not blocking — Phases 0–6 checked out solidly against the
      actual code this session either way.

## 5. Real decision point: Phase 7

Phases 0–6 are now verified against actual code, not just described. That makes this a
reasonable time to decide: move to Phase 7 (Fly.io provisioning under the friend's
account per D-013, Dockerfile, deploy job, branch protection, backups), or keep working
locally (more features, UI polish, etc.) first. Either is fine — just make the call
explicitly rather than drifting into one.

If it's Phase 7: re-read D-006 and D-013 together first, since D-013 changes *who*
provisions the Fly app (the friend, with you watching) even though the technical shape
is unchanged.

## 6. To view the app locally

From the repo root, on your machine (or via Claude Code):

```
npm install    # if dependencies changed since last run
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Then open `http://localhost:3000`. Expect: shared-password login → member picker →
dashboard. The Planner confirmed the code paths for this exist (`app/login`,
`app/members`, `app/books`, `app/meetings`, `app/dashboard` all present) but could not
run the dev server itself to confirm the actual rendered pages — that check still belongs
to you or Claude Code.
