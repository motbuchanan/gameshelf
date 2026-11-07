// Story scenes: one line at a time with the speaker's picture, choices, skill checks, fights,
// picking a team, the town, level ups, and the chapter end.
//
// Scene fields (all optional except what a scene needs):
//   lines: [{ who, text, if, ifNot }]        who: 'narrator', 'hero', or a CAST id
//   set: { flag: value }                     story flags, kept for the rest of the game (s.flags.story)
//   join: 'sniffle' | [...]                  friends who join the party
//   give: { gear, coins, spell, talent }     gear goes on right away (old item goes in the bag)
//   hurt: n / heal: true                     hearts lost (never below 1) / all hearts back
//   check: { skill, help, label, great, ok, miss, set: { great: {...}, ... } }   a d100 roll in the tray
//   choices: [{ label, go, set, if, ifNot, retry }]
//   pickTeam: { size, exclude }              pick who comes along (hero + size friends)
//   hub: { people: [{ id, go, label, if }], shop: true, doneLabel, done }   the town
//   levelUp: true | 'stat'                   'stat' lets the player pick which stat grows
//   nextIf: [{ if, go }], next               where to go after
// Fight scenes are 'fight' (the chapter's main fight) or 'fight:name'. A fight's def.then maps win/lose/tie to scenes.
// Conditions (if / ifNot) are a flag name, 'party:id', 'bestAt:clever', or a list (all must hold).
import S from './sprites.js';
import I from './icons.js';
import P from './party.js';
import R from './rules.js';
import dice from './dice.js';
import save from './save.js';
import board from './board.js';
import { CAST, GEAR } from './art.js';
import { ROSTER, SPARK, PATCH, START_PARTY } from './roster.js';
import { int as rint } from './rng.js';
import CH1 from './ch1.js';
import CH2 from './ch2.js';
import CH3 from './ch3.js';
import CH4 from './ch4.js';
import CH5 from './ch5.js';
import CH6 from './ch6.js';
import CH7 from './ch7.js';
import CH8 from './ch8.js';
import CH9 from './ch9.js';
import CH10 from './ch10.js';
import C from './combat.js';
import book from './book.js';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let H = { setAdvView() {}, toast() {}, lock() {}, unlock() {} };
export function init(helpers) { H = { ...H, ...helpers }; }
let fast = false;
export function setFast(v) { fast = !!v; }

// Each chapter: its scenes, its fights, and the words the fights use.
const CHAPTERS = {
  ch1: { title: 'Chapter 1: Heroes and Monsters', scenes: CH1.CH1_SCENES, fights: { main: CH1.CH1_FIGHT }, texts: CH1, next: 'ch2' },
  ch2: { title: 'Chapter 2: Not Pretend Anymore', scenes: CH2.CH2_SCENES, fights: { main: CH2.CH2_FIGHT }, texts: CH2, next: 'ch3' },
  ch3: { title: 'Chapter 3: The Trail', scenes: CH3.SCENES, fights: CH3.FIGHTS, texts: CH3.TEXT, next: 'ch4' },
  ch4: { title: 'Chapter 4: The Warren', scenes: CH4.SCENES, fights: CH4.FIGHTS, texts: CH4.TEXT, next: 'ch5' },
  ch5: { title: 'Chapter 5: The Gnoll\'s Camp', scenes: CH5.SCENES, fights: CH5.FIGHTS, texts: CH5.TEXT, next: 'ch6' },
  ch6: { title: 'Chapter 6: Home Again', scenes: CH6.SCENES, fights: {}, texts: CH6.TEXT, next: 'ch7' },
  ch7: { title: 'Chapter 7: The Wide World', scenes: CH7.SCENES, fights: CH7.FIGHTS, texts: CH7.TEXT, next: 'ch8' },
  ch8: { title: 'Chapter 8: Riverbend', scenes: CH8.SCENES, fights: CH8.FIGHTS, texts: CH8.TEXT, next: 'ch9' },
  ch9: { title: 'Chapter 9: The Old Tower', scenes: CH9.SCENES, fights: CH9.FIGHTS, texts: CH9.TEXT, next: 'ch10' },
  ch10: { title: 'Chapter 10: Bramble', scenes: CH10.SCENES, fights: CH10.FIGHTS, texts: CH10.TEXT, next: null },
};
export const hasChapter = id => !!CHAPTERS[id];
export function chapterTitle(chId) { return CHAPTERS[chId] ? CHAPTERS[chId].title : ''; }
const clone = o => JSON.parse(JSON.stringify(o));
const chapterNum = id => parseInt(String(id).replace(/\D/g, ''), 10) || 1;
export const HELP_BONUS = 10;

let ch = null, hero = null, frame = 0, timer = 0, speaker = null;

// ---------- flags, party, conditions ----------
function sv() { return save.get(); }
export function storyFlags() {
  const s = sv(); if (!s) return {};
  s.flags = s.flags || {};
  if (!s.flags.story) s.flags.story = { ...(s.flags.ch2story || {}) };   // older saves kept Chapter 2's flags separately
  return s.flags.story;
}
function setFlags(obj) {
  if (!obj) return;
  const s = sv(); if (!s) return;
  Object.assign(storyFlags(), obj);
  if (ch) s.flags[ch.id + 'story'] = { ...(s.flags[ch.id + 'story'] || {}), ...obj };
  save.write();
}
export function party() {
  const s = sv(); if (!s) return START_PARTY.slice();
  if (!Array.isArray(s.party)) s.party = START_PARTY.slice();
  return s.party;
}
function join(ids) {
  const p = party();
  [].concat(ids).forEach(id => { if (!p.includes(id)) p.push(id); book.meet(id); });
  save.write();
}
function test1(c) {
  if (c.startsWith('party:')) return party().includes(c.slice(6));
  if (c.startsWith('item:')) { const it = (sv() && sv().hero && sv().hero.items) || {}; return (it[c.slice(5)] || 0) > 0; }
  if (c.startsWith('bestAt:')) return hero && hero.bestAt === c.slice(7);
  if (c.startsWith('!')) return !test1(c.slice(1));
  return !!storyFlags()[c];
}
export function cond(o) {
  if (!o) return true;
  if (o.if && ![].concat(o.if).every(test1)) return false;
  if (o.ifNot && [].concat(o.ifNot).some(test1)) return false;
  return true;
}

// ---------- faces ----------
function specFor(who) {
  if (who === 'hero') return P.spriteSpec(hero);
  const c = CAST.find(k => k.id === who);
  return c ? c.spec : null;
}
function nameFor(who) {
  if (who === 'hero') return hero.name;
  const c = CAST.find(k => k.id === who);
  return c ? c.name.split(' ')[0] : '';
}
const fill = t => String(t).replace(/\{name\}/g, hero.name);

// The narrator gets a little woods scene with the party in it instead of one face.
function drawScene(c) {
  const K = '#1a120c';
  c.fillStyle = '#4f8a3c'; c.fillRect(0, 0, 128, 80);
  for (let i = 0; i < 60; i++) { c.fillStyle = i % 2 ? '#5f9a48' : '#437a33'; c.fillRect((i * 37) % 128, 30 + (i * 23) % 50, 1, 1); }
  c.fillStyle = '#2d5a3a'; c.fillRect(0, 0, 128, 26);
  for (let x = -6; x < 128; x += 18) {
    const h = 8 + ((x * 7) & 7);
    c.fillStyle = K; c.fillRect(x + 6, 14 + h - 8, 4, 14);
    c.fillStyle = '#6b4226'; c.fillRect(x + 7, 14 + h - 8, 2, 14);
    c.fillStyle = K; c.fillRect(x, h - 8, 16, 16);
    c.fillStyle = '#245a26'; c.fillRect(x + 1, h - 7, 14, 14);
    c.fillStyle = '#3a7a34'; c.fillRect(x + 3, h - 5, 4, 3);
  }
  const who = (ch && ch.sceneKids) || party().slice(0, 3);
  const kids = [hero && P.spriteSpec(hero), ...who.map(specFor)].filter(Boolean).slice(0, 4);
  kids.forEach((sp, i) => S.draw(c, sp, 6 + i * 30, 36, 1, (frame + i) % 2));
}
function drawFace() {
  const cv = $('story-face'); if (!cv) return;
  const spec = speaker && specFor(speaker);
  const w = spec ? 32 : 128, h = spec ? 40 : 80;
  if (cv.width !== w) { cv.width = w; cv.height = h; }
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.clearRect(0, 0, w, h);
  if (spec) S.draw(c, spec, 0, 0, 1, frame); else drawScene(c);
  $('story-stage').classList.toggle('narrator', !spec);
}

function showLine(line) {
  speaker = line.who === 'narrator' || !line.who ? null : line.who;
  $('story-name').textContent = speaker ? nameFor(speaker) : 'The story';
  $('story-say').textContent = fill(line.text);
  drawFace();
}

function button(id, label, big, onClick) {
  const b = document.createElement('button'); b.type = 'button'; b.id = id;
  b.className = 'btn' + (big ? ' big-btn' : ''); b.textContent = label;
  b.addEventListener('click', onClick, { once: true });
  return b;
}
const tapNext = (label = 'Next') => new Promise(res => { const act = $('story-act'); act.innerHTML = ''; act.appendChild(button('story-next', label, true, res)); });

// ---------- scene effects ----------
function giveGear(id) {
  const s = sv(); const h = s.hero; const g = GEAR[id]; if (!g) return;
  h.bag = h.bag || [];
  const old = h.gear[g.slot];
  if (old && old !== id && !h.bag.includes(old)) h.bag.push(old);
  if (!h.bag.includes(id)) h.bag.push(id);
  h.gear[g.slot] = id;
}
function applyEffects(sc) {
  const s = sv(); if (!s) return;
  setFlags(sc.set);
  if (sc.join) join(sc.join);
  if (sc.give) {
    const g = sc.give;
    if (g.gear) [].concat(g.gear).forEach(giveGear);
    if (g.gearBy) { const id = g.gearBy[s.hero.bestAt]; if (id) giveGear(id); }
    if (g.coins) s.coins = (s.coins || 0) + g.coins;
    if (g.spell) { s.hero.spells = s.hero.spells || []; if (!s.hero.spells.includes(g.spell)) s.hero.spells.push(g.spell); }
    if (g.talent) { s.hero.talents = s.hero.talents || []; if (!s.hero.talents.includes(g.talent)) s.hero.talents.push(g.talent); }
    if (g.items) { s.hero.items = s.hero.items || {}; for (const k in g.items) s.hero.items[k] = (s.hero.items[k] || 0) + g.items[k]; }
  }
  if (sc.use) { s.hero.items = s.hero.items || {}; [].concat(sc.use).forEach(k => { s.hero.items[k] = Math.max(0, (s.hero.items[k] || 0) - 1); }); }
  if (sc.hurt) s.hero.hp = Math.max(1, (s.hero.hp || P.hpMax(s.hero)) - sc.hurt);
  if (sc.heal) { s.hero.hp = P.hpMax(s.hero); s.hero.luck = P.LUCK_MAX; }
  if (sc.meet) [].concat(sc.meet).forEach(id => book.meet(id));
  hero = s.hero;
  save.write();
}

// ---------- scenes ----------
async function playScene(id) {
  if (id === 'fight' || String(id).startsWith('fight:')) return fight(id === 'fight' ? 'main' : id.slice(6));
  let sc = ch.scenes[id];
  if (!sc) throw new Error('missing scene ' + id);
  // random: pick one of several scenes (riddles change each time you play)
  if (sc.random) return playScene(sc.random[rint(0, sc.random.length - 1)]);
  if (sc.end) return chapterEnd(sc);
  applyEffects(sc);
  if (sc.hurt) H.toast(`Ouch! You lose ${sc.hurt === 1 ? 'a heart' : sc.hurt + ' hearts'}.`);
  const act = $('story-act');
  const lines = (sc.lines || []).filter(cond);
  const waitsAfter = sc.choices || sc.check || sc.pickTeam || sc.hub || sc.trailmap;
  for (let i = 0; i < lines.length; i++) {
    showLine(lines[i]);
    const last = i === lines.length - 1;
    if (last && waitsAfter) break;
    act.innerHTML = '';
    await new Promise(res => act.appendChild(button('story-next', 'Next', true, res)));
  }
  if (sc.check) return playScene(await runCheck(sc.check));
  if (sc.choices) {
    act.innerHTML = '';
    const shown = sc.choices.filter(cond);
    const pick = await new Promise(res => shown.forEach((c, k) => act.appendChild(button('story-choice-' + k, fill(c.label), k === 0, () => res(c)))));
    setFlags(pick.set);
    if (pick.retry) ch.retry = true;
    return playScene(pick.go);
  }
  if (sc.pickTeam) await pickTeam(sc.pickTeam);
  if (sc.hub) return playScene(await hub(sc.hub, id));
  if (sc.trailmap) return playScene(await trailMap(sc.trailmap));
  if (sc.levelUp) await levelUpScreen(sc.levelUp, sc.talentLine);
  const nx = (sc.nextIf || []).find(cond);
  return playScene(nx ? nx.go : sc.next);
}

// ---------- skill checks ----------
// Roll the 100 dice against a skill. A friend who helps adds 10 squares. Luck can reroll a miss.
async function runCheck(chk) {
  const s = sv(); const h = s.hero;
  const helper = chk.help && party().includes(chk.help) ? chk.help : null;
  const sk = P.SKILLS[chk.skill], stat = sk.stat, base = P.skill(h, chk.skill);
  const flagBonus = Object.entries(chk.bonusIf || {}).filter(([f]) => test1(f)).reduce((a, [, v]) => a + v, 0);
  const value = R.clampSkill(base + (helper ? HELP_BONUS : 0) + (chk.bonus || 0) + flagBonus);
  speaker = 'hero'; drawFace();
  $('story-name').textContent = '';
  $('story-say').innerHTML = `<div class="chk"><div class="chk-h">${esc(fill(chk.label))}</div>
    <div class="chk-row" style="--sc:${I.STAT_COLOR[stat]}">${I.icon(I.STAT_ICON[stat], 22)}<b>${esc(sk.name)}</b>${I.meter(base, I.STAT_COLOR[stat], 'small')}</div>
    ${chk.bonus ? `<div class="chk-row help">${I.icon('clover', 18)}<b>${esc(chk.bonusWhy || 'A little extra help!')}</b></div>` : ''}
    ${helper ? `<div class="chk-row help">${I.icon('star', 18)}<b>${esc(nameFor(helper))} helps!</b><span>Friends who help give you more colored squares.</span></div>` : ''}</div>`;
  const act = $('story-act'); act.innerHTML = '';
  await new Promise(res => act.appendChild(button('chk-roll', 'Roll!', true, res)));
  act.innerHTML = '';
  let roll = await checkPop(chk, value, h);
  const tier = R.tierFor(value, roll.value);
  const band = tier === 'legendary' || tier === 'exceptional' ? 'great' : tier === 'success' ? 'ok' : 'miss';
  if (chk.set && chk.set[band]) setFlags(chk.set[band]);
  return chk[band] || chk.ok || chk.miss;
}
async function checkPop(chk, value, h) {
  let roll = R.rollD100();
  const pop = $('sdice-pop');
  pop.classList.remove('hidden');
  dice.mount($('sdice'));
  const z = R.zones(value);
  let cells = '';
  for (let n = 1; n <= 100; n++) cells += `<i data-n="${n}" style="background:${I.TIER_COLOR[I.tierAt(n, z)]}"></i>`;
  $('sresult').innerHTML = `<div class="br-title">${esc(fill(chk.label))}</div>
    <div class="br-body"><div class="chance-grid small" id="sr-grid">${cells}</div>
    <div class="br-side"><div class="br-tier" id="sr-tier">Rolling...</div><div class="br-need">Colored squares work: <b>${value}</b> of 100</div></div></div>
    <div id="sr-btn"></div>`;
  await new Promise(r => requestAnimationFrame(r));
  await dice.roll(roll);
  const tier = R.tierFor(value, roll.value);
  const cell = $('sr-grid').querySelector(`[data-n="${roll.value}"]`); if (cell) cell.classList.add('hit');
  $('sr-tier').textContent = roll.value + '! ' + I.TIER_WORD[tier];
  $('sr-tier').style.color = tier === 'fail' ? '#c9b48e' : I.TIER_COLOR[tier];
  const miss = tier === 'fail' || tier === 'disaster';
  const again = await new Promise(res => {
    const clovers = Array.from({ length: P.LUCK_MAX }, (_, i) => I.icon('clover', 18, i >= h.luck)).join('');
    $('sr-btn').innerHTML = miss && h.luck > 0
      ? `<div class="row two"><button id="s-ok" class="btn" type="button">Keep it</button><button id="s-luck" class="btn big-btn" type="button">${I.icon('clover', 22)} Roll again</button></div><div class="br-clovers">${clovers}</div>`
      : '<button id="s-ok" class="btn big-btn" type="button">OK</button>';
    $('s-ok').addEventListener('click', () => res(false), { once: true });
    if ($('s-luck')) $('s-luck').addEventListener('click', () => res(true), { once: true });
  });
  if (again) { h.luck--; save.write(); pop.classList.add('hidden'); return checkPop({ ...chk, label: chk.label + ' (Luck!)' }, value, h); }
  pop.classList.add('hidden');
  return roll;
}

// ---------- fights ----------
// Fill a fight's team spots from the party (or the picked team), drop units and events whose conditions fail.
function buildFight(name) {
  const d = clone(ch.fights[name]);
  const f = storyFlags();
  d.units = (d.units || []).filter(cond);
  if (d.team) {
    const ids = (d.team.from === 'picked' && Array.isArray(f.team) ? f.team : party()).filter(id => !(d.team.exclude || []).includes(id)).slice(0, d.team.spots.length);
    ids.forEach((id, i) => {
      const r = clone(ROSTER[id] || {}), spot = d.team.spots[i];
      if (id === 'pim' && f.spark) { r.trick = null; r.tricks = f.patch ? [SPARK, PATCH] : [SPARK]; }
      const unit = { id, side: 'hero', ai: 'friend', ...r, x: spot.x, y: spot.y };
      if (r.monster) unit.id = id;
      d.units.push(unit);
    });
  }
  d.events = (d.events || []).filter(cond);
  if (d.cage && d.team) {
    const team = d.units.filter(u => u.side === 'hero' && u.ai === 'friend' && !u.bystander).map(u => u.id);
    if (!team.includes(d.cage.opener)) d.cage.opener = team[0];
  }
  if (d.surpriseIf) d.surprise = [].concat(d.surpriseIf).some(test1);
  if (d.warnIf) d.warn = test1(d.warnIf);
  if (d.fireIf) d.fireScares = test1(d.fireIf);
  if (d.calm && d.calm.startIf) d.calm.start = Object.entries(d.calm.startIf).filter(([k]) => test1(k)).reduce((a, [, v]) => a + v, 0);
  if (d.calm && d.calm.bonusIf) d.calm.bonus = Object.entries(d.calm.bonusIf).filter(([k]) => test1(k)).reduce((a, [, v]) => a + v, 0);
  return d;
}
async function fight(name) {
  stopAnim();
  // "Try the fight again" puts the hero back exactly as they were when the fight began.
  if (ch.retry && ch.snapshot) Object.assign(hero, clone(ch.snapshot));
  else ch.snapshot = clone(hero);
  ch.retry = false;
  const def = buildFight(name);
  const fresh = (def.meets || []).filter(id => book.meet(id));
  H.setAdvView('battle-screen');
  const result = await board.start(def, ch.texts, hero);
  if (fresh.length) H.toast('New in the Big Book: ' + fresh.map(id => (CAST.find(c => c.id === id) || {}).name).join(', ') + '!');
  ch.result = result;
  if (def.mode === 'hp') {
    const me = C.unitById(board.state(), 'hero');
    hero.hp = Math.max(1, me.flags);
  }
  const s = sv(); if (s) { s.flags = s.flags || {}; s.flags[ch.id + '_' + name] = result; }
  save.write();
  H.setAdvView('story-screen');
  startAnim();
  return playScene((def.then && def.then[result]) || result);
}

// ---------- the trail map ----------
// A parchment map of places joined by dotted paths. Tap a place you can reach to go there.
async function trailMap(m) {
  speaker = null; drawFace();
  $('story-name').textContent = m.title || 'The map';
  const nodes = m.nodes.filter(cond);
  const at = nodes.find(n => n.id === m.here) || null;
  const lines = (m.paths || []).map(([a, c]) => { const p = m.nodes.find(n => n.id === a), q = m.nodes.find(n => n.id === c); return p && q ? `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>` : ''; }).join('');
  $('story-say').innerHTML = `<div class="tmap"><p>${esc(fill(m.text || 'Where to next?'))}</p>
    <div class="tmap-box"><svg viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
    ${m.nodes.map(n => { const ok = nodes.includes(n) && n.go; return `<button type="button" id="map-${n.id}" class="tmap-node${n.id === m.here ? ' here' : ''}${ok ? ' go' : ''}" style="left:${n.x}%;top:${n.y / 60 * 100}%" ${ok ? '' : 'aria-disabled="true" tabindex="-1"'}><span class="tmap-dot">${I.icon(n.icon || (n.id === m.here ? 'star' : 'boot'), 18)}</span><span class="tmap-label">${esc(n.label)}</span></button>`; }).join('')}
    </div></div>`;
  $('story-act').innerHTML = '';
  void at;
  return new Promise(res => nodes.filter(n => n.go).forEach(n => $('map-' + n.id).addEventListener('click', () => { setFlags(n.set); res(n.go); }, { once: true })));
}

// ---------- pick your team ----------
async function pickTeam(opts) {
  const size = opts.size || 3;
  const pool = party().filter(id => !(opts.exclude || []).includes(id));
  const picked = (storyFlags().team || []).filter(id => pool.includes(id)).slice(0, size);
  while (picked.length < Math.min(size, pool.length)) { const n = pool.find(id => !picked.includes(id)); picked.push(n); }
  speaker = null; drawFace();
  $('story-name').textContent = '';
  const act = $('story-act');
  await new Promise(res => {
    const render = () => {
      $('story-say').innerHTML = `<div class="team"><div class="chk-h">Pick your team</div><p>Who comes with you? Pick ${size}. The others help from outside.</p><div class="team-grid" id="team-grid"></div></div>`;
      const grid = $('team-grid');
      pool.forEach(id => {
        const on = picked.includes(id);
        const b = document.createElement('button'); b.type = 'button'; b.id = 'team-' + id;
        b.className = 'team-kid' + (on ? ' on' : '');
        const cv = document.createElement('canvas'); cv.width = 32; cv.height = 40;
        S.draw(cv.getContext('2d'), specFor(id), 0, 0, 1, 0);
        b.appendChild(cv);
        b.insertAdjacentHTML('beforeend', `<span>${esc(nameFor(id))}</span>${on ? `<i>${I.icon('star', 16)}</i>` : ''}`);
        b.addEventListener('click', () => {
          const k = picked.indexOf(id);
          if (k >= 0) picked.splice(k, 1); else { if (picked.length >= size) picked.shift(); picked.push(id); }
          render();
        });
        grid.appendChild(b);
      });
      act.innerHTML = '';
      const go = button('team-go', picked.length === Math.min(size, pool.length) ? 'This is my team!' : `Pick ${Math.min(size, pool.length) - picked.length} more`, true, () => {
        if (picked.length === Math.min(size, pool.length)) res(); else render();
      });
      act.appendChild(go);
    };
    render();
  });
  setFlags({ team: picked.slice(), stayed: pool.filter(id => !picked.includes(id)) });
  ch.sceneKids = picked.slice();
}

// ---------- the town ----------
async function hub(h, hubId) {
  ch.hubSeen = ch.hubSeen || new Set();
  const s = sv();
  speaker = null; drawFace();
  $('story-name').textContent = 'Millbrook';
  $('story-say').innerHTML = `<div class="hub"><p>${esc(fill(h.text || 'Where do you want to go?'))}</p><div class="hub-coins">${I.icon('coin', 22)} <b id="hub-coins">${s.coins || 0}</b> coins</div><div class="hub-grid" id="hub-grid"></div></div>`;
  const grid = $('hub-grid');
  return new Promise(res => {
    h.people.filter(cond).forEach(p => {
      const b = document.createElement('button'); b.type = 'button'; b.id = 'hub-' + p.id;
      const seen = storyFlags()['seen_' + p.id];
      b.className = 'hub-kid' + (seen ? ' seen' : '');
      const cv = document.createElement('canvas'); cv.width = 32; cv.height = 40;
      S.draw(cv.getContext('2d'), specFor(p.who || p.id), 0, 0, 1, 0);
      b.appendChild(cv);
      b.insertAdjacentHTML('beforeend', `<span>${esc(p.label)}</span>${seen ? `<i>${I.icon('star', 14)}</i>` : ''}`);
      b.addEventListener('click', () => { setFlags({ ['seen_' + p.id]: true }); res(p.go); }, { once: true });
      grid.appendChild(b);
    });
    const act = $('story-act'); act.innerHTML = '';
    if (h.shop) act.appendChild(button('hub-shop', h.shopLabel || 'Shop at the smithy', false, async () => { await shop(h.shop === true ? null : h.shop); res(hubId); }));
    act.appendChild(button('hub-done', h.doneLabel || 'Done in town', true, () => res(h.done)));
  });
}

// The smithy: buy real gear with goblin-junk coins. Gear you own can be worn again any time.
export const SHOP = [
  { id: 'steelsword', price: 10 }, { id: 'shortbow', price: 10 }, { id: 'buckler', price: 6 },
  { id: 'ironcap', price: 6 }, { id: 'padded', price: 5 }, { id: 'cape', price: 3 },
];
// Bag items (not gear): bought by count, used in the story or in fights.
export const ITEMS = { rope: { name: 'Rope', what: 'Climb and cross things' }, lantern: { name: 'Lantern', what: 'Light in the dark' }, potion: { name: 'Healing potion', what: 'Drink in a fight: hearts back' } };
async function shop(opts) {
  const s = sv(); const h = s.hero; h.bag = h.bag || []; h.items = h.items || {};
  const stock = (opts && opts.stock) || SHOP;
  speaker = (opts && opts.who) || 'smith'; drawFace();
  $('story-name').textContent = (opts && opts.name) || 'Brenna';
  const act = $('story-act');
  await new Promise(res => {
    const render = () => {
      const itemRows = stock.filter(it => ITEMS[it.id]).map(it => `<div class="shop-row"><canvas width="32" height="40" data-g=""></canvas><b>${esc(ITEMS[it.id].name)}${h.items[it.id] ? ' (' + h.items[it.id] + ')' : ''}</b><span>${esc(ITEMS[it.id].what)}</span><button class="btn small${(s.coins || 0) >= it.price ? '' : ' off'}" id="shop-buy-${it.id}" type="button">${I.icon('coin', 14)} ${it.price}</button></div>`).join('');
      const rows = stock.filter(it => GEAR[it.id]).map(it => {
        const g = GEAR[it.id], own = h.bag.includes(it.id) || Object.values(h.gear).includes(it.id), wearing = h.gear[g.slot] === it.id;
        const what = g.dice ? `${I.icon('die', 16)} ${g.dice}` : ({ buckler: 'Armor', ironcap: 'Armor', padded: 'Armor', cape: 'Looks great' }[it.id] || '');
        const btn = wearing ? '<span class="shop-on">Wearing</span>' : own ? `<button class="btn small" id="shop-wear-${it.id}" type="button">Wear</button>`
          : `<button class="btn small${(s.coins || 0) >= it.price ? '' : ' off'}" id="shop-buy-${it.id}" type="button">${I.icon('coin', 14)} ${it.price}</button>`;
        return `<div class="shop-row"><canvas width="32" height="40" data-g="${it.id}"></canvas><b>${esc(g.name)}</b><span>${what}</span>${btn}</div>`;
      }).join('');
      const bagRows = h.bag.filter(id => !stock.some(it => it.id === id) && GEAR[id] && h.gear[GEAR[id].slot] !== id)
        .map(id => `<div class="shop-row"><canvas width="32" height="40" data-g="${id}"></canvas><b>${esc(GEAR[id].name)}</b><span>In your bag</span><button class="btn small" id="shop-wear-${id}" type="button">Wear</button></div>`).join('');
      $('story-say').innerHTML = `<div class="shop"><p>${esc((opts && opts.say) || '"Real gear for real heroes. Goblin junk pays for it!"')}</p><div class="hub-coins">${I.icon('coin', 22)} <b>${s.coins || 0}</b> coins</div>${itemRows}${rows}${bagRows}</div>`;
      $('story-say').querySelectorAll('canvas[data-g]').forEach(cv => {
        if (!cv.dataset.g) { cv.remove(); return; }
        const g = GEAR[cv.dataset.g];
        const spec = { ...P.spriteSpec(h), layers: { ...P.spriteSpec(h).layers, [g.slot]: cv.dataset.g } };
        S.draw(cv.getContext('2d'), spec, 0, 0, 1, 0);
      });
      stock.concat(h.bag.map(id => ({ id }))).forEach(it => {
        const buy = $('shop-buy-' + it.id), wear = $('shop-wear-' + it.id);
        if (buy) buy.addEventListener('click', () => {
          if ((s.coins || 0) < it.price) { H.toast('Not enough coins yet.'); return; }
          s.coins -= it.price;
          if (ITEMS[it.id]) { h.items[it.id] = (h.items[it.id] || 0) + 1; H.toast(ITEMS[it.id].name + ' goes in your bag!'); }
          else { giveGear(it.id); H.toast(GEAR[it.id].name + ' is yours!'); }
          save.write(); hero = h; render();
        });
        if (wear) wear.addEventListener('click', () => { giveGear(it.id); save.write(); hero = h; render(); });
      });
      act.innerHTML = '';
      act.appendChild(button('shop-done', 'Back to town', true, res));
    };
    render();
  });
}

// ---------- level up ----------
// Show what grew, then pick one new practiced skill (and at level 5, which stat grows).
async function levelUpScreen(kind, talentLine) {
  const s = sv(); if (!s || !s.hero) return;
  const h = s.hero;
  if ((s.flags || {})[ch.id + 'level']) return;          // only once per chapter, even on replays
  const next = (h.level || 1) + 1;
  let stat = P.BEST_STAT[h.bestAt];
  const act = $('story-act');
  speaker = 'hero'; drawFace();
  $('story-name').textContent = '';
  if (kind === 'stat') {
    $('story-say').innerHTML = `<div class="lvl"><div class="end-title">${I.icon('star', 32)}<span>Level ${next}!</span>${I.icon('star', 32)}</div>
      <p>This time YOU choose what grows. Pick one:</p></div>`;
    act.innerHTML = '';
    stat = await new Promise(res => P.STATS.forEach((st, k) => {
      const b = button('lvl-stat-' + k, P.STAT_NAME[st] + ': ' + I.STAT_WORD[st], false, () => res(st));
      b.classList.add('lvl-skill'); b.style.setProperty('--sc', I.STAT_COLOR[st]);
      b.insertAdjacentHTML('afterbegin', I.icon(I.STAT_ICON[st], 22));
      act.appendChild(b);
    }));
  }
  const choices = P.levelSkillChoices(h);
  $('story-say').innerHTML = `<div class="lvl"><div class="end-title">${I.icon('star', 32)}<span>Level ${next}!</span>${I.icon('star', 32)}</div>
    <p>Every adventure teaches you something. ${esc(hero.name)} grew:</p>
    <div class="lvl-row">${I.icon('heart', 22)}<b>2 more hearts</b><span>Tougher from all that running and bonking.</span></div>
    <div class="lvl-row" style="--sc:${I.STAT_COLOR[stat]}">${I.icon(I.STAT_ICON[stat], 22)}<b>${P.STAT_NAME[stat]} grows</b>${I.meter(h.stats[stat], I.STAT_COLOR[stat], 'small')}<span class="lvl-arrow">to</span>${I.meter(h.stats[stat] + P.LEVEL_STAT_GAIN, I.STAT_COLOR[stat], 'small')}</div>
    ${talentLine ? `<div class="lvl-row">${I.icon('die', 22)}<b>${esc(talentLine)}</b></div>` : ''}
    <div class="lvl-row">${I.icon('clover', 22)}<b>Luck and hearts refill</b></div>
    <p class="lvl-pick">Now pick one new skill to practice. It gets a gold PRACTICED ribbon.</p></div>`;
  act.innerHTML = '';
  const pick = await new Promise(res => choices.forEach((id, k) => {
    const sk = P.SKILLS[id], b = button('lvl-skill-' + k, sk.name, false, () => res(id));
    b.classList.add('lvl-skill'); b.style.setProperty('--sc', I.STAT_COLOR[sk.stat]);
    b.insertAdjacentHTML('afterbegin', I.icon(I.STAT_ICON[sk.stat], 22));
    act.appendChild(b);
  }));
  P.levelUp(h, pick, kind === 'stat' ? stat : null);
  s.flags = s.flags || {}; s.flags[ch.id + 'level'] = true;
  save.write();
  hero = h;
  H.toast(`Level ${h.level}! ${P.SKILLS[pick].name} is now practiced.`);
}

// ---------- chapter end ----------
function chapterEnd(sc) {
  const s = sv();
  if (s) {
    s.flags = s.flags || {};
    s.flags[ch.id] = ch.result || 'done';
    if (ch.next && chapterNum(s.chapter || 'ch1') <= chapterNum(ch.id)) s.chapter = ch.next;
    if (sc.book) s.flags['book' + sc.book] = true;
    if (s.hero && chapterNum(ch.id) >= 2) { s.hero.hp = P.hpMax(s.hero); s.hero.luck = P.LUCK_MAX; }  // chapter end = rest
    save.write();
  }
  speaker = null; drawFace();
  $('story-name').textContent = '';
  const portraits = sc.party ? `<div class="end-party" id="end-party">${['hero', ...party(), ...(sc.extraFaces || [])].map(id => `<canvas width="32" height="40" data-k="${id}"></canvas>`).join('')}</div>` : '';
  $('story-say').innerHTML = `<div class="end-title">${I.icon('star', 32)}<span>${esc(sc.title)}</span>${I.icon('star', 32)}</div>${portraits}<p>${esc(fill(sc.text))}</p>`;
  $('story-say').querySelectorAll('#end-party canvas').forEach(cv => S.draw(cv.getContext('2d'), specFor(cv.dataset.k), 0, 0, 1, 0));
  const act = $('story-act'); act.innerHTML = '';
  if (ch.next && CHAPTERS[ch.next]) act.appendChild(button('story-nextch', 'Play ' + CHAPTERS[ch.next].title, true, () => play(ch.next)));
  act.appendChild(button('story-done', 'Back to my hero', !(ch.next && CHAPTERS[ch.next]), () => { stopAnim(); H.setAdvView('adventure-screen', true); }));
  act.appendChild(button('story-again', 'Play this chapter again', false, () => play(ch.id)));
}

function startAnim() { stopAnim(); timer = setInterval(() => { frame ^= 1; drawFace(); }, 480); }
function stopAnim() { clearInterval(timer); timer = 0; }

export function play(chId) {
  const s = sv();
  if (!s || !s.hero) return;
  if (!CHAPTERS[chId]) return;
  hero = s.hero;
  party(); storyFlags();
  ch = { id: chId, ...CHAPTERS[chId], result: null, snapshot: null, retry: false, sceneKids: null };
  $('story-chapter').textContent = ch.title;
  H.setAdvView('story-screen');
  startAnim();
  return playScene('intro');
}

export default { init, play, chapterTitle, hasChapter, setFast, cond, party, storyFlags, SHOP };
