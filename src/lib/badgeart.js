/* Badge art. Fun is the point here — the framing is informational (see
   docs/BADGES.md) but the object itself should look like something worth having.

   Three things carry that:
     rank      1 is a plain disc, 2 gains a scalloped rim, 3 gains a starburst.
               So a hard badge LOOKS harder-won without a word of explanation.
     colour    from the live character palette, so the shelf is Kiwi's shelf or
               Georgie's, and the same badge looks different with each. The glyph
               ink is a companion variable per accent (--bi-a1 …), because which
               of near-black or near-white reads depends on the accent, and the
               accents change with the character: near-black on Flame's dark red
               a3 measured 1.7:1, an invisible symbol. Same trap as --onsp.
     locked    a flat silhouette with the glyph dimmed. Showing the gaps is what
               makes a set worth completing, and it is the honest thing to show:
               the child can see exactly what is still out there.

   Pure string building, no DOM, so the build and the browser share it.
*/

import { BADGES, CATEGORIES, badgeById } from '../../content/badges.js';

const RIM = {
  1: '',
  2: `<g class="bd-rim">${Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return `<circle cx="${(50 + Math.cos(a) * 38).toFixed(1)}" cy="${(50 + Math.sin(a) * 38).toFixed(1)}" r="4.6"/>`;
      }).join('')}</g>`,
  3: `<g class="bd-rim">${Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const r1 = 32, r2 = 47;
        const x1 = 50 + Math.cos(a) * r1, y1 = 50 + Math.sin(a) * r1;
        const x2 = 50 + Math.cos(a) * r2, y2 = 50 + Math.sin(a) * r2;
        const b = a + Math.PI / 16;
        const x3 = 50 + Math.cos(b) * r1, y3 = 50 + Math.sin(b) * r1;
        return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)} L${x3.toFixed(1)} ${y3.toFixed(1)}Z"/>`;
      }).join('')}</g>`,
};

export function badgeSvg(badgeId, { size = 64, locked = false, decorative = false } = {}) {
  const b = badgeById(badgeId);
  if (!b) return '';
  const cat = CATEGORIES[b.cat] ?? CATEGORIES.shelf;
  const hue = `var(--${cat.hue})`;
  const label = locked ? `${b.name} — not earned yet` : `${b.name}: ${b.says}`;

  if (locked) {
    return `<svg class="bd bd-locked" viewBox="0 0 100 100" width="${size}" height="${size}"
      ${decorative ? 'aria-hidden="true"' : `role="img" aria-label="${label}"`}>
      <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-width="3"
        stroke-dasharray="5 5" opacity=".45"/>
      <text x="50" y="62" text-anchor="middle" font-size="30" fill="currentColor" opacity=".3"
        font-family="'Space Grotesk',sans-serif">${cat.glyph}</text>
    </svg>`;
  }

  return `<svg class="bd bd-r${b.rank}" viewBox="0 0 100 100" width="${size}" height="${size}"
    ${decorative ? 'aria-hidden="true"' : `role="img" aria-label="${label}"`}>
    <defs>
      <linearGradient id="bg-${b.id}" x1="0" y1="0" x2="0" y2="1">
        <!-- A sheen, not a fade. At .55 the bottom of the disc muddied toward
             the page and no ink read well on it; .88 keeps the disc its own
             colour, which is what lets one ink or the other clearly win. -->
        <stop offset="0" stop-color="${hue}" stop-opacity=".95"/>
        <stop offset="1" stop-color="${hue}" stop-opacity=".88"/>
      </linearGradient>
    </defs>
    <g fill="${hue}" opacity=".55">${RIM[b.rank] ?? ''}</g>
    <circle cx="50" cy="50" r="33" fill="url(#bg-${b.id})" stroke="${hue}" stroke-width="2.5"/>
    <!-- a single highlight arc, which is what makes a flat disc read as a medal -->
    <path d="M28 38 a26 26 0 0 1 40 -8" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="3.5" stroke-linecap="round"/>
    <text x="50" y="63" text-anchor="middle" font-size="32" fill="var(--bi-${cat.hue})"
      font-family="'Space Grotesk',sans-serif" font-weight="700">${cat.glyph}</text>
  </svg>`;
}

/* The shelf: every badge, earned ones lit, the rest as silhouettes. Grouped by
   category so it reads as a set with gaps rather than a flat wall. */
export function shelfHtml(earnedIds, { size = 54 } = {}) {
  const held = new Set(earnedIds);
  const groups = {};
  for (const [key, cat] of Object.entries(CATEGORIES)) groups[key] = { cat, items: [] };
  for (const b of BADGES) groups[b.cat]?.items.push(b);
  return Object.values(groups).filter((g) => g.items.length).map((g) => `
    <div class="bdgroup">
      <p class="bdcat">${g.cat.name}</p>
      <div class="bdrow">
        ${g.items.map((b) => `<span class="bdcell${held.has(b.id) ? ' got' : ''}" title="${b.name} — ${b.says}">
          ${badgeSvg(b.id, { size, locked: !held.has(b.id), decorative: true })}
          <b>${b.name}</b>
        </span>`).join('')}
      </div>
    </div>`).join('');
}
