/* Draws the 150 profile avatars from the specs in content/avatars.js.

   Composed from primitives rather than 150 hand-drawn files. The test that
   matters is not whether each one is a beautiful illustration — it is whether a
   child can pick THEIRS out of a grid of forty at 44px. So every creature gets
   one unmistakable silhouette cue (ear shape) plus one unmistakable feature
   (the extra), and the colourway does the rest.

   Pure string building. No DOM, so the build can emit these into static HTML and
   the browser can render the same markup client-side.
*/

import { avatarSpec, avatarLabel } from '../../content/avatars.js';

/* The primitives that exist. Exported so scripts/check.mjs can prove every
   creature spec resolves to something that actually draws — the deer asked for
   antlers as an `extra` when antlers are an `ears` primitive, and drew a bare
   head for its whole life without anything failing. */
export const EAR_KINDS = ['pointy', 'round', 'big', 'long', 'droopy', 'tiny', 'tufted',
  'horns', 'antlers', 'antennae', 'frills', 'eyes', 'none'];
export const EXTRA_KINDS = ['whiskers', 'snout', 'muzzle', 'snoutring', 'bignose', 'buckteeth',
  'beak', 'cheeks', 'patches', 'spikes', 'shell', 'fin', 'mane', 'curls', 'stripes',
  'spout', 'claws', 'horn', 'eyestalks', 'smile'];
export const FACE_KINDS = ['round', 'wide', 'oval', 'tapered'];

/* ------------------------------------------------------------------- pieces */

function ears(kind, body, accent, ink) {
  switch (kind) {
    case 'pointy':
      return `<path d="M20 30 L26 8 L40 24Z" fill="${body}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M80 30 L74 8 L60 24Z" fill="${body}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M25 27 L28 16 L35 25Z" fill="${accent}"/>
              <path d="M75 27 L72 16 L65 25Z" fill="${accent}"/>`;
    case 'round':
      return `<circle cx="24" cy="26" r="13" fill="${body}" stroke="${ink}" stroke-width="2.5"/>
              <circle cx="76" cy="26" r="13" fill="${body}" stroke="${ink}" stroke-width="2.5"/>
              <circle cx="24" cy="26" r="6" fill="${accent}"/>
              <circle cx="76" cy="26" r="6" fill="${accent}"/>`;
    case 'big':
      return `<circle cx="20" cy="28" r="17" fill="${body}" stroke="${ink}" stroke-width="2.5"/>
              <circle cx="80" cy="28" r="17" fill="${body}" stroke="${ink}" stroke-width="2.5"/>
              <circle cx="20" cy="28" r="9" fill="${accent}"/>
              <circle cx="80" cy="28" r="9" fill="${accent}"/>`;
    case 'long':
      return `<rect x="30" y="2" width="14" height="34" rx="7" fill="${body}" stroke="${ink}" stroke-width="2.5"/>
              <rect x="56" y="2" width="14" height="34" rx="7" fill="${body}" stroke="${ink}" stroke-width="2.5"/>
              <rect x="34" y="8" width="6" height="22" rx="3" fill="${accent}"/>
              <rect x="60" y="8" width="6" height="22" rx="3" fill="${accent}"/>`;
    case 'droopy':
      return `<path d="M26 30 q-16 6 -12 28 q14 6 20 -12Z" fill="${accent}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M74 30 q16 6 12 28 q-14 6 -20 -12Z" fill="${accent}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
    case 'tiny':
      return `<circle cx="28" cy="24" r="9" fill="${accent}" stroke="${ink}" stroke-width="2.5"/>
              <circle cx="72" cy="24" r="9" fill="${accent}" stroke="${ink}" stroke-width="2.5"/>`;
    case 'tufted':
      return `<path d="M28 26 L24 8 L40 20Z" fill="${accent}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M72 26 L76 8 L60 20Z" fill="${accent}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
    case 'horns':
      return `<path d="M30 24 q-6 -18 4 -20 q4 8 8 14Z" fill="${accent}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M70 24 q6 -18 -4 -20 q-4 8 -8 14Z" fill="${accent}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>`;
    case 'antlers':
      return `<g fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M36 24 L26 2"/><path d="M31 13 L14 8"/><path d="M28 7 L30 -4"/>
                <path d="M64 24 L74 2"/><path d="M69 13 L86 8"/><path d="M72 7 L70 -4"/></g>`;
    case 'antennae':
      return `<g fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round">
                <path d="M38 20 q-6 -14 -12 -16"/><path d="M62 20 q6 -14 12 -16"/></g>
              <circle cx="24" cy="4" r="5" fill="${accent}"/><circle cx="76" cy="4" r="5" fill="${accent}"/>`;
    case 'frills':
      return `<g fill="${accent}" stroke="${ink}" stroke-width="2">
                <circle cx="14" cy="34" r="7"/><circle cx="10" cy="50" r="7"/><circle cx="16" cy="64" r="7"/>
                <circle cx="86" cy="34" r="7"/><circle cx="90" cy="50" r="7"/><circle cx="84" cy="64" r="7"/></g>`;
    case 'eyes':   // crab: eyes on stalks
      return `<g stroke="${ink}" stroke-width="3"><path d="M38 24 L34 8" fill="none"/><path d="M62 24 L66 8" fill="none"/></g>
              <circle cx="34" cy="6" r="7" fill="#fff" stroke="${ink}" stroke-width="2.5"/>
              <circle cx="66" cy="6" r="7" fill="#fff" stroke="${ink}" stroke-width="2.5"/>
              <circle cx="34" cy="6" r="3" fill="${ink}"/><circle cx="66" cy="6" r="3" fill="${ink}"/>`;
    default:
      return '';
  }
}

const HEADS = {
  round:   `<circle cx="50" cy="56" r="34" />`,
  wide:    `<rect x="12" y="26" width="76" height="62" rx="30" />`,
  oval:    `<ellipse cx="50" cy="58" rx="30" ry="34" />`,
  tapered: `<path d="M50 22 q30 6 30 34 q0 32 -30 34 q-30 -2 -30 -34 q0 -28 30 -34Z" />`,
};

function extra(kind, body, accent, ink) {
  switch (kind) {
    case 'whiskers':
      return `<g stroke="${ink}" stroke-width="2.2" stroke-linecap="round" opacity=".75">
                <path d="M30 60 L8 56"/><path d="M30 66 L9 68"/>
                <path d="M70 60 L92 56"/><path d="M70 66 L91 68"/></g>`;
    case 'snout':
      return `<ellipse cx="50" cy="70" rx="17" ry="13" fill="${accent}" stroke="${ink}" stroke-width="2.2"/>
              <ellipse cx="50" cy="64" rx="6" ry="4.5" fill="${ink}"/>`;
    case 'muzzle':
      return `<ellipse cx="50" cy="70" rx="20" ry="14" fill="#fff" opacity=".8"/>
              <ellipse cx="50" cy="64" rx="5" ry="4" fill="${ink}"/>`;
    case 'snoutring':
      return `<ellipse cx="50" cy="70" rx="19" ry="14" fill="${accent}" stroke="${ink}" stroke-width="2.4"/>
              <ellipse cx="43" cy="70" rx="3.6" ry="5" fill="${ink}"/>
              <ellipse cx="57" cy="70" rx="3.6" ry="5" fill="${ink}"/>`;
    case 'bignose':
      return `<ellipse cx="50" cy="66" rx="12" ry="15" fill="${ink}" opacity=".85"/>`;
    case 'buckteeth':
      return `<rect x="43" y="70" width="14" height="14" rx="3" fill="#fff" stroke="${ink}" stroke-width="2"/>
              <path d="M50 70 V84" stroke="${ink}" stroke-width="1.6"/>`;
    case 'beak':
      return `<path d="M50 60 L62 70 L50 78 L38 70Z" fill="${accent}" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round"/>`;
    case 'cheeks':
      return `<circle cx="26" cy="66" r="9" fill="${accent}" opacity=".55"/>
              <circle cx="74" cy="66" r="9" fill="${accent}" opacity=".55"/>`;
    case 'patches':
      return `<circle cx="32" cy="52" r="13" fill="${ink}" opacity=".8"/>
              <circle cx="68" cy="52" r="13" fill="${ink}" opacity=".8"/>`;
    case 'spikes':
      return `<g fill="${accent}" stroke="${ink}" stroke-width="2" stroke-linejoin="round">
                <path d="M50 20 L44 32 L56 32Z"/><path d="M32 28 L28 40 L40 36Z"/><path d="M68 28 L72 40 L60 36Z"/></g>`;
    case 'shell':
      return `<path d="M18 62 q32 -20 64 0 q-4 26 -32 28 q-28 -2 -32 -28Z" fill="${accent}" stroke="${ink}" stroke-width="2.4"/>
              <g stroke="${ink}" stroke-width="1.6" opacity=".6" fill="none">
                <path d="M50 44 V90"/><path d="M28 58 q22 8 44 0"/></g>`;
    case 'fin':
      // A tail on the left AND a dorsal fin up top. Without the tail this was an
      // oval with a bump on it, and indistinguishable from the whale in a grid.
      return `<path d="M22 58 L2 38 L6 58 L2 78Z" fill="${accent}" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round"/>
              <path d="M50 24 q14 -14 20 2 q-12 0 -20 4Z" fill="${accent}" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round"/>`;
    case 'mane':
      return `<g fill="${accent}" opacity=".9">
                ${Array.from({ length: 12 }, (_, i) => {
                  const a = (i / 12) * Math.PI * 2;
                  return `<circle cx="${(50 + Math.cos(a) * 38).toFixed(1)}" cy="${(56 + Math.sin(a) * 38).toFixed(1)}" r="11"/>`;
                }).join('')}
              </g>`;
    case 'curls':
      return `<g fill="#fff" opacity=".85">
                <circle cx="30" cy="32" r="10"/><circle cx="50" cy="26" r="11"/><circle cx="70" cy="32" r="10"/></g>`;
    case 'stripes':
      return `<g fill="${ink}" opacity=".8">
                <rect x="20" y="52" width="60" height="7" rx="3.5"/>
                <rect x="24" y="68" width="52" height="7" rx="3.5"/></g>`;
    case 'spout':
      // A fat visible plume plus a tail fluke. The thin two-stroke version read
      // as nothing at 44px and left the whale a plain oval.
      return `<g fill="${accent}" stroke="${ink}" stroke-width="2">
                <circle cx="50" cy="4" r="9"/><circle cx="36" cy="12" r="6"/><circle cx="64" cy="12" r="6"/></g>
              <path d="M14 84 q-12 6 -12 -8 q8 0 14 -4Z" fill="${accent}" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round"/>
              <path d="M30 74 q20 10 40 0" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`;
    case 'claws':
      return `<path d="M14 74 q-10 -10 2 -18 q6 8 10 10Z" fill="${accent}" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round"/>
              <path d="M86 74 q10 -10 -2 -18 q-6 8 -10 10Z" fill="${accent}" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round"/>`;
    case 'horn':
      return `<path d="M50 26 L41 -5 L59 -5Z" fill="${accent}" stroke="${ink}" stroke-width="2.4" stroke-linejoin="round"/>
              <g stroke="${ink}" stroke-width="1.8" opacity=".7">
                <path d="M45 10 L55 10"/><path d="M47 1 L53 1"/></g>`;
    case 'eyestalks':
      return `<circle cx="30" cy="40" r="11" fill="#fff" stroke="${ink}" stroke-width="2.4"/>
              <circle cx="70" cy="40" r="11" fill="#fff" stroke="${ink}" stroke-width="2.4"/>
              <circle cx="30" cy="41" r="5" fill="${ink}"/><circle cx="70" cy="41" r="5" fill="${ink}"/>`;
    case 'smile':
      return `<path d="M36 68 q14 12 28 0" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
              <circle cx="26" cy="62" r="8" fill="${accent}" opacity=".55"/>
              <circle cx="74" cy="62" r="8" fill="${accent}" opacity=".55"/>`;
    default:
      return '';
  }
}

/* Eyes are shared, because a consistent gaze is what makes a set of mixed
   silhouettes read as one family. Skipped where the creature's own feature
   already provides them. */
const OWN_EYES = new Set(['eyestalks', 'eyes']);

/* --------------------------------------------------------------------- draw */

export function avatarSvg(id, { size = 56, cls = '', title = null, decorative = false } = {}) {
  const { creature, colour } = avatarSpec(id);
  const { body, accent, ink } = colour;
  const label = title ?? avatarLabel(id);
  const hasOwnEyes = OWN_EYES.has(creature.extra) || creature.ears === 'eyes';

  const head = (HEADS[creature.face] ?? HEADS.round)
    .replace('/>', ` fill="${body}" stroke="${ink}" stroke-width="3"/>`);

  return `<svg class="avi ${cls}" viewBox="-4 -6 108 106" width="${size}" height="${size}"
    ${decorative ? 'aria-hidden="true"' : `role="img" aria-label="${label}"`}>
    ${ears(creature.ears, body, accent, ink)}
    ${head}
    ${creature.extra === 'mane' ? extra('mane', body, accent, ink) + head : ''}
    ${hasOwnEyes ? '' : `<circle cx="37" cy="54" r="6" fill="${ink}"/><circle cx="63" cy="54" r="6" fill="${ink}"/>
      <circle cx="39" cy="52" r="2.2" fill="#fff"/><circle cx="65" cy="52" r="2.2" fill="#fff"/>`}
    ${creature.extra === 'mane' ? '' : extra(creature.extra, body, accent, ink)}
  </svg>`;
}
