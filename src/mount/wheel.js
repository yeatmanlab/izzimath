// The grade pickers on the home page — one per card in "A look inside".
//
// Each column already holds all six of its cards, so switching grade is an
// attribute change rather than a request. With JavaScript off every number is an
// ordinary link to that grade's shelf, which is why they are anchors and not
// buttons; this takes the click and swaps the card instead.
//
// Scoped per column on purpose: three independent pickers, so a visitor can look
// at a game from one grade beside a workbook from another. Every string comes
// from the markup the build wrote — spelling out "2nd grade" here would put
// grade naming in two places.

for (const col of document.querySelectorAll('[data-wheel]')) {
  const tabs = [...col.querySelectorAll('[role="tab"]')];
  const panels = new Map(tabs.map((t) => [t.dataset.g, col.querySelector(`#${t.getAttribute('aria-controls')}`)]));

  const show = (g, { focus = false } = {}) => {
    for (const t of tabs) {
      const on = t.dataset.g === g;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    }
    for (const [key, panel] of panels) if (panel) panel.hidden = key !== g;
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => { e.preventDefault(); show(tab.dataset.g); });
    tab.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(tab);
      const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      show(tabs[Math.max(0, Math.min(tabs.length - 1, to))].dataset.g, { focus: true });
    });
  });
}
