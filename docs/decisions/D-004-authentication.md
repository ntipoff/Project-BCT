# D-004 — Authentication

**Status:** Accepted
**Date:** 2026-07-25
**Decided by:** Planner (interpreting owner's "simple shared login" answer) — **owner
should re-read this one and object if the interpretation is wrong, since it's the
biggest assumption in this plan.**

## Decision

- **One shared app password**, not per-member accounts.
- Password lives in a Fly.io secret (`APP_PASSWORD`) — never in code, never in the repo.
- On login, the password is checked server-side; on success, a signed, httpOnly session
  cookie is set (using `iron-session` or equivalent — no third-party auth service needed
  for one shared credential).
- After login, the user picks **which Member they are** from a dropdown of existing
  Members. That choice is stored in the session (`memberId`) and is what attributes
  attendance records and "hosted by" fields to a real person.
- No per-member passwords, no email verification, no password reset flow.

## Why

Owner's stated requirement: "My whole book club — multiple people, simple shared login."
A small trusted group doesn't need individual account management; it needs the app to
know *who's currently using it* well enough to log attendance correctly. A shared
password gets everyone in; the member picker gets attribution right, without building an
accounts system.

## Alternatives considered

- **Per-member email/password or magic-link accounts** — real auth, but adds signup,
  password reset, email delivery (a whole subsystem) for a group that already knows each
  other. Rejected for v1 as disproportionate.
- **No auth at all** — rejected; app would be open to the internet with everyone's
  personal contact info in it once deployed.

## Risk this decision accepts

Anyone with the shared password can select any Member and log attendance/notes as them.
Acceptable for a trusted small group; not acceptable if the club ever wants
per-person accountability enforced. If that's ever needed, this doc gets superseded by
a new one — don't quietly bolt on per-member passwords without writing that decision
down first.

## Consequences for the Builder

- Middleware guards every route except `/login`.
- `SESSION_SECRET` and `APP_PASSWORD` are both Fly secrets — see D-009.
- The member picker UI needs a `Member` list to exist before login is usable end-to-end —
  seed at least one Member in dev/test fixtures.
