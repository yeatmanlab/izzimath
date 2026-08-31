# Izzi Math — first concept

Interactive math workbooks and games for K–5, where every activity also exists as a
printable sheet. Built for **parents at home**, not classrooms. Stateless to start;
accounts later without re-architecting.

## 1. The core idea: one activity, three outputs

The single most important decision. An activity is **authored once as data**, then
rendered three ways:

```
Activity (the atom)
├── meta      grade, strand, CCSS standard, difficulty, est. minutes
├── generate  (seed) => Problem[]        deterministic, seeded
└── renderers
    ├── <Interactive/>   web: input, hints, instant feedback, animation
    ├── <PrintSheet/>    paper: layout, work space, no interactivity
    └── <AnswerKey/>     paper: solutions for the grown-up
```

Nobody authors a worksheet twice. Add an activity, get the interactive version, the
printable, and the answer key.

## 2. Seeded generators are the state

Problems are produced by a deterministic function of a seed, and the seed lives in
the URL:

```
/books/fractions-on-a-number-line?seed=8817
```

This gives us, with no backend and no login:

- **Infinite practice** — new seed, new problems, same skill.
- **"New sheet" button** — a parent clicks and gets a fresh printable forever.
- **Shareable + reproducible** — the same link always renders the same problems, so a
  parent can hand the same page over tomorrow and a kid can come back to it.
- **The paper and the screen can match** — same activity, same seed, same 20 problems.

The URL is the save file. That is what makes "stateless now, accounts later" honest
rather than a promise.

## 3. Paper ↔ screen bridge

Every printable carries a QR code in the footer pointing at the interactive version
*with the same seed*. Finish the sheet on paper, scan, check your answers on screen.
Print sheets are a first-class product surface, not an export.

## 4. Characters: one math, many worlds

Kids pick a character. That choice re-skins the whole site — palette, word problems,
game mechanics, level names, encouragement copy, even the printable header. Three at
launch, plus an opt-out.

**The rule that makes this affordable:** a character changes the *skin*, never the
*math*. If picking Georgie changed the problems, we would be authoring K–5 twice per
character and CCSS alignment would drift. Instead activities are authored
character-agnostic with named slots, and the character pack fills them.

```ts
// authored once, renders for every character
stem: (ch) => `${ch.collectible.plural} come in ${ch.container.plural} of 8.
               ${ch.name} has 4 ${ch.container.plural}. How many ${ch.collectible.plural}?`
```

Kiwi gets "crickets come in cups of 8." Georgie gets "treats come in bags of 8."
Same numbers, same standard, same answer key. Authoring cost stays at 1×.

### The character pack

```
Character
├── identity     name, species, tagline, avatar (color + 1-bit line art for print)
├── palette      accent ramp overriding the default spectrum
├── world        setting and nouns for word problems and level names
├── collectible  the thing that gets counted (drives every manipulative)
├── voice        feedback and encouragement copy
└── motif        decorative geometry, cursor, loading state, transitions
```

### The first three

|             | **Kiwi** bearded dragon             | **Georgie** chihuahua             | **Flame** red panda                |
| ----------- | ----------------------------------- | --------------------------------- | ---------------------------------- |
| Palette     | Desert — gold, orange, terracotta   | Zip — magenta, violet, cyan       | Ember — gold, orange, crimson      |
| World       | Canyon, basking rocks, heat lamps   | The park, the couch, the sidewalk | Treetops, bamboo, misty cliffs     |
| Collectible | Crickets, mealworms                 | Treats, tennis balls              | Bamboo shoots, berries             |
| Voice       | Calm, dry — "Nice. No rush."        | Fast, delighted — "YES! Again!"   | Curious — "Ooh, try it this way."  |
| Motif       | Scales — hexagonal tessellation     | Bouncing arcs, paw prints         | Climbing, ringed-tail stripes      |
| Pace        | Steady, no timers by default        | Quick rounds, streaks, timers     | Puzzle-first, hints on tap         |

The trio is deliberate rather than cosmetic. Each one's motif is genuinely useful math
art for a different part of the curriculum:

- **Kiwi's scale tessellation** — tiling, area, symmetry. Geometry.
- **Georgie's bouncing ball** — skip counting, intervals, fractions. The number line.
- **Flame's climbing and ringed tail** — vertical stacking and repeating patterns.
  Place value and skip-counting patterns.

So a kid who bounces off one may click with another, and each character makes a
different slice of K–5 feel like it was built for them. Kiwi also gives us a calm,
timer-free mode and Flame a hint-forward puzzle mode, without ever labelling either
"for kids who find timers stressful."

**Kiwi's palette note** — the third stop is terracotta (`#C1440E`), a desert clay red,
deliberately *not* the brighter crimson Flame uses. Two warm characters need two
distinguishable reds; earthy-versus-ember is the split, and it matches how the two
animals are actually coloured.

### Where the choice is stored

`localStorage` is the primary home, so it survives across visits with no account, and
a `?ch=kiwi` URL param overrides it for sharing. Character is a rendering concern —
it never touches problem generation, so a shared `?seed=8817` link produces identical
math for both characters. Stateless stays intact.

### Print constraint

Sheets print on a **home inkjet**, which is a tighter constraint than a school copier:
ink is expensive and the parent is paying for it. So every character needs a **1-bit
line-art variant** alongside the colour avatar, and sheets must be line-art-light with
no heavy fills or background tints anywhere. Worth designing the line art first — if
the character does not read at 24px in black and white, it is the wrong character.

Low ink coverage is a feature, not a compromise: a sheet a parent can reprint all week
without thinking about cartridges is a sheet they will actually use.

### Adding a fourth

A new character is one data file plus two art assets — no activity changes. Flame was
added after Kiwi and Georgie without touching a single problem generator, which is the
proof the model holds.

### Opting out

"Just math" is a first-class fourth option: plain problems, plain colours, lightest
ink. Some kids want the maths without a story, and making opt-out a real choice now is
cheaper than retrofitting it later.

## 5. Aesthetic direction: "hologrid"

The brief is futuristic and impressive to adults *and* kids. Those usually pull in
opposite directions — kid-appealing means bright and rounded, adult-futuristic means
dark and precise. The resolution is a single metaphor:

> **Graph paper, lit from behind.**

Kids read a luminous grid as a video game. Adults read it as a technical HUD. Both
are correct.

- **Base** — deep space navy (`#05060E`), never pure black.
- **Surfaces** — glass panels, 1px luminous hairlines, soft depth.
- **Accents** — cyan → violet → magenta gradient spectrum; lime reserved for "correct".
- **Ornament is content** — the decoration *is* math: number lines, fraction bars,
  ten-frames, tessellations, isometric solids. No generic swooshes.
- **Type** — Space Grotesk for display (excellent numerals, geometric but warm),
  Inter for body.
- **Motion** — springy and physical, not cartoon-bouncy. Every input gets feedback.
- **Print is the inverse** — the same system flipped to ink on white, high contrast,
  generous work space. Deliberately calm, and cheap in ink.

## 6. Information architecture

```
/                                 hero, grade picker, featured book + game
/grades/[k|1|2|3|4|5]             grade hub — strands, books, games
/grades/[grade]/[strand]          topic list
/books                            all books
/books/[slug]                     interactive workbook (chaptered, paged)
/books/[slug]/print               print view  → browser "Save as PDF"
/games                            all games
/games/[slug]                     game
/printables                       browse and download every sheet, filter by grade
/about
```

Character is orthogonal to routing — it themes every route rather than nesting under
one, so there is no `/kiwi/grades/3`. One canonical URL per activity keeps sharing and
SEO clean.

`/grades` is the front door. A parent arrives knowing exactly one thing — what grade
their kid is in — so grade is the first and only question the home page asks.

Grade is the primary axis, as requested. Strand is secondary — a parent generally does
not arrive looking for "3.NF.A.2", they arrive looking for "third grade".

## 7. Books vs games

|            | Books                          | Games                              |
| ---------- | ------------------------------ | ---------------------------------- |
| Shape      | Chaptered, paged, progressive  | Single loop, replayable            |
| Goal       | Learn a skill                  | Build fluency and speed            |
| Feedback   | Hints, worked solutions        | Score, streak, timer               |
| Print twin | Workbook pages + answer key    | Puzzle page version of the mechanic |

## 8. Grade + strand map (CCSS-aligned)

| Grade | Strands                                                              |
| ----- | -------------------------------------------------------------------- |
| K     | Counting and cardinality · Number bonds · Shapes · Measurement       |
| 1     | Addition and subtraction to 20 · Place value · Time and money · Shapes |
| 2     | Place value to 1000 · Two-step problems · Measurement · Arrays        |
| 3     | Multiplication and division · Fractions · Area and perimeter · Data  |
| 4     | Multi-digit operations · Equivalent fractions · Angles · Factors     |
| 5     | Decimals · Fraction operations · Volume · Coordinate plane           |

## 9. Launch content (proof the model works)

Three books and three games, one per grade band, chosen to stress-test different
renderer needs:

| Band | Book                  | Skill                        | Game             |
| ---- | --------------------- | ---------------------------- | ---------------- |
| K–1  | Number Friends        | Number bonds to 10           | Ten-frame blitz  |
| 2–3  | Times Table Tower     | Multiplication fluency       | Fact family forge |
| 4–5  | Fraction Foundry      | Number line and equivalence  | Decimal drop     |

Fraction Foundry is the flagship — a number line activity is the hardest thing to
render well on both screen and paper, so if the two-output model survives it, it
survives everything.

## 10. Technical plan

**Stack** — Next.js (App Router) + TypeScript, static export. Tailwind v4 with the
design tokens above as CSS custom properties. Framer Motion for the springy feel.
SVG-first for activities; canvas only where a game genuinely needs it.

Next.js over Astro because heavy interactivity is the product, not an island, and
because the auth/API path later is a config change rather than a migration.

**Content** — typed TypeScript modules under `content/`. No CMS. It is authored by us,
it is code-shaped (generators are functions), and it wants type-checking.

**PDF, two tiers**
- *Now* — a dedicated `/print` route with real `@media print` CSS, and the browser's
  Save as PDF. Zero infrastructure, works on a static host, and looks correct if the
  print CSS is treated as a real design surface rather than an afterthought.
- *Later* — a server route rendering the same activity data through
  `@react-pdf/renderer` or headless Chrome, for pre-baked branded downloads and
  multi-sheet packets.

**Hosting** — static on Vercel or GitHub Pages. No server, no cost, until logins.

**When accounts arrive** — Next.js gains route handlers, add Supabase or Clerk. The
progress table is keyed on `(user, activity_id, seed)` — which already exists in the
URL today. Nothing about the content model changes.

## 11. Open questions

**Settled**

- **Grade range** — K–5. Not extending to middle school.
- **Audience** — parents at home. Not schools. `/grades` is the front door, print
  targets a home inkjet, and nothing in the UI assumes a class of 24.

**Still open**

1. **Standards** — CCSS codes are mostly noise to a parent but reassuring in
   aggregate. Recommend keeping them as small metadata on the card, and saying
   "covers the grade 3 standards" in plain language where it counts.
2. **Is "Izzi" itself a character?** With three animals in place, Izzi probably works
   better as the brand than a fourth pet. Recommend holding.
3. **Does character gate anything?** Currently pure skin. Tempting to give each one
   exclusive games — but that punishes the choice and forces kids to switch to reach
   content. Recommend keeping it strictly cosmetic.
4. **How many characters is too many?** Three plus opt-out is a good launch set. The
   cost is art, not engineering, so the ceiling is a design-quality question.

## 12. What the content is grounded in

Three separate inputs, in order of how much they shape the site:

1. **Illustrative Mathematics K–5** — the topic order and the choice of
   representations (ten-frames, number lines, arrays, area models, fraction bars).
   Free, openly licensed, and coherent across the whole grade band.
2. **Maths education research** — which activities are worth building at all. Linear
   number line work, conceptual subitizing, part-whole number bonds, fact families,
   area models, and interleaved practice all have real evidence behind them; most
   gamified drill does not.
3. **ROAM** — used for difficulty progressions and for which misconceptions to target
   deliberately, because its item corpora encode that unusually well. Deliberately
   kept subtle in the interface: see the restraint section in `docs/ROAM.md`.

The rule of thumb: a family should be able to use every part of this site, and
understand why each activity exists, without ever hearing the word ROAM.
