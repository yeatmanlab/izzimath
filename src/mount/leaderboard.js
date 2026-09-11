/* The character cup, rendered, in two views.
 *
 * Reads through `window.__izziProfile` rather than importing the profile module,
 * for the same reason the book and game engines do: profile.js is on every page
 * already and importing it a second time would re-run its side effects — the
 * global, the listeners, the Scores button. The engines set the precedent with
 * `window.__izziProfile?.noteProgress(...)`.
 *
 * TWO VIEWS, TWO METRICS, AND THE DIFFERENCE IS NOT COSMETIC
 *   By friend  — the four characters, ranked 1..4 on BADGES. Ranking cartoons is
 *                the joke, and badges are the right metric because they cannot
 *                be earned without doing the maths.
 *   By player  — the profiles on this device, ordered on VOLUME with no places.
 *                Badges would make it a skill board (8 of 24 are skill gates)
 *                and a place would tell a child they are third. See the note
 *                above playerStandings() in content/leaderboard.js.
 *
 * Degrades to the character roster at zero if the profile module is missing or
 * storage is blocked (private browsing), because the page should still say what
 * the cup IS rather than showing an error. Nothing here writes anything except
 * the reader's choice of view.
 */

import { CUP, PLAYERS, standings, playerStandings, cupTotals } from '../../content/leaderboard.js';
import { avatar } from '../lib/sprites.js';
import { avatarSvg } from '../lib/avatarart.js';
import { avatarLabel } from '../../content/avatars.js';
import { levelGap } from '../../content/levels.js';
import { setCharacter, currentCharacter } from '../lib/theme.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const VIEW_KEY = 'izzimath.cupview';

/* An ordinal, because "1" beside a row reads as a quantity and "1st" reads as a
   place. Only the character view uses it. */
function ordinal(n) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}

/* Right answers are only mentioned when there are some. Badges earned before the
   per-character tallies existed have no answer count attached, so the honest
   line for a device with history but no tallies is "6 badges between them" — not
   "6 badges between them, from 0 right answers", which reads as a broken
   template rather than as an old profile. */
export function cupSummary(totals) {
  const b = `${totals.badges} ${totals.badges === 1 ? 'badge' : 'badges'} between them`;
  if (!totals.right) return `${b}.`;
  return `${b}, from ${totals.right} right ${totals.right === 1 ? 'answer' : 'answers'}.`;
}

/* A character row is a BUTTON, and pressing it plays as that character.

   Asked for by a first grader: they read the cup, saw Kiwi had the fewest
   badges, and wanted to go and help — and the only way to switch was the picker
   in the header, which nothing on this page connected to the row they were
   looking at. What the press does is exactly what that picker does, because a
   character re-skins and nothing else; the one consequence with any weight is
   that the NEXT badge counts for whoever is on, which is what the child was
   after and what the "How it is counted" list has always said.

   The whole row is the target rather than a "switch" control beside the name:
   the row is what a child points at, and a 44px-tall strip is a far better tap
   target than a chip in the corner of it. */
function characterRow(r, leader, on = false) {
  /* The bar is aria-hidden and the numbers are in the text, so a screen reader
     gets the standing without being read a decorative width. */
  /* Three states, not two. "not started" for a character with no badges is
     right; for one holding a badge it is simply false — the first level needs
     three, so levelFor(1).n is 0 and the pill said NOT STARTED beside a badge
     count of 1. In between, the pill says what the next level costs, which is
     the same sentence the Scores panel already uses. */
  const lv = r.level?.n > 0 ? r.level.name : null;
  const gap = !lv && r.badges > 0 ? levelGap(r.badges) : null;
  const pill = lv ?? (gap ? `${gap.need} to ${gap.next.name}` : 'not started');
  const said = `${ordinal(r.rank)}${r.tied ? ' equal' : ''}: ${r.name}, ${
    lv ? `${lv}, ` : gap ? `${gap.need} more for ${gap.next.name}, ` : ''}${plural(r.badges, 'badge', 'badges')}. ${
    on ? CUP.pickedSay(r.name) : CUP.pickSay(r.name)}`;
  return `<li class="cuprow ch${r.rank === 1 && leader ? ' lead' : ''}${on ? ' on' : ''}" style="--acc:${esc(r.accent)}">
    <button type="button" class="cupgo" data-cup-ch="${esc(r.id)}" aria-pressed="${on}">
      <span class="cupplace" aria-hidden="true">${r.tied ? '=' : ''}${r.rank}</span>
      <span class="cupav" aria-hidden="true">${avatar(r.id, 'cupface')}</span>
      <span class="cupbody">
        <span class="cuptop">
          <b class="cupname">${esc(r.name)}</b>
          <span class="cuplv${lv ? '' : ' none'}">${esc(pill)}</span>
          ${on ? `<span class="cupon">${esc(CUP.picked)}</span>` : ''}
        </span>
        <span class="cupbar" aria-hidden="true"><i style="width:${(r.share * 100).toFixed(1)}%"></i></span>
      </span>
      <span class="cupnum"><b>${r.badges}</b><small>${r.badges === 1 ? 'badge' : 'badges'}</small></span>
      <span class="sr">${esc(said)}</span>
    </button>
  </li>`;
}

/* No place column and no ordinal in the spoken line. The avatar is the point of
   this view — it is what makes it a gallery rather than a ranking. */
function playerRow(p, mine) {
  const said = `${p.name}, ${avatarLabel(p.avatar)}, ${PLAYERS.unit(p.activities)}${
    p.sheets ? `, ${PLAYERS.sheets(p.sheets)}` : ''}${mine ? ' — this is you' : ''}`;
  return `<li class="cuprow plr${mine ? ' mine' : ''}">
    <span class="cupav" aria-hidden="true">${avatarSvg(p.avatar, { size: 44, decorative: true, cls: 'cupface' })}</span>
    <span class="cupbody">
      <span class="cuptop">
        <b class="cupname">${esc(p.name)}</b>
        <span class="cuplv plr">${esc(avatarLabel(p.avatar))}</span>
        ${mine ? '<span class="cupmine">you</span>' : ''}
      </span>
      <span class="cupbar" aria-hidden="true"><i style="width:${(p.share * 100).toFixed(1)}%"></i></span>
    </span>
    <span class="cupnum">
      <b>${p.activities}</b>
      <small>${p.activities === 1 ? 'activity' : 'activities'}</small>
    </span>
    <span class="sr">${esc(said)}</span>
  </li>`;
}

function toggle(view) {
  const btn = (id, label) => `<button type="button" class="cuptab${view === id ? ' on' : ''}"
    data-cup-view="${id}" aria-pressed="${view === id}">${esc(label)}</button>`;
  return `<div class="cuptabs" role="group" aria-label="How to show the cup">
    ${btn('characters', PLAYERS.charLabel)}${btn('players', PLAYERS.label)}</div>`;
}

export function renderCup(host, { rows = [], players = [], view = 'characters', activeId = null, ch = null } = {}) {
  const isPlayers = view === 'players';
  let inner;
  if (isPlayers) {
    const table = playerStandings(players);
    inner = `<p class="cupnote">${esc(PLAYERS.lead)}</p>
      ${table.length ? '' : `<div class="cupempty"><p><b>${esc(PLAYERS.empty)}</b></p></div>`}
      <ol class="cuplist" aria-label="${esc(PLAYERS.label)}">
        ${table.map((p) => playerRow(p, p.id === activeId)).join('')}
      </ol>`;
  } else {
    const table = standings(rows);
    const totals = cupTotals(rows);
    inner = `<p class="cupnote">${esc(CUP.local)}</p>
      <p class="cuppick">${esc(CUP.pick)}</p>
      ${totals.counted ? '' : `<div class="cupempty">
        <p><b>${esc(CUP.empty)}</b></p><p>${esc(CUP.emptyHint)}</p></div>`}
      <ol class="cuplist" aria-label="${esc(CUP.title)}">
        ${table.map((r) => characterRow(r, totals.counted, r.id === ch)).join('')}
      </ol>
      ${totals.counted ? `<p class="cupsum">${esc(cupSummary(totals))}</p>` : ''}`;
  }
  host.innerHTML = `${toggle(view)}${inner}
    <div class="cuphow">
      <h2>${esc(CUP.howHead)}</h2>
      <ul>${(isPlayers
        ? ['Ordered by how many activities someone has done, never by how well.',
           'There are no places in this view, on purpose.',
           'Only the profiles on this device. Nothing is sent anywhere.']
        : CUP.how).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
    </div>`;
}

async function mount() {
  const host = document.querySelector('[data-cup]');
  if (!host) return;
  let view = 'characters';
  try { view = localStorage.getItem(VIEW_KEY) === 'players' ? 'players' : 'characters'; } catch { /* private mode */ }

  /* Set when a press on this page caused the redraw, so focus comes back to the
     row that was pressed — and is NOT stolen when the change came from the
     header picker instead, where focus belongs to the button the reader used. */
  let refocus = null;

  const draw = async () => {
    const P = window.__izziProfile;
    let rows = [], players = [], activeId = null;
    try {
      rows = (await P?.cupRows?.()) ?? [];
      players = (await P?.cupPlayers?.()) ?? [];
      activeId = (await P?.store?.getActiveId?.()) ?? null;
    } catch { /* storage blocked: fall through to the roster at zero */ }
    renderCup(host, { rows, players, view, activeId, ch: currentCharacter() });
    if (refocus) {
      host.querySelector(`[data-cup-ch="${refocus}"]`)?.focus();
      refocus = null;
    }
  };

  host.addEventListener('click', async (e) => {
    /* Playing as this friend. setCharacter announces the change on `document`,
       which is what redraws the list below — so this does not draw itself, or
       the rows would be built twice on every press. */
    const ch = e.target.closest?.('[data-cup-ch]');
    if (ch) {
      refocus = ch.dataset.cupCh;
      setCharacter(refocus);
      return;
    }
    const b = e.target.closest?.('[data-cup-view]');
    if (!b) return;
    view = b.dataset.cupView;
    try { localStorage.setItem(VIEW_KEY, view); } catch { /* private mode */ }
    await draw();
    /* Focus follows the press, or a keyboard reader is dropped at the top of a
       list that just changed under them. */
    host.querySelector(`[data-cup-view="${view}"]`)?.focus();
  });

  await draw();
  document.addEventListener('izzi:progress', draw);
  document.addEventListener('characterchange', draw);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
}
