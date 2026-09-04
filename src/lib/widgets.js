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
export function baseTen(hundreds, tens, ones, { print = false, scale = 1 } = {}) {
  const u = 7 * scale, gap = 3 * scale;
  const stroke = print ? '#111' : 'var(--line2)';
  const fill = print ? 'none' : 'rgba(255,255,255,.07)';
  const parts = [];
  let x = 0;
  for (let i = 0; i < hundreds; i++) {
    let g = `<g transform="translate(${x},0)">`;
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++)
      g += `<rect x="${c * u}" y="${r * u}" width="${u}" height="${u}" fill="${fill}" stroke="${stroke}" stroke-width=".5"/>`;
    g += `<rect x="0" y="0" width="${u * 10}" height="${u * 10}" fill="none" stroke="${stroke}" stroke-width="1.6"/></g>`;
    parts.push(g); x += u * 10 + gap * 2;
  }
  for (let i = 0; i < tens; i++) {
    let g = `<g transform="translate(${x},0)">`;
    for (let r = 0; r < 10; r++) g += `<rect x="0" y="${r * u}" width="${u}" height="${u}" fill="${fill}" stroke="${stroke}" stroke-width=".5"/>`;
    g += `<rect x="0" y="0" width="${u}" height="${u * 10}" fill="none" stroke="${stroke}" stroke-width="1.6"/></g>`;
    parts.push(g); x += u + gap;
  }
  x += gap * 2;
  for (let i = 0; i < ones; i++) {
    parts.push(`<rect x="${x}" y="${(u * 10) - u}" width="${u}" height="${u}" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`);
    x += u + gap;
  }
  const W = Math.max(x, u * 10), H = u * 10;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${Math.min(H, 110)}" role="img" aria-label="${hundreds} hundreds ${tens} tens ${ones} ones">${parts.join('')}</svg>`;
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
export function barChart(bars, { print = false, max = null, step = 1, width = 300, height = 150 } = {}) {
  const top = max ?? Math.max(...bars.map((b) => b.v)) + step;
  const padL = 30, padB = 22, bw = (width - padL - 8) / bars.length;
  const st = print ? '#111' : 'var(--line2)';
  const tc = print ? '#333' : 'var(--txt2)';
  const y = (v) => height - padB - (v / top) * (height - padB - 8);
  let out = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="bar chart">`;
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
