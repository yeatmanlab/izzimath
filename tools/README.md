# Browser test harnesses

Two pages that test things the Node checkers cannot, because they need a real
layout engine. They live here rather than in `dist/` because `build.mjs` wipes
`dist/` — which once deleted the audit page mid-session and made the report come
back clean having measured nothing at all. `build.mjs` copies this directory to
`dist/_tools/` after every build.

Both print `CHECKS_RUN=<n>` at the end. **If that marker is missing or zero, the
harness did not run and the result means nothing** — do not read an empty report
as a pass.

## Running them

```bash
node build.mjs
python3 -m http.server 8890 --directory dist
```

Then open, or drive headless:

- `http://localhost:8890/_tools/audit.html` — responsive audit. 23 pages ×
  5 widths (360, 390, 768, 1024, 1440). Flags unscrolled horizontal overflow,
  tap targets under 24px (inline links in prose are exempt, per WCAG 2.5.8),
  and body text under 11px.
- `http://localhost:8890/_tools/func.html` — problem type test. Every one of the
  nine types: renders, is interactive, its own stated answer verifies, it has a
  worked explanation, and it renders as both a print sheet and a key.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --disable-gpu --incognito --user-data-dir=/tmp/izzi-$RANDOM \
  --virtual-time-budget=150000 --window-size=1500,3000 \
  --dump-dom "http://localhost:8890/_tools/audit.html"
```
