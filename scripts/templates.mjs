// Page templates. Build-time only (Node). Emits plain static HTML — the site has
// no client framework and no hydration step.

import { SPRITES } from '../src/lib/sprites.js';
import { characters, characterList } from '../content/characters.js';
import { tasks, roamLabel, ROAM_URL } from '../content/roam.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const GRADES = ['K', '1', '2', '3', '4', '5'];
export const gradeName = (g) => (g === 'K' ? 'Kindergarten' : `${g}${{ 1: 'st', 2: 'nd', 3: 'rd' }[g] || 'th'} grade`);
export const gradeNum = (g) => (g === 'K' ? 0 : parseInt(g, 10));

const FONTS = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600&display=swap';

/* ---------------------------------------------------------------- page shell */
export function page({ base, title, desc, cls = '', body, head = '', scripts = [], active = '', crumbs = null }) {
  const b = base;
  return `<!DOCTYPE html>
<html lang="en" data-ch="none" data-base="${esc(b || '/')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · Izzi Math</title>
<meta name="description" content="${esc(desc)}">
<meta name="color-scheme" content="dark">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${b}/assets/src/styles/site.css">
<link rel="stylesheet" href="${b}/assets/src/styles/print.css">
${head}
</head>
<body class="${cls}">
<div class="grid-bg"></div><div class="glow g1"></div><div class="glow g2"></div>
${SPRITES}
${nav(b, active)}
<main>
${crumbs ? breadcrumbs(b, crumbs) : ''}
${body}
</main>
${footer(b)}
<script type="module" src="${b}/assets/src/lib/theme.js"></script>
${scripts.map((s) => `<script type="module" src="${b}${s}"></script>`).join('\n')}
</body>
</html>`;
}

/* ---------------------------------------------------------------------- nav */
function nav(b, active) {
  const link = (href, label, key) =>
    `<a class="nl" href="${b}${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<header class="nav noprint">
  <div class="wrap nav-in">
    <a class="logo" href="${b}/"><span class="mark" aria-hidden="true">∞</span>Izzi Math</a>
    ${link('/grades/', 'Grades', 'grades')}
    ${link('/books/', 'Books', 'books')}
    ${link('/games/', 'Games', 'games')}
    ${link('/printables/', 'Printables', 'printables')}
    ${link('/roam/', 'ROAM', 'roam')}
    <div class="nav-r">
      <div class="chpick" id="chpick" role="group" aria-label="Choose a character">
        ${characterList.map((id) => `<button class="chbtn" data-ch="${id}" aria-pressed="${id === 'none'}" title="${esc(characters[id].name)}"><svg aria-hidden="true"><use href="#av-${id}"/></svg>${esc(characters[id].name === 'Just math' ? 'Just math' : characters[id].name)}</button>`).join('')}
      </div>
    </div>
  </div>
</header>`;
}

function breadcrumbs(b, crumbs) {
  return `<nav class="wrap noprint" aria-label="Breadcrumb" style="padding-top:18px">
  <ol style="display:flex;gap:8px;list-style:none;font-size:13px;color:var(--txt3);flex-wrap:wrap">
  ${crumbs.map((c, i) => `<li>${i ? '<span aria-hidden="true" style="margin-right:8px">/</span>' : ''}${c.href ? `<a href="${b}${c.href}" style="color:var(--txt2);text-decoration:none">${esc(c.label)}</a>` : `<span>${esc(c.label)}</span>`}</li>`).join('')}
  </ol></nav>`;
}

function footer(b) {
  return `<footer class="foot noprint"><div class="wrap fin">
  <span>Izzi Math — free math practice for families.</span>
  <a href="${b}/about/">About &amp; credits</a>
  <a href="${b}/roam/">Linked to ROAM</a>
  <a href="${b}/printables/">All printables</a>
  <a href="https://github.com/yeatmanlab/izzimath">Source</a>
</div></footer>`;
}

/* -------------------------------------------------------------------- cards */
export function activityCard(b, a) {
  const href = `${b}/${a.kind === 'book' ? 'books' : 'games'}/${a.id}/`;
  const glyph = a.glyph || (a.kind === 'game' ? '◉' : '◈');
  return `<a class="card" href="${href}">
  <div class="thumb"><span class="big" aria-hidden="true">${esc(glyph)}</span></div>
  <div class="cbody">
    <h3>${esc(a.title)}</h3>
    <p>${esc(a.blurb)}</p>
    <div class="meta">
      <span class="tag acc">${a.kind === 'book' ? 'Book' : 'Game'}</span>
      <span class="tag ok">Prints</span>
      <span class="tag">${esc(gradeName(a.grade).replace(' grade', ''))}</span>
      ${(a.ccss || []).slice(0, 1).map((c) => `<span class="tag">${esc(c)}</span>`).join('')}
      ${(a.roam || []).slice(0, 1).map((l) => `<span class="tag roam">${esc(roamLabel(l))}</span>`).join('')}
    </div>
  </div></a>`;
}

export function roamBadges(a) {
  if (!a.roam?.length) return '';
  return a.roam.map((l) => `<span class="tag roam">${esc(roamLabel(l))}</span>`).join(' ');
}

export { tasks, ROAM_URL };
