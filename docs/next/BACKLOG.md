# Backlog

**The single list of what is left to build.** Everything else that mentions
remaining work points here — keep this file current and the rest follows.

Derived from the research pass ([`../SPEC.md`](../SPEC.md), 108 recommendations).
Current state: **67 implemented · 17 partial · 17 not built · 7 not applicable.**
The accounting lives in [`../EVIDENCE.md`](../EVIDENCE.md).

Numbers in brackets are the recommendation numbers in `SPEC.md`, so each item can
be traced back to what it came from.

The checkbox count below is higher than 22 because it is task-level rather than
recommendation-level: it includes finishing the 17 partials, and splits a few
large recommendations into work that can actually be picked up separately.

---

## 1. Lesson structure — the largest gap

Still the thing most likely to be worth more than more content. Nothing here is
started. See [`01-lesson-structure.md`](01-lesson-structure.md) for the detail.

- [ ] **IM lesson skeleton as the atomic unit** [1] — warm-up → activities →
      synthesis → cool-down. A small, highly regular schema that maps onto a data
      model. *Large.*
- [ ] **The ten warm-up routines as parameterised templates** [2] — Number Talk,
      Which One Doesn't Belong, True or False, How Many Do You See, Choral Count,
      Estimation Exploration, and the rest. Seven can be generated from a
      number-range spec. **Two are nearly free: the `truefalse` type and the
      `flashMs` mechanic already exist.** *Large, but divisible.*
- [ ] **Monitoring list + synthesis script on every open task** [4, 23] — IM never
      ships "show your thinking" without 3–4 strategies to watch for and a
      pre-written question that surfaces the target one. For a product with no
      teacher in the room this is the highest-value structure to steal. *Medium.*
- [x] **Fraction Face-Off's four-part lesson template** [32] — done, 2026-09-01.
      Warm-up word problem → explicit instruction → speed game → worksheet, stated
      once and used as the shape of every session in the plan. The
      book/game/printable split already covered parts 2–4; part 1 and the order
      were what was missing.
- [x] **Fraction Face-Off's 12-week sequence for the grade-4 fraction book** [33] —
      done, 2026-09-01. `/plans/grade-4-fractions/`, with magnitude and 0–1
      ordering in weeks 3–5 before equivalence (6–7) and before addition (8–9),
      which is the unusual part worth copying. A plan holds no problems of its
      own — every week points at a book, a game and a sheet that already exist,
      so it cannot drift out of step. New content type in `content/plans.js`.
- [ ] **Consolidation section per book, and let children author a routine** [15].
      *Medium.*

## 2. Staging instead of near-duplicates

Reduces code. See [`02-staging-and-content.md`](02-staging-and-content.md).

- [ ] **`?stage=` so one activity spans grades** [10, 47] — fold `which-is-more`
      into `decade-duel`, `hundred-line-hop` into `number-line-hop`. **Check ROAM
      coverage before folding: `hundred-line-hop` is the only holder of the 0–100
      number line block**, so `number-line-hop` must inherit it. *Medium.*
- [ ] **Port more physical games** [26] — Salute, Digit Place, Circles and Stars,
      Tenzi variants. Each is a published ruleset with a trivial print twin.
      *Medium, divisible.*

## 3. Adaptivity and spacing — mostly blocked on accounts

See [`04-adaptive-and-spacing.md`](04-adaptive-and-spacing.md).

- [x] **Within-session adaptivity** [105] — done, 2026-09-01. Targets 80–85%
      success, no stored state. `src/lib/ladder.js` is a pure reducer over four
      rungs spread across each activity's own authored difficulty range; on ten of
      the fourteen games. The other four have too shallow an item space to have a
      ladder worth climbing. Adaptive games are scored on **depth reached, as a
      named tier**, never as an ability estimate — a game is not a test and the
      items are not calibrated. Interactive only; printables stay
      seed-reproducible. Design and reasoning in
      [`04-adaptive-and-spacing.md`](04-adaptive-and-spacing.md#the-concrete-design).
      The short version: every generator's `i` argument already IS its difficulty
      parameter, so this is choosing which index to serve next rather than a new
      difficulty system, and no generator needs touching. Interactive only —
      printables stay seed-reproducible. State shape is designed for the account
      migration now so it is not retrofitted later.
- [ ] **The Number Race staircase as one shared service** [21] — three difficulty
      dimensions, rolling success estimate. Every speed game becomes a
      configuration of it. *Large. Blocked on accounts for cross-session memory.*
- [ ] **Faded worked examples** [102] — the static worked example shipped; fading
      it on measured performance needs to know how the child is doing. *Medium.*
- [ ] **Spaced review** [98] — partial. The weekly mixed-review sheet with a
      printed five-day schedule needs no account and is the honest interim.
      *Medium.*

## 4. Print craft

See [`03-print-craft.md`](03-print-craft.md).

- [ ] **Printable manipulatives as a content line** [53] — ten-frames, number
      lines, fraction strips, digit cards, nets. Cheap, self-contained, and the
      thing parents actually search for. *Medium.*
- [x] **SSDD sheets** [72] — done, 2026-09-01. Six sheets, one per grade, at
      `/ssdd/`. One shared surface, four questions, four genuinely different
      methods; the key names the method each one needed. The checker enforces that
      the four procedures are distinct, which is the only thing that makes it an
      SSDD sheet rather than a worksheet in the format's clothes. Authored rather
      than generated because the format is cross-topic by construction.
- [ ] **Generator parameter controls** [51, 87] — number range, operation, item
      count, work space, exposed progressively and carried in the URL beside the
      seed. *Medium.*
- [ ] **Three density presets from the measured conventions** [67, 73] — partial;
      ours are calibrated empirically rather than derived from the measured table
      in `SPEC.md` §4.3. *Small.*
- [ ] **Work space specified in lines, as a generator option** [77]. *Small.*
- [ ] **Four content slots beyond routine calculation, one per sheet** [71] —
      error analysis, example construction, classification, justification.
      *Medium.*
- [ ] **Say the variation out loud on the page** [69] — "notice what changed".
      *Small.*

## 5. Task formats not yet built

- [ ] **Compare-two-pieces-of-work** [7] — show two solutions, ask which is
      better and why. A core IM format. *Medium.*
- [ ] **The inverse-task trick** [8] — give the answer, ask for the question.
      *Small.*
- [ ] **Teach the tool before using it as a model** [5] — a representation gets
      introduced on its own terms before it carries new content. *Medium.*
- [ ] **Affordance differences between manipulatives as the lesson itself** [6].
      *Medium.*
- [ ] **An estimation activity, with quantities drawn as SVG** [25] —
      Estimation-180 style, three buckets. *Medium.*
- [x] **Reconsider score/streak/timer as the default game furniture** [50] —
      done, 2026-09-01. `Score / Streak / Best`, three counters reading zero and
      none of them saying what to aim for, became `Right 3 of 10` against a
      target with a bar filling toward it: a reference point rather than a bare
      score. Streak now appears only once earned, so there is no streak-loss
      punishment to read. The other half of this recommendation — number-line
      feedback naming the nearest benchmark rather than a verdict — was already
      shipped. Reasoning and sources in [`../GAME-DESIGN.md`](../GAME-DESIGN.md).

## 6. Smaller and structural

- [ ] **Five-instrument assessment mirror** [12] — pre-unit check, cool-down,
      section checkpoint. Where a digital product can genuinely beat print.
      *Medium.*
- [ ] **One artifact, two builds** [48] — rather than separate renderers. Mostly
      already true via the key toggle; worth confirming. *Small.*
- [ ] **State the transfer bridge explicitly** [57] — copy, not code. *Small.*
- [ ] **Perturbation ladder inside problem strings** [3] — partial. *Small.*
- [ ] **Three-stage fluency model** [9] — partial. *Small.*
- [ ] **Concrete → representational → abstract as the standard page shape**
      [37, 99] — partial; applied in places, not systematically. *Medium.*
- [ ] **Instruction-first for K–2, explore-first only for 3–5** [104] — partial;
      not enforced anywhere. *Small.*

---

## Not applicable

Recorded so nobody re-derives them: multiplayer barrier tasks [13], the
"first unit builds classroom community" move [11], reusing IM content verbatim
[17] (a licensing decision — we link rather than reproduce), the business-shape
and moat recommendations [54, 60], the Polypad quality comparison [65], and the
suggestion that the site measure its own effect [107] — which is a research
project needing consent and ethics review, not a feature. The architecture
already supports it: the seed makes any assignment exactly reproducible.

## Also tracked as issues

The six sections above each have a GitHub issue with the same checklist, so the
backlog surfaces in the repo UI as well as in the working tree:

| # | Issue |
| - | ----- |
| [1](https://github.com/yeatmanlab/izzimath/issues/1) | Lesson structure: IM's skeleton and the ten warm-up routines |
| [2](https://github.com/yeatmanlab/izzimath/issues/2) | Staging: one activity across grades instead of near-duplicates |
| [3](https://github.com/yeatmanlab/izzimath/issues/3) | Adaptivity and spaced review (mostly blocked on accounts) |
| [4](https://github.com/yeatmanlab/izzimath/issues/4) | Print craft: manipulatives, SSDD sheets, generator controls |
| [5](https://github.com/yeatmanlab/izzimath/issues/5) | Task formats not yet built |
| [6](https://github.com/yeatmanlab/izzimath/issues/6) | Smaller structural items |

If you tick something here, tick it there too — or the two drift.

## How to pick something up

1. `npm run verify` first — content, links and accessibility all pass today, so
   any failure is yours.
2. Read the relevant `docs/next/0*.md` for the detail and acceptance criteria.
3. `SPEC.md` has the original recommendation, with citations.
