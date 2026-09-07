// Math manipulatives as pure functions returning SVG/HTML strings.
// Every one has a `print` variant that is stroke-only (no fills) so a home inkjet
// isn't asked to lay down solid ink. Used by both the build and the browser.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------------- ten-frame (subitizing, number bonds to 10) ---------------- */
export function tenFrame(filled, { print = false, cols = 5, total = 10, bare = false } = {}) {
  const cells = [];
  for (let i = 0; i < total; i++) cells.push(`<i class="${i < filled ? 'f' : ''}"></i>`);
  // `bare` drops the role and label so the frame can sit inside a figure that
  // describes itself — two nested role="img" elements read as two figures.
  const label = bare ? '' : ` role="img" aria-label="ten frame showing ${filled}"`;
  return `<div class="tenframe${print ? '' : ' screen'}"${label} style="--cols:${cols}">${cells.join('')}</div>`;
}

/* ---------------- double ten-frame (teens as ten and some more) ----------------
   The standard model for the teens: the first frame FILLS, so the child reads
   the second one only. That is the whole point, and it is why this is two
   frames with a gap rather than one twenty-cell grid — a 5x4 block invites
   counting all twenty. */
export function doubleFrame(n, { print = false } = {}) {
  const a = Math.min(10, n), b = Math.max(0, n - 10);
  return `<div class="dframe" role="img" aria-label="two ten frames showing ${n} dots altogether">${
    tenFrame(a, { print, bare: true })}${tenFrame(b, { print, bare: true })}</div>`;
}

/* ---------------- number line ----------------
   Used for: MagPI number line estimation (0-20, 0-100, 0-1, 0-2), fraction
   placement, and skip counting. */
export function numberLine({
  lo = 0, hi = 100, ticks = null, majors = null, labels = null,
  marker = null, markerLabel = null, width = 640, print = false, height = null,
} = {}) {
  const H = height ?? (print ? 62 : 108);
  const padX = 34;
  const y = print ? 26 : 52;
  const W = width;
  const x = (v) => padX + ((v - lo) / (hi - lo)) * (W - padX * 2);

  const tickList = ticks ?? [];
  const majorList = majors ?? [lo, hi];
  const labelList = labels ?? [[lo, String(lo)], [hi, String(hi)]];

  const stroke = print ? '#111' : 'var(--txt3)';
  const axis = print ? '#111' : 'var(--line2)';
  const txt = print ? '#333' : 'var(--txt2)';

  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="number line from ${lo} to ${hi}${marker != null ? `, marker at ${markerLabel ?? marker}` : ''}">`;
  s += `<line x1="${padX}" y1="${y}" x2="${W - padX}" y2="${y}" stroke="${axis}" stroke-width="${print ? 2 : 3}" stroke-linecap="round"/>`;
  for (const t of tickList) s += `<line x1="${x(t).toFixed(2)}" y1="${y - 5}" x2="${x(t).toFixed(2)}" y2="${y + 5}" stroke="${stroke}" stroke-width="1.5"/>`;
  for (const t of majorList) s += `<line x1="${x(t).toFixed(2)}" y1="${y - 9}" x2="${x(t).toFixed(2)}" y2="${y + 9}" stroke="${stroke}" stroke-width="2.2"/>`;
  for (const [v, lab] of labelList) s += `<text x="${x(v).toFixed(2)}" y="${y + (print ? 22 : 30)}" text-anchor="middle" font-size="${print ? 11 : 14}" fill="${txt}" font-family="'Space Grotesk',sans-serif">${esc(lab)}</text>`;
  if (marker != null) {
    const mx = x(marker).toFixed(2);
    if (print) {
      s += `<path d="M${mx} ${y - 16} l5 -9 h-10 z" fill="#111"/>`;
    } else {
      s += `<line x1="${mx}" y1="${y - 22}" x2="${mx}" y2="${y + 22}" stroke="var(--a1)" stroke-width="2.5"/>`;
      s += `<circle cx="${mx}" cy="${y}" r="11" fill="var(--a2)" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>`;
    }
    if (markerLabel != null) s += `<text x="${mx}" y="${y - (print ? 20 : 30)}" text-anchor="middle" font-size="${print ? 12 : 16}" font-weight="700" fill="${print ? '#111' : 'var(--txt)'}" font-family="'Space Grotesk',sans-serif">${esc(markerLabel)}</text>`;
  }
  s += `</svg>`;
  return s;
}

/* evenly spaced tick values, inclusive */
/* Split a pool into three difficulty bands and return the one this level should
   draw from. Thirds of the pool sorted by a difficulty measure, rather than
   hand-picked thresholds: fixed cut-offs left mixed-number-line's easiest band
   with two members, so a held ladder rung still repeated itself. Thirds are
   self-balancing for any pool.

   The BAND comes from the level so the ladder still means something; the PICK
   within it comes from the rng, so holding a rung varies the question. */
export function band3(pool, difficulty, level) {
  const sorted = pool.slice().sort((a, b) => difficulty(a) - difficulty(b));
  const n = Math.max(1, Math.ceil(sorted.length / 3));
  const which = level <= 3 ? 0 : level <= 7 ? 1 : 2;
  const band = sorted.slice(which * n, which * n + n);
  return band.length ? band : sorted;
}

export function tickRange(lo, hi, step) {
  const out = [];
  for (let v = lo; v <= hi + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}

/* ---------------- array / area model (multiplication) ----------------
   `fit` sets the LONGEST side, and the cell size is derived from it. Without
   that, a 2x1 array and a 9x9 array have wildly different aspect ratios, and
   stretching either to a fixed container width makes one of them hundreds of
   pixels tall — which is what pushed the answer box off the screen. */
export function array2d(rows, cols, { print = false, cell = 17, gap = 2, shadeRows = 0, shadeCols = 0, fit = null } = {}) {
  if (fit) cell = Math.max(6, Math.floor(fit / Math.max(rows, cols)) - gap);
  const W = cols * (cell + gap), H = rows * (cell + gap);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${rows} by ${cols} array">`;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const shaded = (shadeRows && r < shadeRows) || (shadeCols && c < shadeCols);
      const fill = print ? 'none' : (shaded ? 'var(--a2)' : 'rgba(255,255,255,.07)');
      const stroke = print ? '#111' : 'var(--line2)';
      s += `<rect x="${c * (cell + gap)}" y="${r * (cell + gap)}" width="${cell}" height="${cell}" rx="2.5" fill="${fill}" stroke="${stroke}" stroke-width="${print ? 1.2 : 1}"/>`;
      if (print && shaded) s += `<line x1="${c * (cell + gap)}" y1="${r * (cell + gap)}" x2="${c * (cell + gap) + cell}" y2="${r * (cell + gap) + cell}" stroke="#111" stroke-width="1"/>`;
    }
  }
  return s + `</svg>`;
}

/* ---------------- fraction bar ---------------- */
export function fractionBar(num, den, { print = false, width = 300, height = 40, label = true } = {}) {
  const seg = width / den;
  let s = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="${num} of ${den} shaded">`;
  for (let i = 0; i < den; i++) {
    const on = i < num;
    const fill = print ? 'none' : (on ? 'var(--a2)' : 'rgba(255,255,255,.05)');
    s += `<rect x="${(i * seg).toFixed(2)}" y="0" width="${seg.toFixed(2)}" height="${height}" fill="${fill}" stroke="${print ? '#111' : 'var(--line2)'}" stroke-width="${print ? 1.5 : 1}"/>`;
    if (print && on) {
      // hatching instead of a solid fill — readable, and cheap in ink
      for (let h = -height; h < seg; h += 5) {
        s += `<line x1="${(i * seg + h).toFixed(2)}" y1="${height}" x2="${(i * seg + h + height).toFixed(2)}" y2="0" stroke="#111" stroke-width=".9" clip-path="inset(0)"/>`;
      }
    }
  }
  s += `<rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="${print ? '#111' : 'var(--line2)'}" stroke-width="${print ? 2 : 1.5}"/>`;
  return s + `</svg>`;
}

/* ---------------- tape diagram (the shape of a story) ----------------
   IM's workhorse representation, and the one thing that makes a multiplicative
   story visible: equal groups become equal boxes, and the unknown is whichever
   label is a question mark. `cells` are the box labels; `total` draws a brace
   under the whole. Stroke-only in both modes — a tape diagram is a diagram, not
   a chart, so there is nothing to shade. */
export function tapeDiagram(cells, { print = false, total = null, width = 320, height = 36 } = {}) {
  const stroke = print ? '#111' : 'var(--line2)';
  const tc = print ? '#111' : 'var(--txt)';
  const n = Math.max(1, cells.length);
  const seg = width / n;
  // Print labels are sized against the VIEWBOX, and a 250-unit tape lands in a
  // 1.6in column — so 11 becomes about 7px of actual ink, which is why the
  // brace's "?" was invisible on paper. Sized up so it survives the scale.
  const braceH = total == null ? 0 : (print ? 26 : 26);
  const H = height + braceH;
  const words = cells.map((c) => (c === '' ? 'an empty box' : `a box holding ${c}`)).join(', ');
  let s = `<svg viewBox="0 0 ${width} ${H}" width="100%" height="${H}" role="img" aria-label="tape diagram: ${
    esc(words)}${total == null ? '' : `, ${esc(String(total))} altogether`}">`;
  cells.forEach((c, i) => {
    s += `<rect x="${(i * seg).toFixed(2)}" y="0" width="${seg.toFixed(2)}" height="${height}" fill="none" stroke="${stroke}" stroke-width="${print ? 1.4 : 1.5}"/>`;
    if (c !== '') s += `<text x="${(i * seg + seg / 2).toFixed(2)}" y="${(height / 2 + (print ? 5 : 5)).toFixed(1)}" text-anchor="middle" font-size="${print ? 15 : 15}" font-weight="700" fill="${tc}" font-family="'Space Grotesk',sans-serif">${esc(String(c))}</text>`;
  });
  s += `<rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="${stroke}" stroke-width="${print ? 2 : 2}"/>`;
  if (total != null) {
    const y = height + (print ? 5 : 7);
    s += `<path d="M1,${y} v5 M1,${y + 2.5} H${width - 1} M${width - 1},${y} v5" fill="none" stroke="${stroke}" stroke-width="1.2"/>`;
    s += `<text x="${width / 2}" y="${y + (print ? 20 : 20)}" text-anchor="middle" font-size="${print ? 17 : 14}" font-weight="700" fill="${tc}" font-family="'Space Grotesk',sans-serif">${esc(String(total))}</text>`;
  }
  return s + '</svg>';
}

/* ---------------- base-ten blocks (place value) ---------------- */
/* Hundreds WRAP, and that is the whole reason this takes a perRow.
   Nine flats in one line is 684 units against a 300px figure, so the caller
   capped the count instead — `baseTen(h > 3 ? 1 : h, ...)` drew one flat for
   nine hundreds, and a child reading 1 hundred 0 tens 3 ones typed 103 against
   an answer of 903 and was told they were wrong. A figure may be small; it may
   not be false. So the flats stack in rows and the whole number is drawn. */
export function baseTen(hundreds, tens, ones, { print = false, scale = 1, perRow = 5 } = {}) {
  const u = 7 * scale, gap = 3 * scale;
  const stroke = print ? '#111' : 'var(--line2)';
  const fill = print ? 'none' : 'rgba(255,255,255,.07)';
  const flat = u * 10, rowH = flat + gap * 2;
  const parts = [];
  const hRows = Math.max(1, Math.ceil(hundreds / perRow));
  for (let i = 0; i < hundreds; i++) {
    const gx = (i % perRow) * (flat + gap * 2);
    const gy = Math.floor(i / perRow) * rowH;
    let g = `<g transform="translate(${gx},${gy})">`;
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++)
      g += `<rect x="${c * u}" y="${r * u}" width="${u}" height="${u}" fill="${fill}" stroke="${stroke}" stroke-width=".5"/>`;
    g += `<rect x="0" y="0" width="${flat}" height="${flat}" fill="none" stroke="${stroke}" stroke-width="1.6"/></g>`;
    parts.push(g);
  }
  // Tens and ones sit on the LAST row of flats, so the figure reads left to
  // right in place order however many hundreds there are.
  const baseY = hundreds ? (hRows - 1) * rowH : 0;
  let x = hundreds ? (Math.min(hundreds, perRow) === perRow && hundreds % perRow === 0
    ? perRow * (flat + gap * 2)
    : (hundreds % perRow || perRow) * (flat + gap * 2)) : 0;
  for (let i = 0; i < tens; i++) {
    let g = `<g transform="translate(${x},${baseY})">`;
    for (let r = 0; r < 10; r++) g += `<rect x="0" y="${r * u}" width="${u}" height="${u}" fill="${fill}" stroke="${stroke}" stroke-width=".5"/>`;
    g += `<rect x="0" y="0" width="${u}" height="${flat}" fill="none" stroke="${stroke}" stroke-width="1.6"/></g>`;
    parts.push(g); x += u + gap;
  }
  x += gap * 2;
  for (let i = 0; i < ones; i++) {
    parts.push(`<rect x="${x}" y="${baseY + flat - u}" width="${u}" height="${u}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`);
    x += u + gap;
  }
  const W = Math.max(x, Math.min(hundreds, perRow) * (flat + gap * 2), flat);
  const H = baseY + flat;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${Math.min(H, 150)}" role="img" aria-label="${hundreds} hundreds ${tens} tens ${ones} ones">${parts.join('')}</svg>`;
}

/* ---------------- dot pattern (subitizing) ---------------- */
export function dots(n, { print = false, layout = 'dice', size = 118 } = {}) {
  const P = {
    1: [[.5, .5]], 2: [[.28, .28], [.72, .72]], 3: [[.25, .25], [.5, .5], [.75, .75]],
    4: [[.28, .28], [.72, .28], [.28, .72], [.72, .72]],
    5: [[.26, .26], [.74, .26], [.5, .5], [.26, .74], [.74, .74]],
    6: [[.28, .22], [.72, .22], [.28, .5], [.72, .5], [.28, .78], [.72, .78]],
  };
  let pts = P[n];
  if (!pts || layout === 'random') {
    pts = [];
    const cols = Math.ceil(Math.sqrt(n));
    for (let i = 0; i < n; i++) pts.push([(0.16 + (i % cols) * 0.68 / Math.max(1, cols - 1) || 0.5), 0.16 + Math.floor(i / cols) * 0.68 / Math.max(1, Math.ceil(n / cols) - 1 || 1)]);
  }
  const r = size * 0.085;
  const body = pts.map(([px, py]) =>
    print
      ? `<circle cx="${(px * size).toFixed(1)}" cy="${(py * size).toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="#111" stroke-width="1.8"/>`
      : `<circle cx="${(px * size).toFixed(1)}" cy="${(py * size).toFixed(1)}" r="${r.toFixed(1)}" fill="var(--a1)"/>`
  ).join('');
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${n} dots">
<rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="10" fill="none" stroke="${print ? '#111' : 'var(--line2)'}" stroke-width="${print ? 1.6 : 1.2}"/>${body}</svg>`;
}

/* ---------------- number bond (fact families) ---------------- */
export function numberBond(whole, a, b, { print = false, blank = null, size = 210 } = {}) {
  const stroke = print ? '#111' : 'var(--line2)';
  const fill = print ? 'none' : 'rgba(255,255,255,.06)';
  const tc = print ? '#111' : 'var(--txt)';
  const show = (v, which) => (blank === which ? '' : String(v));
  return `<svg viewBox="0 0 ${size} 150" width="100%" height="150" role="img" aria-label="number bond ${a} and ${b} make ${whole}">
<line x1="${size / 2}" y1="52" x2="${size * 0.26}" y2="98" stroke="${stroke}" stroke-width="2"/>
<line x1="${size / 2}" y1="52" x2="${size * 0.74}" y2="98" stroke="${stroke}" stroke-width="2"/>
<circle cx="${size / 2}" cy="34" r="26" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/>
<circle cx="${size * 0.26}" cy="114" r="24" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/>
<circle cx="${size * 0.74}" cy="114" r="24" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/>
<text x="${size / 2}" y="43" text-anchor="middle" font-size="24" font-weight="700" fill="${tc}" font-family="'Space Grotesk',sans-serif">${show(whole, 'whole')}</text>
<text x="${size * 0.26}" y="123" text-anchor="middle" font-size="22" font-weight="700" fill="${tc}" font-family="'Space Grotesk',sans-serif">${show(a, 'a')}</text>
<text x="${size * 0.74}" y="123" text-anchor="middle" font-size="22" font-weight="700" fill="${tc}" font-family="'Space Grotesk',sans-serif">${show(b, 'b')}</text>
</svg>`;
}

/* ---------------- bar chart (measurement and data strands) ---------------- */
/* ------------------------------------------------------------------ decoys
   Four options that are genuinely four.

   Five activities across three grades built their distractors as a fixed list,
   deduped it, and then took three — so whenever two of the expressions happened
   to agree, the question shipped with three options instead of four. It was
   never rare: 50 of 125 instances for make-ten-race, 30 of 300 for
   double-frame-flash, a quarter of Clocks and Time's and of
   fraction-number-line's. Every existing check passed, because the answer was
   right and the distractors that survived were distinct. It took a screenshot
   of a live page to notice, and `scripts/check.mjs` now fails on an option count
   that wobbles between instances of the same question.

   This walks the candidates IN ORDER and takes the first n that are new, so a
   collision costs a later candidate rather than an option. Order them
   most-instructive-first: the near miss a child would actually make belongs
   ahead of the filler that only exists to keep the count up. */
export function pickDecoys(right, candidates, n = 3) {
  const seen = new Set([String(right)]);
  const out = [];
  for (const c of candidates) {
    if (c === null || c === undefined) continue;
    const k = String(c);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
    if (out.length === n) break;
  }
  return out;
}

/* -------------------------------------------------------------------- money
   THE RELATIVE SIZES ARE REAL, AND THAT IS NOT DECORATION. The single most
   reported misconception in early money work is that a bigger coin is worth
   more — and the dime is the smallest of the four while being worth more than
   the penny and the nickel. Drawing them at equal size, or worse in value
   order, would teach the error the activity exists to correct. Diameters are
   the actual US mint figures in millimetres, scaled against the quarter:
     dime 17.91  <  penny 19.05  <  nickel 21.21  <  quarter 24.26
   The recommended fix is showing the equivalence physically, which is what
   `coinRow` with `pennies` does: five pennies laid beside one nickel.

   Print gets outlines only. The `plain` print style is black hairlines on white
   with no tints at all, so a filled copper disc is not available there — the
   coin is a ring with its value inside, which is also cheaper to print than a
   flood fill would be. */
export const COINS = {
  penny:   { value: 1,  d: 19.05, name: 'penny',   plural: 'pennies', silver: false },
  nickel:  { value: 5,  d: 21.21, name: 'nickel',  plural: 'nickels', silver: true },
  dime:    { value: 10, d: 17.91, name: 'dime',    plural: 'dimes',   silver: true },
  quarter: { value: 25, d: 24.26, name: 'quarter', plural: 'quarters', silver: true },
};
export const COIN_KINDS = ['penny', 'nickel', 'dime', 'quarter'];

/* Cents as a child writes them, and the two notations are not
   interchangeable: 2.MD.C.8 asks for $ and ¢ used APPROPRIATELY, which means
   cents under a dollar take ¢ and anything with a dollar in it takes $ with two
   decimal places. Getting this wrong in the copy would teach the error. */
export function money(cents) {
  if (cents < 100) return `${cents}\u00a2`;
  return `$${(cents / 100).toFixed(2)}`;
}

/* The label names SIZE and COLOUR and the value written on the face — never the
   coin's name, because on a "which one is the dime" item the name is the
   answer. Knowing that the small silver 10-cent coin is called a dime is the
   thing being learnt, so the label has to stop short of it. */
/* Adjectives that read after "a". "a smallest silver coin" was the first
   attempt and is not English; these still carry the ordering, which is the
   information the child needs. */
const sizeWord = (kind) => ({ dime: 'very small', penny: 'small', nickel: 'medium-sized', quarter: 'large' }[kind]);

export function coin(kind, { print = false, size = 54, showValue = true } = {}) {
  const c = COINS[kind];
  if (!c) throw new Error(`coin: no such coin "${kind}"`);
  const px = (c.d / COINS.quarter.d) * size;
  const ink = print ? '#111' : (c.silver ? '#C6CEDA' : '#D08A5A');
  const face = print ? 'none' : (c.silver ? 'rgba(198,206,218,.16)' : 'rgba(208,138,90,.18)');
  const label = `a ${sizeWord(kind)} ${c.silver ? 'silver' : 'copper'} coin${
    showValue ? ` with ${c.value} ${c.value === 1 ? 'cent' : 'cents'} written on it` : ''}`;
  return `<svg viewBox="0 0 ${size} ${size}" width="${px.toFixed(1)}" height="${px.toFixed(1)}"
    role="img" aria-label="${label}" style="vertical-align:middle">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${face}" stroke="${ink}" stroke-width="2.4"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 6}" fill="none" stroke="${ink}" stroke-width="0.9" opacity=".7"/>
    ${showValue ? `<text x="${size / 2}" y="${size / 2 + 6}" text-anchor="middle" font-size="17"
      font-weight="700" fill="${print ? '#111' : ink}">${c.value}\u00a2</text>` : ''}
  </svg>`;
}

/* A handful of coins, drawn biggest-first because sort-then-count from the
   highest value is the strategy every source recommends — the picture should
   model the method rather than fight it. */
export function coinRow(kinds, { print = false, size = 54, showValue = true } = {}) {
  const order = [...kinds].sort((a, b) => COINS[b].value - COINS[a].value);
  const total = order.reduce((n, k) => n + COINS[k].value, 0);
  const said = COIN_KINDS.filter((k) => order.includes(k))
    .map((k) => { const n = order.filter((o) => o === k).length; return `${n} ${n === 1 ? COINS[k].name : COINS[k].plural}`; })
    .reverse().join(', ');
  /* A SPAN, not a div. The prompt is rendered inside a <p>, and a block element
     nested in a paragraph gets hoisted out by the HTML parser — the coins
     vanished from the screen entirely while every check stayed green, which is
     the same silent-figure-loss defect halves-and-quarters had when 520
     characters of SVG were dropped. inline-flex keeps the layout identical. */
  return `<span class="coinrow" role="img" aria-label="${said}" style="display:inline-flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;vertical-align:middle">${
    order.map((k) => coin(k, { print, size, showValue })).join('')}</span>`;
}

export const coinsValue = (kinds) => kinds.reduce((n, k) => n + (COINS[k]?.value ?? 0), 0);

/* Options laid out for PAPER. printProblem never renders an activity's options
   — a choice item prints as a blank box unless the options are written into the
   stem — so a picture-choice item has to supply its own. Lettered A to D, which
   is what a workbook does and what lets the answer key name one.

   The letters label the pictures on paper so a child has something to circle.
   The KEY states the answer itself — "half past 4", not "B" — because the
   letter depends on the shuffle, and an answer key that names a position rather
   than a fact reads as two different answers to the same question. The
   ambiguity check in scripts/check.mjs failed on exactly that when the key
   carried the letter. */
/* The lettered row of figures a `pick` item prints as.
   THE LAYOUT IS A CLASS, NOT INLINE STYLE, and that is deliberate. It began as
   an inline flex row with `flex-wrap: wrap`, which meant print.css could not
   reach it: four 54px clock faces are 258px wide and a column of a
   three-column sheet is 230px, so every such row silently wrapped to two lines
   and ONE item cost two grid rows. That is what held `time-to-five-minutes` to
   two items a sheet and `clocks-and-time` to five.
   With the layout in print.css the row cannot wrap and the options shrink to
   the column instead — see the `.pkrow` rules there. Every call site today is
   print-only; a screen use would need matching rules in site.css, because
   print.css is not loaded on an activity page. */
export function pickRow(options, { print = false } = {}) {
  const letters = 'ABCD'.split('');
  return `<div class="pkrow"${print ? '' : ' data-screen="1"'}>${
    options.map((o, i) => `<div class="pkopt">${o.figure}<div class="pklbl">${letters[i]}</div></div>`).join('')}</div>`;
}

/* ------------------------------------------------------------------- clocks
   Extracted from grade-1's clocks-and-rulers, which drew its own inline and
   could only show o'clock and half past. A dedicated time module needs any
   minute, minute ticks, and a digital face to pair with the analog one —
   research is consistent that showing both together is what builds the
   association.

   THE LABEL DESCRIBES THE HANDS, NOT THE TIME, and that is the whole point.
   The old label said "clock showing 3:30", which handed a screen-reader user
   the answer on every read-the-clock item; its own comment admitted this and
   called it an accepted trade. The invariant in CLAUDE.md now says a figure
   states its attributes and never its conclusion, and here the attributes are
   also the pedagogy: the misconception that matters is reading 2:30 as "half
   past three" because the SHORT HAND SITS BETWEEN 2 AND 3 and looks nearer the
   3. A label that says where the hands point makes the item answerable without
   answering it, and names the thing the child has to notice. */
const clockPt = (deg, len) => [
  50 + len * Math.sin(deg * Math.PI / 180),
  50 - len * Math.cos(deg * Math.PI / 180),
];

/* Where the short hand really is, in words. "between 2 and 3" is the fact the
   child must read; "at 3" would be the mistake they are prone to. */
function handWords(h, m) {
  const h12 = ((h + 11) % 12) + 1;            // 0 and 12 both read as 12
  const next = h12 === 12 ? 1 : h12 + 1;
  const short = m === 0 ? `pointing at ${h12}`
    : `between ${h12} and ${next}${m === 30 ? ', halfway' : ''}`;
  const long = m === 0 ? 'pointing straight up at 12'
    : m === 30 ? 'pointing straight down at 6'
      : m === 15 ? 'pointing straight right at 3'
        : m === 45 ? 'pointing straight left at 9'
          : `pointing at the ${m / 5} mark past 12`;
  return `the short hand ${short}, the long hand ${long}`;
}

export function clockFace(h, m = 0, { print = false, size = 112, numerals = true, ticks = true } = {}) {
  const ink = print ? '#111' : 'var(--a1)';
  /* TWO GREYS, because the numerals are content and the ticks are not. A child
     is asked "the long hand is pointing at the 7" — reading the dial IS the
     task — so the numerals have to clear 4.5:1, and --txt3 is 3.63:1 against
     the panel at the 10px they are set in. --txt2 is 7.8:1. The five-minute
     ticks stay on --txt3, which clears the 3:1 that a meaningful graphic needs
     and keeps the dial from reading as a grey ring.
     Neither the a11y checker nor the responsive audit could have caught this:
     one reads built HTML and the other only measures `p, li, td, span, small`,
     and this is an SVG <text>. */
  const faint = print ? '#555' : 'var(--txt3)';
  const numInk = print ? '#333' : 'var(--txt2)';
  const hAng = ((h % 12) * 30) + (m / 60) * 30;    // the hour hand CREEPS, which is the misconception
  const mAng = (m / 60) * 360;
  const [hx, hy] = clockPt(hAng, 24);
  const [mx, my] = clockPt(mAng, 34);
  let t = `<svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img"
    aria-label="clock with ${handWords(h, m)}">
    <circle cx="50" cy="50" r="45" fill="none" stroke="${ink}" stroke-width="3"/>`;
  if (ticks) {
    /* Sixty ticks would be a grey ring at this size, so the five-minute marks
       are long and the rest are short — which is also how a real clock helps a
       child count in fives. */
    for (let k = 0; k < 60; k++) {
      const big = k % 5 === 0;
      if (!big && !numerals) continue;
      const [x1, y1] = clockPt(k * 6, big ? 38 : 41), [x2, y2] = clockPt(k * 6, 43);
      t += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${faint}" stroke-width="${big ? 2 : 0.8}"/>`;
    }
  }
  if (numerals) {
    for (let k = 1; k <= 12; k++) {
      const [x, y] = clockPt(k * 30, 31);
      t += `<text x="${x.toFixed(1)}" y="${(y + 3.4).toFixed(1)}" text-anchor="middle"
        font-size="10" font-weight="600" fill="${numInk}">${k}</text>`;
    }
  }
  // short hand thick and short, long hand thin and long: the only cue that says which is which
  t += `<line x1="50" y1="50" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="${ink}" stroke-width="4.6" stroke-linecap="round"/>`;
  t += `<line x1="50" y1="50" x2="${mx.toFixed(1)}" y2="${my.toFixed(1)}" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;
  return t + `<circle cx="50" cy="50" r="3" fill="${ink}"/></svg>`;
}

/* The digital face, shown beside the analog one. Same label rule: it reads the
   digits out, because on a digital clock the digits ARE the attributes — there
   is no hand position to describe and nothing to misread. */
export function clockDigital(h, m = 0, { print = false, size = 112 } = {}) {
  const ink = print ? '#111' : 'var(--a1)';
  const h12 = ((h + 11) % 12) + 1;
  const text = `${h12}:${String(m).padStart(2, '0')}`;
  return `<svg viewBox="0 0 100 52" width="${size}" height="${(size * 0.52).toFixed(0)}" role="img"
    aria-label="digital clock reading ${text}">
    <rect x="2" y="2" width="96" height="48" rx="7" fill="none" stroke="${ink}" stroke-width="3"/>
    <text x="50" y="36" text-anchor="middle" font-size="27" font-weight="700"
      font-family="ui-monospace, monospace" fill="${ink}">${text}</text></svg>`;
}

/* Add minutes to a time and wrap at 12, so a word problem can say "two hours
   later" without the caller doing clock arithmetic and getting 13 o'clock. */
export function addMinutes(h, m, delta) {
  const total = (((h % 12) * 60 + m + delta) % 720 + 720) % 720;
  const hh = Math.floor(total / 60);
  return { h: hh === 0 ? 12 : hh, m: total % 60 };
}

export const timeWords = (h, m) => {
  const h12 = ((h + 11) % 12) + 1;
  if (m === 0) return `${h12} o'clock`;
  if (m === 30) return `half past ${h12}`;
  if (m === 15) return `quarter past ${h12}`;
  return `${h12}:${String(m).padStart(2, '0')}`;
};

export function barChart(bars, { print = false, max = null, step = 1, width = 300, height = 150 } = {}) {
  const top = max ?? Math.max(...bars.map((b) => b.v)) + step;
  const padL = 30, padB = 22, bw = (width - padL - 8) / bars.length;
  const st = print ? '#111' : 'var(--line2)';
  const tc = print ? '#333' : 'var(--txt2)';
  const y = (v) => height - padB - (v / top) * (height - padB - 8);
  /* The label carries the DATA. "bar chart" told a screen reader nothing, and
     it left the numbers in the figure unreadable by anything — including the
     checker, which is how "Which day had the most?" shipped with two bars at
     nine and one of them marked wrong. */
  const said = bars.map((b) => `${b.label} ${b.v}`).join(', ');
  let out = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="bar chart: ${esc(said)}">`;
  // gridlines at each step, so a value can be read off rather than guessed
  for (let v = 0; v <= top; v += step) {
    out += `<line x1="${padL}" y1="${y(v).toFixed(1)}" x2="${width - 4}" y2="${y(v).toFixed(1)}" stroke="${print ? '#bbb' : 'rgba(255,255,255,.10)'}" stroke-width="1"/>`;
    out += `<text x="${padL - 5}" y="${(y(v) + 3.5).toFixed(1)}" text-anchor="end" font-size="9" fill="${tc}" font-family="'Space Grotesk',sans-serif">${v}</text>`;
  }
  bars.forEach((b, k) => {
    const x = padL + k * bw + bw * 0.18, w = bw * 0.64;
    const fill = print ? 'none' : 'var(--a2)';
    out += `<rect x="${x.toFixed(1)}" y="${y(b.v).toFixed(1)}" width="${w.toFixed(1)}" height="${(height - padB - y(b.v)).toFixed(1)}" fill="${fill}" stroke="${print ? '#111' : 'none'}" stroke-width="1.6"/>`;
    out += `<text x="${(x + w / 2).toFixed(1)}" y="${height - padB + 12}" text-anchor="middle" font-size="9" fill="${tc}" font-family="'Space Grotesk',sans-serif">${esc(b.label)}</text>`;
  });
  out += `<line x1="${padL}" y1="${height - padB}" x2="${width - 4}" y2="${height - padB}" stroke="${st}" stroke-width="2"/>`;
  out += `<line x1="${padL}" y1="8" x2="${padL}" y2="${height - padB}" stroke="${st}" stroke-width="2"/>`;
  return out + `</svg>`;
}

export { esc };
