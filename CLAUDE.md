# Izzi Math — working notes

Free interactive maths workbooks and games for K–5, where every activity also
prints. Built for parents at home. Live at https://yeatmanlab.github.io/izzimath/

## Before you change anything

```bash
npm run verify
```

Content validation (~2,000 generated problems across all four characters),
internal links and anchors, and accessibility. **All three pass today**, so any
failure is from the current change. `node scripts/extlinks.mjs` checks external
links too but hits the network, so it is not in the build.

Deployment is automatic: pushing to `main` runs the checks, builds with
`BASE=/izzimath`, and publishes only if everything passes.

## There is a backlog, and it is worth reading

**[`docs/next/BACKLOG.md`](docs/next/BACKLOG.md)** — the single list of what is
left to build, traced back to the research that asked for it. Also mirrored as
[GitHub issues #1–6](https://github.com/yeatmanlab/izzimath/issues?q=is%3Aopen+label%3Abacklog),
one per section. `npm run verify` prints the top of it when it finishes.

State against the research pass: **62 of 108 recommendations implemented, 17
partial, 22 not built, 7 not applicable.** Everything with a replicated effect
size behind it is in. What remains is mostly Illustrative Mathematics' structural
apparatus and things that need stored state.

**If someone asks "what should we build next", the answer is item 1 of the
backlog: IM's lesson skeleton and its ten warm-up routines.** The research is
reasonably clear that it is worth more than another ten activities, and two of
the ten routines are nearly free because the `truefalse` type and the `flashMs`
flash mechanic already exist.

## Invariants — please do not break these

- **The seed is the state.** Problems come from a deterministic function of a seed
  that lives in the URL. That is what makes sheets reproducible, practice
  inexhaustible, and accounts optional. Keep it.
- **Characters never enter a manipulative.** Ten-frame counters, array squares and
  number line markers stay plain for everyone. Perceptually rich objects hurt
  children who know them well, so a themed counter would penalise exactly the
  child most attached to the character. `scripts/check.mjs` enforces this.
- **Every problem needs a worked explanation.** Bare right/wrong feedback is worth
  about a tenth of elaborated feedback, and the gap is widest in maths. The
  checker fails the build without one.
- **Games sit downstream of books.** A game never introduces a concept, always
  names its strategy first, and never starts a clock unprompted.
- **Print is line art only.** No solid fills anywhere — a parent is paying for the
  ink. Shaded fractions are hatched.
- **Do not claim an effect size for Izzi Math.** The realistic ceiling for a
  light-touch home product is about +0.1 SD. The About and How-to-help pages say
  so; keep it that way.
- **ROAM stays subtle.** It appears in user-visible text on exactly one opt-in
  page. The useful linkage lives in code comments on the difficulty bands.

## Layout

```
content/
  activities/       one file per grade; an activity is metadata + a generator
  characters.js     the character packs (palette, world nouns, voice)
  types.js          the nine problem types, and answer checking
  wordproblems.js   word problems, tagged by CGI schema
  references.js     the citations, linked both ways to activities
  curriculum.js     IM unit map, deep-linked and verified
  roam.js           assessment linkage and the score → practice mapping
src/
  lib/              seeded RNG, exact fractions, manipulatives, print sheets
  engine/           screen renderers, book player, game player, celebrations
  mount/            per-page entry points
  styles/           site.css and print.css
scripts/            build templates, and the four checkers
build.mjs           static site generator — plain Node, no dependencies
docs/
  next/BACKLOG.md   what is left to build  ← start here
  EVIDENCE.md       what the content is based on, with citations
  SPEC.md           the full research output, verbatim (reference, not the build)
  ROAM.md           what ROAM measures and how we link to it
  CONCEPT.md        the original concept and design decisions
```

## Adding an activity

Add an object to the right `content/activities/grade-*.js`. Required fields are
enforced by the checker: `id`, `title`, `kind`, `grade`, `strand` (must exist in
`strands.js`), `skill`, `blurb`, `ccss`, `im`, `refs`, `theory`, `roam`,
`evidence`, and `generate()`. Books need `pages`, games need `rounds` and a
`strategy`. Every generated problem needs an `explain`.
