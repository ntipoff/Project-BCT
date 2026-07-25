# Book Club Tracker — Architecture & Build Plan (v1)

**Author:** Planner (Claude, browser chat)
**For:** Builder (Claude Code)
**Status:** Decision record — written before work begins, per KEEL Step 7.
**Project name:** Project-BCT (do not deviate from this name anywhere — repo, deploy app name, etc.)

---

## 1. What we're building

A small multi-user web app for a book club to track:

- **Book** — title, author, date started, date finished, rating, status (planned / reading / finished)
- **Member** — name, contact
- **Meeting** — date, book discussed, host, notes/discussion points
- **Attendance** — which members were at which meeting

Plus a dashboard: books read this year, average rating, most active members.

## 2. Decisions (with reasoning — so the "why" survives, per KEEL Step 8)

| Decision | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | One language front-to-back; user preference; good Fly.io support |
| Database | **SQLite via Prisma ORM** | Small trusted-group app, low write volume — no need for Postgres yet. Prisma keeps the schema in code, not memory. |
| Auth | **Single shared app password** (one secret, stored in Fly.io secrets, checked via a lightweight session cookie), then a **member picker** (no per-member passwords) to attribute actions/attendance to a person | User said "simple shared login" for a small trusted club. Per-member accounts add real complexity (password resets, invites) for a group that already knows each other. **Flagging this as an assumption — say the word if you actually want individual member logins instead, and we'll revise this doc before the Builder touches auth.** |
| Hosting/Deploy | **Fly.io** | User's choice. Fly supports Dockerized Next.js + a persistent volume for the SQLite file. |
| Testing | **Vitest** for unit/integration tests against an in-memory/temp SQLite DB (no network, no live services — KEEL Step 10) | Keeps tests fast and honest |
| CI/CD | **GitHub Actions**: run tests on every PR → block merge on failure → deploy to Fly.io only on merge to `main` | Matches KEEL Steps 11–14 exactly |

## 3. Data model (Prisma schema, conceptual)

```
Book
  id            String @id @default(cuid())
  title         String
  author        String
  status        Enum(PLANNED, READING, FINISHED)
  dateStarted   DateTime?
  dateFinished  DateTime?
  rating        Int?        // 1-5, nullable until finished
  meetings      Meeting[]

Member
  id            String @id @default(cuid())
  name          String
  contact       String?
  meetingsHosted Meeting[]  @relation("hostedBy")
  attendance    Attendance[]

Meeting
  id            String @id @default(cuid())
  date          DateTime
  bookId        String
  book          Book @relation(fields: [bookId], references: [id])
  hostId        String
  host          Member @relation("hostedBy", fields: [hostId], references: [id])
  notes         String?        // discussion points, free text
  attendance    Attendance[]

Attendance
  meetingId     String
  memberId      String
  meeting       Meeting @relation(fields: [meetingId], references: [id])
  member        Member  @relation(fields: [memberId], references: [id])
  @@id([meetingId, memberId])   // composite key, one row per member per meeting
```

Dashboard queries (all derivable from the above, no extra tables needed):
- Books read this year → `Book.where(status=FINISHED, dateFinished in currentYear)`
- Average rating → `avg(Book.rating where rating != null)`
- Most active members → `count(Attendance) group by memberId`, sorted desc

## 4. Repo layout the Builder should create

```
/
├── docs/
│   ├── README.md              (KEEL Step 7 — decisions rule)
│   └── architecture-plan-v1.md (this file, committed here)
├── prisma/
│   └── schema.prisma
├── app/                        (Next.js App Router)
│   ├── books/
│   ├── members/
│   ├── meetings/
│   └── dashboard/
├── tests/
├── .github/workflows/ci.yml
├── Dockerfile
├── fly.toml
├── .env.example                (documents required env vars, no real values)
└── .gitignore                  (already present — confirm .env is listed)
```

## 5. KEEL Day-One Checklist — status and next actions

Already in place (per project files provided):
- ✅ Step 1 — Project named "Project-BCT"
- ✅ Step 2/3 — repo + README.md + .gitignore exist

**Builder, do these next, in order, and don't skip a PROOF:**

1. **Step 4** — confirm Claude Code is connected to the Project-BCT repo.
2. **Step 7** — create `docs/README.md` with the two rules: (a) decisions get written down before work is done, (b) every claim names its source artefact (log line, query, run link) — per the provenance principle draft in this project's files. Commit `architecture-plan-v1.md` (this file) into `docs/` as the first decision record.
3. **Step 9** — create/confirm `.gitignore` lists `.env`; put the shared app password and Fly deploy token in Fly.io secrets, never in a file.
4. **Step 10** — set up Vitest so tests run fully offline (SQLite in a temp file or `:memory:`, no real Fly/network calls). Write one trivial test first (e.g. `1+1===2`) just to prove the harness runs. **Prove it passes with internet off before writing real tests.**
5. **Step 11** — GitHub Actions workflow: run `vitest run` on every PR; a Fly.io deploy step that only runs on push to `main`, gated on tests passing. Deploy token scoped to deploy-only, saved in GitHub Secrets under the exact name the workflow expects.
6. **Step 12** — prove the gate: push a deliberately failing test on a branch, watch CI block it, fix it, watch it deploy. Don't move on until you've *seen* both halves.
7. **Step 13** — turn on branch protection on `main`: require the PR, require the check, no bypass for anyone. Try pushing straight to `main` and confirm it's refused.
8. **Step 14** — confirm the only way anything reaches Fly.io is via a merged PR. No manual `fly deploy` as a habit.

Only after all of the above are proven does real feature-building (the book/member/meeting/attendance CRUD and dashboard) start.

## 6. Open question worth a second look

The shared-login-with-member-picker approach (Section 2) trades real auth for simplicity. It's fine for a small trusted group, but it means anyone with the app password can log attendance as anyone else. If that's a problem in practice, the fix later is per-member magic-link email login via NextAuth — a moderate, not huge, change. Flagging it now so it's a known tradeoff, not a surprise.
