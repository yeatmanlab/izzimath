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
  // Lands in the issue tracker where the work actually happens. Needs a
  // GitHub account, which most parents will not have.
  github: { on: true },

  // Any hosted form that accepts anonymous responses — a Google Form writing to
  // a Sheet, for instance. Set `url` and this becomes the primary route, because
  // it is the only one that asks the reader for nothing. If the form has a field
  // for the page address, put its prefill parameter name in `pageField` and the
  // page is filled in for them.
  form: { on: false, url: '', pageField: '', label: 'Send without an account' },

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
  needsAccount: 'Opens GitHub, where you press Send. A free GitHub account is needed.',
  // Shown in the form, where the alternatives are.
  noAccount: 'Do not have one? Copy the text instead and send it however suits you.',
  copy: 'Copy',
  copied: 'Copied. Paste it wherever suits you.',
  copyFailed: 'Could not copy — the text is selected, so ⌘C or Ctrl+C will do it.',
  share: 'Share',
  kinds: [
    {
      id: 'feature',
      tag: 'enhancement',
      label: 'Suggest a new feature',
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
  submit: 'Open GitHub to send',
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

/* A prefilled link to the hosted form, when one is configured. Google Forms and
   most others take prefill values as query parameters, so the shape is the same
   whichever service it is. */
export function formUrl(page = '') {
  const r = ROUTES.form;
  if (!r.on || !r.url) return null;
  if (!r.pageField || !page) return r.url;
  const sep = r.url.includes('?') ? '&' : '?';
  return `${r.url}${sep}${encodeURIComponent(r.pageField)}=${encodeURIComponent(page)}`;
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

// Where a reader without JavaScript ends up: the same form, unfilled.
export const plainUrl = (kindId) => {
  const kind = kindById(kindId);
  return kind ? `https://github.com/${REPO}/issues/new?labels=${encodeURIComponent(kind.tag)}` : null;
};
