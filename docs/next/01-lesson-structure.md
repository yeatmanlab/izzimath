# 1. Lesson structure and warm-up routines

**The largest gap in the build, and the one most likely to be worth more than
more content.** Not started.

## Why this first

Izzi Math currently has two shapes: a book (a sequence of problems with hints)
and a game (rounds with a score). Illustrative Mathematics has a third, more
useful one, and it is highly regular:

```
warm-up routine (5–10 min)
  → 1–3 activities, each with launch / work / synthesis
  → lesson synthesis (5–10 min)
  → cool-down (5 min, independent)
```

That maps cleanly onto a data model, and the regularity is the point — it is a
small schema that generalises across every grade. The research pass flagged
adopting it as recommendation #1 of 108.

The second half matters as much: IM ships **ten named warm-up routines**, and
each is a tiny generator rather than bespoke content. Seven of them can be
generated at scale from a number-range spec, which is exactly the leverage a
digital product has over a printed book.

## What to build

### The routines, as parameterised templates

Each is small. The routine *type* should be a first-class field, because the
type determines the UI.

| Routine | Generator input | UI |
| --- | --- | --- |
| **Number Talk** | 4 expressions in a deliberate string, plus one closing compare-two question | reveal one expression at a time, answer hidden until asked |
| **Which One Doesn't Belong** | 4 items where *each* is defensible, plus a prompt | 2×2 grid, no single right answer |
| **True or False** | an equation to judge *without* computing | two buttons — the `truefalse` type already exists |
| **How Many Do You See** | a flashed dot or object image | flash then hide — `flashMs` already exists in the renderer |
| **Choral Count** | (start, step, stop) plus a pattern question | a filling grid, then "what do you notice?" |
| **Estimation Exploration** | one ambiguous visual | three buckets: too low / about right / too high |
| **What Do You Know About ___** | a single stimulus | open response |

Two of these are nearly free: `truefalse` and the flash mechanic are both
already in `content/types.js` and `src/engine/render.js`.

### The perturbation ladder

The single most portable design rule in IM, and trivially generatable: an anchor
problem, then change **one** thing so the naive method breaks and the target
strategy becomes obviously cheaper.

Real IM examples to copy:

- G1: `6−1, 6−2, 8−1, 8−2` — closing question: "how are problems 3 and 4 similar
  and different?"
- G2: `17−7, 17−8, 26−6, 26−8` — target strategy: subtract to a ten, then the rest
- G2: `65−25, 65−27, 55−17, 46−18`
- G4: `5×101, 5×102, 5×203, 5×404`

**Always close a string with a compare-two-items question, never with "any
questions?"**

### The monitoring list and synthesis script

IM never ships an open "show your thinking" task without (a) an enumerated list
of 3–4 strategies to watch for and (b) a pre-written synthesis question that
surfaces the target strategy. Example, for `82−9`: *"Why did ___ need to change
82 to 7 tens and 12 ones to subtract ones from ones?"*

For a product without a teacher in the room, that structure is the highest-value
thing to steal: the monitoring list is the classifier taxonomy for a child's
work, and the synthesis question is pre-authored feedback.

## How it fits the existing code

- `content/types.js` — add a `routine` field, or a parallel `ROUTINES` registry.
  Do not overload the nine problem types; a routine is a *container*, not an
  item type.
- `src/engine/` — a third player alongside `book.js` and `game.js`. Probably
  `lesson.js`, driving warm-up → activity → synthesis → cool-down.
- `content/activities/` — activities gain an optional `warmUp: { routine, params }`.
  Books could open with one without any structural change.
- `build.mjs` — a lesson route, or fold the warm-up into the existing book page.

## Suggested first slice

Do not build all ten routines. Build **Number Talk** and **Which One Doesn't
Belong** for one grade band, attached to two existing books, and see whether the
shape holds. Both are cheap and they are the two IM leans on most.

## Acceptance

- A routine is data plus a generator, not hand-written content
- The routine type drives the UI, not a flag inside one renderer
- Every string closes with a compare question
- `npm run verify` still passes, including determinism across all four characters
- The warm-up is skippable — a parent who wants only practice can get to it

## Sources

`../SPEC.md` sections 1 and 2 for the per-grade unit structure; the IM course
guides are deep-linked per unit from `content/curriculum.js` and surfaced on the
site's `/references/` page.
