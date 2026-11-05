// Saving: autosave to localStorage (guarded), versioned with forward migration,
// plus a copyable save code for backup.
import { KEYS, store } from './config.js';

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
  return d;
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
  current = { saveVersion: SAVE_VERSION, hero, chapter: 'ch1', scene: null, flags: {}, savedAt: null };
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
