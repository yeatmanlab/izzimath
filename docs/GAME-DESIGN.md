# Game design principles

Why the games are built the way they are.

This exists because of a specific piece of feedback: children testing the games
**sometimes could not say what the point of the game was.** Nothing was broken —
every game worked, kept score, and named its strategy. They just did not know
what they were aiming at.

The obvious fix is to explain it on the start screen. That fix is wrong, and the
research says so fairly clearly. What follows is what we did instead, and why.

---

## 1. The interface states the goal. Text is the last resort.

The tutorial literature is consistent that mechanics are taught *through* the
interface rather than announced ahead of it. The standard example is Super Mario
Bros. World 1-1, which teaches every mechanic it uses without a word of
instruction — the placement of the first Goomba under a pipe is the lesson.

So the goal moved into the HUD:

| before | after |
| --- | --- |
| `Score 0` `Streak 0` `Best 0` | `Right 0 of 10` + a bar toward it |

`Right 3 of 10` states the objective *by existing*. `Score 3` does not — three
of what, and is that good? Three counters all reading zero at the start of a
game is worse still: it is three questions the child cannot answer.

**Applies to:** `hud()` in [`src/engine/game.js`](../src/engine/game.js).

## 2. Adding explanation can cost more than it buys.

This is the one that changed our mind, and it is why the start screen got
*shorter* rather than longer.

The serious-games meta-analyses find that games can create **extraneous
processing** — the decorative and explanatory apparatus competes for the same
limited working memory as the maths. In one trial, students given an added
self-explaining mechanic showed **higher extraneous load and worse outcomes**.
Wouters et al. put the design requirement plainly: balance features that foster
motivation against features that add irrelevant processing.

A wall of pre-game text is both the thing a child skips *and* the thing that
crowds out the learning if they don't.

**Applies to:** `paintStart()`. It lost a duplicated title and a paragraph of
prose, and gained exactly two lines — what to do, and what winning is.

## 3. A goal needs an endpoint, or there is nothing to be near.

The goal-gradient hypothesis (Hull, 1932; revived by Kivetz, Urminsky & Zheng,
2006) holds that effort accelerates as visible distance to a goal shrinks. A
progress bar is the standard interface expression of it.

A bare score has no endpoint, so it has no gradient. Every game therefore has a
**target** — four fifths of its rounds — shown in the HUD with a bar filling
toward it.

**Be honest about this one:** Kivetz is consumer loyalty cards, not children's
arithmetic. We use the mechanism because it is cheap, legible and hard to get
wrong, not because it has been tested on this population. It is not a claim.

**Applies to:** `const target = Math.max(2, Math.round(total * 0.8))`.

## 4. Show a state change; don't caption it.

When the clock is on, the game is a different activity — a race — and that
should be legible without a sentence saying so. Hence a three-beat countdown and
a `Go!` before a timed game starts.

It also fixed a fairness bug found while building it: the clock used to start the
instant the child pressed play, so the first round was spent orienting rather
than answering.

Untimed games get **no** countdown. Nothing should imply speed where speed is not
the point.

**Applies to:** `countdown()`, and the `[data-go]` handler.

## 5. Rewards appear when earned, not as empty slots.

`Streak 0` is a puzzle. `3 in a row`, appearing the moment it becomes true, is a
reward. The streak readout is hidden below two.

Same logic for the clock: it is in the HUD while running, and absent otherwise.

**Applies to:** the `streak >= 2` and `timed && tHandle` guards in `hud()`.

## 6. Feedback is immediate, specific, and explains.

Already true before this pass, and it is the best-evidenced thing here — bare
right/wrong feedback is worth about a tenth of elaborated feedback, and the gap
is widest in maths. A miss shows the working and holds it on screen long enough
to read.

**Applies to:** the `renderProblem` callback, and the longer pause on a miss.

## 7. Missing the target is a number to beat, not a failure.

The finish screen reports against the stated target. Hit it and the character
says so; miss it and it says *"You got 7. The target was 10 — have another go?"*

A game here is for getting quicker at something already met. It is never a test,
which is also why nothing is ever timed by default.

**Applies to:** `finish()`.

---

## What every game must have

Enforced by `scripts/check.mjs`, which fails the build without them:

- **`goal`** — what the child is being asked to do, in their words. One or two
  short sentences. This is the line on the start screen.
- **`strategy`** — `{ name, text }`: *how* to do it. Required before any timed
  practice; the with-strategy versus without-strategy contrast is a larger effect
  than timing itself.
- **`rounds`** — the target is derived from this, so it is not authored twice.

`goal` and `strategy` answer different questions and neither substitutes for the
other. "Tap the bigger one" is the goal. "Compare the tens digits first" is the
strategy.

Scoring, round count, target and timer copy are **generated from metadata**, never
written per game — one place each, so they cannot drift apart.

---

## Sources

Design and tutorial practice:

- [How to design a video game tutorial](https://gamedesignskills.com/game-design/video-game-tutorial/) — teaching through gameplay rather than instruction screens
- [Game design principles](https://gamedesignskills.com/game-design/concepts/) — clear goals, immediate and legible feedback
- [HUD (video games)](https://en.wikipedia.org/wiki/HUD_(video_games)) — presenting state without overloading the player

Learning-games evidence:

- Clark, D. B., Tanner-Smith, E. E., & Killingsworth, S. S. (2016). [Digital Games, Design, and Learning: A Systematic Review and Meta-Analysis](https://journals.sagepub.com/doi/10.3102/0034654315582065). *Review of Educational Research.* Genre alone does not predict learning — design does.
- Wouters, P., van Nimwegen, C., van Oostendorp, H., & van der Spek, E. D. (2013). [A meta-analysis of the cognitive and motivational effects of serious games](https://www.semanticscholar.org/paper/A-Meta-Analysis-of-the-Cognitive-and-Motivational-Wouters-Nimwegen/68b75e47e1f6bd3fd42100f35475c9dbb5344be6). *Journal of Educational Psychology.*
- Wouters, P., & van Oostendorp, H. (2013). [A meta-analytic review of the role of instructional support in game-based learning](https://cddoc.uc.cl/wp-content/uploads/2020/03/Metaanalytic_review_rol_instructio.pdf). *Computers & Education.*
- [Effectiveness of digital educational game and game design in STEM learning](https://stemeducationjournal.springeropen.com/articles/10.1186/s40594-023-00424-9) (2023). *International Journal of STEM Education.*

Motivation and progress:

- Kivetz, R., Urminsky, O., & Zheng, Y. (2006). [The Goal-Gradient Hypothesis Resurrected](https://journals.sagepub.com/doi/abs/10.1509/jmkr.43.1.39). *Journal of Marketing Research.* Original hypothesis: Hull (1932).
- [Goal-Gradient Effect](https://lawsofux.com/goal-gradient-effect/) — Laws of UX

The pedagogy sources behind the strategy card, the untimed default and elaborated
feedback are in [`EVIDENCE.md`](EVIDENCE.md) and
[`../content/references.js`](../content/references.js), with effect sizes.
