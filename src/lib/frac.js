// Fraction helpers. Kept exact (integer numerator/denominator) so answer keys are
// never wrong by a floating-point hair.

export const gcd = (a, b) => (b ? gcd(b, Math.abs(a % b)) : Math.abs(a));
export const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

export function frac(n, d) {
  if (d === 0) throw new Error('zero denominator');
  const s = d < 0 ? -1 : 1;
  return { n: n * s, d: d * s };
}

export function simplify({ n, d }) {
  const g = gcd(n, d) || 1;
  return { n: n / g, d: d / g };
}

export const addF = (a, b) => simplify(frac(a.n * b.d + b.n * a.d, a.d * b.d));
export const subF = (a, b) => simplify(frac(a.n * b.d - b.n * a.d, a.d * b.d));
export const mulF = (a, b) => simplify(frac(a.n * b.n, a.d * b.d));
export const divF = (a, b) => simplify(frac(a.n * b.d, a.d * b.n));
export const valF = ({ n, d }) => n / d;
export const cmpF = (a, b) => a.n * b.d - b.n * a.d;
export const eqF = (a, b) => cmpF(a, b) === 0;

// "3/4", or "1 1/2" when improper and asked for mixed form
export function fracText({ n, d }, mixed = false) {
  if (d === 1) return String(n);
  if (mixed && Math.abs(n) > d) {
    const w = Math.trunc(n / d);
    const r = Math.abs(n % d);
    return r === 0 ? String(w) : `${w} ${r}/${d}`;
  }
  return `${n}/${d}`;
}

// Inline SVG stacked fraction — works on screen and in print, no MathML needed.
export function fracSvg({ n, d }, { size = 26, color = 'currentColor' } = {}) {
  const w = Math.max(String(n).length, String(d).length) * size * 0.62 + 4;
  const h = size * 1.95;
  return `<svg class="frac" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${n} over ${d}">
<text x="${w / 2}" y="${size * 0.78}" text-anchor="middle" font-size="${size}" fill="${color}">${n}</text>
<line x1="2" y1="${h / 2}" x2="${w - 2}" y2="${h / 2}" stroke="${color}" stroke-width="${Math.max(1.4, size / 16)}"/>
<text x="${w / 2}" y="${h - size * 0.22}" text-anchor="middle" font-size="${size}" fill="${color}">${d}</text>
</svg>`;
}

// Parse a kid-typed answer: "3/4", "0.75", "1 1/2", "6"
export function parseAnswer(s) {
  const t = String(s).trim().replace(/\s+/g, ' ');
  if (!t) return null;
  let m = t.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (m) {
    const w = +m[1], n = +m[2], d = +m[3];
    if (!d) return null;
    return simplify(frac(w * d + (w < 0 ? -n : n), d));
  }
  m = t.match(/^(-?\d+)\/(-?\d+)$/);
  if (m) return +m[2] ? simplify(frac(+m[1], +m[2])) : null;
  m = t.match(/^-?\d+(\.\d+)?$/);
  if (m) {
    const dec = t.includes('.') ? t.split('.')[1].length : 0;
    const p = Math.pow(10, dec);
    return simplify(frac(Math.round(parseFloat(t) * p), p));
  }
  return null;
}
