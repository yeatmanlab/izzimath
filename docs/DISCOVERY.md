# Feature discovery — why there is a tour, and why it is this shape

This exists because a first grader asked for one: *"there could be a wizard or
guide that shows how to navigate the page and introduces the different features
and how they're supposed to work."*

Four designs were built and each judged by four lenses — a six-year-old who
cannot read fluently, a parent with ninety seconds, cognitive load, and
buildability. Scores out of 40: **Signposts 27.5, Show Me Around 26.5, "What's
this?" 25, First notes 23.** It was close at the top, and the tour is what we
built.

## The tour is for whoever is driving it

This is the constraint that shaped the copy. A child exploring on her own is as
likely to be running the tour as a parent, and she may be running it *to find out
what there is to do*. So there is no child line with an adult footnote. Each
panel has a short line about what just happened and a smaller line with more
detail, and **both are written for whoever pressed the button.** Nothing refers
to "your child".

The scale is the invitation: `29 books`, `14 games`, `43 activities`, `24
badges`. Every one of those numbers is filled from `content/` at runtime, because
this project does not use praise words and does not claim effects — a large true
number is the honest way to make a catalogue look worth exploring. The printing
notes read "Six of the forty-one sheets" for two days after two activities
landed, which is why no count here is typed.

## What it does

Three panels. Two of them are a press.

1. **Press a friend.** Four faces, nothing else pressable. The press calls the
   real `setCharacter()`, so the whole site changes colour behind the dialog —
   and only *then* does "Next" appear.
2. **Press it again.** Three real sums from the real generator above one
   `⟳ New problems` button. Press it and the numbers change.
3. **Here's what there is.** The six routes in — grades, books, games,
   printables, badges, by skill — with counts, plus the three ways to reach a
   printable. This one is a map, not a press.

**The consequence is the instruction.** Hiniker et al. (IDC 2015, n=34, ages 2–5)
found that once a child understood which action to attempt she executed it 87% of
the time — understanding is the bottleneck, not motor skill. The same study rules
out the coach-mark primitive: a visual state change was significantly worse than
every other prompt type and the only one that did not improve with age. So the
tour never points at a control; it lets you press one and tells you what you did.

## What it deliberately does not do

- **It never opens itself.** No first-visit modal, no delay trigger, no red dot.
  So there is no "you have seen this" flag, and therefore nothing to degrade when
  `localStorage` throws — which it does, in Safari private browsing and on a full
  quota.
- **It is not in the nav.** The header is already a dozen tab stops before
  `<main>`. A control that pays off once must not tax every keyboard visit. It
  sits in the hero row of the index pages and as one footer link.
- **It is never beside a live problem.** Not on any activity page, not on any
  print page. This is the mitigation for the finding that argues hardest against
  the whole shape, below.
- **No overlay, coach mark, spotlight or anchored tooltip.** See Hiniker above.
- **No speech on open.** Chrome refuses audible autoplay before a gesture on the
  domain, and WCAG 1.4.2 makes more than three seconds of unstoppable audio a
  Level A failure. The accessible answer and the only working answer agree.
- **No badge, no confetti, no star for finishing it.** `check.mjs` forbids a badge
  for a non-maths act.

## The strongest argument against this feature

Andersen et al. (CHI 2012) tested 8 tutorial designs across 3 games with 45,000+
players. Tutorials paid off in *Foldit*, the complex unconventional one. In
***Refraction*** — a free web fractions game for children, the closest published
analogue to this product that exists, 13,158 new players — **every measure was
null**: time 990s vs 1050s (p=0.437), levels 15 vs 16 (p=0.294), return rate
28.46% vs 28.61% (p=0.925).

Worse, in the same experiment an **on-demand help button reduced** levels
completed (14 vs 16, p=0.013) and time played (900s vs 1050s, p=0.031) against no
tutorial at all, with only 31% ever pressing it. The authors cannot explain the
harm and ask for replication.

Our mitigation is placement — six index pages and one footer link, never beside
the maths, which is where Refraction's help button sat. **That mitigation is
untested, because nobody has tested it.** State it that way.

Two further cautions worth keeping in view:

- **A step budget.** Gathercole & Alloway: a 5–6-year-old holds about two
  instructions, and verbal rehearsal does not emerge until about 7. The only tour
  benchmark with a disclosed denominator (Produktly 2026, 88 companies) reports
  median completion 29%, falling to 8% at nine or more steps. Three panels, two
  of them presses, is the budget.
- **A scripted route can be learned as a ritual.** Lyons, Young & Keil (PNAS
  2007) and a decade of replications: 4–7-year-olds encode demonstrated steps as
  causally necessary and cannot drop them when told they may. That is a real cost
  for a product whose value is arbitrary re-entry on any URL with any seed, and
  it is why each panel demonstrates a *reversible* control rather than a path.

## What the tour cannot fix

**A walkthrough cannot fix a link graph.** Measured on the built site, counting
editorial links only — header, footer and breadcrumbs stripped — `/plans/` has
**0** inbound links, `/skills/` has **0**, and `/ssdd/` has **1**. Mentioning the
12-week plan once, to the fraction of visitors who open a tour, is not the same
as linking it. The structural work is separate and still owed.

## Sources

- Andersen, E. et al. (2012). [The impact of tutorials on games of varying complexity](https://dl.acm.org/doi/10.1145/2207676.2207687). *CHI.*
- Hiniker, A. et al. (2015). [Touchscreen prompts for preschoolers](https://dl.acm.org/doi/10.1145/2771839.2771851). *IDC.*
- Lyons, D. E., Young, A. G., & Keil, F. C. (2007). [The hidden structure of overimitation](https://www.pnas.org/doi/10.1073/pnas.0704452104). *PNAS.*
- Blanco, N. J., & Sloutsky, V. M. (2021). Systematic exploration in young children. *Developmental Science.*
- Gathercole, S., & Alloway, T. Working memory and learning: a practical guide. MRC-CBU.
- Aleven, V. et al. (2016). Help-seeking in intelligent tutoring systems. *IJAIED.*

The game-design principles that govern what may sit beside a live problem are in
[`GAME-DESIGN.md`](GAME-DESIGN.md); the badge rules are in [`BADGES.md`](BADGES.md).
