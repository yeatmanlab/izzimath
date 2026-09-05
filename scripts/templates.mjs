// Page templates. Build-time only (Node). Emits plain static HTML — the site has
// no client framework and no hydration step.

import { SPRITES, avatar } from '../src/lib/sprites.js';
import { characters, characterList } from '../content/characters.js';
import { tasks, roamLabel, ROAM_URL } from '../content/roam.js';
import { FEEDBACK, plainUrl } from '../content/feedback.js';

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
<!-- The logo mark as an icon. SVG first for anything modern, a 32px PNG for
     browsers that ignore it, and the 180px one for an iOS home screen, which
     cannot use an SVG. All three are files in static/, copied by the build. -->
<link rel="icon" href="${b}/favicon.svg" type="image/svg+xml">
<link rel="icon" href="${b}/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${b}/apple-touch-icon.png">
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
${suggestButton()}
<script type="module" src="${b}/assets/src/lib/theme.js"></script>
<script type="module" src="${b}/assets/src/mount/profile.js"></script>
<script type="module" src="${b}/assets/src/mount/feedback.js"></script>
${scripts.map((s) => `<script type="module" src="${b}${s}"></script>`).join('\n')}
</body>
</html>`;
}

/* ------------------------------------------------------- suggestion button
   Pinned bottom right on every page. The menu is real markup revealed by
   :hover and :focus-within, and its two items are ordinary links to GitHub's
   issue form — so it works with JavaScript off, and src/mount/feedback.js
   upgrades it to tap-to-open and a prefilled form. */
function suggestButton() {
  return `<div class="fbk noprint" data-feedback>
  <div class="fbk-menu" id="fbk-menu" data-fbk-menu role="group" aria-label="${esc(FEEDBACK.menuLabel)}">
    <p class="fbk-lead">${esc(FEEDBACK.lead)}</p>
    ${FEEDBACK.kinds.map((k) => `<a class="fbk-item" href="${esc(plainUrl(k.id))}"
      data-fbk-kind="${esc(k.id)}" target="_blank" rel="noopener noreferrer">
      <b>${esc(k.label)}</b><small>${esc(k.hint)}</small></a>`).join('')}
    <p class="fbk-foot-note">${esc(FEEDBACK.noSignIn)}</p>
  </div>
  <button class="fbk-btn" type="button" data-fbk-open aria-expanded="false" aria-controls="fbk-menu">
    <span class="fbk-ic" aria-hidden="true">✎</span><span>${esc(FEEDBACK.button)}</span>
  </button>
</div>`;
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
    ${link('/skills/', 'By skill', 'skills')}
    ${link('/parents/', 'How to help', 'parents')}
    ${link('/references/', 'Research', 'references')}
    <div class="nav-r">
      <div class="chpick" id="chpick" role="group" aria-label="Choose a character">
        ${characterList.map((id) => `<button class="chbtn" data-ch="${id}" aria-pressed="${id === 'none'}" aria-label="${esc(characters[id].name)}" title="${esc(characters[id].name)}">${avatar(id)}<span class="chname">${esc(characters[id].name)}</span></button>`).join('')}
      </div>
      <!-- Keeping score is opt-in and this is the only place it is offered
           unprompted. Renders as a plain "Scores" button until a profile
           exists, then becomes that child's face. -->
      <button class="mebtn" data-me aria-haspopup="dialog" aria-label="Scores and characters">
        <span class="me-face" data-me-face aria-hidden="true">☺</span>
        <span class="me-name" data-me-name>Scores</span>
      </button>
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

/* The door to the walkthrough. Deliberately NOT in nav(): the header is already
   a dozen tab stops before <main> on every page, and a control that pays off once
   must not tax every keyboard and screen-reader visit. It goes on six index pages
   and in the footer — never on an activity or print page, which is where
   Refraction's harmful help button sat. The face is whichever character is on;
   theme.js keeps svg[data-avatar] in sync for free, and a face is the most
   picture-like thing in the row, which is what a child presses. */
export function tourDoor(b, cls = '') {
  return `<button class="tdoor ${cls}" data-tour aria-haspopup="dialog">
    <svg class="tdoor-av" aria-hidden="true" data-avatar="idle" viewBox="0 0 64 64"><use href="#av-none"/></svg>
    <span>Take a tour of Izzi Math</span>
  </button>`;
}

function footer(b) {
  return `<footer class="foot noprint"><div class="wrap fin">
  <span>Izzi Math — free math practice for families.</span>
  <a href="${b}/guide/">Take a tour</a>
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
  // data-activity lets the profile script mark this card up with what has been
  // done, without the build needing to know anything about profiles.
  return `<a class="card" href="${href}" data-activity="${esc(a.id)}">
  <div class="thumb"><span class="big" aria-hidden="true">${esc(glyph)}</span></div>
  <div class="cbody">
    <h3>${esc(a.title)}<span class="cmarks" data-marks></span></h3>
    <p>${esc(a.blurb)}</p>
    <div class="meta">
      <span class="tag acc">${a.kind === 'book' ? 'Book' : 'Game'}</span>
      <span class="tag ok">Prints</span>
      ${a.adaptive ? '<span class="tag adapt">Adjusts as you go</span>' : ''}
      <span class="tag">${esc(gradeName(a.grade).replace(' grade', ''))}</span>
      ${(a.ccss || []).slice(0, 1).map((c) => `<span class="tag">${esc(c)}</span>`).join('')}
    </div>
  </div></a>`;
}

/* ------------------------------------------------------- the look-inside card
   Not activityCard: these three introduce the three CORE FEATURES of a grade
   rather than sampling activities, so each carries a note about its whole
   category — how many books the grade has, that every book has a printable —
   and the note is what makes the section an introduction rather than three
   examples. Kept separate so the hundred-odd ordinary cards are untouched.

   `role` fixes what the card IS. The printable card deliberately points at the
   SAME activity as the workbook card, because "play it, then print the very
   same page" is the site's pitch and showing it beats claiming it. */
export function lookCard(b, a, { role, note }) {
  const href = role === 'printable'
    ? `${b}/print/${a.id}/`
    : `${b}/${a.kind === 'book' ? 'books' : 'games'}/${a.id}/`;
  const ROLE = {
    workbook: { kicker: 'Workbook', glyph: '◈' },
    game: { kicker: 'Game', glyph: '◉' },
    printable: { kicker: 'Printable', glyph: '▤' },
  }[role];
  return `<a class="card lookcard" href="${href}" data-role="${esc(role)}">
  <div class="thumb"><span class="big" aria-hidden="true">${esc(ROLE.glyph)}</span></div>
  <div class="cbody">
    <p class="lookkick">${ROLE.kicker}</p>
    <h3>${esc(a.title)}${role === 'printable' ? ', printed' : ''}</h3>
    <p class="looknote">${esc(note)}</p>
    <div class="meta">
      <span class="tag">${esc(gradeName(a.grade).replace(' grade', ''))}</span>
      ${role === 'printable'
        ? '<span class="tag ok">Answer key</span>'
        : `<span class="tag ok">Prints too</span>`}
    </div>
  </div></a>`;
}

/* One column per role: its own small grade picker, then the six cards for that
   role with one shown. Three columns means three pickers, which is the point —
   the three start on DIFFERENT grades so a visitor sees breadth at a glance and
   can move any one of them without disturbing the others.

   Real links, so with JavaScript off each number still goes to that grade's
   shelf; the mount takes the click and swaps the card instead. Each number
   carries its own grade wording, so the build stays the only thing that knows
   how to name a grade. */
export function lookColumn(b, role, grades, cardFor, chosen) {
  return `<div class="lookcol" data-wheel="${esc(role)}">
    <div class="wheel-row" role="tablist" aria-label="Grade for the ${esc(role)}">
      ${grades.map((g) => `<a class="wheel-g" role="tab" href="${b}/grades/${g}/"
        data-g="${esc(g)}" id="wheel-${esc(role)}-${esc(g)}"
        aria-controls="look-${esc(role)}-${esc(g)}"
        aria-selected="${g === chosen ? 'true' : 'false'}"
        tabindex="${g === chosen ? '0' : '-1'}"
        ><span class="vh">${esc(gradeName(g))}</span><span aria-hidden="true">${esc(g)}</span></a>`).join('')}
    </div>
    ${grades.map((g) => `<div class="lookpanel" id="look-${esc(role)}-${esc(g)}" role="tabpanel"
      aria-labelledby="wheel-${esc(role)}-${esc(g)}"${g === chosen ? '' : ' hidden'}>${cardFor(g)}</div>`).join('')}
  </div>`;
}


export function roamBadges(a) {
  if (!a.roam?.length) return '';
  return a.roam.map((l) => `<span class="tag meas">${esc(roamLabel(l))}</span>`).join(' ');
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
  if (a.adaptive) {
    // Both halves of this matter. The first says what it does; the second is a
    // privacy statement as much as a feature note, and it is currently true.
    lines.push(`<strong>It adjusts as you go:</strong> this one gets harder while they are getting
      them right and easier if they are not, aiming to keep them succeeding about four times in
      five &mdash; hard enough to be worth doing, not hard enough to stop being fun. The score is
      how deep they got rather than how many they answered, because the difficulty moved.
      <strong>Nothing is stored</strong> &mdash; it starts fresh every time the page loads.`);
  }
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
