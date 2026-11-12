// The battle screen: draws the grid, runs turns, and talks the player through them.
// Rules live in combat.js. This file only shows them and takes taps.
import C from './combat.js';
import { groundURL } from './backdrops.js';
import G from './grid.js';
import R from './rules.js';
import S from './sprites.js';
import I from './icons.js';
import P from './party.js';
import dice from './dice.js';
import sfx from './sfx.js';
import { CAST, GEAR } from './art.js';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const wait = ms => new Promise(r => setTimeout(r, fast ? Math.min(ms, 20) : ms));

let H = { lock() {}, unlock() {}, isLocked: () => false, explain() {}, showCard() {} };
let b = null, def = null, T = null, done = null;
let fast = false;           // test hook: short waits and quick dice
let frame = 0, bobTimer = 0;
let view = { tile: 48, ox: 0, oy: 0 };
let overlay = { reach: [], targets: [], area: [], areaColor: 'orange' };
let anim = null;            // {id, x, y} while a unit walks
let floaters = [];          // rising "-1" flags
let juiceUntil = 0, juiceRaf = 0; // keeps redrawing while a flash or fade plays
let playerTurn = false, confirmTarget = null, heroFirstDone = false, heroOutSaid = false;

export function init(helpers) { H = { ...H, ...helpers }; }
export function setFast(v) { fast = !!v; dice.setTimeScale(fast ? 40 : 1); }
export function state() { return b; }

// ---------- pixel terrain ----------
const TILE_ART = {};
function hash(x, y) { let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = (h ^ (h >>> 13)) * 1274126177; return (h ^ (h >>> 16)) >>> 0; }
function px(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
function grassBase(c, v) {
  px(c, 0, 0, 16, 16, '#4f8a3c');
  for (let i = 0; i < 10; i++) { const h = hash(v * 31 + i, i * 7 + v); px(c, h % 16, (h >>> 8) % 16, 1, 1, i % 2 ? '#5f9a48' : '#437a33'); }
  if (v === 3) { px(c, 4, 10, 1, 1, '#f0e070'); px(c, 11, 4, 1, 1, '#f3e6cc'); }
}
function makeTile(id, v) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 16;
  const c = cv.getContext('2d'), K = '#1a120c';
  if (id === 'grass') grassBase(c, v);
  if (id === 'bush') {
    grassBase(c, v);
    px(c, 3, 5, 10, 9, K); px(c, 2, 7, 12, 6, K); px(c, 5, 3, 6, 2, K);
    px(c, 4, 6, 8, 7, '#2f6a2a'); px(c, 3, 8, 10, 4, '#2f6a2a'); px(c, 6, 4, 4, 2, '#2f6a2a');
    px(c, 5, 6, 2, 2, '#4f9a44'); px(c, 9, 8, 2, 1, '#4f9a44'); px(c, 6, 4, 2, 1, '#4f9a44');
    px(c, 4, 13, 8, 1, '#24501f');
  }
  if (id === 'mud') {
    px(c, 0, 0, 16, 16, '#6b4a2a');
    for (let i = 0; i < 6; i++) { const h = hash(v + i * 13, 5 + i); px(c, h % 13, (h >>> 8) % 13, 3, 2, '#5a3c20'); }
    px(c, 3 + v, 4, 2, 1, '#8a6440'); px(c, 10 - v, 11, 2, 1, '#8a6440');
  }
  if (id === 'log') {
    grassBase(c, v);
    px(c, 0, 5, 16, 8, K); px(c, 0, 6, 16, 6, '#7a5230'); px(c, 0, 6, 16, 1, '#9a6c40');
    px(c, 0, 11, 16, 1, '#5a3a20'); px(c, 4, 8, 5, 1, '#5a3a20'); px(c, 11, 9, 3, 1, '#5a3a20');
    px(c, 13, 6, 3, 6, '#c09060'); px(c, 14, 8, 1, 2, '#8a6440');
  }
  if (id === 'tree') {
    grassBase(c, v);
    px(c, 6, 10, 4, 6, K); px(c, 7, 10, 2, 6, '#6b4226');
    px(c, 1, 1, 14, 10, K); px(c, 2, 0, 12, 12, K);
    px(c, 2, 2, 12, 8, '#245a26'); px(c, 3, 1, 10, 10, '#245a26');
    px(c, 4, 2, 4, 3, '#3a7a34'); px(c, 9, 5, 3, 2, '#3a7a34'); px(c, 5, 7, 2, 1, '#1a4a1c');
  }
  // Book Three: indoors
  if (id === 'floor' || id === 'beltr' || id === 'beltl' || id === 'crate') {
    px(c, 0, 0, 16, 16, '#6a6058');
    px(c, 0, 7, 16, 1, '#4e463e'); px(c, 0, 15, 16, 1, '#4e463e');
    px(c, (v * 5) % 16, 0, 1, 7, '#4e463e'); px(c, (v * 5 + 8) % 16, 8, 1, 7, '#4e463e');
    px(c, 3 + v, 3, 2, 1, '#7a7068'); px(c, 10 - v, 11, 2, 1, '#7a7068');
  }
  if (id === 'beltr' || id === 'beltl') {
    px(c, 0, 2, 16, 12, K); px(c, 0, 3, 16, 10, '#3e4652');
    const dir = id === 'beltr' ? 1 : -1;
    for (let k = 0; k < 3; k++) {
      const x0 = ((k * 6 + (frame % 2) * 3 * dir) % 18 + 18) % 18 - 1;
      for (let j = 0; j < 3; j++) { const xx = dir > 0 ? x0 + j : x0 + 2 - j; px(c, xx, 5 + j, 1, 1, '#e0a92a'); px(c, xx, 10 - j, 1, 1, '#e0a92a'); }
    }
    px(c, 0, 3, 16, 1, '#6f7b8c');
  }
  if (id === 'crate') {
    px(c, 2, 3, 12, 11, K); px(c, 3, 4, 10, 9, '#a8703a');
    px(c, 3, 4, 10, 1, '#d29a58'); px(c, 3, 8, 10, 1, '#6e4220'); px(c, 7, 4, 1, 9, '#6e4220');
  }
  if (id === 'wall') {
    px(c, 0, 0, 16, 16, '#3a3430');
    px(c, 0, 0, 16, 1, '#5a524a'); px(c, 0, 8, 16, 1, '#2a2420');
    // a big brass gear set into the wall
    px(c, 4, 3, 8, 10, '#7a5a1a'); px(c, 3, 4, 10, 8, '#7a5a1a');
    px(c, 5, 4, 6, 8, '#c49a3a'); px(c, 4, 5, 8, 6, '#c49a3a');
    px(c, 7, 7, 2, 2, '#3a3430');
    px(c, 7, 2, 2, 1, '#c49a3a'); px(c, 7, 13, 2, 1, '#c49a3a'); px(c, 2, 7, 1, 2, '#c49a3a'); px(c, 13, 7, 1, 2, '#c49a3a');
  }
  // Book Four: snow, ice, caves, ledges and wind
  if (id === 'snow' || id === 'drift' || id === 'pine' || id === 'rock' || id === 'windr' || id === 'windl' || id === 'ledge') {
    px(c, 0, 0, 16, 16, '#dfe8f2');
    for (let i = 0; i < 7; i++) { const h = hash(v * 17 + i, i * 5 + v); px(c, h % 16, (h >>> 8) % 16, 1, 1, i % 2 ? '#c4d2e2' : '#ffffff'); }
  }
  if (id === 'drift') { px(c, 1, 6, 14, 7, '#ffffff'); px(c, 3, 4, 9, 3, '#ffffff'); px(c, 1, 12, 14, 2, '#b8c8dc'); px(c, 4, 5, 4, 1, '#eef4fa'); }
  if (id === 'ice') {
    px(c, 0, 0, 16, 16, '#9fd0ea');
    px(c, 2 + v, 3, 6, 1, '#e4f6ff'); px(c, 9 - v, 9, 5, 1, '#e4f6ff'); px(c, 4, 12, 3, 1, '#78b4d8'); px(c, 11, 4, 1, 3, '#78b4d8');
  }
  if (id === 'pine') {
    px(c, 7, 12, 2, 4, '#5a3a20');
    px(c, 7, 1, 2, 2, K); px(c, 5, 3, 6, 3, K); px(c, 3, 6, 10, 3, K); px(c, 2, 9, 12, 3, K);
    px(c, 7, 2, 2, 1, '#2a5a3a'); px(c, 6, 4, 4, 1, '#2a5a3a'); px(c, 4, 7, 8, 1, '#2a5a3a'); px(c, 3, 10, 10, 1, '#2a5a3a');
    px(c, 6, 3, 3, 1, '#ffffff'); px(c, 4, 6, 4, 1, '#ffffff'); px(c, 3, 9, 5, 1, '#ffffff');
  }
  if (id === 'rock') { px(c, 2, 4, 12, 10, K); px(c, 3, 5, 10, 8, '#7a7e88'); px(c, 4, 5, 6, 2, '#a4a8b2'); px(c, 3, 4, 8, 1, '#ffffff'); px(c, 9, 10, 3, 2, '#5a5e68'); }
  if (id === 'cave' || id === 'cavefloor' || id === 'sun') {
    px(c, 0, 0, 16, 16, '#4a4248');
    for (let i = 0; i < 5; i++) { const h = hash(v * 13 + i, i * 3); px(c, h % 15, (h >>> 8) % 15, 2, 1, '#5a525a'); }
  }
  if (id === 'cave') { px(c, 0, 0, 16, 16, '#2a2428'); px(c, 1, 1, 6, 5, '#3a3238'); px(c, 8, 7, 7, 6, '#3a3238'); px(c, 2, 1, 3, 1, '#524a50'); px(c, 9, 7, 3, 1, '#524a50'); }
  if (id === 'sun') { px(c, 0, 0, 16, 16, '#d8b85a'); px(c, 2, 2, 12, 12, '#f0d878'); px(c, 4, 4, 8, 8, '#fff0b0'); }
  if (id === 'ledge') { px(c, 0, 10, 16, 6, '#7a7e88'); px(c, 0, 10, 16, 1, K); px(c, 0, 14, 16, 2, '#5a5e68'); px(c, 3, 12, 3, 1, '#a4a8b2'); px(c, 10, 11, 2, 1, '#a4a8b2'); }
  if (id === 'gap') { px(c, 0, 0, 16, 16, '#1a1e2a'); px(c, 0, 0, 16, 2, '#dfe8f2'); px(c, 0, 14, 16, 2, '#7a7e88'); px(c, 3 + v, 7, 1, 1, '#3a4258'); }
  if (id === 'windr' || id === 'windl') {
    const dir = id === 'windr' ? 1 : -1;
    for (let k = 0; k < 3; k++) { const x0 = ((k * 6 + (frame % 2) * 3 * dir) % 18 + 18) % 18 - 2; px(c, x0, 3 + k * 4, 5, 1, '#9ab4d0'); px(c, dir > 0 ? x0 + 5 : x0 - 1, 2 + k * 4, 1, 1, '#9ab4d0'); }
  }
  if (id === 'stream') {
    px(c, 0, 0, 16, 16, '#3a7ac0');
    const o = v % 2 ? 4 : 0;
    for (let y = 2; y < 16; y += 5) { px(c, (o + y) % 12, y, 4, 1, '#6aa8e0'); px(c, (o + y + 8) % 14, y + 2, 3, 1, '#2e66a8'); }
  }
  return cv;
}
export function tileArt(id, x, y) {
  const v = id === 'stream' ? (hash(x, y) + frame) % 2 + (y % 2) * 2 : (id === 'beltr' || id === 'beltl' || id === 'windr' || id === 'windl') ? frame % 2 : hash(x, y) % 4;
  const k = id + v;
  return TILE_ART[k] || (TILE_ART[k] = makeTile(id, v));
}

// ---------- layout + drawing ----------
function layout() {
  const wrap = $('board-wrap'), cv = $('board');
  if (!wrap || !b) return;
  const cw = wrap.clientWidth, ch = wrap.clientHeight;
  const tile = Math.max(24, Math.floor(Math.min(cw / b.map.w, ch / b.map.h)));
  const dpr = window.devicePixelRatio || 1;
  cv.style.width = tile * b.map.w + 'px'; cv.style.height = tile * b.map.h + 'px';
  cv.width = Math.round(tile * b.map.w * dpr); cv.height = Math.round(tile * b.map.h * dpr);
  view = { tile, dpr };
  draw();
}

// ---------- juice: hit flash, knock-out fade, a little hit-stop ----------
const WHITE = new WeakMap();
function whiteOf(spr) {
  let w = WHITE.get(spr);
  if (!w) {
    w = document.createElement('canvas'); w.width = spr.width; w.height = spr.height;
    const x = w.getContext('2d'); x.drawImage(spr, 0, 0);
    x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, w.width, w.height);
    WHITE.set(spr, w);
  }
  return w;
}
// One animation loop for everything that moves for a moment: flashes, floaters, particles, squash and hops.
let lastTick = 0;
function juice(ms) {
  juiceUntil = Math.max(juiceUntil, performance.now() + ms);
  if (juiceRaf) return;
  lastTick = performance.now();
  const tick = now => {
    const dt = Math.min(0.05, Math.max(0, (now - lastTick) / 1000)); lastTick = now;
    floaters.forEach(f => { f.age = (now - f.t0) / 1000; });
    floaters = floaters.filter(f => f.age < 1.2);
    stepParts(dt); if (parts.length > partsPeak) partsPeak = parts.length;
    draw();
    if (now < juiceUntil || floaters.length || parts.length) juiceRaf = requestAnimationFrame(tick);
    else { juiceRaf = 0; draw(); }
  };
  juiceRaf = requestAnimationFrame(tick);
}

// ---------- v1.7 juice: squash, lean, wind-up, hops and little particles ----------
// "Reduce motion" turns off the moving parts; flashes, numbers and sounds stay.
const stillFx = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
let parts = [];
const MAX_PARTS = 90;   // a hard cap so a busy fight never stutters on the iPad
// u.fx = {kind, t0, ms, dx, dy}: a short body move drawn on top of where the unit stands.
function move(u, kind, ms, dir) {
  if (!u || stillFx()) return;
  u.fx = { kind, t0: performance.now(), ms, dx: dir ? dir.x : 0, dy: dir ? dir.y : 0 };
  juice(ms + 20);
}
function dirTo(a, z) { const dx = z.x - a.x, dy = z.y - a.y, d = Math.hypot(dx, dy) || 1; return { x: dx / d, y: dy / d }; }
// Where and how big to draw a unit this frame: {dx, dy, sx, sy} in tiles and scale.
function fxOf(u, now) {
  const f = u.fx; if (!f) return null;
  const k = (now - f.t0) / f.ms;
  if (k >= 1 || k < 0) { if (k >= 1) u.fx = null; return null; }
  const s = Math.sin(Math.PI * k);
  if (f.kind === 'squash') { const w = Math.cos(k * Math.PI * 3) * (1 - k); return { dx: f.dx * 0.06 * s, dy: 0, sx: 1 + 0.22 * w, sy: 1 - 0.2 * w }; }
  if (f.kind === 'lean') return { dx: f.dx * 0.28 * s + f.dy * 0.1 * s, dy: -0.06 * s, sx: 1, sy: 1 };
  if (f.kind === 'windup') { const back = k < 0.55 ? Math.sin(Math.PI * k / 0.55 / 2) : 1 - (k - 0.55) / 0.45; return { dx: -f.dx * 0.14 * back, dy: -f.dy * 0.1 * back, sx: 1 - 0.06 * back, sy: 1 + 0.06 * back }; }
  if (f.kind === 'lunge') return { dx: f.dx * 0.3 * s, dy: f.dy * 0.22 * s, sx: 1 + 0.05 * s, sy: 1 - 0.05 * s };
  if (f.kind === 'hop') { const sq = k < 0.15 ? (k / 0.15) : k > 0.85 ? (1 - k) / 0.15 : 0; return { dx: 0, dy: -0.42 * Math.sin(Math.PI * Math.min(1, Math.max(0, (k - 0.1) / 0.8))), sx: 1 + 0.12 * sq, sy: 1 - 0.12 * sq }; }
  if (f.kind === 'talk') return { dx: 0, dy: -0.12 * s, sx: 1, sy: 1 };
  return null;
}
// The colors a sprite is made of, so a hit bursts in the monster's own colors.
const COLORS = new WeakMap();
function colorsOf(spr) {
  let list = COLORS.get(spr);
  if (list) return list;
  list = [];
  try {
    const d = spr.getContext('2d').getImageData(0, 0, spr.width, spr.height).data, seen = {};
    for (let i = 0; i < d.length; i += 4 * 7) {
      if (d[i + 3] < 200) continue;
      const r = d[i], g = d[i + 1], bl = d[i + 2];
      if (r + g + bl < 220) continue;           // skip the outline and dark hair: bursts should be bright
      const key = (r >> 5) + ',' + (g >> 5) + ',' + (bl >> 5);
      seen[key] = (seen[key] || 0) + 1;
      if (seen[key] === 2) list.push(`rgb(${r},${g},${bl})`);
    }
  } catch (e) { /* no pixels to read */ }
  if (!list.length) list = ['#ffd060', '#ff8070'];
  COLORS.set(spr, list);
  return list;
}
// kind: 'bit' (a hit), 'star' (knocked out, level up), 'heart' (healing), 'zzz' (sleep), 'spark' (fire), 'glitter' (sparkles)
function burst(kind, x, y, n, colors) {
  if (stillFx() || !b) return;
  const room = MAX_PARTS - parts.length; n = Math.min(n, room); if (n <= 0) return;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 1.2 + Math.random() * 1.6;
    const col = colors ? colors[i % colors.length] : '#fff';
    const p = { kind, x: x + 0.5, y: y + 0.45, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.2, g: 6, life: 0.45 + Math.random() * 0.25, age: 0, col, size: 1.8 };
    if (kind === 'star') { p.vx = Math.cos(a) * 1.6; p.vy = Math.sin(a) * 1.2 - 0.6; p.g = 0; p.life = 0.7; p.size = 2; }
    if (kind === 'heart') { p.x = x + 0.2 + Math.random() * 0.6; p.y = y + 0.7; p.vx = (Math.random() - 0.5) * 0.4; p.vy = -0.9 - Math.random() * 0.5; p.g = 0; p.life = 0.9 + Math.random() * 0.3; p.delay = i * 0.08; p.size = 1.3; p.col = i % 2 ? '#ff8a9a' : '#ff5a6a'; }
    if (kind === 'zzz') { p.x = x + 0.55; p.y = y + 0.15; p.vx = 0.35 + Math.random() * 0.2; p.vy = -0.6; p.g = 0; p.life = 1.1; p.delay = i * 0.22; p.size = 1 + i * 0.25; }
    if (kind === 'spark') { p.x = x + Math.random(); p.y = y + 0.4 + Math.random() * 0.5; p.vx = (Math.random() - 0.5) * 1.2; p.vy = -1.5 - Math.random() * 1.5; p.g = 2.5; p.life = 0.5 + Math.random() * 0.3; p.size = 1.6; }
    if (kind === 'glitter') { p.x = x + Math.random(); p.y = y + Math.random() * 0.8; p.vx = 0; p.vy = -0.25; p.g = 0; p.life = 0.6 + Math.random() * 0.4; p.delay = Math.random() * 0.3; p.size = 1.6; }
    parts.push(p);
  }
  juice(60);
}
function stepParts(dt) {
  if (!parts.length) return;
  for (const p of parts) {
    if (p.delay > 0) { p.delay -= dt; continue; }
    p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt;
  }
  parts = parts.filter(p => p.age < p.life);
}
function drawParts(c, t) {
  const u = t / 16;                    // one art pixel on the board
  for (const p of parts) {
    if (p.delay > 0) continue;
    const k = p.age / p.life, x = p.x * t, y = p.y * t;
    c.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
    const s = Math.max(2, Math.round(u * p.size));
    if (p.kind === 'bit' || p.kind === 'spark') {
      c.fillStyle = p.kind === 'spark' ? (k < 0.4 ? '#fff0a0' : k < 0.7 ? '#ffb040' : '#e05a20') : p.col;
      c.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
    } else if (p.kind === 'star' || p.kind === 'glitter') {
      const twinkle = p.kind === 'glitter' ? (Math.floor(p.age * 12) % 2 ? 1 : 0.5) : 1;
      const r = Math.max(1, Math.round(s * twinkle));
      c.fillStyle = p.kind === 'glitter' ? p.col : '#ffe27a';
      c.fillRect(Math.round(x - r / 2), Math.round(y - r * 1.5), r, r * 3);
      c.fillRect(Math.round(x - r * 1.5), Math.round(y - r / 2), r * 3, r);
      c.fillStyle = '#ffffff'; c.fillRect(Math.round(x - r / 2), Math.round(y - r / 2), r, r);
    } else if (p.kind === 'heart') {
      const q = Math.max(1, Math.round(u * 0.8 * p.size));
      c.fillStyle = '#1a120c';
      c.fillRect(x - q * 2.5, y - q * 1.5, q * 5, q * 2); c.fillRect(x - q * 1.5, y + q * 0.5, q * 3, q); c.fillRect(x - q * 0.5, y + q * 1.5, q, q);
      c.fillStyle = p.col || '#7be08a';
      c.fillRect(x - q * 2, y - q, q * 1.5, q * 1.5); c.fillRect(x + q * 0.5, y - q, q * 1.5, q * 1.5);
      c.fillRect(x - q * 1.5, y, q * 3, q); c.fillRect(x - q * 0.5, y + q, q, q * 0.8);
    } else if (p.kind === 'zzz') {
      c.font = `800 ${Math.round(t * 0.26 * p.size)}px "Avenir Next", system-ui, sans-serif`;
      c.textAlign = 'center'; c.lineWidth = Math.max(2, t / 20); c.strokeStyle = '#1a2040'; c.fillStyle = '#d8e0ff';
      c.strokeText('Z', x, y); c.fillText('Z', x, y);
    }
  }
  c.globalAlpha = 1;
}
// Random blinks: every so often a kid closes their eyes for a moment.
function blinkTick() {
  if (!b) return;
  const now = performance.now();
  for (const u of b.units) if (!u.out && !u.gone && (u.spec.build || 'kid') === 'kid' && Math.random() < 0.06) { u.blinkAt = now; juice(160); }
}
// The whole team hops when a fight is won.
async function victoryHop() {
  if (stillFx()) return;
  const team = b.units.filter(u => u.side === 'hero' && !u.out && !u.gone && !u.bystander);
  team.forEach((u, i) => setTimeout(() => { move(u, 'hop', 420); burst('star', u.x, u.y - 0.3, 3); }, fast ? 0 : i * 90));
  await wait(fast ? 10 : 520 + team.length * 90);
  team.forEach((u, i) => setTimeout(() => move(u, 'hop', 380), fast ? 0 : i * 70));
  await wait(fast ? 10 : 480);
}
function flash(u) { if (!u) return; u.flashUntil = performance.now() + 110; juice(140); }
// A hit lands: white flash, a thump, a tiny freeze, and a shake only for the big ones.
async function impact(target, lost, big, from) {
  flash(target);
  move(target, 'squash', big ? 320 : 260, from ? dirTo(from, target) : null);
  burst('bit', target.x, target.y, big ? 12 : 7, colorsOf(S.sprite(target.spec, 0, 'idle')));
  sfx.hit(big);
  if (big) sfx.shake($('board'), false);
  await wait(big ? 110 : 60);
  floater(target.x, target.y, '-' + lost, '#ff6050', big);
}
// Anyone newly knocked out or run off fades and floats away instead of vanishing.
// Second Wind: show it the moment it happens.
function windCheck() {
  for (const u of b.units) if (u.windNow) {
    u.windNow = false;
    floater(u.x, u.y, 'Second wind! +3', '#7be08a', true);
    burst('heart', u.x, u.y, 3);
    sfx.heal();
    say(u.id, 'Not yet! Second wind!');
  }
}
function markOuts(before) {
  windCheck();
  let any = false;
  for (const u of b.units) if (u.out && !u.gone && !before.has(u.id) && !u.outAt) { u.outAt = performance.now(); any = true; if (!u.fled) burst('star', u.x, u.y - 0.2, 6); }
  if (any) { sfx.knockOut(); juice(560); }
}

function unitScreen(u) {
  if (anim && anim.id === u.id) return { x: anim.x, y: anim.y };
  return { x: u.x, y: u.y };
}

export function draw() {
  const cv = $('board'); if (!cv || !b) return;
  const c = cv.getContext('2d'), t = view.tile * view.dpr;
  c.imageSmoothingEnabled = false;
  c.clearRect(0, 0, cv.width, cv.height);
  for (let y = 0; y < b.map.h; y++) for (let x = 0; x < b.map.w; x++) {
    c.drawImage(tileArt(G.terrainAt(b.map, x, y).id, x, y), x * t, y * t, t, t);
  }
  // overlays
  const fill = (list, col, line) => list.forEach(p => {
    c.fillStyle = col; c.fillRect(p.x * t + 1, p.y * t + 1, t - 2, t - 2);
    if (line) { c.strokeStyle = line; c.lineWidth = Math.max(2, t / 22); c.strokeRect(p.x * t + 3, p.y * t + 3, t - 6, t - 6); }
  });
  fill(overlay.reach, 'rgba(90,160,255,0.22)', 'rgba(180,220,255,0.95)');
  fill(overlay.area, 'rgba(255,150,40,0.45)', 'rgba(255,200,90,0.95)');
  if (overlay.aim) fill(overlay.aim, 'rgba(255,150,40,0.12)', 'rgba(255,200,90,0.7)');
  // The boss is winding up: with the Laugh clue, the squares he'll sweep glow red.
  if (b.warn && b.danger.length) fill(b.danger, frame % 2 ? 'rgba(230,40,30,0.38)' : 'rgba(230,40,30,0.24)', 'rgba(255,120,100,0.95)');
  // the kid whose turn it is stands on a gold ring
  const cur = C.current(b);
  if (cur && !cur.out && !b.result) {
    const p = unitScreen(cur);
    c.fillStyle = 'rgba(240,196,76,0.85)';
    c.beginPath(); c.ellipse((p.x + 0.5) * t, (p.y + 0.86) * t, t * 0.42, t * 0.15, 0, 0, Math.PI * 2); c.fill();
  }
  // units, back rows first so front kids overlap
  const now = performance.now();
  const fading = b.units.filter(u => u.out && !u.gone && u.outAt && now - u.outAt < 520);
  for (const u of fading) {
    const k = (now - u.outAt) / 520, e = 1 - (1 - k) * (1 - k);
    const p = unitScreen(u), w = t * 0.92 * (1 - 0.35 * e), h = w * 1.25;
    c.globalAlpha = 1 - e;
    c.drawImage(S.sprite(u.spec, 0, 'idle'), (p.x + 0.5) * t - w / 2, (p.y + 0.95 - 0.4 * e) * t - h, w, h);
    c.globalAlpha = 1;
  }
  const live = b.units.filter(u => !u.out && !u.gone).sort((a, z) => unitScreen(a).y - unitScreen(z).y);
  for (const u of live) {
    const p = unitScreen(u);
    const f = fxOf(u, now) || { dx: 0, dy: 0, sx: 1, sy: 1 };
    const w = t * 0.92 * f.sx, h = t * 0.92 * 1.25 * f.sy;
    let pose = u.pose || 'idle';
    if (pose === 'idle' && u.blinkAt && now - u.blinkAt < 140) pose = 'blink';
    const spr = S.sprite(u.spec, (frame + (u.x + u.y)) % 2, pose);
    const x0 = (p.x + 0.5 + f.dx) * t - w / 2, y0 = (p.y + 0.95 + f.dy) * t - h;
    c.drawImage(spr, x0, y0, w, h);
    if (u.flashUntil && now < u.flashUntil) { c.globalAlpha = 0.85; c.drawImage(whiteOf(spr), x0, y0, w, h); c.globalAlpha = 1; }
    drawFlags(c, u, p, t);
  }
  // the cage (until someone opens it)
  if (b.cage && !b.cage.open) {
    const x0 = b.cage.x * t, y0 = b.cage.y * t - t * 0.15, w = t, h = t * 1.1;
    c.fillStyle = '#3a2a1a'; c.fillRect(x0 + 2, y0, w - 4, t * 0.08); c.fillRect(x0 + 2, y0 + h - t * 0.08, w - 4, t * 0.08);
    c.fillStyle = '#8a8a90';
    for (let i = 0; i < 6; i++) c.fillRect(x0 + 4 + i * (w - 10) / 5, y0, Math.max(2, t / 18), h);
  }
  // red target boxes go on top of the kids
  overlay.targets.forEach(p => {
    c.strokeStyle = frame % 2 ? '#ff5040' : '#ffd0c0'; c.lineWidth = Math.max(3, t / 14);
    c.strokeRect(p.x * t + 2, p.y * t - t * 0.2, t - 4, t * 1.16);
  });
  drawParts(c, t);
  // rising "-1" flags
  floaters.forEach(f => {
    c.globalAlpha = Math.max(0, 1 - f.age / 1.2);
    // pop in big, then settle (never appears at its final size)
    const punch = f.age < 0.14 ? 1.5 - 0.5 * (f.age / 0.14) : 1;
    c.font = `800 ${Math.round(t * (f.big ? 0.5 : 0.38) * punch)}px "Avenir Next", system-ui, sans-serif`;
    c.textAlign = 'center'; c.lineWidth = Math.max(3, t / 14); c.strokeStyle = '#000'; c.fillStyle = f.color;
    const y = (f.y - 0.1 - f.age * 0.6) * t;
    c.strokeText(f.text, (f.x + 0.5) * t, y); c.fillText(f.text, (f.x + 0.5) * t, y);
    c.globalAlpha = 1;
  });
}

function drawHearts(c, u, p, t) {
  // A heart bar: one red block per heart, grey once lost. Long bars get thinner blocks.
  if (u.bystander) return;
  const n = u.maxFlags, wMax = t * 0.9, seg = Math.max(2, Math.min(t / 9, wMax / n - 1)), h = Math.max(4, Math.round(t / 11));
  const total = n * (seg + 1) - 1, x0 = (p.x + 0.5) * t - total / 2, y0 = (p.y - 0.22) * t;
  c.fillStyle = '#1a120c'; c.fillRect(x0 - 2, y0 - 2, total + 4, h + 4);
  for (let i = 0; i < n; i++) {
    c.fillStyle = i < u.flags ? (u.side === 'hero' ? '#e84a4a' : '#e8903a') : 'rgba(90,80,70,0.9)';
    c.fillRect(x0 + i * (seg + 1), y0, seg, h);
  }
}
function drawFlags(c, u, p, t) {
  if (b.mode === 'hp') return drawHearts(c, u, p, t);
  const n = u.maxFlags, s = Math.max(5, Math.round(t / 9)), gap = s + 2;
  const x0 = (p.x + 0.5) * t - (n * gap) / 2, y0 = (p.y - 0.3) * t;
  const col = u.side === 'hero' ? '#4a8ee8' : '#e8503a';
  for (let i = 0; i < n; i++) {
    const x = x0 + i * gap;
    c.fillStyle = '#1a120c'; c.fillRect(x - 1, y0 - 1, 2, s * 1.6 + 1);
    c.fillRect(x, y0 - 1, s + 1, s + 1);
    c.fillStyle = i < u.flags ? col : 'rgba(40,30,20,0.6)';
    c.fillRect(x + 1, y0, s - 1, s - 1);
  }
}

// ---------- side panel ----------
function face(canvasId, spec) {
  const cv = $(canvasId); if (!cv) return;
  const c = cv.getContext('2d'); c.clearRect(0, 0, 32, 40);
  if (spec) S.draw(c, spec, 0, 0, 1, frame % 2);
  cv.classList.toggle('hidden', !spec);
}
let sayWho = null;
function say(who, text) {
  sayWho = who;
  const u = who && C.unitById(b, who);
  face('bsay-face', u ? u.spec : null);
  $('bsay-name').textContent = u ? (u.id === 'hero' ? u.name + ' (you)' : u.name) : '';
  $('bsay').textContent = fill(text);
}
function fill(text, extra = {}) {
  const hero = C.unitById(b, 'hero');
  return String(text).replace(/\{name\}/g, hero ? hero.name : 'Hero').replace(/\{dragon\}/g, (def && def.dragonName) || 'your dragon').replace(/\{(\w+)\}/g, (m, k) => extra[k] ?? m);
}

function strip() {
  const box = $('turnstrip'); box.innerHTML = '';
  const cur = C.current(b);
  b.order.forEach((id, i) => {
    const u = C.unitById(b, id);
    if (!u || u.gone) return;
    const d = document.createElement('button'); d.type = 'button';
    d.className = 'tface ' + u.side + (u === cur && !b.result ? ' on' : '') + (u.out ? ' out' : '');
    d.setAttribute('aria-label', u.name);
    const cv = document.createElement('canvas'); cv.width = 32; cv.height = 40;
    S.draw(cv.getContext('2d'), u.spec, 0, 0, 1, 0);
    d.appendChild(cv);
    d.addEventListener('click', () => { if (!H.isLocked()) unitCard(u); });
    box.appendChild(d);
  });
  $('round-num').innerHTML = `${I.icon('star', 16)} Round ${b.round}`;
}

function actPanel(html) { $('bact').innerHTML = html; }

// A button that works even while the board is locked (the only thing to press).
function waitTap(label, id = 'b-next') {
  return new Promise(res => {
    actPanel(`<button id="${id}" class="btn big-btn" type="button">${esc(label)}</button>`);
    $(id).addEventListener('click', () => { actPanel(''); res(); }, { once: true });
  });
}

function playerPanel() {
  const u = C.current(b);
  const walk = !b.ts.moved, tag = !b.ts.acted;
  actPanel(`
    <div class="todo">
      <span class="todo-i${walk ? '' : ' done'}">${I.icon('boot', 22)}<span>Walk</span></span>
      <span class="todo-i${tag ? '' : ' done'}">${I.icon('target', 22)}<span>${b.mode === 'hp' ? 'Attack' : 'Tag'}</span></span>
      <button class="q act" id="b-help" type="button" aria-label="How turns work">?</button>
    </div>
    ${tag ? (u.tricks || []).filter(t => t.left > 0).map(t => `<button id="b-trick-${t.id}" class="btn act trick-btn" type="button">${I.icon(t.heal ? 'heart' : t.sleep ? 'bubble' : t.dazzle ? 'star' : 'burst', 22)} ${esc(t.name)} <span class="trick-left">${Array.from({ length: t.left }, () => I.icon('star', 14)).join('')}</span></button>`).join('') : ''}
    ${tag && b.calm ? `<button id="b-talk" class="btn act trick-btn" type="button">${I.icon('bubble', 22)} Talk <span class="trick-left">${Array.from({ length: b.calm.max }, (_, i) => I.icon('bubble', 14, i >= b.calm.value)).join('')}</span></button>` : ''}
    ${tag && !bagCount(u) && u.char && u.char.items && u.char.items.potion > 0 && u.flags < u.maxFlags ? `<button id="b-potion" class="btn act trick-btn" type="button">${I.icon('heart', 22)} Drink a potion (${u.char.items.potion})</button>` : ''}
    ${tag && C.canOpenCage(b, u) ? `<button id="b-cage" class="btn act trick-btn" type="button">${I.icon('hammer', 22)} Open the cage!</button>` : ''}
    ${tag && b.fix && C.canFix(b, u) ? `<button id="b-fix" class="btn act trick-btn" type="button">${I.icon(b.fix.icon || 'hammer', 22)} ${esc(b.fix.label || 'Fix a gear')} <span class="trick-left">${Array.from({ length: b.fix.max }, (_, i) => I.icon('star', 14, i >= b.fix.value)).join('')}</span></button>` : ''}
    ${tag && b.fix && !C.canFix(b, u) && b.fix.value < b.fix.max ? `<div class="fix-hint">${I.icon('hammer', 16)} ${esc(b.fix.hint || 'Walk next to the beast to fix its gears')} (${b.fix.value} of ${b.fix.max} ${esc(b.fix.done || 'fixed')})</div>` : ''}
    ${tag && bagCount(u) ? `<button id="b-bag" class="btn act trick-btn" type="button">${I.icon('book', 22)} Use your bag</button>` : ''}
    <button id="b-done" class="btn big-btn act" type="button">Done</button>`);
  $('b-help').addEventListener('click', () => { if (!H.isLocked()) H.explain('turns'); });
  (u.tricks || []).forEach(t => { const el = $('b-trick-' + t.id); if (el) el.addEventListener('click', () => { if (!H.isLocked() && playerTurn) { C.useTrick(u, t.id); aimTrick(); } }); });
  if ($('b-talk')) $('b-talk').addEventListener('click', () => { if (!H.isLocked() && playerTurn) playerTalk(); });
  if ($('b-potion')) $('b-potion').addEventListener('click', () => { if (!H.isLocked() && playerTurn) playerPotion(); });
  if ($('b-cage')) $('b-cage').addEventListener('click', () => { if (!H.isLocked() && playerTurn) playerCage(); });
  if ($('b-fix')) $('b-fix').addEventListener('click', () => { if (!H.isLocked() && playerTurn) playerFix(); });
  if ($('b-bag')) $('b-bag').addEventListener('click', () => { if (!H.isLocked() && playerTurn) bagPanel(); });
  $('b-done').addEventListener('click', () => { if (!H.isLocked() && playerTurn) endPlayerTurn(); });
}

function confirmPanel(target) {
  const u = C.current(b), ch = C.chance(b, u, target), stat = P.SKILLS[ch.skill].stat;
  confirmTarget = target;
  overlay.targets = [{ x: target.x, y: target.y }]; draw();
  actPanel(`
    <div class="confirm">
      <div class="confirm-h">${b.mode === 'hp' ? 'Attack' : 'Tag'} <b>${esc(target.name)}</b> with your ${esc(C.weaponName(u).toLowerCase())}?</div>
      <div class="confirm-row" style="--sc:${I.STAT_COLOR[stat]}">${I.icon(I.STAT_ICON[stat], 22)}<span>${P.SKILLS[ch.skill].name}</span>${I.meter(ch.value, I.STAT_COLOR[stat], 'small')}</div>
      ${ch.cover ? `<div class="confirm-note">${I.icon('shield', 16)} ${esc(target.name)} is hiding in a bush, so it's harder.</div>` : ''}
      ${ch.armor ? `<div class="confirm-note">${I.icon('shield', 16)} ${esc(target.name)} wears armor, so it's a little harder.</div>` : ''}
      <div class="row two">
        <button id="b-cancel" class="btn act" type="button">Not yet</button>
        <button id="b-roll" class="btn big-btn act" type="button">Roll!</button>
      </div>
    </div>`);
  $('b-cancel').addEventListener('click', () => { if (!H.isLocked()) { confirmTarget = null; showPlayerOptions(); } });
  $('b-roll').addEventListener('click', () => { if (!H.isLocked() && confirmTarget) playerAttack(confirmTarget); });
}

// Aiming a trick (Spark): orange outlines show where it can go; tap one to see what it hits.
let aiming = false, aimCenter = null;
function aimTrick() {
  const u = C.current(b);
  aiming = true; aimCenter = null;
  overlay.reach = []; overlay.targets = [];
  overlay.aim = u.trick.heal
    ? b.units.filter(e => e.side === u.side && !e.out && !e.bystander && G.dist(u, e) <= u.trick.range).map(e => ({ x: e.x, y: e.y }))
    : u.trick.sleep ? C.enemiesOf(b, u).filter(e => !e.out && !b.scared[e.id] && G.dist(u, e) <= u.trick.range).map(e => ({ x: e.x, y: e.y }))
    : C.areaCenters(b, u).filter(t => !(t.x === u.x && t.y === u.y));
  draw();
  say('hero', u.trick.heal ? `Tap a friend (or yourself) to ${u.trick.name}.` : u.trick.sleep ? (overlay.aim.length ? `Tap a monster to sing it to sleep.` : `No monster is close enough to hear the song. Walk closer first.`) : `Tap a square to aim your ${u.trick.name}.`);
  actPanel(`<button id="b-cancel" class="btn act" type="button">Not yet</button>`);
  $('b-cancel').addEventListener('click', () => { if (!H.isLocked()) cancelAim(); });
}
function cancelAim() { aiming = false; aimCenter = null; overlay.aim = null; overlay.area = []; showPlayerOptions(); }
function aimAt(x, y) {
  const u = C.current(b);
  aimCenter = { x, y };
  overlay.area = C.areaTiles(b, u, aimCenter); draw();
  const ch = C.chance(b, u, null, { skill: u.trick.skill, ignoreCover: true }), stat = P.SKILLS[ch.skill].stat;
  actPanel(`
    <div class="confirm">
      <div class="confirm-h">Cast <b>${esc(u.trick.name)}</b> here?</div>
      <div class="confirm-row" style="--sc:${I.STAT_COLOR[stat]}">${I.icon(I.STAT_ICON[stat], 22)}<span>${P.SKILLS[ch.skill].name}</span>${I.meter(ch.value, I.STAT_COLOR[stat], 'small')}</div>
      <div class="row two">
        <button id="b-cancel" class="btn act" type="button">Not yet</button>
        <button id="b-roll" class="btn big-btn act" type="button">Roll!</button>
      </div>
    </div>`);
  $('b-cancel').addEventListener('click', () => { if (!H.isLocked()) cancelAim(); });
  $('b-roll').addEventListener('click', async () => {
    if (H.isLocked() || !aimCenter) return;
    const c0 = aimCenter; aiming = false; aimCenter = null; overlay.aim = null;
    H.lock(); actPanel('');
    await doArea(u, c0);
    H.unlock();
    if (b.result) { playerTurn = false; finishTurn(); return; }
    showPlayerOptions();
  });
}
// Talking instead of fighting: roll Talk; good rolls fill the calm bubbles.
async function playerTalk() {
  const u = C.current(b);
  H.lock(); actPanel('');
  const roll = await rollPop(u, C.talkChance(b, u), 'You talk to ' + (T.TALK_TARGET || 'them'), true, { luck: true });
  const res = C.talk(b, u, roll);
  if (res.gain) sfx.calm();
  strip(); draw();
  const lines = T.CALM_LINES || [];
  say(T.TALK_WHO || null, res.gain ? (lines[Math.min(b.calm.value, lines.length) - 1] || 'Hmm...') : (T.TALK_FAIL || 'Hmph. I am not listening.'));
  await waitTap('OK');
  H.unlock();
  if (b.result) { playerTurn = false; finishTurn(); return; }
  showPlayerOptions();
}
async function playerPotion() {
  const u = C.current(b);
  H.lock(); actPanel('');
  const amt = C.drinkPotion(b, u);
  sfx.heal();
  floater(u.x, u.y, '+' + amt, '#7be08a'); burst('heart', u.x, u.y, 4); strip(); draw();
  say('hero', `Glug glug. ${amt} hearts back!`);
  await wait(fast ? 10 : 900);
  H.unlock();
  showPlayerOptions();
}
async function playerCage() {
  H.lock(); actPanel('');
  const kid = C.openCage(b);
  floater(b.cage.x, b.cage.y, 'Free!', '#9be08a');
  strip(); draw();
  say(kid ? kid.id : null, T.CAGE_OPEN || 'Free! Finally! Now let me at him!');
  await waitTap('OK');
  H.unlock();
  showPlayerOptions();
}

// ---------- things from the bag (Book Three) ----------
const THROW_NAME = { oil: 'Throw the oil can', water: 'Throw water', net: 'Throw the net' };
const THROW_ICON = { oil: 'hammer', water: 'bubble', net: 'shield' };
const THROW_WORD = { oil: 'oil can', water: 'bucket of water', net: 'net' };
let throwing = null;
// Things to throw (Book Three). When there are any, the bag gets one button so the panel stays short.
const bagCount = u => (u.char && u.char.items ? C.THROWABLE.reduce((a, k) => a + (u.char.items[k] > 0 ? 1 : 0), 0) : 0);
function bagPanel() {
  const u = C.current(b), it = u.char.items;
  actPanel(`<div class="confirm-h">What do you want from your bag?</div>
    ${it.potion > 0 && u.flags < u.maxFlags ? `<button id="b-potion" class="btn act trick-btn" type="button">${I.icon('heart', 22)} Drink a potion (${it.potion})</button>` : ''}
    ${C.THROWABLE.filter(k => it[k] > 0).map(k => `<button id="b-throw-${k}" class="btn act trick-btn" type="button">${I.icon(THROW_ICON[k], 22)} ${THROW_NAME[k]} (${it[k]})</button>`).join('')}
    <button id="b-cancel" class="btn act" type="button">Not yet</button>`);
  if ($('b-potion')) $('b-potion').addEventListener('click', () => { if (!H.isLocked() && playerTurn) playerPotion(); });
  C.THROWABLE.forEach(k => { const el = $('b-throw-' + k); if (el) el.addEventListener('click', () => { if (!H.isLocked() && playerTurn) aimThrow(k); }); });
  $('b-cancel').addEventListener('click', () => { if (!H.isLocked()) showPlayerOptions(); });
}
function aimThrow(item) {
  const u = C.current(b);
  const list = C.throwTargets(b, u).filter(e => !b.scared[e.id]);
  if (!list.length) { say('hero', `Nothing is close enough (or it's already stuck). You can throw the ${THROW_WORD[item]} ${C.THROW_RANGE} squares.`); return; }
  throwing = item; aiming = false;
  overlay.reach = []; overlay.targets = [];
  overlay.aim = list.map(e => ({ x: e.x, y: e.y }));
  draw();
  say('hero', `Tap a monster to throw the ${THROW_WORD[item]} at it.`);
  actPanel(`<button id="b-cancel" class="btn act" type="button">Not yet</button>`);
  $('b-cancel').addEventListener('click', () => { if (!H.isLocked()) { throwing = null; overlay.aim = null; showPlayerOptions(); } });
}
async function doThrow(target) {
  const u = C.current(b), item = throwing;
  throwing = null; overlay.aim = null;
  H.lock(); actPanel('');
  const fx = C.throwItem(b, u, target, item);
  sfx.tap();
  if (fx && fx.turns) { flash(target); sfx.calm(); }
  floater(target.x, target.y, fx ? fx.tag : 'Miss', '#ffd060', true);
  strip(); draw();
  if (fx) say(target.id, fx.say);
  await wait(fast ? 10 : 1000);
  if (fx && fx.turns && !b.taught.stuck) { b.taught.stuck = true; say('pim', T.STUCK_TEACH || `${target.name} is stuck! It will lose its next turn.`); await waitTap('Got it!'); }
  H.unlock();
  showPlayerOptions();
}
// Fixing the beast: roll Nimble fingers. Each good roll fixes one glowing gear.
async function playerFix() {
  const u = C.current(b);
  H.lock(); actPanel('');
  const roll = await rollPop(u, C.fixChance(b, u), b.fix.roll || 'You fix a glowing gear', true, { luck: true });
  const res = C.fix(b, u, roll);
  const beast = C.unitById(b, b.fix.target);
  if (res.gain) { sfx.calm(); if (beast) { beast.spec = { ...beast.spec, fixed: b.fix.value }; flash(beast); floater(beast.x, beast.y, b.fix.yay || 'Fixed!', '#9be08a', true); } }
  else if (beast) floater(beast.x, beast.y, 'Sproing!', '#f3e6cc');
  strip(); draw();
  const lines = T.FIX_LINES || [];
  say(b.fix.target, res.gain ? (lines[Math.min(b.fix.value, lines.length) - 1] || 'Hey!') : (T.FIX_FAIL || 'Ha! Too tricky!'));
  await waitTap('OK');
  H.unlock();
  if (b.result) { playerTurn = false; finishTurn(); return; }
  showPlayerOptions();
}
// Moving floors: slide whoever ends a turn on one.
async function slideBelt(u) {
  const moved = C.slide(b, u);
  if (moved) {
    const wind = G.terrainAt(b.map, moved.from.x, moved.from.y).wind;
    if (moved.ice && !b.taught.ice && T.ICE_TEACH) { b.taught.ice = true; say('pim', T.ICE_TEACH); }
    else if (wind && !b.taught.wind && T.WIND_TEACH) { b.taught.wind = true; say('juni', T.WIND_TEACH); }
    else if (!moved.ice && !wind && !b.taught.belt && T.BELT_TEACH) { b.taught.belt = true; say('juni', T.BELT_TEACH); }
    await animateWalk(u, moved.from.x, moved.from.y, [moved.to]);
    floater(u.x, u.y, moved.ice ? 'Wheee!' : wind ? 'Whoosh!' : 'Whee!', moved.ice ? '#bfe6ff' : '#e0a92a');
    draw();
    await wait(fast ? 10 : 350);
  }
  // Trolls heal a little after every turn, unless the sun (or fire) got them.
  const healed = C.regen(b, u);
  if (healed) {
    floater(u.x, u.y, '+' + healed, '#7be08a'); burst('heart', u.x, u.y, 2);
    if (!b.taught.regen && T.REGEN_TEACH) { b.taught.regen = true; say('mossback', T.REGEN_TEACH); await wait(fast ? 10 : 1400); }
    draw(); await wait(fast ? 10 : 300);
  }
}

// ---------- cards ----------
function unitCard(u) {
  const c = CAST.find(k => k.id === (u.cast || u.id));
  const ch = C.skillValue(u, u.use.skill), stat = P.SKILLS[u.use.skill].stat;
  const ex = document.createElement('div'); ex.className = 'unitcard';
  const hp = b.mode === 'hp';
  const flags = Array.from({ length: u.maxFlags }, (_, i) => I.icon(hp ? 'heart' : (u.side === 'hero' ? 'flagb' : 'flagr'), hp ? 16 : 22, i >= u.flags)).join('');
  ex.innerHTML = `<div class="uc-row"><b>${hp ? 'Hearts' : 'Flags'}</b><span class="uc-hearts">${flags}</span></div>
    ${hp ? `<div class="uc-row"><b>Armor</b><span>${u.armor ? I.icon('shield', 18) + ' Harder to hit (' + u.armor + ' squares)' : 'No armor'}</span></div>` : ''}
    <div class="uc-row" style="--sc:${I.STAT_COLOR[stat]}"><b>${hp ? 'Hits with' : 'Tags with'}</b><span>${esc(C.weaponName(u))}${hp ? ' ' + I.icon('die', 16) + ' ' + esc(C.weaponDice(u)) : ''}</span></div>
    <div class="uc-row">${I.icon(I.STAT_ICON[stat], 20)}<span>${P.SKILLS[u.use.skill].name}</span>${I.meter(ch, I.STAT_COLOR[stat], 'small')}</div>
    <div class="uc-row">${I.icon(u.use.range > 1 ? 'target' : 'boot', 18)}<span>${u.use.range > 1 ? 'Reaches ' + u.use.range + ' squares' : 'Reaches the squares right next to them'}</span></div>`;
  H.showCard({
    title: u.id === 'hero' ? u.name + ' (you)' : (u.char ? (c ? c.name : u.name) : u.name + ' the ' + (c ? c.name.toLowerCase() : 'monster')),
    body: u.id === 'hero' ? 'That\'s you! You only control yourself in this fight. Your friends take their own turns.' : (hp ? (u.side === 'monster' ? '' : 'On your team. ') : (u.side === 'monster' ? 'Playing a monster today. ' : 'On your team today. ')) + (c ? c.bio : ''),
    prereq: hp ? (u.out ? (u.fled ? 'Ran away.' : 'Knocked down, sitting this one out.') : (u.side === 'hero' ? 'Your team' : 'Monster')) : (u.out ? 'Out of flags. Cheering from the log.' : (u.side === 'hero' ? 'Hero team (blue flags)' : 'Monster team (red flags)')),
    extra: ex, spec: u.spec,
  });
}
function tileCard(x, y) { H.explain('terrain_' + G.terrainAt(b.map, x, y).id); }

// ---------- turns ----------
async function animateWalk(u, startX, startY, path) {
  let sx = startX, sy = startY;
  for (const step of path) {
    const t0 = performance.now(), dur = fast ? 5 : 150;
    await new Promise(res => {
      const tick = now => {
        const k = Math.min(1, (now - t0) / dur);
        anim = { id: u.id, x: sx + (step.x - sx) * k, y: sy + (step.y - sy) * k };
        draw();
        if (k < 1) requestAnimationFrame(tick); else res();
      };
      requestAnimationFrame(tick);
    });
    sx = step.x; sy = step.y;
  }
  anim = null; draw();
}

function floater(x, y, text, color, big) {
  floaters.push({ x, y, text, color, big, age: 0, t0: performance.now() });
  juice(1250);
}

// The dice pop-up: shows the chance squares, rolls the real dice, marks the square that came up.
async function rollPop(actor, chanceValue, title, isPlayer, opts = {}) {
  let roll = R.rollD100();
  const pop = $('bdice-pop');
  $('battle-screen').scrollTop = 0;
  pop.classList.remove('hidden');
  dice.mount($('bdice'));
  const z = R.zones(chanceValue);
  let cells = '';
  for (let n = 1; n <= 100; n++) cells += `<i data-n="${n}" style="background:${I.TIER_COLOR[I.tierAt(n, z)]}"></i>`;
  $('bresult').innerHTML = `<div class="br-title">${esc(title)}</div>
    <div class="br-body"><div class="chance-grid small" id="br-grid">${cells}</div>
    <div class="br-side"><div class="br-tier" id="br-tier">Rolling...</div><div class="br-need">Colored squares work: <b>${chanceValue}</b> of 100</div></div></div>
    <div id="br-btn"></div>`;
  await new Promise(r => requestAnimationFrame(r));
  await dice.roll(roll);
  const tier = R.tierFor(chanceValue, roll.value);
  const cell = $('br-grid').querySelector(`[data-n="${roll.value}"]`);
  if (cell) cell.classList.add('hit');
  const tierEl = $('br-tier');
  tierEl.textContent = (roll.value) + '! ' + I.TIER_WORD[tier];
  tierEl.style.color = tier === 'fail' ? '#c9b48e' : I.TIER_COLOR[tier];
  tierEl.className = 'br-tier pop-in t-' + tier;
  sfx.tier(tier);
  if (isPlayer) {
    const hero = actor && actor.char;
    const canLuck = opts.luck && hero && hero.luck > 0 && (tier === 'fail' || tier === 'disaster');
    const flipped = R.flip(roll), flipTier = R.tierFor(chanceValue, flipped.value);
    const canFlip = opts.luck && hero && (hero.talents || []).includes('flip') && !b.flipUsed && C.FLAGS_FOR[flipTier] && !C.FLAGS_FOR[tier];
    if (canFlip) {
      const useFlip = await new Promise(res => {
        $('br-btn').innerHTML = `<div class="br-need">Flip the dice talent: swap the two dice to make ${flipped.value}!</div><div class="row two"><button id="b-noflip" class="btn" type="button">No thanks</button><button id="b-flip" class="btn big-btn" type="button">Flip the dice!</button></div>`;
        $('b-noflip').addEventListener('click', () => res(false), { once: true });
        $('b-flip').addEventListener('click', () => res(true), { once: true });
      });
      if (useFlip) {
        b.flipUsed = true;
        roll = flipped;
        $('br-tier').innerHTML = `Flipped! ${roll.value}! ${esc(I.TIER_WORD[flipTier])}`;
        $('br-tier').style.color = I.TIER_COLOR[flipTier];
        $('br-tier').className = 'br-tier'; void $('br-tier').offsetWidth; $('br-tier').className = 'br-tier pop-in t-' + flipTier;
        sfx.tier(flipTier);
        await new Promise(res => { $('br-btn').innerHTML = '<button id="b-ok" class="btn big-btn" type="button">OK</button>'; $('b-ok').addEventListener('click', res, { once: true }); });
        pop.classList.add('hidden');
        return roll;
      }
    }
    if (canLuck && !b.taught.luck) { b.taught.luck = true; say('hollis', T.LUCK_TEACH); }
    const again = await new Promise(res => {
      const clovers = hero ? Array.from({ length: P.luckMax(hero) }, (_, i) => I.icon('clover', 18, i >= hero.luck)).join('') : '';
      $('br-btn').innerHTML = canLuck
        ? `<div class="row two"><button id="b-ok" class="btn" type="button">Keep it</button><button id="b-luck" class="btn big-btn" type="button">${I.icon('clover', 22)} Roll again</button></div><div class="br-clovers">${clovers}</div>`
        : '<button id="b-ok" class="btn big-btn" type="button">OK</button>';
      $('b-ok').addEventListener('click', () => res(false), { once: true });
      if (canLuck) $('b-luck').addEventListener('click', () => res(true), { once: true });
    });
    if (again) {
      hero.luck--;
      pop.classList.add('hidden');
      return rollPop(actor, chanceValue, title + ' (Luck!)', isPlayer, opts);
    }
  } else {
    await Promise.race([wait(1500), new Promise(res => pop.addEventListener('click', res, { once: true }))]);
  }
  pop.classList.add('hidden');
  return roll;
}

// The damage dice: roll the weapon's dice in the tray and show how many hearts come off.
async function damagePop(u, target, tier, note, isPlayer, titleWord) {
  const dmg = C.rollDamage(note, tier);
  const pop = $('bdice-pop');
  $('battle-screen').scrollTop = 0;
  pop.classList.remove('hidden');
  dice.mount($('bdice'));
  const extra = tier === 'legendary' ? 'Legendary: the first die counts as its highest number, plus one more die!' : tier === 'exceptional' ? 'Exceptional: you get one extra die!' : '';
  $('bresult').innerHTML = `<div class="br-title">${titleWord ? esc(titleWord) + '!' : 'Damage on ' + esc(target.id === 'hero' ? 'you' : target.name)}</div>
    <div class="br-body"><div class="br-side"><div class="br-tier">${I.icon('die', 22)} ${esc(note)}${extra ? '' : ''}</div>${extra ? `<div class="br-need">${esc(extra)}</div>` : ''}<div class="br-hearts" id="br-hearts"></div></div></div><div id="br-btn"></div>`;
  if (!b.taught.damage && (u.side === 'hero')) { b.taught.damage = true; say('hollis', T.DAMAGE_TEACH); }
  await new Promise(r => requestAnimationFrame(r));
  await dice.rollSet(dmg.dice.map(d => ({ sides: d.sides, value: d.value })));
  $('br-hearts').classList.add('pop-in');
  $('br-hearts').innerHTML = `<span>${Array.from({ length: Math.min(dmg.total, 16) }, () => I.icon('heart', 22)).join('')}</span><b>${titleWord ? '+' : ''}${dmg.total} ${dmg.total === 1 ? 'heart' : 'hearts'}${titleWord ? ' back' : ''}!</b>`;
  if (isPlayer) await new Promise(res => { $('br-btn').innerHTML = '<button id="b-ok" class="btn big-btn" type="button">OK</button>'; $('b-ok').addEventListener('click', res, { once: true }); });
  else await Promise.race([wait(1300), new Promise(res => pop.addEventListener('click', res, { once: true }))]);
  pop.classList.add('hidden');
  return dmg;
}

function announceOuts(before) {
  for (const u of b.units) if (u.out && !u.gone && !before.has(u.id)) {
    if (u.id === 'hero') continue;
    if (b.mode === 'hp') return fill(u.fled ? T.FLED_LINE : (u.side === 'monster' ? T.FLED_LINE : T.KNOCKED_LINE), { who: u.name });
    return fill(T.OUT_LINE, { who: u.name });
  }
  return null;
}

async function doAttack(u, target) {
  const ch = C.chance(b, u, target);
  const before = new Set(b.units.filter(k => k.out).map(k => k.id));
  const aim = dirTo(u, target);
  u.pose = 'attack'; move(u, 'windup', 300, aim); draw();
  await wait(fast ? 0 : 200);
  const hp = b.mode === 'hp', verb = hp ? (u.id === 'hero' ? 'You attack' : u.name + ' attacks') : (u.id === 'hero' ? 'You tag' : u.name + ' tags');
  if (hp && ch.armor && !b.taught.armor && u.side === 'hero') { b.taught.armor = true; say('pim', T.ARMOR_TEACH); await waitTap('Got it!'); }
  const roll = await rollPop(u, ch.value, `${verb} ${target.id === 'hero' ? 'you' : target.name}`, u.id === 'hero', { luck: hp });
  u.pose = 'idle';
  const tier = R.tierFor(ch.value, roll.value);
  const dmg = hp && C.FLAGS_FOR[tier] ? await damagePop(u, target, tier, C.weaponDice(u), u.id === 'hero') : null;
  const res = C.resolveAttack(b, u, target, roll, dmg);
  move(u, 'lunge', 220, aim);
  if (res.lost && hp) await impact(target, res.lost, res.tier === 'legendary' || res.tier === 'exceptional' || target.out, u);
  else if (res.lost) { flash(target); move(target, 'squash', 260, aim); burst('bit', target.x, target.y, 6, colorsOf(S.sprite(target.spec, 0, 'idle'))); sfx.hit(false); floater(target.x, target.y, '-' + res.lost, u.side === 'hero' ? '#ff8070' : '#80b8ff'); }
  else { sfx.miss(); if (res.tier !== 'disaster') move(target, 'lean', 320, aim); floater(target.x, target.y, res.tier === 'disaster' ? 'Oops!' : 'Miss', '#f3e6cc'); }
  markOuts(before);
  say(u.id, fill(T.RESULT[res.tier], { target: target.id === 'hero' ? 'You' : target.name, actor: u.id === 'hero' ? 'You' : u.name }));
  strip(); draw();
  await wait(fast ? 10 : 1100);
  const outLine = announceOuts(before);
  if (outLine) { say(null, outLine); await waitTap('OK'); }
  return res;
}

async function doArea(u, center) {
  overlay.area = C.areaTiles(b, u, center); draw();
  const before = new Set(b.units.filter(k => k.out).map(k => k.id));
  u.pose = 'attack'; move(u, 'windup', 300, dirTo(u, center));
  const chv = C.chance(b, u, null, { skill: u.trick.skill, ignoreCover: true }).value;
  const mine = u.ai === 'player';
  const roll = await rollPop(u, chv, `${mine ? 'You cast' : u.name + ':'} ${u.trick.name}`, mine, { luck: b.mode === 'hp' });
  u.pose = 'idle';
  const tier = R.tierFor(chv, roll.value);
  const dmg = b.mode === 'hp' && C.FLAGS_FOR[tier] && !u.trick.sleep && !u.trick.dazzle ? await damagePop(u, { name: u.trick.heal ? 'friend' : u.trick.r ? 'everyone in the orange squares' : 'that square', id: 'area' }, tier, u.trick.dice || '1d4', mine, u.trick.heal ? 'Healing' : null) : null;
  const scaredBefore = { ...b.scared };
  const res = C.resolveArea(b, u, center, roll, dmg);
  if (res.heal) {
    res.results.forEach(r => { const t = C.unitById(b, r.id); if (r.healed) { floater(t.x, t.y, '+' + r.healed, '#7be08a'); burst('heart', t.x, t.y, 4); } });
    if (res.results.some(r => r.healed)) sfx.heal(); else sfx.tier('fail');
    overlay.area = []; strip(); draw();
    say(u.id, res.results.some(r => r.healed) ? (T.HEAL_LINE || 'All better!') : (T.HEAL_MISS || 'Oops, the spell fizzled.'));
    await wait(fast ? 10 : 1000);
    return;
  }
  if (res.sleep) {
    const slept = res.results.filter(r => r.slept);
    slept.forEach(r => { const t = C.unitById(b, r.id); flash(t); burst('zzz', t.x, t.y, 3); floater(t.x, t.y, 'Zzz...', '#b9c8ff', true); });
    if (slept.length) sfx.calm(); else sfx.miss();
    overlay.area = []; strip(); draw();
    say(u.id, slept.length ? (T.SNOOZE_LINE || 'Sleepy head, cozy bed... it worked! It nodded off.') : (T.SNOOZE_MISS || 'Oops. It yawned, but it\'s still awake.'));
    await wait(fast ? 10 : 1100);
    if (slept.length && !b.taught.stuck) { b.taught.stuck = true; say('pim', 'It\'s asleep! A sleeping monster loses its next turn.'); await waitTap('Got it!'); }
    return;
  }
  if (res.dazzle) {
    const hitd = res.results.filter(r => r.dazzled);
    hitd.forEach(r => { const t = C.unitById(b, r.id); flash(t); floater(t.x, t.y, 'Sparkles!', '#ffe27a', true); });
    if (hitd.length) C.areaTiles(b, u, center).forEach(p => burst('glitter', p.x, p.y, 3, ['#ffe27a', '#ffffff', '#ffb0e0', '#a0e0ff']));
    if (hitd.length) sfx.calm(); else sfx.miss();
    overlay.area = []; strip(); draw();
    say(u.id, hitd.length ? (T.DAZZLE_LINE || 'Sparkle sparkle! They can\'t see a thing!') : (T.DAZZLE_MISS || 'Pfft. The sparkles fizzled.'));
    await wait(fast ? 10 : 1000);
    if (hitd.length && !b.taught.dazzle) { b.taught.dazzle = true; say('pim', 'Dazzled! A dazzled monster has a much harder time hitting anyone on its next turn.'); await waitTap('Got it!'); }
    return;
  }
  for (const id in b.scared) if (b.scared[id] && !scaredBefore[id]) { const g = C.unitById(b, id); floater(g.x, g.y, 'Eek! Fire!', '#ffd060'); }
  const hits = res.results.filter(r => r.lost);
  // fire tricks (Spark, the dragon's flame) throw sparks where they hit; pinecones and wrenches burst in the target's colors
  hits.forEach(r => { const t = C.unitById(b, r.id); flash(t); move(t, 'squash', 280); if (u.trick.fire) burst('spark', t.x, t.y, 6); else burst('bit', t.x, t.y, 6, colorsOf(S.sprite(t.spec, 0, 'idle'))); });
  if (hits.length) { sfx.hit(hits.length > 1); if (hits.length > 1) sfx.shake($('board'), false); await wait(80); } else sfx.miss();
  res.results.forEach(r => { const t = C.unitById(b, r.id); floater(t.x, t.y, r.lost ? '-' + r.lost : 'Miss', '#ff8070'); });
  markOuts(before);
  say(u.id, T.AREA_RESULT[res.tier]);
  overlay.area = []; strip(); draw();
  await wait(fast ? 10 : 1100);
  const outLine = announceOuts(before);
  if (outLine) { say(null, outLine); await waitTap('OK'); }
}

async function computerTurn(u) {
  H.lock();
  const plan = C.nextPlan(b, u, def);
  if (plan.teach && !(T.TEACH || {})[plan.teach]) { b.taught[plan.teach] = true; plan.teach = null; }
  const act = plan.action && plan.action.type;
  if (act === 'area' && plan.action.trick) C.useTrick(u, plan.action.trick);
  if (act === 'scared') {
    // Home Team tricks (a trap, a sleepy monster) use the same "skip a turn" as fire.
    const why = (b.skipWhy || {})[u.id];
    say(u.id, why ? why.say : (T.SCARED || 'Fire! FIRE! Keep it away from me!'));
    floater(u.x, u.y, why ? why.tag : 'Scared!', '#ffd060');
    await wait(fast ? 10 : 1200);
    C.afterTurn(b, u, plan);
    await slideBelt(u);
    H.unlock();
    return;
  }
  if (plan.teach) {
    b.taught[plan.teach] = true;
    if (plan.moveTo) overlay.reach = C.moveTiles(b, u).tiles;
    if (plan.action && plan.action.type === 'area') overlay.area = C.areaTiles(b, u, plan.action.center);
    draw();
    say(u.id, T.TEACH[plan.teach]);
    await waitTap('Got it!');
    overlay.reach = []; overlay.area = []; draw();
  } else if (act === 'windup') {
    say(u.id, b.warn ? (T.WINDUP_WARN || 'HA HA HA HA!') : (T.WINDUP || 'Heh. Heh heh.'));
    actPanel(`<div class="waiting">${esc(u.name)}'s turn</div>`);
    await wait(700);
  } else if (act === 'sweep') {
    say(u.id, T.SWEEP || 'FLAIL SWEEP!');
    actPanel(`<div class="waiting">${esc(u.name)}'s turn</div>`);
    await wait(500);
  } else {
    const lines = T.CHATTER[u.id] || ['...'];
    say(u.id, lines[(b.round + b.turn) % lines.length]);
    actPanel(`<div class="waiting">${esc(u.name)}'s turn</div>`);
    await wait(700);
  }
  if (plan.moveTo) {
    const sx = u.x, sy = u.y;
    const path = C.doMove(b, u, plan.moveTo.x, plan.moveTo.y);
    await animateWalk(u, sx, sy, path);
  }
  if (act === 'windup') {
    C.bossWindup(b, u); draw();
    if (b.warn) { say('nell', T.WARN_LINE || 'He\'s laughing! Get out of the red squares!'); await waitTap('Got it!'); }
  }
  if (act === 'sweep') await doSweep(u);
  if (act === 'cage') {
    const kid = C.openCage(b);
    floater(b.cage.x, b.cage.y, 'Free!', '#9be08a'); strip(); draw();
    say(kid ? kid.id : null, T.CAGE_OPEN || 'Free! Finally!');
    await wait(fast ? 10 : 1400);
  }
  if (plan.action && plan.action.type === 'attack') await doAttack(u, C.unitById(b, plan.action.target));
  if (plan.action && plan.action.type === 'area') { if (plan.action.trick) C.useTrick(u, plan.action.trick); await doArea(u, plan.action.center); }
  if (act === 'summon') {
    const made = C.summon(b, u);
    made.forEach(c => floater(c.x, c.y, 'Caw!', '#c8c0e0'));
    strip(); draw();
    say(u.id, T.SUMMON || 'Come, my crows!');
    await wait(fast ? 10 : 1100);
  }
  if (plan.action && plan.action.type === 'flee') {
    floater(u.x, u.y, 'Runs!', '#f3e6cc');
    await animateWalk(u, u.x, u.y, [{ x: u.x === 0 ? -1 : u.x === b.map.w - 1 ? b.map.w : u.x, y: u.y === 0 ? -1 : u.y === b.map.h - 1 ? b.map.h : u.y }]);
    C.flee(b, u); strip(); draw();
    say(null, fill(T.FLED_LINE, { who: u.name }));
    await wait(fast ? 10 : 1000);
  }
  C.afterTurn(b, u, plan);
  if (!b.result) await slideBelt(u);
  H.unlock();
}

// The boss's big flail sweep: one roll, and every kid in the danger squares gets hit.
async function doSweep(u) {
  const before = new Set(b.units.filter(x => x.out).map(x => x.id));
  const area = b.danger.slice();
  overlay.area = area; draw();
  const chv = C.chance(b, u, null, { skill: 'swing', ignoreCover: true, ignoreArmor: true }).value;
  u.pose = 'attack'; move(u, 'windup', 320, { x: 0, y: 1 }); draw();
  const roll = await rollPop(u, chv, `${u.name}: flail sweep!`, false);
  u.pose = 'idle';
  const tier = R.tierFor(chv, roll.value);
  const hitAny = C.enemiesOf(b, u).some(e => area.some(t => t.x === e.x && t.y === e.y));
  const dmg = C.FLAGS_FOR[tier] && hitAny ? await damagePop(u, { name: 'everyone in the red squares', id: 'area' }, tier, u.sweepDice || '1d6', false) : null;
  const res = C.resolveSweep(b, u, roll, dmg || { total: 0 });
  overlay.area = [];
  const swept = res.results.filter(r => r.lost);
  if (swept.length) { sfx.boom(); sfx.shake($('board'), true); swept.forEach(r => { const t = C.unitById(b, r.id); flash(t); move(t, 'squash', 320, dirTo(u, t)); burst('bit', t.x, t.y, 8, colorsOf(S.sprite(t.spec, 0, 'idle'))); }); await wait(110); } else sfx.miss();
  res.results.forEach(r => { const t = C.unitById(b, r.id); if (r.lost) floater(t.x, t.y, '-' + r.lost, '#ff6050', true); });
  markOuts(before);
  strip(); draw();
  say(u.id, !hitAny ? (T.SWEEP_MISS || 'Hey! Where did everybody go?') : C.FLAGS_FOR[tier] ? (T.SWEEP_HIT || 'HA HA! Take that!') : (T.SWEEP_MISS || 'Whoops! Missed!'));
  const out = announceOuts(before);
  await wait(fast ? 10 : 1100);
  if (out) { say(null, out); await wait(fast ? 10 : 1000); }
}

function showPlayerOptions() {
  const u = C.current(b);
  confirmTarget = null;
  overlay.reach = b.ts.moved ? [] : C.moveTiles(b, u).tiles;
  overlay.targets = b.ts.acted ? [] : C.targets(b, u).map(t => ({ x: t.x, y: t.y }));
  draw();
  playerPanel();
  if (b.ts.moved && b.ts.acted) { endPlayerTurn(); return; }
  if (b.ts.moved && !overlay.targets.length) say('hero', T.HERO_NO_TARGET);
}

async function playerTurnStart(u) {
  playerTurn = true;
  if (!heroFirstDone) { heroFirstDone = true; say('hollis', T.HERO_FIRST); }
  else if (u.use.range > 1 && !b.taught.heroRange) { b.taught.heroRange = true; say('pim', T.HERO_RANGED_HINT); }
  else say('hero', T.HERO_TURN[b.round % T.HERO_TURN.length]);
  showPlayerOptions();
}

async function playerMove(x, y) {
  const u = C.current(b);
  H.lock();
  overlay.reach = []; overlay.targets = []; draw();
  const sx = u.x, sy = u.y;
  const path = C.doMove(b, u, x, y);
  await animateWalk(u, sx, sy, path);
  H.unlock();
  showPlayerOptions();
}

async function playerAttack(target) {
  const u = C.current(b);
  H.lock();
  overlay.reach = []; overlay.targets = []; confirmTarget = null;
  actPanel('');
  await doAttack(u, target);
  H.unlock();
  if (b.result) { playerTurn = false; finishTurn(); return; }
  showPlayerOptions();
}

async function endPlayerTurn() {
  playerTurn = false; confirmTarget = null;
  overlay.reach = []; overlay.targets = [];
  const u = C.current(b);
  if (u && !b.result) { H.lock(); await slideBelt(u); H.unlock(); }
  finishTurn();
}

async function finishTurn() {
  const r0 = b.round;
  const next = C.endTurn(b);
  strip(); draw();
  if (!next) return endFight();
  if (b.round !== r0) await runEvents(b.round);
  if (b.result) return endFight();
  await runTurn(C.current(b).out ? C.endTurn(b) || next : next);
}

// Story moments that happen at the start of a round (from the chapter data).
async function runEvents(round) {
  for (const ev of (def.events || []).filter(e => e.round === round)) {
    if (ev.type !== 'snatch') { await simpleEvent(ev); continue; }
    H.lock();
    for (const d of ev.spawn) C.addUnit(b, d, null);
    draw();
    for (const ln of ev.lines) { say(ln.who, ln.text); await waitTap(ln === ev.lines[ev.lines.length - 1] ? 'OK' : 'Next'); }
    // the kobolds drag the kids off the edge of the map
    const moves = Object.entries(ev.grab).map(([kob, kid]) => [C.unitById(b, kob), C.unitById(b, kid)]);
    await Promise.all(moves.map(([k, kid]) => animateWalk(kid, kid.x, kid.y, [{ x: k.x, y: k.y }])));
    moves.forEach(([k, kid]) => { kid.x = k.x; kid.y = k.y; });
    await Promise.all(moves.flatMap(([k, kid]) => [animateWalk(k, k.x, k.y, [{ x: -1, y: k.y }]), animateWalk(kid, kid.x, kid.y, [{ x: -1, y: kid.y }])]));
    moves.forEach(([k, kid]) => { C.removeUnit(b, k.id); C.removeUnit(b, kid.id); });
    strip(); draw();
    H.unlock();
  }
}

// say: just lines. remove: units leave (buttons distract goblins, Sniffle calls off the kobolds). scare: Grubjaw fears the torch.
async function simpleEvent(ev) {
  H.lock();
  for (const ln of ev.lines || []) { say(ln.who, ln.text); await waitTap('Next'); }
  if (ev.type === 'remove') {
    const leaving = ev.ids.map(id => C.unitById(b, id)).filter(u => u && !u.out);
    await Promise.all(leaving.map(u => animateWalk(u, u.x, u.y, [{ x: u.x >= b.map.w / 2 ? b.map.w : -1, y: u.y }])));
    leaving.forEach(u => C.removeUnit(b, u.id));
  }
  if (ev.type === 'scare') { C.scare(b, ev.id, ev.turns || 1); const g = C.unitById(b, ev.id); if (g) floater(g.x, g.y, 'Scared!', '#ffd060'); }
  strip(); draw();
  H.unlock();
}

// Who goes first: the player rolls a d20 in the tray; everyone else's roll shows in the list.
async function initiative() {
  H.lock();
  const sayer = id => (C.unitById(b, id) ? id : 'hero');
  say(def.surprise ? sayer('nell') : sayer('hollis'), def.lookout ? 'Tobin spotted them from the lookout. Our team goes first!' : def.surprise ? (T.SURPRISE || 'We snuck up on them! Every one of us goes before the monsters.') : (T.INIT_TEACH || 'Everybody roll to see who goes first!'));
  await waitTap('Roll!', 'b-init');
  const me = C.unitById(b, 'hero');
  const list = C.rollInitiative(b, undefined, !!def.surprise);
  const mine = list.find(e => e.id === 'hero');
  const pop = $('bdice-pop');
  $('battle-screen').scrollTop = 0;
  pop.classList.remove('hidden'); dice.mount($('bdice'));
  $('bresult').innerHTML = `<div class="br-title">Who goes first?</div><div class="br-body"><div class="br-side"><div class="br-tier" id="br-tier">Rolling...</div></div></div><div class="init-list" id="init-list"></div><div id="br-btn"></div>`;
  await new Promise(r => requestAnimationFrame(r));
  await dice.rollSet([{ sides: 20, value: mine.roll }]);
  const look = b.initPlus || 0, quick = mine.bonus - look;
  $('br-tier').innerHTML = `You rolled ${mine.roll}${quick ? `, plus ${quick} for being quick` : ''}${look ? `, plus ${look} from Tobin's lookout` : ''}: <b>${mine.total}</b>`;
  $('init-list').innerHTML = list.map((e, i) => `<div class="init-row ${e.side}${e.id === 'hero' ? ' me' : ''}"><span class="init-n">${i + 1}</span><canvas width="32" height="40" data-u="${e.id}"></canvas><span class="init-name">${esc(e.id === 'hero' ? 'You' : C.unitById(b, e.id).name)}</span><span class="init-tot">${e.total}</span></div>`).join('');
  $('init-list').querySelectorAll('canvas').forEach(cv => S.draw(cv.getContext('2d'), C.unitById(b, cv.dataset.u).spec, 0, 0, 1, 0));
  await new Promise(res => { $('br-btn').innerHTML = '<button id="b-ok" class="btn big-btn" type="button">Let\'s go!</button>'; $('b-ok').addEventListener('click', res, { once: true }); });
  pop.classList.add('hidden');
  strip(); draw();
  H.unlock();
  void me;
}

async function runTurn(u) {
  strip();
  if (u.ai === 'player') return playerTurnStart(u);
  await computerTurn(u);
  const hero = C.unitById(b, 'hero');
  if (hero.out && !heroOutSaid && !b.result) { heroOutSaid = true; say(null, T.HERO_OUT); H.lock(); await waitTap('OK'); H.unlock(); }
  return finishTurn();
}

async function endFight() {
  playerTurn = false;
  overlay = { reach: [], targets: [], area: [] }; draw();
  const r = b.result;
  if (r === 'win' || r === 'calm' || r === 'fixed') { H.lock(); await victoryHop(); }
  H.unlock();
  stopBob();
  const d = done; done = null;
  if (d) d(r);
}

// ---------- taps on the board ----------
function tileAt(ev) {
  const cv = $('board'), r = cv.getBoundingClientRect();
  const x = Math.floor((ev.clientX - r.left) / (r.width / b.map.w));
  const y = Math.floor((ev.clientY - r.top) / (r.height / b.map.h));
  return G.inside(b.map, x, y) ? { x, y } : null;
}
function onTap(ev) {
  if (!b || H.isLocked() || b.result) return;
  const t = tileAt(ev); if (!t) return;
  const who = C.unitAt(b, t.x, t.y);
  if (playerTurn && throwing) {
    if (who && overlay.aim && overlay.aim.some(p => p.x === t.x && p.y === t.y)) return doThrow(who);
    return;
  }
  if (playerTurn && aiming) {
    if (overlay.aim && overlay.aim.some(p => p.x === t.x && p.y === t.y)) return aimAt(t.x, t.y);
    return;
  }
  if (playerTurn) {
    const me = C.current(b);
    if (!b.ts.acted && who && who.side !== me.side && C.targets(b, me).includes(who)) return confirmPanel(who);
    if (!b.ts.moved && overlay.reach.some(p => p.x === t.x && p.y === t.y)) return playerMove(t.x, t.y);
  }
  if (who) return unitCard(who);
  tileCard(t.x, t.y);
}

// test hook: screen point at the middle of a tile
export function tileCenter(x, y) {
  const r = $('board').getBoundingClientRect();
  return { x: r.left + (x + 0.5) * r.width / b.map.w, y: r.top + (y + 0.5) * r.height / b.map.h };
}
export function isPlayerTurn() { return playerTurn && !H.isLocked(); }
// test hook (v1.7): fire one feel effect on a unit, and read how many particles are alive (and the most ever).
let partsPeak = 0;
export function feel(kind, id) {
  const u = b && (id ? C.unitById(b, id) : b.units.find(k => !k.out));
  if (!u) return null;
  if (kind === 'hit') { flash(u); move(u, 'squash', 320, { x: 1, y: 0 }); burst('bit', u.x, u.y, 12, colorsOf(S.sprite(u.spec, 0, 'idle'))); }
  if (kind === 'miss') move(u, 'lean', 320, { x: 1, y: 0 });
  if (kind === 'windup') move(u, 'windup', 300, { x: 1, y: 0 });
  if (kind === 'ko') burst('star', u.x, u.y - 0.2, 6);
  if (kind === 'heal') burst('heart', u.x, u.y, 4);
  if (kind === 'zzz') burst('zzz', u.x, u.y, 3);
  if (kind === 'spark') burst('spark', u.x, u.y, 4);
  if (kind === 'glitter') burst('glitter', u.x, u.y, 3, ['#ffe27a', '#ffffff', '#ffb0e0', '#a0e0ff']);
  if (kind === 'hop') move(u, 'hop', 420);
  if (kind === 'blink') { u.blinkAt = performance.now(); juice(160); }
  return feelStats();
}
export function feelStats() { partsPeak = Math.max(partsPeak, parts.length); return { parts: parts.length, peak: partsPeak, max: MAX_PARTS }; }

function startBob() { stopBob(); bobTimer = setInterval(() => { frame ^= 1; blinkTick(); draw(); if (sayWho) face('bsay-face', (C.unitById(b, sayWho) || {}).spec); }, 480); }
function stopBob() { clearInterval(bobTimer); bobTimer = 0; }

let wired = false;
function wire() {
  if (wired) return; wired = true;
  $('board').addEventListener('pointerdown', onTap);
  new ResizeObserver(() => layout()).observe($('board-wrap'));
  $('b-legend').addEventListener('click', () => { if (!H.isLocked()) H.explain(b && b.mode === 'hp' ? 'hp' : 'flags'); });
}

// Start a fight. Resolves with 'win', 'lose' or 'tie'.
export function start(fightDef, texts, hero) {
  def = fightDef; T = texts;
  try { const url = groundURL(fightDef.place || 'woods'); $('board-wrap').style.backgroundImage = url ? `url(${url})` : ''; } catch (e) { /* plain edge */ }
  b = C.createBattle(fightDef, hero);
  overlay = { reach: [], targets: [], area: [] };
  heroFirstDone = !!fightDef.skipHeroFirst; heroOutSaid = false; playerTurn = false; anim = null; floaters = []; parts = []; aiming = false; aimCenter = null; throwing = null;
  wire();
  return new Promise(res => {
    done = res;
    requestAnimationFrame(async () => {
      layout(); strip(); startBob();
      $('b-legend').textContent = b.mode === 'hp' ? 'Hearts?' : 'Flags?';
      if (b.mode === 'hp') await initiative();
      await runEvents(0);
      if (b.result) return endFight();
      const first = C.current(b);
      runTurn(first.out ? C.endTurn(b) : first);
    });
  });
}

export default { init, start, setFast, state, draw, tileCenter, isPlayerTurn, tileArt, feel, feelStats };
