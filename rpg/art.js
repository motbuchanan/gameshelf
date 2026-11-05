// All pixel art for the game: palettes, body builds, gear, and the first cast.
// Coordinates are on a 32x40 grid, feet at the bottom. Viewer-left hand holds
// the main weapon, viewer-right hand holds the shield.
import { rect, ellipse, poly, line } from './sprites.js';

export const OUTLINE = '#1a120c';

// Material ramps: [shadow, base, light]. Strings are flat colors (no shading).
export const PAL = {
  pants: ['#3b3248', '#5f5276', '#857aa0'],
  leather: ['#4a2e1c', '#6b4226', '#946038'],
  wood: ['#6e4220', '#a8703a', '#d29a58'],
  oldwood: ['#5a3a20', '#86603a', '#b08a5c'],
  tin: ['#6f7c8c', '#a7b3c2', '#e3e9f0'],
  iron: ['#3e4652', '#6f7b8c', '#a9b4c4'],
  steel: ['#7a8696', '#c3ccd8', '#ffffff'],
  rust: ['#6a3a1c', '#9a5a2c', '#c4864a'],
  gold: ['#9a6a12', '#e0a92a', '#ffe27a'],
  padded: ['#8a6a3a', '#c09a5c', '#e6c890'],
  rag: ['#4a3e30', '#6e5c46', '#94806a'],
  hood: ['#24402a', '#3a6040', '#58805c'],
  rope: ['#8a6a3a', '#c8a464', '#ecd29a'],
  net: ['#7a6a4a', '#b8a070', '#ddc898'],
  paper: ['#b8a47a', '#e6d6aa', '#fff4d6'],
  bookred: ['#5a1a1a', '#8e2c2c', '#c04a3a'],
  fur: ['#7a5a32', '#b08850', '#d8b878'],
  mane: ['#2e1c10', '#4e3220', '#6e4a30'],
  muzzle: ['#4a3420', '#6a4c30', '#8a6a48'],
  goblin: ['#3f6b22', '#6aa03a', '#9ccc5c'],
  kobold: ['#8a3a1a', '#c45a26', '#ec8a4a'],
  belly: ['#b08a50', '#e0be82', '#f8e2b4'],
  claw: ['#b8ac94', '#e8dcc4', '#fffaf0'],
  eye: '#1a120c',
  white: '#ffffff',
  mouth: '#6a2418',
  blush: '#ee8c78',
  tooth: '#fff4dc',
  glow: '#ffd23a',
  ember: '#ff7a2a',
  nose: '#1a120c',
  spot: '#4a3420',
  shine: '#ffffff',
};

export const SKINS = {
  peach: ['#c98e6a', '#f2c29a', '#ffe0c2'],
  tan: ['#a8693f', '#d99a66', '#f2bf8c'],
  brown: ['#6e4127', '#9b6640', '#c48a5c'],
  deep: ['#3f2618', '#664029', '#8a5a3c'],
};
export const HAIRS = {
  brown: ['#4a2a14', '#7a4626', '#a8683a'],
  black: ['#151018', '#2a2230', '#4a3e52'],
  blonde: ['#a0701c', '#dcaa40', '#f6dc84'],
  red: ['#7a2a14', '#b5481e', '#e07438'],
  white: ['#8f8a96', '#d2ced8', '#f4f2f6'],
  auburn: ['#4a1c14', '#7a3420', '#a8543a'],
};
export const CLOTH = {
  green: ['#24603a', '#3f9a55', '#74c47a'],
  blue: ['#24427a', '#3b6fb6', '#6fa0e0'],
  red: ['#7a2224', '#b5403a', '#e07060'],
  mustard: ['#8a6a1a', '#c49a2a', '#ecc85a'],
  purple: ['#4a2a6e', '#7a4fb0', '#a880d8'],
  teal: ['#1e5a5c', '#2a9aa0', '#5ccac8'],
  brown: ['#4a3020', '#7a5232', '#a07a50'],
};

// ---------- gear catalog ----------
// Each item: slot, name, kind and draw data. The engine never hard-codes an item.
export const GEAR = {
  // main hand
  stick:       { slot: 'mainHand', name: 'Sturdy stick', kind: 'stick', len: 15, mat: 'oldwood', dice: '1d4' },
  broomstick:  { slot: 'mainHand', name: 'Broom handle', kind: 'stick', len: 22, mat: 'wood', dice: '1d4' },
  woodsword:   { slot: 'mainHand', name: 'Practice sword', kind: 'blade', len: 11, bladeW: 2, mat: 'wood', tip: 'round', guard: 'wood', guardW: 5, grip: 'leather', dice: '1d6' },
  steelsword:  { slot: 'mainHand', name: 'Steel sword', kind: 'blade', len: 13, bladeW: 2, mat: 'steel', tip: 'point', guard: 'gold', guardW: 7, grip: 'leather', pommel: 'gold', dice: '1d8' },
  dagger:      { slot: 'mainHand', name: 'Kitchen dagger', kind: 'blade', len: 6, bladeW: 1, mat: 'steel', tip: 'point', guard: 'iron', guardW: 3, grip: 'wood', dice: '1d4' },
  slingshot:   { slot: 'mainHand', name: 'Slingshot', kind: 'sling', mat: 'wood', dice: '1d4' },
  rustknife:   { slot: 'mainHand', name: 'Rusty knife', kind: 'blade', len: 7, bladeW: 2, mat: 'rust', tip: 'point', guard: 'iron', guardW: 3, grip: 'rag', dice: '1d4' },
  club:        { slot: 'mainHand', name: 'Knobby club', kind: 'club', len: 12, mat: 'oldwood', dice: '1d6' },
  shortbow:    { slot: 'mainHand', name: 'Short bow', kind: 'bow', mat: 'wood', dice: '1d6' },
  spear:       { slot: 'mainHand', name: 'Spear', kind: 'spear', len: 22, mat: 'wood', dice: '1d6' },
  flail:       { slot: 'mainHand', name: 'Spiked flail', kind: 'flail', mat: 'iron', dice: '1d10' },
  // off hand
  potlid:      { slot: 'offHand', name: 'Pot lid', kind: 'round', r: 4, mat: 'tin', rim: 'iron', boss: 'iron' },
  buckler:     { slot: 'offHand', name: 'Wooden buckler', kind: 'round', r: 4.6, mat: 'wood', rim: 'iron', boss: 'gold' },
  book:        { slot: 'offHand', name: "Gran's book of tricks", kind: 'book', mat: 'bookred' },
  net:         { slot: 'offHand', name: 'Snare net', kind: 'netbundle', mat: 'net' },
  // head
  bucket:      { slot: 'head', name: 'Bucket helmet', kind: 'bucket', mat: 'tin' },
  ironcap:     { slot: 'head', name: 'Iron cap', kind: 'ironcap', mat: 'iron' },
  hood:        { slot: 'head', name: 'Hood', kind: 'hood', mat: 'hood' },
  // body
  tunic:       { slot: 'body', name: 'Tunic', kind: 'tunic' },
  padded:      { slot: 'body', name: 'Padded jacket', kind: 'padded', mat: 'padded' },
  // back
  satchel:     { slot: 'back', name: 'Satchel', kind: 'satchel' },
  quiver:      { slot: 'back', name: 'Quiver', kind: 'quiver' },
  cape:        { slot: 'back', name: 'Little cape', kind: 'cape' },
};

// ---------- weapon + shield drawing ----------
function drawMain(g, item, hx, hy, ang) {
  if (!item) return;
  const dx = Math.cos(ang), dy = Math.sin(ang), px = -dy, py = dx;
  const at = (t, s = 0) => [hx + dx * t + px * s, hy + dy * t + py * s];
  switch (item.kind) {
    case 'stick': {
      const [x0, y0] = at(-3), [x1, y1] = at(item.len);
      line(g, x0, y0, x1, y1, 2, item.mat);
      const [kx, ky] = at(item.len * 0.55, 1); g.set(kx, ky, item.mat); // knot
      break;
    }
    case 'club': {
      const [x0, y0] = at(-2), [x1, y1] = at(item.len - 3);
      line(g, x0, y0, x1, y1, 2, item.mat);
      const [cx, cy] = at(item.len - 1); ellipse(g, cx, cy, 2.4, 2.4, item.mat);
      break;
    }
    case 'blade': {
      const [p0x, p0y] = at(-3), [g0x, g0y] = at(1);
      line(g, p0x, p0y, g0x, g0y, 1, item.grip);
      if (item.pommel) { const [qx, qy] = at(-3); g.set(qx, qy, item.pommel); }
      const hw = (item.guardW - 1) / 2;
      const [ga, gb] = at(2, -hw), [gc, gd] = at(2, hw);
      line(g, ga, gb, gc, gd, 1, item.guard);
      for (let t = 3; t <= item.len + 2; t++) {
        for (let s = 0; s < item.bladeW; s++) {
          const [bx, by] = at(t, s - (item.bladeW - 1) / 2);
          if (item.tip === 'point' && t === item.len + 2 && s > 0) continue;
          g.set(bx, by, item.mat);
        }
      }
      if (item.tip === 'round') { const [tx, ty] = at(item.len + 2.6); g.set(tx, ty, item.mat); }
      break;
    }
    case 'spear': {
      const [x0, y0] = at(-6), [x1, y1] = at(item.len - 4);
      line(g, x0, y0, x1, y1, 1, item.mat);
      const [a, b] = at(item.len - 3), [c, d] = at(item.len);
      line(g, a, b, c, d, 2, 'iron');
      const [e, f] = at(item.len + 1); g.set(e, f, 'iron');
      break;
    }
    case 'sling': {
      line(g, ...at(-2), ...at(4), 2, item.mat);
      line(g, ...at(4), ...at(8, -3), 1, item.mat);
      line(g, ...at(4), ...at(8, 3), 1, item.mat);
      line(g, ...at(8, -3), ...at(9, 0), 1, 'leather');
      line(g, ...at(9, 0), ...at(8, 3), 1, 'leather');
      break;
    }
    case 'bow': {
      // Held upright: a curved stave and a straight string.
      for (let t = -10; t <= 10; t++) {
        const bend = 3.2 * Math.cos((t / 10) * Math.PI / 2);
        const [x, y] = at(0, 0); g.set(x - bend + 1, y + t, item.mat);
        if (Math.abs(t) < 9) g.set(x - bend + 2, y + t, item.mat);
      }
      for (let t = -9; t <= 9; t++) { const [x, y] = at(0, 0); g.set(x + 2, y + t, 'rope'); }
      break;
    }
    case 'flail': {
      line(g, ...at(-2), ...at(6), 2, 'leather');
      // chain links then the spiked ball
      for (let i = 0; i < 4; i++) { const [x, y] = at(7 + i * 1.6, i * 0.9); g.set(x, y, 'iron'); }
      const [bx, by] = at(13, 4);
      ellipse(g, bx, by, 3.2, 3.2, item.mat);
      for (const [sx, sy] of [[0, -4], [4, 0], [0, 4], [-4, 0], [3, -3], [3, 3], [-3, 3], [-3, -3]]) g.set(bx + sx, by + sy, 'steel');
      break;
    }
  }
}

function drawOff(g, item, cx, cy) {
  if (!item) return;
  switch (item.kind) {
    case 'round':
      ellipse(g, cx, cy, item.r, item.r, item.rim);
      ellipse(g, cx, cy, item.r - 1, item.r - 1, item.mat);
      ellipse(g, cx, cy, 1.3, 1.3, item.boss);
      break;
    case 'book':
      rect(g, cx - 3, cy - 3, 6, 6, item.mat);
      rect(g, cx - 3, cy + 2, 6, 1, 'paper');
      g.set(cx, cy - 1, 'gold'); g.set(cx - 1, cy - 1, 'gold');
      break;
    case 'netbundle':
      ellipse(g, cx, cy, 4, 3.5, item.mat);
      for (let i = -3; i <= 3; i += 2) for (let j = -3; j <= 3; j += 2) if ((i + j) % 4 === 0) g.set(cx + i, cy + j, 'rope');
      break;
  }
}

// ---------- shared kid-shaped body (used by the kid build and the goblin) ----------
function headgear(g, item, b, cx, top) {
  if (!item) return;
  if (item.kind === 'bucket') {
    // An upturned bucket, a little crooked, with its handle hanging down the side.
    poly(g, [[cx - 4, top - 3 + b], [cx + 5, top - 3 + b], [cx + 8.5, top + 6 + b], [cx - 8.5, top + 6 + b]], item.mat);
    rect(g, cx - 9, top + 5 + b, 19, 2, 'iron');
    for (let y = top - 1; y < top + 5; y += 3) g.set(cx - 1, y + b, 'iron');
    line(g, cx + 9, top + 6 + b, cx + 10, top + 10 + b, 1, 'iron');
    line(g, cx + 10, top + 10 + b, cx + 8, top + 12 + b, 1, 'iron');
  } else if (item.kind === 'ironcap') {
    ellipse(g, cx + 0.5, top + 6 + b, 8.5, 7, item.mat, (x, y) => y <= top + 7 + b);
    rect(g, cx - 8, top + 6 + b, 18, 2, 'iron');
    rect(g, cx, top + 8 + b, 2, 5, 'iron');
    for (const rx of [cx - 6, cx - 2, cx + 3, cx + 7]) g.set(rx, top + 6 + b, 'tin');
  } else if (item.kind === 'hood') {
    ellipse(g, cx + 0.5, top + 7 + b, 9, 8.5, item.mat, (x, y) => y <= top + 4 + b || x < cx - 6 || x > cx + 7);
    poly(g, [[cx - 3, top - 3 + b], [cx + 1, top - 1 + b], [cx - 1, top + 2 + b]], item.mat);
  }
}

function backLayer(g, item, b, body) {
  if (!item) return;
  if (item.kind === 'quiver') {
    poly(g, [[20, 17 + b], [24, 15 + b], [27, 27 + b], [23, 29 + b]], 'leather');
    for (const [x, y] of [[21, 13], [23, 12], [25, 13]]) { line(g, x, y + b, x + 0.5, y + 4 + b, 1, 'wood'); g.set(x, y - 1 + b, 'white'); g.set(x - 1, y + b, 'white'); }
  } else if (item.kind === 'cape') {
    poly(g, [[10, 22 + b], [22, 22 + b], [24, 34 + b], [8, 34 + b]], body.capeMat || 'hood');
  }
}

function satchel(g, b) {
  line(g, 12, 23 + b, 19, 30 + b, 1, 'leather');
  rect(g, 18, 29 + b, 5, 4, 'leather');
  rect(g, 18, 29 + b, 5, 1, 'leather');
  g.set(20, 30 + b, 'gold');
}

// Kid body. ctx.spec: people (human|elf|dwarf), hair, layers. Palette maps skin/hair/cloth.
function drawKid(ctx) {
  const { g, spec, bob: b, pose } = ctx;
  const L = spec.layers || {};
  const item = id => (id ? GEAR[id] : null);
  const people = spec.people || 'human';
  const dwarf = people === 'dwarf', elf = people === 'elf';
  const cx = 15.5;
  const headTop = dwarf ? 8 : 7;

  // back layer (cape, quiver) and long hair behind the head
  backLayer(g, item(L.back), b, spec);
  const hs = spec.hair || 'short';
  if (hs === 'long' || hs === 'ponytail') {
    if (hs === 'long') { rect(g, 7, 13 + b, 3, 11, 'hair'); rect(g, 22, 13 + b, 3, 11, 'hair'); }
    else { poly(g, [[22, 10 + b], [26, 12 + b], [27, 21 + b], [24, 22 + b], [22, 15 + b]], 'hair'); }
  }

  // legs + boots (they do not bob)
  const legTop = dwarf ? 32 : 31;
  rect(g, 12, legTop, 3, 36 - legTop, 'pants');
  rect(g, 17, legTop, 3, 36 - legTop, 'pants');
  rect(g, 11, 36, 4, 3, 'leather');
  rect(g, 17, 36, 4, 3, 'leather');

  // body
  const bodyItem = item(L.body) || GEAR.tunic;
  const cloth = bodyItem.kind === 'padded' ? 'padded' : 'cloth';
  const wide = dwarf ? 1 : 0;
  poly(g, [[11 - wide, 22 + b], [21 + wide, 22 + b], [22 + wide, 32 + b], [10 - wide, 32 + b]], cloth);
  if (bodyItem.kind === 'padded') {
    for (let y = 24; y <= 30; y += 3) for (let x = 11 - wide; x <= 20 + wide; x++) if (x % 2) g.set(x, y + b, 'leather');
    rect(g, 14, 22 + b, 4, 1, 'leather');
  } else {
    rect(g, 13, 22 + b, 6, 1, 'leather');
  }
  rect(g, 10 - wide, 29 + b, 13 + wide * 2, 1, 'leather');
  g.set(15, 29 + b, 'gold'); g.set(16, 29 + b, 'gold');
  if (L.back === 'satchel') satchel(g, b);

  // arms. The off arm (viewer right) always hangs; the weapon arm raises to attack.
  rect(g, 21 + wide, 23 + b, 3, 6, cloth);
  rect(g, 21 + wide, 29 + b, 3, 2, 'skin');
  const attack = pose === 'attack';
  let hx, hy, ang;
  if (attack) {
    line(g, 10, 24 + b, 7, 20 + b, 3, cloth);
    rect(g, 5, 17 + b, 3, 3, 'skin');
    hx = 6; hy = 18 + b; ang = -Math.PI * 0.22;
  } else {
    rect(g, 8 - wide, 23 + b, 3, 6, cloth);
    rect(g, 8 - wide, 29 + b, 3, 2, 'skin');
    hx = 9 - wide; hy = 30 + b; ang = -Math.PI * 0.66;
  }

  // head
  rect(g, 14, 20 + b, 4, 2, 'skin');
  const hrx = dwarf ? 7.6 : elf ? 6.6 : 7.1;
  ellipse(g, cx, headTop + 7.5 + b, hrx, 7.3, 'skin');
  if (elf) {
    poly(g, [[9, 14 + b], [4, 9 + b], [9, 17 + b]], 'skin');
    poly(g, [[22, 14 + b], [27, 9 + b], [22, 17 + b]], 'skin');
  } else {
    rect(g, 7, headTop + 7 + b, 2, 3, 'skin'); rect(g, 23, headTop + 7 + b, 2, 3, 'skin');
  }
  // face
  const ey = headTop + 8 + b;
  for (const ex of [11, 18]) { rect(g, ex, ey, 2, 3, 'eye'); g.set(ex, ey, 'white'); }
  g.set(10, ey + 3, 'blush'); g.set(21, ey + 3, 'blush');
  if (dwarf) { g.set(15, ey + 3, 'blush'); g.set(16, ey + 3, 'blush'); }
  g.set(14, ey + 4, 'mouth'); g.set(15, ey + 5, 'mouth'); g.set(16, ey + 5, 'mouth'); g.set(17, ey + 4, 'mouth');

  // hair
  if (hs !== 'none') {
    ellipse(g, cx, headTop + 7.5 + b, hrx + 0.6, 7.6, 'hair', (x, y) => y < headTop + 4 + b);
    const fringe = { short: [9, 10, 12, 13, 15, 16, 18, 19, 21, 22], spiky: [9, 11, 12, 14, 17, 19, 20, 22], long: [9, 10, 11, 12, 13, 18, 19, 20, 21, 22], ponytail: [9, 10, 11, 12, 15, 16, 19, 20, 21, 22], bun: [9, 10, 12, 13, 18, 19, 21, 22], curly: [9, 10, 11, 13, 14, 16, 17, 19, 20, 21, 22], braids: [9, 10, 11, 12, 19, 20, 21, 22] }[hs] || [];
    for (const x of fringe) g.set(x, headTop + 4 + b, 'hair');
    for (const x of [8, 9, 22, 23]) { g.set(x, headTop + 4 + b, 'hair'); g.set(x, headTop + 5 + b, 'hair'); }
    if (hs === 'spiky') for (const [x, h] of [[10, 2], [13, 3], [16, 3], [19, 3], [22, 2]]) line(g, x, headTop + 1 + b, x + 1, headTop - h + 1 + b, 1, 'hair');
    if (hs === 'bun') ellipse(g, cx, headTop - 1 + b, 3, 2.5, 'hair');
    if (hs === 'curly') for (const [x, y] of [[9, 3], [13, 1], [18, 1], [22, 3], [7, 7], [24, 7]]) ellipse(g, x, headTop + y + b, 2, 2, 'hair');
    if (hs === 'braids') for (const x of [8, 22]) { rect(g, x, headTop + 6 + b, 2, 10, 'hair'); g.set(x, headTop + 9 + b, 'leather'); g.set(x + 1, headTop + 13 + b, 'leather'); }
    if (hs === 'long') { rect(g, 8, headTop + 4 + b, 2, 8, 'hair'); rect(g, 22, headTop + 4 + b, 2, 8, 'hair'); }
  }
  headgear(g, item(L.head), b, cx, headTop);

  drawOff(g, item(L.offHand), 23 + wide, 28 + b);
  drawMain(g, item(L.mainHand), hx, hy, ang);
  // the weapon hand goes back on top so it grips the handle
  if (L.mainHand) { if (attack) rect(g, 5, 17 + b, 3, 3, 'skin'); else rect(g, 8 - wide, 29 + b, 3, 2, 'skin'); }
}

// ---------- goblin ----------
function drawGoblin(ctx) {
  const { g, spec, bob: b, pose } = ctx;
  const L = spec.layers || {};
  const item = id => (id ? GEAR[id] : null);
  backLayer(g, item(L.back), b, spec);
  // bandy legs and bare feet
  rect(g, 11, 31, 3, 5, 'skin'); rect(g, 18, 31, 3, 5, 'skin');
  rect(g, 9, 36, 5, 2, 'skin'); rect(g, 18, 36, 5, 2, 'skin');
  // ragged tunic with a jagged hem, hunched shoulders
  poly(g, [[10, 22 + b], [22, 22 + b], [23, 31 + b], [9, 31 + b]], 'rag');
  for (const x of [10, 13, 16, 19, 22]) g.set(x, 32 + b, 'rag');
  rect(g, 9, 28 + b, 15, 1, 'leather');
  // long arms
  rect(g, 22, 23 + b, 3, 7, 'skin');
  const attack = pose === 'attack';
  let hx, hy, ang;
  if (attack) { line(g, 10, 24 + b, 6, 19 + b, 3, 'skin'); hx = 5; hy = 18 + b; ang = -Math.PI * 0.18; }
  else { rect(g, 7, 23 + b, 3, 8, 'skin'); hx = 8; hy = 31 + b; ang = -Math.PI * 0.7; }
  // big head, long ears, big nose, toothy grin
  ellipse(g, 15.5, 15 + b, 8, 7, 'skin');
  poly(g, [[9, 12 + b], [1, 8 + b], [3, 11 + b], [9, 16 + b]], 'skin');
  poly(g, [[22, 12 + b], [30, 8 + b], [28, 11 + b], [22, 16 + b]], 'skin');
  for (const ex of [11, 18]) { rect(g, ex, 13 + b, 3, 2, 'glow'); g.set(ex + 1, 13 + b, 'eye'); g.set(ex + 1, 14 + b, 'eye'); }
  rect(g, 10, 12 + b, 4, 1, 'skin'); rect(g, 18, 12 + b, 4, 1, 'skin');
  ellipse(g, 15.5, 17 + b, 2, 1.6, 'skin');
  rect(g, 12, 19 + b, 8, 1, 'mouth');
  g.set(13, 19 + b, 'tooth'); g.set(18, 19 + b, 'tooth'); g.set(13, 20 + b, 'tooth');
  headgear(g, item(L.head), b, 15.5, 7);
  drawOff(g, item(L.offHand), 24, 28 + b);
  drawMain(g, item(L.mainHand), hx, hy, L.mainHand === 'shortbow' ? Math.PI / 2 : ang);
}

// ---------- kobold ----------
function drawKobold(ctx) {
  const { g, spec, bob: b, pose } = ctx;
  const L = spec.layers || {};
  const item = id => (id ? GEAR[id] : null);
  // tail curls out behind
  line(g, 19, 33, 24, 33, 3, 'skin'); line(g, 24, 33, 28, 30, 2, 'skin'); line(g, 28, 30, 29, 27, 1, 'skin');
  if (L.back === 'net') {/* bundle drawn as off-hand */}
  // short legs with claws
  rect(g, 12, 32, 3, 4, 'skin'); rect(g, 17, 32, 3, 4, 'skin');
  rect(g, 11, 36, 4, 2, 'skin'); rect(g, 17, 36, 4, 2, 'skin');
  for (const x of [11, 13, 17, 19]) g.set(x, 38, 'claw');
  // body: scales with a pale belly and a little vest
  ellipse(g, 15.5, 28 + b, 5.5, 5.5, 'skin');
  ellipse(g, 15.5, 29 + b, 3, 4, 'belly');
  for (let y = 26; y <= 32; y += 2) g.set(15, y + b, 'skin');
  rect(g, 10, 30 + b, 12, 1, 'leather');
  // arms
  rect(g, 20, 25 + b, 2, 5, 'skin');
  const attack = pose === 'attack';
  let hx, hy, ang;
  if (attack) { line(g, 11, 26 + b, 7, 22 + b, 2, 'skin'); hx = 6; hy = 21 + b; ang = -Math.PI * 0.2; }
  else { rect(g, 9, 25 + b, 2, 5, 'skin'); hx = 10; hy = 30 + b; ang = -Math.PI * 0.55; }
  // head: wide snout, horns, yellow slit eyes
  ellipse(g, 15.5, 17 + b, 6.5, 5.5, 'skin');
  ellipse(g, 15.5, 21 + b, 4.2, 2.6, 'belly');
  g.set(14, 20 + b, 'nose'); g.set(17, 20 + b, 'nose');
  rect(g, 13, 23 + b, 6, 1, 'mouth'); g.set(14, 23 + b, 'tooth'); g.set(17, 23 + b, 'tooth');
  line(g, 11, 13 + b, 9, 9 + b, 2, 'claw'); line(g, 20, 13 + b, 22, 9 + b, 2, 'claw');
  for (const ex of [11, 18]) { rect(g, ex, 16 + b, 3, 2, 'glow'); g.set(ex + 1, 16 + b, 'eye'); g.set(ex + 1, 17 + b, 'eye'); }
  line(g, 10, 15 + b, 13, 15 + b, 1, 'skin'); line(g, 18, 15 + b, 21, 15 + b, 1, 'skin');
  drawOff(g, item(L.offHand), 22, 28 + b);
  drawMain(g, item(L.mainHand), hx, hy, ang);
}

// ---------- gnoll (boss) ----------
function drawGnoll(ctx) {
  const { g, spec, bob: b, pose } = ctx;
  const L = spec.layers || {};
  const item = id => (id ? GEAR[id] : null);
  // mane runs down the back of the head and neck
  poly(g, [[12, 3 + b], [20, 3 + b], [22, 18 + b], [10, 18 + b]], 'mane');
  for (const [x, y] of [[11, 5], [21, 6], [10, 10], [22, 11], [10, 15], [22, 16]]) line(g, x, y + b, x + (x < 16 ? -2 : 2), y - 1 + b, 1, 'mane');
  // legs: furry, bent, with big feet
  rect(g, 10, 30, 5, 6, 'skin'); rect(g, 17, 30, 5, 6, 'skin');
  rect(g, 9, 36, 6, 3, 'skin'); rect(g, 17, 36, 6, 3, 'skin');
  for (const x of [9, 11, 13, 17, 19, 21]) g.set(x, 38, 'claw');
  // big chest with a leather harness and spots
  poly(g, [[8, 17 + b], [24, 17 + b], [23, 31 + b], [9, 31 + b]], 'skin');
  for (const [x, y] of [[11, 20], [20, 21], [13, 26], [19, 27], [16, 23], [10, 29]]) g.set(x, y + b, 'spot');
  line(g, 9, 18 + b, 22, 29 + b, 2, 'leather');
  rect(g, 8, 28 + b, 16, 2, 'leather');
  g.set(15, 28 + b, 'iron'); g.set(16, 28 + b, 'iron');
  poly(g, [[10, 30], [22, 30], [21, 34], [11, 34]], 'rag');
  // arms
  rect(g, 24, 18 + b, 4, 10, 'skin'); for (const y of [28, 29]) rect(g, 24, y + b, 4, 1, 'skin');
  g.set(24, 30 + b, 'claw'); g.set(27, 30 + b, 'claw');
  const attack = pose === 'attack';
  let hx, hy, ang;
  if (attack) { line(g, 8, 19 + b, 4, 11 + b, 4, 'skin'); hx = 4; hy = 10 + b; ang = -Math.PI * 0.05; }
  else { rect(g, 4, 18 + b, 4, 11, 'skin'); hx = 5; hy = 29 + b; ang = -Math.PI * 0.5; }
  // hyena head: tall rounded ears, long dark muzzle, glowing eyes
  poly(g, [[8, 7 + b], [7, 0 + b], [11, 1 + b], [12, 5 + b]], 'skin');
  poly(g, [[23, 7 + b], [24, 0 + b], [20, 1 + b], [19, 5 + b]], 'skin');
  g.set(9, 2 + b, 'mane'); g.set(9, 3 + b, 'mane'); g.set(22, 2 + b, 'mane'); g.set(22, 3 + b, 'mane');
  ellipse(g, 15.5, 7.5 + b, 6.2, 5, 'skin');
  rect(g, 14, 2 + b, 4, 4, 'mane');
  poly(g, [[11.5, 10 + b], [19.5, 10 + b], [18.5, 17 + b], [12.5, 17 + b]], 'muzzle');
  rect(g, 14, 14 + b, 4, 2, 'nose');
  rect(g, 12, 17 + b, 8, 1, 'mouth'); g.set(13, 17 + b, 'tooth'); g.set(18, 17 + b, 'tooth'); g.set(15, 18 + b, 'tooth');
  for (const ex of [11, 18]) { rect(g, ex, 7 + b, 3, 2, 'ember'); g.set(ex + 1, 7 + b, 'glow'); }
  for (const [x, y] of [[10, 5], [21, 6]]) g.set(x, y + b, 'spot');
  drawMain(g, item(L.mainHand), hx, hy, ang);
}

export const BUILDS = {
  kid: {
    palette: s => ({ skin: SKINS[s.skin] || SKINS.peach, hair: HAIRS[s.hairColor] || HAIRS.brown, cloth: CLOTH[s.cloth] || CLOTH.green }),
    draw: drawKid,
  },
  goblin: { palette: s => ({ skin: PAL.goblin, hood: CLOTH[s.cloth] || PAL.hood }), draw: drawGoblin },
  kobold: { palette: () => ({ skin: PAL.kobold }), draw: drawKobold },
  gnoll: { palette: () => ({ skin: PAL.fur }), draw: drawGnoll },
};

// ---------- the first cast ----------
// Names are proposals for Mot to keep or change.
export const CAST = [
  {
    id: 'hero', name: 'You', role: 'The hero (you design them)', group: 'kids',
    spec: { build: 'kid', people: 'human', skin: 'peach', hair: 'short', hairColor: 'brown', cloth: 'green', layers: { body: 'tunic', mainHand: 'woodsword', offHand: 'potlid', head: 'bucket', back: 'satchel' } },
    bio: 'Everyone in Millbrook knows you as the kid with the bucket helmet. You play heroes-and-monsters harder than anyone.',
  },
  {
    id: 'hollis', name: 'Hollis Stoutbarrel', role: 'The brave one (dwarf)', group: 'kids',
    spec: { build: 'kid', people: 'dwarf', skin: 'tan', hair: 'braids', hairColor: 'red', cloth: 'red', layers: { body: 'tunic', mainHand: 'broomstick', offHand: 'potlid' } },
    bio: 'The baker\'s youngest. Swings his broom handle like a war hammer and never, ever backs down. Secretly scared of geese.',
  },
  {
    id: 'nell', name: 'Nell Quickfoot', role: 'The sneaky one (human)', group: 'kids',
    spec: { build: 'kid', people: 'human', skin: 'brown', hair: 'ponytail', hairColor: 'black', cloth: 'purple', layers: { body: 'tunic', mainHand: 'dagger', back: 'cape' } },
    bio: 'Can climb anything and hide anywhere. Uses her big brother\'s old kitchen dagger as a sword. Keeps a pocket full of shiny buttons.',
  },
  {
    id: 'pim', name: 'Pim Ashgrove', role: 'The clever one (elf)', group: 'kids',
    spec: { build: 'kid', people: 'elf', skin: 'peach', hair: 'curly', hairColor: 'blonde', cloth: 'teal', layers: { body: 'tunic', mainHand: 'slingshot', offHand: 'book' } },
    bio: 'Reads everything, including the scary parts. Carries Gran\'s book of tricks and swears one of them really works.',
  },
  {
    id: 'tobin', name: 'Tobin Marsh', role: 'Taken by the goblins (human)', group: 'kids',
    spec: { build: 'kid', people: 'human', skin: 'deep', hair: 'spiky', hairColor: 'black', cloth: 'mustard', layers: { body: 'tunic', mainHand: 'stick' } },
    bio: 'The youngest kid in the game, and the loudest. Always "it" when nobody else wants to be.',
  },
  {
    id: 'juni', name: 'Juni Thatch', role: 'Taken by the goblins (dwarf)', group: 'kids',
    spec: { build: 'kid', people: 'dwarf', skin: 'peach', hair: 'bun', hairColor: 'auburn', cloth: 'blue', layers: { body: 'padded' } },
    bio: 'Fixes anything with string and stubbornness. Was building a fort when the goblins came.',
  },
  {
    id: 'goblin', name: 'Goblin Raider', role: 'Enemy', group: 'monsters',
    spec: { build: 'goblin', layers: { mainHand: 'rustknife' } },
    bio: 'Sneaky, greedy, and louder than they think they are. Goblins love shiny things and hate baths.',
  },
  {
    id: 'goblinarcher', name: 'Goblin Archer', role: 'Enemy', group: 'monsters',
    spec: { build: 'goblin', cloth: 'green', layers: { mainHand: 'shortbow', head: 'hood', back: 'quiver' } },
    bio: 'Hides in bushes and shoots from far away. Not a great shot, but it only takes one.',
  },
  {
    id: 'kobold', name: 'Kobold Spear', role: 'Enemy', group: 'monsters',
    spec: { build: 'kobold', layers: { mainHand: 'spear' } },
    bio: 'Small, scaly and quick. Kobolds fight in packs and yip to each other in a language that sounds like sneezing.',
  },
  {
    id: 'koboldtrapper', name: 'Kobold Trapper', role: 'Enemy', group: 'monsters',
    spec: { build: 'kobold', layers: { mainHand: 'club', offHand: 'net' } },
    bio: 'Sets snares along the trail. If you see a loop of rope on the ground, do not step in it.',
  },
  {
    id: 'gnoll', name: 'Grubjaw the Gnoll', role: 'Boss', group: 'monsters',
    spec: { build: 'gnoll', layers: { mainHand: 'flail' } },
    bio: 'A huge hyena-headed raider who bosses the goblins and kobolds around. He laughs when he is angry. He laughs a lot.',
  },
];

// Hero gear choices shown in the gallery. null = nothing in that slot.
export const HERO_OPTIONS = {
  head: [null, 'bucket', 'ironcap'],
  body: ['tunic', 'padded'],
  mainHand: [null, 'stick', 'woodsword', 'dagger', 'slingshot', 'steelsword'],
  offHand: [null, 'potlid', 'buckler', 'book'],
  back: [null, 'satchel', 'cape'],
  people: ['human', 'elf', 'dwarf'],
  skin: Object.keys(SKINS),
  hair: ['short', 'spiky', 'long', 'ponytail', 'bun', 'curly', 'braids', 'none'],
  hairColor: Object.keys(HAIRS),
  cloth: Object.keys(CLOTH),
};
