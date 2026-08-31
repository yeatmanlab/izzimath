# Izzi Math

Free interactive maths workbooks and games for kindergarten through 5th grade, where
**every activity also exists as a printable sheet with an answer key**. Built for
parents at home. No accounts, no ads, nothing to install.

**Live: https://yeatmanlab.github.io/izzimath/**

## The two ideas it rests on

**One activity, three outputs.** An activity is authored once as data plus a seeded
generator. Three renderers consume it: the interactive player, the printable sheet, and
the answer key. Nobody writes a worksheet twice.

**The seed is the state.** Problems come from a deterministic function of a seed, and
the seed lives in the URL — `/books/fraction-number-line/?seed=8817`. That one decision
buys infinite practice, reproducible sheets, shareable links, and screen/paper parity,
with no backend and no login. The URL is the save file.

## What's in it

31 activities across K–5 — 18 books and 13 games — covering counting, place value,
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
  types.js          the nine problem types, and answer checking
  roam.js           assessment linkage and the score -> practice mapping
src/
  lib/              seeded RNG, exact fractions, manipulatives, print sheets
  engine/           screen renderers, book player, game player
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
