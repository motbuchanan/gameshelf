// Fight rules and the computer-run kids. Pure logic, no DOM, so Node can test and simulate it.
// Two kinds of fight (def.mode):
//   'flags' (Chapter 1, pretend): everyone wears flags, a tag pulls flags, lose them all and you're out.
//   'hp' (Chapter 2 on, real): hits roll damage dice and take hearts. Armor makes you harder to hit.
//   Monsters run away when hurt. Kids at zero hearts are knocked down until the fight ends.
// unit.flags / unit.maxFlags hold the life points in both modes (flags or hearts).
import G from './grid.js';
import R from './rules.js';
import P from './party.js';
import { CAST } from './art.js';
import { weaponUse } from './items.js';
import { GEAR } from './art.js';
import { MONSTERS, armorOf } from './monsters.js';
import { SPARK, PATCH } from './roster.js';

export const FLAGS_FOR = { legendary: 3, exceptional: 2, success: 1, fail: 0, disaster: 0 };
export const COVER = 20;      // a target in a bush is this much harder to hit
export const MIN_CHANCE = 5;
export const ROUND_CAP = 10;  // pretend games end at sundown: nobody gets stuck in a fight forever

const clone = o => JSON.parse(JSON.stringify(o));

function makeMonster(d) {
  const m = MONSTERS[d.monster];
  if (!m) throw new Error('unknown monster ' + d.monster);
  const c = CAST.find(k => k.id === d.id) || CAST.find(k => k.id === m.cast);   // named friends (Sniffle, Pudge) have their own look
  const spec = clone(c.spec);
  const use = { ...weaponUse(m.weapon), ...(m.range ? { range: m.range } : {}) };
  if (m.range) use.skill = 'aim';
  const u = {
    id: d.id, name: d.name || m.name, side: d.side || 'monster', ai: d.ai || 'monster', spec, char: null, cast: c.id,
    x: d.x, y: d.y, move: m.move,
    flags: m.hp, maxFlags: m.hp, out: false,
    weapon: m.weapon, use, skills: m.skills, armor: m.armor, finesse: m.finesse, retreatAt: m.retreatAt || 0,
    trick: null, prefersBush: !!d.prefersBush, bystander: !!d.bystander,
    boss: !!m.boss, sweepDice: m.sweepDice || null,
    dice: m.dice || null, weaponName: m.dice ? m.weapon : null,
    pack: !!m.pack, leader: !!m.leader, fly: !!m.fly, fireResist: !!m.fireResist, summoner: !!m.summoner, clockwork: !!m.clockwork,
    kind: d.monster, summonKind: m.summonKind || null, big: !!m.big, restTurns: m.restTurns || 1,
  };
  // A monster-shaped friend with a trick of their own (Wren's wrench).
  return d.tricks ? withTricks(u, d.tricks) : u;
}

export function makeUnit(d, hero, mode = 'flags') {
  if (d.monster) return makeMonster(d);
  let char, spec;
  if (d.id === 'hero') {
    char = hero; spec = P.spriteSpec(hero);
  } else {
    const c = CAST.find(k => k.id === d.id);
    spec = clone(c.spec);
    if (d.weapon) spec.layers.mainHand = d.weapon;
    char = P.makeHero({ name: d.name || c.name.split(' ')[0], people: spec.people, bestAt: d.bestAt, weapon: spec.layers.mainHand });
  }
  if (d.offHand) { spec.layers.offHand = d.offHand; char.gear.offHand = d.offHand; }
  // Tricks and spells: from the fight data, plus spells the kid has learned. trick = the one being used right now.
  const tricks = [].concat(d.tricks || [], d.trick ? [d.trick] : []);
  const spells = char.spells || [];
  if (spells.includes('spark') && !tricks.some(t => t.id === 'spark')) tricks.push(SPARK);
  if (spells.includes('patch') && !tricks.some(t => t.id === 'patch')) tricks.push(PATCH);
  const weapon = char.gear.mainHand;
  const use = weaponUse(weapon);
  const hp = mode === 'hp' ? (d.id === 'hero' ? Math.max(1, char.hp) : P.hpMax(char)) : d.flags;
  const maxHp = mode === 'hp' ? P.hpMax(char) : d.flags;
  return withTricks({
    id: d.id, name: char.name, side: d.side, ai: d.ai, spec, char, cast: d.id,
    x: d.x, y: d.y, move: d.move || (d.id === 'hero' ? P.moveOf(char) : P.MOVE),
    flags: hp, maxFlags: maxHp, out: false,
    weapon, use, armor: mode === 'hp' ? armorOf(char.gear) : 0, finesse: char.stats.finesse, retreatAt: 0,
    trick: null, tricks: [],
    prefersBush: !!d.prefersBush, bystander: !!d.bystander,
  }, tricks);
}
function withTricks(u, tricks) { u.tricks = tricks.map(t => ({ ...t, left: t.uses })); u.trick = u.tricks.find(t => !t.heal) || u.tricks[0] || null; return u; }

export function createBattle(def, hero) {
  const map = G.makeMap(def.map);
  const mode = def.mode || 'flags';
  const units = def.units.map(d => makeUnit(d, hero, mode));
  // Later chapters toughen the monsters: def.boost = { hp, skill } is added to every monster on the monster side.
  if (def.boost) units.filter(u => u.side === 'monster' && u.skills).forEach(u => {
    u.flags += def.boost.hp || 0; u.maxFlags += def.boost.hp || 0;
    u.skills = Object.fromEntries(Object.entries(u.skills).map(([k, v]) => [k, v + (def.boost.skill || 0)]));
  });
  // Friends who leveled up: +2 hearts and +3 to every skill for each level after the first.
  if (def.friendLv) units.filter(u => u.side === 'hero' && u.id !== 'hero' && def.friendLv[u.id] > 1).forEach(u => {
    const up = def.friendLv[u.id] - 1;
    u.lv = def.friendLv[u.id]; u.flags += 2 * up; u.maxFlags += 2 * up; u.lvBonus = 3 * up;
  });
  // Home Team: Hollis guarding camp gives every hero-side unit extra hearts.
  if (def.teamHearts) units.filter(u => u.side === 'hero' && !u.bystander).forEach(u => { u.flags += def.teamHearts; u.maxFlags += def.teamHearts; });
  // Home Team: Wren tunes up everyone's gear (a little more armor).
  if (def.teamArmor) units.filter(u => u.side === 'hero' && !u.bystander).forEach(u => { u.armor = (u.armor || 0) + def.teamArmor; });
  const b = { map, units, mode, order: (def.order || units.filter(u => !u.bystander).map(u => u.id)).slice(), turn: 0, round: 1, result: null,
    taught: { ...(def.taught || {}) }, ts: { moved: false, acted: false }, roundCap: def.roundCap || ROUND_CAP, capResult: def.capResult || 'tie',
    scared: {}, danger: [], warn: !!def.warn, fireScares: !!def.fireScares, bossPhase: 0,
    calm: def.calm ? { value: def.calm.start || 0, max: def.calm.max || 3, bonus: def.calm.bonus || 0 } : null,
    cage: def.cage ? { ...def.cage, open: false } : null,
    fix: def.fix ? { value: 0, max: def.fix.max || 3, bonus: def.fix.bonus || 0, target: def.fix.target } : null,
    clockMinus: def.clockMinus || 0, initPlus: def.initPlus || 0, summonBoost: def.summonBoost || 0 };
  // Home Team: Nell's trap (stuck) and Sniffle's sleepy monster: they skip their first turns.
  b.skipWhy = {};
  for (const [id, st] of Object.entries(def.stuck || {})) if (unitById(b, id)) { scare(b, id, st.turns || 1); b.skipWhy[id] = { tag: st.tag || 'Stuck!', say: st.say || 'Hey! I\'m stuck!' }; }
  return b;
}

// A unit that joins mid-fight (for story moments). It doesn't take turns.
export function addUnit(b, d, hero) { const u = makeUnit({ bystander: true, ...d }, hero, b.mode); b.units.push(u); return u; }
// A unit leaves the fight for good (carried off, or ran away).
export function removeUnit(b, id) { const u = unitById(b, id); if (u) { u.out = true; u.gone = true; } return u; }

// Who goes first: everyone rolls d20 plus their Finesse bonus. Highest goes first; ties go to the heroes.
export function initBonus(u) { return Math.floor((u.finesse || 0) / 10); }
// surprise: the heroes snuck up, so all of them go before any monster.
export function rollInitiative(b, d20 = () => R.rollDice('1d20').total, surprise = false) {
  // Tobin's lookout at home: every hero rolls a little higher (b.initPlus).
  const list = b.units.filter(u => !u.bystander && !u.out).map(u => { const roll = d20(u), bonus = initBonus(u) + (u.side === 'hero' ? (b.initPlus || 0) : 0); return { id: u.id, roll, bonus, total: roll + bonus, side: u.side }; });
  const sideRank = e => (e.side === 'hero' ? 0 : 1);
  list.sort((a, c) => (surprise ? sideRank(a) - sideRank(c) : 0) || (c.total - a.total) || (sideRank(a) - sideRank(c)));
  b.init = list; b.order = list.map(e => e.id); b.turn = 0;
  return list;
}

export const unitById = (b, id) => b.units.find(u => u.id === id);
export const current = b => unitById(b, b.order[b.turn]);
export const enemiesOf = (b, u) => b.units.filter(e => e.side !== u.side && !e.out && !e.bystander);
export const friendsOf = (b, u) => b.units.filter(e => e.side === u.side && !e.out && !e.bystander && e !== u);
export const unitAt = (b, x, y) => b.units.find(u => !u.out && u.x === x && u.y === y);

// lvBonus: a leveled-up friend is better at everything they do (+3 a level after the first).
export function skillValue(u, id) { return (u.skills ? (u.skills[id] ?? 20) : P.skill(u.char, id)) + (u.lvBonus || 0); }

// Where u can walk this turn (tiles it can stop on, not counting where it stands).
export function moveTiles(b, u) {
  const reach = G.reachable(b.map, u, b.units);
  return { reach, tiles: [...reach.values()].filter(t => !t.passOnly && !(t.x === u.x && t.y === u.y)) };
}

// Enemies u can tag from where it stands.
export function targets(b, u) {
  const tiles = G.inRange(b.map, u, u.use.range);
  return enemiesOf(b, u).filter(e => tiles.some(t => t.x === e.x && t.y === e.y));
}

// The chance to hit: the attack skill, minus cover if the target hides in a bush, minus the target's armor (real fights only).
export function chance(b, u, target, opts = {}) {
  const skillId = opts.skill || u.use.skill;
  const base = skillValue(u, skillId);
  const cover = !opts.ignoreCover && target && G.terrainAt(b.map, target.x, target.y).cover;
  const armor = b.mode === 'hp' && target && !opts.ignoreArmor ? (target.armor || 0) : 0;
  const pack = packBonus(b, u, target);
  // Bolt on patrol at home: clockwork monsters are a little worse at hitting.
  const clock = u.clockwork && u.side === 'monster' ? (b.clockMinus || 0) : 0;
  // Tinker's Eye talent: the hero sees the glowing weak spots on clockwork monsters.
  const eye = target && target.clockwork && hasTalent(u, 'tinker') ? TINKER_EYE : 0;
  return { skill: skillId, base, cover: !!cover, armor, pack, clock, eye, value: Math.max(MIN_CHANCE, Math.min(R.SKILL_CAP || 95, base + pack + eye - (cover ? COVER : 0) - armor - clock)) };
}

export const TINKER_EYE = 10;
export const hasTalent = (u, t) => !!(u && u.char && (u.char.talents || []).includes(t));

// Damage dice for a hit, by how well it went (real fights).
//   It works: the weapon's dice. Exceptional: one extra die. Legendary: the weapon's dice at their highest, plus one extra die.
export function weaponDice(u) { return u.dice || (GEAR[u.weapon] && GEAR[u.weapon].dice) || '1d4'; }
export function weaponName(u) { return u.weaponName || (GEAR[u.weapon] ? GEAR[u.weapon].name : 'claws'); }
// Wolves: a pack bonus when another wolf is right next to the same target.
export const PACK_BONUS = 15;
export function packBonus(b, u, target) {
  if (!u.pack || !target) return 0;
  return b.units.some(o => o !== u && o.pack && !o.out && o.side === u.side && G.dist(o, target) <= 1) ? PACK_BONUS : 0;
}
export function rollDamage(note, tier, rollFn = R.rollDice) {
  if (!FLAGS_FOR[tier]) return { dice: [], total: 0 };
  const { dice: sides, mod } = R.parseDice(note);
  let dice;
  if (tier === 'legendary') dice = sides.map(s => ({ sides: s, value: s, max: true })).concat(rollFn('1d' + sides[0]).dice);
  else {
    dice = rollFn(note).dice;
    if (tier === 'exceptional') dice = dice.concat(rollFn('1d' + sides[0]).dice);
  }
  return { dice, total: Math.max(1, dice.reduce((a, d) => a + d.value, 0) + mod) };
}

export function doMove(b, u, x, y) {
  const { reach } = moveTiles(b, u);
  const t = reach.get(G.key(x, y));
  if (!t || t.passOnly) throw new Error(`${u.id} cannot move to ${x},${y}`);
  const path = G.pathTo(reach, x, y);
  u.x = x; u.y = y; b.ts.moved = true;
  return path;
}

function pull(target, n) {
  const lost = Math.min(target.flags, n);
  target.flags -= lost;
  // Second Wind talent: once a fight, dropping to 3 hearts or less (even 0) gives 3 hearts back.
  if (lost && !target.windUsed && target.flags <= 3 && target.char && (target.char.talents || []).includes('secondwind') && target.maxFlags > 3) {
    target.windUsed = true; target.windNow = true;
    target.flags = Math.min(target.maxFlags, target.flags + 3);
  }
  if (target.flags <= 0) target.out = true;
  return lost;
}

// roll: {value} from rules.rollD100(). dmg: {total} from rollDamage (real fights). Returns what happened so the screen can show it.
export function resolveAttack(b, u, target, roll, dmg) {
  const ch = chance(b, u, target);
  const tier = R.tierFor(ch.value, roll.value);
  const lost = pull(target, b.mode === 'hp' ? (FLAGS_FOR[tier] ? (dmg ? dmg.total : rollDamage(weaponDice(u), tier).total) : 0) : FLAGS_FOR[tier]);
  b.ts.acted = true;
  checkOver(b);
  return { tier, lost, out: target.out, chance: ch };
}

// Area tricks: one roll, and every enemy inside the area loses flags by that result. Cover doesn't help against falling pinecones.
export function areaTiles(b, u, center) { return G.area(b.map, u.trick.shape, center, { r: u.trick.r, toward: center }); }
export function areaCenters(b, u) {
  return G.inRange(b.map, u, u.trick.range).concat([{ x: u.x, y: u.y }]);
}
export function useTrick(u, id) { const t = (u.tricks || []).find(x => x.id === id); if (t) u.trick = t; return u.trick; }
export function resolveArea(b, u, center, roll, dmg) {
  const tiles = areaTiles(b, u, center);
  const ch = chance(b, u, null, { skill: u.trick.skill, ignoreCover: true });
  const tier = R.tierFor(ch.value, roll.value);
  const amount = b.mode === 'hp' ? (FLAGS_FOR[tier] ? (dmg ? dmg.total : rollDamage(u.trick.dice || '1d4', tier).total) : 0) : FLAGS_FOR[tier];
  // Patch Up: friends in the square get hearts back instead.
  if (u.trick.heal) {
    const pals = b.units.filter(e => e.side === u.side && !e.out && !e.bystander && tiles.some(t => t.x === e.x && t.y === e.y));
    const results = pals.map(e => { const before = e.flags; e.flags = Math.min(e.maxFlags, e.flags + amount); return { id: e.id, healed: e.flags - before }; });
    u.trick.left--; b.ts.acted = true;
    return { tier, results, chance: ch, tiles, heal: true };
  }
  const hit = enemiesOf(b, u).filter(e => tiles.some(t => t.x === e.x && t.y === e.y));
  // Clockwork owls shrug off fire: half damage.
  const results = hit.map(e => ({ id: e.id, lost: pull(e, u.trick.fire && e.fireResist ? Math.max(1, Math.floor(amount / 2)) * (amount ? 1 : 0) : amount), out: e.out }));
  if (u.trick.fire && b.fireScares && amount) hit.filter(e => e.boss && !e.out).forEach(e => { b.scared[e.id] = 1; });
  // Wren's wrench: a clockwork monster it hits jams for a turn.
  if (u.trick.jam && amount) hit.filter(e => e.clockwork && !e.out).forEach(e => { scare(b, e.id, 1); b.skipWhy = b.skipWhy || {}; b.skipWhy[e.id] = { tag: 'Jammed!', say: 'Clunk. Squeak. Clunk.' }; });
  u.trick.left--; b.ts.acted = true;
  checkOver(b);
  return { tier, results, chance: ch, tiles };
}

// ---------- the boss: Grubjaw ----------
// His turns go: normal attack, then he winds up (laughing), then a big flail sweep hits every kid next to him.
// With the Laugh clue, the windup squares show on the map and friends step out of them.
// With the Fire clue, a Spark (or the torch) scares him and he loses his next turn.
export function bossWindup(b, u) {
  b.danger = G.area(b.map, 'circle', { x: u.x, y: u.y }, { r: 1 }).filter(t => !(t.x === u.x && t.y === u.y));
  b.bossPhase = 2;
}
export function resolveSweep(b, u, roll, dmg) {
  const ch = chance(b, u, null, { skill: 'swing', ignoreCover: true, ignoreArmor: true });
  const tier = R.tierFor(ch.value, roll.value);
  const amount = FLAGS_FOR[tier] ? (dmg ? dmg.total : rollDamage(u.sweepDice || '1d6', tier).total) : 0;
  const hit = enemiesOf(b, u).filter(e => b.danger.some(t => t.x === e.x && t.y === e.y));
  const results = hit.map(e => ({ id: e.id, lost: pull(e, amount), out: e.out }));
  b.danger = []; b.bossPhase = 0;
  b.ts.acted = true;
  checkOver(b);
  return { tier, value: ch.value, roll, results };
}
export function scare(b, id, turns = 1) { b.scared[id] = Math.max(b.scared[id] || 0, turns); }

// ---------- the cage ----------
export function canOpenCage(b, u) {
  return !!(b.cage && !b.cage.open && u.side === 'hero' && !u.out && G.dist(u, b.cage) <= 1);
}
export function openCage(b) {
  const kid = unitById(b, b.cage.kid);
  b.cage.open = true; b.ts.acted = true;
  if (kid) {
    kid.bystander = false; kid.ai = 'friend';
    if (!b.order.includes(kid.id)) b.order.splice(b.turn + 1, 0, kid.id);
  }
  return kid;
}

// A hurt monster on the edge of the map runs away and is out of the fight.
export function flee(b, u) { u.out = true; u.fled = true; b.ts.acted = true; checkOver(b); return u; }
export const onEdge = (b, u) => u.x === 0 || u.y === 0 || u.x === b.map.w - 1 || u.y === b.map.h - 1;
export const wantsToFlee = (b, u) => b.mode === 'hp' && u.side === 'monster' && u.retreatAt > 0 && u.flags <= u.retreatAt;

// When the pack leader is out, every wolf runs.
function routCheck(b) {
  if (b.units.some(u => u.leader && u.out)) b.units.filter(u => u.pack && !u.out).forEach(u => { u.retreatAt = 999; });
}
// Talking a boss down (def.calm): each good Talk roll adds calm; full calm ends the fight peacefully.
export function talkChance(b, u) {
  const base = skillValue(u, 'talk') + (b.calm ? b.calm.bonus || 0 : 0);
  return Math.max(MIN_CHANCE, Math.min(95, base));
}
export function talk(b, u, roll) {
  const value = talkChance(b, u), tier = R.tierFor(value, roll.value);
  const gain = FLAGS_FOR[tier] || 0;
  b.calm.value = Math.min(b.calm.max, b.calm.value + gain);
  b.ts.acted = true;
  if (b.calm.value >= b.calm.max) b.result = 'calm';
  return { tier, value, gain };
}
// A healing potion from the bag: 2d4 + 2 hearts.
export function drinkPotion(b, u, rollFn = R.rollDice) {
  const items = u.char && u.char.items; if (!items || !(items.potion > 0)) return 0;
  items.potion--;
  const amt = rollFn('2d4').total + 2, before = u.flags;
  u.flags = Math.min(u.maxFlags, u.flags + amt);
  b.ts.acted = true;
  return u.flags - before;
}
// ---------- things from the bag (Book Three) ----------
// Throw an oil can, a bucket of water or a net at a monster up to 4 squares away. No roll: it always lands.
//   oil: the monster slips and is stuck for a turn (fliers just fly over the slick).
//   water: a clockwork monster jams for 2 turns; anything else is splashed and stuck for 1.
//   net: stuck for 2 turns. Big bosses only ever lose 1 turn.
export const THROW_RANGE = 4;
export const THROWABLE = ['oil', 'water', 'net'];
export function throwTargets(b, u) {
  const tiles = G.inRange(b.map, u, THROW_RANGE);
  return enemiesOf(b, u).filter(e => tiles.some(t => t.x === e.x && t.y === e.y));
}
export function throwEffect(item, target) {
  let turns = 0, tag = '', say = '';
  if (item === 'oil') { if (!target.fly) { turns = 1; tag = 'Slipped!'; say = 'Whoa! Whoa! SPLAT. Slippery!'; } else { tag = 'Flew over!'; say = 'Ha! I can fly, silly.'; } }
  if (item === 'water') { if (target.clockwork) { turns = 2; tag = 'Jammed!'; say = 'Fzzzt... clunk. Clunk. Squeak.'; } else { turns = 1; tag = 'Splashed!'; say = 'Bleh! Cold water!'; } }
  if (item === 'net') { turns = 2; tag = 'Netted!'; say = 'Hey! A net! Get it off!'; }
  if (target.boss && turns) turns = 1;
  return { turns, tag, say };
}
export function throwItem(b, u, target, item, rollFn) {
  void rollFn;
  const items = u.char && u.char.items; if (!items || !(items[item] > 0)) return null;
  items[item]--;
  const fx = throwEffect(item, target);
  if (fx.turns) { scare(b, target.id, fx.turns); b.skipWhy = b.skipWhy || {}; b.skipWhy[target.id] = { tag: fx.tag, say: fx.say }; }
  b.ts.acted = true;
  return fx;
}

// ---------- fixing the clockwork beast (Book Three boss) ----------
// Climb up next to it and roll Nimble fingers to fix one of its glowing gears. Fix them all and it sits down.
export function canFix(b, u) {
  if (!b.fix || b.result || u.side !== 'hero' || u.out) return false;
  const t = unitById(b, b.fix.target);
  return !!(t && !t.out && G.dist(u, t) <= 1);
}
export function fixChance(b, u) {
  const base = skillValue(u, 'fingers') + (b.fix ? b.fix.bonus || 0 : 0) + (hasTalent(u, 'tinker') ? TINKER_EYE : 0);
  return Math.max(MIN_CHANCE, Math.min(95, base));
}
export function fix(b, u, roll) {
  const value = fixChance(b, u), tier = R.tierFor(value, roll.value);
  const gain = tier === 'legendary' ? 2 : FLAGS_FOR[tier] ? 1 : 0;
  b.fix.value = Math.min(b.fix.max, b.fix.value + gain);
  b.ts.acted = true;
  if (b.fix.value >= b.fix.max) b.result = 'fixed';
  return { tier, value, gain };
}

// ---------- moving floors ----------
// Anyone standing on a moving floor at the end of their turn slides one square along it (if that square is free).
export function slide(b, u) {
  if (!u || u.out || u.gone || u.fly || u.big) return null;
  const t = G.terrainAt(b.map, u.x, u.y);
  if (!t || !t.belt) return null;
  const nx = u.x + t.belt, ny = u.y;
  if (!G.inside(b.map, nx, ny) || !G.terrainAt(b.map, nx, ny).enter || unitAt(b, nx, ny)) return null;
  const from = { x: u.x, y: u.y };
  u.x = nx; u.y = ny;
  return { from, to: { x: nx, y: ny } };
}

// Bramble calls two crows to her side. The clockwork beast calls two windup mice (u.summonKind).
export function summon(b, u) {
  const kind = u.summonKind || 'crow';
  const free = G.area(b.map, 'circle', { x: u.x, y: u.y }, { r: 2 }).filter(t => (MONSTERS[kind].fly ? !['tree', 'wall'].includes(G.terrainAt(b.map, t.x, t.y).id) : G.terrainAt(b.map, t.x, t.y).enter) && !unitAt(b, t.x, t.y));
  const made = [];
  b.summons = (b.summons || 0);
  for (const t of free.slice(0, 2)) {
    b.summons++;
    const c = makeUnit({ id: 'sc' + b.summons, monster: kind, name: MONSTERS[kind].name, x: t.x, y: t.y }, null, b.mode);
    if (b.summonBoost) { c.skills = Object.fromEntries(Object.entries(c.skills).map(([k, v]) => [k, v + b.summonBoost])); }
    b.units.push(c); b.order.push(c.id); made.push(c);
  }
  b.ts.acted = true;
  return made;
}

export function checkOver(b) {
  routCheck(b);
  if (b.result) return b.result;
  const heroes = b.units.filter(u => u.side === 'hero' && !u.out && !u.bystander).length;
  const monsters = b.units.filter(u => u.side === 'monster' && !u.out && !u.bystander).length;
  if (!monsters) b.result = 'win';
  else if (!heroes) b.result = 'lose';
  return b.result;
}

// Move to the next unit that isn't out. Returns the new current unit (or null when the fight is over).
export function endTurn(b) {
  if (checkOver(b)) return null;
  for (let i = 0; i < b.order.length; i++) {
    b.turn++;
    if (b.turn >= b.order.length) {
      b.turn = 0; b.round++;
      if (b.round > b.roundCap) { b.result = b.capResult; return null; }
    }
    b.ts = { moved: false, acted: false };
    const u = current(b);
    if (u && !u.out) return u;
  }
  return null;
}

// ---------- the computer-run kids ----------

// Walking distance from every tile to the nearest of the given units, ignoring who's standing where.
function distanceField(b, toUnits) {
  const field = new Map();
  for (const t of toUnits) {
    const r = G.reachable(b.map, { x: t.x, y: t.y, side: 'none' }, [], 99);
    for (const [k, v] of r) if (!field.has(k) || field.get(k) > v.cost) field.set(k, v.cost);
  }
  return field;
}
const fd = (field, x, y) => field.get(G.key(x, y)) ?? 999;

function canHitFrom(b, u, x, y) {
  const save = [u.x, u.y]; u.x = x; u.y = y;
  const t = targets(b, u);
  u.x = save[0]; u.y = save[1];
  return t;
}

// Pick the best target: easiest chance, then fewest flags left.
function pickTarget(b, u, list) {
  return list.slice().sort((a, c) => (chance(b, u, c).value - chance(b, u, a).value) || (a.flags - c.flags))[0];
}

// Plan one computer turn. The screen plays it back: say, walk, then act.
// Returns {moveTo, action, teach}, where teach names the lesson this turn shows (or null).
export function planTurn(b, u) {
  const foes = enemiesOf(b, u);
  const plan = { moveTo: null, action: null, teach: null };
  if (!foes.length) return plan;
  const { tiles } = moveTiles(b, u);
  const stay = { x: u.x, y: u.y, cost: 0 };
  const options = [stay, ...tiles];
  const field = distanceField(b, foes);
  const isBush = t => G.terrainAt(b.map, t.x, t.y).cover;
  const once = c => (b.taught[c] ? null : c);

  // Scared of fire: loses this turn.
  if (b.scared[u.id] > 0) { plan.action = { type: 'scared' }; return plan; }
  // The boss: wind up, then sweep.
  if (u.boss) {
    if (b.bossPhase === 2) { plan.action = { type: 'sweep' }; return plan; }
    if (b.bossPhase === 1) {
      const step = options.slice().sort((a, c) => (fd(field, a.x, a.y) - fd(field, c.x, c.y)) || (a.cost - c.cost))[0];
      if (step !== stay) plan.moveTo = { x: step.x, y: step.y };
      plan.action = { type: 'windup' };
      return plan;
    }
  }
  // Friends who know about the Laugh step out of the danger squares.
  if (u.side === 'hero' && b.warn && b.danger.length) {
    const safe = options.filter(t => !b.danger.some(d => d.x === t.x && d.y === t.y));
    if (safe.length && safe.length < options.length) {
      options.length = 0; options.push(...safe);
      if (!safe.includes(stay)) {
        const hitsFrom = safe.map(t => ({ t, hits: canHitFrom(b, u, t.x, t.y) })).filter(o => o.hits.length);
        const o = hitsFrom[0] || { t: safe.sort((a, c) => a.cost - c.cost)[0], hits: [] };
        plan.moveTo = { x: o.t.x, y: o.t.y };
        if (o.hits.length) plan.action = { type: 'attack', target: pickTarget(b, u, o.hits).id };
        plan.teach = once('dodge');
        return plan;
      }
    }
  }
  // The cage opener heads for the cage and lets the kid out.
  if (b.cage && !b.cage.open && b.cage.opener === u.id) {
    if (G.dist(u, b.cage) <= 1) { plan.action = { type: 'cage' }; return plan; }
    const near = options.filter(t => G.dist(t, b.cage) <= 1);
    const pick = (near.length ? near : options).slice().sort((a, c) => (G.dist(a, b.cage) - G.dist(c, b.cage)) || (a.cost - c.cost))[0];
    if (pick !== stay) plan.moveTo = { x: pick.x, y: pick.y };
    if (G.dist(pick, b.cage) <= 1) plan.action = { type: 'cage' };
    return plan;
  }

  // Hurt monsters run: off the map if they're on the edge, otherwise as far from the kids as they can, toward an edge.
  if (wantsToFlee(b, u)) {
    if (onEdge(b, u)) { plan.action = { type: 'flee' }; plan.teach = once('retreat'); return plan; }
    const edgeDist = t => Math.min(t.x, t.y, b.map.w - 1 - t.x, b.map.h - 1 - t.y);
    const best = options.slice().sort((a, c) => (edgeDist(a) - edgeDist(c)) || (fd(field, c.x, c.y) - fd(field, a.x, a.y)))[0];
    if (best !== stay) plan.moveTo = { x: best.x, y: best.y };
    plan.teach = once('retreat');
    return plan;
  }

  // Summoner (Bramble): every fourth turn, call crows if fewer than two are flying.
  if (u.summoner) {
    b.summonTick = (b.summonTick || 0) + 1;
    const kind = u.summonKind || 'crow';
    const helpers = b.units.filter(e => e.kind === kind && !e.out && e.side === u.side).length;
    if (b.summonTick % 4 === 1 && helpers < 2) { plan.action = { type: 'summon' }; return plan; }
  }
  // Patch Up: heal a friend who is down to half hearts or less.
  const healT = (u.tricks || []).find(t => t.heal && t.left > 0);
  if (healT) {
    const hurt = b.units.filter(e => e.side === u.side && !e.out && !e.bystander && e.flags <= e.maxFlags / 2 && G.dist(u, e) <= healT.range)
      .sort((a, c) => a.flags / a.maxFlags - c.flags / c.maxFlags)[0];
    if (hurt) { u.trick = healT; plan.action = { type: 'area', center: { x: hurt.x, y: hurt.y }, trick: healT.id }; plan.teach = once('heal'); return plan; }
  }
  const dmgT = (u.tricks || []).find(t => !t.heal && t.left > 0);
  if (dmgT) u.trick = dmgT;
  // Area trick: use it when it can catch at least one enemy (and the kid still has uses).
  if (u.trick && !u.trick.heal && u.trick.left > 0) {
    let best = null;
    for (const c of areaCenters(b, u)) {
      const tilesHit = areaTiles(b, u, c);
      const n = foes.filter(e => tilesHit.some(t => t.x === e.x && t.y === e.y)).length;
      if (n && (!best || n > best.n)) best = { c, n };
    }
    if (best) { plan.action = { type: 'area', center: best.c, trick: u.trick.id }; plan.teach = once('area'); return plan; }
  }

  if (u.use.range > 1) {
    // Shooters: find a spot that can hit something but stays out of reach of a swing.
    const scored = options.map(t => ({ t, hits: canHitFrom(b, u, t.x, t.y), safe: fd(field, t.x, t.y) >= 2 }))
      .filter(o => o.hits.length)
      .sort((a, c) => (c.safe - a.safe) || (a.t.cost - c.t.cost));
    if (scored.length) {
      const o = scored[0];
      if (o.t !== stay) plan.moveTo = { x: o.t.x, y: o.t.y };
      plan.action = { type: 'attack', target: pickTarget(b, u, o.hits).id };
      plan.teach = once('range');
      return plan;
    }
    // Nothing in sight: walk closer.
    const step = options.slice().sort((a, c) => fd(field, a.x, a.y) - fd(field, c.x, c.y) || a.cost - c.cost)[0];
    if (step !== stay) plan.moveTo = { x: step.x, y: step.y };
    plan.teach = once('los');
    return plan;
  }

  // Close fighters: find a tile next to an enemy. Sneaky kids like a bush.
  const adj = options.map(t => ({ t, hits: canHitFrom(b, u, t.x, t.y) })).filter(o => o.hits.length)
    .sort((a, c) => ((u.prefersBush ? isBush(c.t) - isBush(a.t) : 0)) || (a.t.cost - c.t.cost));
  if (adj.length) {
    const o = adj[0];
    if (o.t !== stay) plan.moveTo = { x: o.t.x, y: o.t.y };
    plan.action = { type: 'attack', target: pickTarget(b, u, o.hits).id };
    if (u.prefersBush && isBush(o.t)) plan.teach = once('cover');
    else plan.teach = u.side === 'monster' ? once('monsterturn') : once('attack');
    return plan;
  }
  // Too far: walk as close as possible, through a bush if that's equally close.
  const step = options.slice().sort((a, c) => (fd(field, a.x, a.y) - fd(field, c.x, c.y)) || ((u.prefersBush ? isBush(c) - isBush(a) : 0)) || (a.cost - c.cost))[0];
  if (step !== stay) plan.moveTo = { x: step.x, y: step.y };
  if (u.prefersBush && isBush(step)) plan.teach = once('cover');
  else if (step !== stay) {
    const { reach } = moveTiles(b, u);
    const path = G.pathTo(reach, step.x, step.y);
    if (path.some(p => G.terrainAt(b.map, p.x, p.y).id === 'mud')) plan.teach = once('mud');
    else plan.teach = u.side === 'monster' ? once('monsterturn') : once('move');
  }
  return plan;
}

// A hand-written turn from the chapter data, if there is one for this kid and round and it's still legal.
export function scriptedPlan(b, u, def) {
  const sc = def && def.script && def.script[u.id] && def.script[u.id][b.round];
  if (!sc || b.taught[sc.teach]) return null;
  if (sc.moveTo && !moveTiles(b, u).tiles.some(t => t.x === sc.moveTo.x && t.y === sc.moveTo.y)) return null;
  return { moveTo: sc.moveTo || null, action: null, teach: sc.teach || null };
}
export function nextPlan(b, u, def) { return scriptedPlan(b, u, def) || planTurn(b, u); }

// Run a whole fight with every side computer-controlled (the hero plays like a friend). For balance sims and tests.
// After a unit's turn: count down being scared, and move the boss to his next phase.
export function afterTurn(b, u, plan) {
  if (plan && plan.action && plan.action.type === 'scared') { b.scared[u.id]--; if (!b.scared[u.id] && b.skipWhy) delete b.skipWhy[u.id]; return; }
  // restTurns: how many ordinary turns a boss takes between stomps (Grubjaw 1, the clockwork beast 3).
  if (u.boss && b.bossPhase === 0) { u.bossRest = (u.bossRest || 0) + 1; if (u.bossRest >= (u.restTurns || 1)) { b.bossPhase = 1; u.bossRest = 0; } }
}
export function autoplay(b, rollFn, def) {
  let guard = 0;
  let u = current(b);
  while (!b.result && guard++ < 800) {
    const plan = nextPlan(b, u, def);
    if (plan.teach) b.taught[plan.teach] = true;
    if (plan.moveTo) doMove(b, u, plan.moveTo.x, plan.moveTo.y);
    const a = plan.action && plan.action.type;
    if (a === 'attack') resolveAttack(b, u, unitById(b, plan.action.target), rollFn());
    if (a === 'area') { if (plan.action.trick) useTrick(u, plan.action.trick); resolveArea(b, u, plan.action.center, rollFn()); }
    if (a === 'summon') summon(b, u);
    if (a === 'flee') flee(b, u);
    if (a === 'windup') bossWindup(b, u);
    if (a === 'sweep') resolveSweep(b, u, rollFn());
    if (a === 'cage') openCage(b);
    afterTurn(b, u, plan);
    slide(b, u);
    u = endTurn(b);
  }
  return b.result;
}

export default { THROW_RANGE, THROWABLE, throwTargets, throwEffect, throwItem, canFix, fixChance, fix, slide, hasTalent, TINKER_EYE, FLAGS_FOR, COVER, ROUND_CAP, weaponName, packBonus, useTrick, talk, talkChance, drinkPotion, summon, makeUnit, createBattle, addUnit, removeUnit, initBonus, rollInitiative, weaponDice, rollDamage, flee, onEdge, wantsToFlee, bossWindup, resolveSweep, scare, canOpenCage, openCage, afterTurn, unitById, current, enemiesOf, friendsOf, unitAt, skillValue, moveTiles, targets, chance, doMove, resolveAttack, areaTiles, areaCenters, resolveArea, checkOver, endTurn, planTurn, scriptedPlan, nextPlan, autoplay };
