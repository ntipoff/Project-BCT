# docs/ — Decision Record Rules (KEEL Steps 7 & 8)

1. **Every design decision gets written down here before the work it describes is
   finished.** Decisions live in `docs/decisions/`, one file per decision, numbered
   sequentially: `D-001-short-name.md`, `D-002-...`, and so on. Never reuse or renumber —
   if a decision is superseded, write a new numbered doc that says so and links back.

2. **Every claim records the artefact it came from** — the log line, the test output, the
   query, the run/deploy link. A conclusion without a named source is a guess, not a
   finding. See `D-011-provenance-principle.md` for the full reasoning.

3. Prefer the question that could disqualify you. Ask what's *available*, not just what's
   *on*. Ask for the *breakdown*, not the total.

**Proof this is working:** pick any claim in this project's docs or close-out notes at
random. You should be able to reach the raw evidence behind it in under a minute. If you
can't, it was never a finding — fix that before building on top of it.

See `docs/ORDERS-FOR-BUILDER.md` for the sequential execution plan, and
`docs/decisions/` for the full numbered decision record.
