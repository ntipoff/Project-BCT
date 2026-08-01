# Prework — Next Session (KEEL Pre-Flight Ritual)

Do these in order at the start of tomorrow's session. Don't reopen today's chat — start
fresh, per KEEL's own daily-ritual reasoning: continuity lives in the repo, not the chat.

## 1. Start a brand-new chat with the Planner

Do not resume this conversation. Open a new one in the Project-BCT Project.

## 2. Snapshot the repo and hand it to the Planner

From your local clone:

```
git archive --format=tar.gz -o project-bct-$(date +%Y%m%d).tar.gz HEAD
```

Upload that archive to the new chat.

## 3. Say this to the Planner (verbatim is fine)

> Read `docs/close-outs/2026-07-25-close-out.md` and `docs/decisions/` — where are we,
> and what's next?

That close-out names every open item and the exact next steps. The Planner should be
grounded in under a minute without you re-explaining anything, per KEEL's own proof
for this step.

## 4. First real decision to make tomorrow

**D-013 — hosting.** Pick one, then ask the Planner to write it up as `docs/decisions/D-013-hosting-alternative.md`
and update the index table in `ARCHITECTURE.md`:

- Fly.io pay-as-you-go (~$3-8/mo for this app's actual size — not the $40/mo figure that
  prompted this reconsideration)
- Laptop + Cloudflare Tunnel / Tailscale Funnel (free, laptop must be on)
- Oracle Cloud Always Free VM (free, always-on, some setup friction)

This decision does **not** block anything else — Phase 2 (local scaffolding) can start
in parallel or even before it's made, per D-012.

## 5. Then hand Claude Code (the Builder) this

> Start Phase 2 of `docs/ORDERS-FOR-BUILDER.md` — scaffold the Next.js/Prisma/SQLite app
> locally. This doesn't require the D-013 hosting decision to be finalized first.

Watch for the Phase 2 PROOF: `npx prisma migrate dev` succeeds, and the app loads at
`localhost:3000`.

## Verification housekeeping (do this before anything else, takes 30 seconds)

The close-out flags two claims from today that were never independently checked —
confirm them first, per D-011 (a claim without a checked artefact is a guess):

- [ ] `git log -1 794bcf5` actually shows the expected `docs/` files
- [ ] `git log -- ARCHITECTURE.md` confirms it's committed (it may have been created
      after `794bcf5` and not actually pushed yet)
