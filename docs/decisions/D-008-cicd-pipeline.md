# D-008 — CI/CD Pipeline & Deployment Gate

**Status:** Accepted — the `test` job is built now; **the `deploy` job is deferred, see
D-012** (Fly.io deploy happens when the owner says go; the test-only gate does not wait)
**Date:** 2026-07-25
**Decided by:** Planner, per KEEL Steps 11–14 (the gate must exist, must be proven, must
be binding)

## Decision

**Workflow file:** `.github/workflows/ci.yml`, two jobs:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx prisma generate
      - run: npx vitest run

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

(Builder: verify the current recommended Fly GitHub Action against Fly's live docs before
committing this — see the note in D-006. Treat the YAML above as the intended shape, not
a guaranteed-current API.)

- **`test` job** runs on every PR and every push to `main`.
- **`deploy` job** only runs on a direct push event to `main` (i.e., after a PR merges),
  and only if `test` succeeded (`needs: test`).
- **Branch protection on `main`** (set in GitHub repo settings, not in this YAML):
  require a pull request before merging, require the `test` status check to pass, and
  **do not allow bypass, including for the repo owner/admin.**

## The two proofs the Builder must actually perform (KEEL Step 12 & 13) — not skip

1. **Prove the gate blocks:** on a branch, write a test that deliberately fails, push it,
   open a PR, and confirm the `test` check fails and the `deploy` job does not run. Then
   fix it, watch it go green, merge, and confirm a real deploy happens.
2. **Prove branch protection is binding:** attempt to `git push` directly to `main`
   (bypassing a PR) and confirm GitHub refuses it. Look at a PR with a failing check and
   confirm it reads **BLOCKED**, not just a red X next to an otherwise-mergeable button.

Do not consider CI/CD "done" until both of these have actually been witnessed, not just
configured. This is the exact failure KEEL principle 9 is about: a check nobody is forced
to obey is decoration.

## Why

Direct implementation of KEEL Steps 11–14: tests gate deploys, deploys happen only by
merging, and the gate is made binding by branch protection with no bypass for anyone.

## Consequences for the Builder

- `FLY_API_TOKEN` must be a **deploy-scoped** token (not a full-access token), stored as
  a GitHub Actions repository secret — see D-009.
- No step in this pipeline should ever require a real `APP_PASSWORD` or the production
  database — per D-007, tests are self-contained.
