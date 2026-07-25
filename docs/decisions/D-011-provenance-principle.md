# D-011 — Provenance Principle (Adopted for Project-BCT)

**Status:** Accepted
**Date:** 2026-07-25
**Decided by:** Planner, adopting the KEEL provenance-principle draft wholesale for this
project

## Decision

This project adopts KEEL's proposed 8th principle in full: **every claim carries how you
know it, and a summary is not knowing.**

Concretely, for Project-BCT:

- When the Builder reports "tests pass," "the deploy worked," or "the dashboard shows
  correct numbers," it should be able to point at the actual artefact — the test output,
  the deploy log, the query result — not just assert it.
- Dashboard numbers (books this year, average rating, most active members) are backed by
  the specific tests in D-007 point 2. If those tests aren't passing, the dashboard's
  numbers are unverified, not just "probably right."
- Infrastructure claims (Fly.io behavior, GitHub Actions syntax) are verified against
  current documentation, not recalled from training data — see the note in D-006.
- Prefer the disqualifying question: not "is the volume attached" but "does the volume
  actually contain last week's data" — not "did the migration run" but "does the schema
  in production match `schema.prisma` right now."

## Why

Directly imported from `KEEL-provenance-principle-draft.md` in this project's source
documents. The draft's own case studies (a GPU claim that was true and missing the
overflow, a hardware-error count that was true and missing the severity, an "isn't
enabled" claim that was true and missing "isn't installed") are exactly the shape of bug
this project should avoid: a status that's technically accurate and operationally
misleading.

## Consequences for the Builder

When closing out a work session (KEEL daily ritual), the close-out note should name
artefacts, not just conclusions: "tests pass — see CI run #N" not "tests pass." "Deployed
successfully — see Fly deploy log at [time]" not "deployed successfully."
