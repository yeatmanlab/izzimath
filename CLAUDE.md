# Izzi Math — working notes

Free interactive maths workbooks and games for K–5, where every activity also
prints. Built for parents at home. Live at https://izzimath.com/

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

Three things the Node checkers cannot test, because they need a real layout
engine, live in [`tools/`](tools/README.md) and are copied to `dist/_tools/` by
the build: a **responsive audit** (29 pages × 5 widths, checking overflow,
tap-target size and text size), a **problem-type test** (all nine types render,
verify their own answers, and print — plus the profile panel's dialog and
keyboard behaviour, driven through a real page in an iframe, since it is
client-rendered and `a11y.mjs` cannot see it), and a **print page-fill test** (1,568
cases — every activity × character × style × mode × sheet/key — failing anything
taller or wider than one page of Letter, or whose last page is under 80% full).
All three end with `CHECKS_RUN=<n>` — **if that is missing or zero the harness did
not run, and an empty report is not a pass.**

The page-fill harness exists because the sheets quietly ran onto second and third
pages for a long time while the site claimed each one was a single full page. The
heights had been judged from the on-screen preview, which carries a CSS `zoom`,
so nothing looked wrong. Only measuring at print geometry catches it.

## Break every new check before trusting it

A check that cannot fail is worse than no check, because it reads as coverage.
Several in this repo could not fail when first written:

- A focus-trap check asserted where focus ended up after a *synthetic* Tab. A
  browser does not move focus for a synthetic key event, so it passed always.
- Another ended in `|| true`.
- Two scroll assertions ran in a 3000px-tall frame where the panel always fitted,
  so they passed under the exact mutation they existed to catch — the mobile
  rules they were testing are *viewport* media queries.
- Adding `boardmove` to the own-answer round trip proved nothing: `isCorrect`
  compares the response to `problem.answer`, so feeding a problem its own answer
  back is a tautology. It needed a structural check instead.
- The harness-extraction one-liners matched lines starting `✗` or `FAIL`, and
  `pagefill.html` reports `OVER`/`WIDE`/`THIN`/`COUNT`. They could not see a
  page-fill failure at all.

So: after writing a check, **reintroduce the bug and watch it go red.** Back up
the file, `perl -0pi -e` the fix out, re-run, confirm the failure names the right
thing, restore. If the bug only appears under some condition — a narrow viewport,
a particular character, private browsing — force that condition inside the
harness rather than hoping the default reproduces it.

Read each harness's **own** verdict line (`no failures` / `N FAILURES`) rather
than grepping for a marker you assume it uses.

And make a check's summary line agree with its own failures. Three checks here
printed a cheerful count — "no field lost inside a comment", "none repeating
themselves", "3 files agree" — on the same run as the `FAIL` lines proving
otherwise, because the summary was written as a constant. If the summary can
only say the good news, it is not a summary. Two helpers in `func.html` had the
same shape and printed `ok` beside a failing `✗`.

And render the thing and look at it. Contrast, overlap and a figure that is
present in the markup but 7px tall on the page all pass every DOM assertion.
`halves-and-quarters` printed a true/false question with 520 characters of SVG
silently dropped, and every checker was green.

## There is a backlog, and it is worth reading

**[`docs/next/BACKLOG.md`](docs/next/BACKLOG.md)** — the single list of what is
left to build, traced back to the research that asked for it. Also mirrored as
[GitHub issues #1–6](https://github.com/yeatmanlab/izzimath/issues?q=is%3Aopen+label%3Abacklog),
one per section. `npm run verify` prints the top of it when it finishes.

State against the research pass: **67 of 108 recommendations implemented, 17
partial, 17 not built, 7 not applicable.** Everything with a replicated effect
size behind it is in. What remains is mostly Illustrative Mathematics' structural
apparatus and things that need stored state.

**If someone asks "what should we build next", the answer is still item 1 of the
backlog — but read it first, because it is now half-built.** The warm-up shipped
on 2026-09-04: two of the ten routines (Number Talk and Which One Doesn't
Belong), the registry and ladder machinery the other eight need, and a third
player in `src/engine/routine.js`. What remains of item 1 is the **lesson
synthesis**, the **cool-down** and the **monitoring list** — the parts a book has
no shape for. Of the eight remaining routines, **True or False and How Many Do
You See need no new renderer**: the `truefalse` type and the `flashMs` mechanic
already exist, and a routine only needs a `ui` the registry knows.

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
  names its strategy first, and never starts a clock unprompted. A game must also
  say what it IS: `goal` is the task in the child's words, `strategy` is how to do
  it, and neither substitutes for the other. The reasoning, and why the start
  screen is short rather than explanatory, is in
  [`docs/GAME-DESIGN.md`](docs/GAME-DESIGN.md) — read it before adding a game.
- **Print is line art, and the cheap option must stay genuinely cheap.** No flood
  fills behind the maths anywhere; shaded fractions are hatched. The `plain`
  style is strictly black hairlines on white with no tints at all — that is the
  floor, and it keeps the trick box and the worked example, because the cheapest
  sheet must not also be the least useful one. The `designed` style spends one
  accent colour, taken from the chosen character's own pack, on strokes, labels
  and a section band at a tenth strength. It prints for pennies and degrades to
  grey on a mono printer.
- **A printable's length is a decision, not an accident.** A sheet may be two
  pages; it may never be a page and a bit. `printItems` and `printPages` were set
  by measuring real layout, not estimated. Kindergarten and grade 1 are always
  one page, because a young child should be able to finish the sheet — a parent
  who wants a week of grade 1 practice gets the **practice pack** (several
  finishable sheets on different seeds), not one long one.
- **A generator's item space is finite, and the reader may not be offered more
  than it holds.** `printMaxPages` is measured: distinct problems divided by the
  measured items per page. Offering four pages of an activity with twenty
  problems prints the same sums twice, which reads as a bug. The page-fill
  harness tests **every page count a reader can reach**, not just the authored
  one.
- **Do not claim an effect size for Izzi Math.** The realistic ceiling for a
  light-touch home product is about +0.1 SD. The About and How-to-help pages say
  so; keep it that way.
- **ROAM stays subtle.** It appears in user-visible text on exactly one opt-in
  page. The useful linkage lives in code comments on the difficulty bands.
- **Nothing is posted from the browser, and there is no secret in the client.**
  The suggestion button prefills somebody else's form and opens it; the reader
  presses Send there. Anything else means a write token in public JavaScript.
  Getting a suggestion from a reader to the author needs one of exactly three
  things and there is no fourth: an account on something, an address the site
  publishes, or a third-party endpoint. `ROUTES` in `content/feedback.js` holds
  all three and **exactly one is live**: a Google Form that takes anonymous
  responses, prefilled with the whole message — kind, text and page — into its
  single paragraph field.
- **The suggestion button never names GitHub at the door.** GitHub is offered,
  but as the narrow right-hand third of one split control: two thirds to the
  route that needs no account, one third to GitHub with its mark and a small
  caption. An account is a cost, so it must not look like the default way
  through. The pinned button and its menu stay quiet about it either way —
  naming a developer tool at the door turns a parent away before they read the
  options. Two checks hold this, covering different halves: `a11y.mjs` reads the
  built pages for the static button and menu, and `func.html` reads the dialog,
  which is rendered at runtime and invisible to the first.
- **A report carries what a screenshot would have shown, in text.** The page
  address, which contains the **seed** — and since the seed is the state, it
  regenerates the exact problem the reporter was looking at — plus which
  question was on screen, the character, and the window size. There is no
  screenshot and there cannot usefully be one: no web API photographs your own
  page, `getDisplayMedia` needs a permission prompt per use and is unsupported
  in Safari on iPad, a Google Form cannot be prefilled with a file, and a form
  with a file question requires the respondent to sign in to Google — which
  would undo the one thing the no-account route exists for.

## Layout

```
content/
  activities/       one file per grade; an activity is metadata + a generator
  characters.js     the character packs (palette, world nouns, voice)
  routines.js       the IM warm-up routines, as generators
  feedback.js       the suggestion button's copy, and the GitHub issue URL
  types.js          the nine problem types, and answer checking
  wordproblems.js   word problems, tagged by CGI schema
  references.js     the citations, linked both ways to activities
  curriculum.js     IM unit map, deep-linked and verified
  roam.js           assessment linkage and the score → practice mapping
src/
  lib/              seeded RNG, exact fractions, manipulatives, print sheets
  engine/           screen renderers, book player, game player, warm-up player,
                    celebrations
  mount/            per-page entry points
  styles/           site.css and print.css
scripts/            build templates, and the four checkers
static/             favicon.svg + the two PNG sizes; copied verbatim into dist/
build.mjs           static site generator — plain Node, no dependencies
docs/
  next/BACKLOG.md   what is left to build  ← start here
  next/06-content-waves.md  where the catalogue past the original 30 came from
  GAME-DESIGN.md    why the games look the way they do, with sources
  EVIDENCE.md       what the content is based on, with citations
  SPEC.md           the full research output, verbatim (reference, not the build)
  ROAM.md           what ROAM measures and how we link to it
  CONCEPT.md        the original concept and design decisions
```

## Adding an activity

Add an object to the right `content/activities/grade-*.js`. Required fields are
enforced by the checker: `id`, `title`, `kind`, `grade`, `strand` (must exist in
`strands.js`), `skill`, `blurb`, `ccss`, `im`, `refs`, `theory`, `roam`,
`evidence`, and `generate()`. Books need `pages`; games need `rounds`, a
`strategy` and a `goal`. Every generated problem needs an `explain`.

Every activity also carries a `trick`: the method, in the fewest words that still
say how. It prints at the top of the sheet before any problem, which is the one
thing a printable can carry that a column of sums cannot. Optional print fields
are `printItems`, `printPages`, `printMaxPages`, `printDensity` and
`printScratch`. Do not hand-tune the first three — run the page-fill harness and
let the measurement choose, or a sheet ends up a page and a bit.
