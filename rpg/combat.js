// Fight rules and the computer-run kids. Pure logic, no DOM, so Node can test and simulate it.
// Chapter 1 is the pretend battle: everyone wears flags, a tag pulls flags, lose them all and you're out.
import G from './grid.js';
import R from './rules.js';
import P from './party.js';
import { CAST } from './art.js';
import { weaponUse } from './items.js';

export const FLAGS_FOR = { legendary: 3, exceptional: 2, success: 1, fail: 0, disaster: 0 };
export const COVER = 20;      // a target in a bush is this much harder to hit
export const MIN_CHANCE = 5;
export const ROUND_CAP = 10;  // pretend games end at sundown: nobody gets stuck in a fight forever

const clone = o => JSON.parse(JSON.stringify(o));

export function makeUnit(d, hero) {
  let char, spec;
  if (d.id === 'hero') {
    char = hero; spec = P.spriteSpec(hero);
  } else {
    const c = CAST.find(k => k.id === d.id);
    spec = clone(c.spec);
    if (d.weapon) spec.layers.mainHand = d.weapon;
    char = P.makeHero({ name: d.name || c.name.split(' ')[0], people: spec.people, bestAt: d.bestAt, weapon: spec.layers.mainHand });
  }
  const weapon = char.gear.mainHand;
  const use = weaponUse(weapon);
  return {
    id: d.id, name: char.name, side: d.side, ai: d.ai, spec, char,
    x: d.x, y: d.y, move: d.move || P.MOVE,
    flags: d.flags, maxFlags: d.flags, out: false,
    weapon, use,
    trick: d.trick ? { ...d.trick, left: d.trick.uses } : null,
    prefersBush: !!d.prefersBush,
  };
}

export function createBattle(def, hero) {
  const map = G.makeMap(def.map);
  const units = def.units.map(d => makeUnit(d, hero));
  const b = { map, units, order: def.order.slice(), turn: 0, round: 1, result: null, taught: {}, ts: { moved: false, acted: false } };
  return b;
}

export const unitById = (b, id) => b.units.find(u => u.id === id);
export const current = b => unitById(b, b.order[b.turn]);
export const enemiesOf = (b, u) => b.units.filter(e => e.side !== u.side && !e.out);
export const friendsOf = (b, u) => b.units.filter(e => e.side === u.side && !e.out && e !== u);
export const unitAt = (b, x, y) => b.units.find(u => !u.out && u.x === x && u.y === y);

export function skillValue(u, id) { return P.skill(u.char, id); }

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

// The chance to tag: the attack skill, minus cover if the target hides in a bush.
export function chance(b, u, target, opts = {}) {
  const skillId = opts.skill || u.use.skill;
  const base = skillValue(u, skillId);
  const cover = !opts.ignoreCover && target && G.terrainAt(b.map, target.x, target.y).cover;
  return { skill: skillId, base, cover: !!cover, value: Math.max(MIN_CHANCE, base - (cover ? COVER : 0)) };
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

// roll: {value} from rules.rollD100(). Returns what happened so the screen can show it.
export function resolveAttack(b, u, target, roll) {
  const ch = chance(b, u, target);
  const tier = R.tierFor(ch.value, roll.value);
  const lost = pull(target, FLAGS_FOR[tier]);
  b.ts.acted = true;
  checkOver(b);
  return { tier, lost, out: target.out, chance: ch };
}

// Area tricks: one roll, and every enemy inside the area loses flags by that result. Cover doesn't help against falling pinecones.
export function areaTiles(b, u, center) { return G.area(b.map, u.trick.shape, center, { r: u.trick.r, toward: center }); }
export function areaCenters(b, u) {
  return G.inRange(b.map, u, u.trick.range).concat([{ x: u.x, y: u.y }]);
}
export function resolveArea(b, u, center, roll) {
  const tiles = areaTiles(b, u, center);
  const hit = enemiesOf(b, u).filter(e => tiles.some(t => t.x === e.x && t.y === e.y));
  const ch = chance(b, u, null, { skill: u.trick.skill, ignoreCover: true });
  const tier = R.tierFor(ch.value, roll.value);
  const results = hit.map(e => ({ id: e.id, lost: pull(e, FLAGS_FOR[tier]), out: e.out }));
  u.trick.left--; b.ts.acted = true;
  checkOver(b);
  return { tier, results, chance: ch, tiles };
}

export function checkOver(b) {
  if (b.result) return b.result;
  const heroes = b.units.filter(u => u.side === 'hero' && !u.out).length;
  const monsters = b.units.filter(u => u.side === 'monster' && !u.out).length;
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
      if (b.round > ROUND_CAP) { b.result = 'tie'; return null; }
    }
    b.ts = { moved: false, acted: false };
    const u = current(b);
    if (!u.out) return u;
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
    u = endTurn(b);
  }
  return b.result;
}

export default { FLAGS_FOR, COVER, ROUND_CAP, makeUnit, createBattle, unitById, current, enemiesOf, friendsOf, unitAt, skillValue, moveTiles, targets, chance, doMove, resolveAttack, areaTiles, areaCenters, resolveArea, checkOver, endTurn, planTurn, scriptedPlan, nextPlan, autoplay };
