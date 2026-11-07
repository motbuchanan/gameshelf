// App shell + Dice Tray screen (Phase 1). Later phases add screens here.
import { GAME_TITLE, VERSION, BUILD_DATE, getSettings, setSettings } from './config.js';
import R from './rules.js';
import dice, { STYLE, drawPixelText } from './dice.js';
import { GLOSSARY } from './glossary.js';
import S from './sprites.js';
import creator from './creator.js';
import board from './board.js';
import C from './combat.js';
import story from './story.js';
import book from './book.js';

const $ = id => document.getElementById(id);

// ---------- lock: nothing can be tapped while dice or animations run ----------
let locked = false;
export function lock() { locked = true; document.body.classList.add('locked'); }
export function unlock() { locked = false; document.body.classList.remove('locked'); }
export function isLocked() { return locked; }
// Wrap a handler so a double tap or a tap during a roll never fires twice.
function guard(fn) {
  return async e => {
    if (locked) return;
    lock();
    try { await fn(e); } finally { unlock(); }
  };
}

// ---------- explain cards ----------
let cardOpen = false;
export function explain(id, extra) {
  const g = GLOSSARY[id];
  if (!g) return;
  showCard({ title: g.title, body: g.body, prereq: g.prereq, extra });
}
// Any card: title, words, an optional extra picture area, and an optional animated character.
export function showCard({ title, body, prereq, extra, spec }) {
  const ex = $('card-extra'); ex.innerHTML = '';
  if (extra) ex.appendChild(extra);
  bioChar = spec ? { spec } : null;
  $('card-sprite').classList.toggle('hidden', !spec);
  if (spec) drawBio(0);
  $('card-title').textContent = title;
  $('card-body').textContent = body;
  $('card-prereq').textContent = prereq || '';
  $('card').classList.remove('hidden');
  cardOpen = true;
  $('card-ok').focus();
}
function closeCard() { $('card').classList.add('hidden'); cardOpen = false; bioChar = null; }

let toastTimer = 0;
export function toast(msg, ms = 2600) {
  const t = $('toast');
  t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), ms);
}

// ---------- small pixel icons (inline SVG, literal colors) ----------
function pixSvg(rows, colors, size = 16) {
  let rects = '';
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch !== '.') rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${colors[ch]}"/>`; }));
  return `<svg class="pip" viewBox="0 0 ${rows[0].length} ${rows.length}" width="${size}" height="${size}" shape-rendering="crispEdges">${rects}</svg>`;
}
const CLOVER = ['.gg.gg.', 'gGGgGGg', 'gGGgGGg', '.gggggg', 'gGGgGGg', 'gGGgGs.', '.gg..s.'];
const FLIPICON = ['..y....', '.yyyyyy', '..y....', '.......', '....y..', 'yyyyyy.', '....y..'];
const PIX_COL = { g: '#2c7340', G: '#74c47a', s: '#6b4226', y: '#f0c44c' };

// ---------- skill check state ----------
const state = { skill: 50, luck: 3, luckMax: 3, flips: 2, flipsMax: 2, last: null, flipped: false };
const SAY = {
  legendary: 'Perfect, and something extra good happens!',
  exceptional: 'You did it, and you did it really well.',
  success: 'You did it!',
  fail: 'Not this time. Try another way, or use a second chance.',
  disaster: 'Uh oh! It fails, and something else goes wrong too.',
};

function renderChart(markerValue) {
  const z = R.zones(state.skill);
  const spans = [
    ['legendary', 1, z.legendaryMax],
    ['exceptional', z.legendaryMax + 1, z.exceptionalMax],
    ['success', z.exceptionalMax + 1, z.successMax],
    ['fail', z.successMax + 1, z.disasterMin - 1],
    ['disaster', z.disasterMin, 100],
  ].filter(s => s[2] >= s[1]);
  const chart = $('chart');
  chart.innerHTML = spans.map(([t, a, b]) => {
    const w = (b - a + 1);
    const label = w >= 8 ? (a === b ? `${a}` : `${a}-${b}`) : '';
    return `<button class="zone z-${t} act" style="flex:${w}" data-explain="${t}" type="button" aria-label="${R.TIER_LABEL[t]} ${a} to ${b}"><span>${label}</span></button>`;
  }).join('') + (markerValue ? `<div class="marker" style="left:${(markerValue - 0.5)}%"></div>` : '');
}

function renderPips() {
  let l = '';
  for (let i = 0; i < state.luckMax; i++) l += pixSvg(CLOVER, PIX_COL).replace('class="pip"', `class="pip${i >= state.luck ? ' used' : ''}"`);
  $('luck-pips').innerHTML = l;
  let f = '';
  for (let i = 0; i < state.flipsMax; i++) f += pixSvg(FLIPICON, PIX_COL).replace('class="pip"', `class="pip${i >= state.flips ? ' used' : ''}"`);
  $('flip-pips').innerHTML = f;
  const has = !!state.last;
  $('use-luck').disabled = !has || state.luck <= 0;
  const fl = has ? R.flip(state.last) : null;
  const helps = fl && fl.value < state.last.value && !state.flipped;
  $('use-flip').disabled = !helps || state.flips <= 0;
  $('use-flip').textContent = !has ? 'Flip the dice'
    : state.flipped ? 'Already flipped'
    : helps ? `Flip: ${state.last.value} to ${fl.value}`
    : `Flip would not help (${fl.value})`;
}

function tierColor(t) { return `var(--t-${t})`; }

function showCheck(roll, note) {
  const t = R.tierFor(state.skill, roll.value);
  const res = $('result');
  res.innerHTML = `<div class="num" style="color:${tierColor(t)}">${roll.value}</div>
    <div><button class="tier linkish btn" data-explain="${t}" type="button" style="color:${tierColor(t)};padding:0;min-height:0;font:700 26px var(--head);text-decoration:none">${R.TIER_LABEL[t]}</button>
    <div class="say">${note ? note + ' ' : ''}${SAY[t]}</div></div>`;
  res.classList.remove('pop'); void res.offsetWidth; res.classList.add('pop');
  renderChart(roll.value);
}

async function doCheckRoll(note) {
  const r = R.rollD100();
  await dice.roll(r);
  state.last = r; state.flipped = false;
  showCheck(r, note);
  renderPips();
}

// ---------- dice bag ----------
const bag = [];
const BAG_MAX = 10;
function bagNotation() {
  const counts = {};
  bag.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
  return R.DIE_SIDES.filter(s => counts[s]).map(s => `${counts[s]}d${s}`).join(' + ');
}
function renderBag() {
  const el = $('bag');
  el.innerHTML = bag.length
    ? bag.map((s, i) => `<button class="chip act" data-remove="${i}" type="button" aria-label="Remove d${s}">d${s}</button>`).join('')
    : '<span class="empty">Empty. Tap dice above.</span>';
  $('bag-notation').textContent = bagNotation();
  $('bag-roll').disabled = !bag.length;
  $('bag-clear').disabled = !bag.length;
}
function dieIcon(sides) {
  const c = document.createElement('canvas');
  c.width = 20; c.height = 20;
  const x = c.getContext('2d');
  const type = 'd' + sides, st = STYLE[type];
  const n = { 4: 3, 6: 4, 8: 4, 10: 4, 12: 5, 20: 6 }[sides];
  x.beginPath();
  for (let k = 0; k < n; k++) {
    let a = (k / n) * Math.PI * 2 - Math.PI / 2;
    if (sides === 6) a += Math.PI / 4;
    let r = 9.5;
    if (sides === 10 && k % 2) r = 6;
    x.lineTo(10 + Math.cos(a) * r, 10.5 + Math.sin(a) * r * (sides === 8 ? 1 : 0.95));
  }
  x.closePath(); x.fillStyle = st.body; x.fill(); x.strokeStyle = '#000'; x.lineWidth = 1.5; x.stroke();
  drawPixelText(x, String(sides), 10, sides === 4 ? 12 : 10, 1, st.ink, false);
  return c;
}
function buildPicker() {
  const p = $('die-picker');
  R.DIE_SIDES.forEach(s => {
    const b = document.createElement('button');
    b.className = 'die-btn act'; b.type = 'button'; b.dataset.add = s;
    b.setAttribute('aria-label', `Add a d${s}`);
    b.appendChild(dieIcon(s));
    const t = document.createElement('span'); t.textContent = 'd' + s; b.appendChild(t);
    const q = document.createElement('span'); q.className = 'q'; q.textContent = '?'; q.dataset.explain = 'd' + s;
    q.setAttribute('role', 'button'); q.setAttribute('aria-label', `What is a d${s}?`);
    b.appendChild(q);
    p.appendChild(b);
  });
}
function showBag(r) {
  const res = $('result');
  res.innerHTML = `<div class="num" style="color:var(--gold)">${r.total}</div>
    <div><div class="tier" style="font:700 22px var(--head)">Total</div>
    <div class="chips">${r.dice.map(d => `<span class="chip">d${d.sides}: ${d.value}</span>`).join('')}</div></div>`;
  res.classList.remove('pop'); void res.offsetWidth; res.classList.add('pop');
}

// ---------- wiring ----------
function setTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === name));
  $('tab-check').classList.toggle('hidden', name !== 'check');
  $('tab-bag').classList.toggle('hidden', name !== 'bag');
}

function wire() {
  document.addEventListener('click', e => {
    const ex = e.target.closest('[data-explain]');
    if (ex && !cardOpen) { e.stopPropagation(); e.preventDefault(); explain(ex.dataset.explain); return; }
    const tab = e.target.closest('.tab');
    if (tab && !locked) { setTab(tab.dataset.tab); return; }
    const add = e.target.closest('[data-add]');
    if (add && !locked) { if (bag.length < BAG_MAX) { bag.push(+add.dataset.add); renderBag(); } else toast('The bag holds ' + BAG_MAX + ' dice.'); return; }
    const rm = e.target.closest('[data-remove]');
    if (rm && !locked) { bag.splice(+rm.dataset.remove, 1); renderBag(); }
  }, true);

  $('card-ok').addEventListener('click', closeCard);
  $('card').addEventListener('click', e => { if (e.target === $('card')) closeCard(); });

  $('skill').addEventListener('input', e => {
    state.skill = R.clampSkill(+e.target.value);
    $('skill-val').textContent = state.skill + '%';
    renderChart(state.last ? state.last.value : 0);
    if (state.last) showCheck(state.last);
  });

  $('roll').addEventListener('click', guard(() => doCheckRoll()));
  $('use-luck').addEventListener('click', guard(async () => {
    if (state.luck <= 0 || !state.last) return;
    state.luck--; renderPips();
    await doCheckRoll('Luck!');
  }));
  $('use-flip').addEventListener('click', guard(async () => {
    if (state.flips <= 0 || !state.last || state.flipped) return;
    const before = state.last.value;
    const f = R.flip(state.last);
    if (f.value >= before) return;
    state.flips--; state.last = f; state.flipped = true;
    showCheck(f, `Flipped! ${before} became ${f.value}.`);
    renderPips();
  }));
  $('rest').addEventListener('click', guard(() => {
    state.luck = state.luckMax; state.flips = state.flipsMax; renderPips();
    toast('Rested. Luck and Flips are full again.');
  }));

  $('bag-roll').addEventListener('click', guard(async () => {
    if (!bag.length) return;
    const r = R.rollDice(bagNotation());
    // Keep the bag's tap order for the dice in the tray.
    await dice.rollSet(r.dice);
    showBag(r);
  }));
  $('bag-clear').addEventListener('click', () => { if (!locked) { bag.length = 0; renderBag(); } });

  $('mode-3d').addEventListener('change', e => {
    const m = dice.setMode(e.target.checked ? '3d' : '2d');
    e.target.checked = m === '3d';
    setSettings({ diceMode: m, diceModeAuto: false });
    if (e.target.checked === false && m === '2d' && e.target.dataset.forced) toast('3D dice are not available on this device.');
  });

  $('badge').addEventListener('click', () => toast(`${GAME_TITLE} v${VERSION}, built ${BUILD_DATE}`));
  $('update-pill').addEventListener('click', () => location.reload());
}


// ---------- screens ----------
let screen = 'adventure-screen';
// The Adventure tab shows whichever adventure view is active: the hero sheet, a story scene, or a fight.
let advView = 'adventure-screen';
const ADV_VIEWS = ['adventure-screen', 'story-screen', 'battle-screen'];
export function setAdvView(id, backToSheet) {
  advView = id;
  if (id === 'adventure-screen' && backToSheet) creator.go('sheet');
  showScreen(id);
}
function showScreen(id) {
  if (id === 'adventure-screen') id = advView;
  screen = id;
  document.querySelectorAll('.screen').forEach(el => el.classList.toggle('hidden', el.id !== id));
  document.querySelectorAll('.navbtn').forEach(b => b.classList.toggle('on', b.dataset.screen === id || (b.dataset.screen === 'adventure-screen' && ADV_VIEWS.includes(id))));
  if (id === 'tray-screen') dice.mount($('tray'));
  if (id === 'gallery-screen') { book.render(); startAnim(); } else stopAnim();
  if (id === 'adventure-screen') creator.startAnim(); else creator.stopAnim();
  if (id === 'battle-screen') board.draw();
}

// ---------- The Big Book (gallery of everything) ----------
let bioChar = null;
function drawBio(frame) {
  if (!bioChar) return;
  const x = $('card-sprite').getContext('2d');
  x.clearRect(0, 0, 32, 40);
  S.draw(x, bioChar.spec, 0, 0, 1, frame, Math.floor(performance.now() / 1400) % 3 === 2 ? 'attack' : 'idle');
}
let animFrame = 0, animTimer = 0;
function startAnim() {
  stopAnim();
  const tick = () => { animFrame ^= 1; book.draw(animFrame); drawBio(animFrame); };
  tick(); animTimer = setInterval(tick, 480);
}
function stopAnim() { clearInterval(animTimer); animTimer = 0; }
function wireGallery() {
  document.querySelectorAll('.navbtn').forEach(b => b.addEventListener('click', () => { if (!locked) showScreen(b.dataset.screen); }));
  book.render();
}

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) $('update-pill').classList.remove('hidden'); });
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data && e.data.type === 'version' && e.data.version !== VERSION) $('update-pill').classList.remove('hidden');
  });
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline install not available, game still runs */ });
}

function start() {
  document.title = GAME_TITLE;
  $('title').textContent = GAME_TITLE;
  $('badge').textContent = `v${VERSION} · ${BUILD_DATE}`;
  const s = getSettings();
  dice.init($('tray'), {
    mode: s.diceMode,
    onSlow: () => {
      if (dice.getMode() !== '3d') return;
      dice.setMode('2d');
      $('mode-3d').checked = false;
      setSettings({ diceMode: '2d', diceModeAuto: true });
      toast('Switched to flat dice so the game stays smooth.');
    },
  });
  if (dice.getMode() !== s.diceMode) { $('mode-3d').dataset.forced = '1'; }
  $('mode-3d').checked = dice.getMode() === '3d';
  buildPicker();
  renderChart(0);
  renderPips();
  renderBag();
  $('result').innerHTML = '<div class="say">Pick a skill, then roll. Tap any <b>?</b> to learn what it means.</div>';
  wire();
  wireGallery();
  creator.init({ explain, toast, playChapter: id => story.play(id), chapterTitle: id => story.chapterTitle(id) });
  board.init({ lock, unlock, isLocked, explain, showCard });
  book.init({ explain, showCard });
  story.init({ setAdvView, toast, lock, unlock });
  showScreen('adventure-screen');
  registerSW();
  // Test hook (read-only use in automated checks).
  window.__rpg = { combat: C, dice, rules: R, state, bag, lock, unlock, isLocked, sprites: S, showScreen, creator, board, story, book };
}

start();

export default { lock, unlock, isLocked, explain, toast };
