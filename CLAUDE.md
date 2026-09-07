# Izzi Math — working notes

Free interactive maths workbooks and games for K–5, where every activity also
prints. Built for parents at home. Live at https://izzimath.com/

## Before you change anything

```bash
npm run verify
```

Content validation (~3,300 generated problems across all five characters),
internal links and anchors, and accessibility. **All three pass today**, so any
failure is from the current change. `node scripts/extlinks.mjs` checks external
links too but hits the network, so it is not in the build.

Deployment is automatic: pushing to `main` runs the checks, builds with
`BASE=/izzimath`, and publishes only if everything passes.

Three things the Node checkers cannot test, because they need a real layout
engine, live in [`tools/`](tools/README.md). The build copies them to
`dist/_tools/` for local runs and **deliberately does not in CI**
(`build.mjs` guards on `!process.env.CI`), so `izzimath.com/_tools/` is a 404 on
purpose — run them against a local `dist`, which is also the only place they can
measure a build you are still changing: a **responsive audit** (41 pages × 5 widths, checking overflow,
tap-target size, text size and SVG text contrast), a **problem-type test** (all ten types render,
verify their own answers, and print — plus the profile panel's dialog and
keyboard behaviour, driven through a real page in an iframe, since it is
client-rendered and `a11y.mjs` cannot see it), and a **print page-fill test** (2,200
cases — every activity × character × style × mode × sheet/key — failing anything
taller or wider than one page of Letter, or whose last page is under 80% full).
All three end with `CHECKS_RUN=<n>` — **if that is missing or zero the harness did
not run, and an empty report is not a pass.**

**The page-fill harness reports 201 failures today and they are real.** Its THIN
check — the last page of a child's sheet must be at least 80% full — was unable
to fail until 2026-09-06, because the rig set `min-height: 9.9in` on every page
and `.sheet` is a column flexbox whose `.sh-body` is `flex: 1`: every page
measured at least 9.9in whatever was on it. With the rig reading natural heights
as well, 30 activities under-fill their last page. Nothing regressed; the check
started working. It is item 4 of the backlog, with the measurements and the
reverted first attempt written down.

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

And put a check where its evidence exists. `npm run verify` and the CI workflow
both run `scripts/check.mjs` BEFORE `build.mjs`, so a check in that file cannot
read `dist/` — a built-page assertion belongs in `a11y.mjs`, which runs after.
The lesson-callout check was written in `check.mjs`, passed locally because a
manual build had left `dist` lying around, and failed in CI. Its own
empty-result guard is the only reason that was loud rather than a check quietly
measuring nothing. **Delete `dist` before believing a green run.**

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
- **A character re-skins and nothing else.** Palette, world nouns, voice, sprite.
  The one field that touches gameplay is `timers`, and it sets a DEFAULT — the
  child's own "Race the clock" toggle never consults the character, and only an
  activity's `timerAvailable: false` removes a clock outright. Adding one touches
  eleven files and the failure mode is a blank rather than an error, so
  [`docs/ADDING-A-CHARACTER.md`](docs/ADDING-A-CHARACTER.md) lists them and
  `check.mjs` has a pack-completeness section that fails on a half-finished one.
- **Every problem needs a worked explanation.** Bare right/wrong feedback is worth
  about a tenth of elaborated feedback, and the gap is widest in maths. The
  checker fails the build without one.
- **A figure states its attributes, never its conclusion.** Where the picture IS
  the question — geometry, mostly — the label has to carry enough to answer from
  and must not simply announce the answer. "corners of 27, 45 and 108 degrees",
  not "an obtuse triangle"; "a round shape with no corners", not "circle". Both
  ends of that had shipped: `shape-sorter` labelled its figure `circle` beside
  four options including circle, and `fold-and-sort` marked every figure
  `aria-hidden`, so all twelve of its pages were unanswerable with a screen
  reader. Sometimes the attributes settle the answer — a trapezoid with two equal
  slanted sides does fold down the middle — and that is **accepted**: a child who
  gets there from "90 degrees is a square corner" has done the learning. What is
  not accepted is a silent figure or a label that is its own answer.

  Descriptions are derived from the same coordinates the picture is drawn from,
  like the answers are, and three checks in `scripts/check.mjs` hold it: silent,
  leaking, and **ambiguous** — two items whose words and label are identical but
  whose answers differ. That last one is the only mechanical way to ask "is this
  answerable?", and it earned its place immediately: the kite's two diagonals
  both run corner to corner and only one is a fold line.
- **A lesson animates, and the chosen friend speaks it.** The four animated
  lessons at `/learn/` are the one place on this site that does not print, so
  each one earns the screen twice over. The player dispatches on a declared
  `lesson.kind` — clock, coins, bar, array — and what a stage owes it is small:
  build its DOM once, paint a step, say what its counter reads. Adding a fifth
  is a stage, not a branch. **At least one step animates**, and the movement
  has to carry something a still picture cannot: the clock sweeps because the
  fix for the hour-hand misconception is watching the short hand creep, and the
  coin lesson lays ten pennies down one at a time because the fix for "the
  bigger coin is worth more" is physical equivalence. Not decoration. **And
  every step's words are spoken by the chosen friend** — avatar, name and accent
  around the caption, with an optional second beat in the same voice. **One set
  of words for all five**: the friend is the frame, not the author, because
  per-character copy is five times the text and five times the drift, and the
  words have to stand alone anyway — "Just math" takes the frame off and reads
  the same sentences. That is the decision the printed sheet's trick box already
  made, so paper and screen agree. `scripts/check.mjs` fails a lesson with no
  animated step and one whose aside re-attributes itself; `tools/func.html`
  checks the frame, because it is rendered at runtime and `a11y.mjs` cannot see
  it. The reasoning is in the header of `content/lessons.js`.

  What every stage has in common is the part worth keeping: **the picture and the
  counter beside it are drawn from one state.** A counter reading 30 minutes
  beside a hand pointing at the 9, or "two quarters" beside a bar cut into
  eighths, teaches the opposite of the lesson. Each stage's claim is asserted in
  `tools/func.html` — the shaded bar never moves while the amount holds, every
  turn of an array keeps the total, and the turn moves the *same* svg element
  rather than redrawing it, which is the entire difference between the animation
  and a still picture.

  A sweep is also the one place the player runs a frame loop, and the reason is
  the counter rather than the movement: hands on a CSS transition with a
  separately animated readout can disagree, and a counter saying 30 minutes
  beside a hand pointing at the 9 teaches the opposite of the lesson. Both come
  from one number, every frame. The arithmetic is exported as pure functions
  because **`requestAnimationFrame` does not run in a hidden tab**, so a test
  that watches the loop measures nothing and reports a pass.
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
  by measuring real layout, not estimated. **Measure with a character selected,
  not with Just math** — the designed sheet puts the character's line art in its
  header, so it is taller with someone chosen than without. `adding-to-twenty`
  measured 9.94in for Just math and 10.12in for all four characters: a sheet that
  fitted when it was tuned and spilled onto a second page the moment a child
  picked someone. The header is now governed by its text rather than the art, so
  the gap is much smaller, but it is not zero. Kindergarten and grade 1 are always
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
  types.js          the ten problem types, and answer checking
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
  ADDING-A-CHARACTER.md  every place a character has to be added, and the traps
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
