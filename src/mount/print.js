// Renders the printable sheet client-side from the same generator the build uses,
// so "new problems" works without a round trip.
import { activities } from '../../content/activities/index.js';
import { getCharacter } from '../../content/characters.js';
import { currentCharacter } from '../lib/theme.js';
import { readSeed, writeSeed, newSeed, base } from '../lib/url.js';
import { sheet, maxPagesFor, itemsForPages } from '../lib/printsheet.js';
import { newSeed as freshSeed } from '../lib/url.js';

const a = activities.find((x) => x.id === window.__ACTIVITY__);
const host = document.querySelector('[data-sheet]');
let seed = readSeed(8817);
let showKey = false;
let mode = 'practice';
let style = 'designed';
let variant = '';
/* Length and pack size both live in the URL beside the seed, so a chosen length
   is shareable and reproducible the same way the problems are. */
const url = new URL(location.href);
const maxPages = a ? maxPagesFor(a) : 1;
let pages = Math.max(1, Math.min(maxPages, parseInt(url.searchParams.get('pages'), 10) || (a?.printPages ?? 1)));
let pack = Math.max(1, Math.min(5, parseInt(url.searchParams.get('pack'), 10) || 1));

function remember() {
  const u = new URL(location.href);
  if (pages > 1) u.searchParams.set('pages', String(pages)); else u.searchParams.delete('pages');
  if (pack > 1) u.searchParams.set('pack', String(pack)); else u.searchParams.delete('pack');
  history.replaceState(null, '', u);
}

function paint() {
  if (!a || !host) return;
  const ch = getCharacter(currentCharacter());
  const site = location.origin + base();
  const common = { activity: a, ch, base: base(), siteUrl: site, mode, style, variant: variant || null, pages };

  /* A pack is N sheets of the same activity on DIFFERENT seeds — which is what a
     parent usually means by "more", and it sidesteps the item-space ceiling that
     caps a single long sheet: each sheet redraws from scratch. Seeds are derived
     from the visible one so the whole pack is reproducible from it. */
  const seeds = Array.from({ length: pack }, (_, k) => (k === 0 ? seed : (seed * 31 + k * 7919) % 90000 + 1000));
  const parts = [];
  for (const sd of seeds) {
    parts.push(sheet({ ...common, seed: sd, key: false }));
    if (showKey) parts.push(sheet({ ...common, seed: sd, key: true }));
  }
  host.innerHTML = parts.join('<div class="pagebreak"></div>');
  paintLengthUI();
}

function paintLengthUI() {
  const lab = document.querySelector('[data-pages-label]');
  if (lab) lab.textContent = pages === 1 ? '1 page' : `${pages} pages`;
  const packLab = document.querySelector('[data-pack-label]');
  if (packLab) packLab.textContent = pack === 1 ? '1 sheet' : `${pack} sheets`;
  document.querySelector('[data-pages-up]')?.toggleAttribute('disabled', pages >= maxPages);
  document.querySelector('[data-pages-down]')?.toggleAttribute('disabled', pages <= 1);
  document.querySelector('[data-pack-up]')?.toggleAttribute('disabled', pack >= 5);
  document.querySelector('[data-pack-down]')?.toggleAttribute('disabled', pack <= 1);
  const tot = document.querySelector('[data-total]');
  if (tot) {
    const sheets = pages * pack * (showKey ? 2 : 1);
    tot.textContent = `${itemsForPages(a, pages) * pack} problems on ${sheets} sheet${sheets === 1 ? '' : 's'} of paper`;
  }
}

// A print counts as something done, so it earns a mark alongside completions.
window.addEventListener('beforeprint', () => {
  window.__izziProfile?.noteProgress(a?.id, { printed: true });
});
document.querySelector('[data-newseed]')?.addEventListener('click', () => { seed = newSeed(); paint(); });
document.querySelector('[data-togglekey]')?.addEventListener('click', (e) => {
  showKey = !showKey;
  e.currentTarget.setAttribute('aria-pressed', String(showKey));
  e.currentTarget.textContent = showKey ? 'Hide answer key' : 'Show answer key';
  paint();
});
document.querySelector('[data-mode]')?.addEventListener('click', (e) => {
  mode = mode === 'practice' ? 'review' : 'practice';
  e.currentTarget.setAttribute('aria-pressed', String(mode === 'review'));
  e.currentTarget.textContent = mode === 'review' ? 'Practice sheet' : 'Mixed review sheet';
  paint();
});
document.querySelector('[data-style]')?.addEventListener('click', (e) => {
  style = style === 'designed' ? 'plain' : 'designed';
  e.currentTarget.setAttribute('aria-pressed', String(style === 'plain'));
  e.currentTarget.textContent = style === 'plain' ? 'Designed sheet' : 'Plain black & white';
  paint();
});
document.querySelector('[data-variant]')?.addEventListener('change', (e) => {
  variant = e.target.value; paint();
});
const step = (what, by) => {
  if (what === 'pages') pages = Math.max(1, Math.min(maxPages, pages + by));
  else pack = Math.max(1, Math.min(5, pack + by));
  remember(); paint();
};
document.querySelector('[data-pages-up]')?.addEventListener('click', () => step('pages', 1));
document.querySelector('[data-pages-down]')?.addEventListener('click', () => step('pages', -1));
document.querySelector('[data-pack-up]')?.addEventListener('click', () => step('pack', 1));
document.querySelector('[data-pack-down]')?.addEventListener('click', () => step('pack', -1));
document.addEventListener('characterchange', paint);
writeSeed(seed);
paint();
