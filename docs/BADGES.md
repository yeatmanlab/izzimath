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
5. **The character holds the shelf.** A badge is Kiwi's, or Georgie's, or
   Flame's. That distance is deliberate: "Kiwi reached the summit" invites less
   identity and comparison than "you are a three-badge child".
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
