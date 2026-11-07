// Story scenes: one line at a time with the speaker's picture, choices, fights, and the chapter end.
import S from './sprites.js';
import I from './icons.js';
import P from './party.js';
import save from './save.js';
import board from './board.js';
import { CAST } from './art.js';
import CH1 from './ch1.js';
import CH2 from './ch2.js';
import C from './combat.js';
import book from './book.js';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let H = { setAdvView() {}, toast() {}, lock() {}, unlock() {} };
export function init(helpers) { H = { ...H, ...helpers }; }

// Each chapter: its scenes, its fight, and the words the fight uses.
const CHAPTERS = {
  ch1: { title: 'Chapter 1: Heroes and Monsters', scenes: CH1.CH1_SCENES, fight: CH1.CH1_FIGHT, texts: CH1, next: 'ch2' },
  ch2: { title: 'Chapter 2: Not Pretend Anymore', scenes: CH2.CH2_SCENES, fight: CH2.CH2_FIGHT, texts: CH2, next: 'ch3' },
};
export const hasChapter = id => !!CHAPTERS[id];
const clone = o => JSON.parse(JSON.stringify(o));

// Story flags live in the save, per chapter: s.flags.ch2 = { help: 'town', torch: true, ... } plus the chapter result.
function setFlags(obj) {
  if (!obj) return;
  const s = save.get(); if (!s) return;
  s.flags = s.flags || {};
  const k = ch.id + 'story';
  s.flags[k] = { ...(s.flags[k] || {}), ...obj };
  save.write();
}

let ch = null, hero = null, frame = 0, timer = 0, speaker = null;

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

// The narrator gets a little woods scene with the kids in it instead of one face.
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
  const kids = [hero && P.spriteSpec(hero), ...['hollis', 'nell', 'pim'].map(specFor)].filter(Boolean);
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
  speaker = line.who === 'narrator' ? null : line.who;
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

async function playScene(id) {
  if (id === 'fight') return fight();
  const sc = ch.scenes[id];
  if (sc.end) return chapterEnd(sc);
  setFlags(sc.set);
  const act = $('story-act');
  for (let i = 0; i < sc.lines.length; i++) {
    showLine(sc.lines[i]);
    const last = i === sc.lines.length - 1;
    if (last && sc.choices) break;
    act.innerHTML = '';
    await new Promise(res => act.appendChild(button('story-next', 'Next', true, res)));
  }
  if (sc.choices) {
    act.innerHTML = '';
    const pick = await new Promise(res => sc.choices.forEach((c, k) => act.appendChild(button('story-choice-' + k, c.label, k === 0, () => res(c)))));
    setFlags(pick.set);
    if (pick.retry) ch.retry = true;
    return playScene(pick.go);
  }
  if (sc.levelUp) await levelUpScreen();
  return playScene(sc.next);
}

async function fight() {
  stopAnim();
  // "Try the fight again" puts the hero back exactly as they were when the fight began.
  if (ch.retry && ch.snapshot) Object.assign(hero, clone(ch.snapshot));
  else ch.snapshot = clone(hero);
  ch.retry = false;
  // New monsters go in the Big Book.
  const fresh = (ch.fight.meets || []).filter(id => book.meet(id));
  H.setAdvView('battle-screen');
  const result = await board.start(ch.fight, ch.texts, hero);
  if (fresh.length) H.toast('New in the Big Book: ' + fresh.map(id => (CAST.find(c => c.id === id) || {}).name).join(', ') + '!');
  ch.result = result;
  if (ch.fight.mode === 'hp') {
    const me = C.unitById(board.state(), 'hero');
    hero.hp = Math.max(1, me.flags);
    save.write();
  }
  H.setAdvView('story-screen');
  startAnim();
  return playScene(result);
}

// Level up: show what grew, then let the player pick one new practiced skill.
async function levelUpScreen() {
  const s = save.get(); if (!s || !s.hero) return;
  const h = s.hero;
  if ((s.flags || {})[ch.id + 'level']) return;          // only once per chapter, even on replays
  const stat = P.BEST_STAT[h.bestAt], next = (h.level || 1) + 1;
  const choices = P.levelSkillChoices(h);
  speaker = 'hero'; drawFace();
  $('story-name').textContent = '';
  $('story-say').innerHTML = `<div class="lvl"><div class="end-title">${I.icon('star', 32)}<span>Level ${next}!</span>${I.icon('star', 32)}</div>
    <p>Every fight teaches you something. ${esc(hero.name)} grew:</p>
    <div class="lvl-row">${I.icon('heart', 22)}<b>2 more hearts</b><span>Tougher from all that running and bonking.</span></div>
    <div class="lvl-row" style="--sc:${I.STAT_COLOR[stat]}">${I.icon(I.STAT_ICON[stat], 22)}<b>${P.STAT_NAME[stat]} grows</b>${I.meter(h.stats[stat], I.STAT_COLOR[stat], 'small')}<span class="lvl-arrow">to</span>${I.meter(h.stats[stat] + P.LEVEL_STAT_GAIN, I.STAT_COLOR[stat], 'small')}</div>
    <div class="lvl-row">${I.icon('clover', 22)}<b>Luck and hearts refill</b></div>
    <p class="lvl-pick">Now pick one new skill to practice. It gets a gold PRACTICED ribbon.</p></div>`;
  const act = $('story-act'); act.innerHTML = '';
  const pick = await new Promise(res => choices.forEach((id, k) => {
    const sk = P.SKILLS[id], b = button('lvl-skill-' + k, sk.name, false, () => res(id));
    b.classList.add('lvl-skill'); b.style.setProperty('--sc', I.STAT_COLOR[sk.stat]);
    b.insertAdjacentHTML('afterbegin', I.icon(I.STAT_ICON[sk.stat], 22));
    act.appendChild(b);
  }));
  P.levelUp(h, pick);
  s.flags = s.flags || {}; s.flags[ch.id + 'level'] = true;
  save.write();
  hero = h;
  H.toast(`Level ${h.level}! ${P.SKILLS[pick].name} is now practiced.`);
}

function chapterEnd(sc) {
  const s = save.get();
  if (s) {
    s.flags = s.flags || {};
    s.flags[ch.id] = ch.result || 'done';
    if (ch.next && chapterNum(s.chapter || 'ch1') <= chapterNum(ch.id)) s.chapter = ch.next;
    if (s.hero && ch.fight.mode === 'hp') { s.hero.hp = P.hpMax(s.hero); s.hero.luck = P.LUCK_MAX; }  // chapter end = rest
    save.write();
  }
  speaker = null; drawFace();
  $('story-name').textContent = '';
  $('story-say').innerHTML = `<div class="end-title">${I.icon('star', 32)}<span>${esc(sc.title)}</span>${I.icon('star', 32)}</div><p>${esc(sc.text)}</p>`;
  const act = $('story-act'); act.innerHTML = '';
  if (ch.next && CHAPTERS[ch.next]) act.appendChild(button('story-nextch', 'Play ' + CHAPTERS[ch.next].title, true, () => play(ch.next)));
  act.appendChild(button('story-done', 'Back to my hero', !(ch.next && CHAPTERS[ch.next]), () => { stopAnim(); H.setAdvView('adventure-screen', true); }));
  act.appendChild(button('story-again', 'Play this chapter again', false, () => play(ch.id)));
}
const chapterNum = id => parseInt(String(id).replace(/\D/g, ''), 10) || 1;

function startAnim() { stopAnim(); timer = setInterval(() => { frame ^= 1; drawFace(); }, 480); }
function stopAnim() { clearInterval(timer); timer = 0; }

export function play(chId) {
  const s = save.get();
  if (!s || !s.hero) return;
  hero = s.hero;
  if (!CHAPTERS[chId]) return;
  ch = { id: chId, ...CHAPTERS[chId], result: null, snapshot: null, retry: false };
  $('story-chapter').textContent = ch.title;
  H.setAdvView('story-screen');
  startAnim();
  return playScene('intro');
}
export function chapterTitle(chId) { return CHAPTERS[chId] ? CHAPTERS[chId].title : ''; }

export default { init, play, chapterTitle, hasChapter };
