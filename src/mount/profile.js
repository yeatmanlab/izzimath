/* The profile panel, loaded on every page.

   Everything about keeping score is opt-in, and this is the only place it is
   offered unprompted: a button in the corner that says "Scores" until there is
   a profile, and shows that child's face afterwards.

   Three flows:
     new      pick a face -> pick a name -> pick a secret snack
     pick-up  choose your face from the ones on this device -> confirm the snack
     mine     what you have done, and the way out

   The panel is a dialog rather than a page so it can be opened in the middle of
   a book without losing the child's place.

   On the snack: child-facing copy calls it a secret, because that is more fun
   and instantly understood. The honest version — a one-in-twenty-five choice
   whose job is to stop a sibling landing on the wrong scores, not to guard
   anything — is stated in the grown-ups line at the bottom of the panel, where
   a parent will actually read it.
*/

import { AVATAR_COUNT, avatarSpec, avatarLabel, namesFor, FOODS, foodById, foodChoicesFor } from '../../content/avatars.js';
import { avatarSvg } from '../lib/avatarart.js';
import { avatar } from '../lib/sprites.js';
import { getCharacter } from '../../content/characters.js';
import { createStore, localDriver } from '../lib/profile.js';
import { TIERS } from '../lib/ladder.js';
import { evaluate as evaluateBadges, badgeById, BADGE_COUNT, BADGES } from '../../content/badges.js';
import { badgeSvg, shelfHtml, badgeStrip } from '../lib/badgeart.js';
import { celebrate } from '../engine/celebrate.js';
import { activities } from '../../content/activities/index.js';
import { base } from '../lib/url.js';
import { currentCharacter, setCharacter } from '../lib/theme.js';

const store = createStore(localDriver());
const byId = new Map(activities.map((a) => [a.id, a]));

let panel = null;
let draft = {};          // the half-made profile during the new flow
let returnFocusTo = null; // where focus was before the dialog opened

/* ------------------------------------------------------------------ chrome */

async function paintButton() {
  const face = document.querySelector('[data-me-face]');
  const name = document.querySelector('[data-me-name]');
  if (!face || !name) return;
  const me = await store.getActive();
  if (me) {
    face.innerHTML = avatarSvg(me.avatar, { size: 26, decorative: true });
    const n = (await store.listBadges(me.id)).length;
    // The count sits next to the name, which is the "shown next to the score"
    // the shelf is reached from. A zero is not shown: an empty counter is a
    // reproach, and nothing has been earned yet by definition.
    name.textContent = n ? `${me.name} · ${n}★` : me.name;
    document.querySelector('[data-me]')?.setAttribute('data-on', '1');
  } else {
    face.textContent = '☺';
    name.textContent = 'Scores';
    document.querySelector('[data-me]')?.removeAttribute('data-on');
  }
}

/* `focus: 'top'` for a panel that is mainly something to READ. The default
   picks the first real control, which is right for the choose-an-avatar screens
   but wrong for the score panel: the first control there is two thirds of the
   way down, so focusing it scrolled the greeting — including the snack the child
   has to remember to come back — clean off the top of the panel. */
function open(html, { focus = 'control' } = {}) {
  /* Where focus goes when the dialog closes. Captured only on the FIRST open of
     a run, because the flows re-render by calling open() again and grabbing
     focus each time would end up restoring it to a button that no longer exists.

     Falling back to the header button rather than trusting activeElement: a
     click does not always leave focus on the thing clicked, and when it does not
     the honest answer to "where was the user" is the control that opens this. */
  if (!panel) {
    const active = document.activeElement;
    returnFocusTo = active && active !== document.body && active.isConnected
      ? active
      : document.querySelector('[data-me]');
  }
  close({ restore: false });
  panel = document.createElement('div');
  panel.className = 'mewrap noprint';
  panel.innerHTML = `<div class="mebg" data-close></div>
    <div class="mepanel" role="dialog" aria-modal="true" aria-label="Scores and characters">
      <button class="meclose" data-close aria-label="Close">×</button>
      ${html}
    </div>`;
  document.body.appendChild(panel);
  panel.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));
  document.addEventListener('keydown', onKey);
  const box = panel.querySelector('.mepanel');
  if (focus === 'top') {
    box.tabIndex = -1;
    box.focus({ preventScroll: true });
    box.scrollTop = 0;
  } else {
    panel.querySelector('button:not([data-close])')?.focus();
  }
}

function close({ restore = true } = {}) {
  document.removeEventListener('keydown', onKey);
  panel?.remove();
  panel = null;
  // Returning focus to whatever opened the dialog. Without this a keyboard user
  // is dropped at the top of the document and has to tab back to where they
  // were, which on a book page means tabbing past the whole nav.
  if (restore && returnFocusTo?.isConnected) {
    try { returnFocusTo.focus(); } catch { /* element may be gone */ }
  }
  if (restore) returnFocusTo = null;
}

/* aria-modal tells a screen reader the dialog is modal; it does not stop Tab
   walking out of it into the page behind. Trapping it here so the two agree. */
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
function onKey(e) {
  if (e.key === 'Escape') { close(); return; }
  if (e.key !== 'Tab' || !panel) return;
  const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* The shelf, as it appears beside the scores: what has been earned, then the
   few easiest badges that have not, then the whole set behind a disclosure.

   It used to render all 24 inline. For a brand-new profile that meant the first
   thing a child saw was seven headings of things they had not done — and it was
   tall enough to push the greeting, including the snack they need to come back,
   off the top of the panel. Gaps are still what make a set worth filling; the
   gaps worth putting in front of someone are the near ones. Nearest is taken as
   lowest rank, which is true without inventing a progress bar. */
function shelf(me, badges) {
  const held = new Set(badges.map((b) => b.badgeId));
  const got = BADGES.filter((b) => held.has(b.id)).map((b) => b.id);
  const near = BADGES.filter((b) => !held.has(b.id))
    .sort((a, b) => a.rank - b.rank).slice(0, 4).map((b) => b.id);
  return `<div class="bdshelf">
    <p class="bdshelf-h">${me.name}'s badges <span>${got.length} of ${BADGE_COUNT}</span></p>
    ${got.length
      ? badgeStrip(got, held)
      : `<p class="bdnone">None yet. Each one says something ${me.name} did.</p>`}
    ${near.length ? `<p class="bdnext">Close by</p>${badgeStrip(near, held)}` : ''}
    <details class="bdall"><summary>See all ${BADGE_COUNT} badges</summary>
      ${shelfHtml(got)}</details>
  </div>`;
}

/* ------------------------------------------------------------- new profile */

/* Shown instead of the flow when this browser will not let the site remember
   anything — Safari private browsing, blocked site data, a full quota. Everything
   still works; the scores are the only casualty, and saying so up front beats
   walking a child through three screens for nothing. */
function flowNoStorage() {
  open(`
    <h2 class="meh">Scores cannot be saved in this browser</h2>
    <p class="mesub">Everything still works &mdash; every book, game and sheet. This browser just
      will not let the site remember anything, so scores cannot be kept.</p>
    <p class="mesub">Usually that is private browsing, or site data being switched off. Opening
      Izzi Math in a normal window will fix it.</p>
    <div class="mebtns"><button class="btn pri" data-close>Carry on without scores</button></div>
    ${grownUps()}`);
}

async function flowStart() {
  if (!(await store.canPersist())) return flowNoStorage();
  const list = await store.listProfiles();
  open(`
    <h2 class="meh">Want to keep your scores?</h2>
    <p class="mesub">Pick a character and this remembers what you have done. It stays on this
      device — nothing is sent anywhere, and there is no password to forget.</p>
    <div class="mebtns">
      <button class="btn pri" data-new>Pick a character</button>
      ${list.length ? `<button class="btn" data-pick>I already have one</button>` : ''}
      <button class="btn" data-close>Not now</button>
    </div>
    ${grownUps()}`);
  panel.querySelector('[data-new]').addEventListener('click', flowAvatar);
  panel.querySelector('[data-pick]')?.addEventListener('click', flowPickUp);
}

function flowAvatar() {
  draft = {};
  const cells = Array.from({ length: AVATAR_COUNT }, (_, i) =>
    `<button class="mecell" data-av="${i}" aria-label="${avatarLabel(i)}" title="${avatarLabel(i)}">
      ${avatarSvg(i, { size: 46, decorative: true })}</button>`).join('');
  open(`
    <h2 class="meh">Pick your character</h2>
    <p class="mesub">Any of them. You can change it later.</p>
    <div class="megrid">${cells}</div>
    ${grownUps()}`);
  panel.querySelectorAll('[data-av]').forEach((b) =>
    b.addEventListener('click', () => { draft.avatar = +b.dataset.av; flowName(); }));
}

function flowName() {
  const names = namesFor(draft.avatar);
  open(`
    <h2 class="meh">What are they called?</h2>
    <div class="mepick">${avatarSvg(draft.avatar, { size: 76, decorative: true })}</div>
    <div class="mechips">${names.map((n) =>
      `<button class="btn" data-name="${n}">${n}</button>`).join('')}</div>
    <div class="mebtns"><button class="btn" data-back>← A different character</button></div>
    ${grownUps()}`);
  panel.querySelectorAll('[data-name]').forEach((b) =>
    b.addEventListener('click', () => { draft.name = b.dataset.name; flowFood(); }));
  panel.querySelector('[data-back]').addEventListener('click', flowAvatar);
}

function flowFood() {
  open(`
    <h2 class="meh">Now pick a secret snack</h2>
    <p class="mesub">${draft.name}'s favourite food. Remember it — you will pick it again next time
      to show that this character is yours.</p>
    <div class="mepick">${avatarSvg(draft.avatar, { size: 60, decorative: true })}</div>
    <div class="mefoods">${FOODS.map((f) =>
      `<button class="mefood" data-food="${f.id}"><span aria-hidden="true">${f.glyph}</span>${f.name}</button>`).join('')}</div>
    <div class="mebtns"><button class="btn" data-back>← A different name</button></div>
    ${grownUps()}`);
  panel.querySelectorAll('[data-food]').forEach((b) =>
    b.addEventListener('click', async () => {
      draft.food = b.dataset.food;
      try {
        const me = await store.createProfile({ ...draft, theme: currentCharacter() });
        await store.setActive(me.id);
        repaint();
        flowMine(me, true);
      } catch (err) {
        // Storage can fill up between the probe and the write. Never report
        // "Hello, Noodle!" for a character that did not save.
        flowNoStorage();
      }
    }));
  panel.querySelector('[data-back]').addEventListener('click', flowName);
}

/* ---------------------------------------------------------------- pick up */

async function flowPickUp() {
  const list = await store.listProfiles();
  if (!list.length) return flowStart();
  open(`
    <h2 class="meh">Which one is yours?</h2>
    <p class="mesub">The characters made on this device.</p>
    <div class="mecards">${list.map((p) =>
      `<button class="mecard" data-id="${p.id}">
        ${avatarSvg(p.avatar, { size: 54, decorative: true })}
        <b>${p.name}</b><span>${avatarLabel(p.avatar)}</span></button>`).join('')}</div>
    <div class="mebtns"><button class="btn" data-new>Make a new one</button></div>
    ${grownUps()}`);
  panel.querySelectorAll('[data-id]').forEach((b) =>
    b.addEventListener('click', async () => flowConfirm(await store.getProfile(b.dataset.id))));
  panel.querySelector('[data-new]').addEventListener('click', flowAvatar);
}

function flowConfirm(me, wrong = false) {
  const choices = foodChoicesFor(me);
  open(`
    <h2 class="meh">What is ${me.name}'s secret snack?</h2>
    ${wrong ? `<p class="mesub bad">Not that one. Have another go.</p>` : `<p class="mesub">Pick the one you chose when you made them.</p>`}
    <div class="mepick">${avatarSvg(me.avatar, { size: 66, decorative: true })}</div>
    <div class="mefoods">${choices.map((f) =>
      `<button class="mefood" data-food="${f.id}"><span aria-hidden="true">${f.glyph}</span>${f.name}</button>`).join('')}</div>
    <div class="mebtns"><button class="btn" data-back>← Not me</button></div>
    ${grownUps()}`);
  panel.querySelectorAll('[data-food]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (b.dataset.food !== me.food) return flowConfirm(me, true);
      await store.setActive(me.id);
      if (me.theme) setCharacter(me.theme);
      await paintButton();
      flowMine(me);
    }));
  panel.querySelector('[data-back]').addEventListener('click', flowPickUp);
}

/* --------------------------------------------------------------- my things */

async function flowMine(me, justMade = false) {
  const prog = await store.allProgress(me.id);
  const badges = await store.listBadges(me.id);
  const rows = Object.values(prog)
    .filter((p) => byId.has(p.activityId))
    .sort((a, b) => (b.lastAt || '').localeCompare(a.lastAt || ''))
    .map((p) => {
      const a = byId.get(p.activityId);
      const marks = [
        p.finished ? '<span class="memark ok" title="Finished">✓</span>' : '',
        p.printed ? `<span class="memark" title="Printed ${p.printed}×">⤓</span>` : '',
      ].join('');
      /* Tier 0 is a real answer, not a missing one. Testing `p.bestTier` for
         truthiness meant a child who played and stayed on the first rung saw an
         empty cell, which reads as "that didn't count". What decides whether
         there is a score to show is whether they PLAYED. */
      const tierName = (i) => TIERS[i] ?? '—';
      const score = a.kind === 'game'
        ? (!p.plays ? ''
          : a.adaptive ? `deepest: ${tierName(p.bestTier)}`
          : `best: ${p.bestRight} of ${a.rounds ?? '?'} right`)
        : (p.pagesDone ? `${p.pagesDone} page${p.pagesDone === 1 ? '' : 's'}` : '');
      return `<tr>
        <td><a href="${base()}/${a.kind === 'book' ? 'books' : 'games'}/${a.id}/">${a.title}</a></td>
        <td>${score}</td>
        <td>${p.plays ? p.plays + '×' : ''}</td>
        <td>${marks}</td></tr>`;
    }).join('');

  open(`
    <h2 class="meh">${justMade ? `Hello, ${me.name}!` : me.name}</h2>
    <div class="mepick">${avatarSvg(me.avatar, { size: 76, decorative: true })}</div>
    ${justMade ? `<p class="mesub">Your scores are kept from now on. Your secret snack is
      <strong>${foodById(me.food)?.name}</strong> &mdash; you will pick it again next time.</p>` : ''}
    ${rows
      ? `<table class="metable"><thead><tr><th>What</th><th>Best</th><th>Times</th><th></th></tr></thead>
          <tbody>${rows}</tbody></table>`
      : `<p class="mesub">Nothing here yet. Finish a book or play a game and it will show up.</p>`}
    ${shelf(me, badges)}
    <div class="mebtns">
      <button class="btn" data-close>Keep going</button>
      <button class="btn" data-switch>Switch character</button>
      <button class="btn" data-out>Stop keeping score</button>
    </div>
    ${grownUps()}`, { focus: 'top' });
  panel.querySelector('[data-switch]').addEventListener('click', flowPickUp);
  panel.querySelector('[data-out]').addEventListener('click', async () => {
    await store.signOut();
    repaint();
    close();
  });
}

/* The one place the pick-up check is described accurately, positioned where a
   parent reads it rather than where a child does. */
const grownUps = () => `<p class="mefoot">For grown-ups: this is not an account. Everything is
  kept in this browser on this device, nothing is sent anywhere, and no name, email or age is
  ever collected. The snack is a one-in-twenty-five check so that two children sharing a device
  land on their own scores &mdash; it is not a password, and nothing behind it is private.</p>`;

/* --------------------------------------------------------------- the hooks */

/* Engines call these. They are no-ops with no profile, which is what makes
   "not keeping score" genuinely cost nothing. */
export async function noteProgress(activityId, event) {
  const id = await store.getActiveId();
  if (!id) return null;
  const rec = await store.record(id, activityId, event);
  await checkBadges(id);
  return rec;
}

/* Badges are derived, so this recomputes the whole set from the records and only
   stores the ones newly true. That means the shelf can never disagree with the
   scores, and adding a badge later back-fills for children who already earned
   it. */
async function checkBadges(id) {
  const prog = await store.allProgress(id);
  const held = await store.listBadges(id);
  const characters = new Set(held.map((b) => b.earnedWith).filter((c) => c && c !== 'none'));
  characters.add(currentCharacter());
  const earned = evaluateBadges(prog, activities, { characters, earnedCount: held.length });
  const fresh = await store.awardBadges(id, earned, currentCharacter());
  repaint();
  if (fresh.length) announceBadges(fresh);
  return fresh;
}

/* One short flourish, then it is gone. The rule is in celebrate.js: a reward
   layer that outshines the maths is the failure mode. So this is a card, the
   character's own particle burst, and no sound. */
function announceBadges(ids) {
  const ch = getCharacter(currentCharacter());
  const card = document.createElement('div');
  card.className = 'bdpop noprint';
  card.setAttribute('role', 'status');
  /* A strong first game can trip six of these at once — the streak ladder alone
     is 5, 10 and 15. Showing two and silently dropping four made four badges
     appear from nowhere later. Three cards, then a line that accounts for the
     rest, so nothing arrives unexplained. */
  const SHOWN = 3;
  const extra = Math.max(0, ids.length - SHOWN);
  card.innerHTML = ids.slice(0, SHOWN).map((id) => {
    const b = badgeById(id);
    return `<div class="bdpop-in">
      ${ch.id === 'none' ? '' : avatar(ch.id, 'bdface', 'happy')}
      <div class="bdpop-medal">${badgeSvg(id, { size: 62, decorative: true })}</div>
      <div class="bdpop-txt">
        <p class="bdpop-kicker">New badge${ch.id === 'none' ? '' : ` for ${ch.name}`}</p>
        <p class="bdpop-name">${b.name}</p>
        <p class="bdpop-says">${b.says}</p>
      </div>
    </div>`;
  }).join('') + (extra
    ? `<p class="bdpop-more">and ${extra} more &mdash; they are all on ${ch.id === 'none' ? 'your' : ch.name + '\u2019s'} shelf</p>`
    : '');
  document.body.appendChild(card);
  celebrate(card.querySelector('.bdpop-medal'), ch);
  const go = () => card.remove();
  card.addEventListener('click', go);
  /* Long enough to READ what arrived, which is the whole point of a badge that
     states a fact rather than saying well done. 4200ms was set when the card
     showed two; three cards plus the "and N more" line is about sixty words. A
     click still dismisses it early, and it never blocks the game. */
  setTimeout(go, 2800 + 1100 * Math.min(ids.length, SHOWN));
}

/* Offered once, after something is finished, and never again in this session if
   waved away. A prompt that keeps asking is a prompt that gets dismissed
   reflexively, and the choice is supposed to be genuinely optional. */
let offeredThisSession = false;
export async function offerToKeepScore() {
  if (offeredThisSession) return;
  if (await store.getActiveId()) return;
  if (sessionStorage.getItem('izzi.noscores') === '1') return;
  offeredThisSession = true;
  sessionStorage.setItem('izzi.noscores', '1');
  flowStart();
}

document.addEventListener('click', (e) => {
  const b = e.target.closest?.('[data-me]');
  if (!b) return;
  e.preventDefault();
  store.getActive().then((me) => (me ? flowMine(me) : flowStart()));
});

/* Marks on the cards, so a child scanning a grade page can see what they have
   already done without opening anything. Purely additive: with no profile the
   slots stay empty and the pages look exactly as they did before. */
async function paintMarks() {
  const cards = document.querySelectorAll('[data-activity] [data-marks]');
  if (!cards.length) return;
  const id = await store.getActiveId();
  if (!id) { cards.forEach((c) => (c.innerHTML = '')); return; }
  const prog = await store.allProgress(id);
  for (const slot of cards) {
    const aid = slot.closest('[data-activity]')?.dataset.activity;
    const p = prog[aid];
    if (!p) { slot.innerHTML = ''; continue; }
    const marks = [];
    if (p.finished) marks.push('<i title="You finished this" aria-label="finished">✓</i>');
    if (p.plays) marks.push(`<i title="Played ${p.plays} time${p.plays === 1 ? '' : 's'}" aria-label="played">◉</i>`);
    if (p.printed) marks.push(`<i title="Printed ${p.printed} time${p.printed === 1 ? '' : 's'}" aria-label="printed">⤓</i>`);
    slot.innerHTML = marks.join('');
  }
}

const repaint = () => { paintButton(); paintMarks(); };

window.__izziProfile = { noteProgress, offerToKeepScore, store, repaint };
repaint();
