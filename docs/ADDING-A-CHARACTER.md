# Adding a character

A character re-skins the site — palette, world nouns, voice, sprite — and changes
no maths. This is every place one has to be added, in the order that works, with
the numbers each constraint actually enforces.

Written while adding **Ash** the koala (2026-09-06, the fourth after Kiwi,
Georgie and Flame), because the surface is eleven files and four of them are
traps: the failure mode is not a build error but a **blank**. A missing sprite
renders an empty avatar. A missing entry in `theme.js` sends `?ch=` silently back
to "Just math". Neither looks like a bug; both look like nothing happening.

Most of that is now caught. `scripts/check.mjs` has a **`=== character packs are
complete ===`** section that reads every entry in `characterList` and fails on a
missing field, an empty voice array, an absent sprite, an absent `theme.js`
entry, an absent `celebrate.js` motif, or a pack that exists but is not in
`characterList`. Run `npm run verify` first and let it tell you what is left —
but read this anyway for the parts a checker cannot judge.

---

## Before writing anything: is the design free?

Two questions have a wrong answer, and both are about the characters already
there.

**Is the world taken?** Flame lives in treetops with branches, berries and
baskets. A second arboreal forager is Flame in different fur however different
the animal is. Ash is a koala — the obvious world was a canopy — so Ash counts
**gum leaves into bundles**, and counts **whole trees** rather than branches.
Check `world`, `collectible`, `container` and `unit` across
[`content/characters.js`](../content/characters.js) before choosing nouns.

**Is the voice taken?** Kiwi is unhurried, Georgie delighted, Flame strategic.
Kiwi already says "no rush", so Ash — drowsy — must never say it. Pick the
psychological niche first and the lines follow.

`affinity` and `motif` are declared in every pack and **read by no code**. They
are documentation. Do not spend design effort on them expecting behaviour.

---

## The palette, which has hard numbers

Four rules, all enforced. Get them right on paper before touching CSS, because
three of the four are contrast measurements you cannot eyeball.

| Rule | Threshold | Enforced by |
| --- | --- | --- |
| `a1` hue must clear every other named character's `a1` | **20°** | `check.mjs`, "character palettes" |
| `a1` on the near-black page — it is the link colour | 4.5:1 | WCAG; the CSS comment says so |
| the label on the `--sp` gradient, sampled 30–80% | **4.5:1** | `check.mjs`, same section |
| each badge glyph on its accent disc | **3:1** (warns under 3.5) | `check.mjs`, "badge legibility" |

At the time of writing, Kiwi holds **39°**, Georgie **333°**, Flame **2°**, which
leaves the open range **60°–313°**. Ash took sage at **140°**. Note that `none`
is cyan at 185° and is *excluded* from the pairwise check — so the checker will
allow a palette that looks like "Just math". Avoid that band anyway.

**Two accents cannot both be light and dark.** No single hex is simultaneously a
legible link on a near-black page (luminance above ~0.20) and a background for
dark text (below ~0.17). If your accents are deep, take Flame's route: override
`--onsp` to a light colour *and* `--sp` to start at `a2`. Ash's palette was
chosen partly so it would **not** need this, keeping it structurally distinct
from the other dark-accent character.

**Do the badge inks channel by channel.** The defaults are
`--bi-a1: #0A0D1C; --bi-a2: #FFF8F2; --bi-a3: #0A0D1C; --bi-ok: #0A0D1C`, and
your palette will almost certainly need overrides. Ash needed two — dark on `a2`,
light on `a3`, the same pair Kiwi has. This is the step most likely to be
half-done: the numbers were computed correctly for Ash and only one of the two
overrides was written, and `a2` sat at **2.64:1** until the checker caught it.

---

## The files, in order

### 1. `content/characters.js`
The pack, plus the id in **`characterList`** — which is what renders the picker,
so a pack missing from it is invisible. Required fields are enforced; copy an
existing pack's shape. `printAccent` must be a hex and wants to be dark, because
it is ink on white paper.

### 2. `src/styles/site.css`
- `html[data-ch="<id>"] { --a1 … --ok; --gA; --gB; --grid1; --grid2 }`. Every hex
  in the pack must appear **on that same line** — the check reads one line, so do
  not wrap the palette.
- badge-ink overrides, per the table above.
- add `--onsp` and `--sp` to the same rule only if the accents are deep.

### 3. `src/lib/sprites.js` — the largest job
- `BODIES.<id>` — everything that never changes.
- `FACES.<id>` — `idle`, `happy`, `think`.
- `LINE_ART.<id>` — the 1-bit print variant, idle only.
- `CHARACTERS` — add the id.

**The head must sit near the canonical ellipse: `cx 32, cy 33.5, rx 21, ry 18.`**
The four gear layers are positioned against it — crown clear above, goggles on
the forehead, band at the brow, scarf at the chin — and they are cumulative, so
at the top level all four are on at once. Drift from that ellipse and a
levelled-up character wears its crown through its ear.

The symbol-build loop used to hardcode `['kiwi', 'georgie', 'flame']`; it now
derives from `CHARACTERS`, so this trap is closed. Do not re-open it.

### 4. `src/lib/theme.js`
`VALID`. Miss it and `?ch=<id>` *and* the saved preference both fall back to
"none", with no error anywhere.

### 5. `src/engine/celebrate.js`
`MOTIF.<id>` — glyph, particle count, spin. Without it the flourish degrades to
the no-character `+`.

### 6. `scripts/check.mjs`
`CHARS`, near the top. Everything downstream — generators, print sheets, warm-ups,
figures, page-fill case counts — is derived from it.

### 7. `content/badges.js` — a decision, not an edit
`three-friends` is named "Three Friends" and tests exactly Kiwi, Georgie and
Flame. **Leave it.** Widening it to include a new character would un-earn a badge
children already hold, which is a regression; the new character simply does not
count toward it. If a "play with all of them" badge is ever wanted for the larger
set, it should be a **new** badge at a higher rank.

### 8. Documented counts — these fail the build
`check.mjs` derives `pagefillCases = activities × characters × 8` and compares it
against a number written in `CLAUDE.md`. Adding a character changes it — 1,568 →
1,960 for Ash — and the build fails until the doc is updated. Also update the
prose counts in `README.md`, `docs/EVIDENCE.md`, `docs/CONCEPT.md`,
`docs/next/01-lesson-structure.md` and `docs/next/05-open-questions.md`.

**Do not edit `docs/SPEC.md`.** It is the research output kept verbatim; its
character count is part of a quoted document, not a claim about the build.

### 9. `docs/CONCEPT.md`
Add a section rather than rewriting the "first three" table. That table is the
record of the founding trio and a later addition should read as one.

### 10. Not `docs/mockup/index.html`
A frozen pre-build artefact with its own copies of the palettes and sprites.
Adding a character there implies it is live. Leave it alone.

---

## Verifying

```bash
npm run verify
```

Then the three browser harnesses, because a fifth picker button is a **layout**
change and Node cannot see layout:

- **`tools/audit.html`** — the nav gains a button at all five widths. Below the
  narrow breakpoint `.chbtn` hides its label and shows a 30px avatar, so this is
  where overflow and the 24px tap-target minimum are checked.
- **`tools/func.html`** — the picker assertions are driven off `characterList`,
  so a new character is covered automatically: every button present, avatar
  drawn, four gear layers on everyone but "Just math", and every id themes the
  page when clicked.
- **`tools/pagefill.html`** — iterates `Object.keys(characters)`, so the new
  character's print sheets are measured without any edit. The case count grows.

Each ends with `CHECKS_RUN=<n>`; if that is missing or zero the harness did not
run, and an empty report is not a pass.

**And render the sprite and look at it, at 24px.** Every DOM assertion passes for
a face whose features have washed out. Ash's first draft had shut eyes drawn as
2-unit strokes; the nav scales 64 units into 24px, so they landed at 0.75px and
the icon was a grey blob with a nose. `idle` is the nav icon and needs filled
shapes that keep their mass; `happy` only ever appears large in feedback, so it
uses the same thin `eyeArc` the other three do — a filled shape at that weight
reads as eyeliner rather than a smile. That was three rounds of drawing it,
shrinking it, and looking.
