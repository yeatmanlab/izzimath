// The pinned "Make a suggestion" button.
//
// Two layers, and the split matters:
//
//   The MENU opens on hover, on focus and on tap, and is not a dialog. Hovering
//   must never trap focus or dim the page — a menu that grabs the keyboard
//   because the pointer drifted over it is hostile. The menu works with
//   JavaScript switched off, because it is real markup revealed by :hover and
//   :focus-within, and its two items are ordinary links to GitHub's issue form.
//
//   The FORM is a dialog, and behaves like one: focus trap, Escape closes,
//   focus goes back where it came from.
//
// Nothing is submitted from here. The form builds a prefilled GitHub URL and
// opens it; the reader presses Send there. See content/feedback.js for why.

import { FEEDBACK, MAX_CHARS, ROUTES, kindById, issueUrl, formUrl, mailUrl }
  from '../../content/feedback.js';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const root = document.querySelector('[data-feedback]');
if (root) {
  const trigger = root.querySelector('[data-fbk-open]');
  const menu = root.querySelector('[data-fbk-menu]');
  let dialog = null;
  let returnFocusTo = null;
  let hoverTimer = null;

  /* ------------------------------------------------------------------ menu */
  const setOpen = (on) => {
    root.toggleAttribute('data-open', on);
    trigger?.setAttribute('aria-expanded', String(on));
  };
  const isOpen = () => root.hasAttribute('data-open');
  /* An explicit dismissal — Escape, or a click outside — has to outrank the
     :hover and :focus-within rules, or closing the menu and putting focus back
     on the trigger re-opens it on the spot. Cleared the moment the pointer or
     focus leaves, so the widget is never stuck shut. */
  const shut = (on) => root.toggleAttribute('data-shut', on);
  const dismiss = () => { setOpen(false); shut(true); };

  trigger?.addEventListener('click', (e) => {
    e.preventDefault();
    shut(false);
    setOpen(!isOpen());
  });
  root.addEventListener('focusout', () => {
    // In a frame, because activeElement is still the outgoing node right here.
    requestAnimationFrame(() => { if (!root.contains(document.activeElement)) shut(false); });
  });

  /* Hover only where hovering is a real thing a pointer does. A touch browser
     reports coarse pointers and synthesises hover on tap, so gating this keeps
     a tap from opening and immediately closing the menu. */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    /* On the BUTTON, not the container. The container is as tall as the menu it
       holds, so listening there opened the menu whenever the pointer came near
       the bottom-right corner of the page rather than onto the button itself. */
    trigger?.addEventListener('mouseenter', () => { clearTimeout(hoverTimer); shut(false); setOpen(true); });
    // Moving up into an open menu must not count as leaving.
    menu?.addEventListener('mouseenter', () => clearTimeout(hoverTimer));
    // A short grace period, so the pointer can cross the gap from the button to
    // the menu without the menu vanishing under it.
    root.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => { if (!dialog) { setOpen(false); shut(false); } }, 260);
    });
  }

  document.addEventListener('click', (e) => {
    if (!isOpen() || dialog) return;
    if (!root.contains(e.target)) dismiss();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen() && !dialog) { dismiss(); trigger?.focus(); }
  });

  /* ------------------------------------------------------------------ form */
  function closeDialog({ restore = true } = {}) {
    document.removeEventListener('keydown', onKey);
    dialog?.remove(); dialog = null;
    setOpen(false); shut(true);
    if (restore && returnFocusTo?.isConnected) { try { returnFocusTo.focus(); } catch { /* gone */ } }
    returnFocusTo = null;
  }

  function onKey(e) {
    if (e.key === 'Escape') { closeDialog(); return; }
    if (e.key !== 'Tab' || !dialog) return;
    const items = [...dialog.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openForm(kindId) {
    const kind = kindById(kindId);
    if (!kind) return;
    const active = document.activeElement;
    returnFocusTo = active && active !== document.body && active.isConnected ? active : trigger;
    const page = location.pathname + location.search;

    dialog = document.createElement('div');
    dialog.className = 'fbk-wrap noprint';
    dialog.innerHTML = `<div class="fbk-bg" data-fbk-close></div>
      <form class="fbk-panel" role="dialog" aria-modal="true" aria-labelledby="fbk-h" novalidate>
        <button type="button" class="fbk-x" data-fbk-close aria-label="Close">&times;</button>
        <h2 id="fbk-h">${esc(kind.label)}</h2>
        <label class="fbk-ask" for="fbk-t">${esc(kind.ask)}</label>
        <textarea id="fbk-t" data-fbk-text rows="5" maxlength="${MAX_CHARS}"
          placeholder="${esc(kind.placeholder)}" required></textarea>
        <p class="fbk-count"><span data-fbk-count>0</span> / ${MAX_CHARS}</p>
        <p class="fbk-note" data-fbk-why>${esc(kind.invite)}</p>
        <p class="fbk-priv">${esc(FEEDBACK.privacy)}<br><code>${esc(page)}</code></p>
        <div class="fbk-foot">
          ${ROUTES.form.on ? `<a class="btn go" data-fbk-form target="_blank" rel="noopener">${esc(kind.label)}</a>` : ''}
          ${ROUTES.email.on ? `<a class="btn go" data-fbk-mail>${esc(kind.label)}</a>` : ''}
          ${ROUTES.github.on ? `<button type="submit" class="btn go" data-fbk-send>${esc(kind.label)}</button>` : ''}
        </div>
        <p class="fbk-priv">${esc(FEEDBACK.sending)}</p>
      </form>`;
    document.body.appendChild(dialog);
    document.addEventListener('keydown', onKey);
    dialog.querySelectorAll('[data-fbk-close]').forEach((el) =>
      el.addEventListener('click', () => closeDialog()));

    const text = dialog.querySelector('[data-fbk-text]');
    const send = dialog.querySelector('[data-fbk-send]');
    const why = dialog.querySelector('[data-fbk-why]');
    const count = dialog.querySelector('[data-fbk-count]');

    /* A dead button with no reason given is the thing to avoid here: the note
       under the box says what is missing, and it is in the accessible
       description of the button rather than only next to it. */
    const sync = () => {
      const ok = text.value.trim().length >= 10;
      if (send) send.disabled = !ok;
      why.hidden = ok;
      count.textContent = String(text.value.length);
      // The alternative routes are links, so they are disabled by removing the
      // href rather than by an attribute buttons understand.
      const fu = ok ? formUrl(kindId, text.value, page) : null;
      const mu = ok ? mailUrl(kindId, text.value, page) : null;
      const setHref = (sel, url) => {
        const el = dialog.querySelector(sel);
        if (!el) return;
        if (url) el.href = url; else el.removeAttribute('href');
        el.setAttribute('aria-disabled', String(!url));
      };
      setHref('[data-fbk-form]', fu);
      setHref('[data-fbk-mail]', mu);
    };
    why.id = 'fbk-why';
    // Describe whichever control is actually the primary action: with the
    // GitHub route off there is no submit button and this pointed at nothing.
    dialog.querySelector('[data-fbk-form], [data-fbk-mail], [data-fbk-send]')
      ?.setAttribute('aria-describedby', 'fbk-why');
    text.addEventListener('input', sync);

    sync();

    dialog.querySelector('form, .fbk-panel')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!ROUTES.github.on) return;
      const url = issueUrl(kindId, text.value, page);
      if (!url) { sync(); text.focus(); return; }
      window.open(url, '_blank', 'noopener,noreferrer');
      closeDialog();
    });

    text.focus();
  }

  root.querySelectorAll('[data-fbk-kind]').forEach((el) => {
    el.addEventListener('click', (e) => {
      // Without JavaScript these are plain links to the same form on GitHub, so
      // the default is only prevented once there is something better to do.
      e.preventDefault();
      openForm(el.dataset.fbkKind);
    });
  });
}
