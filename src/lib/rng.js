// Deterministic seeded RNG. Identical output in Node (build) and the browser
// (runtime), which is what lets a printed sheet and the screen share a seed.

// mulberry32 — small, fast, good enough for problem generation.
export function rng(seed) {
  let a = (seed >>> 0) || 1;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const r = {
    next,
    // integer in [lo, hi] inclusive
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
    // random element
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    // true with probability p
    chance: (p) => next() < p,
    // new shuffled copy (Fisher-Yates)
    shuffle: (arr) => {
      const a2 = arr.slice();
      for (let i = a2.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a2[i], a2[j]] = [a2[j], a2[i]];
      }
      return a2;
    },
    // n distinct elements
    sample: (arr, n) => r.shuffle(arr).slice(0, n),
    // n distinct integers in [lo, hi]
    intsUnique: (lo, hi, n) => {
      const pool = [];
      for (let v = lo; v <= hi; v++) pool.push(v);
      return r.sample(pool, Math.min(n, pool.length));
    },
  };
  return r;
}

// Derive a stable child seed from a parent seed plus a label, so page 4 of a book
// always generates the same problems for a given book seed.
export function deriveSeed(seed, label) {
  let h = (seed >>> 0) ^ 0x9e3779b9;
  const s = String(label);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// A short human-typeable seed. Four digits keeps it readable on a printed footer.
export function randomSeed() {
  return 1000 + Math.floor(Math.random() * 9000);
}

export function parseSeed(v, fallback = 8817) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n >>> 0 : fallback;
}
