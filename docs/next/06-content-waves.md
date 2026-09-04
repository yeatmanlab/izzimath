# The content waves

Where the activity catalogue came from after the original 30, what shipped in
each wave, and what a future wave would have to build. This document exists
because the plan for waves 3–5 lived only in a chat transcript, which is not a
place a plan can live.

The spec for the first 30 activities is [`docs/SPEC.md`](../SPEC.md), kept
verbatim as the research output. Everything below is later, and was chosen
against the same criterion: **an activity earns a place if it teaches a
structure the catalogue could not already show.** More arithmetic drill was
never the gap.

---

## Wave 1–2 — shipped (41 → 45 activities)

| Activity | Grade | What it added |
| --- | --- | --- |
| `take-it-apart` | 2 | Decomposition as a *choice* — the same number split several useful ways, not one canonical bond. |
| `four-ways-to-subtract` | 3 | Four strategies on one difference, then claims about whether a transformation preserves it. |
| `fold-and-sort` | 4 | Symmetry and classification, which grade 4 had no home for until the strand was widened to `Shapes, angles and lines`. |
| `same-size-pieces` | 4 | The unit fraction as the countable thing, in five stages. |

`bond` became fraction-capable and denominator-strict in this wave: `parseRaw`
in [`src/lib/frac.js`](../../src/lib/frac.js) parses without simplifying, so
`3/6` is not accepted for `1/2` where the activity is *about* sixths.

## Wave 3–5 — shipped (45 → 49 activities)

| Activity | Grade | What it added |
| --- | --- | --- |
| `double-frame-flash` | 1 | The teens as *ten and some more*. Ten-Frame Flash trains subitizing to ten; this aims the same mechanic at the place-value step after it. |
| `hundred-board` | 1 | The Great Race at 0–100, as a column-aligned matrix — so one row up is ten more, and the units digits line up in columns. |
| `count-up-to-the-target` | 2 | A difference as a *distance*, measured in friendly jumps. The method children invent, and the one that makes `62 − 48` easy. |
| `draw-the-story` | 3 | Tape diagrams for the multiplicative schemas. `4 bags of 6` and `6 bags of 4` hold the same number and mean different things, and this is the only activity where that is the question. |

The fifth item, `zero-to-two`, turned out to be **already built**:
`mixed-number-line` is the 0–2 placement game, on ROAM's own `0_2` target list.
What was missing was WWC 2021 Rec 4's specific ask — 5/4 and 1¼ shown as the
*same point* — so that became a fourth item form inside the existing activity
rather than a new one. Every third round now marks a point on the line and asks
whether a second name belongs there.

### Two things these needed that did not exist

- **`doubleFrame()` and `tapeDiagram()`** in
  [`src/lib/widgets.js`](../../src/lib/widgets.js). The double frame is two
  frames with a gap rather than one twenty-cell grid, because the gap is what
  makes a teen read as ten and some more. `tenFrame`'s `cols` option was dead —
  the CSS hard-coded five columns — and now works.
- **A second board layout.** `.bstrip` is a single flex row, which is right up
  to about ten squares and wrong after that: measured on a phone, twenty squares
  gives a 17px tap target against a 24px minimum, and a hundred gives 3.8px
  inside a strip wider than the viewport. `.bgrid` is the matrix — rows emitted
  from the top decade down so 1 lands bottom-left. On paper the board is drawn
  **once** at the top of the sheet and the rest of the items are compact spin
  lines; a hundred squares beside every question fits two questions on a page.

---

## What a wave 6 would build

Nothing in the wave plan remains. The next content decision is a different one,
and the backlog answers it: **[item 1 — IM's lesson skeleton and its ten warm-up
routines](BACKLOG.md)**, which the research rates above another ten activities.
Two of the ten routines are nearly free, because the `truefalse` type and the
`flashMs` flash mechanic already exist.

If more activities *are* wanted, the two clearest remaining structural gaps:

- **A story strand at grades 2, 4 and 5.** Grade 3 got one in wave 3
  (`draw-the-story`). The same argument applies upward, and
  [`strands.js`](../../content/activities/strands.js) says why it has not been
  taken: an empty strand still prints in the grade-page subtitle, so the strand
  and the activity have to land together. Note that activities index the strand
  list *positionally* (`S[2]`), so a new strand must be **appended**, never
  slotted into year order.
- **Measurement division drawn honestly.** `draw-the-story` covers partitive
  division ("share 42 between 6") and deliberately skips the measurement form
  ("how many bags of 4 make 28?"), because an equal-box tape either gives the
  answer away in the box count or prints a diagram that is wrong. It needs a
  different figure — one box marked off against a long total — which
  `tapeDiagram` does not draw.

---

## Two known defects found while measuring this wave

- **The page-fill harness's 80%-full rule cannot fire.** `tools/pagefill.html`
  pins `#rig .sheet { min-height: 9.9in }`, so every page that fits measures
  exactly 9.90in and `hs[last] < MIN_LAST` is never true. Measured against real
  *content* height instead, the rule would fire on **43 of 49 activities** — the
  8.0in threshold was calibrated against the inflated number, and the shortest
  variant is always `plain` + `review`, which is the leanest of the sixteen a
  single `printItems` has to serve. The `OVER` and `WIDE` rules are unaffected
  and do work. Fixing this means re-tuning the catalogue or making the threshold
  per-variant; it is not a one-line change, and it is the reason the item counts
  in this wave were chosen from content measurements taken by hand.
- **`draw-the-story` stage 1 has no figure on paper, and the page is why.**
  Giving those items a blank tape to fill costs about 0.85in each, which takes
  the *grouped-practice* sheet to 11.73in of a 10.1in page — and practice mode
  turned out to ignore `printItems` below six, so trimming the count does not
  buy the space back. The stage-1 task is to name the structure, which is what
  it asks on screen too, and `printScratch` is where a child who wants to draw
  it does. Stages 2–4 all print their tape. Also worth knowing: those tape boxes
  are about 6mm tall, which is the small end of normal for grade 3.

  A general lesson for the next wave: **measure with the harness's own rig.**
  `tools/pagefill.html` measures the sheet with `padding: 0`, because the 10.1in
  limit is the usable height *inside* the print margins. A hand-built rig with
  `padding: .42in` on `.sheet` double-counts the margin and reads 0.84in tall,
  which is enough to make a sheet that fits look like one that does not.
