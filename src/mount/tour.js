/* "Show me around" — an opt-in walkthrough of exactly two steps.
   Design, evidence and the arguments against it: docs/DISCOVERY.md.

   The mechanic, in one sentence: each step gives the child ONE class of target,
   they press the REAL control, the whole site changes behind the dialog, and only
   then does "Next" appear. The consequence is the instruction — Hiniker et al.
   (IDC 2015) found that once a child understood which action to attempt she
   executed it 87% of the time, and that a visual highlight (the coach-mark
   primitive) was the worst of four prompt types and the only one that did not
   improve with age.

   Three things it deliberately does not do:
     - It never opens itself. So there is no "you have seen this" flag, and
       nothing to degrade when localStorage throws.
     - It never appears beside a live problem. The door is on six index pages and
       in the footer, never on an activity or print page. That is the mitigation
       for the one on-domain finding that argues against this whole shape: in
       Refraction, an on-demand help button REDUCED levels completed and time
       played against no tutorial at all. The mitigation is untested, because
       nobody has tested it.
     - Nothing speaks on open. Chrome refuses audible autoplay before a gesture
       on the domain, and WCAG 1.4.2 makes >3s of unstoppable audio a Level A
       failure. The accessible answer and the only working answer agree. */

import { TOUR } from '../../content/tour.js';
import { characters, getCharacter } from '../../content/characters.js';
import { activities } from '../../content/activities/index.js';
import { plans } from '../../content/plans.js';
import { BADGE_COUNT } from '../../content/badges.js';
import { setCharacter, currentCharacter } from '../lib/theme.js';
import { rng, deriveSeed } from '../lib/rng.js';
import { base } from '../lib/url.js';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let panel = null, returnFocusTo = null, step = 1, seedNudge = 0;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const avatar = (id, cls) =>
  `<svg class="${cls}" aria-hidden="true" viewBox="0 0 64 64"><use href="#av-${id}"/></svg>`;

/* Three real sums from the real generator, prompts only — no ten-frames, because
   the point of step 2 is that the NUMBERS change, and a figure competes with it. */
function sums(nudge) {
  const a = activities.find((x) => x.id === 'adding-to-twenty');
  if (!a) return '';
  const ch = getCharacter(currentCharacter());
  const seed = 8817 + nudge * 97;
  /* Distinct, or it reads as a bug — the first draft showed "5 + 2 = ?" twice,
     which is the same defect check.mjs now guards on every printed sheet. Walk
     the index until three different sums turn up. */
  const out = [], seen = new Set();
  for (let k = 0; out.length < 3 && k < 40; k++) {
    const sd = deriveSeed(seed, `t${k}`);
    try {
      const p = a.generate(sd, k, ch, rng(sd), seed);
      const t = String(p.printStem ?? p.prompt).replace(/<[^>]+>/g, '').replace(/=\s*$/, '= ?').trim();
      if (!t || seen.has(t)) continue;
      seen.add(t);
      out.push(`<span class="tsum">${t}</span>`);
    } catch { /* skip */ }
  }
  return out.join('');
}

function close({ restore = true } = {}) {
  document.removeEventListener('keydown', onKey);
  panel?.remove(); panel = null; step = 1;
  if (restore && returnFocusTo?.isConnected) { try { returnFocusTo.focus(); } catch { /* gone */ } }
  if (restore) returnFocusTo = null;
}

function onKey(e) {
  if (e.key === 'Escape') { close(); return; }
  if (e.key !== 'Tab' || !panel) return;
  const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function shell(inner) {
  if (!panel) {
    const active = document.activeElement;
    returnFocusTo = active && active !== document.body && active.isConnected
      ? active : document.querySelector('[data-tour]');
    panel = document.createElement('div');
    panel.className = 'twrap noprint';
    document.body.appendChild(panel);
    document.addEventListener('keydown', onKey);
  }
  panel.innerHTML = `<div class="tbg" data-tclose></div>
    <div class="tpanel" role="dialog" aria-modal="true" aria-label="${esc(TOUR.door)}">
      <button class="tclose" data-tclose aria-label="Close">&times;</button>
      ${inner}
    </div>`;
  panel.querySelectorAll('[data-tclose]').forEach((el) => el.addEventListener('click', () => close()));
}

/* The line the reader just caused, then more detail under it. NOT a child line
   with an adult footnote: a nine-year-old exploring on her own is as likely to be
   driving this as a parent, and copy that discusses her in the third person tells
   her the panel is not for her. Both lines are written for whoever pressed.

   A live region, and the buttons live OUTSIDE it: a control inside an aria-live
   region makes its own label change fire a second announcement. */
const saidBlock = (line, more) => `
  <div class="tsaid" role="status" aria-live="polite">
    <p class="tsaid-c">${line}</p>
    <p class="tsaid-more">${more}</p>
  </div>`;

function paintStep1(said) {
  const cur = currentCharacter();
  shell(`
    <p class="tstep">${TOUR.step1.n}</p>
    <h2 class="task">${esc(TOUR.step1.ask)}</h2>
    <div class="tfaces">
      ${Object.keys(characters).map((id) => `
        <button class="tface${id === cur && said ? ' on' : ''}" data-tch="${id}"
          aria-label="${esc(characters[id].name)}">
          ${avatar(id, 'tav')}<span>${esc(characters[id].name)}</span>
        </button>`).join('')}
    </div>
    ${said ? saidBlock(said.c, said.g) : '<p class="thint">Press one and watch the whole page change.</p>'}
    <div class="tfoot">${said ? '<button class="btn pri" data-tnext>Next &rarr;</button>' : ''}</div>`);

  panel.querySelectorAll('[data-tch]').forEach((b) => b.addEventListener('click', () => {
    const id = b.dataset.tch;
    setCharacter(id);                        // the real thing, not a mock
    const ch = getCharacter(id);
    const c = id === 'none' ? TOUR.step1.saidNone
      : TOUR.step1.said.replace(/\{name\}/g, esc(ch.name)).replace(/\{place\}/g, esc(ch.world?.place ?? 'the page'));
    paintStep1({ c, g: TOUR.step1.more });
  }));
  panel.querySelector('[data-tnext]')?.addEventListener('click', () => { step = 2; paintStep2(false); });
  if (!said) panel.querySelector('[data-tch]')?.focus();
  else panel.querySelector('[data-tnext]')?.focus();
}

function paintStep2(pressed) {
  shell(`
    <p class="tstep">${TOUR.step2.n}</p>
    <h2 class="task">${esc(TOUR.step2.ask)}</h2>
    <div class="tsums">${sums(seedNudge)}</div>
    <div class="tfoot tfoot-mid">
      <button class="btn pri" data-tnew>&#10227; New problems</button>
    </div>
    ${pressed ? saidBlock(esc(TOUR.step2.said), TOUR.step2.more)
      : '<p class="thint">Press it. The numbers change; the kind of question does not.</p>'}
    <div class="tfoot">${pressed ? '<button class="btn" data-tdone>Next &rarr;</button>' : ''}</div>`);

  panel.querySelector('[data-tnew]').addEventListener('click', () => { seedNudge++; paintStep2(true); });
  panel.querySelector('[data-tdone]')?.addEventListener('click', paintDone);
  panel.querySelector(pressed ? '[data-tdone]' : '[data-tnew]')?.focus();
}

/* The third panel answers the question the whole feature exists for: what is
   here, and how do I get to it. A map rather than a third press — the step budget
   the completion data punishes is about waiting, and reading five rows is not
   waiting. Each row is a real link, so the panel is also the way out. */
/* Counts come from the content modules, never typed. The printing notes carried
   "Six of the forty-one sheets" for two days after two activities landed, and no
   checker reads prose. */
const counts = (line) => line
  .replace('{books}', activities.filter((a) => a.kind === 'book').length)
  .replace('{games}', activities.filter((a) => a.kind === 'game').length)
  .replace('{total}', activities.length)
  .replace('{badges}', BADGE_COUNT)
  // plans[0] carries `grade` and `title`; my first draft guessed at gradeLabel
  // and topic, which do not exist and would have printed "undefined".
  .replace('{plans}', plans.length === 1
    ? `There is one so far: ${plans[0].title}, for grade ${plans[0].grade}.`
    : `There are ${plans.length}, one per grade where we have built one.`);

function paintDone() {
  const b = base();
  const S = TOUR.step3;
  shell(`
    <p class="tstep">${S.n}</p>
    <h2 class="task">${esc(S.ask)}</h2>
    <dl class="tways">
      ${S.ways.map(([name, href, line]) => `<div class="tway">
        <dt>${href ? `<a href="${b}${href}">${esc(name)}</a>` : esc(name)}</dt>
        <dd>${esc(counts(line))}</dd></div>`).join('')}
    </dl>
    ${saidBlock(esc(S.said), esc(S.more))}
    <div class="tfoot">
      <a class="btn pri" href="${b}/grades/">${esc(S.go)} &rarr;</a>
      <a class="btn" href="${b}/guide/">${esc(S.map)}</a>
    </div>`);
  panel.querySelector('.tway a')?.focus();
}

document.addEventListener('click', (e) => {
  const b = e.target.closest?.('[data-tour]');
  if (!b) return;
  e.preventDefault();
  step = 1;
  paintStep1(false);
});

export const openTour = () => { step = 1; paintStep1(false); };
