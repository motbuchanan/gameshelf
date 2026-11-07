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

export const FLAGS_FOR = { legendary: 3, exceptional: 2, success: 1, fail: 0, disaster: 0 };
export const COVER = 20;      // a target in a bush is this much harder to hit
export const MIN_CHANCE = 5;
export const ROUND_CAP = 10;  // pretend games end at sundown: nobody gets stuck in a fight forever

const clone = o => JSON.parse(JSON.stringify(o));

function makeMonster(d) {
  const m = MONSTERS[d.monster];
  if (!m) throw new Error('unknown monster ' + d.monster);
  const c = CAST.find(k => k.id === m.cast);
  const spec = clone(c.spec);
  const use = { ...weaponUse(m.weapon), ...(m.range ? { range: m.range } : {}) };
  if (m.range) use.skill = 'aim';
  return {
    id: d.id, name: d.name || m.name, side: d.side || 'monster', ai: d.ai || 'monster', spec, char: null, cast: m.cast,
    x: d.x, y: d.y, move: m.move,
    flags: m.hp, maxFlags: m.hp, out: false,
    weapon: m.weapon, use, skills: m.skills, armor: m.armor, finesse: m.finesse, retreatAt: m.retreatAt || 0,
    trick: null, prefersBush: !!d.prefersBush, bystander: !!d.bystander,
  };
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
  const weapon = char.gear.mainHand;
  const use = weaponUse(weapon);
  const hp = mode === 'hp' ? (d.id === 'hero' ? Math.max(1, char.hp) : P.hpMax(char)) : d.flags;
  const maxHp = mode === 'hp' ? P.hpMax(char) : d.flags;
  return {
    id: d.id, name: char.name, side: d.side, ai: d.ai, spec, char, cast: d.id,
    x: d.x, y: d.y, move: d.move || P.MOVE,
    flags: hp, maxFlags: maxHp, out: false,
    weapon, use, armor: mode === 'hp' ? armorOf(char.gear) : 0, finesse: char.stats.finesse, retreatAt: 0,
    trick: d.trick ? { ...d.trick, left: d.trick.uses } : null,
    prefersBush: !!d.prefersBush, bystander: !!d.bystander,
  };
}

export function createBattle(def, hero) {
  const map = G.makeMap(def.map);
  const mode = def.mode || 'flags';
  const units = def.units.map(d => makeUnit(d, hero, mode));
  const b = { map, units, mode, order: (def.order || units.filter(u => !u.bystander).map(u => u.id)).slice(), turn: 0, round: 1, result: null,
    taught: { ...(def.taught || {}) }, ts: { moved: false, acted: false }, roundCap: def.roundCap || ROUND_CAP, capResult: def.capResult || 'tie' };
  return b;
}

// A unit that joins mid-fight (for story moments). It doesn't take turns.
export function addUnit(b, d, hero) { const u = makeUnit({ bystander: true, ...d }, hero, b.mode); b.units.push(u); return u; }
// A unit leaves the fight for good (carried off, or ran away).
export function removeUnit(b, id) { const u = unitById(b, id); if (u) { u.out = true; u.gone = true; } return u; }

// Who goes first: everyone rolls d20 plus their Finesse bonus. Highest goes first; ties go to the heroes.
export function initBonus(u) { return Math.floor((u.finesse || 0) / 10); }
export function rollInitiative(b, d20 = () => R.rollDice('1d20').total) {
  const list = b.units.filter(u => !u.bystander && !u.out).map(u => { const roll = d20(u); return { id: u.id, roll, bonus: initBonus(u), total: roll + initBonus(u), side: u.side }; });
  list.sort((a, c) => (c.total - a.total) || ((a.side === 'hero' ? 0 : 1) - (c.side === 'hero' ? 0 : 1)));
  b.init = list; b.order = list.map(e => e.id); b.turn = 0;
  return list;
}

export const unitById = (b, id) => b.units.find(u => u.id === id);
export const current = b => unitById(b, b.order[b.turn]);
export const enemiesOf = (b, u) => b.units.filter(e => e.side !== u.side && !e.out && !e.bystander);
export const friendsOf = (b, u) => b.units.filter(e => e.side === u.side && !e.out && !e.bystander && e !== u);
export const unitAt = (b, x, y) => b.units.find(u => !u.out && u.x === x && u.y === y);

export function skillValue(u, id) { return u.skills ? (u.skills[id] ?? 20) : P.skill(u.char, id); }

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
  return { skill: skillId, base, cover: !!cover, armor, value: Math.max(MIN_CHANCE, base - (cover ? COVER : 0) - armor) };
}

// Damage dice for a hit, by how well it went (real fights).
//   It works: the weapon's dice. Exceptional: one extra die. Legendary: the weapon's dice at their highest, plus one extra die.
export function weaponDice(u) { return (u.trickDice) || (GEAR[u.weapon] && GEAR[u.weapon].dice) || '1d4'; }
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
export function resolveArea(b, u, center, roll, dmg) {
  const tiles = areaTiles(b, u, center);
  const hit = enemiesOf(b, u).filter(e => tiles.some(t => t.x === e.x && t.y === e.y));
  const ch = chance(b, u, null, { skill: u.trick.skill, ignoreCover: true });
  const tier = R.tierFor(ch.value, roll.value);
  const amount = b.mode === 'hp' ? (FLAGS_FOR[tier] ? (dmg ? dmg.total : rollDamage(u.trick.dice || '1d4', tier).total) : 0) : FLAGS_FOR[tier];
  const results = hit.map(e => ({ id: e.id, lost: pull(e, amount), out: e.out }));
  u.trick.left--; b.ts.acted = true;
  checkOver(b);
  return { tier, results, chance: ch, tiles };
}

// A hurt monster on the edge of the map runs away and is out of the fight.
export function flee(b, u) { u.out = true; u.fled = true; b.ts.acted = true; checkOver(b); return u; }
export const onEdge = (b, u) => u.x === 0 || u.y === 0 || u.x === b.map.w - 1 || u.y === b.map.h - 1;
export const wantsToFlee = (b, u) => b.mode === 'hp' && u.side === 'monster' && u.retreatAt > 0 && u.flags <= u.retreatAt;

export function checkOver(b) {
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

  // Hurt monsters run: off the map if they're on the edge, otherwise as far from the kids as they can, toward an edge.
  if (wantsToFlee(b, u)) {
    if (onEdge(b, u)) { plan.action = { type: 'flee' }; plan.teach = once('retreat'); return plan; }
    const edgeDist = t => Math.min(t.x, t.y, b.map.w - 1 - t.x, b.map.h - 1 - t.y);
    const best = options.slice().sort((a, c) => (edgeDist(a) - edgeDist(c)) || (fd(field, c.x, c.y) - fd(field, a.x, a.y)))[0];
    if (best !== stay) plan.moveTo = { x: best.x, y: best.y };
    plan.teach = once('retreat');
    return plan;
  }

  // Area trick: use it when it can catch at least one enemy (and the kid still has uses).
  if (u.trick && u.trick.left > 0) {
    let best = null;
    for (const c of areaCenters(b, u)) {
      const tilesHit = areaTiles(b, u, c);
      const n = foes.filter(e => tilesHit.some(t => t.x === e.x && t.y === e.y)).length;
      if (n && (!best || n > best.n)) best = { c, n };
    }
    if (best) { plan.action = { type: 'area', center: best.c }; plan.teach = once('area'); return plan; }
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
export function autoplay(b, rollFn, def) {
  let guard = 0;
  let u = current(b);
  while (!b.result && guard++ < 500) {
    const plan = nextPlan(b, u, def);
    if (plan.teach) b.taught[plan.teach] = true;
    if (plan.moveTo) doMove(b, u, plan.moveTo.x, plan.moveTo.y);
    if (plan.action && plan.action.type === 'attack') resolveAttack(b, u, unitById(b, plan.action.target), rollFn());
    if (plan.action && plan.action.type === 'area') resolveArea(b, u, plan.action.center, rollFn());
    if (plan.action && plan.action.type === 'flee') flee(b, u);
    u = endTurn(b);
  }
  return b.result;
}

export default { FLAGS_FOR, COVER, ROUND_CAP, makeUnit, createBattle, addUnit, removeUnit, initBonus, rollInitiative, weaponDice, rollDamage, flee, onEdge, wantsToFlee, unitById, current, enemiesOf, friendsOf, unitAt, skillValue, moveTiles, targets, chance, doMove, resolveAttack, areaTiles, areaCenters, resolveArea, checkOver, endTurn, planTurn, scriptedPlan, nextPlan, autoplay };
