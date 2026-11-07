// Grid maps: terrain, movement, ranges, line of sight and area shapes. Pure logic, no DOM.
// Movement is 8-way. A diagonal step costs the same as a straight one, but you can't
// cut a corner past a tile that blocks.

export const TERRAIN = {
  '.': { id: 'grass',  name: 'Grass',  cost: 1, blocks: false, cover: false, enter: true },
  'b': { id: 'bush',   name: 'Bush',   cost: 1, blocks: false, cover: true,  enter: true },
  'm': { id: 'mud',    name: 'Mud',    cost: 2, blocks: false, cover: false, enter: true },
  'L': { id: 'log',    name: 'Log',    cost: 0, blocks: true,  cover: false, enter: false },
  't': { id: 'tree',   name: 'Tree',   cost: 0, blocks: true,  cover: false, enter: false },
  '~': { id: 'stream', name: 'Stream', cost: 0, blocks: false, cover: false, enter: false },
};

export function makeMap(rows) {
  const h = rows.length, w = rows[0].length;
  rows.forEach((r, i) => { if (r.length !== w) throw new Error('map row ' + i + ' is ' + r.length + ' wide, expected ' + w); });
  return { w, h, rows };
}
export const key = (x, y) => x + ',' + y;
export function inside(map, x, y) { return x >= 0 && y >= 0 && x < map.w && y < map.h; }
export function terrainAt(map, x, y) { return TERRAIN[map.rows[y][x]]; }
export function dist(a, b) { return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)); }

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

// Can a walker step from (x,y) to (x+dx,y+dy)? Diagonals may not squeeze past blocked or wet corners.
function canStep(map, x, y, dx, dy) {
  const nx = x + dx, ny = y + dy;
  if (!inside(map, nx, ny) || !terrainAt(map, nx, ny).enter) return false;
  if (dx && dy) {
    if (!terrainAt(map, x + dx, y).enter || !terrainAt(map, x, y + dy).enter) return false;
  }
  return true;
}

// Every tile a unit can end its move on, with the cheapest path cost and the step it came from.
// units: all units on the map. Friends can be walked through, enemies can't, and nobody can stop on an occupied tile.
export function reachable(map, unit, units = [], budget = unit.move) {
  const occ = new Map();
  for (const u of units) if (u !== unit && !u.out) occ.set(key(u.x, u.y), u);
  const best = new Map([[key(unit.x, unit.y), { x: unit.x, y: unit.y, cost: 0, prev: null }]]);
  const open = [{ x: unit.x, y: unit.y, cost: 0 }];
  while (open.length) {
    open.sort((a, b) => a.cost - b.cost);
    const cur = open.shift();
    if (cur.cost > best.get(key(cur.x, cur.y)).cost) continue;
    for (const [dx, dy] of DIRS) {
      const nx = cur.x + dx, ny = cur.y + dy, k = key(nx, ny);
      // Fliers (crows) go over logs and water, but not through trees.
      if (unit.fly) { if (!inside(map, nx, ny) || terrainAt(map, nx, ny).id === 'tree') continue; }
      else if (!canStep(map, cur.x, cur.y, dx, dy)) continue;
      const o = occ.get(k);
      if (o && o.side !== unit.side) continue; // enemies block
      const c = cur.cost + (unit.fly ? 1 : terrainAt(map, nx, ny).cost);
      if (c > budget) continue;
      const had = best.get(k);
      if (had && had.cost <= c) continue;
      best.set(k, { x: nx, y: ny, cost: c, prev: key(cur.x, cur.y) });
      open.push({ x: nx, y: ny, cost: c });
    }
  }
  // You can pass a friend but not stop on them.
  for (const k of [...best.keys()]) if (occ.has(k)) best.get(k).passOnly = true;
  return best;
}

// Tiles from start to (x,y), not counting the start tile.
export function pathTo(reach, x, y) {
  const out = [];
  let k = key(x, y);
  while (k && reach.get(k) && reach.get(k).prev) { const n = reach.get(k); out.unshift({ x: n.x, y: n.y }); k = n.prev; }
  return out;
}

// Straight-line sight between two tiles. Logs and trees block it; bushes, mud and water don't.
export function lineOfSight(map, a, b) {
  let x0 = a.x, y0 = a.y;
  const x1 = b.x, y1 = b.y, dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (!(x0 === x1 && y0 === y1)) {
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
    if (x0 === x1 && y0 === y1) break;
    if (terrainAt(map, x0, y0).blocks) return false;
  }
  return true;
}

// Tiles a unit could hit from where it stands. Range 1 is the 8 tiles around it (no sight check needed).
export function inRange(map, unit, range) {
  const out = [];
  for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
    const d = dist(unit, { x, y });
    if (d === 0 || d > range) continue;
    if (d > 1 && !lineOfSight(map, unit, { x, y })) continue;
    out.push({ x, y });
  }
  return out;
}

// Area shapes for tricks and spells.
//   circle: every tile within r of the origin (Chebyshev, so radius 1 is a 3x3 square)
//   line:   r tiles starting next to the origin, heading toward opts.toward
//   cone:   a widening wedge of length r toward opts.toward
export function area(map, shape, origin, opts = {}) {
  const r = opts.r ?? 1, out = [];
  const add = (x, y) => { if (inside(map, x, y) && !out.some(t => t.x === x && t.y === y)) out.push({ x, y }); };
  if (shape === 'circle') {
    for (let y = origin.y - r; y <= origin.y + r; y++) for (let x = origin.x - r; x <= origin.x + r; x++) add(x, y);
    return out;
  }
  const t = opts.toward || { x: origin.x + 1, y: origin.y };
  const sx = Math.sign(t.x - origin.x), sy = Math.sign(t.y - origin.y);
  if (!sx && !sy) return out;
  if (shape === 'line') {
    for (let i = 1; i <= r; i++) add(origin.x + sx * i, origin.y + sy * i);
    return out;
  }
  if (shape === 'cone') {
    for (let i = 1; i <= r; i++) {
      const cx = origin.x + sx * i, cy = origin.y + sy * i, w = i - 1;
      if (sx && sy) { for (let j = 0; j <= w; j++) { add(cx - sx * j, cy); add(cx, cy - sy * j); } }
      else if (sx) { for (let j = -w; j <= w; j++) add(cx, cy + j); }
      else { for (let j = -w; j <= w; j++) add(cx + j, cy); }
    }
    return out;
  }
  throw new Error('unknown area shape ' + shape);
}

export default { TERRAIN, makeMap, key, inside, terrainAt, dist, reachable, pathTo, lineOfSight, inRange, area };
