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

**Number lines everywhere, and linear.** The circular-board comparison in Siegler &
Ramani is the cleanest natural experiment available: same game, same dose, and the
left-to-right layout more than doubled the effect. Six activities use a number line.

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

The popular framing is "timed drills cause maths anxiety, so avoid timers". The
evidence is more specific than that: WWC gives a **STRONG** rating to timed activities
for building fluency. What the anxiety literature actually indicts is *high-stakes,
publicly-compared, whole-class* timed testing — not a self-paced game a child chooses
to play.

So Izzi Math's position:

- **Books are never timed.** They are for learning, where thinking time is the point.
- **Games have timers off by default**, and every timer is one click to disable.
- **Nothing is scored against anyone else.** No leaderboards, no percentiles.
- Characters carry a default: Kiwi off, Georgie on, Flame optional. A child who finds
  the clock stressful picks Kiwi and never sees one, without being told that is what
  they have done.

## On Illustrative Mathematics — and being honest about it

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
