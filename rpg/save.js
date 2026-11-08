// Saving: autosave to localStorage (guarded), versioned with forward migration,
// plus a copyable save code for backup.
import { KEYS, store } from './config.js';
import P from './party.js';

export const SAVE_VERSION = 1;

// Bring any older save up to the current shape. Never throws away a hero.
export function migrate(data) {
  if (!data || typeof data !== 'object') return null;
  let d = JSON.parse(JSON.stringify(data));
  // v0 (pre-release test saves): the hero fields sat at the top level.
  if (!d.saveVersion) {
    if (d.name && d.stats) d = { saveVersion: 1, hero: d, chapter: d.chapter || 'ch0', scene: null, flags: {}, savedAt: d.savedAt || null };
    else return null;
  }
  // Later versions add steps here: if (d.saveVersion === 1) { ...; d.saveVersion = 2; }
  if (!d.flags) d.flags = {};
  if (d.hero && d.hero.luck == null) d.hero.luck = 3;
  if (d.hero && !d.flags.xpPacing) xpPacing(d);
  return d;
}

// v1.1 (Nov 8 2026): levels now come from XP, about half as fast as before (level 3 at Grubjaw, 5 at Bramble).
// Older heroes get the XP their finished chapters are worth, and a hero above the level that XP gives is lowered:
// the extra stat points come off and the last practiced skills picked go back. Nothing else is lost.
export const XP_AFTER_CHAPTER = [0, 5, 13, 22, 37, 49, 52, 59, 69, 81, 95];
function xpPacing(d) {
  const h = d.hero, f = d.flags;
  let done = 0;
  for (let n = 1; n < XP_AFTER_CHAPTER.length; n++) if (f['ch' + n]) done = n;
  {   // XP was always 0 before v1.1, so it is worked out from the finished chapters
    let xp = Math.max(h.xp || 0, XP_AFTER_CHAPTER[done] || 0);
    if (done >= 2) xp = Math.max(xp, P.XP_LEVELS[2]);
    if (done >= 5) xp = Math.max(xp, P.XP_LEVELS[3]);
    if (done >= 10) xp = Math.max(xp, P.XP_LEVELS[5]);
    h.xp = xp;
  }
  const want = P.levelForXp(h.xp), have = h.level || 1;
  if (have > want && h.stats && P.BEST_AT[h.bestAt] && P.PEOPLE[h.people]) {
    const base = P.statsFor(h.bestAt, h.people);
    for (let k = have; k > want; k--) {
      let stat = P.BEST_STAT[h.bestAt];
      if (!(h.stats[stat] - P.LEVEL_STAT_GAIN >= base[stat])) {
        stat = P.STATS.reduce((a, z) => (h.stats[z] - base[z] > h.stats[a] - base[a] ? z : a), P.STATS[0]);
      }
      if (h.stats[stat] - P.LEVEL_STAT_GAIN >= base[stat]) h.stats[stat] -= P.LEVEL_STAT_GAIN;
    }
    const keep = P.BEST_AT[h.bestAt].trained.length + (want - 1);
    if (Array.isArray(h.trained) && h.trained.length > keep) h.trained = h.trained.slice(0, keep);
    h.level = want;
  }
  // Talents are picked at levels 3 and 5. A moved-over hero who never got to pick gets to at the next rest.
  const owed = P.TALENT_LEVELS.filter(l => l <= (h.level || 1)).length - (h.talents || []).filter(t => P.TALENTS[t]).length;
  if (owed > 0) h.talentOwed = owed;
  if (h.stats) h.hp = Math.min(h.hp == null ? P.hpMax(h) : h.hp, P.hpMax(h));
  if (h.luck > P.luckMax(h)) h.luck = P.luckMax(h);
  f.xpPacing = 1;
}

let current = null;
export function get() { return current; }

export function read() {
  current = migrate(store.get(KEYS.save, null));
  return current;
}

export function write(data) {
  if (data) current = data;
  if (!current) return;
  current.saveVersion = SAVE_VERSION;
  current.savedAt = new Date().toISOString();
  store.set(KEYS.save, current);
}

export function startNew(hero) {
  current = { saveVersion: SAVE_VERSION, hero, chapter: 'ch1', scene: null, flags: { xpPacing: 1 }, savedAt: null };
  write();
  return current;
}

export function wipe() { current = null; store.set(KEYS.save, null); }

// Save code: "RPG1." + base64 of the JSON. Unicode-safe.
export function exportCode() {
  if (!current) return '';
  const json = JSON.stringify(current);
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)));
  return 'RPG1.' + b64;
}

export function importCode(code) {
  const s = String(code || '').trim();
  if (!s.startsWith('RPG1.')) throw new Error('That does not look like a save code.');
  const bin = atob(s.slice(5));
  const json = new TextDecoder().decode(Uint8Array.from(bin, ch => ch.charCodeAt(0)));
  const data = migrate(JSON.parse(json));
  if (!data || !data.hero) throw new Error('That save code is missing its hero.');
  current = data; write();
  return current;
}

export default { SAVE_VERSION, migrate, read, write, get, startNew, wipe, exportCode, importCode };
