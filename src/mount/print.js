// Renders the printable sheet client-side from the same generator the build uses,
// so "new problems" works without a round trip.
import { activities } from '../../content/activities/index.js';
import { getCharacter } from '../../content/characters.js';
import { currentCharacter } from '../lib/theme.js';
import { readSeed, writeSeed, newSeed, base } from '../lib/url.js';
import { sheet } from '../lib/printsheet.js';

const a = activities.find((x) => x.id === window.__ACTIVITY__);
const host = document.querySelector('[data-sheet]');
let seed = readSeed(8817);
let showKey = false;

function paint() {
  if (!a || !host) return;
  const ch = getCharacter(currentCharacter());
  const site = location.origin + base();
  host.innerHTML =
    sheet({ activity: a, seed, ch, base: base(), siteUrl: site, key: false }) +
    (showKey ? `<div class="pagebreak"></div>` + sheet({ activity: a, seed, ch, base: base(), siteUrl: site, key: true }) : '');
}

document.querySelector('[data-newseed]')?.addEventListener('click', () => { seed = newSeed(); paint(); });
document.querySelector('[data-togglekey]')?.addEventListener('click', (e) => {
  showKey = !showKey;
  e.currentTarget.setAttribute('aria-pressed', String(showKey));
  e.currentTarget.textContent = showKey ? 'Hide answer key' : 'Show answer key';
  paint();
});
document.addEventListener('characterchange', paint);
writeSeed(seed);
paint();
