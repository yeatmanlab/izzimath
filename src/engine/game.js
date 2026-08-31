// Game player. Rounds, score, streak. Timers are OFF by default and always
// optional — see docs/EVIDENCE.md on the timed-practice question. A game is
// never a test, so a wrong answer costs a life, not a grade.

import { renderProblem } from './render.js';
import { rng, deriveSeed } from '../lib/rng.js';
import { readSeed, writeSeed, newSeed, base } from '../lib/url.js';
import { getCharacter } from '../../content/characters.js';
import { currentCharacter } from '../lib/theme.js';

export function mountGame(activity, root) {
  const host = root.querySelector('[data-stage]');
  const bar = root.querySelector('[data-bar]');
  let started = false;
  let seed = readSeed(4242);
  let ch = getCharacter(currentCharacter());
  const total = activity.rounds ?? 12;
  let round = 0, score = 0, streak = 0, best = 0, over = false;
  let timed = false, tLeft = 0, tHandle = null;

  const problemFor = (i) => activity.generate(deriveSeed(seed, `r${i}`), i, ch, rng(deriveSeed(seed, `r${i}`)), seed);

  function paintBar() {
    bar.innerHTML = `
      <h2>${activity.title}</h2>
      <span class="tag">Round ${Math.min(round + 1, total)} of ${total}</span>
      <div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${round}"><i style="width:${(round / total) * 100}%"></i></div>
      ${activity.timerAvailable === false ? '' : `<button class="btn sm" data-timer aria-pressed="${timed}">${timed ? `⏱ ${tLeft}s` : '⏱ Timer off'}</button>`}
      <span class="seed">seed ${seed}</span>
      <a class="btn sm" href="${base()}/print/${activity.id}/?seed=${seed}">Print version</a>`;
    bar.querySelector('[data-timer]')?.addEventListener('click', toggleTimer);
  }

  function toggleTimer() {
    timed = !timed;
    clearInterval(tHandle); tHandle = null;
    if (timed) startTimer(); else paintBar();
  }
  function startTimer() {
    tLeft = Math.min(90, Math.max(60, activity.seconds || 60));
    clearInterval(tHandle);
    tHandle = setInterval(() => {
      tLeft--;
      if (tLeft <= 0) { clearInterval(tHandle); tHandle = null; finish('Time!'); }
      else paintBar();
    }, 1000);
    paintBar();
  }

  // The strategy card. WWC's guidance on fluency practice is explicit that a
  // timed activity must never introduce a concept and must never run without
  // reminding the child of the taught strategy first — the with-strategy versus
  // without-strategy contrast is a larger effect than timing itself.
  function paintStart() {
    paintBar();
    const st = activity.strategy;
    host.innerHTML = `
      <div class="qnum">Before you start</div>
      <p class="qtext">${activity.title}</p>
      ${st ? `<div class="strat">
        <h3>${st.name}</h3>
        <p>${st.text}</p>
      </div>` : ''}
      <div class="sfoot">
        <button class="btn pri" data-go>Start playing</button>
        <a class="btn" href="${base()}/grades/${activity.grade}/">Learn it first</a>
      </div>
      <p style="color:var(--txt3);font-size:12.5px;margin-top:16px">
        Games are for getting quicker at something you have already met. If this is new,
        do the book first.</p>`;
    host.querySelector('[data-go]').addEventListener('click', () => {
      started = true;
      if (timed) startTimer();
      paint();
    });
  }

  function paint() {
    if (!started) return paintStart();
    if (round >= total) return finish();
    paintBar();
    const p = problemFor(round);
    host.innerHTML = `
      <div class="scorebar">
        <span>Score<b>${score}</b></span>
        <span>Streak<b>${streak}</b></span>
        <span>Best<b>${best}</b></span>
      </div>
      <div data-slot></div>
      ${activity.strategy ? `<p class="strathint noprint"><button class="btn sm" data-strat>◆ ${activity.strategy.name}</button></p>` : ''}`;
    const slot = host.querySelector('[data-slot]');
    host.querySelector('[data-strat]')?.addEventListener('click', (e) => {
      if (host.querySelector('[data-stratbox]')) return;
      const d = document.createElement('div');
      d.dataset.stratbox = '1'; d.style.marginTop = '12px';
      d.innerHTML = `<p class="fb hint"><span aria-hidden="true">◆</span><span>${activity.strategy.text}</span></p>`;
      e.currentTarget.parentElement.appendChild(d);
    });
    renderProblem(slot, p, (response, ok) => {
      if (ok) { score++; streak++; best = Math.max(best, streak); } else { streak = 0; }
      const voice = ok ? ch.voice.correct : ch.voice.wrong;
      const fb = document.createElement('div');
      fb.style.marginTop = '20px';
      fb.innerHTML = `<p class="fb ${ok ? 'good' : 'bad'}"><span aria-hidden="true">${ok ? '✦' : '↻'}</span><span>${voice[round % voice.length]}</span></p>`;
      slot.appendChild(fb);
      setTimeout(() => { round++; paint(); }, ok ? 620 : 1500);
    });
  }

  function finish(reason) {
    over = true;
    clearInterval(tHandle); tHandle = null;
    const pct = total ? Math.round((score / Math.max(round, 1)) * 100) : 0;
    host.innerHTML = `
      <div class="qnum">${reason || 'Round complete'}</div>
      <p class="qtext">${ch.voice.done[0]}</p>
      <div class="scorebar" style="margin-bottom:22px">
        <span>Score<b>${score} / ${round}</b></span>
        <span>Accuracy<b>${pct}%</b></span>
        <span>Best streak<b>${best}</b></span>
      </div>
      <div class="sfoot">
        <button class="btn pri" data-again>Play again</button>
        <button class="btn" data-fresh>New problems</button>
        <a class="btn" href="${base()}/print/${activity.id}/?seed=${seed}">Print this as a sheet</a>
      </div>`;
    host.querySelector('[data-again]').addEventListener('click', () => { round = 0; score = 0; streak = 0; over = false; if (timed) startTimer(); paint(); });
    host.querySelector('[data-fresh]').addEventListener('click', () => { seed = newSeed(); round = 0; score = 0; streak = 0; over = false; paint(); });
    paintBar();
  }

  document.addEventListener('characterchange', (e) => {
    ch = getCharacter(e.detail.id);
    // Georgie likes timers; Kiwi does not. Respect the character's default only
    // before the first round, never mid-game.
    if (round === 0 && !over) { timed = ch.timers === true; clearInterval(tHandle); tHandle = null; if (timed) startTimer(); }
    if (!over) paint();
  });

  writeSeed(seed);
  timed = ch.timers === true;
  paint();
}
