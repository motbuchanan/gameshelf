// Chapter 0: character creation and the character sheet (Phase 3).
import S from './sprites.js';
import { SKINS, HAIRS, CLOTH, GEAR } from './art.js';
import P from './party.js';
import save from './save.js';
import { CH0, NAMES } from './ch0.js';
import { pick } from './rng.js';
import I from './icons.js';

const $ = id => document.getElementById(id);
let explain = () => {}, toast = () => {}, playChapter = () => {}, chapterTitle = () => '';

const STEPS = ['people', 'look', 'name', 'bestat', 'weapon', 'review'];
const draft = { people: 'human', skin: 'peach', hair: 'short', hairColor: 'brown', cloth: 'green', name: '', bestAt: null, weapon: null };
let step = -1; // -1 = title, 0..5 = steps, 'sheet' = saved sheet
let frame = 0, timer = 0;

const HAIR_NAME = { short: 'Short', spiky: 'Spiky', long: 'Long', ponytail: 'Ponytail', bun: 'Bun', curly: 'Curly', braids: 'Braids', none: 'Bald' };
const cap = s => s[0].toUpperCase() + s.slice(1);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function draftHero() {
  const bestAt = draft.bestAt || 'brave';
  return P.makeHero({ ...draft, bestAt, weapon: draft.weapon || P.BEST_AT[bestAt].weapon });
}

function currentSpec() {
  if (step === 'sheet' || step === -1) { const s = save.get(); if (s && s.hero) return P.spriteSpec(s.hero); }
  const h = draftHero();
  if (!draft.weapon && STEPS[step] !== 'review' && STEPS[step] !== 'weapon') h.gear.mainHand = null;
  // Helmet off while you pick your people and your look, so your hair shows.
  if (STEPS[step] === 'people' || STEPS[step] === 'look') h.gear.head = null;
  return P.spriteSpec(h);
}

function drawStage() {
  const c = $('adv-sprite'); if (!c) return;
  const x = c.getContext('2d'); x.clearRect(0, 0, 32, 40);
  if (step === -1 && !save.get()) return void S.draw(x, { build: 'kid', people: 'human', skin: 'peach', hair: 'short', hairColor: 'brown', cloth: 'green', layers: { head: 'bucket', body: 'tunic', mainHand: 'woodsword', back: 'satchel' } }, 0, 0, 1, frame);
  S.draw(x, currentSpec(), 0, 0, 1, frame);
}

function say(text) { $('adv-say').textContent = text; }

function miniSprite(spec, cls = '') {
  const c = document.createElement('canvas'); c.width = 32; c.height = 40; c.className = 'mini ' + cls;
  S.draw(c.getContext('2d'), spec, 0, 0, 1);
  return c;
}

function chip(label, on, onClick, extra) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'ochip' + (on ? ' on' : '');
  if (extra) b.appendChild(extra);
  b.appendChild(document.createTextNode(label));
  b.addEventListener('click', onClick);
  return b;
}
function qBtn(id, label, open) {
  const q = document.createElement('button'); q.type = 'button'; q.className = 'q'; q.textContent = '?';
  q.setAttribute('aria-label', 'What is ' + label + '?');
  q.addEventListener('click', e => { e.stopPropagation(); open ? open() : explain(id); });
  return q;
}
function swatch(ramp) { const s = document.createElement('span'); s.className = 'swatch'; s.style.background = ramp[1]; return s; }

// A big choice card: picture, title, line of text, ? button.
function bonusLine(stat) {
  const d = document.createElement('div'); d.className = 'bonus'; d.style.setProperty('--sc', I.STAT_COLOR[stat]);
  d.innerHTML = `${I.icon(I.STAT_ICON[stat], 18)}<span>Extra ${P.STAT_NAME[stat]}</span>`;
  return d;
}
function weaponLine(w) {
  const d = document.createElement('div'); d.className = 'wline';
  const far = w === 'slingshot', stat = far ? 'finesse' : 'might';
  d.innerHTML = `<span class="wbit">Damage ${dieBadge(GEAR[w].dice)}</span>`
    + `<span class="wbit" style="--sc:${I.STAT_COLOR[stat]}">${I.icon(far ? 'target' : I.STAT_ICON[stat], 16)}${far ? 'Far' : 'Close'}</span>`;
  return d;
}
function choiceCard({ on, title, text, pic, explainId, onPick, tag, extra }) {
  const b = document.createElement('div');
  b.className = 'choice' + (on ? ' on' : ''); b.setAttribute('role', 'button'); b.tabIndex = 0;
  if (pic) b.appendChild(pic);
  const body = document.createElement('div'); body.className = 'choice-body';
  body.innerHTML = `<div class="choice-title">${esc(title)}${tag ? ` <span class="tag">${esc(tag)}</span>` : ''}</div><div class="choice-text">${esc(text)}</div>`;
  if (extra) body.appendChild(extra);
  b.appendChild(body);
  if (explainId) b.appendChild(qBtn(explainId, title));
  b.addEventListener('click', onPick);
  return b;
}

// Open a stat or skill card with the 100-square chance grid for this hero.
function explainChance(id, value, color) { explain(id, I.chanceGrid(value, color)); }

function statBars(hero) {
  const box = document.createElement('div'); box.className = 'stats';
  for (const k of P.STATS) {
    const v = hero.stats[k];
    const row = document.createElement('div'); row.className = 'stat'; row.setAttribute('role', 'button'); row.tabIndex = 0;
    row.style.setProperty('--sc', I.STAT_COLOR[k]);
    row.innerHTML = `<span class="stat-ico">${I.icon(I.STAT_ICON[k], 30)}</span>`
      + `<span class="stat-txt"><span class="stat-name">${P.STAT_NAME[k]}</span><span class="stat-word">${I.STAT_WORD[k]}</span></span>`
      + I.meter(v, I.STAT_COLOR[k]);
    row.appendChild(qBtn('stat_' + k, P.STAT_NAME[k], () => explainChance('stat_' + k, v, I.STAT_COLOR[k])));
    row.addEventListener('click', () => explainChance('stat_' + k, v, I.STAT_COLOR[k]));
    box.appendChild(row);
  }
  return box;
}

function skillList(hero) {
  const box = document.createElement('div'); box.className = 'skills';
  for (const k of P.STATS) {
    const grp = document.createElement('div'); grp.className = 'skillgrp';
    grp.style.setProperty('--sc', I.STAT_COLOR[k]);
    grp.innerHTML = `<div class="skillgrp-h">${I.icon(I.STAT_ICON[k], 18)}<span>${P.STAT_NAME[k]}</span></div>`;
    for (const [id, def] of Object.entries(P.SKILLS)) {
      if (def.stat !== k) continue;
      const trained = hero.trained.includes(id), v = P.skill(hero, id);
      const b = document.createElement('button'); b.type = 'button'; b.className = 'skill' + (trained ? ' trained' : '');
      b.innerHTML = `<span class="skill-top"><span class="skill-name">${def.name}</span>${trained ? `<span class="ribbon">${I.icon('star', 12)}Practiced</span>` : ''}</span>${I.meter(v, I.STAT_COLOR[k], 'small')}`;
      b.addEventListener('click', () => explainChance('skill_' + id, v, I.STAT_COLOR[k]));
      grp.appendChild(b);
    }
    box.appendChild(grp);
  }
  return box;
}

// Hearts, clovers, boots and a level star instead of number tiles.
function numberTiles(hero) {
  const box = document.createElement('div'); box.className = 'vitals';
  const row = (id, label, html, cls) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'vital ' + cls; b.dataset.vital = id;
    b.innerHTML = `<span class="vital-name">${label}</span><span class="vital-icons">${html}</span>`;
    b.addEventListener('click', () => explain(id));
    box.appendChild(b);
  };
  const rep = (n, name, size, used = 0) => Array.from({ length: n }, (_, i) => I.icon(name, size, i >= n - used)).join('');
  row('hp', 'Hearts', rep(P.hpMax(hero), 'heart', 18, Math.max(0, P.hpMax(hero) - hero.hp)), 'v-hp');
  row('luck', 'Luck', rep(P.LUCK_MAX, 'clover', 22, P.LUCK_MAX - hero.luck), 'v-luck');
  row('move', 'Steps', rep(P.MOVE, 'boot', 22), 'v-move');
  row('level', 'Level', `${I.icon('star', 26)}<b class="lvl">${hero.level}</b>`, 'v-level');
  return box;
}

function dieBadge(dice) { return dice ? `<span class="die-badge">${esc(dice.replace(/^1/, ''))}</span>` : ''; }

function gearList(hero) {
  const box = document.createElement('div'); box.className = 'chips';
  for (const id of [hero.gear.mainHand, hero.gear.head, hero.gear.back]) {
    if (!id) continue;
    const b = chip(GEAR[id].name, false, () => explain('gear_' + id));
    if (GEAR[id].dice) b.insertAdjacentHTML('beforeend', dieBadge(GEAR[id].dice));
    box.appendChild(b);
  }
  return box;
}

function sheet(hero, box) {
  const h = document.createElement('div'); h.className = 'sheet-h';
  h.innerHTML = `<div class="sheet-name">${esc(hero.name)}</div><div class="sheet-sub">${P.PEOPLE[hero.people].name} kid, best at ${P.BEST_AT[hero.bestAt].name.toLowerCase()}</div>`;
  box.appendChild(h);
  box.appendChild(numberTiles(hero));
  box.insertAdjacentHTML('beforeend', '<h3 class="sub">What you are good at <span class="hint">(more blocks = better)</span></h3>');
  box.appendChild(statBars(hero));
  box.insertAdjacentHTML('beforeend', '<h3 class="sub">Skills <span class="hint">(tap one to see your chances)</span></h3>');
  box.appendChild(skillList(hero));
  box.insertAdjacentHTML('beforeend', '<h3 class="sub">Your stuff</h3>');
  box.appendChild(gearList(hero));
}

// ---------- step renderers ----------
function renderStep() {
  const panel = $('adv-panel'), scr = $('adventure-screen');
  const keep = [panel.scrollTop, scr.scrollTop];
  requestAnimationFrame(() => { panel.scrollTop = keep[0]; scr.scrollTop = keep[1]; });
  panel.innerHTML = '';
  const body = document.createElement('div'); body.className = 'adv-body';
  let canNext = true;

  if (step === -1) {
    const s = save.get();
    say(CH0.title.say);
    panel.innerHTML = `<h2 class="sec">Heroes and Monsters</h2>`;
    if (s && s.hero) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn big-btn'; b.id = 'adv-continue';
      b.textContent = 'Continue as ' + s.hero.name;
      b.addEventListener('click', () => go('sheet'));
      panel.appendChild(b);
      const n = document.createElement('button'); n.type = 'button'; n.className = 'btn'; n.id = 'adv-new';
      n.textContent = 'Make a new hero';
      n.addEventListener('click', () => { if (confirm('Start over with a new hero? Your saved hero will be replaced when you finish.')) go(0); });
      panel.appendChild(n);
    } else {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn big-btn'; b.id = 'adv-start';
      b.textContent = 'Make your hero';
      b.addEventListener('click', () => go(0));
      panel.appendChild(b);
    }
    codeButtons(panel, !!(s && s.hero));
    drawStage();
    return;
  }

  if (step === 'sheet') {
    const s = save.get();
    say(CH0.sheet.say);
    const done1 = s.flags && s.flags.ch1;
    const play = document.createElement('button'); play.type = 'button'; play.className = 'btn big-btn play-btn'; play.id = 'adv-play';
    play.innerHTML = `${I.icon('star', 24)}<span>${done1 ? 'Play again: ' : 'Play '}${esc(chapterTitle('ch1'))}</span>`;
    play.addEventListener('click', () => { stopAnim(); playChapter('ch1'); });
    panel.appendChild(play);
    sheet(s.hero, body);
    panel.appendChild(body);
    codeButtons(panel, true);
    drawStage();
    return;
  }

  const id = STEPS[step], text = CH0[id];
  say(text.say);
  const h = document.createElement('h2'); h.className = 'sec'; h.textContent = text.heading; panel.appendChild(h);
  panel.appendChild(dots());

  if (id === 'people') {
    for (const p of ['human', 'elf', 'dwarf']) {
      body.appendChild(choiceCard({
        on: draft.people === p, title: P.PEOPLE[p].name,
        text: { human: 'Friendly and good with people.', elf: 'Pointed ears and a sharp mind.', dwarf: 'Short, sturdy and stubborn.' }[p],
        extra: bonusLine(Object.keys(P.PEOPLE[p].bonus)[0]),
        pic: miniSprite({ build: 'kid', people: p, skin: draft.skin, hair: draft.hair, hairColor: draft.hairColor, cloth: draft.cloth, layers: { body: 'tunic' } }),
        explainId: 'people_' + p, onPick: () => { draft.people = p; renderStep(); },
      }));
    }
  }

  if (id === 'look') {
    const rows = [
      ['Skin', Object.keys(SKINS), v => cap(v), 'skin', SKINS],
      ['Hair', ['short', 'spiky', 'long', 'ponytail', 'bun', 'curly', 'braids', 'none'], v => HAIR_NAME[v], 'hair'],
      ['Hair color', Object.keys(HAIRS), v => cap(v), 'hairColor', HAIRS],
      ['Clothes color', Object.keys(CLOTH), v => cap(v), 'cloth', CLOTH],
    ];
    for (const [label, vals, name, key, sw] of rows) {
      const row = document.createElement('div'); row.className = 'optrow';
      row.innerHTML = `<span class="lbl">${label}</span>`;
      const chips = document.createElement('div'); chips.className = 'chips';
      for (const v of vals) chips.appendChild(chip(name(v), draft[key] === v, () => { draft[key] = v; renderStep(); }, sw ? swatch(sw[v]) : null));
      row.appendChild(chips); body.appendChild(row);
    }
  }

  if (id === 'name') {
    const inp = document.createElement('input');
    inp.id = 'adv-name'; inp.className = 'name-input'; inp.maxLength = 14; inp.autocomplete = 'off'; inp.autocapitalize = 'words';
    inp.placeholder = text.placeholder; inp.value = draft.name;
    inp.addEventListener('input', () => { draft.name = inp.value; $('adv-next').disabled = !draft.name.trim(); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter' && draft.name.trim()) go(step + 1); });
    body.appendChild(inp);
    const sug = document.createElement('button'); sug.type = 'button'; sug.className = 'btn'; sug.id = 'adv-suggest';
    sug.textContent = 'Give me an idea';
    sug.addEventListener('click', () => { draft.name = pick(NAMES[draft.people]); inp.value = draft.name; $('adv-next').disabled = false; });
    body.appendChild(sug);
    canNext = !!draft.name.trim();
  }

  if (id === 'bestat') {
    for (const k of Object.keys(P.BEST_AT)) {
      const preview = P.makeHero({ ...draft, bestAt: k });
      const card = choiceCard({
        on: draft.bestAt === k, title: P.BEST_AT[k].name,
        text: { brave: 'Strong and steady. Great up close.', sneaky: 'Quick and quiet. Hard to catch.', clever: 'Spots clues and figures things out.' }[k],
        explainId: 'best_' + k, onPick: () => { draft.bestAt = k; if (!draft.weapon) draft.weapon = null; renderStep(); },
      });
      const mini = document.createElement('div'); mini.className = 'ministats';
      mini.innerHTML = P.STATS.map(s => `<span class="ms" title="${P.STAT_NAME[s]}">${I.icon(I.STAT_ICON[s], 16)}${I.meter(preview.stats[s], I.STAT_COLOR[s], 'tiny')}</span>`).join('');
      card.querySelector('.choice-body').appendChild(mini);
      const top = Math.max(...P.STATS.map(s => preview.stats[s]));
      const best = P.STATS.filter(s => P.BEST_AT[k].stats[s] + 5 >= top && preview.stats[s] >= top - 5);
      const tag = document.createElement('div'); tag.className = 'besttag';
      tag.innerHTML = 'Best: ' + best.map(s => `<span style="--sc:${I.STAT_COLOR[s]}">${I.icon(I.STAT_ICON[s], 18)}${P.STAT_NAME[s]}</span>`).join('');
      card.querySelector('.choice-body').insertBefore(tag, mini);
      body.appendChild(card);
    }
    canNext = !!draft.bestAt;
  }

  if (id === 'weapon') {
    const fits = P.BEST_AT[draft.bestAt].weapon;
    if (!draft.weapon) draft.weapon = fits;
    for (const w of P.STARTER_WEAPONS) {
      const spec = P.spriteSpec(draftHero()); spec.layers.mainHand = w;
      body.appendChild(choiceCard({
        on: draft.weapon === w, title: GEAR[w].name, tag: w === fits ? text.fits : '',
        text: { woodsword: 'Hits the hardest. Swing it up close.', stick: 'Light and easy. Swing it up close.', slingshot: 'Hits from far away. Aim carefully.' }[w],
        extra: weaponLine(w),
        pic: miniSprite(spec), explainId: 'gear_' + w, onPick: () => { draft.weapon = w; renderStep(); },
      }));
    }
  }

  if (id === 'review') {
    sheet(draftHero(), body);
  }

  panel.appendChild(body);

  const nav = document.createElement('div'); nav.className = 'row two adv-nav';
  const back = document.createElement('button'); back.type = 'button'; back.className = 'btn'; back.id = 'adv-back'; back.textContent = 'Back';
  back.addEventListener('click', () => go(step === 0 ? -1 : step - 1));
  const next = document.createElement('button'); next.type = 'button'; next.className = 'btn big-btn'; next.id = 'adv-next';
  next.textContent = id === 'review' ? text.begin : 'Next';
  next.disabled = !canNext;
  next.addEventListener('click', () => {
    if (id === 'review') { save.startNew(draftHero()); toast('Saved! Welcome to Millbrook, ' + draftHero().name + '.'); go('sheet'); stopAnim(); playChapter('ch1'); }
    else go(step + 1);
  });
  nav.appendChild(back); nav.appendChild(next);
  panel.appendChild(nav);
  drawStage();
}

function dots() {
  const d = document.createElement('div'); d.className = 'dots';
  STEPS.forEach((s, i) => { const x = document.createElement('span'); x.className = 'dot' + (i === step ? ' on' : i < step ? ' done' : ''); d.appendChild(x); });
  return d;
}

function codeButtons(panel, hasSave) {
  const row = document.createElement('div'); row.className = 'row two codebtns';
  if (hasSave) {
    const ex = document.createElement('button'); ex.type = 'button'; ex.className = 'btn small'; ex.id = 'adv-export';
    ex.textContent = 'Copy save code';
    ex.addEventListener('click', () => openCode('export'));
    row.appendChild(ex);
  }
  const im = document.createElement('button'); im.type = 'button'; im.className = 'btn small'; im.id = 'adv-import';
  im.textContent = 'Load a save code';
  im.addEventListener('click', () => openCode('import'));
  row.appendChild(im);
  panel.appendChild(row);
}

function openCode(mode) {
  const w = $('codebox'), ta = $('code-text');
  $('code-title').textContent = mode === 'export' ? 'Your save code' : 'Load a save code';
  $('code-help').textContent = mode === 'export'
    ? 'Copy this and keep it somewhere safe, like a note on your phone. It brings your hero back if the game is ever cleared.'
    : 'Paste a save code here. It will replace the hero saved on this device.';
  ta.value = mode === 'export' ? save.exportCode() : '';
  ta.readOnly = mode === 'export';
  $('code-go').textContent = mode === 'export' ? 'Copy' : 'Load';
  $('code-go').onclick = async () => {
    if (mode === 'export') {
      try { await navigator.clipboard.writeText(ta.value); toast('Copied!'); } catch (e) { ta.select(); toast('Select the code and copy it.'); }
    } else {
      try { save.importCode(ta.value); w.classList.add('hidden'); toast('Hero loaded!'); go('sheet'); }
      catch (e) { toast(e.message || 'That code did not work.'); }
    }
  };
  w.classList.remove('hidden');
  if (mode === 'export') { ta.focus(); ta.select(); } else ta.focus();
}

function go(to) {
  step = to;
  renderStep();
  requestAnimationFrame(() => requestAnimationFrame(() => { $('adv-panel').scrollTop = 0; $('adventure-screen').scrollTop = 0; }));
}

export function init(helpers) {
  explain = helpers.explain; toast = helpers.toast;
  if (helpers.playChapter) playChapter = helpers.playChapter;
  if (helpers.chapterTitle) chapterTitle = helpers.chapterTitle;
  save.read();
  $('code-close').addEventListener('click', () => $('codebox').classList.add('hidden'));
  go(-1);
}
export function startAnim() { stopAnim(); timer = setInterval(() => { frame ^= 1; drawStage(); }, 480); }
export function stopAnim() { clearInterval(timer); timer = 0; }
export function getDraft() { return draft; }
export function getStep() { return step; }

export default { init, startAnim, stopAnim, getDraft, getStep, go };
