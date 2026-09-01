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
  // A book needs an ending. Without one, the last page answered correctly left
  // the child with every control disabled except Back — they had finished and
  // the page just sat there, which reads as being stuck rather than done.
  let finished = false;
  /* Pages the child got wrong and then came back and got right. This is the one
     signal the badge set most wants — correcting yourself is the behaviour worth
     reinforcing, and no score captures it. See docs/BADGES.md. */
  const wrongOnce = new Set();
  let fixes = 0;

  // The last page of every book is a mixed review: a problem drawn from an
  // earlier page rather than the next new thing. Interleaved practice beat
  // blocked practice 61% to 38% on a delayed test in a randomised trial of 787
  // students — same problems, only the order differed — so the review page is
  // where the durable gain actually comes from.
  const isReview = (i) => total >= 6 && i === total - 1;
  const problemFor = (i) => {
    if (isReview(i)) {
      // sample an earlier index, biased away from the immediately preceding page
      const pick = deriveSeed(seed, `rev${i}`) % Math.max(1, total - 2);
      const src = pick;
      const sd = deriveSeed(seed, `p${src}`);
      const p = activity.generate(sd, src, ch, rng(sd), seed);
      return { ...p, review: true };
    }
    return activity.generate(deriveSeed(seed, `p${i}`), i, ch, rng(deriveSeed(seed, `p${i}`)), seed);
  };

  function paintBar() {
    const done = answered.filter((x) => x !== null).length;
    bar.innerHTML = `
      <h2>${activity.title}</h2>
      <span class="tag${isReview(page) ? ' acc' : ''}">${isReview(page)
        ? 'Mixed review'
        : fill((activity.chapterLabel || 'Page {n} of {total}').replace('{n}', page + 1).replace('{total}', total), ch)}</span>
      <div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><i style="width:${(done / total) * 100}%"></i></div>
      <span class="seed">seed ${seed}</span>
      <a class="btn sm" href="${base()}/print/${activity.id}/?seed=${seed}">Print this book</a>`;
  }

  function paint() {
    if (finished) return paintFinish();
    paintBar();
    const p = problemFor(page);
    host.innerHTML = `<div class="qnum">${isReview(page)
      ? 'Mixed review — something from earlier'
      : 'Question ' + (page + 1)}</div><div data-slot></div>`;
    const slot = host.querySelector('[data-slot]');
    widget = renderProblem(slot, p, (response, ok) => {
      if (!ok) wrongOnce.add(page);
      else if (wrongOnce.has(page)) { wrongOnce.delete(page); fixes++; }
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
      ${page >= total - 1
        ? '<button class="btn pri" data-finish>I\u2019m finished \u2192</button>'
        : '<button class="btn pri" data-next>Next \u2192</button>'}`;
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
    foot.querySelector('[data-finish]')?.addEventListener('click', () => { finished = true; paint(); });
    foot.querySelector('[data-skip]')?.addEventListener('click', () => {
      // On the last page there is nowhere to move on TO, so moving on means
      // finishing rather than doing nothing at all.
      if (page < total - 1) { page++; paint(); } else { finished = true; paint(); }
    });
  }

  /* The end of a book. Deliberately NOT a score: a book is for learning, and the
     games are where getting quicker is the point. So this counts pages worked
     through, not marks out of ten, and every button on it is a way forward —
     the same problems again, a fresh set, the printable, or the grade shelf. */
  function paintFinish() {
    const worked = answered.filter((x) => x !== null).length;
    // Recorded only if a profile is keeping score; a no-op otherwise, which is
    // what makes not keeping score genuinely cost nothing.
    window.__izziProfile?.noteProgress(activity.id, {
      finished: true, pagesDone: worked,
      right: answered.filter((x) => x?.ok).length,
      fixes,
    });
    window.__izziProfile?.offerToKeepScore();
    bar.innerHTML = `
      <h2>${activity.title}</h2>
      <span class="tag acc">Finished</span>
      <div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${total}"><i style="width:100%"></i></div>
      <span class="seed">seed ${seed}</span>
      <a class="btn sm" href="${base()}/print/${activity.id}/?seed=${seed}">Print this book</a>`;
    host.innerHTML = `
      <div class="qnum">All done</div>
      ${ch.id === 'none' ? '' : avatar(ch.id, 'bigface', 'happy')}
      <p class="qtext">${ch.voice.done[0]}</p>
      <div class="scorebar" style="margin-bottom:22px">
        <span>Pages<b>${total}</b></span>
        <span>Answered<b>${worked}</b></span>
      </div>
      <div class="sfoot">
        <button class="btn pri" data-fresh>Do it again with new problems</button>
        <button class="btn" data-same>Start this one over</button>
        <a class="btn" href="${base()}/print/${activity.id}/?seed=${seed}">Print it</a>
        <a class="btn" href="${base()}/grades/${activity.grade}/">More ${activity.grade === 'K' ? 'Kindergarten' : 'Grade ' + activity.grade}</a>
      </div>
      <p style="color:var(--txt3);font-size:12.5px;margin-top:16px">
        Now that you have met it, a game is a good way to get quicker at it.</p>`;
    host.querySelector('[data-fresh]').addEventListener('click', () => {
      seed = newSeed(); writeSeed(seed);
      page = 0; answered = new Array(total).fill(null); finished = false; paint();
    });
    host.querySelector('[data-same]').addEventListener('click', () => {
      page = 0; answered = new Array(total).fill(null); finished = false; paint();
    });
  }

  root.querySelector('[data-newseed]')?.addEventListener('click', () => {
    seed = newSeed(); page = 0; answered = new Array(total).fill(null); finished = false; paint();
  });
  document.addEventListener('characterchange', (e) => { ch = getCharacter(e.detail.id); paint(); });

  writeSeed(seed);
  paint();
}
