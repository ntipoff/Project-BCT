# D-010 — Repository Layout

**Status:** Accepted
**Date:** 2026-07-25
**Decided by:** Planner, derived from D-002 (Next.js App Router conventions)

## Decision

```
/
├── docs/
│   ├── README.md                      # KEEL rule file (Step 7 + provenance principle)
│   ├── ORDERS-FOR-BUILDER.md          # sequential execution runbook
│   └── decisions/
│       ├── D-001-project-scope.md
│       ├── D-002-tech-stack.md
│       ├── D-003-database-orm.md
│       ├── D-004-authentication.md
│       ├── D-005-data-model.md
│       ├── D-006-hosting-deployment.md
│       ├── D-007-testing-strategy.md
│       ├── D-008-cicd-pipeline.md
│       ├── D-009-secrets-management.md
│       ├── D-010-repo-layout.md
│       └── D-011-provenance-principle.md
├── prisma/
│   └── schema.prisma
├── app/                                # Next.js App Router
│   ├── login/
│   ├── books/
│   ├── members/
│   ├── meetings/
│   ├── dashboard/
│   ├── api/                            # route handlers if needed alongside server actions
│   └── layout.tsx
├── lib/                                # shared server logic (db client, session, queries)
├── tests/
│   ├── smoke.test.ts
│   ├── attendance.test.ts
│   ├── dashboard.test.ts
│   └── auth.test.ts
├── .github/
│   └── workflows/
│       └── ci.yml
├── Dockerfile
├── fly.toml
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Why

Standard Next.js App Router shape, with `docs/decisions/` as the durable, numbered
record KEEL requires (Steps 7–8) and `docs/ORDERS-FOR-BUILDER.md` as the single
sequential checklist the Builder executes against, so "what do I do next" always has one
answer.

## Rule going forward

Any new architectural decision — a new entity, a changed auth model, a new hosting
choice — gets a new `D-0XX` file in `docs/decisions/`, numbered sequentially, **before**
the Builder implements it. Retroactive documentation doesn't count; per D-011, a written
record only has value if it happened before or during the work, not after.
