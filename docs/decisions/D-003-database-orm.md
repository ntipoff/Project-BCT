# D-003 — Database & ORM

**Status:** Accepted
**Date:** 2026-07-25
**Decided by:** Planner, on owner's behalf (owner deferred stack details to "Not sure" bucket implicitly by picking the Next.js option, which pairs commonly with this DB choice)

## Decision

- **Database:** SQLite
- **ORM:** Prisma
- **File location in production:** `/data/bct.db`, on a persistent Fly.io volume (see D-006)
- **Migrations:** Prisma Migrate. `npx prisma migrate deploy` runs as part of the release
  process (Fly release_command), never by hand against production.

## Why

A book club is single-digit-to-low-double-digit members, a handful of meetings a month.
Write volume and concurrency needs are trivial. SQLite removes an entire piece of
infrastructure (a managed Postgres instance) for no real cost at this scale. Prisma gives
a typed schema and safe migrations, which matters more than the database engine here.

## Alternatives considered (rejected)

- **Postgres** — appropriate if this grows into a multi-club SaaS product; overkill for
  one club's internal tool. Revisit if that scope ever changes (would need a new decision
  doc — this is a real migration, not a config flag).

## Risk this decision accepts

SQLite on a single Fly volume is not horizontally scalable and has one write-lock at a
time. Fine for this app's actual usage pattern. If Fly.io ever loses the volume without a
backup, data is gone — see D-006 for the backup requirement this implies.

## Consequences for the Builder

- `prisma/schema.prisma` is the source of truth for the data model — see D-005.
- Tests must run against a throwaway SQLite file/`:memory:` per D-007, never against the
  production file.
