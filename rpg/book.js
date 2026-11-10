// The Big Book: a gallery of everything in the game, sorted onto shelves.
// Every tile opens a tap card. Monsters stay dark shapes until you meet them.
import S from './sprites.js';
import I from './icons.js';
import P from './party.js';
import save from './save.js';
import { CAST, GEAR } from './art.js';
import { GLOSSARY } from './glossary.js';
import { tileArt } from './board.js';
import F from './friends.js';
import { CLUES, BOOK_NAME } from './clues.js';

const $ = id => document.getElementById(id);
let H = { explain() {}, showCard() {} };
export function init(helpers) { H = { ...H, ...helpers }; }

// Short book labels. (No spoilers for later chapters.)
const ROLE = {
  hollis: 'The brave one', nell: 'The sneaky one', pim: 'The clever one',
  tobin: 'The loud one', juni: 'The fixer',
  goblin: 'Monster', goblinarcher: 'Monster', kobold: 'Monster', koboldtrapper: 'Monster', gnoll: 'Big boss',
  knight: 'Monster', bear: 'Monster', bird: 'Monster', beast: 'Big boss',
};
const BIO = {
  tobin: 'The youngest kid in the game, and the loudest. Always "it" when nobody else wants to be.',
  juni: 'Fixes anything with string and stubbornness. Always building a fort somewhere.',
};
const PEOPLE_WORD = { human: 'human', elf: 'elf', dwarf: 'dwarf' };

const SHELVES = [
  { id: 'kids', name: 'People', icon: 'star' },
  { id: 'monsters', name: 'Monsters', icon: 'flagr' },
  { id: 'gear', name: 'Gear', icon: 'hammer' },
  { id: 'places', name: 'Places', icon: 'boot' },
  { id: 'powers', name: 'Powers', icon: 'bulb' },
  { id: 'play', name: 'How to play', icon: 'die' },
  { id: 'clues', name: 'Clues', icon: 'target' },
];
let shelf = 'kids';

const GEAR_IDS = ['woodsword', 'stick', 'slingshot', 'broomstick', 'dagger', 'club', 'bucket', 'satchel'];
// Gearwick's real gear joins the shelf once you've seen the smith (Chapter 12).
const GEAR_IDS_B3 = ['longsword', 'longbow', 'roundshield', 'helmet', 'chainshirt'];
const GEAR_IDS_WREN = ['wrench', 'weldmask'];
// Brenna's shop gear joins once you're home from Grubjaw's camp (Chapter 6).
const GEAR_IDS_SHOP = ['steelsword', 'shortbow', 'buckler', 'ironcap', 'padded', 'cape'];
const PLACE_IDS = ['grass', 'bush', 'mud', 'log', 'tree', 'stream'];
// The clock tower's floors join the shelf once you've met a clockwork knight (Chapter 13).
const PLACE_IDS_B3 = ['floor', 'wall', 'crate', 'beltr'];
const PLAY = [
  { id: 'percentile', name: 'The 100 dice', icon: 'die' },
  { id: 'skill', name: 'Chance squares', icon: 'target', grid: true },
  { id: 'legendary', name: 'Legendary', tier: 'legendary' },
  { id: 'exceptional', name: 'Exceptional', tier: 'exceptional' },
  { id: 'success', name: 'It works', tier: 'success' },
  { id: 'fail', name: 'Miss', tier: 'fail' },
  { id: 'disaster', name: 'Oops!', tier: 'disaster' },
  { id: 'luck', name: 'Luck', icon: 'clover' },
  { id: 'hp', name: 'Hearts', icon: 'heart' },
  { id: 'move', name: 'Steps', icon: 'boot' },
  { id: 'xp', name: 'XP stars', icon: 'star' },
  { id: 'level', name: 'Level', icon: 'star' },
  { id: 'talent', name: 'Talents', icon: 'star' },
  { id: 'flags', name: 'Flags', icon: 'flagb' },
  { id: 'turns', name: 'Taking turns', icon: 'turns' },
  { id: 'cover', name: 'Cover', place: 'bush' },
  { id: 'range', name: 'Range', icon: 'target' },
  { id: 'area', name: 'Area', icon: 'burst' },
  { id: 'armor', name: 'Armor', icon: 'shield' },
  { id: 'initiative', name: 'Who goes first', icon: 'feather' },
  { id: 'damage', name: 'Damage dice', icon: 'hammer' },
  { id: 'retreat', name: 'Running away', icon: 'boot' },
  { id: 'knocked', name: 'Knocked down', icon: 'star' },
  { id: 'check', name: 'Skill checks', icon: 'target' },
  { id: 'helper', name: 'A friend helps', icon: 'star' },
  { id: 'spark', name: 'Spark', icon: 'burst' },
  { id: 'flip', name: 'Flip the dice', icon: 'die' },
  { id: 'coins', name: 'Coins', icon: 'coin' },
  { id: 'team', name: 'Picking a team', icon: 'turns' },
  { id: 'trailmap', name: 'The trail map', icon: 'boot' },
  { id: 'camp', name: 'Camping', icon: 'heart' },
  { id: 'pack', name: 'Pack hunters', icon: 'flagr' },
  { id: 'patch', name: 'Patch Up', icon: 'heart' },
  { id: 'potion', name: 'Healing potion', icon: 'heart' },
  { id: 'bag', name: 'Your bag', icon: 'book' },
  { id: 'talk', name: 'Talking', icon: 'bubble' },
  { id: 'flying', name: 'Flying', icon: 'feather' },
  { id: 'friendlevel', name: 'Friends grow too', icon: 'star' },
  { id: 'hometeam', name: 'Home Team jobs', icon: 'turns' },
  { id: 'scout', name: 'Scouting', icon: 'feather' },
  { id: 'stuck', name: 'Stuck and jammed', icon: 'shield' },
  { id: 'throwing', name: 'Throwing things', icon: 'hammer' },
  { id: 'fixing', name: 'Fixing', icon: 'hammer' },
  { id: 'snooze', name: 'Snooze', icon: 'bubble' },
  { id: 'cluebook', name: 'Clues', icon: 'target' },
  { id: 'keepsake', name: 'Keepsakes', icon: 'star' },
  { id: 'oops', name: 'Oops rolls', tier: 'disaster' },
];

// ---------- who you have met ----------
export function met() { const s = save.get(); return (s && s.flags && s.flags.met) || {}; }
export function isMet(id) { return !!met()[id]; }
// Chapters call meet('goblin') the first time a monster shows up.
export function meet(id) {
  const s = save.get(); if (!s) return false;
  s.flags = s.flags || {}; s.flags.met = s.flags.met || {};
  if (s.flags.met[id]) return false;
  s.flags.met[id] = true; save.write();
  return true;
}

// ---------- drawing ----------
function heroEntry() {
  const s = save.get();
  if (s && s.hero) {
    const h = s.hero;
    return { id: 'hero', name: h.name, role: 'That\'s you!', spec: P.spriteSpec(h),
      bio: `${h.name} the ${PEOPLE_WORD[h.people] || 'kid'}. Everyone in Millbrook knows you as the kid with the bucket helmet. You play heroes-and-monsters harder than anyone.` };
  }
  const c = CAST.find(k => k.id === 'hero');
  return { id: 'hero', name: 'You', role: 'Make your hero!', spec: c.spec,
    bio: 'This is where your hero lives. Make your hero on the Adventure tab and they will show up here.' };
}
function kidEntries() {
  const s = save.get(), joined = (s && s.party) || [];
  // Once friends level up (Book Three), each friend's page shows their level.
  const lvl = id => (s && s.friends && s.friends[id] ? ' · Level ' + F.level(s, id) : '');
  return [heroEntry(), ...CAST.filter(c => c.group === 'kids' && c.id !== 'hero').map(c => ({
    id: c.id, name: c.name, role: ROLE[c.id] + lvl(c.id), spec: c.spec, bio: BIO[c.id] || c.bio,
  })),
  // Monster friends show up once they join. Town grown-ups show up once you're back in Millbrook.
  ...CAST.filter(c => c.group === 'friends' && (joined.includes(c.id) || (['wren', 'dragon', 'turnip'].includes(c.id) && isMet(c.id)))).map(c => ({ id: c.id, name: c.name, role: c.role + lvl(c.id), spec: c.spec, bio: c.bio })),
  ...CAST.filter(c => c.group === 'town' && s && s.flags && (s.flags.ch5 || s.flags.ch2story) && (!['toymaker', 'peddler', 'gearsmith'].includes(c.id) || isMet(c.id))).map(c => ({ id: c.id, name: c.name, role: c.role, spec: c.spec, bio: c.bio }))];
}
function monsterEntries() {
  return CAST.filter(c => c.group === 'monsters').map(c => ({ id: c.id, name: c.name, role: ROLE[c.id], spec: c.spec, bio: c.bio, locked: !isMet(c.id) }));
}

function spriteCanvas(spec, cls = '') {
  const c = document.createElement('canvas'); c.width = 32; c.height = 40; c.className = 'bk-sprite ' + cls;
  c._spec = spec; return c;
}
function drawSprite(c, frame) {
  const x = c.getContext('2d'); x.clearRect(0, 0, 32, 40);
  S.draw(x, c._spec, 0, 0, 1, frame);
  if (c.classList.contains('shadow')) {
    x.globalCompositeOperation = 'source-in'; x.fillStyle = '#0c0806'; x.fillRect(0, 0, 32, 40);
    x.globalCompositeOperation = 'source-over';
  }
}
function silhouette(spec) { const c = spriteCanvas(spec, 'shadow big'); drawSprite(c, 0); return c; }

function tile({ pic, name, role, cls = '', onTap }) {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'bk-tile ' + cls;
  const top = document.createElement('div'); top.className = 'bk-pic';
  if (typeof pic === 'string') top.innerHTML = pic; else top.appendChild(pic);
  b.appendChild(top);
  b.insertAdjacentHTML('beforeend', `<span class="bk-name">${name}</span>${role ? `<span class="bk-role">${role}</span>` : ''}`);
  b.addEventListener('click', onTap);
  return b;
}
function chancePic() {
  const z = { legendaryMax: 5, exceptionalMax: 25, successMax: 50, disasterMin: 96 };
  let cells = '';
  for (let n = 1; n <= 100; n++) cells += `<i style="background:${I.TIER_COLOR[I.tierAt(n, z)]}"></i>`;
  return `<span class="bk-chance">${cells}</span>`;
}
function tierPic(t) { return `<span class="bk-tier" style="background:${I.TIER_COLOR[t]}"></span>`; }
function placePic(id) {
  const c = document.createElement('canvas'); c.width = 32; c.height = 32; c.className = 'bk-place';
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  for (let i = 0; i < 4; i++) x.drawImage(tileArt(id, i % 2, (i >> 1) + 1), (i % 2) * 16, (i >> 1) * 16);
  return c;
}
function gearPic(id) {
  const spec = { build: 'kid', people: 'human', skin: 'peach', hair: 'short', hairColor: 'brown', cloth: 'brown', layers: { body: 'tunic', [GEAR[id].slot]: id } };
  const c = spriteCanvas(spec); drawSprite(c, 0); c._still = true; return c;
}

// ---------- clues ----------
export function clueFound(id) { const s = save.get(); return !!(s && s.flags && s.flags.story && s.flags.story[id]); }
// Little 16x16 pixel pictures for the clue tiles.
const CLUE_ART = {
  mouse: [['#7a5a1a', 3, 8, 9, 5], ['#c49a3a', 4, 7, 7, 5], ['#c49a3a', 10, 9, 3, 3], ['#1a120c', 11, 10, 1, 1], ['#e8c860', 5, 5, 2, 2], ['#7a5a1a', 1, 11, 2, 1], ['#e0e0e0', 6, 4, 1, 3], ['#e0e0e0', 5, 3, 3, 1], ['#1a120c', 4, 13, 2, 1], ['#1a120c', 9, 13, 2, 1]],
  feather: [['#1a120c', 9, 2, 3, 3], ['#1a120c', 7, 4, 4, 3], ['#1a120c', 5, 6, 4, 3], ['#1a120c', 4, 8, 3, 3], ['#3a3a4a', 10, 3, 1, 1], ['#3a3a4a', 8, 5, 1, 1], ['#3a3a4a', 6, 7, 1, 1], ['#c8c8c8', 3, 11, 1, 1], ['#c8c8c8', 2, 12, 1, 2]],
  key: [['#c49a3a', 2, 5, 5, 5], ['#1a120c', 4, 7, 1, 1], ['#e8c860', 3, 4, 1, 1], ['#e8c860', 5, 4, 1, 1], ['#c49a3a', 7, 7, 7, 1], ['#c49a3a', 11, 8, 1, 2], ['#c49a3a', 13, 8, 1, 2]],
  note: [['#f3e6cc', 3, 2, 10, 12], ['#b8a070', 3, 13, 10, 1], ['#6b4a2a', 5, 4, 6, 1], ['#6b4a2a', 5, 6, 5, 1], ['#6b4a2a', 5, 8, 6, 1], ['#b8c2cc', 9, 10, 3, 3], ['#6a7480', 10, 11, 1, 1]],
  letter: [['#f3e6cc', 2, 4, 12, 9], ['#b8a070', 2, 4, 12, 1], ['#b8a070', 3, 5, 2, 1], ['#b8a070', 5, 6, 2, 1], ['#b8a070', 7, 7, 2, 1], ['#b8a070', 9, 6, 2, 1], ['#b8a070', 11, 5, 2, 1], ['#1a120c', 7, 9, 2, 3]],
  star: [['#ffd060', 7, 2, 2, 3], ['#ffd060', 3, 5, 10, 3], ['#ffd060', 5, 8, 6, 2], ['#ffd060', 4, 10, 3, 3], ['#ffd060', 9, 10, 3, 3], ['#fff4c0', 7, 5, 2, 3]],
  coin: [['#7a5a1a', 4, 3, 8, 10], ['#7a5a1a', 3, 5, 10, 6], ['#e8c860', 5, 4, 6, 8], ['#e8c860', 4, 6, 8, 4], ['#7a5a1a', 7, 6, 2, 4]],
  tower: [['#6a6058', 5, 4, 6, 11], ['#4e463e', 4, 3, 2, 2], ['#4e463e', 7, 3, 2, 2], ['#4e463e', 10, 3, 2, 2], ['#1a120c', 7, 11, 2, 4], ['#ffd060', 7, 6, 2, 2], ['#1a120c', 2, 2, 2, 1], ['#1a120c', 12, 1, 2, 1]],
  tree: [['#b8c2cc', 4, 2, 8, 8], ['#f4f8fc', 5, 3, 3, 2], ['#6a7480', 3, 5, 10, 3], ['#b8c2cc', 4, 5, 8, 4], ['#6b4226', 7, 10, 2, 5]],
  book: [['#6e2a2a', 3, 3, 10, 11], ['#f3e6cc', 4, 4, 8, 9], ['#6e2a2a', 7, 3, 1, 11], ['#6b4a2a', 5, 6, 2, 1], ['#6b4a2a', 9, 6, 2, 1], ['#6b4a2a', 5, 8, 2, 1], ['#6b4a2a', 9, 8, 2, 1]],
  ribbon: [['#3fa55a', 2, 6, 12, 3], ['#2a7a3e', 2, 9, 3, 3], ['#2a7a3e', 11, 9, 3, 3], ['#c8f0d0', 5, 7, 1, 1], ['#c8f0d0', 7, 7, 1, 1], ['#c8f0d0', 9, 7, 1, 1]],
  gear: [['#7a5a1a', 5, 3, 6, 10], ['#7a5a1a', 3, 5, 10, 6], ['#c49a3a', 5, 5, 6, 6], ['#c49a3a', 7, 2, 2, 12], ['#c49a3a', 2, 7, 12, 2], ['#1a120c', 7, 7, 2, 2]],
  door: [['#6b4226', 4, 3, 8, 12], ['#a8703a', 5, 4, 6, 10], ['#6b4226', 5, 2, 6, 1], ['#e8c860', 9, 9, 1, 1], ['#f3e6cc', 6, 6, 2, 2]],
  egg: [['#c8a050', 5, 3, 6, 11], ['#c8a050', 4, 5, 8, 7], ['#f0d080', 6, 4, 4, 9], ['#fff0b8', 6, 5, 2, 3]],
};
function cluePic(kind, found) {
  const c = document.createElement('canvas'); c.width = 16; c.height = 16; c.className = 'bk-clue' + (found ? '' : ' unfound');
  const x = c.getContext('2d');
  for (const [col, px, py, w, h] of CLUE_ART[kind] || CLUE_ART.note) { x.fillStyle = found ? col : '#0c0806'; x.fillRect(px, py, w, h); }
  return c;
}
function fillClues(box) {
  for (const book of [1, 2, 3]) {
    const list = CLUES.filter(c => c.book === book), got = list.filter(c => clueFound(c.id)).length;
    const head = document.createElement('div'); head.className = 'bk-clue-head';
    head.innerHTML = `<b>${BOOK_NAME[book]}</b><span>${got} of ${list.length} clues</span>`;
    box.appendChild(head);
    list.forEach(c => { const f = clueFound(c.id); box.appendChild(f
      ? tile({ pic: cluePic(c.pic, true), name: c.name, cls: 'clue', onTap: () => H.showCard({ title: c.name, body: c.text, extra: cluePic(c.pic, true) }) })
      : tile({ pic: cluePic(c.pic, false), name: '???', role: 'Not found yet', cls: 'clue locked', onTap: () => H.showCard({ title: '???', body: 'You have not found this clue yet. Try other paths and talk to everyone. You can play a chapter again to look for it.' }) })); });
  }
}

function glossTitle(id, fallback) { return (GLOSSARY[id] && GLOSSARY[id].title) || fallback; }

function fillShelf() {
  const box = $('bk-shelf'); box.innerHTML = '';
  const add = el => box.appendChild(el);
  if (shelf === 'kids') kidEntries().forEach(k => add(tile({
    pic: spriteCanvas(k.spec), name: k.name, role: k.role, cls: k.id === 'hero' ? 'me' : '',
    onTap: () => H.showCard({ title: k.name, body: k.bio, prereq: k.role, spec: k.spec }),
  })));
  if (shelf === 'monsters') monsterEntries().forEach(m => add(m.locked
    ? tile({ pic: spriteCanvas(m.spec, 'shadow'), name: '???', role: 'Not met yet', cls: 'locked',
      onTap: () => H.showCard({ title: '???', body: 'You have not met this monster yet. Keep adventuring, and when you meet it, its picture shows up here.', extra: silhouette(m.spec) }) })
    : tile({ pic: spriteCanvas(m.spec), name: m.name, role: m.role, cls: 'monster',
      onTap: () => H.showCard({ title: m.name, body: m.bio, prereq: m.role, spec: m.spec }) })));
  if (shelf === 'gear') {
    // The starter gear, the shop gear once you've seen that shop, and anything you have ever owned.
    const sv = save.get(), h = sv && sv.hero, fl = (sv && sv.flags) || {};
    const owned = h ? [...(h.bag || []), ...Object.values(h.gear || {})].filter(id => id && GEAR[id]) : [];
    const ids = [...new Set([...GEAR_IDS, ...(fl.ch5 ? GEAR_IDS_SHOP : []), ...(isMet('gearsmith') ? GEAR_IDS_B3 : []), ...(isMet('wren') ? GEAR_IDS_WREN : []), ...owned])];
    ids.forEach(id => add(tile({ pic: gearPic(id), name: GEAR[id].name, onTap: () => H.explain('gear_' + id) })));
  }
  if (shelf === 'clues') fillClues(box);
  if (shelf === 'places') [...PLACE_IDS, ...(isMet('knight') ? PLACE_IDS_B3 : [])].forEach(id => add(tile({ pic: placePic(id), name: glossTitle('terrain_' + id, id), onTap: () => H.explain('terrain_' + id) })));
  if (shelf === 'powers') {
    P.STATS.forEach(st => add(tile({ pic: I.icon(I.STAT_ICON[st], 56), name: P.STAT_NAME[st], role: I.STAT_WORD[st], cls: 'stat',
      onTap: () => H.explain('stat_' + st) })));
    Object.entries(P.SKILLS).forEach(([id, sk]) => add(tile({ pic: I.icon(I.STAT_ICON[sk.stat], 32), name: sk.name, role: 'Uses ' + P.STAT_NAME[sk.stat], cls: 'skill',
      onTap: () => H.explain('skill_' + id) })));
  }
  if (shelf === 'play') PLAY.forEach(p => add(tile({
    pic: p.tier ? tierPic(p.tier) : p.grid ? chancePic() : p.place ? placePic(p.place) : I.icon(p.icon, 56), name: p.name,
    onTap: () => H.explain(p.id, p.grid ? I.chanceGrid(50, I.TIER_COLOR.success) : undefined),
  })));
  draw(0);
}

function tabs() {
  const box = $('bk-tabs'); box.innerHTML = '';
  for (const s of SHELVES) {
    const b = document.createElement('button'); b.type = 'button'; b.id = 'bk-tab-' + s.id;
    b.className = 'bk-tab' + (s.id === shelf ? ' on' : '');
    b.innerHTML = I.icon(s.icon, 22) + `<span>${s.name}</span>`;
    b.addEventListener('click', () => { shelf = s.id; tabs(); fillShelf(); });
    box.appendChild(b);
  }
}

export function render() { tabs(); fillShelf(); }
export function draw(frame) {
  document.querySelectorAll('#bk-shelf canvas.bk-sprite').forEach((c, i) => { if (!c._still) drawSprite(c, (frame + i) % 2); });
}
export function setShelf(id) { shelf = id; render(); }

export default { init, render, draw, meet, met, isMet, setShelf, clueFound };
