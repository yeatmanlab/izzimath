/* Profiles — keeping score without accounts.

   A child picks an avatar, a name and a favourite food. That is the whole thing:
   no username, no password, no email, no typed text of any kind, and nothing
   that identifies a real person. Choosing not to have one is the default and
   costs nothing.

   ---------------------------------------------------------------------------
   BUILT TO BE MOVED TO A BACKEND LATER (probably Firebase)

   Four decisions here exist only so that swap is a driver change rather than a
   rewrite. They are cheap now and expensive later, which is why they are done
   now even though nothing is remote yet.

   1. THE API IS ASYNC. Every method returns a promise, even though localStorage
      answers instantly. Firestore is async; converting a synchronous API to an
      asynchronous one later means touching every call site in every engine, and
      that is the single most expensive thing to retrofit.

   2. RECORDS ARE DOCUMENTS AT PATHS. Storage is reached through a driver with
      four methods — get, set, list, remove — over paths like
      `profiles/<id>` and `profiles/<id>/progress/<activityId>`. That maps
      one-to-one onto Firestore documents and collections. The local driver fakes
      it over one localStorage key; a Firestore driver would be about thirty
      lines and nothing above it would change.

   3. EVERY FIELD DECLARES HOW IT MERGES. See MERGE below. Once two devices can
      write the same profile, "just overwrite" loses a child's best score because
      they played on the tablet after the laptop. Sums stay sums, bests take the
      maximum, flags stay true once true. Firestore has atomic increment for
      exactly this, and the field list is already the spec for it.

   4. PLAIN JSON ONLY. No Maps, no Sets, no class instances, no functions, no
      undefined. Dates are ISO strings. Ids are URL-safe. Everything here can be
      written to a document store as-is.

   WHAT STAYS DEVICE-LOCAL EVEN WITH A BACKEND
   Which profile is signed in on THIS device. That is a property of the device,
   not of the child, and syncing it would sign a sibling out from another room.
--------------------------------------------------------------------------- */

import { AVATAR_COUNT, foodById } from '../../content/avatars.js';

export const PROFILE_V = 1;

/* How each progress field combines when two writes meet. The local driver never
   needs this — there is only one writer — but writing it down now means a future
   sync is mechanical rather than a judgement call per field. */
export const MERGE = {
  plays: 'sum',
  printed: 'sum',
  pagesDone: 'max',
  bestRight: 'max',
  bestStreak: 'max',
  bestTier: 'max',
  finished: 'or',
  lastAt: 'latest',
};

const ACTIVE_KEY = 'meta/active';
const P = (id) => `profiles/${id}`;
const PROG = (id, activityId) => `profiles/${id}/progress/${activityId}`;

/* ------------------------------------------------------------------ drivers */

/* One localStorage key holding a flat path -> document map. Deliberately shaped
   like a document store rather than like localStorage, so the Firestore driver
   can be written against the same four methods. */
export function localDriver(key = 'izzi.profiles.v1') {
  const read = () => {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
  };
  const write = (all) => {
    try { localStorage.setItem(key, JSON.stringify(all)); } catch { /* private mode, quota */ }
  };
  return {
    kind: 'local',
    async get(path) { return read()[path] ?? null; },
    async set(path, doc) { const all = read(); all[path] = doc; write(all); return doc; },
    async remove(path) {
      const all = read();
      for (const k of Object.keys(all)) if (k === path || k.startsWith(path + '/')) delete all[k];
      write(all);
    },
    async list(prefix) {
      const all = read();
      // direct children only, the way a Firestore collection query behaves
      return Object.keys(all)
        .filter((k) => k.startsWith(prefix + '/') && !k.slice(prefix.length + 1).includes('/'))
        .map((k) => all[k]);
    },
  };
}

/* A driver that keeps nothing, for the default no-profile state and for tests. */
export function nullDriver() {
  return {
    kind: 'null',
    async get() { return null; },
    async set(_p, doc) { return doc; },
    async remove() {},
    async list() { return []; },
  };
}

/* ------------------------------------------------------------------- store */

const nowIso = () => new Date().toISOString();

/* URL-safe, short, and valid as a document id in any store. Not a secret and
   not derived from anything about the child. */
function newId(existing = []) {
  const alphabet = 'bcdfghjkmnpqrstvwxz23456789';
  for (let attempt = 0; attempt < 50; attempt++) {
    let s = '';
    for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!existing.includes(s)) return s;
  }
  return 'p' + Date.now().toString(36);
}

export const blankProgress = (activityId) => ({
  v: PROFILE_V, activityId,
  plays: 0, printed: 0, pagesDone: 0,
  bestRight: 0, bestStreak: 0, bestTier: 0,
  finished: false, lastAt: null,
});

export function createStore(driver = localDriver()) {
  const store = {
    driver,

    async listProfiles() {
      const list = await driver.list('profiles');
      return list.filter(Boolean).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    },

    async getProfile(id) {
      return id ? driver.get(P(id)) : null;
    },

    async createProfile({ avatar, name, food, theme = 'none' }) {
      if (!Number.isInteger(avatar) || avatar < 0 || avatar >= AVATAR_COUNT)
        throw new Error(`avatar ${avatar} out of range`);
      if (!name) throw new Error('a profile needs a name');
      if (!foodById(food)) throw new Error(`food "${food}" is not one of the choices`);
      const existing = (await store.listProfiles()).map((p) => p.id);
      const profile = {
        v: PROFILE_V,
        id: newId(existing),
        avatar, name, food, theme,
        createdAt: nowIso(),
        lastSeenAt: nowIso(),
      };
      await driver.set(P(profile.id), profile);
      return profile;
    },

    async updateProfile(id, patch) {
      const cur = await store.getProfile(id);
      if (!cur) return null;
      const next = { ...cur, ...patch, id: cur.id, v: PROFILE_V, lastSeenAt: nowIso() };
      await driver.set(P(id), next);
      return next;
    },

    async deleteProfile(id) { await driver.remove(P(id)); },

    /* Which profile is in use on this device. Stays local even once profiles are
       remote — see the header note. */
    async getActiveId() { return (await driver.get(ACTIVE_KEY))?.id ?? null; },
    async setActive(id) { await driver.set(ACTIVE_KEY, { id }); return id; },
    async signOut() { await driver.remove(ACTIVE_KEY); },

    async getActive() {
      const id = await store.getActiveId();
      return id ? store.getProfile(id) : null;
    },

    /* ---------------------------------------------------------- progress */

    async getProgress(id, activityId) {
      return (await driver.get(PROG(id, activityId))) ?? blankProgress(activityId);
    },

    async allProgress(id) {
      const list = await driver.list(`profiles/${id}/progress`);
      const out = {};
      for (const p of list) if (p?.activityId) out[p.activityId] = p;
      return out;
    },

    /* The only way progress changes. `event` is what happened, never a new value
       to overwrite with — so the merge rules in MERGE stay the single place that
       decides how anything combines. */
    async record(id, activityId, event = {}) {
      if (!id) return null;
      const cur = await store.getProgress(id, activityId);
      const next = { ...cur, lastAt: nowIso() };
      if (event.played) next.plays = (next.plays || 0) + 1;
      if (event.printed) next.printed = (next.printed || 0) + 1;
      if (event.finished) next.finished = true;
      if (Number.isFinite(event.pagesDone)) next.pagesDone = Math.max(next.pagesDone || 0, event.pagesDone);
      if (Number.isFinite(event.right)) next.bestRight = Math.max(next.bestRight || 0, event.right);
      if (Number.isFinite(event.streak)) next.bestStreak = Math.max(next.bestStreak || 0, event.streak);
      if (Number.isFinite(event.tier)) next.bestTier = Math.max(next.bestTier || 0, event.tier);
      await driver.set(PROG(id, activityId), next);
      return next;
    },
  };
  return store;
}

/* Apply the declared merge rules to two versions of the same progress record.
   Unused while there is one writer; it exists so the sync rule is written down
   and testable now rather than invented under pressure later. */
export function mergeProgress(a, b) {
  if (!a) return b; if (!b) return a;
  const out = { ...a };
  for (const [field, rule] of Object.entries(MERGE)) {
    const x = a[field], y = b[field];
    if (rule === 'sum') out[field] = (x || 0) + (y || 0);
    else if (rule === 'max') out[field] = Math.max(x || 0, y || 0);
    else if (rule === 'or') out[field] = !!x || !!y;
    else if (rule === 'latest') out[field] = (x || '') > (y || '') ? x : y;
  }
  return out;
}
