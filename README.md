# Izzi Math

Free interactive maths workbooks and games for kindergarten through 5th grade, where
**every activity also exists as a printable sheet with an answer key**. Built for
parents at home. No accounts, no ads, nothing to install.

**Live: https://izzimath.com/**

## The two ideas it rests on

**One activity, three outputs.** An activity is authored once as data plus a seeded
generator. Three renderers consume it: the interactive player, the printable sheet, and
the answer key. Nobody writes a worksheet twice.

**The seed is the state.** Problems come from a deterministic function of a seed, and
the seed lives in the URL — `/books/fraction-number-line/?seed=8817`. That one decision
buys infinite practice, reproducible sheets, shareable links, and screen/paper parity,
with no backend and no login. The URL is the save file.

## What's in it

49 activities across K–5 — 32 books and 17 games — covering counting, place value,
addition and subtraction with and without regrouping, times tables, fractions on the
number line, decimals, area, volume and coordinates.

Three characters (Kiwi the bearded dragon, Georgie the chihuahua, Flame the red panda)
re-skin the palette, the word problems and the encouragement copy. They never change
the maths — activities are authored character-agnostic with named slots, so adding a
character costs one data file and no content changes. "Just math" is a first-class
fourth option.

## Grounded in

The topic order follows [Illustrative Mathematics](https://illustrativemathematics.org/math-curriculum/)
K–5. The activity choices follow the evidence: linear number board games, fraction
number lines, conceptual subitizing, part-whole number bonds, area models, and
interleaved review. See [docs/EVIDENCE.md](docs/EVIDENCE.md) for the citations, the
effect sizes, the position on timers, and an honest note on where the evidence is thin.

## Picking this up

- **[docs/next/BACKLOG.md](docs/next/BACKLOG.md)** — what is left to build. The
  single list; everything else that mentions remaining work points at it.
- **[docs/next/README.md](docs/next/README.md)** — state of play, what the checks
  cover, and the invariants worth not breaking.
- **[CLAUDE.md](CLAUDE.md)** — the same, condensed, and loaded automatically at
  the start of a Claude Code session in this repo.

`npm run verify` prints the top of the backlog when it finishes, so it resurfaces
without anyone having to remember it.

## Keeping score without accounts

Optional, and never forced: the offer appears once, after something is finished, and
never again that session if it is waved away.

A child picks a creature from 150 icons, a name from 10 offered, and a **secret snack**
from a scrolling list of 500, split into everyday snacks and silly ones. That triple is the
whole identity. Scores, completion and download marks, and
the 24 [badges](docs/BADGES.md) hang off it in this browser's `localStorage` — nothing
is sent anywhere, and no name, email or age is collected. Coming back means picking your
creature out of the ones on the device, then your snack out of six.

The store (`src/lib/profile.js`) is deliberately shaped like a document database — async
API, document paths, a declared merge rule per field, plain JSON only — so it can be
swapped for Firebase later without touching the callers.

### What the snack check is actually worth

**One in six**, because six snacks are offered. Not one in five hundred: the size of the
pool only makes it unlikely that two children on one tablet pick the *same* snack. It is
not a second factor.

And **attempts are unbounded** — a wrong pick just re-asks. So the real ceiling is not
one in six but *one*, for anyone willing to tap six times. That is a choice rather than
an oversight. The threat model is two siblings sharing a tablet, everything behind the
check is a score, and a child shut out of their own progress with no recovery path is a
worse outcome than a sibling reading it.

Two rules in `foodChoicesFor` (`content/avatars.js`) soften it further, on purpose:

- **Same kind.** A silly answer gets silly decoys, a plain answer gets plain ones. The
  pool is 390 silly to 110 plain, so decoys drawn at random would leave a plain answer
  as the only plain thing on screen. This one is not a difficulty knob — removing it
  makes the check *easier*.
- **Different silly word and different food.** No two of the six share either half, so
  "Musical soup" never sits beside "Musical hot cocoa". This favours a child who only
  half remembers, at the cost of making the check easier.

### If we decide to make it harder

In order of value. **Only the first changes the ceiling** — the rest raise the effort
while unbounded retries still let a determined child in.

1. **Bound the attempts.** In `flowConfirm` (`src/mount/profile.js`), count wrong picks
   and after three send them back to the character list, or make them wait. This is the
   only change that stops brute force, and it turns "one in six, eventually" into one in
   six per visit. It needs a way forward for a child who has genuinely forgotten —
   "start a new character", said plainly — because a dead end is the failure we are
   trading against.
2. **More decoys.** `CHECK_DECOYS` in `content/avatars.js`: 5 → 11 gives one in twelve
   per attempt. One constant, and tried — at 11 all 500 snacks still get twelve distinct
   options under the eligibility rules, and `npm run verify` passes unedited. It is recognition rather than recall, so a longer grid costs a child little.
   `check.mjs` derives its assertion from the constant and needs no edit; the hardcoded
   `6` lives in `tools/func.html`, and the grown-ups copy says "checked against six".
3. **Let the six share a silly word.** Drop the prefix rule in `foodChoicesFor`. Forces
   recall of both halves; a child who remembers only "the dragon one" is at a coin flip.
4. **Let the six share a food.** Drop the base rule. Puts "Dragon pancakes" next to
   "Moon pancakes" — which is exactly the discrimination the rule exists to avoid,
   because it is genuinely hard a week later.
5. **Two snacks instead of one.** One in thirty-six per attempt if asked as two six-way
   questions, and a pair is memorable. Costs a migration: `profile.food` holds a single
   id today, and ids are load-bearing (below).
6. **Recall instead of recognition** — type or search the snack. Hard to guess and too
   hard for a five-year-old, and it wants a keyboard. Not recommended.

What we would not do: passwords, anything leaving the device, a recovery flow that needs
an email address, or a lockout with no way forward.

**One constraint on all of the above: snack ids are permanent.** A profile stores the
id, so renaming a silly word or dropping a food locks out whoever chose it. `check.mjs`
pins the original 25 ids for that reason, and checks all 500 as the answer. Add; never
rearrange.

## Development

Plain Node and plain static HTML. **No dependencies, no build tooling, no framework.**

```bash
node build.mjs        # generate dist/
node scripts/check.mjs # validate content
node scripts/links.mjs # verify every internal link resolves
```

```bash
node build.mjs && python3 -m http.server 8890 --directory dist
```

### Layout

```
content/
  activities/       one file per grade; each activity is metadata + a generator
  characters.js     the character packs
  routines.js       the IM warm-up routines, as generators
  feedback.js       the suggestion button's copy, and the GitHub issue URL
  types.js          the nine problem types, and answer checking
  roam.js           assessment linkage and the score -> practice mapping
src/
  lib/              seeded RNG, exact fractions, manipulatives, print sheets
  engine/           screen renderers, book player, game player, warm-up player
  mount/            per-page entry points
  styles/           site.css and print.css
scripts/            build templates, content checker, link checker
build.mjs           static site generator
```

### Adding an activity

Add an object to the right `content/activities/grade-*.js` file:

```js
{
  id: 'my-activity', title: 'My Activity', kind: 'book', grade: '3',
  strand: 'Fractions on the number line',   // must exist in strands.js
  skill: 'What this practises, in a sentence.',
  blurb: 'One line for the card.',
  ccss: ['3.NF.A.2'],
  roam: [{ task: 'roamMagpi', subscale: 'numberline', block: '0_1' }],
  evidence: 'Why this activity exists, and what supports it.',
  pages: 12, printItems: 10,
  generate(seed, i, ch, r, bookSeed) {
    return { type: 'numberline', lo: 0, hi: 1, target: 0.375, targetLabel: '3/8', /* ... */ };
  },
}
```

`node scripts/check.mjs` then validates it: schema, generator determinism across all
four characters, that the answer passes its own checker and appears in its own choice
list, that print sheets and answer keys render, and that every assessment subscale is
still covered. It checks about 1,500 generated problems in a second or two, and it has
caught every content bug so far.

### Problem types

Nine, reused by every activity, so one renderer serves the lot:
`choice`, `input`, `numberline`, `compare`, `tap`, `ordinal`, `bond`, `truefalse`,
`boardmove`.

## Deployment

Pushing to `main` runs the content checks, builds with `BASE=/izzimath`, verifies every
link, and publishes to GitHub Pages.

## Licence

Content and code are for the Yeatman Lab's use; see the repository for details.
