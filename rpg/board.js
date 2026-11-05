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
function tileArt(id, x, y) {
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
  // the kid whose turn it is stands on a gold ring
  const cur = C.current(b);
  if (cur && !cur.out && !b.result) {
    const p = unitScreen(cur);
    c.fillStyle = 'rgba(240,196,76,0.85)';
    c.beginPath(); c.ellipse((p.x + 0.5) * t, (p.y + 0.86) * t, t * 0.42, t * 0.15, 0, 0, Math.PI * 2); c.fill();
  }
  // units, back rows first so front kids overlap
  const live = b.units.filter(u => !u.out).sort((a, z) => unitScreen(a).y - unitScreen(z).y);
  for (const u of live) {
    const p = unitScreen(u);
    const w = t * 0.92, h = w * 1.25;
    const pose = u.pose || 'idle';
    c.drawImage(S.sprite(u.spec, (frame + (u.x + u.y)) % 2, pose), (p.x + 0.04) * t, (p.y + 0.95) * t - h, w, h);
    drawFlags(c, u, p, t);
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

function drawFlags(c, u, p, t) {
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
      <span class="todo-i${tag ? '' : ' done'}">${I.icon('target', 22)}<span>Tag</span></span>
      <button class="q act" id="b-help" type="button" aria-label="How turns work">?</button>
    </div>
    <button id="b-done" class="btn big-btn act" type="button">Done</button>`);
  $('b-help').addEventListener('click', () => { if (!H.isLocked()) H.explain('turns'); });
  $('b-done').addEventListener('click', () => { if (!H.isLocked() && playerTurn) endPlayerTurn(); });
}

function confirmPanel(target) {
  const u = C.current(b), ch = C.chance(b, u, target), stat = P.SKILLS[ch.skill].stat;
  confirmTarget = target;
  overlay.targets = [{ x: target.x, y: target.y }]; draw();
  actPanel(`
    <div class="confirm">
      <div class="confirm-h">Tag <b>${esc(target.name)}</b> with your ${esc(GEAR[u.weapon].name.toLowerCase())}?</div>
      <div class="confirm-row" style="--sc:${I.STAT_COLOR[stat]}">${I.icon(I.STAT_ICON[stat], 22)}<span>${P.SKILLS[ch.skill].name}</span>${I.meter(ch.value, I.STAT_COLOR[stat], 'small')}</div>
      ${ch.cover ? `<div class="confirm-note">${I.icon('shield', 16)} ${esc(target.name)} is hiding in a bush, so it's harder.</div>` : ''}
      <div class="row two">
        <button id="b-cancel" class="btn act" type="button">Not yet</button>
        <button id="b-roll" class="btn big-btn act" type="button">Roll!</button>
      </div>
    </div>`);
  $('b-cancel').addEventListener('click', () => { if (!H.isLocked()) { confirmTarget = null; showPlayerOptions(); } });
  $('b-roll').addEventListener('click', () => { if (!H.isLocked() && confirmTarget) playerAttack(confirmTarget); });
}

// ---------- cards ----------
function unitCard(u) {
  const c = CAST.find(k => k.id === u.id);
  const ch = C.skillValue(u, u.use.skill), stat = P.SKILLS[u.use.skill].stat;
  const ex = document.createElement('div'); ex.className = 'unitcard';
  const flags = Array.from({ length: u.maxFlags }, (_, i) => I.icon(u.side === 'hero' ? 'flagb' : 'flagr', 22, i >= u.flags)).join('');
  ex.innerHTML = `<div class="uc-row"><b>Flags</b><span>${flags}</span></div>
    <div class="uc-row" style="--sc:${I.STAT_COLOR[stat]}"><b>Tags with</b><span>${esc(GEAR[u.weapon].name)}</span></div>
    <div class="uc-row">${I.icon(I.STAT_ICON[stat], 20)}<span>${P.SKILLS[u.use.skill].name}</span>${I.meter(ch, I.STAT_COLOR[stat], 'small')}</div>
    <div class="uc-row">${I.icon(u.use.range > 1 ? 'target' : 'boot', 18)}<span>${u.use.range > 1 ? 'Reaches ' + u.use.range + ' squares' : 'Reaches the squares right next to them'}</span></div>`;
  H.showCard({
    title: u.id === 'hero' ? u.name + ' (you)' : (c ? c.name : u.name),
    body: u.id === 'hero' ? 'That\'s you! You only control yourself in this game. Your friends take their own turns.' : (u.side === 'monster' ? 'Playing a monster today. ' : 'On your team today. ') + (c ? c.bio : ''),
    prereq: u.out ? 'Out of flags. Cheering from the log.' : (u.side === 'hero' ? 'Hero team (blue flags)' : 'Monster team (red flags)'),
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
async function rollPop(actor, chanceValue, title, isPlayer) {
  const roll = R.rollD100();
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
    await new Promise(res => {
      $('br-btn').innerHTML = '<button id="b-ok" class="btn big-btn" type="button">OK</button>';
      $('b-ok').addEventListener('click', res, { once: true });
    });
  } else {
    await Promise.race([wait(1500), new Promise(res => pop.addEventListener('click', res, { once: true }))]);
  }
  pop.classList.add('hidden');
  return roll;
}

function announceOuts(before) {
  for (const u of b.units) if (u.out && !before.has(u.id)) {
    if (u.id === 'hero') continue;
    return fill(T.OUT_LINE, { who: u.name });
  }
  return null;
}

async function doAttack(u, target) {
  const ch = C.chance(b, u, target);
  const before = new Set(b.units.filter(k => k.out).map(k => k.id));
  u.pose = 'attack'; draw();
  const roll = await rollPop(u, ch.value, `${u.id === 'hero' ? 'You tag' : u.name + ' tags'} ${target.name}`, u.id === 'hero');
  u.pose = 'idle';
  const res = C.resolveAttack(b, u, target, roll);
  if (res.lost) floater(target.x, target.y, '-' + res.lost, u.side === 'hero' ? '#ff8070' : '#80b8ff');
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
  const roll = await rollPop(u, C.chance(b, u, null, { skill: u.trick.skill, ignoreCover: true }).value, `${u.name}: ${u.trick.name}`, false);
  u.pose = 'idle';
  const res = C.resolveArea(b, u, center, roll);
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
  if (plan.teach) {
    b.taught[plan.teach] = true;
    if (plan.moveTo) overlay.reach = C.moveTiles(b, u).tiles;
    if (plan.action && plan.action.type === 'area') overlay.area = C.areaTiles(b, u, plan.action.center);
    draw();
    say(u.id, T.TEACH[plan.teach]);
    await waitTap('Got it!');
    overlay.reach = []; overlay.area = []; draw();
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
  if (plan.action && plan.action.type === 'attack') await doAttack(u, C.unitById(b, plan.action.target));
  if (plan.action && plan.action.type === 'area') await doArea(u, plan.action.center);
  H.unlock();
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
  const next = C.endTurn(b);
  strip(); draw();
  if (!next) return endFight();
  await runTurn(next);
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
  $('b-legend').addEventListener('click', () => { if (!H.isLocked()) H.explain('flags'); });
}

// Start a fight. Resolves with 'win', 'lose' or 'tie'.
export function start(fightDef, texts, hero) {
  def = fightDef; T = texts;
  b = C.createBattle(fightDef, hero);
  overlay = { reach: [], targets: [], area: [] };
  heroFirstDone = false; heroOutSaid = false; playerTurn = false; anim = null; floaters = [];
  wire();
  return new Promise(res => {
    done = res;
    requestAnimationFrame(() => {
      layout(); strip(); startBob();
      runTurn(C.current(b));
    });
  });
}

export default { init, start, setFast, state, draw, tileCenter, isPlayerTurn };
