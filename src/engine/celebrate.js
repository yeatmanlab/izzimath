// A short, character-flavoured flourish on a correct answer.
//
// Deliberately small: a spring-in on the character's face plus a handful of
// motif particles arcing outward, all CSS, no animation loop, self-removing
// after under a second. It marks the moment without becoming the reward — the
// evidence on game-based learning is specific to the mechanic carrying the
// maths, and a reward layer that outshines the maths is the failure mode.
//
// Respects prefers-reduced-motion: the flourish is skipped entirely.

const MOTIF = {
  kiwi:    { glyph: '◆', n: 7,  spin: -140 },  // scales
  georgie: { glyph: '●', n: 8,  spin: 0 },     // bouncing balls
  flame:   { glyph: '▲', n: 8,  spin: 200 },   // embers
  none:    { glyph: '+', n: 6,  spin: 90 },
};

let reduced = false;
if (typeof window !== 'undefined' && window.matchMedia) {
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function celebrate(host, ch) {
  if (reduced || !host) return;
  const m = MOTIF[ch?.id] || MOTIF.none;

  const layer = document.createElement('div');
  layer.className = 'celebrate';
  layer.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < m.n; i++) {
    const a = (-90 + (i - (m.n - 1) / 2) * (150 / m.n)) * (Math.PI / 180);
    const dist = 46 + (i % 3) * 22;
    const s = document.createElement('span');
    s.textContent = m.glyph;
    s.style.setProperty('--dx', `${Math.cos(a) * dist}px`);
    s.style.setProperty('--dy', `${Math.sin(a) * dist}px`);
    s.style.setProperty('--rot', `${m.spin}deg`);
    s.style.animationDelay = `${i * 26}ms`;
    // cycle the character's three accents so the burst is on-palette
    s.style.color = `var(--a${(i % 3) + 1})`;
    layer.appendChild(s);
  }

  host.appendChild(layer);
  setTimeout(() => layer.remove(), 1100);
}

// A streak worth noticing gets a slightly bigger note. Games only.
export function streakNote(host, n) {
  if (!host || n < 3) return;
  const el = document.createElement('p');
  el.className = 'streaknote';
  el.setAttribute('aria-hidden', 'true');
  el.textContent = n >= 10 ? `${n} in a row!` : n >= 5 ? `${n} in a row` : `${n} in a row`;
  host.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}
