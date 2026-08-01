# Project-BCT — Architecture Overview

**Last updated:** 2026-08-01
**Status:** Living summary — kept in sync with `docs/decisions/`, not a replacement for it.

> This file is a quick-reference dashboard. It **is not itself an authoritative
> decision record** — per D-011 (provenance principle), every claim below should be
> traceable to the numbered decision that backs it. If this file and a `D-0XX` doc ever
> disagree, the `D-0XX` doc wins; fix this file to match, not the other way around. Any
> new architectural decision gets its own new `D-0XX` file first (see `docs/decisions/`),
> then a one-line update here — never the reverse.

---

## What this is

Project-BCT is a small multi-user web app for a book club: tracking books, members,
meetings, and attendance, plus a simple dashboard. Full scope: **D-001**.

## Tech stack

| Layer | Choice | Decision |
|---|---|---|
| Framework | Next.js (App Router), TypeScript strict | D-002 |
| Runtime | Node.js 20 LTS | D-002 |
| Styling | Tailwind CSS | D-002 |
| Database | SQLite | D-003 |
| ORM | Prisma | D-003 |
| Auth | Shared app password + member picker (no per-member accounts) | D-004 |
| Hosting (eventual) | Fly.io, under a friend's account/org | D-006, D-013 |
| Tests | Vitest, fully offline/self-contained | D-007 |
| CI | GitHub Actions | D-008 |

## Current status: Phases 0-6 complete, LOCAL ONLY

Per **D-012**, this project was built and validated locally first. As of this update,
Phases 0-6 of `docs/ORDERS-FOR-BUILDER.md` are done and merged to `main` — see
`docs/close-outs/2026-08-01-close-out.md` for the PR/CI artefact links behind that claim
(per D-011, not just asserted here):

- Auth (D-004), Books/Members/Meetings CRUD, attendance logging, and the dashboard are
  all implemented and verified end-to-end against a running `next dev` server.
- Runs via `npm run dev` at `localhost:3000`.
- Database is a local file (`prisma/dev.db`), not a Fly volume.
- Secrets live in `.env.local` (gitignored), not Fly.io secrets.
- A test-only CI job (`test`, no `deploy`) gates every PR to `main` — 23 tests passing as
  of the last run.
- **No Fly.io app, Dockerfile, `fly.toml`, or CI `deploy` job exist yet.** Fly.io
  provisioning happens only when the owner explicitly says go — see Phase 7 of
  `docs/ORDERS-FOR-BUILDER.md`. Until then, D-006/D-008's deploy content is
  accepted-but-unbuilt, not rejected. D-013 changes *who owns* that eventual Fly
  account, not this sequencing.

## Data model

Four entities — **Book**, **Member**, **Meeting**, **Attendance** (join table with a
composite `meetingId + memberId` key). Full Prisma schema and dashboard query shapes:
**D-005**.

```
Book ──< Meeting >── Member
           │             │
           └──< Attendance >──┘
```

- A Meeting has one Book and one hosting Member.
- Attendance links Meetings to Members, many-to-many, one row per member per meeting.

## Auth model

One shared app password (Fly/`.env.local` secret) gets anyone in; a post-login member
picker attributes actions (attendance, hosting) to a specific person. No per-member
passwords, no reset flow. Accepted risk: anyone can log attendance as anyone. Full
reasoning: **D-004**.

## Testing strategy

Vitest, run against a throwaway/in-memory SQLite DB — no network, no real secrets. Smoke
test proves the harness runs with the internet off before any real test is trusted.
Required coverage: attendance uniqueness, the three dashboard queries, auth guard on
protected routes, rating-null handling. Full spec: **D-007**.

## CI/CD

- **Now:** GitHub Actions `test` job only — runs `vitest run` on every PR and push to
  `main`. No deploy step, no Fly.io dependency. Per D-012.
- **Later (Phase 7, on explicit go-ahead):** `deploy` job added, gated on `test` passing,
  triggered only by a push to `main` (i.e. a merged PR). Branch protection makes the
  check binding — no bypass, including for the owner. Full spec: **D-008**.

## Repo layout

Actual structure (see **D-010** for the authoritative version):

```
/
├── ARCHITECTURE.md        ← you are here
├── docs/
│   ├── README.md
│   ├── ORDERS-FOR-BUILDER.md
│   └── decisions/D-001 … D-013
├── prisma/schema.prisma
├── app/                   (Next.js App Router: login, books, members, meetings, dashboard)
├── lib/
├── tests/
├── .github/workflows/ci.yml
├── .env.example
└── .gitignore
```

## Decision record index

| Doc | Title | Status |
|---|---|---|
| D-001 | Project scope & core entities | Accepted |
| D-002 | Tech stack | Accepted |
| D-003 | Database & ORM | Accepted |
| D-004 | Authentication | Accepted |
| D-005 | Data model (Prisma schema) | Accepted |
| D-006 | Hosting & deployment | Accepted — execution deferred, see D-012 |
| D-007 | Testing strategy | Accepted |
| D-008 | CI/CD pipeline & deployment gate | Accepted — `deploy` job deferred, see D-012 |
| D-009 | Secrets management | Accepted |
| D-010 | Repository layout | Accepted |
| D-011 | Provenance principle | Accepted |
| D-012 | Local-first development sequencing | Accepted |
| D-013 | Hosting alternative: friend-provided Fly.io app | Accepted — supersedes D-006 account ownership only |

Full text of every decision, including rejected alternatives and accepted risks, lives in
`docs/decisions/`. This overview intentionally omits that detail — read the source doc
before building against a claim made here, per D-011.
