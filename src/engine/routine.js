// Warm-up player. The third shape, after book.js and game.js.
//
// A routine is not scored and has no wrong answer — that is not a simplification,
// it is the point. A Number Talk is four expressions done in the head, and
// Which One Doesn't Belong has four defensible answers. Marking either would
// turn it back into the thing it exists instead of.
//
// The UI is chosen by the routine's own `ui` field, not by a flag inside one
// renderer: adding an eighth routine should mean adding a renderer here and an
// entry in content/routines.js, and touching nothing else.

const el = (html) => {
  const d = document.createElement('div');
  d.innerHTML = html.trim();
  return d.firstElementChild;
};

/* ------------------------------------------------------------------- reveal
   Number Talk. One expression at a time, answer hidden until asked for —
   revealing the whole string at once turns it into a worksheet, and the order
   is the teaching. */
function renderReveal(host, w, onDone) {
  let at = 0;              // which step is showing
  let shown = false;       // is its answer revealed
  let closing = false;

  const list = el('<ol class="rt-steps"></ol>');
  const panel = el('<div class="rt-panel"></div>');
  const foot = el('<div class="rt-foot"></div>');

  function paint() {
    list.innerHTML = w.steps.map((s, k) => `<li class="${
      k < at ? 'done' : k === at ? 'now' : 'later'}"><span class="rt-expr">${
      k <= at ? s.expr : '·····'}</span>${
      k < at || (k === at && shown) ? `<span class="rt-ans">${s.answer}</span>` : ''}</li>`).join('');

    if (closing) {
      panel.innerHTML = `<p class="rt-ask">${w.close.prompt}</p>
        <p class="rt-hidden" data-syn hidden>${w.close.synthesis}</p>`;
      foot.innerHTML = `<button class="btn go" data-syn-show>Show me what to notice</button>
        <button class="btn pri" data-done>Start the book &rarr;</button>`;
    } else {
      const s = w.steps[at];
      panel.innerHTML = `<p class="rt-ask">What is <strong>${s.expr}</strong>?</p>
        ${shown ? `<p class="rt-hidden">${s.explain}</p>` : '<p class="rt-wait">Work it out in your head first.</p>'}`;
      foot.innerHTML = shown
        ? `<button class="btn pri" data-next>${at === w.steps.length - 1 ? 'Now compare two &rarr;' : 'Next one &rarr;'}</button>`
        : '<button class="btn go" data-show>Show me</button>';
    }

    foot.querySelector('[data-show]')?.addEventListener('click', () => { shown = true; paint(); });
    foot.querySelector('[data-next]')?.addEventListener('click', () => {
      if (at === w.steps.length - 1) closing = true;
      else { at++; shown = false; }
      paint();
      panel.querySelector('.rt-ask')?.focus?.();
    });
    foot.querySelector('[data-syn-show]')?.addEventListener('click', (ev) => {
      panel.querySelector('[data-syn]').hidden = false;
      ev.target.remove();
    });
    foot.querySelector('[data-done]')?.addEventListener('click', onDone);
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
