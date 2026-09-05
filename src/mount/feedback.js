// The pinned "Make a suggestion" button.
//
// Two layers, and the split matters:
//
//   The MENU opens on hover, on focus and on tap, and is not a dialog. Hovering
//   must never trap focus or dim the page — a menu that grabs the keyboard
//   because the pointer drifted over it is hostile. The menu works with
//   JavaScript switched off, because it is real markup revealed by :hover and
//   :focus-within, and its two items are ordinary links to whichever route is
//   live — see ROUTES in content/feedback.js.
//
//   The FORM is a dialog, and behaves like one: focus trap, Escape closes,
//   focus goes back where it came from.
//
// Nothing is submitted from here. The form prefills the live route's own form
// and opens it; the reader presses Send there. See content/feedback.js for why.

import { FEEDBACK, MAX_CHARS, ROUTES, kindById, issueUrl, formUrl, mailUrl }
  from '../../content/feedback.js';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* What a screenshot would have shown that the URL does not: which question was
   on screen, which character, how wide the window was. Gathered from the DOM
   here, so content/feedback.js stays a pure string builder.

   The seed is already in the page address, and because the seed is the state it
   regenerates the exact problem the reporter was looking at — which is why a
   report of "Mon and Wed are the same height" needed no image to reproduce. */
/* GitHub's mark, inlined. Used to label a link that goes to GitHub, which is
   the use it exists for. One path, so it does not earn a place in sprites.js
   alongside the characters. */
const GH_MARK = `<svg class="ghmark" viewBox="0 0 16 16" aria-hidden="true" width="20" height="20"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.07-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A7.995 7.995 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`;

function context() {
  const out = [];
  const q = document.querySelector('.qnum, .sbar .tag')?.textContent?.trim();
  if (q) out.push(`On screen: ${q}`);
  /* Called "Activity:" whatever the page was, so a report from /grades/ said
     "Activity: All grades". The activity pages are the ones with a .stage. */
  const onActivity = !!document.querySelector('.stage');
  const title = document.querySelector('.stage h2, main h1')?.textContent?.trim();
  if (title) out.push(`${onActivity ? 'Activity' : 'Page'}: ${title}`);
  const ch = document.documentElement.dataset.ch;
  if (ch && ch !== 'none') out.push(`Character: ${ch}`);
  const lv = document.documentElement.dataset.lv;
  if (lv) out.push(`Level: ${lv}`);
  out.push(`Window: ${window.innerWidth} x ${window.innerHeight}`);
  return out;
}

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
    /* Two things this has to do before building anything.
       A second choice used to append a SECOND dialog and overwrite the
       reference to the first, which then stayed in the document forever with a
       live keydown listener and a duplicate set of ids — so `for="fbk-t"` and
       `aria-labelledby="fbk-h"` resolved to the stale panel. Not reachable by
       pointer, because the backdrop covers the menu, nor by Tab, because of the
       focus trap; reachable by anything that does not respect either.
       And the menu stayed open underneath, dimmed but present. */
    if (dialog) closeDialog({ restore: false });
    setOpen(false);
    const active = document.activeElement;
    returnFocusTo = active && active !== document.body && active.isConnected ? active : trigger;
    const page = location.pathname + location.search;
    const extra = context();

    dialog = document.createElement('div');
    dialog.className = 'fbk-wrap noprint';
    dialog.innerHTML = `<div class="fbk-bg" data-fbk-close></div>
      <div class="fbk-panel" role="dialog" aria-modal="true" aria-labelledby="fbk-h">
        <button type="button" class="fbk-x" data-fbk-close aria-label="Close">&times;</button>
        <h2 id="fbk-h">${esc(kind.label)}</h2>
        <label class="fbk-ask" for="fbk-t">${esc(kind.ask)}</label>
        <textarea id="fbk-t" name="izzi-suggestion" data-fbk-text rows="5" maxlength="${MAX_CHARS}"
          autocomplete="off" data-1p-ignore data-lpignore="true" data-bwignore data-form-type="other"
          placeholder="${esc(kind.placeholder)}" required></textarea>
        <p class="fbk-count"><span data-fbk-count>0</span> / ${MAX_CHARS}</p>
        <p class="fbk-note" data-fbk-why>${esc(kind.invite)}</p>
        <p class="fbk-priv">${esc(FEEDBACK.privacy)}<br><code>${esc(page)}</code>${
          extra.length ? `<br><code>${esc(extra.join(' · '))}</code>` : ''}</p>
        <div class="fbk-foot">
          <div class="fbk-split">
            ${ROUTES.form.on ? `<a class="fbk-main" data-fbk-form target="_blank" rel="noopener noreferrer">${esc(kind.label)}</a>` : ''}
            ${ROUTES.email.on ? `<a class="fbk-main" data-fbk-mail>${esc(kind.label)}</a>` : ''}
            ${ROUTES.github.on ? `<button type="button" class="fbk-gh" data-fbk-send
              aria-label="${esc(ROUTES.github.label ?? 'Submit via GitHub')}">
              <span class="fbk-gh-cap">submit via github</span>${GH_MARK}</button>` : ''}
          </div>
        </div>
        <p class="fbk-priv">${esc(FEEDBACK.sending)}</p>
      </div>`;
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
      const fu = ok ? formUrl(kindId, text.value, page, extra) : null;
      const mu = ok ? mailUrl(kindId, text.value, page, extra) : null;
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

    /* A click, not a form submit. Nothing here submits to anything — the URL is
       built and opened — so the panel does not need to be a <form>, and being
       one is a signal iOS uses when deciding to offer AutoFill. Whether that is
       the whole cause of the passwords-and-cards bar is unverified: it cannot be
       reproduced in a headless browser, and Safari's own AutoFill row is largely
       outside a page's control. This removes a real signal; it may not be
       enough. */
    dialog.querySelector('[data-fbk-send]')?.addEventListener('click', () => {
      if (!ROUTES.github.on) return;
      const url = issueUrl(kindId, text.value, page, extra);
      if (!url) { sync(); text.focus(); return; }
      window.open(url, '_blank', 'noopener,noreferrer');
      closeDialog();
    });

    text.focus();
  }

  root.querySelectorAll('[data-fbk-kind]').forEach((el) => {
    el.addEventListener('click', (e) => {
      // Without JavaScript these are plain links to the live route's own form,
      // so the default is only prevented once there is something better to do.
      e.preventDefault();
      openForm(el.dataset.fbkKind);
    });
  });
}
