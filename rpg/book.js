// The Big Book: a gallery of everything in the game, sorted onto shelves.
// Every tile opens a tap card. Monsters stay dark shapes until you meet them.
import S from './sprites.js';
import I from './icons.js';
import P from './party.js';
import save from './save.js';
import { CAST, GEAR } from './art.js';
import { GLOSSARY } from './glossary.js';
import { tileArt } from './board.js';

const $ = id => document.getElementById(id);
let H = { explain() {}, showCard() {} };
export function init(helpers) { H = { ...H, ...helpers }; }

// Short book labels. (No spoilers for later chapters.)
const ROLE = {
  hollis: 'The brave one', nell: 'The sneaky one', pim: 'The clever one',
  tobin: 'The loud one', juni: 'The fixer',
  goblin: 'Monster', goblinarcher: 'Monster', kobold: 'Monster', koboldtrapper: 'Monster', gnoll: 'Big boss',
};
const BIO = {
  tobin: 'The youngest kid in the game, and the loudest. Always "it" when nobody else wants to be.',
  juni: 'Fixes anything with string and stubbornness. Always building a fort somewhere.',
};
const PEOPLE_WORD = { human: 'human', elf: 'elf', dwarf: 'dwarf' };

const SHELVES = [
  { id: 'kids', name: 'Kids', icon: 'star' },
  { id: 'monsters', name: 'Monsters', icon: 'flagr' },
  { id: 'gear', name: 'Gear', icon: 'hammer' },
  { id: 'places', name: 'Places', icon: 'boot' },
  { id: 'powers', name: 'Powers', icon: 'bulb' },
  { id: 'play', name: 'How to play', icon: 'die' },
];
let shelf = 'kids';

const GEAR_IDS = ['woodsword', 'stick', 'slingshot', 'broomstick', 'dagger', 'club', 'bucket', 'satchel'];
const PLACE_IDS = ['grass', 'bush', 'mud', 'log', 'tree', 'stream'];
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
  { id: 'level', name: 'Level', icon: 'star' },
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
  return [heroEntry(), ...CAST.filter(c => c.group === 'kids' && c.id !== 'hero').map(c => ({
    id: c.id, name: c.name, role: ROLE[c.id], spec: c.spec, bio: BIO[c.id] || c.bio,
  }))];
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
  if (shelf === 'gear') GEAR_IDS.forEach(id => add(tile({ pic: gearPic(id), name: GEAR[id].name, onTap: () => H.explain('gear_' + id) })));
  if (shelf === 'places') PLACE_IDS.forEach(id => add(tile({ pic: placePic(id), name: glossTitle('terrain_' + id, id), onTap: () => H.explain('terrain_' + id) })));
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

export default { init, render, draw, meet, met, isMet, setShelf };
