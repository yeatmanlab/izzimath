// The score -> practice picker on /roam/.
import { activities } from '../../content/activities/index.js';
import { tasks, bands, bandOrder, recommend, roamLabel } from '../../content/roam.js';
import { base } from '../lib/url.js';

const host = document.querySelector('[data-recommender]');
if (host) {
  const GRADES = ['K', '1', '2', '3', '4', '5'];
  let task = 'roamMagpi', sub = 'numberline', band = 'need', grade = '3';

  const subOpts = () => Object.values(tasks[task].subscales);

  function paint() {
    if (!subOpts().some((s) => s.id === sub)) sub = subOpts()[0].id;
    const recs = recommend({ task, subscale: sub, band, grade, activities, limit: 6 });
    const bd = bands[band];
    host.innerHTML = `
      <div style="display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:18px">
        <label>Part of ROAM<select data-t>${Object.values(tasks).map((t) => `<option value="${t.id}"${t.id === task ? ' selected' : ''}>${t.short} — ${t.name}</option>`).join('')}</select></label>
        <label>Skill<select data-s>${subOpts().map((s) => `<option value="${s.id}"${s.id === sub ? ' selected' : ''}>${s.name}</option>`).join('')}</select></label>
        <label>Score band<select data-b>${bandOrder.map((k) => `<option value="${k}"${k === band ? ' selected' : ''}>${bands[k].label}</option>`).join('')}</select></label>
        <label>Their grade<select data-g>${GRADES.map((g) => `<option value="${g}"${g === grade ? ' selected' : ''}>${g === 'K' ? 'Kindergarten' : 'Grade ' + g}</option>`).join('')}</select></label>
      </div>
      <div class="roam">
        <span class="band ${bd.cls}"><span class="dot"></span>${bd.label}</span>
        <p style="margin-top:10px"><strong>${bd.meaning}</strong> ${bd.action}</p>
        ${recs.length ? `<div class="cards" style="margin-top:14px">${recs.map((a) => `
          <a class="card" href="${base()}/${a.kind === 'book' ? 'books' : 'games'}/${a.id}/">
            <div class="cbody"><h3>${a.title}</h3><p>${a.blurb}</p>
            <div class="meta"><span class="tag acc">${a.kind === 'book' ? 'Book' : 'Game'}</span>
            <span class="tag">${a.grade === 'K' ? 'Kindergarten' : 'Grade ' + a.grade}</span></div></div></a>`).join('')}</div>`
          : '<p class="fb hint" style="margin-top:12px">No activity carries that tag yet.</p>'}
        <p style="margin-top:14px;font-size:12.5px;color:var(--txt3)">If ROAM flagged the score as
        unreliable (very fast clicking), treat this as a hint rather than a finding.</p>
      </div>`;
    host.querySelector('[data-t]').addEventListener('change', (e) => { task = e.target.value; sub = null; paint(); });
    host.querySelector('[data-s]').addEventListener('change', (e) => { sub = e.target.value; paint(); });
    host.querySelector('[data-b]').addEventListener('change', (e) => { band = e.target.value; paint(); });
    host.querySelector('[data-g]').addEventListener('change', (e) => { grade = e.target.value; paint(); });
  }
  paint();
}
