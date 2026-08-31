// The score -> practice picker on /roam/.
import { activities } from '../../content/activities/index.js';
import { tasks, bands, bandOrder, recommend, roamLabel } from '../../content/roam.js';
import { base } from '../lib/url.js';

const host = document.querySelector('[data-recommender]');
if (host) {
  const GRADES = ['K', '1', '2', '3', '4', '5'];
  let task = 'roamMagpi', sub = 'numberline', band = 'need', grade = '3', flagged = false;

  const subOpts = () => Object.values(tasks[task].subscales);

  function paint() {
    if (!subOpts().some((s) => s.id === sub)) sub = subOpts()[0].id;
    const res = recommend({ task, subscale: sub, band, grade, activities, limit: 6, flagged });
    const recs = res.items;
    const bd = bands[res.band];
    host.innerHTML = `
      <div style="display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:18px">
        <label>Part of ROAM<select data-t>${Object.values(tasks).map((t) => `<option value="${t.id}"${t.id === task ? ' selected' : ''}>${t.short} — ${t.name}</option>`).join('')}</select></label>
        <label>Skill<select data-s>${subOpts().map((s) => `<option value="${s.id}"${s.id === sub ? ' selected' : ''}>${s.name}</option>`).join('')}</select></label>
        <label>Score band<select data-b>${bandOrder.map((k) => `<option value="${k}"${k === band ? ' selected' : ''}>${bands[k].label}</option>`).join('')}</select></label>
        <label>Their grade<select data-g>${GRADES.map((g) => `<option value="${g}"${g === grade ? ' selected' : ''}>${g === 'K' ? 'Kindergarten' : 'Grade ' + g}</option>`).join('')}</select></label>
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--txt2);margin-bottom:16px">
        <input type="checkbox" data-flag ${flagged ? 'checked' : ''} style="width:auto"> ROAM flagged this score as unreliable
      </label>
      <div class="roam">
        <span class="band ${bd.cls}"><span class="dot"></span>${bd.label}</span>
        <p style="margin-top:10px"><strong>${bd.meaning}</strong> ${bd.action}</p>
        <p style="font-size:13px;color:var(--txt2)">About <strong>${res.dose.minutesPerDay} minutes</strong>,
          <strong>${res.dose.daysPerWeek} ${res.dose.daysPerWeek === 1 ? 'day' : 'days'} a week</strong>,
          then look again in about ${res.dose.revisitWeeks} weeks. ${res.dose.note}</p>
        ${res.caveat ? `<p class="fb hint" style="margin-top:10px;font-size:13px"><span aria-hidden="true">◆</span><span>${res.caveat}</span></p>` : ''}
        ${res.rules.length ? res.rules.map((r) => `<p style="font-size:13px;color:var(--amber);margin-top:8px">◆ ${r.why}</p>`).join('') : ''}
        ${recs.length ? `<div class="cards" style="margin-top:14px">${recs.map((a) => `
          <a class="card" href="${base()}/${a.kind === 'book' ? 'books' : 'games'}/${a.id}/">
            <div class="cbody"><h3>${a.title}</h3><p>${a.blurb}</p>
            <div class="meta"><span class="tag acc">${a.kind === 'book' ? 'Book' : 'Game'}</span>
            <span class="tag">${a.grade === 'K' ? 'Kindergarten' : 'Grade ' + a.grade}</span></div></div></a>`).join('')}</div>`
          : '<p class="fb hint" style="margin-top:12px">No activity carries that tag yet.</p>'}
        <p style="margin-top:14px;font-size:12.5px;color:var(--txt3)">Nothing here is a score, and
        practising here does not change a ROAM result. This is only a way of choosing what to do next.</p>
      </div>`;
    host.querySelector('[data-t]').addEventListener('change', (e) => { task = e.target.value; sub = null; paint(); });
    host.querySelector('[data-s]').addEventListener('change', (e) => { sub = e.target.value; paint(); });
    host.querySelector('[data-b]').addEventListener('change', (e) => { band = e.target.value; paint(); });
    host.querySelector('[data-g]').addEventListener('change', (e) => { grade = e.target.value; paint(); });
    host.querySelector('[data-flag]').addEventListener('change', (e) => { flagged = e.target.checked; paint(); });
  }
  paint();
}
