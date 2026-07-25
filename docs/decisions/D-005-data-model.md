# D-005 — Data Model (Prisma Schema)

**Status:** Accepted
**Date:** 2026-07-25
**Decided by:** Planner, derived directly from D-001 scope

## Decision

This is the schema the Builder implements verbatim in `prisma/schema.prisma`
(adjust only syntax, not shape, without a new decision doc):

```prisma
model Book {
  id           String    @id @default(cuid())
  title        String
  author       String
  status       BookStatus @default(PLANNED)
  dateStarted  DateTime?
  dateFinished DateTime?
  rating       Int?       // 1-5. Nullable; only meaningful once status = FINISHED
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  meetings     Meeting[]
}

enum BookStatus {
  PLANNED
  READING
  FINISHED
}

model Member {
  id             String       @id @default(cuid())
  name           String
  contact        String?
  createdAt      DateTime     @default(now())
  meetingsHosted Meeting[]    @relation("HostedMeetings")
  attendance     Attendance[]
}

model Meeting {
  id         String       @id @default(cuid())
  date       DateTime
  bookId     String
  book       Book         @relation(fields: [bookId], references: [id])
  hostId     String
  host       Member       @relation("HostedMeetings", fields: [hostId], references: [id])
  notes      String?      // discussion points, free text
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
  attendance Attendance[]
}

model Attendance {
  meetingId String
  memberId  String
  meeting   Meeting @relation(fields: [meetingId], references: [id], onDelete: Cascade)
  member    Member  @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@id([meetingId, memberId])
}
```

## Notes on choices baked into this schema

- `rating` is nullable at the DB level on purpose — a book that's `PLANNED` or `READING`
  has no rating yet. Don't default it to 0; that would corrupt the average-rating
  dashboard stat (see D-001 feature 4).
- `Attendance` has a composite primary key `(meetingId, memberId)` — this is what
  guarantees "one attendance row per member per meeting" at the database level, not just
  in application code.
- `onDelete: Cascade` on Attendance — deleting a Meeting or a Member cleans up attendance
  rows automatically rather than leaving orphans.
- No `deletedAt`/soft-delete for v1. Deletions are real deletions. Revisit only if the
  club actually asks for an undo feature.

## Dashboard queries this schema must support without new tables

- Books read this year: `Book.findMany({ where: { status: 'FINISHED', dateFinished: { gte: startOfYear } } })`
- Average rating: `Book.aggregate({ _avg: { rating: true }, where: { rating: { not: null } } })`
- Most active members: `Attendance.groupBy({ by: ['memberId'], _count: true, orderBy: ... })`

## Consequences for the Builder

Write a test (per D-007) that asserts each of the three dashboard queries above returns
correct numbers against a small known fixture set — this is the "name the artefact"
discipline from D-011: the dashboard's claimed numbers must be traceable to a specific
query, not eyeballed.
