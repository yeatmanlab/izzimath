// Warm-up player. The third shape, after book.js and game.js.
//
// A routine is NOT SCORED, and that is not a simplification — it is the point.
// Nothing here moves the progress bar, earns a badge or blocks the way to the
// book. Which One Doesn't Belong goes further and has no wrong answer at all:
// all four are defensible, so marking a cell would turn it back into the
// multiple-choice question it exists instead of.
//
// A Number Talk is different and the difference is easy to get wrong. 6 + 4 is
// ten and nothing else, so the routine does have a right answer — what it does
// not have is a MARK. Every answer is said, then written up, and only then
// discussed. For a while that got mistranslated into a screen that took no
// answer at all, which a first grader spotted at once: a question, and under
// it one button reading "Show me". See renderReveal.
//
// The UI is chosen by the routine's own `ui` field, not by a flag inside one
// renderer: adding an eighth routine should mean adding a renderer here and an
// entry in content/routines.js, and touching nothing else.

const el = (html) => {
  const d = document.createElement('div');
  d.innerHTML = html.trim();
  return d.firstElementChild;
};

/* The child's own typing is the one string on this screen that did not come
   from content/, so it is the one that gets escaped before it goes back into
   the page. */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ------------------------------------------------------------------- reveal
   Number Talk. One expression at a time, answer hidden until asked for —
   revealing the whole string at once turns it into a worksheet, and the order
   is the teaching.

   AND IT TAKES AN ANSWER, which it did not. A first grader met "What is 6 + 4?"
   with one button under it reading "Show me", and reported that there was no
   way to respond. That was exactly right. On paper this routine prints on the
   ADULT's key, because the adult reads it out and the child answers out loud;
   on screen there is no adult, so the page has to be both the one who asks and
   the one who listens. Answering is also the routine's own second move: think
   silently, then say your answer, and every answer goes up BEFORE any of them
   is discussed.

   What the box is NOT matters as much as that it is there. Nothing is scored,
   nothing is gated, no answer is crossed out, and "just show me" stays one
   press away — a child who cannot get there must not be stuck in the warm-up.
   An answer that does not match gets the same thing a matching one gets, which
   is the METHOD, because the method is the whole reason the string exists. */
function renderReveal(host, w, onDone) {
  let at = 0;              // which step is showing
  let shown = false;       // is its answer revealed
  let closing = false;
  let arrived = false;     // has this been painted once
  const said = [];         // what the child answered, per step — never scored

  const list = el('<ol class="rt-steps"></ol>');
  /* Live, because the verdict replaces the question in place and a child using
     a reader would otherwise get no sign that pressing the button did
     anything. The panel element itself survives every paint; only its innards
     are replaced, which is what makes the announcement fire. */
  const panel = el('<div class="rt-panel" aria-live="polite"></div>');
  const foot = el('<div class="rt-foot"></div>');

  /* Number, not string: "10 " and "010" are the ten they meant. */
  const matches = (v, answer) => Number(String(v).trim()) === answer;

  /* What comes back. Never a mark — it says what they said and what it comes
     to, then the method. A right answer and a wrong one get the same method,
     because that is the part worth having either way. */
  const verdict = (s, mine) => {
    const head = mine == null
      ? `It comes to <strong>${s.answer}</strong>.`
      : matches(mine, s.answer)
        ? `<strong>${s.answer}</strong>. That is it.`
        : `You said ${esc(mine)}. It comes to <strong>${s.answer}</strong>.`;
    return `<p class="rt-wait rt-mine">${head}</p><p class="rt-hidden">${s.explain}</p>`;
  };

  const answerBox = () => `<p class="rt-wait" data-wait>Work it out in your head, then put it in the box.</p>
    <div class="ansrow">
      <input class="ans" type="text" name="izzi-warmup" inputmode="decimal"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
        data-1p-ignore data-lpignore="true" data-bwignore data-form-type="other"
        aria-label="Your answer" placeholder="?" maxlength="6">
    </div>`;

  function paint() {
    list.innerHTML = w.steps.map((s, k) => {
      const settled = k < at || (k === at && shown);
      return `<li class="${k < at ? 'done' : k === at ? 'now' : 'later'}">
        <span class="rt-n" aria-hidden="true">${k + 1}</span>
        <span class="rt-expr">${k <= at ? s.expr : '·····'}</span>
        ${settled ? `<span class="rt-ans">${s.answer}</span>` : ''}</li>`;
    }).join('');

    if (closing) {
      panel.innerHTML = `<p class="rt-ask">${w.close.prompt}</p>
        <p class="rt-wait">Say what you notice out loud. This one has no box.</p>
        <p class="rt-hidden" data-syn hidden>${w.close.synthesis}</p>`;
      foot.innerHTML = `<button class="btn go" data-syn-show>Show me what to notice</button>
        <button class="btn pri" data-done>Start the book &rarr;</button>`;
    } else {
      const s = w.steps[at];
      panel.innerHTML = `<p class="rt-ask">What is <strong>${s.expr}</strong>?</p>
        ${shown ? verdict(s, said[at]) : answerBox()}`;
      foot.innerHTML = shown
        ? `<button class="btn pri" data-next>${at === w.steps.length - 1 ? 'Now compare two &rarr;' : 'Next one &rarr;'}</button>`
        : `<button class="btn go" data-say>That is my answer</button>
           <button class="btn sm" data-show>Not sure &mdash; just show me</button>`;
    }

    const box = panel.querySelector('.ans');
    const record = () => {
      const v = (box?.value || '').trim();
      if (!v) {
        /* Not a telling-off. The box is the only thing missing, so say that
           and put the cursor back in it. */
        panel.querySelector('[data-wait]').textContent = 'Put your answer in the box first.';
        box?.focus();
        return;
      }
      said[at] = v; shown = true; paint();
    };
    box?.addEventListener('keydown', (e) => { if (e.key === 'Enter') record(); });
    foot.querySelector('[data-say]')?.addEventListener('click', record);
    foot.querySelector('[data-show]')?.addEventListener('click', () => { shown = true; paint(); });
    foot.querySelector('[data-next]')?.addEventListener('click', () => {
      if (at === w.steps.length - 1) closing = true;
      else { at++; shown = false; }
      paint();
    });
    foot.querySelector('[data-syn-show]')?.addEventListener('click', (ev) => {
      panel.querySelector('[data-syn]').hidden = false;
      ev.target.remove();
    });
    foot.querySelector('[data-done]')?.addEventListener('click', onDone);

    /* Put the cursor in the box when the child moves ON to a step, but never on
       arrival: an input focused at page load throws up the iPad keyboard over a
       question nobody has read yet. */
    if (arrived) box?.focus();
    arrived = true;
  }

  host.append(list, panel, foot);
  paint();
}

/* --------------------------------------------------------------------- grid
   Which One Doesn't Belong. A 2x2 of items, every one of which has a defence.
   Tapping one shows that defence and says so — it never says "correct", because
   three other taps would have been just as correct. */
function renderGrid(host, w, onDone) {
  const picked = new Set();
  const grid = el('<div class="rt-grid" role="group" aria-label="Four things — pick the odd one out"></div>');
  const panel = el('<div class="rt-panel"></div>');
  const foot = el('<div class="rt-foot"></div>');

  w.items.forEach((it, k) => {
    const b = el(`<button type="button" class="rt-cell" data-k="${k}">${it.label}</button>`);
    b.addEventListener('click', () => {
      picked.add(k);
      b.classList.add('picked');
      panel.innerHTML = `<p class="rt-ask"><strong>${it.label}</strong> works &mdash; ${it.why}.</p>
        <p class="rt-wait">${picked.size < w.items.length
          ? 'So do the others. Try another one.'
          : 'All four of them work, and each for a different reason.'}</p>`;
      paint();
    });
    grid.appendChild(b);
  });

  function paint() {
    foot.innerHTML = `${picked.size >= 2
      ? `<button class="btn go" data-syn-show>Could someone else be right?</button>` : ''}
      <button class="btn ${picked.size ? 'pri' : 'sm'}" data-done>Start the book &rarr;</button>`;
    foot.querySelector('[data-syn-show]')?.addEventListener('click', (ev) => {
      panel.insertAdjacentHTML('beforeend',
        `<p class="rt-hidden">${w.close.prompt} ${w.close.synthesis}</p>`);
      ev.target.remove();
    });
    foot.querySelector('[data-done]')?.addEventListener('click', onDone);
  }

  panel.innerHTML = `<p class="rt-wait">Pick one, then say why out loud.</p>`;
  host.append(grid, panel, foot);
  paint();
}

const UIS = { reveal: renderReveal, grid: renderGrid };

/* Render a warm-up into `host`. Returns false if the routine's UI is unknown, so
   a caller can fall straight through to the book rather than showing a blank
   screen. */
export function renderRoutine(host, w, onDone) {
  const draw = UIS[w.ui];
  if (!draw) return false;
  host.innerHTML = '';
  host.appendChild(el(`<div class="rt-head">
    <p class="rt-kind">${w.name}</p>
    <p class="rt-intro">${w.intro}</p>
    ${w.target ? `<p class="rt-target"><span aria-hidden="true">◆</span><span>${w.target}</span></p>` : ''}
  </div>`));
  const body = el('<div class="rt-body"></div>');
  host.appendChild(body);
  draw(body, w, onDone);
  return true;
}

export const ROUTINE_UIS = Object.keys(UIS);
