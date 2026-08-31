# 2. Staging, and the content deltas

Medium effort, **reduces** code. Not started.

## The idea

Several activities in the registry are the same mechanic at a different number
range. They were written as separate activities, which duplicates a shell for no
benefit. The spec folds them into one activity with stages, reached by
`?stage=N` — matching IM's Centers pattern, where one game spans several grades.

## The three deltas

From `../SPEC.md` section 0, which was written against the registry as it stands:

| Change | Now | Becomes | Why |
| --- | --- | --- | --- |
| **Remove** `which-is-more` (K game) | standalone single-digit comparison | stages 1–2 of `decade-duel`, plus an untimed compare chapter in the `counting-crew` book | One mechanic staged K→5. A K child arrives via `?stage=1`; the book gives the untimed introduction. |
| **Remove** `hundred-line-hop` (G2 game) | separate 0–100 estimation game | stages 3–4 of `number-line-hop` | Identical shell, identical scoring. Two activities were one activity with a different upper bound. |
| **Add** `close-to-hundred` (G2 game) | — | target-number digit-card game, 7 stages spanning grades 1–5 | The catalogue has **no target-number game** — the format both the evidence and the classroom tradition single out, and the cheapest demonstration of the paper-and-screen pairing. |

Net: 31 activities → 30. Games 13 → 12. **A clean 3 books + 2 games per grade,
every grade**, and no loss of ROAM coverage.

## Before doing this, check

`scripts/check.mjs` asserts that all 15 ROAM task/subscale pairs are covered by
at least one activity. Folding two activities away must not drop coverage —
the checker will tell you immediately if it does. Currently:

- `which-is-more` carries `roamMagpi:symbolic` (also carried by `decade-duel`
  and `place-value-palace`, so it is safe to remove)
- `hundred-line-hop` carries `roamMagpi:numberline` block `0_100` (the only
  activity on that block — **`number-line-hop` must inherit it** when it gains
  stages 3–4, or coverage of the 0–100 block is lost)

## `close-to-hundred` — the specification

A target-number game. Two dice or digit cards; build an array or a number as
close to a target as possible without exceeding it. The youcubed "How Close to
100?" task is already cited in `content/references.js` as
`youcubed-close-to-100` and currently backs `array-architect` — it applies
directly here.

Seven stages spanning grades 1–5 (see `../SPEC.md` section 2 for the full stage
table). The print twin is genuinely trivial: a blank 10×10 grid and a recording
column, which is how the task is played on paper anyway. **That makes it the best
available demonstration that the printable is the original rather than an
export.**

## How staging should work

- `?stage=N` in the URL, alongside `?seed=`. Stage belongs in the URL for the
  same reason the seed does — it is shareable and needs no account.
- The activity declares its stages as data: number range, item types, and which
  ROAM block each stage maps to.
- A grade page links to the stage appropriate for that grade, so a family never
  has to think about stages at all.
- Default stage derives from the activity's own grade, so an unparameterised URL
  still works.

## Acceptance

- 30 activities, 3 books and 2 games per grade
- All 15 ROAM subscale pairs still covered — the checker enforces this
- `?stage=` and `?seed=` compose, and both survive a reload
- Every stage has a print twin
- `npm run verify` passes
