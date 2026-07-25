# D-001 — Project Scope & Core Entities

**Status:** Accepted
**Date:** 2026-07-25
**Decided by:** Planner (Claude, chat) + project owner

## Decision

Build a small multi-user web app, **Project-BCT**, for a book club to track books,
members, meetings, and attendance, with a summary dashboard.

**Core entities:**

- **Book** — title, author, date started, date finished, rating, status
- **Member** — name, contact
- **Meeting** — date, book discussed, host, notes/discussion points
- **Attendance** — which members attended which meeting

**Core features (v1 scope — nothing beyond this list without a new decision doc):**

1. Add/edit books the club has read or plans to read
2. Track meeting history — who hosted, what was discussed
3. Log attendance per meeting; see who's been showing up
4. Dashboard: books read this year, average rating, most active members

## Explicitly out of scope for v1

- Public/anonymous access
- Book recommendations, external API lookups (e.g. Goodreads/ISBN autofill)
- Notifications/reminders
- Mobile app (web app must be usable on mobile browsers, but no native app)

Anything in this "out of scope" list that becomes wanted later gets its own decision
doc before the Builder touches it — do not silently expand scope mid-build.

## Source

User's original feature description, this conversation, 2026-07-25.
