# 5. Open questions

Decisions that need you, not code. Nothing here is blocked on engineering.

## Settled in v1, for the record

- **Grade range** — K–5. Not extending to middle school.
- **Audience** — parents at home, not schools. `/grades` is the front door,
  print targets a home inkjet, nothing assumes a class of 24.
- **Characters** — Kiwi (bearded dragon), Georgie (chihuahua), Flame (red
  panda), plus "just math" as a real fourth option. Cosmetic only, never
  purchasable, never inside a manipulative.
- **ROAM** — one influence among several, subtle in the interface, on one
  opt-in page.

## Still open

### 1. Character art

The three characters are **hand-coded SVG and should be redrawn by an
illustrator.** They are good enough to prove the theming system and to brief
from, and not good enough to launch on.

The binding constraint to hand an illustrator is the print variant: **1-bit line
art that still reads at 24px in black and white.** If a character does not
survive that, it is the wrong character. Each needs three expressions (idle,
happy, think) — see `src/lib/sprites.js`, where body and face are already
separated so an expression costs a few paths.

### 2. Should CCSS codes be visible to families?

Currently shown as a small tag on cards and sheets. To a parent they are mostly
noise; in aggregate they are reassuring. Options: keep as quiet metadata (the
current choice), hide entirely, or replace with plain language ("covers the
grade 3 standards").

### 3. Is "Izzi" a character?

With three animals in place, Izzi probably works better as the brand than as a
fourth pet. Recommend holding.

### 4. How many characters is too many?

Three plus opt-out is a good launch set. The cost of a fourth is art, not
engineering — a character is one data file and two assets. So this is a
design-quality question rather than a technical one.

### 5. A custom domain?

Pages currently serves from `/izzimath`, which is why the build takes
`BASE=/izzimath`. A custom domain would remove the base path entirely. Worth
deciding before anything external links to the site.

### 6. Should the site measure its own effect?

The research pass raised this twice, and it is the most interesting open
question here. **There are no high-quality studies of IM K–5 learning
outcomes** — the gap Izzi Math sits in is a genuine one. A seeded, stateless
product with reproducible problem sets is unusually well placed to produce the
K–5 causal evidence that does not currently exist.

That is a research project, not a feature, and it would need consent and ethics
review. But it is worth knowing that the architecture already supports it: the
seed makes any assignment exactly reproducible.

### 7. Licence

`README.md` currently says only "for the Yeatman Lab's use". IM K–5 is CC BY-NC,
which matters if any IM material is ever reproduced rather than linked. Right
now the site only links, so nothing is inherited — but the licence should be
stated properly before any wider release.
