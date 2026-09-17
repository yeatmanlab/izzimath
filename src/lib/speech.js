/* Reading the site out loud.
 *
 * WHY THIS EXISTS, AND IT IS NOT A NICE-TO-HAVE
 * The lessons are pitched at grade 1 and their entire content is text. A
 * six-year-old who cannot yet read "the short hand has left the 4 but has not
 * got to the 5" gets nothing from that caption, and the child this was built
 * for is exactly the child who cannot read it. The multimedia-learning result
 * behind it is the MODALITY principle: narration alongside an animation beats
 * on-screen text alongside the same animation, because the text and the picture
 * compete for one visual channel. With an animated clock that competition is
 * the whole problem — the child either reads the words or watches the hands.
 *
 * NO AUDIO ASSETS, AND THAT IS THE DESIGN RATHER THAN A SHORTCUT
 * A friend's voice is DATA IN THEIR PACK: a pitch, a rate, and a list of
 * preferred system voice names. The browser's own speech synthesiser does the
 * rest. So there is nothing to record, nothing to host, nothing to re-record
 * when a caption is edited, and no page weight — which matters, because a
 * recorded set would be about eighty clips per character and every copy edit
 * would silently leave one of them saying the old words.
 *
 * What that buys is real but limited, and the limit is worth stating plainly:
 * pitch and rate genuinely distinguish the friends on every device, so Ash is
 * slow and low and Georgie is quick and high wherever you are. The `prefer`
 * list only pays off where the device HAS several voices installed — macOS and
 * iOS have many, Android Chrome often has one or two. So the characters are
 * always distinguishable and only sometimes different voices.
 *
 * THE FUNNEL IS THE POINT. Everything that speaks goes through `speak()`. When
 * there is a backend to hold recorded clips, the swap is inside this one
 * function: look up a clip for (character, text), play it, and fall back to the
 * synthesiser. Nothing else on the site has to change.
 *
 * A TOGGLE, NEVER AUTOPLAY
 * Audio starts because a child pressed a button with a face on it, and it stays
 * on until they press it again. Two reasons beyond good manners: iOS Safari
 * will not speak at all until a user gesture has happened, so the first press
 * IS what makes the rest work; and a page that starts talking on arrival is the
 * kind of thing a parent turns off at the device level, which would take the
 * feature away from the child who needs it.
 */

import { characters } from '../../content/characters.js';

const KEY = 'izzimath.audio';
const USED = 'izzimath.audioused';

export const speechAvailable = () => typeof window !== 'undefined'
  && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';

/* Whether the reader has turned it on. Off by default, and the default is the
   whole of the consent story: nothing speaks until asked. */
export function audioOn() {
  if (!speechAvailable()) return false;
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}

/* Has this device ever turned it on? Only used to decide whether the button
   should draw attention to itself — a control nobody has discovered is worth a
   nudge; one they have used and switched off is not, and pulsing at them then
   would be nagging. */
export function audioEverUsed() {
  try { return localStorage.getItem(USED) === '1'; } catch { return true; }
}

export function setAudioOn(on) {
  const next = !!on && speechAvailable();
  try {
    localStorage.setItem(KEY, next ? '1' : '0');
    if (next) localStorage.setItem(USED, '1');
  } catch { /* private mode: the toggle still works for this page */ }
  if (!next) stopSpeaking();
  /* Announced on `document`, which is the pattern theme.js set for the
     character picker: several buttons on a page may be showing this state and
     none of them should have to poll. */
  document.dispatchEvent(new CustomEvent('audiochange', { detail: { on: next } }));
  return next;
}

/* ------------------------------------------------------------------ voices
   getVoices() is empty on the first call in most browsers and fills in
   asynchronously, which is why this is a lookup rather than a cached list: a
   value captured at module load would be the empty array for the whole session
   and every character would get the default voice. */
function pickVoice(spec) {
  if (!speechAvailable()) return null;
  let voices = [];
  try { voices = window.speechSynthesis.getVoices() || []; } catch { return null; }
  if (!voices.length) return null;
  const local = voices.filter((v) => /^en(-|_|$)/i.test(v.lang || ''));
  const pool = local.length ? local : voices;
  for (const want of spec?.prefer || []) {
    const hit = pool.find((v) => (v.name || '').toLowerCase().includes(want.toLowerCase()));
    if (hit) return hit;
  }
  return pool.find((v) => v.default) || pool[0] || null;
}

export const speechFor = (chId) => characters[chId]?.speech ?? characters.none.speech;

/* Say something in a friend's voice. Cancels whatever was being said first:
   two captions talking over each other is worse than silence, and stepping
   through a lesson quickly is the normal case rather than the exception.

   Returns the utterance so a caller can hang an `onend` on it, or null if
   nothing was said — which is what makes "did it speak" checkable. */
export function speak(text, chId = 'none', { force = false } = {}) {
  if (!speechAvailable()) return null;
  if (!force && !audioOn()) return null;
  const words = String(text || '').trim();
  if (!words) return null;
  const spec = speechFor(chId);
  try {
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(words);
    /* Pitch and rate are what actually distinguish the friends, because they
       work on every device. A voice from `prefer` is a bonus where the device
       has one. */
    u.pitch = spec?.pitch ?? 1;
    u.rate = spec?.rate ?? 1;
    u.lang = 'en-US';
    const v = pickVoice(spec);
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
    return u;
  } catch { return null; }
}

export function stopSpeaking() {
  if (!speechAvailable()) return;
  try { window.speechSynthesis.cancel(); } catch { /* nothing to cancel */ }
}

/* ------------------------------------------------------------------ the button
   A FACE WITH A SPEECH BUBBLE, and it is the chosen friend's face — which is
   what says whose voice you are about to hear without a word of explanation.
   `data-avatar` is the hook src/lib/theme.js already swaps on every page, so
   changing friend in the header re-skins this for free.

   It is a toggle (`aria-pressed`), not a play button: a child who wants the
   words read to them wants that for the whole lesson, not once per step.

   `pulse` draws the eye until the device has used it once. A control a child
   has not noticed is a control a child does not use — the same finding as the
   badge shelf, where the only copy lived in a tooltip no tablet could show. */
export function voiceButton({ label = 'Tell me', pulse = false } = {}) {
  return `<button class="vbtn${pulse ? ' pulse' : ''}" type="button" data-audio
    aria-pressed="false" aria-label="${label} — read the words out loud">
    <span class="vbtn-face" aria-hidden="true">
      <svg data-avatar="idle" viewBox="0 0 64 64"><use href="#av-none"/></svg>
      <span class="vbtn-bub">${'▸'}</span>
    </span>
    <span class="vbtn-txt">${label}</span>
  </button>`;
}

/* Paint every voice button on the page from the live state. Called on the
   `audiochange` announcement, so one press updates all of them. */
export function paintVoiceButtons(root = document) {
  const on = audioOn();
  for (const b of root.querySelectorAll('[data-audio]')) {
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('on', on);
    /* The nudge stops the moment it has been used, and never runs for a reader
       who asked for less motion. */
    if (on || audioEverUsed()) b.classList.remove('pulse');
  }
}

/* Wire the buttons inside `root`. `onToggle` is called AFTER the state flips,
   with the new value, which is where a caller says the thing the reader is
   looking at — turning it on and staying silent reads as a broken button, and
   on iOS that first gesture is also what unlocks speech for the rest of the
   session. */
export function wireVoiceButtons(root, onToggle) {
  for (const b of root.querySelectorAll('[data-audio]')) {
    b.addEventListener('click', () => {
      const next = setAudioOn(!audioOn());
      if (typeof onToggle === 'function') onToggle(next);
    });
  }
  paintVoiceButtons(root);
  document.addEventListener('audiochange', () => paintVoiceButtons(root));
}
