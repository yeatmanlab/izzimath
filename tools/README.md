# Browser test harnesses

Three pages that test things the Node checkers cannot, because they need a real
layout engine. They live here rather than in `dist/` because `build.mjs` wipes
`dist/` — which once deleted the audit page mid-session and made the report come
back clean having measured nothing at all. `build.mjs` copies this directory to
`dist/_tools/` after a local build, and **skips it when `CI` is set**, so these
never reach the published site.

Both print `CHECKS_RUN=<n>` at the end. **If that marker is missing or zero, the
harness did not run and the result means nothing** — do not read an empty report
as a pass.

## `sweep.html` — every problem of every activity

The other harnesses test the renderers; this one tests the CONTENT. func.html
samples one problem per type and variant — about fourteen problems — which is
right for proving a renderer works and blind to one activity being broken at one
index. Both of the worst bugs in this codebase were exactly that shape:
`halves-and-quarters` printed a true/false question with 520 characters of SVG
silently dropped, and a deer avatar drew nothing because an ears primitive was
referenced as an extra. Every checker was green for both.

So this walks all of it — 561 problems across 45 activities — and for each one
asserts that it renders a control a child could use, that it is not blank, that
any figure it declares has real size on screen, and that both print forms are
free of holes. Then it answers one problem per activity through the real
interface: clicking the option, typing in the box, pressing submit.

It loads **both** stylesheets, in the order a real page does. `print.css` is not
media-gated — only its `@media print` block is — so `.tenframe`, `.arr` and
`.vstack` style the screen figures too. Without it a ten frame measures 320x0 and
the harness reports 34 phantom failures.

One check earns its place above the others: **the arithmetic oracle.** Where a
stem is a plain two-operand sum it is worked out here and compared to the stated
answer. Every other check in the build asks an activity to agree with itself —
feeding a problem its own answer back proves only that the checker is
self-consistent. This is the one that catches a generator that states the wrong
answer, and it covers 83 of the 561.

Known gaps, stated rather than implied: 55 items need pointer input
(numberline, tap, ordinal, boardmove) and are rendered but not answered, and the
oracle only reaches stems of the form `a op b =`.

## Running them

```bash
npm run serve
```

That builds first and then serves `dist/` on 8890. Build first or not at all —
serving a stale `dist/` means the harness measures the last build rather than
your change, and reports a clean pass for code it never loaded.

Then open, or drive headless:

- `http://localhost:8890/_tools/audit.html` — responsive audit. 29 pages ×
  5 widths (360, 390, 768, 1024, 1440). Flags unscrolled horizontal overflow,
  tap targets under 24px (inline links in prose are exempt, per WCAG 2.5.8),
  and body text under 11px.
- `http://localhost:8890/_tools/func.html` — problem type test **and the profile
  panel**. Every one of the nine types: renders, is interactive, its own stated
  answer verifies, it has a worked explanation, and it renders as both a print
  sheet and a key.

  The profile half drives a **real page in an iframe** rather than importing the
  module, because what matters is the thing a child touches: the header button,
  the dialog it opens, and the keyboard. The panel is client-rendered, so
  `scripts/a11y.mjs` never sees it — this is the only automated cover it has. It
  checks `role`/`aria-modal`/label, that focus enters the dialog and returns to
  the trigger on close, that Tab and Shift-Tab wrap at the ends, that all 150
  faces are present and labelled, that tap targets clear 24px, that a wrong
  secret snack is rejected, and that nothing is written while signed out.

  Two of those assertions were written badly the first time and passed while the
  behaviour was broken. If you add one here, **break the thing on purpose and
  confirm it fails** before trusting it — a synthetic `Tab` event does not move
  focus, so asserting on where focus ended up proves nothing; assert on
  `defaultPrevented` instead.
- `http://localhost:8890/_tools/pagefill.html` — print page fill. 1,312 cases:
  every activity × every character × plain/designed × practice/review ×
  sheet/key. Fails a sheet that is taller than one page of US Letter, wider than
  the page, or whose last page is under 80% full — a sheet is allowed to be two
  pages, but never a page and a bit.

  This one exists because the sheets spilled onto second and third pages for a
  long time while the site claimed every sheet was one full page. Heights were
  being judged from the on-screen preview, which has a CSS `zoom` on it, so
  nothing looked wrong. Only measuring at print geometry catches it.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --disable-gpu --incognito --user-data-dir=/tmp/izzi-$RANDOM \
  --virtual-time-budget=150000 --window-size=1500,3000 \
  --dump-dom "http://localhost:8890/_tools/audit.html"
```
