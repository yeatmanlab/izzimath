// Game player. Rounds, score, streak. Timers are OFF by default and always
// optional — see docs/EVIDENCE.md on the timed-practice question. A game is
// never a test, so a wrong answer costs a life, not a grade.
//
// ---------------------------------------------------------------------------
// Why the HUD carries the goal, and the start screen does not
//
// Children testing this could not always say what the point of a game was. The
// obvious fix — explain it on the start screen — is the wrong one twice over.
//
// First, the tutorial literature is consistent that mechanics are taught
// through the interface rather than announced: Super Mario Bros World 1-1 is
// the standard example, teaching every mechanic without a word of instruction
// by the placement of the obstacles themselves.
//
// Second, and more decisive here, the serious-games meta-analyses find that
// added explanatory apparatus can actively cost you: extraneous processing
// competes for the same limited capacity as the maths, and one trial found
// students given an extra self-explaining mechanic showed HIGHER extraneous
// load and WORSE outcomes. A wall of pre-game text is the thing a child skips
// and the thing that crowds out the learning.
//
// So the start screen got shorter, not longer, and the goal moved into the HUD:
//
//   "Right 3 / 10"   states the objective by existing. "Score 3" does not.
//   a progress bar   gives proximity to the goal, which is the one lever the
//                    goal-gradient work (Hull 1932; Kivetz et al. 2006) says
//                    reliably accelerates effort. Stated honestly: that
//                    evidence is consumer loyalty cards, not children's maths.
//   streak appears   only once there IS one, so it reads as something earned
//                    rather than a counter sitting mysteriously at zero.
//   the clock        sits in the HUD when it is running, not in the page
//                    chrome next to the seed, so "go fast" is legible as the
//                    goal rather than inferred from a small button.
// ---------------------------------------------------------------------------

import { renderProblem } from './render.js';
import { rng, deriveSeed } from '../lib/rng.js';
import { readSeed, writeSeed, newSeed, base } from '../lib/url.js';
import { getCharacter } from '../../content/characters.js';
import { currentCharacter } from '../lib/theme.js';
import { avatar } from '../lib/sprites.js';
import { celebrate, streakNote } from './celebrate.js';
import { ladderConfig, initState, record, tierFor, atTop, memoryStore } from '../lib/ladder.js';

export function mountGame(activity, root) {
  const host = root.querySelector('[data-stage]');
  const bar = root.querySelector('[data-bar]');
  let started = false;
  let seed = readSeed(4242);
  let ch = getCharacter(currentCharacter());
  const total = activity.rounds ?? 12;
  /* The target. Without one, a score has no endpoint and there is nothing to be
     near — which is the whole mechanism the goal-gradient work describes. Four
     fifths of the rounds is reachable on a skill you have already met, which is
     the only kind of skill a game here is for. Missing it still ends warmly:
     a game is not a test. */
  const target = Math.max(2, Math.round(total * 0.8));
  let round = 0, score = 0, streak = 0, best = 0, over = false;
  let timed = false, tLeft = 0, tHandle = null;

  /* Adaptive difficulty, where the item space has the depth for it. The ladder
     chooses which difficulty index to serve; the round counter still drives the
     seed. Both matter: if the SEED followed the level, holding a level would
     serve the identical problem over and over. */
  const lad = ladderConfig(activity);
  const store = memoryStore();
  let ladState = lad ? initState(lad) : null;
  let deepest = 0;   // deepest RUNG reached this run

  const levelNow = () => (lad ? ladState.level : round);

  const problemFor = (i, level = i) => {
    const sd = deriveSeed(seed, `r${i}`);
    return activity.generate(sd, level, ch, rng(sd), seed);
  };

  function paintBar() {
    bar.innerHTML = `
      <h2>${activity.title}</h2>
      <span class="tag">Round ${Math.min(round + 1, total)} of ${total}</span>
      <div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${round}"><i style="width:${(round / total) * 100}%"></i></div>
      ${activity.timerAvailable === false ? '' : `<button class="btn sm" data-timer aria-pressed="${timed}">${
        // Before the first round tLeft is still 0, and "0s" reads as no time
        // left rather than a timer waiting to start.
        timed ? (tHandle ? `⏱ ${tLeft}s` : '⏱ Timer on') : '⏱ Timer off'}</button>`}
      <span class="seed">seed ${seed}</span>
      <a class="btn sm" href="${base()}/print/${activity.id}/?seed=${seed}">Print version</a>`;
    bar.querySelector('[data-timer]')?.addEventListener('click', toggleTimer);
  }

  function toggleTimer() {
    timed = !timed;
    clearInterval(tHandle); tHandle = null;
    // Turning the timer on from the start screen must not start it ticking
    // before the child has pressed play — it repaints so the screen reflects
    // the choice, and startTimer runs when the round does.
    if (!started) return paint();
    if (timed) startTimer(); else paint();
  }
  function startTimer() {
    tLeft = Math.min(90, Math.max(60, activity.seconds || 60));
    clearInterval(tHandle);
    tHandle = setInterval(() => {
      tLeft--;
      if (tLeft <= 0) { clearInterval(tHandle); tHandle = null; finish('Time!'); }
      else { paintBar(); paintClock(); }
    }, 1000);
    paintBar(); paintClock();
  }

  // The strategy card. WWC's guidance on fluency practice is explicit that a
  // timed activity must never introduce a concept and must never run without
  // reminding the child of the taught strategy first — the with-strategy versus
  // without-strategy contrast is a larger effect than timing itself.
  function paintStart() {
    paintBar();
    const st = activity.strategy;
    // The title was already the page heading; repeating it here wasted the one
    // line a child actually reads. That line now says what to DO.
    const timerable = activity.timerAvailable !== false;
    host.innerHTML = `
      <div class="qnum">How to play</div>
      ${ch.id === 'none' ? '' : avatar(ch.id, 'bigface', 'idle')}
      <p class="qtext">${activity.goal || activity.blurb || activity.title}</p>
      <p class="gaim">${lad
        ? `It gets harder when you get them right. See how deep you can get \u2014 the top is <b>${(lad.tiers ?? ['','','','the very hard ones'])[3] || 'the very hard ones'}</b>.`
        : `Get <b>${target}</b> of <b>${total}</b> right.`}${
        timerable
          ? timed
            ? ` The clock is <b>on</b> &mdash; ${Math.min(90, Math.max(60, activity.seconds || 60))} seconds, so go as fast as you can.`
            : ' The clock is <b>off</b>, so take as long as you like.'
          : ' There is no clock on this one.'}</p>
      ${st ? `<div class="strat">
        <h3>${st.name}</h3>
        <p>${st.text}</p>
      </div>` : ''}
      <div class="sfoot">
        <button class="btn pri" data-go>Start playing</button>
        ${timerable ? `<button class="btn" data-timer2>${timed ? '⏱ Turn the clock off' : '⏱ Race the clock'}</button>` : ''}
        <a class="btn" href="${base()}/grades/${activity.grade}/">Learn it first</a>
      </div>`;
    host.querySelector('[data-timer2]')?.addEventListener('click', toggleTimer);
    host.querySelector('[data-go]').addEventListener('click', () => {
      started = true;
      // A race needs a starting gun. Two reasons, one of them fairness: with
      // the clock on, it used to start the instant this button was pressed, so
      // the first round was spent orienting rather than answering. The other is
      // legibility — three beats and "Go!" announce that the mode has changed
      // to a race without a sentence of explanation, which is the interface
      // doing the telling. Untimed games get no countdown, because nothing
      // should imply speed where speed is not the point.
      if (timed) countdown(() => { startTimer(); paint(); });
      else paint();
    });
  }

  /* Three beats and a Go. Held deliberately short: it is a boundary marker, not
     a cutscene, and anything longer becomes a thing to sit through. Announced to
     assistive tech via aria-live, and the scale animation is skipped for anyone
     who has asked for reduced motion. */
  let countHandle = null;
  function countdown(then) {
    let n = 3;
    paintBar();
    const beat = () => {
      // The numeral IS the count, so the caption must not repeat it — "Ready to
      // race — 3" above a giant 3 says the same thing twice. The caption stays
      // constant and a screen-reader-only live region carries the count, which
      // is the only place the number needs saying in words.
      host.innerHTML = `<div class="gcount">
        <span class="gc-num${n === 0 ? ' go' : ''}" aria-hidden="true">${n > 0 ? n : 'Go!'}</span>
        <p class="gc-cap" aria-hidden="true">${n > 0 ? 'Ready to race the clock' : ''}</p>
        <span class="sr" role="status" aria-live="assertive">${n > 0 ? n : 'Go!'}</span>
      </div>`;
      if (n === 0) { countHandle = setTimeout(then, 420); return; }
      n--;
      countHandle = setTimeout(beat, 640);
    };
    beat();
  }

  /* The clock is updated in place every second rather than by repainting the
     round, which would rebuild the problem under the child's hands. */
  function paintClock() {
    const el = host.querySelector('[data-clock]');
    if (el) el.textContent = `${tLeft}s`;
  }

  /* The HUD. Three things at most, and every one of them says what it is:
     how many you have got right out of the number you are going for, how close
     that is, and — only when it is running — the clock. */
  function hud() {
    // On an adaptive game the goal is DEPTH, not count. The controller's job is
    // to hold success near 80-85%, so a count-based goal is close to a constant
    // exactly when the adaptivity is working — the thing that actually varies is
    // how far up the ladder the child got.
    const side = `<div class="gh-side">
        ${streak >= 2 ? `<span class="gh-streak">${streak} in a row</span>` : ''}
        ${timed && tHandle ? `<span class="gh-clock">⏱ <b data-clock>${tLeft}s</b></span>` : ''}
      </div>`;

    if (lad) {
      const t = tierFor(lad, ladState.step);
      const top = atTop(ladState);
      return `<div class="ghud">
        <div class="gh-goal">
          <span class="gh-label">You are on</span>
          <b class="gh-tier">${t.name}</b>
          ${top ? '<span class="gh-hit">top of the ladder!</span>' : ''}
        </div>
        <div class="gh-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"
          aria-valuenow="${t.pct}" aria-label="Difficulty: ${t.name}"><i style="width:${Math.max(4, t.pct)}%"></i></div>
        ${side}
      </div>`;
    }

    const pct = Math.min(100, (score / target) * 100);
    const hit = score >= target;
    return `<div class="ghud">
      <div class="gh-goal">
        <span class="gh-label">Right</span>
        <b>${score}</b> <span class="gh-of">of ${target}</span>
        ${hit ? '<span class="gh-hit">target hit!</span>' : ''}
      </div>
      <div class="gh-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${target}"
        aria-valuenow="${Math.min(score, target)}" aria-label="Right ${score} of ${target}"><i style="width:${pct}%"></i></div>
      ${side}
    </div>`;
  }

  function paint() {
    if (!started) return paintStart();
    if (round >= total) return finish();
    paintBar();
    const p = problemFor(round, levelNow());
    host.innerHTML = `
      ${hud()}
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
      if (lad) {
        ladState = record(lad, ladState, ok);
        store.set(activity.id, ladState);   // memory today, an account later
        deepest = Math.max(deepest, ladState.step);
      }
      const voice = ok ? ch.voice.correct : ch.voice.wrong;
      const fb = document.createElement('div');
      fb.style.marginTop = '20px';
      // On a miss, show the working rather than just marking it wrong. Bare
      // correct/incorrect feedback is worth g=0.05; with an explanation it is
      // g=0.49. The pause is longer so there is time to read it.
      const worked = !ok && p.explain
        ? `<p class="fb hint" style="margin-top:10px"><span aria-hidden="true">◆</span><span>${p.explain}</span></p>`
        : '';
      const face = ch.id === 'none' ? `<span aria-hidden="true">${ok ? '✦' : '↻'}</span>`
        : avatar(ch.id, `react${ok ? ' pop' : ''}`, ok ? 'happy' : 'think');
      fb.innerHTML = `<p class="fb ${ok ? 'good' : 'bad'}">${face}<span>${voice[round % voice.length]}</span></p>${worked}`;
      slot.querySelector('[data-fbbox]')?.remove();
      fb.dataset.fbbox = '1';
      slot.appendChild(fb);
      if (ok) { celebrate(slot, ch); streakNote(slot, streak); }
      setTimeout(() => { round++; paint(); }, ok ? 620 : (worked ? 3200 : 1500));
    });
  }

  function finish(reason) {
    over = true;
    clearInterval(tHandle); tHandle = null;
    window.__izziProfile?.noteProgress(activity.id, {
      played: true, right: score, streak: best, tier: lad ? deepest : 0,
    });
    window.__izziProfile?.offerToKeepScore();
    const pct = total ? Math.round((score / Math.max(round, 1)) * 100) : 0;
    // The screen closes the loop on the goal the HUD stated. Missing the target
    // is reported as a number to beat, not as a fail: a game is for getting
    // quicker at something already met, so the useful next move is another go.
    const hit = score >= target;
    const tier = lad ? tierFor(lad, deepest) : null;
    host.innerHTML = `
      <div class="qnum">${reason || (lad ? 'How deep you got' : (hit ? 'Target hit' : 'Round complete'))}</div>
      ${ch.id === 'none' ? '' : avatar(ch.id, 'bigface', 'happy')}
      <p class="qtext">${lad
        ? `You got to <strong>${tier.name}</strong>.`
        : (hit ? ch.voice.done[0] : `You got ${score}. The target was ${target} &mdash; have another go?`)}</p>
      <div class="scorebar" style="margin-bottom:22px">
        ${lad
          ? `<span>Deepest<b>${tier.name}</b></span>
             <span>Right<b>${score} / ${round}</b></span>
             <span>Best streak<b>${best}</b></span>`
          : `<span>Right<b>${score} / ${target}</b></span>
             <span>Accuracy<b>${pct}%</b></span>
             <span>Best streak<b>${best}</b></span>`}
      </div>
      ${lad ? `<p style="color:var(--txt3);font-size:12.5px;margin:-8px 0 18px">
        This one got harder as you got them right. Nothing is saved &mdash; it starts fresh next time.</p>` : ''}
      <div class="sfoot">
        <button class="btn pri" data-again>Play again</button>
        <button class="btn" data-fresh>New problems</button>
        <a class="btn" href="${base()}/print/${activity.id}/?seed=${seed}">Print this as a sheet</a>
      </div>`;
    const resetRun = () => {
      round = 0; score = 0; streak = 0; over = false;
      if (lad) { ladState = initState(lad); deepest = 0; }
    };
    host.querySelector('[data-again]').addEventListener('click', () => { resetRun(); if (timed) startTimer(); paint(); });
    host.querySelector('[data-fresh]').addEventListener('click', () => { seed = newSeed(); resetRun(); paint(); });
    paintBar();
  }

  document.addEventListener('characterchange', (e) => {
    clearTimeout(countHandle); countHandle = null;
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
