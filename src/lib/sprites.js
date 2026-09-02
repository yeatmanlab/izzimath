// Character sprites, built in layers.
//
// A character is a BODY (head, ears, spikes, markings — everything that never
// changes) plus a FACE (eyes and mouth). Expressions are the same body with a
// different face, which is how a real character sheet works and means a new
// expression costs a few paths rather than a whole redraw.
//
// Expressions:
//   idle   resting, used in the nav, the picker and headers
//   happy  a correct answer, and the end of a game
//   think  a wrong answer, a hint, or being stuck
//
// Print uses a separate 1-bit line-art variant (ln-*), idle only, because a
// home inkjet should not be asked to render three moods.
//
// One hard rule: characters live in the CHROME only — nav, feedback, headers,
// start and finish screens. They never appear inside a manipulative. Perceptually
// rich objects hurt children who know them well (Petersen & McNeil 2013), so
// ten-frame counters, array squares and number line markers stay plain for
// everyone. scripts/check.mjs enforces it.

/* ------------------------------------------------------------------ bodies */
const BODIES = {
  kiwi: `
  <g fill="#C4762F" stroke="#C4762F" stroke-width="1.6" stroke-linejoin="round">
    <path d="M14.4 20.6 5 17.8l8.2 8z"/><path d="M12.2 28.2 2.6 28.4l9.4 6.2z"/><path d="M12.6 36.2 3.6 39.4l10.2 4.2z"/><path d="M16.4 42.6 9.6 48.4l9.6.6z"/>
    <path d="M49.6 20.6 59 17.8l-8.2 8z"/><path d="M51.8 28.2 61.4 28.4l-9.4 6.2z"/><path d="M51.4 36.2 60.4 39.4 50.2 43.6z"/><path d="M47.6 42.6 54.4 48.4l-9.6.6z"/>
  </g>
  <ellipse cx="32" cy="33" rx="21" ry="17.6" fill="#D89B54"/>
  <path d="M32 15.6c11 0 17.4 5.6 17.4 12.4H14.6c0-6.8 6.4-12.4 17.4-12.4z" fill="#EDBB7C"/>
  <ellipse cx="15.6" cy="36" rx="4.2" ry="2.6" fill="#F0805F" opacity=".4"/>
  <ellipse cx="48.4" cy="36" rx="4.2" ry="2.6" fill="#F0805F" opacity=".4"/>
  <ellipse cx="21.4" cy="24.6" rx="5" ry="3.2" fill="#F8DCAF" opacity=".7"/>
  <ellipse cx="42.6" cy="24.6" rx="5" ry="3.2" fill="#F8DCAF" opacity=".7"/>
  <path d="M17.6 38.4c0 6.2 6.4 10.6 14.4 10.6s14.4-4.4 14.4-10.6c0-2.6-6.4-4.2-14.4-4.2s-14.4 1.6-14.4 4.2z" fill="#F6DDB4"/>
  <circle cx="29.4" cy="37.6" r="1.05" fill="#A5561A"/><circle cx="34.6" cy="37.6" r="1.05" fill="#A5561A"/>
  <path d="M22.6 47.4c1.7 1.9 3.6 2.8 5.4 2.8 1.5 0 2.9-.6 4-1.8 1.1 1.2 2.5 1.8 4 1.8 1.8 0 3.7-.9 5.4-2.8" fill="none" stroke="#C4762F" stroke-width="2.4" stroke-linecap="round"/>`,

  georgie: `
  <path d="M20 32C13 24 9 13.5 10.4 5.8 17 7.4 25.6 15.2 29.2 23.2z" fill="#D2966A"/>
  <path d="M44 32c7-8 11-18.5 9.6-26.2C47 7.4 38.4 15.2 34.8 23.2z" fill="#D2966A"/>
  <path d="M21.6 28.6C16.4 22 13.4 15 14.2 10.4c4.6 1.8 10 7.2 12 13z" fill="#F3A6BD"/>
  <path d="M42.4 28.6C47.6 22 50.6 15 49.8 10.4c-4.6 1.8-10 7.2-12 13z" fill="#F3A6BD"/>
  <ellipse cx="32" cy="35.5" rx="19.2" ry="18.2" fill="#E5AF80"/>
  <ellipse cx="32" cy="28.5" rx="14" ry="9.5" fill="#F1C59B"/>
  <ellipse cx="17.6" cy="40" rx="4.4" ry="2.9" fill="#F58FB0" opacity=".5"/>
  <ellipse cx="46.4" cy="40" rx="4.4" ry="2.9" fill="#F58FB0" opacity=".5"/>
  <ellipse cx="32" cy="45" rx="10.2" ry="7.6" fill="#FAE1C6"/>
  <ellipse cx="32" cy="41.2" rx="3.7" ry="2.9" fill="#2A1418"/>
  <ellipse cx="30.7" cy="40.4" rx="1.1" ry=".7" fill="#fff" opacity=".45"/>`,

  flame: `
  <ellipse cx="12.8" cy="19" rx="9.6" ry="9" fill="#A8431C"/>
  <ellipse cx="51.2" cy="19" rx="9.6" ry="9" fill="#A8431C"/>
  <ellipse cx="13.8" cy="20.6" rx="6" ry="5.5" fill="#F7E6CF"/>
  <ellipse cx="50.2" cy="20.6" rx="6" ry="5.5" fill="#F7E6CF"/>
  <path d="M32 12c12 0 20.5 8.5 20.5 20.5S44 55 32 55 11.5 44.5 11.5 32.5 20 12 32 12z" fill="#C0512A"/>
  <path d="M32 15c8.6 0 14.8 5.4 16.4 13H15.6C17.2 20.4 23.4 15 32 15z" fill="#D66D3B"/>
  <path d="M14.6 29.5c-1.2 9 2 16.8 8.4 21 2.7 1.8 5.9 2.6 9 2.6s6.3-.8 9-2.6c6.4-4.2 9.6-12 8.4-21-3.2 5.6-9.4 8.4-17.4 8.4s-14.2-2.8-17.4-8.4z" fill="#FCF1E2"/>
  <ellipse cx="22.4" cy="26.2" rx="5.4" ry="3.8" fill="#FCF1E2"/>
  <ellipse cx="41.6" cy="26.2" rx="5.4" ry="3.8" fill="#FCF1E2"/>
  <path d="M22.6 33.8c-1.4 5.6-1 10.6 1.4 14.6" stroke="#B14A22" stroke-width="3.6" fill="none" stroke-linecap="round" opacity=".9"/>
  <path d="M41.4 33.8c1.4 5.6 1 10.6-1.4 14.6" stroke="#B14A22" stroke-width="3.6" fill="none" stroke-linecap="round" opacity=".9"/>
  <path d="M32 39.6c2.4 0 4 1.5 4 3.1s-1.8 2.9-4 2.9-4-1.3-4-2.9 1.6-3.1 4-3.1z" fill="#2B1508"/>`,
};

/* ------------------------------------------------------------------- faces */
// Small helpers so an expression is a couple of lines rather than a wall of paths.
const eye = (cx, cy, r, ink, hi = true) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${ink}"/>` +
  (hi ? `<circle cx="${cx + r * 0.37}" cy="${cy - r * 0.39}" r="${r * 0.42}" fill="#fff"/>` : '');
// pupils shifted, for the thinking look
const eyeUp = (cx, cy, r, ink) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${ink}"/>` +
  `<circle cx="${cx + r * 0.3}" cy="${cy - r * 0.45}" r="${r * 0.34}" fill="#fff"/>`;
// closed, happy: an upward arc
const eyeArc = (cx, cy, w, ink, sw) =>
  `<path d="M${cx - w} ${cy + 1} q${w} ${-w * 0.95} ${w * 2} 0" stroke="${ink}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;

const FACES = {
  kiwi: {
    idle:
      eye(22, 30.6, 5.9, '#261506') + eye(42, 30.6, 5.9, '#261506') +
      `<circle cx="20" cy="32.8" r="1.1" fill="#fff" opacity=".7"/><circle cx="40" cy="32.8" r="1.1" fill="#fff" opacity=".7"/>` +
      `<path d="M21.8 41.2c2.8 4.4 6.2 6.4 10.2 6.4s7.4-2 10.2-6.4" stroke="#A5561A" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
    happy:
      eyeArc(22, 30.4, 5.4, '#261506', 2.8) + eyeArc(42, 30.4, 5.4, '#261506', 2.8) +
      `<path d="M21 40.6c3 5.6 6.8 8 11 8s8-2.4 11-8z" fill="#A5561A"/>` +
      `<path d="M27.6 46.6h8.8c-.6 2.4-8.2 2.4-8.8 0z" fill="#F0A07A"/>`,
    think:
      eyeUp(22, 30.6, 5.9, '#261506') + eyeUp(42, 30.6, 5.9, '#261506') +
      `<path d="M15.6 22.6c2.6-2 6-2.4 8.8-1.4" stroke="#A5561A" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
      `<path d="M26.6 43.4c2 1.4 4 1.4 6 .2 2-1.2 4-1.2 5.6.2" stroke="#A5561A" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
  },
  georgie: {
    idle:
      eye(23.2, 34, 6.4, '#2A1418') + eye(40.8, 34, 6.4, '#2A1418') +
      `<circle cx="21.2" cy="36.4" r="1.2" fill="#fff" opacity=".75"/><circle cx="38.8" cy="36.4" r="1.2" fill="#fff" opacity=".75"/>` +
      `<path d="M26.2 44.8C27.7 50.6 36.3 50.6 37.8 44.8z" fill="#2A1418"/>` +
      `<path d="M29 47.4h6c0 4.6-6 4.6-6 0z" fill="#F4879F"/>`,
    happy:
      eyeArc(23.2, 33.4, 5.8, '#2A1418', 3) + eyeArc(40.8, 33.4, 5.8, '#2A1418', 3) +
      `<path d="M24.6 44.4C26.6 52.4 37.4 52.4 39.4 44.4z" fill="#2A1418"/>` +
      `<path d="M28.2 48.4h7.6c0 6-7.6 6-7.6 0z" fill="#F4879F"/>`,
    think:
      eyeUp(23.2, 34, 6.4, '#2A1418') + eyeUp(40.8, 34, 6.4, '#2A1418') +
      `<path d="M27.4 46.4c1.6 1.6 3.2 1.6 4.6.4 1.4 1.2 3 1.2 4.6-.4" stroke="#2A1418" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  },
  flame: {
    idle:
      eye(22.8, 30.4, 4.7, '#2B1508') + eye(41.2, 30.4, 4.7, '#2B1508') +
      `<path d="M32 45.6v2" stroke="#2B1508" stroke-width="1.5" stroke-linecap="round"/>` +
      `<path d="M27.8 47.6c1.2 2.9 3 3.4 4.2 1.5 1.2 1.9 3 1.4 4.2-1.5" stroke="#2B1508" stroke-width="1.7" fill="none" stroke-linecap="round"/>`,
    happy:
      eyeArc(22.8, 30.2, 4.4, '#2B1508', 2.6) + eyeArc(41.2, 30.2, 4.4, '#2B1508', 2.6) +
      `<path d="M26.6 46.6c1.6 4.4 9.2 4.4 10.8 0z" fill="#2B1508"/>` +
      `<path d="M29.6 49.4h4.8c-.4 2.2-4.4 2.2-4.8 0z" fill="#F0A07A"/>`,
    think:
      eyeUp(22.8, 30.4, 4.7, '#2B1508') + eyeUp(41.2, 30.4, 4.7, '#2B1508') +
      `<path d="M28 47.8h8" stroke="#2B1508" stroke-width="1.8" stroke-linecap="round"/>`,
  },
};

/* the no-character mark: a plain geometric glyph, with light state variants */
const NONE = {
  idle: `<circle cx="32" cy="32" r="21" fill="none" stroke="#93A0C8" stroke-width="2" stroke-dasharray="5 5"/>
    <path d="M32 22v20M22 32h20" stroke="#93A0C8" stroke-width="2.4" stroke-linecap="round"/>`,
  happy: `<circle cx="32" cy="32" r="21" fill="none" stroke="#93A0C8" stroke-width="2"/>
    <path d="M22 33l7 7 13-15" stroke="#93A0C8" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  think: `<circle cx="32" cy="32" r="21" fill="none" stroke="#93A0C8" stroke-width="2" stroke-dasharray="5 5"/>
    <path d="M25 26a7 7 0 0 1 13 3c0 4-5 4.5-5 8" stroke="#93A0C8" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <circle cx="33" cy="42" r="1.7" fill="#93A0C8"/>`,
};

/* ------------------------------------------------- 1-bit line art, for print */
const LINE_ART = {
  kiwi: `<g fill="#111" stroke="#111" stroke-width="1.6" stroke-linejoin="round">
    <path d="M14.4 20.6 5 17.8l8.2 8z"/><path d="M12.2 28.2 2.6 28.4l9.4 6.2z"/><path d="M12.6 36.2 3.6 39.4l10.2 4.2z"/><path d="M16.4 42.6 9.6 48.4l9.6.6z"/>
    <path d="M49.6 20.6 59 17.8l-8.2 8z"/><path d="M51.8 28.2 61.4 28.4l-9.4 6.2z"/><path d="M51.4 36.2 60.4 39.4 50.2 43.6z"/><path d="M47.6 42.6 54.4 48.4l-9.6.6z"/></g>
    <ellipse cx="32" cy="33" rx="21" ry="17.6" fill="none" stroke="#111" stroke-width="2.6"/>
    <circle cx="22" cy="30.6" r="4.4" fill="#111"/><circle cx="42" cy="30.6" r="4.4" fill="#111"/>
    <path d="M17.6 38.4c0 6.2 6.4 10.6 14.4 10.6s14.4-4.4 14.4-10.6c0-2.6-6.4-4.2-14.4-4.2s-14.4 1.6-14.4 4.2z" fill="none" stroke="#111" stroke-width="2"/>
    <circle cx="29.4" cy="37.6" r="1" fill="#111"/><circle cx="34.6" cy="37.6" r="1" fill="#111"/>
    <path d="M21.8 41.2c2.8 4.4 6.2 6.4 10.2 6.4s7.4-2 10.2-6.4" stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
  georgie: `<path d="M20 32C13 24 9 13.5 10.4 5.8 17 7.4 25.6 15.2 29.2 23.2z" fill="none" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M44 32c7-8 11-18.5 9.6-26.2C47 7.4 38.4 15.2 34.8 23.2z" fill="none" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/>
    <ellipse cx="32" cy="35.5" rx="19.2" ry="18.2" fill="none" stroke="#111" stroke-width="2.6"/>
    <circle cx="23.2" cy="34" r="4.6" fill="#111"/><circle cx="40.8" cy="34" r="4.6" fill="#111"/>
    <ellipse cx="32" cy="45" rx="10.2" ry="7.6" fill="none" stroke="#111" stroke-width="2"/>
    <ellipse cx="32" cy="41.2" rx="3.4" ry="2.7" fill="#111"/>
    <path d="M26.2 44.8C27.7 50.6 36.3 50.6 37.8 44.8" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round"/>`,
  flame: `<ellipse cx="12.8" cy="19" rx="9.6" ry="9" fill="none" stroke="#111" stroke-width="2.5"/>
    <ellipse cx="51.2" cy="19" rx="9.6" ry="9" fill="none" stroke="#111" stroke-width="2.5"/>
    <ellipse cx="13.8" cy="20.6" rx="5.4" ry="5" fill="none" stroke="#111" stroke-width="1.6"/>
    <ellipse cx="50.2" cy="20.6" rx="5.4" ry="5" fill="none" stroke="#111" stroke-width="1.6"/>
    <path d="M32 12c12 0 20.5 8.5 20.5 20.5S44 55 32 55 11.5 44.5 11.5 32.5 20 12 32 12z" fill="none" stroke="#111" stroke-width="2.6"/>
    <path d="M14.6 29.5c-1.2 9 2 16.8 8.4 21 2.7 1.8 5.9 2.6 9 2.6s6.3-.8 9-2.6c6.4-4.2 9.6-12 8.4-21" fill="none" stroke="#111" stroke-width="2"/>
    <path d="M22.6 34.6c-1.2 5-.8 9.6 1.4 13.4" stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M41.4 34.6c1.2 5 .8 9.6-1.4 13.4" stroke="#111" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <circle cx="22.8" cy="30.4" r="4.3" fill="#111"/><circle cx="41.2" cy="30.4" r="4.3" fill="#111"/>
    <path d="M32 39.6c2.4 0 4 1.5 4 3.1s-1.8 2.9-4 2.9-4-1.3-4-2.9 1.6-3.1 4-3.1z" fill="#111"/>
    <path d="M27.8 47.6c1.2 2.9 3 3.4 4.2 1.5 1.2 1.9 3 1.4 4.2-1.5" fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/>`,
  none: `<circle cx="32" cy="32" r="21" fill="none" stroke="#111" stroke-width="2" stroke-dasharray="5 5"/>
    <path d="M32 22v20M22 32h20" stroke="#111" stroke-width="2.4" stroke-linecap="round"/>`,
};

export const CHARACTERS = ['kiwi', 'georgie', 'flame', 'none'];
export const EXPRESSIONS = ['idle', 'happy', 'think'];

/* ------------------------------------------------------------------- gear
   Levelling-up props, layered OVER a character in the same 64x64 space. The
   kids asked for this: after enough badges the character puts something on.

   Drawn in `currentColor` rather than a literal, so each character wears it in
   their own accent — the bodies above are hard-coded hex because they never
   change, and this does.

   Positions are chosen against the head, which is an ellipse at cx 32, cy 33,
   rx 21, ry 17.6 — so it spans y 15.4 to 50.6. The four pieces stack without
   overlapping: crown above the head, goggles on the forehead, band at the brow,
   scarf at the chin. That matters because they are cumulative; at level 4 all
   four are on at once. */
const GEAR = {
  /* The kit is DARK with a bright trim in the character's colour, not bright all
     over. Kiwi's accent is amber and Kiwi's face is tan, so a band in the accent
     nearly vanished; a charcoal strap reads on a tan face, a pink one and a red
     one alike, and the pinstripe still says whose it is. Real gear is not the
     same colour as the animal wearing it.
     The crown is the exception and stays bright: it is the award, not equipment.

     The trim is var(--gear-trim), NOT currentColor. currentColor inside a
     <symbol> resolves against the symbol's own inherited colour — it sits in
     <defs> under <body>, so it came out --txt, near-white, no matter what colour
     the <use> element was given. A custom property does inherit into the use
     shadow tree, which is how icon theming normally works. */

  /* 1 — brow band. */
  1: `<path d="M12.4 28Q32 20.8 51.6 28" fill="none" stroke="#20222C" stroke-width="7" stroke-linecap="round"/>
      <path d="M12.4 27.2Q32 20 51.6 27.2" fill="none" stroke="var(--gear-trim, #EAF0FF)" stroke-width="1.9" stroke-linecap="round"/>
      <circle cx="32" cy="23.6" r="4" fill="#20222C"/>
      <circle cx="32" cy="23.6" r="2.4" fill="var(--gear-trim, #EAF0FF)"/>
      <circle cx="31.1" cy="22.7" r="0.9" fill="#fff" opacity=".85"/>`,

  /* 2 — goggles up on the forehead, above the band. */
  2: `<path d="M11.8 20.4Q32 13.2 52.2 20.4" fill="none" stroke="#20222C" stroke-width="4" stroke-linecap="round"/>
      <path d="M26.4 18.2h11.2" stroke="#20222C" stroke-width="3.4"/>
      <g fill="#11131A" stroke="#20222C" stroke-width="3.2">
        <circle cx="21.2" cy="18.2" r="5.9"/><circle cx="42.8" cy="18.2" r="5.9"/></g>
      <g fill="none" stroke="var(--gear-trim, #EAF0FF)" stroke-width="1.9">
        <circle cx="21.2" cy="18.2" r="5.9"/><circle cx="42.8" cy="18.2" r="5.9"/></g>
      <circle cx="19.1" cy="16.1" r="1.8" fill="#fff" opacity=".6"/>
      <circle cx="40.7" cy="16.1" r="1.8" fill="#fff" opacity=".6"/>`,

  /* 3 — scarf at the throat, below the mouth. The head ends at y 50.6, so this
     straddles the jaw; at y 45 it covered the muzzle and read as one. */
  3: `<path d="M18.6 47.8q13.4 7.4 26.8 0l-2.9 6.6q-10.5 4.9-21 0z"
        fill="#20222C" stroke="#20222C" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M20.4 49.6q11.6 5.6 23.2 0l-1.1 2.5q-10.5 4.6-21 0z" fill="var(--gear-trim, #EAF0FF)"/>
      <path d="M29 53.6 24.4 62l7.6-1.8 7.6 1.8-4.6-8.4z"
        fill="#20222C" stroke="#20222C" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M30.4 55.2 27.8 60l4.2-1 4.2 1-2.6-4.8z" fill="var(--gear-trim, #EAF0FF)"/>`,

  /* 4 — crown, clear of the head (starts y 15.4) and of the goggles (reach
     y 12.4), so it lives in y 1 to 11. Bright, because it is the award. */
  4: `<path d="M18.4 11 21.6 1.4 32 8.2 42.4 1.4 45.6 11z"
        fill="var(--gear-trim, #EAF0FF)" stroke="#20222C" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="32" cy="6.6" r="1.9" fill="#fff" opacity=".72"/>`,
};



function symbol(id, inner) {
  return `<symbol id="${id}" viewBox="0 0 64 64">${inner}</symbol>`;
}

const parts = [];
for (const ch of ['kiwi', 'georgie', 'flame']) {
  for (const ex of EXPRESSIONS) {
    parts.push(symbol(`av-${ch}${ex === 'idle' ? '' : '-' + ex}`, BODIES[ch] + FACES[ch][ex]));
  }
}
for (const ex of EXPRESSIONS) {
  parts.push(symbol(`av-none${ex === 'idle' ? '' : '-' + ex}`, NONE[ex]));
}
for (const ch of CHARACTERS) parts.push(symbol(`ln-${ch}`, LINE_ART[ch]));
for (const [n, inner] of Object.entries(GEAR)) parts.push(symbol(`gear-${n}`, inner));

export const SPRITES =
  `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>\n${parts.join('\n')}\n</defs></svg>`;

export const spriteId = (ch, expr = 'idle') =>
  `av-${CHARACTERS.includes(ch) ? ch : 'none'}${expr && expr !== 'idle' ? '-' + expr : ''}`;

/* Every avatar carries all four gear layers and CSS shows the ones earned, keyed
   off html[data-lv]. Done this way because avatar() is a pure string builder used
   at BUILD time in the page shell, and the badge count only exists in the
   browser — so the level cannot be known here. One attribute on <html> then
   dresses every character on the page at once, and with no profile the rules
   never match and nothing shows. */
const GEAR_LAYERS = Object.keys(GEAR)
  .map((n) => `<use class="gear g${n}" href="#gear-${n}"/>`).join('');

// 'none' is in CHARACTERS — it is the first-class "Just math" option — but there
// is no character there to dress, so it never gets gear.
const WEARS_GEAR = CHARACTERS.filter((c) => c !== 'none');

export const avatar = (ch, cls = '', expr = 'idle') =>
  `<svg class="${cls}" aria-hidden="true"><use href="#${spriteId(ch, expr)}"/>${
    WEARS_GEAR.includes(ch) ? GEAR_LAYERS : ''}</svg>`;

export const lineArt = (ch, cls = '') =>
  `<svg class="${cls}" aria-hidden="true"><use href="#ln-${CHARACTERS.includes(ch) ? ch : 'none'}"/></svg>`;
