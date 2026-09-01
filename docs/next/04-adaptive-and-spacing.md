# 4. Adaptive difficulty and spaced review

Large. **Both blocked on accounts**, for the same reason. Not started.

## Why they are blocked together

Izzi Math is stateless by design: the seed lives in the URL and nothing is
stored. Adaptivity and spacing both need to know what a child did *last time*,
which is the one thing the architecture deliberately does not know.

This is a real tension, not an oversight. The statelessness is what makes the
site free, private, accountless and shareable. Do not give it up casually.

## Adaptive difficulty

The best-specified engine in the literature is The Number Race
(Wilson & Dehaene), already cited in `content/references.js` — three difficulty
dimensions (numerical distance, response deadline, conceptual complexity), a
rolling 20-trial success estimate, and a target around 75–85% correct.

Build it **once, as a shared service**, and point every speed game at it. Then
Ten-Frame Flash, Which Is More, Decimal Drop and the fact-family rounds all
become configurations of one engine rather than four hand-tuned difficulty
ladders.

Two cautions:

- **Do not optimise for in-session ease or self-reported enjoyment.** Desirable
  difficulty feels worse and tests better. Interleaving has exactly this
  signature: lower in-session accuracy, large gains on a delayed test.
- The deadline dimension should stay **off by default**, consistent with the
  rest of the site.

### The honest interim version

Within-session adaptivity needs no storage. A game already knows how the current
run is going, so it can adjust the next round without any account at all. That
captures a good share of the benefit and requires nothing new architecturally.

---

## The concrete design

Written out because the answer turns out to be much smaller than it looks.

### The insertion point already exists

Every generator has this signature:

```js
generate(seed, i, ch, rng, bookSeed)
```

`i` is the page or round index — and **every generator already uses it as its
difficulty parameter.** The progression comments say so all over the content:
*"1–2 sort; 3–5 benchmark distance; 6–7 equivalence; 8–10 unlike-denominator
comparison"*. Each activity therefore already ships a hand-authored difficulty
ladder, ordered by someone who thought about it.

So adaptivity is not a new difficulty system. It is **choosing which `i` to serve
next instead of walking 0, 1, 2, 3 in order.**

That is the whole change. No generator is touched, no content is rewritten, and
all 41 activities become adaptable at once. Any scheme that requires editing 41
generators is the wrong scheme.

### Where the code goes

One module, pure, no DOM and no storage:

```
src/lib/ladder.js
  nextLevel(config, state, outcome) -> state     // pure reducer
  levelFor(state) -> i                            // which index to serve
```

`config` comes from the activity. `state` is a plain serialisable object. The
function is pure, which matters for three separate reasons: it is trivially
testable in `scripts/check.mjs` without a browser, it cannot leak state between
activities, and — the point below — it works identically whether the state came
from memory or from a database.

The engines (`src/engine/book.js`, `src/engine/game.js`) call it. They are the
only things that know where state lives.

### The controller

Target **80–85% success**, per recommendation 105.

```
window   = last 6 outcomes
above 85% -> step up one
below 70% -> step down one
otherwise -> hold
```

Four guards, each of which exists because the naive version is worse:

- **One step at a time.** Jumping two levels on a good run produces whiplash and
  a child who thinks the game is broken.
- **No step down on the first two items.** One miss is noise, not a signal that
  the material is too hard.
- **Clamp to the activity's authored floor and ceiling.** The ladder may reorder
  an activity's own levels; it may never invent levels outside them.
- **Never optimise for in-session ease.** Desirable difficulty feels worse and
  tests better, and interleaving has exactly this signature — lower accuracy
  now, large gains on a delayed test. The target is 80–85%, not 100%.

The deadline dimension stays off, as everywhere else on the site.

### What must NOT become adaptive

**Printables.** The seed is the state, and a sheet has to be reproducible from
its seed alone — that is what makes a printable shareable, and it is the
invariant the whole architecture rests on. A printable walks its indices
deterministically, forever.

So adaptivity is **interactive-only**, and the interactive/print split is exactly
where the line falls. A book adapts on screen and prints its authored order. Say
this on the page, because a parent who prints the sheet after an adaptive session
should know why it does not match.

### How it is documented

Three places, because a feature nobody can see is indistinguishable from a bug:

1. **A field on the activity**, so it is machine-readable and checkable:

   ```js
   adaptive: { from: 2, to: 13 }   // the levels the ladder may move between
   ```

   `scripts/check.mjs` validates the range against `pages`/`rounds` and fails the
   build on a bad one, the same way it validates everything else.

2. **A badge in the interface** — *"Adjusts as you go"* — on the activity page
   and in listings, wherever the grade badge already appears. A parent choosing
   between two activities can see which one moves.

3. **A line in the For grown-ups note**, generated from the field, saying what it
   does and — importantly — **that nothing is stored, and it resets when the page
   does.** That is a privacy statement as much as a feature note, and it is
   currently true.

### The account migration, designed now rather than retrofitted

This is the part worth getting right early, because it is cheap now and expensive
later. The state is one plain object per child per activity:

```js
{
  v: 1,                      // versioned, so stored records can be migrated
  activityId: 'times-table-tower',
  level: 7,
  history: [1, 1, 0, 1, 1, 1],
  seen: 42,
  updatedAt: '2026-09-01T18:22:00Z',
}
```

Two properties make it portable:

- **It is produced by a pure reducer.** `nextLevel()` does not care where the
  state came from. Persisting it later changes nothing about the logic.
- **The engines talk to a store interface, never to storage directly.**

  ```js
  { get(activityId), set(activityId, state) }
  ```

  Today there is one implementation, `memoryStore`, which forgets everything on
  reload. Later there is a second, and the engines do not change. A
  `sessionStore` over `sessionStorage` is a middle step if wanted, though it is
  worth being clear that it is not the interesting one — the value of accounts is
  memory **across days**, which is also what spaced review needs.

When accounts arrive, the same records are what the spaced-review scheduler reads
from. Design them once.

### What this does not do

It does not schedule across sessions, it does not fade worked examples on
measured performance, and it does not do the full Number Race staircase with its
three independent dimensions. Those need stored state and stay blocked. This is
the interim, and it should be described as the interim.

## Spaced review

Same total practice spread across days beats massing it. But the effect is
grade-sensitive: it held to six weeks at grade 7 and only to about **one week**
at grade 3. So for K–5, weight the gaps *within* a week.

### The honest interim version

Ship a **"this week's mixed review" sheet** whose seed encodes which skills the
child has already met, with a printed five-day schedule on the sheet itself. The
paper carries the state. No account, no storage, and it works today.

## When accounts arrive

The key is already designed: `(user, activity_id, seed)`. Nothing about the
content model changes — see `../CONCEPT.md`. Add route handlers and a provider;
the generators stay exactly as they are.

## Acceptance

- One adaptive service, not one per game
- Deadline dimension off by default
- Within-session adaptivity works with no stored state
- The weekly review sheet works with no account
- Statelessness is still the default path, not a degraded one
