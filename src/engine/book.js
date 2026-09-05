// Book player. A book is a sequence of pages; each page is one problem from the
// activity's seeded generator. Hints and worked explanations are available, and
// nothing is timed — books are for learning, games are for fluency.

import { renderProblem } from './render.js';
import { answerText } from '../../content/types.js';
import { renderRoutine } from './routine.js';
import { warmUpFor } from '../../content/routines.js';
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
  /* IM opens every lesson with a named warm-up routine before any of the work,
     and the routine is the largest thing this build was missing. It runs first,
     it is not scored, and it is SKIPPABLE — a parent who came for practice
     should not have to sit through a Number Talk to reach page one. */
  let warmUp = null;
  try { warmUp = warmUpFor(activity, rng(deriveSeed(seed, 'warmup'))); } catch { warmUp = null; }
  let inWarmUp = warmUp !== null;
  /* A new seed is a new lesson, so its warm-up is new too and runs again. Doing
     the same problems over on the SAME seed is not — the child has already done
     that warm-up, and making them sit through it twice is how a warm-up starts
     getting skipped on principle. */
  const rebuildWarmUp = () => {
    try { warmUp = warmUpFor(activity, rng(deriveSeed(seed, 'warmup'))); } catch { warmUp = null; }
    inWarmUp = warmUp !== null;
  };
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

  /* Nothing is silent about a skipped question: it is reported on the page you
     land on, counted on the finish screen, and reachable from both. A child who
     meant to come back should not have to remember which one it was.

     Pages the reader walked past without answering. `answered[i] === null` alone
     cannot tell a skipped question from one not reached yet, and the difference
     is the whole point of saying so out loud. */
  const skipped = new Set();
  let announce = null;   // the page just skipped, reported once on arrival

  function paintBar() {
    const done = answered.filter((x) => x !== null).length;
    if (inWarmUp) {
      bar.innerHTML = `
        <h2>${activity.title}</h2>
        <span class="tag acc">Warm-up</span>
        <div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="0"><i style="width:0"></i></div>
        <span class="seed">seed ${seed}</span>
        <a class="btn sm" href="${base()}/print/${activity.id}/?seed=${seed}">Print this book</a>`;
      return;
    }
    bar.innerHTML = `
      <h2>${activity.title}</h2>
      <span class="tag${isReview(page) ? ' acc' : ''}">${isReview(page)
        ? 'Mixed review'
        : fill((activity.chapterLabel || 'Page {n} of {total}').replace('{n}', page + 1).replace('{total}', total), ch)}</span>
      <div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><i style="width:${(done / total) * 100}%"></i></div>
      <span class="seed">seed ${seed}</span>
      <a class="btn sm" href="${base()}/print/${activity.id}/?seed=${seed}">Print this book</a>`;
  }

  function paintWarmUp() {
    paintBar();
    host.innerHTML = '<div class="qnum">Before we start</div><div data-slot></div>';
    const slot = host.querySelector('[data-slot]');
    const start = () => { inWarmUp = false; paint(); };
    // An unknown routine ui must not strand the reader on a blank screen.
    if (!renderRoutine(slot, warmUp, start)) return start();
    const skip = document.createElement('div');
    skip.className = 'sfoot';
    skip.innerHTML = '<button class="btn sm" data-skipwarm>Skip the warm-up</button>';
    skip.querySelector('[data-skipwarm]').addEventListener('click', start);
    host.appendChild(skip);
  }

  function paint() {
    if (finished) return paintFinish();
    if (inWarmUp) return paintWarmUp();
    paintBar();
    const p = problemFor(page);
    host.innerHTML = `<div class="qnum">${isReview(page)
      ? 'Mixed review — something from earlier'
      : 'Question ' + (page + 1)}</div><div data-slot></div>`;
    /* Skipping used to be completely silent: the page changed and nothing said
       the question had been left behind, or that nothing was recorded for it.
       Said here, on arrival, with the way back attached rather than described. */
    if (announce !== null) {
      const n = announce;
      const note = document.createElement('p');
      note.className = 'skipnote';
      note.setAttribute('role', 'status');
      note.innerHTML = `<span>Question ${n + 1} was skipped &mdash; no answer was recorded for it.</span>
        <button class="btn sm" data-backto="${n}">Go back to it</button>`;
      host.prepend(note);
      note.querySelector('[data-backto]').addEventListener('click', () => { page = n; paint(); });
      announce = null;
    }
    const slot = host.querySelector('[data-slot]');
    widget = renderProblem(slot, p, (response, ok) => {
      if (!ok) wrongOnce.add(page);
      else if (wrongOnce.has(page)) { wrongOnce.delete(page); fixes++; }
      answered[page] = { response, ok };
      skipped.delete(page);
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

  /* Two primary buttons on screen at once was the problem here: the submit
     button ("Check", or "Put 5 here", or "Done") and "Next" were both .btn.pri,
     so nothing said which one recorded the answer. Next never submitted — it
     only changed the page, and a question left unanswered was silently not
     counted at the end rather than marked wrong.

     So while a question is unanswered, the submit button is the only primary
     action and the way past it says "Skip". Once answered, that button becomes
     the primary "Next". Moving on without answering is still allowed: a child
     who is stuck should be able to leave a question, and "Show me and move on"
     already exists for a wrong one. It just no longer looks like the way to
     submit. */
  function nav() {
    const p = problemFor(page);
    const done = answered[page] !== null;
    const foot = document.createElement('div');
    foot.className = 'sfoot qnav';
    foot.innerHTML = `
      <button class="btn" ${page === 0 ? 'disabled' : ''} data-prev>← Back</button>
      ${p.hint && !done ? '<button class="btn" data-hint>Give me a hint</button>' : ''}
      ${done && !answered[page].ok ? '<button class="btn" data-retry>Try again</button>' : ''}
      ${done && !answered[page].ok && !host.querySelector('[data-showbox]')
        ? '<button class="btn" data-reveal>Show me the answer</button>' : ''}
      ${page >= total - 1
        ? `<button class="btn${done ? ' pri' : ''}" data-finish>I\u2019m finished \u2192</button>`
        : `<button class="btn${done ? ' pri' : ''}" data-next>${done ? 'Next' : 'Skip'} \u2192</button>`}`;
    host.querySelector('.sfoot')?.remove();
    host.appendChild(foot);

    foot.querySelector('[data-prev]')?.addEventListener('click', () => { if (page > 0) { page--; paint(); } });
    foot.querySelector('[data-next]')?.addEventListener('click', () => {
      if (page >= total - 1) return;
      if (answered[page] === null) { skipped.add(page); announce = page; }
      page++; paint();
    });
    foot.querySelector('[data-retry]')?.addEventListener('click', () => { answered[page] = null; paint(); });
    foot.querySelector('[data-hint]')?.addEventListener('click', () => {
      if (host.querySelector('[data-hintbox]')) return;
      const h = document.createElement('div');
      h.dataset.hintbox = '1'; h.style.marginTop = '18px';
      h.innerHTML = `<p class="fb hint"><span aria-hidden="true">◆</span><span>${p.hint}</span></p>`;
      host.querySelector('[data-slot]').appendChild(h);
    });
    foot.querySelector('[data-finish]')?.addEventListener('click', () => { finished = true; paint(); });
    /* This said "Show me and move on" and did only the moving on: the handler
       was `page++; paint()`, so a stuck child pressed the one button offering
       to explain and the question vanished unexplained. It shows the answer
       now, plainly and in words, and leaves the way forward to Next — because
       revealing something and immediately navigating away from it is the same
       bug wearing a better label. */
    foot.querySelector('[data-reveal]')?.addEventListener('click', () => {
      if (host.querySelector('[data-showbox]')) return;
      const box = document.createElement('div');
      box.dataset.showbox = '1';
      box.style.marginTop = '18px';
      box.setAttribute('role', 'status');
      // Not escaped, matching the feedback block above: several explains carry
      // <strong> and this file has no esc() to call anyway.
      box.innerHTML = `<p class="fb hint"><span aria-hidden="true">◆</span><span>The answer is
        <strong>${answerText(p)}</strong>.${p.explain ? ` ${p.explain}` : ''}</span></p>`;
      host.querySelector('[data-slot]').appendChild(box);
      nav();   // the button has done its job and should not offer again
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
        ${skipped.size ? `<span>Skipped<b>${skipped.size}</b></span>` : ''}
      </div>
      ${skipped.size ? `<p class="skipnote" style="margin-bottom:20px">
        <span>Question${skipped.size === 1 ? '' : 's'}
          ${[...skipped].sort((a, b) => a - b).map((i) => i + 1).join(', ')}
          ${skipped.size === 1 ? 'was' : 'were'} skipped.</span>
        <button class="btn sm" data-goskipped>Go and do ${skipped.size === 1 ? 'it' : 'them'}</button>
      </p>` : ''}
      <div class="sfoot">
        <button class="btn pri" data-fresh>Do it again with new problems</button>
        <button class="btn" data-same>Start this one over</button>
        <a class="btn" href="${base()}/print/${activity.id}/?seed=${seed}">Print it</a>
        <a class="btn" href="${base()}/grades/${activity.grade}/">More ${activity.grade === 'K' ? 'Kindergarten' : 'Grade ' + activity.grade}</a>
      </div>
      <p style="color:var(--txt3);font-size:12.5px;margin-top:16px">
        Now that you have met it, a game is a good way to get quicker at it.</p>`;
    /* Every restart clears the skip marks too. Resetting `answered` alone would
       carry "question 3 was skipped" into a run where question 3 does not exist
       yet, and the finish screen would report a skip that never happened. */
    const restart = () => {
      page = 0; answered = new Array(total).fill(null);
      skipped.clear(); announce = null; finished = false; paint();
    };
    host.querySelector('[data-fresh]').addEventListener('click', () => {
      seed = newSeed(); writeSeed(seed); rebuildWarmUp(); restart();
    });
    host.querySelector('[data-same]').addEventListener('click', restart);
    // Straight back to the first one they left, rather than making them find it.
    host.querySelector('[data-goskipped]')?.addEventListener('click', () => {
      page = Math.min(...skipped); finished = false; paint();
    });
  }

  root.querySelector('[data-newseed]')?.addEventListener('click', () => {
    seed = newSeed(); page = 0; answered = new Array(total).fill(null);
    skipped.clear(); announce = null; finished = false; rebuildWarmUp(); paint();
  });
  document.addEventListener('characterchange', (e) => { ch = getCharacter(e.detail.id); paint(); });

  writeSeed(seed);
  paint();
}
