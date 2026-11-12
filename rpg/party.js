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

// Lucky Charm adds one clover to the Luck jar.
export function luckMax(c) { return LUCK_MAX + ((c && (c.talents || []).includes('charm')) ? 1 : 0); }
// Quick Feet adds one step.
export function moveOf(c) { return MOVE + ((c && (c.talents || []).includes('quick')) ? 1 : 0); }

// Hearts: 6, plus a little from Might and Resolve, plus 3 for every level after the first.
export const HEARTS_PER_LEVEL = 3;
export function hpMax(c) { return 6 + Math.floor(c.stats.might / 10) + Math.floor(c.stats.resolve / 10) + HEARTS_PER_LEVEL * ((c.level || 1) - 1); }

// ---------- XP (experience points) ----------
// Getting past a challenge earns XP. Talking or sneaking past counts the same as winning a fight.
// Levels come when the star bar fills, at the next rest. Like D&D, each level takes a little more than the last.
export const XP = { easy: 3, normal: 5, hard: 7, boss: 12, check: 1 };
export const XP_LEVELS = { 2: 10, 3: 40, 4: 65, 5: 95, 6: 130, 7: 170, 8: 215, 9: 265, 10: 320 };
export function levelForXp(xp) { let l = 1; while (XP_LEVELS[l + 1] != null && (xp || 0) >= XP_LEVELS[l + 1]) l++; return l; }
// How full the star bar is: XP into this level, and how much this level needs.
export function xpProgress(c) {
  const lvl = c.level || 1, from = XP_LEVELS[lvl] || 0, to = XP_LEVELS[lvl + 1];
  if (to == null) return { have: 0, need: 0, frac: 1, from, to };
  const have = Math.max(0, (c.xp || 0) - from), need = to - from;
  return { have: Math.min(have, need), need, frac: Math.min(1, have / need), from, to };
}

// Talents picked at levels 3, 5 and 7.
export const TALENTS = {
  secondwind: { name: 'Second Wind', text: 'Once a fight, when you get down to 3 hearts or less, you get 3 hearts back.' },
  charm:      { name: 'Lucky Charm', text: 'Your Luck jar holds one more clover.' },
  quick:      { name: 'Quick Feet',  text: 'You can move one more step in fights.' },
  // Book Three: new at level 7
  tinker:     { name: 'Tinker\'s Eye', text: 'You see the glowing weak spots on clockwork things: 10 more squares to hit them or fix them.' },
  helping:    { name: 'Helping Hand', text: 'Friends who help you with a skill roll give 5 more squares.' },
  // Book Four: new at level 9
  sure:       { name: 'Sure Feet', text: 'Ice, wind and moving floors never slide you.' },
  dragonfriend: { name: 'Dragon Friend', text: 'Your dragon can use each of its tricks one more time in every fight.' },
};
export const TALENT_LEVELS = [3, 5, 7, 9];
export const STAT_PICK_LEVELS = [4];
// Tinker's Eye and Helping Hand only show up from level 7 (lv: the level the talent is for).
export const TALENT_MIN_LEVEL = { tinker: 7, helping: 7, sure: 9, dragonfriend: 9 };
export function talentChoices(c, lv = (c.level || 1)) { return Object.keys(TALENTS).filter(t => !(c.talents || []).includes(t) && lv >= (TALENT_MIN_LEVEL[t] || 0)); }

// Leveling up. Each new level: +3 max hearts, +5 to the stat the hero is best at, and one new practiced skill they pick.
export const BEST_STAT = { brave: 'might', sneaky: 'finesse', clever: 'wits' };
export const LEVEL_STAT_GAIN = 5;
// Up to 3 skills to offer: ones not practiced yet, the hero's own kind first.
export function levelSkillChoices(c) {
  const mine = { brave: ['tough', 'climb', 'shove', 'cheer'], sneaky: ['aim', 'climb', 'notice', 'track'], clever: ['track', 'talk', 'cheer', 'aim'] }[c.bestAt] || [];
  const rest = Object.keys(SKILLS);
  return [...new Set([...mine, ...rest])].filter(id => !(c.trained || []).includes(id)).slice(0, 3);
}
// Returns what grew, so the level-up screen can show it.
export function levelUp(c, skillId, statChoice, talentId) {
  const stat = statChoice && STATS.includes(statChoice) ? statChoice : BEST_STAT[c.bestAt];
  const before = { level: c.level, hp: hpMax(c), stat: c.stats[stat] };
  c.level = (c.level || 1) + 1;
  c.stats[stat] += LEVEL_STAT_GAIN;
  if (skillId && SKILLS[skillId] && !c.trained.includes(skillId)) c.trained.push(skillId);
  if (talentId && TALENTS[talentId]) { c.talents = c.talents || []; if (!c.talents.includes(talentId)) c.talents.push(talentId); }
  c.hp = hpMax(c); c.luck = luckMax(c);
  return { level: c.level, stat, statBefore: before.stat, statAfter: c.stats[stat], hpBefore: before.hp, hpAfter: c.hp, skill: skillId };
}

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

export default { STATS, STAT_NAME, SKILLS, BEST_AT, PEOPLE, STARTER_WEAPONS, LUCK_MAX, MOVE, luckMax, moveOf, HEARTS_PER_LEVEL, XP, XP_LEVELS, levelForXp, xpProgress, TALENTS, TALENT_LEVELS, STAT_PICK_LEVELS, talentChoices, hpMax, BEST_STAT, LEVEL_STAT_GAIN, levelSkillChoices, levelUp, skill, statsFor, makeHero, spriteSpec, party };
