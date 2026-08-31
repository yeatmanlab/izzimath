// Book player. A book is a sequence of pages; each page is one problem from the
// activity's seeded generator. Hints and worked explanations are available, and
// nothing is timed — books are for learning, games are for fluency.

import { renderProblem } from './render.js';
import { rng, deriveSeed } from '../lib/rng.js';
import { readSeed, writeSeed, newSeed, base } from '../lib/url.js';
import { getCharacter, fill } from '../../content/characters.js';
import { currentCharacter } from '../lib/theme.js';
import { avatar } from '../lib/sprites.js';
import { celebrate } from './celebrate.js';

export function mountBook(activity, root) {
  const host = root.querySelector('[data-stage]');
  const bar = root.querySelector('[data-bar]');
  let seed = readSeed(8817);
  let page = 0;
  let ch = getCharacter(currentCharacter());
  const total = activity.pages ?? 8;
  let answered = new Array(total).fill(null);
  let widget = null;

  const problemFor = (i) => activity.generate(deriveSeed(seed, `p${i}`), i, ch, rng(deriveSeed(seed, `p${i}`)), seed);

  function paintBar() {
    const done = answered.filter((x) => x !== null).length;
    bar.innerHTML = `
      <h2>${activity.title}</h2>
      <span class="tag">${fill((activity.chapterLabel || 'Page {n} of {total}').replace('{n}', page + 1).replace('{total}', total), ch)}</span>
      <div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><i style="width:${(done / total) * 100}%"></i></div>
      <span class="seed">seed ${seed}</span>
      <a class="btn sm" href="${base()}/print/${activity.id}/?seed=${seed}">Print this book</a>`;
  }

  function paint() {
    paintBar();
    const p = problemFor(page);
    host.innerHTML = `<div class="qnum">Question ${page + 1}</div><div data-slot></div>`;
    const slot = host.querySelector('[data-slot]');
    widget = renderProblem(slot, p, (response, ok) => {
      answered[page] = { response, ok };
      const voice = ok ? ch.voice.correct : ch.voice.wrong;
      const msg = voice[page % voice.length];

      // One feedback block at a time, REPLACED rather than appended. Appending
      // meant a child who retyped an answer saw "Not quite" still sitting above
      // "Correct", and the buttons pushed far enough down to look broken.
      slot.querySelector('[data-fbbox]')?.remove();
      const fb = document.createElement('div');
      fb.dataset.fbbox = '1';
      fb.style.marginTop = '20px';

      // Always show the working, and show it especially when the answer was
      // wrong — that is the whole point of elaborated feedback.
      const worked = p.explain
        ? `<p class="fb hint" style="margin-top:10px"><span aria-hidden="true">◆</span><span>${p.explain}</span></p>`
        : '';
      // A plain invitation to correct it, so the next move is obvious.
      const fixIt = ok ? '' :
        `<p class="fixit">Change your answer and press <strong>Check</strong> again.</p>`;
      // The character reacts. Chrome only — never inside a manipulative.
      const face = ch.id === 'none' ? `<span aria-hidden="true">${ok ? '✦' : '↻'}</span>`
        : avatar(ch.id, `react${ok ? ' pop' : ''}`, ok ? 'happy' : 'think');
      fb.innerHTML = `<p class="fb ${ok ? 'good' : 'bad'}">
        ${face}
        <span>${msg}${!ok && p.hint ? ' ' + p.hint : ''}</span></p>${worked}${fixIt}`;
      slot.appendChild(fb);
      if (ok) celebrate(slot, ch);
      // Put the cursor back in the box with the wrong answer selected, so typing
      // replaces it instead of appending to it.
      if (!ok) widget?.refocus?.();
      paintBar();
      nav();
    });
    nav();
  }

  function nav() {
    const p = problemFor(page);
    const done = answered[page] !== null;
    const foot = document.createElement('div');
    foot.className = 'sfoot';
    foot.innerHTML = `
      <button class="btn" ${page === 0 ? 'disabled' : ''} data-prev>← Back</button>
      ${p.hint && !done ? '<button class="btn" data-hint>Give me a hint</button>' : ''}
      ${done && !answered[page].ok ? '<button class="btn" data-retry>Try again</button>' : ''}
      ${done && !answered[page].ok ? '<button class="btn" data-skip>Show me and move on</button>' : ''}
      <button class="btn pri" ${page >= total - 1 ? 'disabled' : ''} data-next>Next →</button>`;
    host.querySelector('.sfoot')?.remove();
    host.appendChild(foot);

    foot.querySelector('[data-prev]')?.addEventListener('click', () => { if (page > 0) { page--; paint(); } });
    foot.querySelector('[data-next]')?.addEventListener('click', () => { if (page < total - 1) { page++; paint(); } });
    foot.querySelector('[data-retry]')?.addEventListener('click', () => { answered[page] = null; paint(); });
    foot.querySelector('[data-hint]')?.addEventListener('click', () => {
      if (host.querySelector('[data-hintbox]')) return;
      const h = document.createElement('div');
      h.dataset.hintbox = '1'; h.style.marginTop = '18px';
      h.innerHTML = `<p class="fb hint"><span aria-hidden="true">◆</span><span>${p.hint}</span></p>`;
      host.querySelector('[data-slot]').appendChild(h);
    });
    foot.querySelector('[data-skip]')?.addEventListener('click', () => {
      if (page < total - 1) { page++; paint(); }
    });
  }

  root.querySelector('[data-newseed]')?.addEventListener('click', () => {
    seed = newSeed(); page = 0; answered = new Array(total).fill(null); paint();
  });
  document.addEventListener('characterchange', (e) => { ch = getCharacter(e.detail.id); paint(); });

  writeSeed(seed);
  paint();
}
