# 3. Print craft

Medium effort, well-specified, low risk. Partially done.

## Already done in v1

- Every sheet is **one full page** of US Letter. Item counts were measured in a
  browser rather than guessed — a calibration pass found the largest count that
  fits 10in per activity, and fills land between 78% and 100%.
- **Two styles:** `designed` (header, character line art, tapered accent,
  rounded problem boxes, numbered badges, answer boxes, self-check strip) and
  `plain` (hairlines only, least possible ink).
- **Two modes:** grouped `practice`, and interleaved `review` at exactly eight
  items — Rohrer's literal template.
- Answer boxes rather than underlines. Answer key on a separate page.
- Figures drawn, not described. Every figure constrained by height, because an
  SVG at `width:100%` with a tall viewBox rendered several inches tall and was
  what made sheets run to three pages.
- No duplicate problems within a sheet.

## Not done

### Primary ruling for K–1 handwriting

Children forming digits need a midline to form them against, not a plain box.
The spec gives measured values:

| Grade | Line height | Midline |
| --- | --- | --- |
| K | 3/4 in | dashed |
| 1 | 5/8 in | dashed |
| 2–3 | 1/2 in | dashed |

There is a `.ruled` class in `src/styles/print.css` with a dashed midline
already, used only at `d1` density. It needs the per-grade heights and it needs
actually attaching to the problem types where a child writes a numeral.

### Sprint sheets, opt-in, grades 3–5

44 items in two columns of 22, 12–14pt, 0.33in row pitch, two 60-second halves.

**If you build this, print the header line Great Minds uses on their own
Sprints: "You are not expected to finish. Do your personal best."** They
explicitly discourage grading them. A 44-item timed page without that framing is
exactly the thing the anxiety critique is actually about.

### Generator parameter controls

Currently a family gets whatever the activity generates. The spec suggests
exposing the parameters that actually matter (number range, operation, item
count, work space) progressively — the Math-Drills and homeschoolmath model.
Fits the seeded architecture cleanly; the parameters would live in the URL
alongside the seed.

### Accessibility variants

Two that nobody in this category does well: a **large-print** variant, and a
**dyslexia-friendly** variant (larger type, more leading, more space around
headings). Both are layout switches on an existing sheet, not new content.

### Print geometry, fixed once

The spec wants page geometry set once and never scaled — three density presets
derived from measured production sheets rather than chosen by taste. v1's
densities are `d1`–`d4` chosen by grade and then calibrated empirically, which
is close but not the same thing. See `../SPEC.md` section 4.3 for the measured
table.

## Acceptance

- K–1 sheets use primary ruling wherever a numeral is written
- Sprint sheets carry the "not expected to finish" line, and are opt-in only
- Large-print and dyslexia variants are one switch, not a separate renderer
- Hard ceiling of 12 items on any K–1 sheet, regardless of preset
- Still line art only, still one page, still no duplicates
