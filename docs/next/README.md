# Picking this back up

Notes for resuming work on Izzi Math. Written at the end of the v1 session so the
next person (or the next session) does not have to reconstruct the reasoning.

**Live:** https://yeatmanlab.github.io/izzimath/
**Repo:** https://github.com/yeatmanlab/izzimath

---

## Where v1 got to

| | |
| --- | --- |
| Activities | 41 — 27 books, 14 games, across K–5 |
| Strands | 30 of 30 covered (five per grade) |
| Pages | 99, statically generated |
| Problem types | 9, shared by every activity |
| Characters | 4, each with 3 expressions |
| References | 36 citations, linked both ways to activities |
| IM units mapped | 50, deep-linked and verified to resolve |
| Dependencies | none |

Everything works end to end: each activity has an interactive page, a full-page
printable and an answer key; printables toggle between a plain and a designed
style, and between grouped practice and interleaved review; character theming
persists; the ROAM score page recommends practice.

### The checks — run these first, before changing anything

```bash
npm run verify
```

That runs content validation (~1,500 generated problems across all four
characters), the internal link and anchor checker, and the accessibility
checker. Add `node scripts/extlinks.mjs` before a release to check external
links, since it hits the network.

Every one of these has caught a real bug. If you are changing content, the
content checker is the thing that will tell you when a generated problem no
longer contains its own answer.

---

## The state of the research

The research pass produced a full build specification, kept verbatim at
[`../SPEC.md`](../SPEC.md). **It is a reference document, not a description of
the build.** 62 of its 108 recommendations are implemented, 17 partial, 22 not built and 7
not applicable to a stateless home product.

Everything with a replicated effect size behind it is in. What remains is mostly
IM's structural apparatus (the lesson skeleton and warm-up routines) and things
that need stored state (adaptive difficulty, spaced review). [`../EVIDENCE.md`](../EVIDENCE.md) has the citations
and the reasoning; the site's `/references/` page has the same material for
families.

---

## The plan, in priority order

**[BACKLOG.md](BACKLOG.md) is the live checklist.** The documents below carry the
detail and acceptance criteria for the larger items.

| | Document | Size | Blocked on |
| --- | --- | --- | --- |
| 1 | [Lesson structure and warm-up routines](01-lesson-structure.md) | Large | nothing |
| 2 | [Staging, and the content deltas](02-staging-and-content.md) | Medium | nothing |
| 3 | [Print craft](03-print-craft.md) | Medium | nothing |
| 4 | [Adaptive difficulty and spaced review](04-adaptive-and-spacing.md) | Large | accounts |
| 5 | [Open questions](05-open-questions.md) | — | your decisions |

**If you only do one thing, do (1).** The research is reasonably clear that IM's
lesson structure is worth more than another ten activities, and it is the largest
coherent gap in the build.

---

## Things worth not forgetting

- **The seed is the state.** Problems come from a deterministic function of a
  seed that lives in the URL. Preserve that. It is what makes sheets
  reproducible, practice inexhaustible, and accounts optional.
- **Characters never enter a manipulative.** Ten-frame counters, array squares
  and number line markers stay plain for everyone. This is not taste — see
  `../EVIDENCE.md` on Petersen & McNeil. `scripts/check.mjs` enforces it, and
  the enforcement has been tested against an injected violation.
- **Games sit downstream of books.** A game never introduces a concept, always
  names its strategy first, and never starts a clock unprompted.
- **Do not claim an effect size for Izzi Math.** The realistic ceiling for a
  light-touch home product is about +0.1 SD. The About and How-to-help pages
  say so; keep it that way.
- **ROAM stays subtle.** It appears in user-visible text on exactly one opt-in
  page. The linkage that matters lives in code comments on the difficulty
  bands.
