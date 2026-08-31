// Character theming on the client. Stored in localStorage so it survives visits
// with no account; ?ch= in the URL overrides it for sharing. Character is a
// rendering concern only — it never touches problem generation, so a shared
// ?seed= link produces identical math whichever character is on.

const KEY = 'izzimath.character';
const VALID = ['none', 'kiwi', 'georgie', 'flame'];

export function currentCharacter() {
  const q = new URLSearchParams(location.search).get('ch');
  if (q && VALID.includes(q)) return q;
  try {
    const v = localStorage.getItem(KEY);
    if (v && VALID.includes(v)) return v;
  } catch { /* private mode — fall through to default */ }
  return 'none';
}

export function setCharacter(id, { persist = true } = {}) {
  if (!VALID.includes(id)) id = 'none';
  document.documentElement.dataset.ch = id;
  if (persist) { try { localStorage.setItem(KEY, id); } catch {} }
  document.querySelectorAll('[data-ch-btn], .chbtn').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.ch === id));
  });
  // Swap any avatar that opted in
  document.querySelectorAll('svg[data-avatar] use').forEach((u) => {
    const ex = u.closest('svg').dataset.avatar;
    u.setAttribute('href', `#av-${id}${ex && ex !== 'idle' ? '-' + ex : ''}`);
  });
  document.querySelectorAll('svg[data-lineart] use').forEach((u) => u.setAttribute('href', `#ln-${id === 'none' ? 'none' : id}`));
  document.dispatchEvent(new CustomEvent('characterchange', { detail: { id } }));
  return id;
}

export function initTheme() {
  const id = setCharacter(currentCharacter(), { persist: false });
  document.querySelectorAll('.chbtn, [data-ch-btn]').forEach((b) => {
    b.addEventListener('click', () => setCharacter(b.dataset.ch));
  });
  return id;
}

// Fill {slot} templates from the active character, client-side.
export async function characterPack(id) {
  const base = document.documentElement.dataset.base || '';
  const mod = await import(`${base}/assets/content/characters.js`);
  return mod.getCharacter(id || currentCharacter());
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTheme);
  else initTheme();
}
