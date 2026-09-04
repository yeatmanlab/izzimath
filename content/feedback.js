// The "Make a suggestion" button, and the GitHub issue it opens.
//
// This site has no backend and no secrets, so there is exactly one honest way to
// file an issue from a static page: GitHub's own new-issue URL, prefilled. The
// reader lands on GitHub with the title, body and label already filled in and
// presses Submit themselves. Nothing is posted from here, so there is no token
// to leak and no endpoint to spam.
//
// The cost of that is real and worth stating plainly: **it needs a GitHub
// account.** For the parents this site is aimed at, most will not have one. The
// alternatives all need infrastructure the project does not have — a serverless
// proxy to hold a token, or a form service — so this is the floor, not the
// ceiling, and the button says so before anyone types a paragraph.
//
// Labels are the two GitHub creates by default in every repository,
// `enhancement` and `bug`, so a prefilled link cannot reference a label that
// does not exist.

export const REPO = 'yeatmanlab/izzimath';

/* ------------------------------------------------------------------- routes
   Getting a suggestion from a reader to the author needs one of exactly three
   things, and there is no fourth: an account on something, an address the site
   publishes, or a third-party endpoint. Copy and share get the text out of the
   page but cannot supply a destination, so they are companions, not answers.

   Two of the three are switched off because they need something only the site's
   owner can decide. Turning either on is the edit below and nothing else —
   scripts/check.mjs enforces that an enabled route carries what it needs. */
export const ROUTES = {
  /* Off, and staying off while a route that needs no account exists. It filed
     into the issue tracker, which is convenient for whoever does the work and
     an account requirement for everybody else — and the site should not ask a
     parent to sign up for a developer tool to report a typo. The code is kept
     because turning it back on is one flag, but no reader sees the word. */
  github: { on: false },

  /* Any hosted form that takes anonymous responses. This is the PRIMARY route,
     because it is the only one that asks the reader for nothing at all.

     `textField` receives the whole formatted message — kind, text and page —
     which is why a one-question form is enough. `kindField` and `pageField` are
     optional: add matching questions to the form and they arrive as their own
     columns, which is worth doing if the responses ever need filtering or
     sorting. Field names are the `entry.NNNNNN` parameters, readable from the
     form's own public page.

     Verified against this form: the field is a PARAGRAPH question, so the line
     breaks survive; it takes responses without sign-in; and a prefilled link
     arrives with data-is-prepopulated="true" and the text intact. */
  form: {
    on: true,
    url: 'https://docs.google.com/forms/d/e/1FAIpQLScBnZX56VQl2Lf-yliWSiQySuQWJpRQTWaVfimikpYEIKdWTQ/viewform',
    textField: 'entry.1188449626',
    kindField: '',
    pageField: '',
    label: 'Send — no account needed',
  },

  // No third party at all, at the cost of publishing an address to scrapers.
  // The mount assembles it at click time rather than leaving it in the HTML,
  // which is mild obfuscation and not real protection — decide accordingly.
  email: { on: false, address: '', label: 'Send by email' },
};

export const enabledRoutes = () => Object.entries(ROUTES).filter(([, r]) => r.on).map(([k]) => k);

// GitHub's issue-creation URL is a GET, so the whole body travels in the query
// string. Long ones 414. 1200 characters is far more than a suggestion needs and
// leaves plenty of room under any limit.
export const MAX_CHARS = 1200;
const MAX_TITLE = 70;

export const FEEDBACK = {
  button: 'Make a suggestion',
  menuLabel: 'Make a suggestion',
  lead: 'Tell us what would make this better.',
  // Said before anyone types, not after — see the note at the top of this file.
  noSignIn: 'Opens in a new tab. No account, no sign-in, nothing to install.',
  sending: 'Opens a short form with your words already in it. Press Send there.',
  // Shown in the form, where the alternatives are.
  noAccount: 'Or copy it and send it however suits you.',
  copy: 'Copy',
  copied: 'Copied. Paste it wherever suits you.',
  copyFailed: 'Could not copy — the text is selected, so ⌘C or Ctrl+C will do it.',
  share: 'Share',
  kinds: [
    {
      id: 'feature',
      tag: 'enhancement',
      label: 'Suggest a feature',
      hint: 'A game, a worksheet, something that is missing.',
      ask: 'What would you like Izzi Math to do?',
      placeholder: 'A game where you build fractions from strips…',
      titlePrefix: 'Suggestion',
    },
    {
      id: 'bug',
      tag: 'bug',
      label: 'Report an issue',
      hint: 'Something looks wrong, prints wrong, or will not work.',
      ask: 'What went wrong?',
      placeholder: 'The answer key for Tens and Ones printed over two pages…',
      titlePrefix: 'Issue',
    },
  ],
  tooShort: 'A sentence or two, so we know what to change.',
  privacy: 'The page address below is included so we can find it. Nothing else about you is sent.',
};

export const kindById = (id) => FEEDBACK.kinds.find((k) => k.id === id) ?? null;
export const KIND_IDS = FEEDBACK.kinds.map((k) => k.id);

/* A one-line title out of whatever was typed. GitHub shows the title in every
   list, so "The answer key for Tens and Ones printed over…" is worth having
   over "Suggestion from the site". */
function titleFor(kind, text) {
  const firstLine = text.trim().split(/\r?\n/)[0].trim();
  const sentence = (firstLine.match(/^[^.!?]{1,}[.!?]?/) ?? [firstLine])[0].trim().replace(/[.!?]+$/, '');
  const short = sentence.length > MAX_TITLE ? sentence.slice(0, MAX_TITLE - 1).trimEnd() + '…' : sentence;
  return `${kind.titlePrefix}: ${short || 'from the site'}`;
}

/* Pure, and deliberately not in the mount: a URL builder that takes a string and
   returns a string can be tested in Node, and scripts/check.mjs does. */
export function issueUrl(kindId, text, page = '') {
  const kind = kindById(kindId);
  if (!kind) return null;
  const body = String(text ?? '').trim();
  if (body.length < 10) return null;          // the form blocks this too
  const clipped = body.length > MAX_CHARS ? body.slice(0, MAX_CHARS - 1) + '…' : body;
  const where = String(page ?? '').trim();
  const full = where ? `${clipped}\n\n---\nPage: ${where}` : clipped;
  const q = new URLSearchParams({
    labels: kind.tag,
    title: titleFor(kind, clipped),
    body: full,
  });
  return `https://github.com/${REPO}/issues/new?${q}`;
}

/* A prefilled link to the hosted form. Google Forms and most others take
   prefill values as query parameters, so the shape is the same whichever
   service it is: one parameter per field, `usp=pp_url` because that is what
   Google's own prefill links carry. */
export function formUrl(kindId, text, page = '') {
  const r = ROUTES.form;
  if (!r.on || !r.url) return null;
  const body = plainText(kindId, text, page);
  if (!body) return null;
  const kind = kindById(kindId);
  const q = new URLSearchParams({ usp: 'pp_url' });
  if (r.textField) q.set(r.textField, body);
  if (r.kindField) q.set(r.kindField, kind.label);
  if (r.pageField && page) q.set(r.pageField, page);
  const sep = r.url.includes('?') ? '&' : '?';
  return `${r.url}${sep}${q}`;
}

/* The body a reader copies, shares or mails: the same text the issue would
   carry, so no route loses information the others keep. */
export function plainText(kindId, text, page = '') {
  const kind = kindById(kindId);
  const body = String(text ?? '').trim();
  if (!kind || body.length < 10) return null;
  const clipped = body.length > MAX_CHARS ? body.slice(0, MAX_CHARS - 1) + '\u2026' : body;
  return `${kind.titlePrefix} — Izzi Math\n\n${clipped}${page ? `\n\nPage: ${page}` : ''}`;
}

export function mailUrl(kindId, text, page = '') {
  const r = ROUTES.email;
  const body = plainText(kindId, text, page);
  if (!r.on || !r.address || !body) return null;
  const kind = kindById(kindId);
  const q = new URLSearchParams({ subject: `Izzi Math — ${kind.titlePrefix}`, body });
  return `mailto:${r.address}?${q}`;
}

/* Where a reader without JavaScript ends up: the live route's own form,
   unfilled. It follows whichever route is on rather than naming one, so
   switching routes cannot leave the no-script path pointing at a dead end. */
export const plainUrl = (kindId) => {
  const kind = kindById(kindId);
  if (!kind) return null;
  if (ROUTES.form.on && ROUTES.form.url) return ROUTES.form.url;
  if (ROUTES.github.on) return `https://github.com/${REPO}/issues/new?labels=${encodeURIComponent(kind.tag)}`;
  if (ROUTES.email.on && ROUTES.email.address) return `mailto:${ROUTES.email.address}`;
  return null;
};
