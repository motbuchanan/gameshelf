// Kid RPG config. Change GAME_TITLE once the name is chosen; the folder stays rpg/.
export const GAME_TITLE = 'Untitled Adventure';
export const VERSION = '0.4.1';
export const BUILD_DATE = 'Nov 7 2026';
export const KEYS = {
  save: 'rpg_save_v1',
  settings: 'rpg_settings_v1',
};

// Guarded storage with in-memory fallback (private mode, blocked storage).
const mem = {};
export const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) {
      return key in mem ? mem[key] : fallback;
    }
  },
  set(key, value) {
    mem[key] = value;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* memory only */ }
  },
};

export const DEFAULT_SETTINGS = { diceMode: '3d', diceModeAuto: false, sound: true };
export function getSettings() {
  return Object.assign({}, DEFAULT_SETTINGS, store.get(KEYS.settings, {}));
}
export function setSettings(patch) {
  const s = Object.assign(getSettings(), patch);
  store.set(KEYS.settings, s);
  return s;
}
