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
import { characters } from '../../content/characters.js';

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

/* ------------------------------------------------------- the cell, and the tell

   A cell is a BUTTON, not a span. The only place a badge's copy used to live was
   a `title=` attribute, which is a desktop hover tooltip: on the tablet this
   site is mostly read on there is no hover, so a child could see twenty-four
   circles and had no way to ask what any of them were. A span is not focusable
   either, so keyboard and screen reader were in the same position.

   So: press a badge and the row tells you. Earned says what you did and when;
   unearned says what to do. The whole sentence is also in a `.sr` span inside
   the button, which makes it the button's accessible name — a screen reader
   gets the answer without having to press anything.

   `tellId` is passed in rather than generated, because the shelf renders seven
   rows and each one needs its own region for `aria-controls` to mean anything. */
function cell(b, got, size, tellId) {
  const state = got ? `Earned. ${b.says}` : `Not earned yet. ${b.todo}`;
  return `<button type="button" class="bdcell${got ? ' got' : ''}" data-badge="${b.id}"
    aria-expanded="false"${tellId ? ` aria-controls="${tellId}"` : ''}>
    ${badgeSvg(b.id, { size, locked: !got, decorative: true })}
    <b>${b.name}</b>
    <span class="sr">${state}</span>
  </button>`;
}

/* The empty region a row's answer lands in. Kept in the markup rather than
   created on tap so `aria-controls` points at something that exists. */
const tell = (tellId) => `<div class="bdtell" id="${tellId}" data-tell hidden></div>`;

/* What one badge says, filled in when its cell is pressed. Pure, so the same
   builder serves the panel and scripts/check.mjs.

   `at` and `with` come from the stored record — the earning date and which
   character was there are the only two things about a badge that are stored
   (docs/BADGES.md rule 8), so they are the only two a derived line cannot
   recompute, which is exactly why they are worth showing. */
export function badgeTell(badgeId, { got = false, at = null, withChar = null, size = 46 } = {}) {
  const b = badgeById(badgeId);
  if (!b) return '';
  const friend = withChar && withChar !== 'none' ? characters[withChar]?.name : null;
  let when = '';
  if (got && at) {
    const d = new Date(at);
    if (!Number.isNaN(d.getTime())) {
      when = `Earned ${d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}${
        friend ? `, with ${friend}` : ''}.`;
    }
  }
  if (got && !when && friend) when = `Earned with ${friend}.`;
  return `<div class="bdtell-in">
    <span class="bdtell-medal" aria-hidden="true">${badgeSvg(b.id, { size, locked: !got, decorative: true })}</span>
    <div class="bdtell-body">
      <p class="bdtell-kicker">${got ? 'What you did' : 'How to get it'}</p>
      <p class="bdtell-name">${b.name}</p>
      <p class="bdtell-says">${got ? b.says : b.todo}</p>
      ${when ? `<p class="bdtell-when">${when}</p>` : ''}
    </div>
  </div>`;
}

/* A flat row of specific badges, for showing a handful rather than the set.
   Same cell markup as the shelf, so they look like the same objects. */
export function badgeStrip(ids, held = new Set(), { size = 54, tellId = 'bdtell-strip' } = {}) {
  const have = held instanceof Set ? held : new Set(held);
  return `<div class="bdrow bdstrip">${ids.map((id) => {
    const b = badgeById(id);
    return b ? cell(b, have.has(b.id), size, tellId) : '';
  }).join('')}</div>${tell(tellId)}`;
}

/* The shelf: every badge, earned ones lit, the rest as silhouettes. Grouped by
   category so it reads as a set with gaps rather than a flat wall. */
export function shelfHtml(earnedIds, { size = 54, tellId = 'bdtell-all' } = {}) {
  const held = new Set(earnedIds);
  const groups = {};
  for (const [key, cat] of Object.entries(CATEGORIES)) groups[key] = { cat, items: [] };
  for (const b of BADGES) groups[b.cat]?.items.push(b);
  return Object.entries(groups).filter(([, g]) => g.items.length).map(([key, g]) => `
    <div class="bdgroup">
      <p class="bdcat">${g.cat.name}</p>
      <div class="bdrow">
        ${g.items.map((b) => cell(b, held.has(b.id), size, `${tellId}-${key}`)).join('')}
      </div>
      ${tell(`${tellId}-${key}`)}
    </div>`).join('');
}

/* Every badge and what it takes, as readable prose rather than a shelf of
   silhouettes — the static half of the same answer, for the page at /badges/.
   Nothing here depends on a profile, so it works before a child has one and is
   the thing the cup page can honestly link to. */
export function badgeTable() {
  const groups = {};
  for (const b of BADGES) (groups[b.cat] ||= []).push(b);
  return Object.entries(CATEGORIES).filter(([key]) => groups[key]?.length).map(([key, cat]) => `
    <div class="sec bdlist" id="badges-${key}">
      <h2 style="font-size:19px">${cat.name}</h2>
      <ul class="bdlist-ul">
        ${groups[key].map((b) => `<li class="bdlist-li">
          <span class="bdlist-medal" aria-hidden="true">${badgeSvg(b.id, { size: 48, decorative: true })}</span>
          <div>
            <p class="bdlist-name">${b.name} <span class="bdlist-rank">${'★'.repeat(b.rank)}</span></p>
            <p class="bdlist-how">${b.todo}</p>
          </div>
        </li>`).join('')}
      </ul>
    </div>`).join('');
}
