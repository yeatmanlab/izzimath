# Badges — the design rule

Badges are a **record of what you did**, not a prize for doing it. Everything
below follows from that one sentence, and the sentence follows from the evidence.

## Why the distinction is the whole design

The finding that matters here is not "badges motivate". It is that the *same*
reward can help or hurt depending on how it is experienced. Deci, Koestner and
Ryan's meta-analysis of 128 experiments found that tangible rewards made
contingent on engagement, completion or performance **significantly undermined**
intrinsic motivation — and that the effect was **worse for children than for
college students**. In the same analysis, **positive feedback enhanced** both
free-choice persistence and self-reported interest.

Cognitive Evaluation Theory names the mechanism: a reward experienced as
**informational** supports motivation; a reward experienced as **controlling**
undermines it. So the question for every badge is not "is this exciting" but
"does this tell the child something true about what they did".

The games-design literature lands in the same place from the other direction.
Badges fail when they are a "cheap sticker layered onto an experience that was
never motivating", and **labour badges** — rewarding repetition or merely showing
up — are the weakest kind, while **performance badges** that mark real skill
produce genuine pride. Every source agrees points do not fix boring.

## The rules this produces

1. **A badge states a fact.** "You reached the very hard ones" — not "Great job!"
   The name and the line under it describe the accomplishment.
2. **No badge for showing up.** Nothing is earned by opening a page, playing one
   round, or existing. If a badge cannot name a real accomplishment, it is cut.
3. **Nothing is ever compared between children.** No rarity percentages, no
   leaderboards, no "rarer than 90% of players". This deliberately gives up the
   social-comparison pull the literature describes, because `SPEC.md` §4.1
   forbids it and the reason is sound: comparison is the part of timed maths with
   a real link to anxiety.
4. **Depth and breadth over volume.** Most badges key off the adaptive ladder,
   streaks, finishing things, and covering different strands. Only two count raw
   totals, and they are milestones rather than the point.
5. **The character is named at the moment of earning.** The card says "New badge
   for Flame", with Flame's face on it, and every badge records which character
   was there. That distance is deliberate: "Flame reached the summit" invites
   less identity and comparison than "you are a three-badge child".

   The shelf itself belongs to the *profile*, not to one character — it reads
   "Cobble's badges", under the name the child chose. Three separate shelves
   would mean switching theme hid a child's own badges, which is a worse trade
   than the extra distance would buy. The stored `earnedWith` is what makes the
   Three Friends badge possible.
6. **Correcting yourself earns a badge.** `second-look` is the one the evidence
   most supports: going back and fixing a wrong answer is the behaviour worth
   reinforcing, and no other badge in the set rewards it.
7. **The celebration is short.** `src/engine/celebrate.js` already carries the
   rule — a reward layer that outshines the maths is the failure mode. A new
   badge gets one brief character flourish, and it respects
   `prefers-reduced-motion`.
8. **Badges are derived, never stored as progress.** `evaluate()` is a pure
   function of the progress records, so the shelf recomputes and cannot drift.
   Only the earning *date* and which character was present are stored.

## Where the shelf goes, and how much of it shows

The shelf sits under the score table in the profile panel, and the earned count
rides along in the header button (`Cobble · 6★`) so it travels with the name.

It shows the earned badges in full, then the four easiest that are not earned
yet under "Close by", then the whole set behind a disclosure. Rendering all
twenty-four inline was the first thing a new profile saw — seven headings of
things they had not done — and it made the panel tall enough that the browser
scrolled the greeting, including the snack the child needs in order to come
back, off the top. Gaps are still what make a set worth filling; the gaps worth
putting in front of someone are the near ones. "Nearest" is lowest rank, which
is true without inventing a progress bar.

## What is deliberately absent

No streak-loss punishment, no expiring badges, no daily-login rewards, no
currency, no badge that can be lost. Badges only ever accumulate, which the
literature notes makes them stop reinforcing once earned — that is fine here,
because they are a record rather than an engine.

## Sources

- Deci, E. L., Koestner, R., & Ryan, R. M. (1999). [A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation](https://pubmed.ncbi.nlm.nih.gov/10589297/). *Psychological Bulletin.* — tangible contingent rewards undermine; positive feedback enhances; worse for children.
- Deci, E. L., Koestner, R., & Ryan, R. M. (2001). [Extrinsic Rewards and Intrinsic Motivation in Education: Reconsidered Once Again](https://journals.sagepub.com/doi/10.3102/00346543071001001). *Review of Educational Research.*
- [Overjustification effect](https://www.structural-learning.com/post/overjustification-effect) — why a reward can replace the reason for doing something.
- [Why badges fail in gamification](https://www.gamedeveloper.com/design/why-badges-fail-in-gamification-4-strategies-to-make-them-work-properly) — *Game Developer.*
- [Badge gamification: why most achievement badges fail](https://yukaichou.com/gamification-study/badge-gamification-guide/) — labour badges versus performance badges.
- [Why do achievements, trophies and badges work?](https://www.psychologyofgames.com/2016/07/why-do-achievements-trophies-and-badges-work/) — *The Psychology of Games.*
- [Trophies, achievements and badges: explaining differences in gamification motivation using self-determination theory](https://www.sciencedirect.com/science/article/pii/S2451958826000564) — *ScienceDirect.*
- [Gamification in EdTech — lessons from Duolingo, Khan Academy, IXL and Kahoot](https://prodwrks.com/gamification-in-edtech-lessons-from-duolingo-khan-academy-ixl-and-kahoot/) — Khan's six difficulty levels of badge; Prodigy embedding practice in play rather than layering rewards on it.

The pedagogy behind the activities the badges point at is in
[`EVIDENCE.md`](EVIDENCE.md); the game-design principles behind the HUD and the
adaptive ladder are in [`GAME-DESIGN.md`](GAME-DESIGN.md).

## Levels — what the badges add up to

The kids asked for this: after enough badges the character puts something on.
Four levels, cumulative, so you can see how far someone has got at a glance.

| badges | level | the character gains |
|---|---|---|
| 3 | Explorer | a headband |
| 8 | Adventurer | goggles |
| 15 | Pathfinder | a scarf |
| 24 | Champion | a crown |

Three things it inherits from the rules above, because they apply unchanged:

**The title belongs to the character.** "Kiwi is a Pathfinder", never "you are a
Pathfinder" — the same distance the shelf keeps, and the reason a title is
allowed where a praise word is not. It names what the character has become,
which is a fact about the badges earned. `check.mjs` fails the build on a praise
word in a level name.

**It is derived, never stored.** The level is a function of the badge count, so
it cannot drift out of step with it, and nothing new is written to storage.

**Nothing is ever lost.** Gear only accumulates and a level never drops.

The top level needs every badge there is, and `check.mjs` asserts that it is
*exactly* reachable — one badge short and the crown would be decoration nobody
could earn, which is the defect The Whole Shelf shipped with.

Two implementation notes worth keeping, both found the hard way:

- The trim colour is `var(--gear-trim)`, not `currentColor`. `currentColor`
  inside a `<symbol>` resolves against the symbol's own inherited colour — it
  lives in `<defs>` under `<body>` — so it came out near-white whatever colour
  the `<use>` was given. A custom property does inherit into the shadow tree.
- The kit is dark with a bright trim rather than bright all over. Kiwi's accent
  is amber and Kiwi's face is tan, so a band in the accent nearly vanished. Real
  gear is not the colour of the animal wearing it. The crown is the exception,
  because it is the award rather than equipment.

## Saying how far the next level is

The thresholds used to live only in this file, which meant a child could earn
badges without ever learning that eight of them buys goggles. `levelGap()` in
[`content/levels.js`](../content/levels.js) builds one sentence — "2 more badges
and Kiwi is an Adventurer" — and it appears in both places a badge count is
visible: on the card as each badge arrives, and in the score panel.

Two rules from the top of this file still apply. The title belongs to the
CHARACTER, so it is never "you are an Adventurer". And no praise words: the
sentence states a count and what it buys, and the encouragement is that the
number is small rather than that somebody says well done.

On the card the gap line and the level-up line are mutually exclusive. Three
badges plus "and N more" plus a level line already measured 708px of an 844px
phone, and a fourth line puts the reward layer over the maths — which is the one
thing `celebrate.js` exists to prevent. `func.html` asserts exactly one of the
two is present.
