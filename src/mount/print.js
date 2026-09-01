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
  paintAmountUI();
}

/* One readout for one control. It states the result in the units a parent cares
   about — problems, and sheets of paper — which is also the honest answer to
   "how much ink is this". */
function paintAmountUI() {
  const sel = document.querySelector('[data-amount]');
  if (sel) sel.value = pack > 1 ? `k${pack}` : `p${pages}`;
  const tot = document.querySelector('[data-total]');
  if (!tot) return;
  const sheets = pages * pack * (showKey ? 2 : 1);
  tot.textContent = `${itemsForPages(a, pages) * pack} problems on ${sheets} sheet${sheets === 1 ? '' : 's'} of paper`
    + (showKey ? ', answer key included' : '');
}


// A print counts as something done, so it earns a mark alongside completions.
window.addEventListener('beforeprint', () => {
  window.__izziProfile?.noteProgress(a?.id, { printed: true });
});
document.querySelector('[data-newseed]')?.addEventListener('click', () => { seed = newSeed(); paint(); });
document.querySelector('[data-togglekey]')?.addEventListener('change', (e) => {
  showKey = e.target.checked; paint();
});
document.querySelectorAll('[data-mode-radio]').forEach((el) =>
  el.addEventListener('change', () => { if (el.checked) { mode = el.value; paint(); } }));
document.querySelectorAll('[data-style-radio]').forEach((el) =>
  el.addEventListener('change', () => { if (el.checked) { style = el.value; paint(); } }));
document.querySelectorAll('[data-variant-radio]').forEach((el) =>
  el.addEventListener('change', () => { if (el.checked) { variant = el.value; paint(); } }));
/* "p3" is a three-page sheet, "k5" is five separate sheets. Encoding both in one
   control is what removes the page-versus-sheet guessing game: the reader picks
   an outcome, not two numbers whose interaction they have to model. */
document.querySelector('[data-amount]')?.addEventListener('change', (e) => {
  const v = e.target.value || 'p1';
  if (v.startsWith('k')) { pack = Math.max(1, Math.min(5, parseInt(v.slice(1), 10) || 1)); pages = 1; }
  else { pages = Math.max(1, Math.min(maxPages, parseInt(v.slice(1), 10) || 1)); pack = 1; }
  remember(); paint();
});
document.addEventListener('characterchange', paint);
writeSeed(seed);
paint();
