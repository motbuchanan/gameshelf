// Characters: stats, skills, derived numbers, and building a new hero.
import { SKILL_CAP } from './rules.js';

export const STATS = ['might', 'finesse', 'wits', 'presence', 'resolve'];
export const STAT_NAME = { might: 'Might', finesse: 'Finesse', wits: 'Wits', presence: 'Presence', resolve: 'Resolve' };

// Every skill comes from one stat. Training adds +10.
export const SKILLS = {
  swing:   { name: 'Swing',          stat: 'might' },
  climb:   { name: 'Climb',          stat: 'might' },
  shove:   { name: 'Lift & shove',   stat: 'might' },
  sneak:   { name: 'Sneak',          stat: 'finesse' },
  aim:     { name: 'Aim',            stat: 'finesse' },
  fingers: { name: 'Nimble fingers', stat: 'finesse' },
  notice:  { name: 'Notice',         stat: 'wits' },
  track:   { name: 'Tracking',       stat: 'wits' },
  lore:    { name: 'Lore',           stat: 'wits' },
  talk:    { name: 'Talk',           stat: 'presence' },
  cheer:   { name: 'Cheer on',       stat: 'presence' },
  brave:   { name: 'Stay brave',     stat: 'resolve' },
  tough:   { name: 'Tough it out',   stat: 'resolve' },
};
export const TRAIN_BONUS = 10;

// "What are you best at?" Each answer sets a starting spread and two trained skills.
export const BEST_AT = {
  brave:  { name: 'Being brave',  stats: { might: 45, finesse: 30, wits: 30, presence: 35, resolve: 45 }, trained: ['swing', 'brave'], weapon: 'woodsword' },
  sneaky: { name: 'Being sneaky', stats: { might: 30, finesse: 50, wits: 40, presence: 35, resolve: 30 }, trained: ['sneak', 'fingers'], weapon: 'stick' },
  clever: { name: 'Being clever', stats: { might: 25, finesse: 35, wits: 50, presence: 45, resolve: 30 }, trained: ['notice', 'lore'], weapon: 'slingshot' },
};

// Each people adds a small bonus to one stat.
export const PEOPLE = {
  human: { name: 'Human', bonus: { presence: 5 } },
  elf:   { name: 'Elf',   bonus: { wits: 5 } },
  dwarf: { name: 'Dwarf', bonus: { resolve: 5 } },
};

// Pretend weapons a kid can start with (real GEAR ids from art.js).
export const STARTER_WEAPONS = ['woodsword', 'stick', 'slingshot'];

export const LUCK_MAX = 3;
export const MOVE = 4;

export function hpMax(c) { return 6 + Math.floor(c.stats.might / 10) + Math.floor(c.stats.resolve / 10); }

export function skill(c, id) {
  const def = SKILLS[id];
  if (!def) throw new Error('unknown skill ' + id);
  const base = c.stats[def.stat] + ((c.trained || []).includes(id) ? TRAIN_BONUS : 0) + ((c.skillBonus || {})[id] || 0);
  return Math.max(1, Math.min(SKILL_CAP, base));
}

export function statsFor(bestAt, people) {
  const s = Object.assign({}, BEST_AT[bestAt].stats);
  const bonus = PEOPLE[people].bonus;
  for (const k in bonus) s[k] += bonus[k];
  return s;
}

// Build a level 1 hero from the creation choices.
export function makeHero({ name, people, skin, hair, hairColor, cloth, bestAt, weapon }) {
  if (!BEST_AT[bestAt]) throw new Error('bad bestAt ' + bestAt);
  if (!PEOPLE[people]) throw new Error('bad people ' + people);
  const hero = {
    id: 'hero',
    name: String(name || '').trim().slice(0, 14) || 'Hero',
    people, bestAt,
    look: { skin, hair, hairColor, cloth },
    level: 1, xp: 0,
    stats: statsFor(bestAt, people),
    trained: BEST_AT[bestAt].trained.slice(),
    gear: { head: 'bucket', body: 'tunic', mainHand: weapon || BEST_AT[bestAt].weapon, offHand: null, back: 'satchel' },
    luck: LUCK_MAX,
  };
  hero.hp = hpMax(hero);
  return hero;
}

// The sprite spec for any party member (used by sprites.js).
export function spriteSpec(c) {
  const layers = {};
  for (const k in c.gear) if (c.gear[k]) layers[k] = c.gear[k];
  return { build: 'kid', people: c.people, skin: c.look.skin, hair: c.look.hair, hairColor: c.look.hairColor, cloth: c.look.cloth, layers };
}

export const party = { hero: null };

export default { STATS, STAT_NAME, SKILLS, BEST_AT, PEOPLE, STARTER_WEAPONS, LUCK_MAX, MOVE, hpMax, skill, statsFor, makeHero, spriteSpec, party };
