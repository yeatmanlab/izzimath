# What Izzi Math is built on

Notes from a research pass over K–5 curricula, the maths education literature, and the
existing landscape of math game and worksheet sites. This is the document the content
decisions answer to. Where the evidence is weak, it says so.

## The single most important finding

> **The strongest evidence in K–5 maths is not attached to any brand-name curriculum.
> It is attached to instructional *practices*.**

The IES/WWC practice guide *Assisting Students Struggling with Mathematics:
Intervention in the Elementary Grades* (WWC 2021006) rates individual practices, and
two get its **STRONG** rating:

- **Recommendation 4 — number lines** (14 studies, 11 without reservations)
- **Recommendation 6 — timed activities to build fluency**

That shaped the whole approach: pick mechanics with evidence, rather than picking a
curriculum and trusting the brand.

## Mechanics with real effect sizes

| Mechanic | Evidence | Built as |
| -------- | -------- | -------- |
| **Linear number board game** | Siegler & Ramani 2009, N=88. Number line error 29%→21%, **d=1.01**. Same game on a *circular* board: d=0.43. A colour-square version improved nothing at all. Gains held 9 weeks. | [The Great Race](content/activities/grade-k.js) |
| **Count-on, not count-from-1** | Laski & Siegler 2014. The only manipulation. Count-on produced roughly **double** the gains (number line error ~21%→~14%). | Enforced in the `boardmove` type |
| **Fraction number line** | Fuchs, *Fraction Face-Off!*, grade 4, WWC-reviewed. **ES 0.99** (fluency) / 0.80 (conceptual) on the fraction number line outcome. | [Fraction Number Line](content/activities/grade-3.js) |
| **Interleaved practice** | Rohrer, Dedrick, Hartwig & Cheung 2020. Preregistered cluster RCT, 787 students, 54 classes. **61% vs 38%**, d=0.83, on an unannounced test a month later. Same problems — only the order differed. | Mixed review sheets |
| **Game-as-representation** | Motion Math (Riconscente 2013), randomised crossover, 122 grade-5 students, 20 min/day × 5 days, **+15%** on a fraction test. | Number line games generally |

The pattern in the last row is worth stating plainly: the games with evidence are the
ones where **the game mechanic *is* the mathematical representation**. Games that
wrap arithmetic in an unrelated reward loop do not show these effects.

## Design rules that follow

**Number lines everywhere, and linear.** The number line is the only representation
with a WWC strong-evidence recommendation of its own, it is the best-validated
correlate of broad maths competence in this age range (r=.443 across 263 effect sizes),
and it is a causal lever in randomised experiments. The circular-board comparison in
Siegler & Ramani is the cleanest natural experiment available: same game, same dose,
and the left-to-right layout more than doubled the effect (d=1.01 vs 0.43). Seven
activities use a number line, and none of them loops.

**Count on from where you are.** Any movement along a line starts from the token's
current position, never from 1. In The Great Race, tapping "1, 2" — the documented
common error — is rejected and corrected with "count on from 3: 4, 5".

**Interleave on review.** Practice sheets group by problem type, which is right while
a skill is new and the instructions need to be clear. Review sheets are **eight
problems** (Rohrer's exact template) shuffled so no two adjacent problems need the same
method. Both are one click apart on every print page.

**Brief exposure for subitizing.** A dot pattern that stays on screen gets counted one
at a time, which trains counting. Flashes run 900 ms down to 450 ms.

**Fractions: include odd denominators, and go past 1.** WWC Recommendation 4 is
specific about this. Children over-generalise from halving, so thirds and fifths are in
the target pool; and the line is extended to 0–2 so nobody concludes that all fractions
are less than one.

**Practise the traps, not random pairs.** Number comparison uses the four specific
two-digit confusions (tens and ones agreeing, disagreeing, matched tens, reversed
digits) rather than random pairs. Decimal comparison uses the longer-decimal-looks-
bigger error. Coordinates isolate x-before-y.

## On timers

The popular framing is "timed drills cause maths anxiety, so avoid timers." That is
not what the evidence says, in either direction.

**For timed practice:** WWC 2021 Recommendation 6 gives timed fluency activities a
**STRONG** rating across 27 studies. Two independent meta-analyses put fluency practice
at around g=0.76. A speeded-versus-non-speeded RCT found ES 0.51 on arithmetic **with
no difference in attitudes, motivation or effort**.

**Against the critique:** Boaler's *Fluency Without Fear*, the usual source for "timed
tests cause anxiety", cites no experiment that manipulated timing in children. Maths
anxiety is real and matters — it correlates r=-.26 with achievement across 90 countries,
and counterintuitively it hurts *higher*-attaining children more, because they rely on
working-memory-intensive strategies. But the intervention evidence says the way to
reduce it is to build competence: skill-building raises achievement (g=0.76) *and*
reduces anxiety (g=-0.32), while digital games as such do almost nothing for anxiety
(ES -0.13).

What the critique is actually about is **long, graded, publicly-compared timed tests on
unpractised content.** That is a specific thing, and we do not do it.

So the design follows the WWC constraints rather than a slogan:

- **A game never introduces a concept.** Games sit downstream of books. Each one opens
  with a "learn it first" link.
- **Every game names its strategy before play starts**, and keeps it one tap away
  during play. This is the biggest single lever in the whole literature: the WWC's own
  contrast of fluency-with-strategy against fluency-without produced **g=1.48 versus
  g=0.37** — a larger swing than timing itself.
- **Clocks run 60–90 seconds**, one item on screen, and only correct answers count.
- **No clock starts until the child presses Start.**
- **Nothing is compared between children.** No leaderboards, no percentiles, no public
  scores, no streak-loss punishment.
- Timers are off by default and one click to disable. Characters carry a default —
  Kiwi off, Georgie on — so a child who finds clocks stressful can pick Kiwi and never
  meet one, without being told that is what they have done.

## What we deliberately did NOT build, and why

**Approximate-quantity (ANS) training.** Dot-cloud comparison and approximate
arithmetic games are popular and do not work: the meta-analytic effect of ANS training
on symbolic maths is **g=0.11 (not significant), and −0.04 after bias correction**. A
six-week, 30-minutes-a-day first-grade programme improved children's ANS acuity and
transferred to nothing at all.

So *Which Is More* compares **numerals, not dot clouds** (symbolic comparison
correlates better with achievement: r=.302 against .241), graded by numerical distance
so the ladder runs from far pairs to adjacent ones. Where dots do appear — the
subitizing flash — the quantities are exact, small, structured, and always mapped to a
numeral. Dots as a bridge to symbols is fine; dots as the mechanism is not.

**Discovery-first tasks for this age range.** Productive-failure effects are positive
overall (53-study meta, g=0.36) but **reverse for grades 2–5**. Books lead with a
worked path, not with unguided exploration.

**Themed manipulatives.** This one was a live risk in the original design, which said a
character's collectible "drives every manipulative". Petersen & McNeil found
perceptually rich objects *help* children with low knowledge of the object and *hurt*
children who know it well — so precisely the children most attached to Georgie are the
ones tennis-ball counters would hurt most. A character now owns the palette, the voice
and the word-problem nouns, and never the countable units. `scripts/check.mjs` renders
every problem under all four characters and fails if a manipulative differs.

## A frozen set of representations

WWC 2021 Recommendation 3 (also STRONG) asks for "a well-chosen set" of
representations, kept the same as children move up the grades — rather than variety for
its own sake. Ours, used from K to 5:

1. **The number line** (whole numbers, fractions, decimals, 0–20 → 0–100 → 0–1 → 0–2)
2. **The ten-frame** and structured dot patterns
3. **The array**, becoming the area model
4. **The bar**, for fractions and part-whole

Base-ten blocks and number bonds are the two additions, both for place value and
part-whole specifically. Nothing else gets invented per-activity.

## On Illustrative Mathematics## On Illustrative Mathematics — and being honest about it

IM K–5 supplies the topic order and the choice of representations. It is free, openly
licensed, and coherent across the grade band, and EdReports rates it **Meets
Expectations in all three gateways at every grade K–5** (100% Focus & Coherence, 100%
Rigor & Practices).

**But that is a rating of design quality, not of measured learning outcomes.** There
are no high-quality studies of IM K–5 student learning impacts; the Massachusetts
CURATE panel gave IM K–5 *no rating at all* on Impact on Learning as of October 2024.
The widely-quoted +0.18 to +0.50 SD figures are from **grades 6–8**, not K–5. The only
elementary-relevant number is a quasi-experimental Missouri study (+0.38 SD on MAP,
Evidence for ESSA Tier 2 "Moderate").

So: IM is treated here as a well-vetted *design* artefact, not an efficacy-proven one.
Saying otherwise would repeat a citation error that is already common.

## Printable design

Measured from actual worksheets in the wild (Math-Drills' dense drill sheets): problem
text 16 pt, row pitch 0.33 in, hairlines 0.4 pt, 0.75 in margins. Useful as a
sanity check, though that density is aimed at older children than most of our range.

Rules we follow:

- **Density by grade, not a fixed count.** K–1 gets 8–10 large problems in two columns
  with room to write; grades 4–5 get up to 20 in four or five columns.
- **Line art only, no solid fills.** A parent is paying for the ink. Shaded fractions
  are hatched rather than filled.
- **Answer key on a separate page**, so the adult can hold it back until afterwards —
  which is how the Rohrer RCT ran it.
- **Every figure the problem refers to is drawn.** A sheet that says "(bar of 4, 3
  shaded)" instead of drawing the bar is not a worksheet.

## Things deliberately not built

- **Extrinsic reward loops.** Coins, pets, avatars-as-prizes. The evidence for
  game-based gains is specific to the mechanic carrying the maths; decorative reward
  layers are where engagement metrics improve and learning does not.
- **Leaderboards and percentile displays.** Comparison is the part of timed maths with
  a real link to anxiety.
- **Adaptive difficulty across sessions.** It needs stored state, and the site is
  stateless by design. Difficulty progresses within an activity instead.

## Sources

The full research output, including ~200 sources across seven parallel reviews (IM
scope and sequence, IM derivatives, validated curricula, learning science, existing
sites, game mechanics, printables), is summarised above. Primary references worth
reading directly:

- IES/WWC 2021006 — *Assisting Students Struggling with Mathematics: Intervention in
  the Elementary Grades*
- Siegler & Ramani (2009); Ramani & Siegler (2008); Laski & Siegler (2014)
- Rohrer, Dedrick, Hartwig & Cheung (2020), *J. Educational Psychology* 112(1), 40–52
- Fuchs et al., *Fraction Face-Off!*
- Clements & Sarama — learning trajectories, subitizing and "quick images"
- Illustrative Mathematics K–5, via Kendall Hunt; EdReports reviews

## The full specification, and what is deferred

The research pass produced a complete build specification, kept verbatim at
[`docs/SPEC.md`](SPEC.md) — scope and sequence per grade, an activity catalogue,
the score-to-practice tables, print geometry measured from production worksheets,
and the citation policy.

**Current state against its 108 recommendations: 62 implemented, 17 partial,
22 not built, 7 not applicable** to a stateless home product (multiplayer barrier
tasks, business-model calls, a "first unit builds classroom community" move, and
the suggestion that the site measure its own effect, which is a research project
rather than a feature).

### Scope and sequence: complete

All thirty strands (five per grade, six grades) have at least one activity — 41
activities in total. The gaps the spec identified are closed, including the one it
called the highest-value of them all: a grade-1 word-problem book covering every
CGI structure, because WWC Recommendation 5 is rated STRONG on 18 studies while
arithmetic fluency transfers to word problems only weakly (g=0.25).

### Implemented, in rough order of how much the evidence supports it

- Number line as the spine — six activities, never circular
- The linear board game, faithfully, with count-on enforced in the type system
- Interleaved review: eight-item mixed sheets, and the last page of every book
- Elaborated feedback on misses as well as hits, now **enforced by the checker**:
  an activity without a worked explanation on every problem fails the build
- Number line feedback names a reference point rather than a verdict — it draws
  the gap and names the nearest landmark
- A named strategy before every game, and no clock until the child presses start
- Symbolic rather than approximate comparison; no ANS training anywhere
- Word problems tagged by schema, not by operation
- Plain manipulatives, enforced by the checker
- Worked example first on every practice sheet, with its minimal twin second
- Self-check on every sheet where one is honestly possible: a verified checksum
  or a scrambled answer bank
- Primary ruling at the measured per-grade heights; large-print and extra-spacing
  variants; guidance for the adult on every key
- Browse by skill as a third navigation axis, built by running the generators
- Honest ceilings, and an explicit separation of what is evidence-led from what
  is craft judgement

### Not built, and worth doing next in this order

1. **IM's lesson skeleton and the ten warm-up routines** (recs 1, 2, 4, 23). Still
   the largest coherent gap, and still probably worth more than more content.
   Two of the ten routines are nearly free: `truefalse` and the flash mechanic
   already exist.
2. **Staging** (recs 10, 47). One activity spanning several grades via `?stage=`
   rather than near-duplicates. Reduces code.
3. **Worked examples faded on measured performance** (rec 102). The static
   version shipped; the adaptive fade needs to know how the child is doing.
4. **Adaptive difficulty targeting 80–85% success** (recs 21, 105) and **spaced
   review** (rec 98, partial). Both need stored state, so both wait for accounts —
   though within-session adaptivity needs none, and is the honest interim.
5. **Fraction Face-Off's four-part lesson template and 12-week sequence**
   (recs 32, 33), which is the closest thing to a validated blueprint for the
   grade-4 fraction book.
6. **Printable manipulatives as a content line** (rec 53), **SSDD sheets**
   (rec 72), **generator parameter controls** (recs 51, 87), **compare-two-works
   and inverse-task formats** (recs 7, 8).

See [`docs/next/`](next/README.md) for the pick-up notes on the largest of these.
