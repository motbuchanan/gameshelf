// The battle screen: draws the grid, runs turns, and talks the player through them.
// Rules live in combat.js. This file only shows them and takes taps.
import C from './combat.js';
import G from './grid.js';
import R from './rules.js';
import S from './sprites.js';
import I from './icons.js';
import P from './party.js';
import dice from './dice.js';
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
  if (id === 'stream') {
    px(c, 0, 0, 16, 16, '#3a7ac0');
    const o = v % 2 ? 4 : 0;
    for (let y = 2; y < 16; y += 5) { px(c, (o + y) % 12, y, 4, 1, '#6aa8e0'); px(c, (o + y + 8) % 14, y + 2, 3, 1, '#2e66a8'); }
  }
  return cv;
}
export function tileArt(id, x, y) {
  const v = id === 'stream' ? (hash(x, y) + frame) % 2 + (y % 2) * 2 : hash(x, y) % 4;
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
  const live = b.units.filter(u => !u.out && !u.gone).sort((a, z) => unitScreen(a).y - unitScreen(z).y);
  for (const u of live) {
    const p = unitScreen(u);
    const w = t * 0.92, h = w * 1.25;
    const pose = u.pose || 'idle';
    c.drawImage(S.sprite(u.spec, (frame + (u.x + u.y)) % 2, pose), (p.x + 0.04) * t, (p.y + 0.95) * t - h, w, h);
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
  // rising "-1" flags
  floaters.forEach(f => {
    c.globalAlpha = Math.max(0, 1 - f.age / 1.2);
    c.font = `800 ${Math.round(t * 0.38)}px "Avenir Next", system-ui, sans-serif`;
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
  return String(text).replace(/\{name\}/g, hero ? hero.name : 'Hero').replace(/\{(\w+)\}/g, (m, k) => extra[k] ?? m);
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
    ${tag && u.trick && u.trick.left > 0 ? `<button id="b-trick" class="btn act trick-btn" type="button">${I.icon('burst', 22)} ${esc(u.trick.name)} <span class="trick-left">${Array.from({ length: u.trick.left }, () => I.icon('star', 14)).join('')}</span></button>` : ''}
    ${tag && C.canOpenCage(b, u) ? `<button id="b-cage" class="btn act trick-btn" type="button">${I.icon('hammer', 22)} Open the cage!</button>` : ''}
    <button id="b-done" class="btn big-btn act" type="button">Done</button>`);
  $('b-help').addEventListener('click', () => { if (!H.isLocked()) H.explain('turns'); });
  if ($('b-trick')) $('b-trick').addEventListener('click', () => { if (!H.isLocked() && playerTurn) aimTrick(); });
  if ($('b-cage')) $('b-cage').addEventListener('click', () => { if (!H.isLocked() && playerTurn) playerCage(); });
  $('b-done').addEventListener('click', () => { if (!H.isLocked() && playerTurn) endPlayerTurn(); });
}

function confirmPanel(target) {
  const u = C.current(b), ch = C.chance(b, u, target), stat = P.SKILLS[ch.skill].stat;
  confirmTarget = target;
  overlay.targets = [{ x: target.x, y: target.y }]; draw();
  actPanel(`
    <div class="confirm">
      <div class="confirm-h">${b.mode === 'hp' ? 'Attack' : 'Tag'} <b>${esc(target.name)}</b> with your ${esc(GEAR[u.weapon].name.toLowerCase())}?</div>
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
  overlay.aim = C.areaCenters(b, u).filter(t => !(t.x === u.x && t.y === u.y));
  draw();
  say('hero', `Tap a square to aim your ${u.trick.name}.`);
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

// ---------- cards ----------
function unitCard(u) {
  const c = CAST.find(k => k.id === (u.cast || u.id));
  const ch = C.skillValue(u, u.use.skill), stat = P.SKILLS[u.use.skill].stat;
  const ex = document.createElement('div'); ex.className = 'unitcard';
  const hp = b.mode === 'hp';
  const flags = Array.from({ length: u.maxFlags }, (_, i) => I.icon(hp ? 'heart' : (u.side === 'hero' ? 'flagb' : 'flagr'), hp ? 16 : 22, i >= u.flags)).join('');
  ex.innerHTML = `<div class="uc-row"><b>${hp ? 'Hearts' : 'Flags'}</b><span class="uc-hearts">${flags}</span></div>
    ${hp ? `<div class="uc-row"><b>Armor</b><span>${u.armor ? I.icon('shield', 18) + ' Harder to hit (' + u.armor + ' squares)' : 'No armor'}</span></div>` : ''}
    <div class="uc-row" style="--sc:${I.STAT_COLOR[stat]}"><b>${hp ? 'Hits with' : 'Tags with'}</b><span>${esc(GEAR[u.weapon].name)}${hp ? ' ' + I.icon('die', 16) + ' ' + esc(C.weaponDice(u)) : ''}</span></div>
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

function floater(x, y, text, color) {
  floaters.push({ x, y, text, color, age: 0 });
  const t0 = performance.now();
  const tick = now => {
    floaters.forEach(f => { f.age = (now - t0) / 1000; });
    floaters = floaters.filter(f => f.age < 1.2);
    draw();
    if (floaters.length) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// The dice pop-up: shows the chance squares, rolls the real dice, marks the square that came up.
async function rollPop(actor, chanceValue, title, isPlayer, opts = {}) {
  let roll = R.rollD100();
  const pop = $('bdice-pop');
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
        await new Promise(res => { $('br-btn').innerHTML = '<button id="b-ok" class="btn big-btn" type="button">OK</button>'; $('b-ok').addEventListener('click', res, { once: true }); });
        pop.classList.add('hidden');
        return roll;
      }
    }
    if (canLuck && !b.taught.luck) { b.taught.luck = true; say('hollis', T.LUCK_TEACH); }
    const again = await new Promise(res => {
      const clovers = hero ? Array.from({ length: P.LUCK_MAX }, (_, i) => I.icon('clover', 18, i >= hero.luck)).join('') : '';
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
async function damagePop(u, target, tier, note, isPlayer) {
  const dmg = C.rollDamage(note, tier);
  const pop = $('bdice-pop');
  pop.classList.remove('hidden');
  dice.mount($('bdice'));
  const extra = tier === 'legendary' ? 'Legendary: the first die counts as its highest number, plus one more die!' : tier === 'exceptional' ? 'Exceptional: you get one extra die!' : '';
  $('bresult').innerHTML = `<div class="br-title">Damage on ${esc(target.id === 'hero' ? 'you' : target.name)}</div>
    <div class="br-body"><div class="br-side"><div class="br-tier">${I.icon('die', 22)} ${esc(note)}${extra ? '' : ''}</div>${extra ? `<div class="br-need">${esc(extra)}</div>` : ''}<div class="br-hearts" id="br-hearts"></div></div></div><div id="br-btn"></div>`;
  if (!b.taught.damage && (u.side === 'hero')) { b.taught.damage = true; say('hollis', T.DAMAGE_TEACH); }
  await new Promise(r => requestAnimationFrame(r));
  await dice.rollSet(dmg.dice.map(d => ({ sides: d.sides, value: d.value })));
  $('br-hearts').innerHTML = `<span>${Array.from({ length: Math.min(dmg.total, 16) }, () => I.icon('heart', 22)).join('')}</span><b>${dmg.total} ${dmg.total === 1 ? 'heart' : 'hearts'}!</b>`;
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
  u.pose = 'attack'; draw();
  const hp = b.mode === 'hp', verb = hp ? (u.id === 'hero' ? 'You attack' : u.name + ' attacks') : (u.id === 'hero' ? 'You tag' : u.name + ' tags');
  if (hp && ch.armor && !b.taught.armor && u.side === 'hero') { b.taught.armor = true; say('pim', T.ARMOR_TEACH); await waitTap('Got it!'); }
  const roll = await rollPop(u, ch.value, `${verb} ${target.id === 'hero' ? 'you' : target.name}`, u.id === 'hero', { luck: hp });
  u.pose = 'idle';
  const tier = R.tierFor(ch.value, roll.value);
  const dmg = hp && C.FLAGS_FOR[tier] ? await damagePop(u, target, tier, C.weaponDice(u), u.id === 'hero') : null;
  const res = C.resolveAttack(b, u, target, roll, dmg);
  if (res.lost) floater(target.x, target.y, '-' + res.lost, hp ? '#ff6050' : (u.side === 'hero' ? '#ff8070' : '#80b8ff'));
  else floater(target.x, target.y, res.tier === 'disaster' ? 'Oops!' : 'Miss', '#f3e6cc');
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
  u.pose = 'attack';
  const chv = C.chance(b, u, null, { skill: u.trick.skill, ignoreCover: true }).value;
  const mine = u.ai === 'player';
  const roll = await rollPop(u, chv, `${mine ? 'You cast' : u.name + ':'} ${u.trick.name}`, mine, { luck: b.mode === 'hp' });
  u.pose = 'idle';
  const tier = R.tierFor(chv, roll.value);
  const dmg = b.mode === 'hp' && C.FLAGS_FOR[tier] ? await damagePop(u, { name: u.trick.r ? 'everyone in the orange squares' : 'that square', id: 'area' }, tier, u.trick.dice || '1d4', mine) : null;
  const scaredBefore = { ...b.scared };
  const res = C.resolveArea(b, u, center, roll, dmg);
  for (const id in b.scared) if (b.scared[id] && !scaredBefore[id]) { const g = C.unitById(b, id); floater(g.x, g.y, 'Eek! Fire!', '#ffd060'); }
  res.results.forEach(r => { const t = C.unitById(b, r.id); floater(t.x, t.y, r.lost ? '-' + r.lost : 'Miss', '#ff8070'); });
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
  if (act === 'scared') {
    say(u.id, T.SCARED || 'Fire! FIRE! Keep it away from me!');
    floater(u.x, u.y, 'Scared!', '#ffd060');
    await wait(fast ? 10 : 1200);
    C.afterTurn(b, u, plan);
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
  if (plan.action && plan.action.type === 'area') await doArea(u, plan.action.center);
  if (plan.action && plan.action.type === 'flee') {
    floater(u.x, u.y, 'Runs!', '#f3e6cc');
    await animateWalk(u, u.x, u.y, [{ x: u.x === 0 ? -1 : u.x === b.map.w - 1 ? b.map.w : u.x, y: u.y === 0 ? -1 : u.y === b.map.h - 1 ? b.map.h : u.y }]);
    C.flee(b, u); strip(); draw();
    say(null, fill(T.FLED_LINE, { who: u.name }));
    await wait(fast ? 10 : 1000);
  }
  C.afterTurn(b, u, plan);
  H.unlock();
}

// The boss's big flail sweep: one roll, and every kid in the danger squares gets hit.
async function doSweep(u) {
  const before = new Set(b.units.filter(x => x.out).map(x => x.id));
  const area = b.danger.slice();
  overlay.area = area; draw();
  const chv = C.chance(b, u, null, { skill: 'swing', ignoreCover: true, ignoreArmor: true }).value;
  u.pose = 'attack'; draw();
  const roll = await rollPop(u, chv, `${u.name}: flail sweep!`, false);
  u.pose = 'idle';
  const tier = R.tierFor(chv, roll.value);
  const hitAny = C.enemiesOf(b, u).some(e => area.some(t => t.x === e.x && t.y === e.y));
  const dmg = C.FLAGS_FOR[tier] && hitAny ? await damagePop(u, { name: 'everyone in the red squares', id: 'area' }, tier, u.sweepDice || '1d6', false) : null;
  const res = C.resolveSweep(b, u, roll, dmg || { total: 0 });
  overlay.area = [];
  res.results.forEach(r => { const t = C.unitById(b, r.id); if (r.lost) floater(t.x, t.y, '-' + r.lost, '#ff6050'); });
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

function endPlayerTurn() {
  playerTurn = false; confirmTarget = null;
  overlay.reach = []; overlay.targets = [];
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
  say(def.surprise ? 'nell' : 'hollis', def.surprise ? (T.SURPRISE || 'We snuck up on them! Every one of us goes before the monsters.') : (T.INIT_TEACH || 'Everybody roll to see who goes first!'));
  await waitTap('Roll!', 'b-init');
  const me = C.unitById(b, 'hero');
  const list = C.rollInitiative(b, undefined, !!def.surprise);
  const mine = list.find(e => e.id === 'hero');
  const pop = $('bdice-pop');
  pop.classList.remove('hidden'); dice.mount($('bdice'));
  $('bresult').innerHTML = `<div class="br-title">Who goes first?</div><div class="br-body"><div class="br-side"><div class="br-tier" id="br-tier">Rolling...</div></div></div><div class="init-list" id="init-list"></div><div id="br-btn"></div>`;
  await new Promise(r => requestAnimationFrame(r));
  await dice.rollSet([{ sides: 20, value: mine.roll }]);
  $('br-tier').innerHTML = `You rolled ${mine.roll}${mine.bonus ? `, plus ${mine.bonus} for quick feet` : ''}: <b>${mine.total}</b>`;
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
  H.unlock();
  const r = b.result;
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

function startBob() { stopBob(); bobTimer = setInterval(() => { frame ^= 1; draw(); if (sayWho) face('bsay-face', (C.unitById(b, sayWho) || {}).spec); }, 480); }
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
  b = C.createBattle(fightDef, hero);
  overlay = { reach: [], targets: [], area: [] };
  heroFirstDone = !!fightDef.skipHeroFirst; heroOutSaid = false; playerTurn = false; anim = null; floaters = []; aiming = false; aimCenter = null;
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

export default { init, start, setFast, state, draw, tileCenter, isPlayerTurn, tileArt };
