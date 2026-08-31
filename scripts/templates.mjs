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
    ${link('/parents/', 'How to help', 'parents')}
    ${link('/references/', 'Research', 'references')}
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
  <a href="${b}/parents/">How to help</a>
  <a href="${b}/references/">Research and references</a>
  <a href="${b}/about/">About &amp; credits</a>
  <a href="${b}/printables/">All printables</a>
  <a href="${b}/roam/">Have an assessment score?</a>
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
    </div>
  </div></a>`;
}

export function roamBadges(a) {
  if (!a.roam?.length) return '';
  return a.roam.map((l) => `<span class="tag roam">${esc(roamLabel(l))}</span>`).join(' ');
}

/* A short note for the adult, composed from what the activity already declares.
   Nelson et al. (2024) synthesised 25 caregiver-delivered early maths programmes
   (g=0.26) and found the effect moderated by how much guidance and follow-up the
   caregiver got — so handing over materials with neither is choosing the bottom
   of that interval. */
export function grownUpsNote(a) {
  const mins = a.kind === 'game' ? '5 to 10 minutes' : '10 to 15 minutes';
  const lines = [];
  lines.push(`<strong>How long:</strong> ${mins} is plenty. Short and frequent beats long and
    occasional — the early-numeracy trials with the largest effects ran eight weeks or less.`);
  if (a.strategy) {
    lines.push(`<strong>The strategy to reinforce:</strong> &ldquo;${esc(a.strategy.name)}&rdquo; &mdash;
      ${esc(a.strategy.text)} If they stall, remind them of this rather than giving the answer.`);
  }
  lines.push(`<strong>When they get one wrong:</strong> the page shows the working. Read it together
    rather than moving straight on. Feedback that explains is worth several times more than feedback
    that only marks right or wrong, and that gap is wider in maths than in any other subject.`);
  if (a.kind === 'game') {
    lines.push(`<strong>On the timer:</strong> it is off unless you turn it on, and it is never
      needed. Use it only once the skill is comfortable, never to introduce it.`);
  } else {
    lines.push(`<strong>Not timed:</strong> thinking time is the point of a book. Let silences run.`);
  }
  lines.push(`<strong>Print it too:</strong> doing the same problems on paper a few days later is
    worth more than doing twice as many today.`);
  return `<div class="roam grownups">
    <h2 style="font-size:15px">For grown-ups</h2>
    <ul style="margin:0;padding-left:18px;display:grid;gap:9px">
      ${lines.map((l) => `<li style="font-size:13.5px;color:var(--txt2)">${l}</li>`).join('')}
    </ul>
  </div>`;
}

export { tasks, ROAM_URL };
