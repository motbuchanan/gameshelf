// Story scenes: one line at a time with the speaker's picture, choices, fights, and the chapter end.
import S from './sprites.js';
import I from './icons.js';
import P from './party.js';
import save from './save.js';
import board from './board.js';
import { CAST } from './art.js';
import CH1 from './ch1.js';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let H = { setAdvView() {}, toast() {}, lock() {}, unlock() {} };
export function init(helpers) { H = { ...H, ...helpers }; }

// Each chapter: its scenes, its fight, and the words the fight uses.
const CHAPTERS = {
  ch1: { title: 'Chapter 1: Heroes and Monsters', scenes: CH1.CH1_SCENES, fight: CH1.CH1_FIGHT, texts: CH1, next: 'ch2' },
};

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
    const go = await new Promise(res => sc.choices.forEach((c, k) => act.appendChild(button('story-choice-' + k, c.label, k === 0, () => res(c.go)))));
    return playScene(go);
  }
  return playScene(sc.next);
}

async function fight() {
  stopAnim();
  H.setAdvView('battle-screen');
  const result = await board.start(ch.fight, ch.texts, hero);
  ch.result = result;
  H.setAdvView('story-screen');
  startAnim();
  return playScene(result);
}

function chapterEnd(sc) {
  const s = save.get();
  if (s) {
    s.flags = s.flags || {};
    s.flags[ch.id] = ch.result || 'done';
    if (ch.next && (s.chapter || 'ch1') <= ch.id) s.chapter = ch.next;
    save.write();
  }
  speaker = null; drawFace();
  $('story-name').textContent = '';
  $('story-say').innerHTML = `<div class="end-title">${I.icon('star', 32)}<span>${esc(sc.title)}</span>${I.icon('star', 32)}</div><p>${esc(sc.text)}</p>`;
  const act = $('story-act'); act.innerHTML = '';
  act.appendChild(button('story-done', 'Back to my hero', true, () => { stopAnim(); H.setAdvView('adventure-screen', true); }));
  act.appendChild(button('story-again', 'Play this chapter again', false, () => play(ch.id)));
}

function startAnim() { stopAnim(); timer = setInterval(() => { frame ^= 1; drawFace(); }, 480); }
function stopAnim() { clearInterval(timer); timer = 0; }

export function play(chId) {
  const s = save.get();
  if (!s || !s.hero) return;
  hero = s.hero;
  ch = { id: chId, ...CHAPTERS[chId], result: null };
  $('story-chapter').textContent = ch.title;
  H.setAdvView('story-screen');
  startAnim();
  return playScene('intro');
}
export function chapterTitle(chId) { return CHAPTERS[chId] ? CHAPTERS[chId].title : ''; }

export default { init, play, chapterTitle };
