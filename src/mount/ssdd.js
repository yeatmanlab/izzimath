// Renders an SSDD sheet client-side, for the same reason the activity print
// pages do: the sheet has to follow the character the reader chose. Server-side
// it could only ever be rendered for one character, and a themed site whose
// sheets are all "Just math" is not a themed site.
//
// Unlike the activity sheets there is no seed and no "new problems": an SSDD set
// is authored, because its four questions come from different parts of the
// curriculum on purpose. That is the format, not a limitation.
import { ssddById } from '../../content/ssdd.js';
import { getCharacter } from '../../content/characters.js';
import { currentCharacter } from '../lib/theme.js';
import { base } from '../lib/url.js';
import { ssddSheet } from '../lib/printsheet.js';

const set = ssddById(window.__SSDD__);
const host = document.querySelector('[data-sheet]');
let style = 'designed';

function paint() {
  if (!set || !host) return;
  const ch = getCharacter(currentCharacter());
  const siteUrl = location.origin + base();
  host.innerHTML =
    ssddSheet({ set, ch, siteUrl, style }) +
    `<div class="pagebreak"></div>` +
    ssddSheet({ set, ch, siteUrl, style, key: true });
}

document.querySelector('[data-style]')?.addEventListener('click', (e) => {
  style = style === 'designed' ? 'plain' : 'designed';
  e.currentTarget.setAttribute('aria-pressed', String(style === 'plain'));
  e.currentTarget.textContent = style === 'plain' ? 'Designed sheet' : 'Plain black & white';
  paint();
});
document.addEventListener('characterchange', paint);
paint();
