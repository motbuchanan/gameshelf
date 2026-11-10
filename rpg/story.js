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
//   levelUp: true                            a rest: if the XP star bar is full, the hero levels up here
//   xp: n, xpWhy: 'text'                     XP for getting past something without a fight (sneaking, talking, a puzzle)
//   xpFloor: level                           a milestone reached without a fight (talking the boss down)
//   shop: { who, name, say, stock }          open a shop right here (Old Tock's toys), then go on
//   check.disaster: 'scene'                  where a Disaster roll goes (a funny setback); without it a Disaster is a miss
//   nextIf: [{ if, go }], next               where to go after
// Clues: when a story flag that is also a clue (clues.js) gets set, the Clue Book gets a new page.
// Fight scenes are 'fight' (the chapter's main fight) or 'fight:name'. A fight's def.then maps win/lose/tie to scenes.
// A fight's def.xp is what winning (or talking it down) is worth; losing gives half. def.floor: a boss win brings the hero to at least that level.
// Replaying a finished chapter never gives XP again, so levels always match how far the story has gone.
// Conditions (if / ifNot) are a flag name, 'party:id', 'bestAt:clever', or a list (all must hold).
import S from './sprites.js';
import I from './icons.js';
import P from './party.js';
import R from './rules.js';
import dice from './dice.js';
import sfx from './sfx.js';
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
import F from './friends.js';
import CH11 from './ch11.js';
import CH12 from './ch12.js';
import CH13 from './ch13.js';
import CH14 from './ch14.js';
import CH15 from './ch15.js';
import { CLUES } from './clues.js';
import { SNOOZE } from './roster.js';

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
  ch10: { title: 'Chapter 10: Bramble', scenes: CH10.SCENES, fights: CH10.FIGHTS, texts: CH10.TEXT, next: 'ch11' },
  ch11: { title: 'Chapter 11: The Silver Trail', scenes: CH11.SCENES, fights: CH11.FIGHTS, texts: CH11.TEXT, next: 'ch12' },
  ch12: { title: 'Chapter 12: Gearwick', scenes: CH12.SCENES, fights: CH12.FIGHTS, texts: CH12.TEXT, next: 'ch13' },
  ch13: { title: 'Chapter 13: The Clock Tower', scenes: CH13.SCENES, fights: CH13.FIGHTS, texts: CH13.TEXT, next: 'ch14' },
  ch14: { title: 'Chapter 14: The Clockwork Workshop', scenes: CH14.SCENES, fights: CH14.FIGHTS, texts: CH14.TEXT, next: 'ch15' },
  ch15: { title: 'Chapter 15: The Silver Mask', scenes: CH15.SCENES, fights: CH15.FIGHTS, texts: CH15.TEXT, next: null },
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
  const before = { ...storyFlags() };
  Object.assign(storyFlags(), obj);
  if (ch) s.flags[ch.id + 'story'] = { ...(s.flags[ch.id + 'story'] || {}), ...obj };
  save.write();
  // A flag that is also a clue: tell the player the Clue Book has a new page (once).
  const fresh = CLUES.filter(c => obj[c.id] && !before[c.id]);
  if (fresh.length) { if (heldClues) heldClues.push(...fresh); else clueToast(fresh); }
}
// Clues found by a scene are announced when its last line shows, so the toast never gets ahead of the story.
let heldClues = null;
function clueToast(list) { if (list && list.length) { sfx.coin(); H.toast('New clue in the Big Book: ' + list.map(c => c.name).join(', ') + '!', 3400); } }
function flushClues() { const l = heldClues; heldClues = null; clueToast(l); }
export function party() {
  const s = sv(); if (!s) return START_PARTY.slice();
  if (!Array.isArray(s.party)) s.party = START_PARTY.slice();
  return s.party;
}
function join(ids) {
  const p = party();
  [].concat(ids).forEach(id => { if (!p.includes(id)) p.push(id); book.meet(id); F.joined(sv(), id); });
  save.write();
}
function test1(c) {
  if (c.startsWith('party:')) return party().includes(c.slice(6));
  if (c.startsWith('item:')) { const it = (sv() && sv().hero && sv().hero.items) || {}; return (it[c.slice(5)] || 0) > 0; }
  if (c.startsWith('bestAt:')) return hero && hero.bestAt === c.slice(7);
  if (c.startsWith('team:')) { const id = c.slice(5); return ch.team && ch.team.length ? ch.team.includes(id) : party().includes(id); }
  if (c.startsWith('home:')) return (ch.home || []).includes(c.slice(5));
  if (c.startsWith('coins:')) return ((sv() && sv().coins) || 0) >= +c.slice(6);
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
  if (!c) return '';
  // "The Silver Mask" shows as "Silver Mask", and "Old Tock" keeps both words.
  const w = c.name.split(' ');
  return w[0] === 'The' ? w.slice(1).join(' ') : w[0] === 'Old' ? w.slice(0, 2).join(' ') : w[0];
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

// ---------- XP ----------
let xpTimer = 0;
function xpPop(n, why) {
  let el = $('xp-pop');
  if (!el) { el = document.createElement('div'); el.id = 'xp-pop'; el.className = 'xp-pop'; el.setAttribute('role', 'status'); el.addEventListener('click', () => el.classList.remove('show')); document.body.appendChild(el); }
  el.innerHTML = `${I.xpStar(40)}<b>+${n} XP</b><span>${esc(why)}</span>`;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  sfx.coin();
  clearTimeout(xpTimer); xpTimer = setTimeout(() => el.classList.remove('show'), 2200);
}
// Give XP once per challenge. key names the challenge; giving it again only tops up to the bigger amount (lose half, then win).
function earnXP(key, n, why) {
  const s = sv(); if (!s || !s.hero || !n || ch.replay) return 0;
  s.flags = s.flags || {}; const got = s.flags.xpGot = s.flags.xpGot || {};
  const add = Math.max(0, n - (got[key] || 0));
  if (!add) return 0;
  got[key] = n;
  s.hero.xp = (s.hero.xp || 0) + add; hero = s.hero;
  F.share(s, add, ch.team || null);   // friends grow too: full XP for the team, half for the friends at home
  save.write();
  xpPop(add, why);
  return add;
}
// A boss win always brings the hero at least to that book's level.
function xpFloor(level) {
  const s = sv(); if (!s || !s.hero || !level || ch.replay) return 0;
  const need = P.XP_LEVELS[level] || 0;
  if ((s.hero.xp || 0) >= need) return 0;
  const add = need - (s.hero.xp || 0);
  s.hero.xp = need; hero = s.hero; save.write();
  return add;
}
// Story caps: level 3 waits for Grubjaw (Chapter 5), level 5 waits for Bramble (Chapter 10), and level 7 waits
// for the Silver Mask (Chapter 15), whatever XP says.
export function levelCap(s) {
  const f = (s && s.flags) || {}, st = f.story || {};
  return !f.ch5 ? 2 : !f.ch10 ? 4 : !(f.ch15 || st.maskDone) ? 6 : 99;
}
// Rest time: level up once for every full star bar.
async function restLevelUps() {
  const s = sv(); if (!s || !s.hero) return;
  // Let the "+XP" pop finish before the level up screen opens, so it never covers the choices.
  const lim = levelCap(s);
  if (P.levelForXp(s.hero.xp || 0) > (s.hero.level || 1) && (s.hero.level || 1) < lim) {
    const el = $('xp-pop');
    $('story-act').innerHTML = '';   // no leftover Next button while we wait
    if (el && el.classList.contains('show') && !fast) await new Promise(r => setTimeout(r, 1600));
    if (el) el.classList.remove('show');
  }
  while (P.levelForXp(s.hero.xp || 0) > (s.hero.level || 1) && (s.hero.level || 1) < lim) await levelUpScreen();
  // Heroes moved over from older saves catch up on talents they never got to pick.
  while ((s.hero.talentOwed || 0) > 0 && P.talentChoices(s.hero).length) {
    const t = await pickTalent(`<div class="end-title">${I.xpStar(34)}<span>A new talent!</span>${I.xpStar(34)}</div><p>Level ${s.hero.level} heroes know a talent: a special trick that is always ready. Pick one:</p>`);
    s.hero.talents = s.hero.talents || []; s.hero.talents.push(t); s.hero.talentOwed--;
    if (t === 'charm') s.hero.luck = P.luckMax(s.hero);
    save.write(); hero = s.hero;
    H.toast('New talent: ' + P.TALENTS[t].name + '!');
  }
  if (s.hero.talentOwed && !P.talentChoices(s.hero).length) s.hero.talentOwed = 0;
  // Friends who grew a level since the last rest.
  const grew = F.grown(s);
  if (grew.length) {
    speaker = null; drawFace(); $('story-name').textContent = '';
    $('story-say').innerHTML = `<div class="lvl"><div class="end-title">${I.xpStar(30)}<span>Your friends grew!</span>${I.xpStar(30)}</div>
      <p>Friends get better at helping as they level up: more hearts, better skills, and stronger Home Team jobs.</p>
      <div class="end-party" id="grew-faces">${grew.map(g => `<div class="grew"><canvas width="32" height="40" data-k="${g.id}"></canvas><b>${esc(nameFor(g.id))}</b><span>Level ${g.to}</span></div>`).join('')}</div></div>`;
    $('story-say').querySelectorAll('#grew-faces canvas').forEach(cv => S.draw(cv.getContext('2d'), specFor(cv.dataset.k), 0, 0, 1, 0));
    sfx.levelUp();
    F.markShown(s); save.write();
    await tapNext('Hooray!');
  }
}
// The talent picker: each talent with what it does, then a button for each.
async function pickTalent(head, lv) {
  const h = sv().hero, tchoices = P.talentChoices(h, lv || h.level || 1), act = $('story-act');
  speaker = 'hero'; drawFace(); $('story-name').textContent = '';
  $('story-say').innerHTML = `<div class="lvl">${head}
    ${tchoices.map(t => `<div class="lvl-row">${I.icon('star', 20)}<b>${esc(P.TALENTS[t].name)}</b><span>${esc(P.TALENTS[t].text)}</span></div>`).join('')}</div>`;
  act.innerHTML = '';
  return new Promise(res => tchoices.forEach((t, k) => {
    const b = button('lvl-talent-' + k, P.TALENTS[t].name, false, () => res(t));
    b.classList.add('lvl-skill'); b.insertAdjacentHTML('afterbegin', I.icon('star', 22));
    act.appendChild(b);
  }));
}

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
    if (g.coins) s.coins = Math.max(0, (s.coins || 0) + g.coins);
    if (g.spell) { s.hero.spells = s.hero.spells || []; if (!s.hero.spells.includes(g.spell)) s.hero.spells.push(g.spell); }
    if (g.talent) { s.hero.talents = s.hero.talents || []; if (!s.hero.talents.includes(g.talent)) s.hero.talents.push(g.talent); }
    if (g.items) { s.hero.items = s.hero.items || {}; for (const k in g.items) s.hero.items[k] = (s.hero.items[k] || 0) + g.items[k]; }
  }
  if (sc.use) { s.hero.items = s.hero.items || {}; [].concat(sc.use).forEach(k => { s.hero.items[k] = Math.max(0, (s.hero.items[k] || 0) - 1); }); }
  if (sc.hurt) s.hero.hp = Math.max(1, (s.hero.hp || P.hpMax(s.hero)) - sc.hurt);
  if (sc.heal) { s.hero.hp = P.hpMax(s.hero); s.hero.luck = P.luckMax(s.hero); }
  if (sc.meet) [].concat(sc.meet).forEach(id => book.meet(id));
  if (sc.friendsGrow) F.start(s);
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
  heldClues = [];
  applyEffects(sc);
  if (sc.xp) earnXP(ch.id + ':' + (sc.xpKey || id), sc.xp, sc.xpWhy || 'You got past it!');
  if (sc.xpFloor) { const x0 = (hero.xp || 0) - (sc.xp || 0); if (xpFloor(sc.xpFloor)) xpPop((hero.xp || 0) - x0, (sc.xpWhy || 'Big win!') + ' You reached level ' + sc.xpFloor + '!'); }
  if (sc.hurt) H.toast(`Ouch! You lose ${sc.hurt === 1 ? 'a heart' : sc.hurt + ' hearts'}.`);
  const act = $('story-act');
  const lines = (sc.lines || []).filter(cond);
  // Choices whose conditions all fail are skipped (the scene just goes on to nextIf / next).
  const shown = (sc.choices || []).filter(cond);
  const waitsAfter = shown.length || sc.check || sc.pickTeam || sc.hub || sc.trailmap;
  for (let i = 0; i < lines.length; i++) {
    showLine(lines[i]);
    const last = i === lines.length - 1;
    if (last) flushClues();
    if (last && waitsAfter) break;
    act.innerHTML = '';
    await new Promise(res => act.appendChild(button('story-next', 'Next', true, res)));
  }
  flushClues();
  if (sc.check) return playScene(await runCheck(sc.check, id));
  if (shown.length) {
    act.innerHTML = '';
    const pick = await new Promise(res => shown.forEach((c, k) => act.appendChild(button('story-choice-' + k, fill(c.label), k === 0, () => res(c)))));
    setFlags(pick.set);
    if (pick.retry) ch.retry = true;
    return playScene(pick.go);
  }
  if (sc.pickTeam) await pickTeam(sc.pickTeam);
  if (sc.shop) await shop(sc.shop);
  if (sc.hub) return playScene(await hub(sc.hub, id));
  if (sc.trailmap) return playScene(await trailMap(sc.trailmap));
  if (sc.levelUp) await restLevelUps();
  const nx = (sc.nextIf || []).find(cond);
  return playScene(nx ? nx.go : sc.next);
}

// ---------- skill checks ----------
// Roll the 100 dice against a skill. A friend who helps adds 10 squares. Luck can reroll a miss.
async function runCheck(chk, sceneId) {
  const s = sv(); const h = s.hero;
  // The helper must be someone who came along. If the named friend stayed home, another teammate helps.
  const team = ch.team && ch.team.length ? ch.team : null;
  const helper = !chk.help ? null : team ? (team.includes(chk.help) ? chk.help : team.find(id => id !== 'inkwing') || null) : (party().includes(chk.help) ? chk.help : null);
  const sk = P.SKILLS[chk.skill], stat = sk.stat, base = P.skill(h, chk.skill);
  const flagBonus = Object.entries(chk.bonusIf || {}).filter(([f]) => test1(f)).reduce((a, [, v]) => a + v, 0);
  // Helping Hand talent: friends who help give 5 more squares.
  const helpN = helper ? (F.started(s) ? F.helpBonus(s, helper) : HELP_BONUS) + ((h.talents || []).includes('helping') ? 5 : 0) : 0;
  const home = F.homeCheckBonus(s, chk, ch.home || []);
  if (home.auto) { H.toast(home.why + ' It opens right away!'); earnXP(ch.id + ':chk:' + sceneId, chk.xp || P.XP.check, 'Your Home Team helped!'); return chk.great || chk.ok; }
  const value = R.clampSkill(base + helpN + (chk.bonus || 0) + flagBonus + home.bonus);
  speaker = 'hero'; drawFace();
  $('story-name').textContent = '';
  $('story-say').innerHTML = `<div class="chk"><div class="chk-h">${esc(fill(chk.label))}</div>
    <div class="chk-row" style="--sc:${I.STAT_COLOR[stat]}">${I.icon(I.STAT_ICON[stat], 22)}<b>${esc(sk.name)}</b>${I.meter(base, I.STAT_COLOR[stat], 'small')}</div>
    ${chk.bonus ? `<div class="chk-row help">${I.icon('clover', 18)}<b>${esc(chk.bonusWhy || 'A little extra help!')}</b></div>` : ''}
    ${helper ? `<div class="chk-row help">${I.icon('star', 18)}<b>${esc(nameFor(helper))} helps! +${helpN} squares</b><span>Friends who help give you more colored squares. Higher level friends help more.</span></div>` : ''}
    ${home.bonus ? `<div class="chk-row help">${I.icon('star', 18)}<b>${esc(home.why)} +${home.bonus} squares</b></div>` : ''}</div>`;
  const act = $('story-act'); act.innerHTML = '';
  await new Promise(res => act.appendChild(button('chk-roll', 'Roll!', true, res)));
  act.innerHTML = '';
  let roll = await checkPop(chk, value, h);
  const tier = R.tierFor(value, roll.value);
  const band = tier === 'legendary' || tier === 'exceptional' ? 'great' : tier === 'success' ? 'ok' : 'miss';
  // A Disaster (the red corner of the chart) can have its own funny setback.
  if (tier === 'disaster' && chk.disaster) return chk.disaster;
  if (chk.set && chk.set[band]) setFlags(chk.set[band]);
  if (band !== 'miss' && chk.xp !== 0) earnXP(ch.id + ':chk:' + sceneId, chk.xp || P.XP.check, band === 'great' ? 'Great roll!' : 'Good roll!');
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
  // Lock the tabs while the story dice roll, so a tap on the Dice tab can't start a second roll over this one.
  H.lock();
  try { await dice.roll(roll); } finally { H.unlock(); }
  const tier = R.tierFor(value, roll.value);
  const cell = $('sr-grid').querySelector(`[data-n="${roll.value}"]`); if (cell) cell.classList.add('hit');
  $('sr-tier').textContent = roll.value + '! ' + I.TIER_WORD[tier];
  $('sr-tier').style.color = tier === 'fail' ? '#c9b48e' : I.TIER_COLOR[tier];
  $('sr-tier').className = 'br-tier pop-in t-' + tier;
  sfx.tier(tier);
  const miss = tier === 'fail' || tier === 'disaster';
  const again = await new Promise(res => {
    const clovers = Array.from({ length: P.luckMax(h) }, (_, i) => I.icon('clover', 18, i >= h.luck)).join('');
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
      if (id === 'pim' && f.spark) { r.trick = null; r.tricks = [SPARK, ...(f.patch ? [PATCH] : []), ...(f.snooze ? [SNOOZE] : [])]; }
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
  if (d.fix && d.fix.bonusIf) d.fix.bonus = Object.entries(d.fix.bonusIf).filter(([k]) => test1(k)).reduce((a, [, v]) => a + v, 0);
  const s = sv();
  if (F.started(s)) {
    d.friendLv = F.levels(s);
    if (ch.home && ch.home.length && !d.noHomeTeam) F.applyHomeJobs(s, d, ch.home, nameFor);
  }
  return d;
}
async function fight(name) {
  stopAnim();
  // "Try the fight again" puts the hero back exactly as they were when the fight began.
  if (ch.retry && ch.snapshot) { const xp = hero.xp; Object.assign(hero, clone(ch.snapshot)); hero.xp = xp; }   // XP already earned stays
  else ch.snapshot = clone(hero);
  ch.retry = false;
  const def = buildFight(name);
  const pop = $('xp-pop'); if (pop) pop.classList.remove('show');   // no leftover "+XP" over the board
  if (def.pudge != null) hero.luck = def.pudge >= 1 ? P.luckMax(hero) : Math.min(P.luckMax(hero), (hero.luck || 0) + 1);   // Pudge's pie
  const fresh = (def.meets || []).filter(id => book.meet(id));
  H.setAdvView('battle-screen');
  const result = await board.start(def, ch.texts, hero);
  if (fresh.length) H.toast('New in the Big Book: ' + fresh.map(id => (CAST.find(c => c.id === id) || {}).name).join(', ') + '!');
  ch.result = result;
  if (def.mode === 'hp') {
    const me = C.unitById(board.state(), 'hero');
    hero.hp = Math.max(1, Math.min(P.hpMax(hero), me.flags));   // Home Team extra hearts don't stay after the fight
  }
  const s = sv(); if (s) { s.flags = s.flags || {}; s.flags[ch.id + '_' + name] = result; }
  save.write();
  H.setAdvView('story-screen');
  startAnim();
  // def.xpKey: one key for every way past the same obstacle (sneaking past and fighting pay once, not twice).
  const worth = def.xp || 0, key = ch.id + ':' + (def.xpKey || 'fight:' + name), x0 = hero.xp || 0;
  const why = result === 'calm' ? 'You talked it out! That counts as winning.' : result === 'fixed' ? 'You fixed it! That counts as winning.' : result === 'lose' ? 'You learned something, even though it was tough.' : (def.xpWhy || 'You won the fight!');
  earnXP(key, result === 'lose' ? Math.floor(worth / 2) : worth, why);
  // big story fights are milestones: however they go, the hero reaches that level (the pop shows the real jump)
  if (xpFloor(def.floor)) xpPop((hero.xp || 0) - x0, why + ' You reached level ' + def.floor + '!');
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
    ${m.nodes.map(n => { const ok = nodes.includes(n) && n.go; return `<button type="button" id="map-${n.id}" class="tmap-node${n.x < 18 ? ' edge-l' : n.x > 82 ? ' edge-r' : ''}${n.id === m.here ? ' here' : ''}${ok ? ' go' : ''}" style="left:${n.x}%;top:${n.y / 60 * 100}%" ${ok ? '' : 'aria-disabled="true" tabindex="-1"'}><span class="tmap-dot">${I.icon(n.icon || (n.id === m.here ? 'star' : 'boot'), 18)}</span><span class="tmap-label">${esc(n.label)}</span></button>`; }).join('')}
    </div></div>`;
  $('story-act').innerHTML = '';
  void at;
  // Pim at home reads the map: the shorter path (and, from level 3, the treasure) get a tag.
  const pimHome = (ch.home || []).includes('pim'), pimLv = pimHome ? F.level(sv(), 'pim') : 0;
  const tag = (n, text, cls) => { const el = $('map-' + n.id); if (el && !el.querySelector('.' + cls)) el.insertAdjacentHTML('beforeend', `<em class="tmap-tag ${cls}">${esc(text)}</em>`); };
  if (pimHome) {
    const notes = [];
    nodes.forEach(n => { if (n.short) { tag(n, 'Pim: shorter!', 'tag-pim'); notes.push(`<li><b>${esc(n.label)}:</b> the shorter way</li>`); } if (pimLv >= 3 && n.treasure) notes.push(`<li><b>${esc(n.label)}:</b> treasure!</li>`); });
    // Pim's notes as a list under the map too, so they can be read on any screen.
    if (notes.length) $('story-say').querySelector('.tmap').insertAdjacentHTML('beforeend', `<p class="tmap-pim">Pim read the map at home:</p><ul class="tmap-scout">${notes.join('')}</ul>`);
  }
  // Inkwing flies ahead and shows what is down each path.
  const SCOUT = { monster: 'Monsters!', treasure: 'Treasure', friend: 'Someone needs help', bridge: 'Broken bridge', quiet: 'Nice and quiet', shop: 'A peddler' };
  const scoutable = nodes.filter(n => n.go && n.scout);
  if (scoutable.length && party().includes('inkwing')) {
    $('story-act').appendChild(button('map-scout', 'Ask Inkwing to scout ahead', false, () => {
      scoutable.forEach(n => tag(n, 'Inkwing: ' + (SCOUT[n.scout] || n.scout), 'tag-ink'));
      // The same news as a list under the map, so it can be read on a small phone too.
      $('story-say').querySelector('.tmap').insertAdjacentHTML('beforeend', `<ul class="tmap-scout">${scoutable.map(n => `<li><b>${esc(n.label)}:</b> ${esc(SCOUT[n.scout] || n.scout)}</li>`).join('')}</ul>`);
      setFlags({ scouted: true });
      $('story-name').textContent = 'Inkwing';
      $('story-act').innerHTML = '';
      H.toast('Caw! Inkwing flew ahead and came back to tell you.');
    }));
  }
  return new Promise(res => nodes.filter(n => n.go).forEach(n => $('map-' + n.id).addEventListener('click', () => { setFlags(n.set); res(n.go); }, { once: true })));
}

// ---------- pick your team ----------
async function pickTeam(opts) {
  const size = opts.size || 3;
  const pool = party().filter(id => !(opts.exclude || []).includes(id));
  const picked = (storyFlags().team || []).filter(id => pool.includes(id)).slice(0, size);
  const levelsOn = F.started(sv()), jobsOn = levelsOn && chapterNum(ch.id) >= 11;
  while (picked.length < Math.min(size, pool.length)) { const n = pool.find(id => !picked.includes(id)); picked.push(n); }
  speaker = null; drawFace();
  $('story-name').textContent = '';
  const act = $('story-act');
  await new Promise(res => {
    const render = () => {
      $('story-say').innerHTML = `<div class="team"><div class="chk-h">Pick your team</div><p>Who comes with you? Pick ${size}. ${jobsOn ? 'Friends who stay home do a Home Team job that helps you. Friends who come along earn full XP.' : 'The others help from outside.'}</p><div class="team-grid" id="team-grid"></div></div>`;
      const grid = $('team-grid');
      pool.forEach(id => {
        const on = picked.includes(id);
        const b = document.createElement('button'); b.type = 'button'; b.id = 'team-' + id;
        b.className = 'team-kid' + (on ? ' on' : '');
        const cv = document.createElement('canvas'); cv.width = 32; cv.height = 40;
        S.draw(cv.getContext('2d'), specFor(id), 0, 0, 1, 0);
        b.appendChild(cv);
        const lv = levelsOn ? F.level(sv(), id) : 0, job = jobsOn && !on ? F.jobLine(sv(), id, chapterNum(ch.id)) : null;
        b.insertAdjacentHTML('beforeend', `<span>${esc(nameFor(id))}</span>${lv ? `<em class="lv">${I.xpStar(16)} Level ${lv}</em>` : ''}${on ? `<i>${I.icon('star', 16)}</i>` : ''}${job ? `<small class="job"><b>Home Team: ${esc(job.name)}</b>${esc(job.what)}</small>` : ''}`);
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
  ch.team = picked.slice();
  ch.home = jobsOn ? pool.filter(id => !picked.includes(id) && F.JOBS[id]) : [];
}

// ---------- the town ----------
async function hub(h, hubId) {
  ch.hubSeen = ch.hubSeen || new Set();
  const s = sv();
  speaker = null; drawFace();
  $('story-name').textContent = h.place || 'Millbrook';
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
export const ITEMS = { rope: { name: 'Rope', what: 'Climb and cross things' }, lantern: { name: 'Lantern', what: 'Light in the dark' }, potion: { name: 'Healing potion', what: 'Drink in a fight: hearts back' }, oil: { name: 'Oil can', what: 'Unsticks gears. Throw it in a fight: a monster slips' }, towerkey: { name: 'Tower key', what: 'Old Tock\'s spare key', noBuy: true }, water: { name: 'Bucket of water', what: 'Throw it in a fight: clockwork jams', noBuy: true }, net: { name: 'Snare net', what: 'Throw it in a fight: a monster is stuck' },
  // Keepsakes: special things you keep. They show on your hero page.
  mousekey: { name: 'Mouse key', what: 'A little brass key shaped like a mouse', keep: true, noBuy: true },
  seed: { name: 'Silver seed', what: 'The last seed from the silver grove', keep: true, noBuy: true },
  brassgear: { name: 'Lucky gear', what: 'A little brass gear with a W on the back', keep: true, noBuy: true },
  toybear: { name: 'Dancing bear', what: 'A wind-up toy from Old Tock', keep: true },
  toyfrog: { name: 'Hopping frog', what: 'A wind-up toy from Old Tock', keep: true },
  toytrain: { name: 'Tiny train', what: 'A wind-up toy from Old Tock', keep: true },
};
async function shop(opts) {
  const s = sv(); const h = s.hero; h.bag = h.bag || []; h.items = h.items || {};
  const stock = (opts && opts.stock) || SHOP;
  speaker = (opts && opts.who) || 'smith'; drawFace();
  $('story-name').textContent = (opts && opts.name) || 'Brenna';
  const act = $('story-act');
  await new Promise(res => {
    const render = () => {
      const ITEM_ICON = { potion: 'heart', oil: 'hammer', rope: 'boot', lantern: 'bulb', towerkey: 'star', water: 'bubble', net: 'shield', toybear: 'star', toyfrog: 'star', toytrain: 'star' };
      const itemRows = stock.filter(it => ITEMS[it.id]).map(it => `<div class="shop-row"><span class="shop-ico">${I.icon(ITEM_ICON[it.id] || 'star', 28)}</span><b>${esc(ITEMS[it.id].name)}${h.items[it.id] ? ' (' + h.items[it.id] + ')' : ''}</b><span>${esc(ITEMS[it.id].what)}</span>${ITEMS[it.id].keep && h.items[it.id] ? '<span class="shop-on">Yours!</span>' : `<button class="btn small${(s.coins || 0) >= it.price ? '' : ' off'}" id="shop-buy-${it.id}" type="button">${I.icon('coin', 14)} ${it.price}</button>`}</div>`).join('');
      const rows = stock.filter(it => GEAR[it.id]).map(it => {
        const g = GEAR[it.id], own = h.bag.includes(it.id) || Object.values(h.gear).includes(it.id), wearing = h.gear[g.slot] === it.id;
        const what = g.dice ? `${I.icon('die', 16)} ${g.dice}` : ({ buckler: 'Armor', ironcap: 'Armor', padded: 'Armor', helmet: 'Strong armor', roundshield: 'Strong armor', chainshirt: 'Armor', cape: 'Looks great' }[it.id] || '');
        const btn = wearing ? '<span class="shop-on">Wearing</span>' : own ? `<button class="btn small" id="shop-wear-${it.id}" type="button">Wear</button>`
          : `<button class="btn small${(s.coins || 0) >= it.price ? '' : ' off'}" id="shop-buy-${it.id}" type="button">${I.icon('coin', 14)} ${it.price}</button>`;
        return `<div class="shop-row"><canvas width="32" height="40" data-g="${it.id}"></canvas><b>${esc(g.name)}</b><span>${what}</span>${btn}</div>`;
      }).join('');
      const bagRows = !stock.some(it => GEAR[it.id]) ? '' : h.bag.filter(id => !stock.some(it => it.id === id) && GEAR[id] && h.gear[GEAR[id].slot] !== id)
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
          sfx.coin();
          if (ITEMS[it.id]) { h.items[it.id] = (h.items[it.id] || 0) + 1; H.toast(ITEMS[it.id].name + ' goes in your bag!'); }
          else { giveGear(it.id); H.toast(GEAR[it.id].name + ' is yours!'); }
          save.write(); hero = h; render();
        });
        if (wear) wear.addEventListener('click', () => { giveGear(it.id); save.write(); hero = h; render(); });
      });
      act.innerHTML = '';
      act.appendChild(button('shop-done', (opts && opts.doneLabel) || 'Back to town', true, res));
    };
    render();
  });
}

// ---------- level up ----------
// Show what grew, then pick one new practiced skill. At level 4 you pick which stat grows; at levels 3 and 5 you pick a talent.
async function levelUpScreen() {
  const s = sv(); if (!s || !s.hero) return;
  const h = s.hero;
  const next = (h.level || 1) + 1;
  let stat = P.BEST_STAT[h.bestAt];
  const act = $('story-act');
  const title = `<div class="end-title">${I.xpStar(34)}<span>Level ${next}!</span>${I.xpStar(34)}</div>`;
  speaker = 'hero'; drawFace();
  $('story-name').textContent = '';
  sfx.levelUp();
  if (P.STAT_PICK_LEVELS.includes(next)) {
    $('story-say').innerHTML = `<div class="lvl">${title}<p>Your XP star bar is full! This time YOU choose what grows. Pick one:</p></div>`;
    act.innerHTML = '';
    stat = await new Promise(res => P.STATS.forEach((st, k) => {
      const b = button('lvl-stat-' + k, P.STAT_NAME[st] + ': ' + I.STAT_WORD[st], false, () => res(st));
      b.classList.add('lvl-skill'); b.style.setProperty('--sc', I.STAT_COLOR[st]);
      b.insertAdjacentHTML('afterbegin', I.icon(I.STAT_ICON[st], 22));
      act.appendChild(b);
    }));
  }
  const choices = P.levelSkillChoices(h);
  $('story-say').innerHTML = `<div class="lvl">${title}
    <p>Your XP star bar is full! All that adventuring paid off. ${esc(hero.name)} grew:</p>
    <div class="lvl-row">${I.icon('heart', 22)}<b>${P.HEARTS_PER_LEVEL} more hearts</b><span>Tougher from all that running and bonking.</span></div>
    <div class="lvl-row" style="--sc:${I.STAT_COLOR[stat]}">${I.icon(I.STAT_ICON[stat], 22)}<b>${P.STAT_NAME[stat]} grows</b>${I.meter(h.stats[stat], I.STAT_COLOR[stat], 'small')}<span class="lvl-arrow">to</span>${I.meter(h.stats[stat] + P.LEVEL_STAT_GAIN, I.STAT_COLOR[stat], 'small')}</div>
    <div class="lvl-row">${I.icon('clover', 22)}<b>Luck and hearts refill</b></div>
    <p class="lvl-pick">Now pick one new skill to practice. It gets a gold PRACTICED ribbon.</p></div>`;
  act.innerHTML = '';
  const pick = await new Promise(res => choices.forEach((id, k) => {
    const sk = P.SKILLS[id], b = button('lvl-skill-' + k, sk.name, false, () => res(id));
    b.classList.add('lvl-skill'); b.style.setProperty('--sc', I.STAT_COLOR[sk.stat]);
    b.insertAdjacentHTML('afterbegin', I.icon(I.STAT_ICON[sk.stat], 22));
    act.appendChild(b);
  }));
  let talent = null;
  const tchoices = P.TALENT_LEVELS.includes(next) ? P.talentChoices(h, next) : [];
  if (tchoices.length) talent = await pickTalent(`${title}<p>Level ${next} heroes learn a <b>talent</b>: a special trick that is always ready. Pick one:</p>`, next);
  P.levelUp(h, pick, stat, talent);
  save.write();
  hero = h;
  H.toast(`Level ${h.level}! ${P.SKILLS[pick].name} is now practiced.${talent ? ' New talent: ' + P.TALENTS[talent].name + '!' : ''}`);
}

// ---------- chapter end ----------
async function chapterEnd(sc) {
  const s = sv();
  if (s) {
    s.flags = s.flags || {};
    s.flags[ch.id] = ch.result || 'done';
    if (ch.next && chapterNum(s.chapter || 'ch1') <= chapterNum(ch.id)) s.chapter = ch.next;
    if (sc.book) s.flags['book' + sc.book] = true;
    if (s.hero && chapterNum(ch.id) >= 2) { s.hero.hp = P.hpMax(s.hero); s.hero.luck = P.luckMax(s.hero); }  // chapter end = rest
    save.write();
  }
  await restLevelUps();   // after the chapter is saved, so closing the iPad here loses nothing
  speaker = null; drawFace();
  $('story-name').textContent = '';
  const portraits = sc.party ? `<div class="end-party" id="end-party">${[...new Set(['hero', ...party(), ...(sc.extraFaces || [])])].map(id => `<canvas width="32" height="40" data-k="${id}"></canvas>`).join('')}</div>` : '';
  $('story-say').innerHTML = `<div class="end-title">${I.icon('star', 32)}<span>${esc(sc.title)}</span>${I.icon('star', 32)}</div>${portraits}<p>${esc(fill(sc.text))}</p>`;
  sfx.fanfare();
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
  ch = { id: chId, ...CHAPTERS[chId], result: null, snapshot: null, retry: false, sceneKids: null, replay: !!((s.flags || {})[chId]) };
  // Book Three: the last team picked stays the team (and the rest stay home) until a new pick.
  const sf = storyFlags();
  if (chapterNum(chId) >= 12 && F.started(s) && Array.isArray(sf.team)) {
    ch.team = sf.team.filter(id => party().includes(id));
    ch.home = party().filter(id => !ch.team.includes(id) && F.JOBS[id]);
  }
  $('story-chapter').textContent = ch.title;
  H.setAdvView('story-screen');
  startAnim();
  return playScene('intro');
}

export default { init, play, chapterTitle, hasChapter, setFast, cond, party, storyFlags, SHOP, ITEMS };
