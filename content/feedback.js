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

// Where a reader without JavaScript ends up: the same form, unfilled.
export const plainUrl = (kindId) => {
  const kind = kindById(kindId);
  return kind ? `https://github.com/${REPO}/issues/new?labels=${encodeURIComponent(kind.tag)}` : null;
};
